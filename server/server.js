import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import ort from 'onnxruntime-node';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { performance } from 'perf_hooks';
import createVnpayRouter from './vnpay.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_MODEL_PATH = path.resolve(__dirname, '../trained_models/resnet18_fashion_mnist_rgb.onnx');
const MODEL_PATH = process.env.MODEL_PATH
  ? path.resolve(__dirname, process.env.MODEL_PATH)
  : DEFAULT_MODEL_PATH;
const LABELS_PATH = process.env.LABELS_PATH
  ? path.resolve(__dirname, process.env.LABELS_PATH)
  : path.resolve(__dirname, '../model-labels.json');
const PORT = Number(process.env.PORT ?? 4000);
const TOP_K = Math.max(1, Number(process.env.TOP_K ?? 5));
const MAX_IMAGE_MB = Number(process.env.MAX_IMAGE_MB ?? 5);

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean)
  : undefined;

const corsOptions = allowedOrigins?.length
  ? { origin: allowedOrigins, credentials: true }
  : { origin: true };

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_MB * 1024 * 1024
  }
});

const app = express();
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use('/payments/vnpay', createVnpayRouter());

let session;
let inputName;
let outputName;
let inputShape;
let outputShape;
let layoutDetails;
let labels = [];
const serverBootTime = Date.now();

const resolveDimValue = (value, fallback) => {
  if (typeof value === 'number' && value > 0) {
    return value;
  }
  if (typeof value === 'string' && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return fallback;
};

const inferLayoutDetails = (dimensions = []) => {
  const defaultDims = { layout: 'NCHW', width: 224, height: 224, channels: 3 };
  if (!Array.isArray(dimensions) || dimensions.length < 3) {
    return defaultDims;
  }

  const isChannelsFirst =
    typeof dimensions[1] === 'number'
      ? dimensions[1] === 1 || dimensions[1] === 3
      : dimensions.length === 4;

  const channelIndex = isChannelsFirst ? 1 : dimensions.length - 1;
  const heightIndex = isChannelsFirst ? 2 : 1;
  const widthIndex = isChannelsFirst ? 3 : 2;

  return {
    layout: isChannelsFirst ? 'NCHW' : 'NHWC',
    channels: resolveDimValue(dimensions[channelIndex], 3),
    height: resolveDimValue(dimensions[heightIndex], 224),
    width: resolveDimValue(dimensions[widthIndex], 224)
  };
};

const softmax = (values) => {
  if (!values.length) {
    return values;
  }
  const max = Math.max(...values);
  const expValues = values.map((value) => Math.exp(value - max));
  const sum = expValues.reduce((acc, value) => acc + value, 0) || 1;
  return expValues.map((value) => value / sum);
};

const loadLabels = () => {
  if (fs.existsSync(LABELS_PATH)) {
    try {
      labels = JSON.parse(fs.readFileSync(LABELS_PATH, 'utf-8'));
      if (!Array.isArray(labels)) {
        labels = [];
      }
    } catch (error) {
      console.warn('Unable to load labels file:', error);
      labels = [];
    }
  }
};

const initializeModel = async () => {
  if (!fs.existsSync(MODEL_PATH)) {
    console.warn(`Model file not found at ${MODEL_PATH}, AI endpoints will be disabled`);
    return false;
  }

  session = await ort.InferenceSession.create(MODEL_PATH, {
    executionProviders: ['cpu']
  });

  inputName = session.inputNames[0];
  outputName = session.outputNames[0];

  const inputMeta = Array.isArray(session.inputMetadata)
    ? session.inputMetadata.find((meta) => meta?.name === inputName)
    : session.inputMetadata?.[inputName];
  const outputMeta = Array.isArray(session.outputMetadata)
    ? session.outputMetadata.find((meta) => meta?.name === outputName)
    : session.outputMetadata?.[outputName];

  inputShape = inputMeta?.shape ?? inputMeta?.dimensions ?? [];
  outputShape = outputMeta?.shape ?? outputMeta?.dimensions ?? [];
  layoutDetails = inferLayoutDetails(inputShape);

  loadLabels();
  console.log('ONNX model loaded', {
    modelPath: MODEL_PATH,
    inputName,
    inputShape,
    outputName,
    outputShape,
    layoutDetails
  });
  return true;
};

const modelReady = initializeModel().catch((error) => {
  console.error('Failed to initialize ONNX model:', error);
  return false;
});

const preprocessImageToTensor = async (buffer) => {
  const details = layoutDetails ?? inferLayoutDetails(inputShape);
  const { layout, width, height, channels } = details;

  const normalizedWidth = width || 224;
  const normalizedHeight = height || 224;
  const normalizedChannels = channels || 3;

  const processed = await sharp(buffer)
    .rotate() // auto orient
    .resize(normalizedWidth, normalizedHeight, { fit: sharp.fit.cover })
    .removeAlpha()
    .toColourspace('srgb')
    .raw()
    .toBuffer();

  const pixelCount = normalizedWidth * normalizedHeight;
  const tensorSize = pixelCount * normalizedChannels;
  const data = new Float32Array(tensorSize);

  if (layout === 'NCHW') {
    for (let i = 0; i < pixelCount; i += 1) {
      const pixelIndex = i * 3;
      const r = processed[pixelIndex] / 255;
      const g = processed[pixelIndex + 1] / 255;
      const b = processed[pixelIndex + 2] / 255;
      data[i] = r;
      data[pixelCount + i] = g;
      data[2 * pixelCount + i] = b;
    }
  } else {
    for (let i = 0; i < pixelCount; i += 1) {
      const pixelIndex = i * 3;
      const offset = i * normalizedChannels;
      data[offset] = processed[pixelIndex] / 255;
      data[offset + 1] = processed[pixelIndex + 1] / 255;
      data[offset + 2] = processed[pixelIndex + 2] / 255;
    }
  }

  const tensorDims =
    layout === 'NCHW'
      ? [1, normalizedChannels, normalizedHeight, normalizedWidth]
      : [1, normalizedHeight, normalizedWidth, normalizedChannels];

  return new ort.Tensor('float32', data, tensorDims);
};

const formatPredictions = (probabilities) => {
  return probabilities
    .map((confidence, index) => {
      const labelInfo = labels[index] ?? {};
      return {
        product_id: labelInfo.product_id ?? labelInfo.id ?? `class-${index}`,
        label: labelInfo.label ?? labelInfo.name ?? `Class ${index + 1}`,
        confidence,
        similarity: confidence,
        category: labelInfo.category ?? 'general',
        features: labelInfo.features ?? []
      };
    })
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, TOP_K);
};

app.get('/health', async (_req, res) => {
  const ready = !!session;
  res.json({
    status: ready ? 'healthy' : 'loading',
    ready,
    uptime_ms: Date.now() - serverBootTime,
    model_path: MODEL_PATH
  });
});

app.get('/model-info', async (_req, res) => {
  await modelReady;

  if (!session) {
    return res.status(503).json({
      success: false,
      error: 'Model not loaded',
      model_path: MODEL_PATH
    });
  }

  res.json({
    model_path: MODEL_PATH,
    input_name: inputName,
    input_shape: inputShape,
    output_name: outputName,
    output_shape: outputShape,
    layout: layoutDetails,
    label_count: labels.length,
    top_k: TOP_K
  });
});

app.post('/predict', upload.single('image'), async (req, res) => {
  const timerStart = performance.now();

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Missing image file (expected field name "image")'
    });
  }

  try {
    await modelReady;
    if (!session) {
      return res.status(503).json({
        success: false,
        error: 'AI model not available on this server'
      });
    }

    const tensor = await preprocessImageToTensor(req.file.buffer);
    const inferenceResult = await session.run({ [inputName]: tensor });
    const outputTensor = inferenceResult[outputName];

    const rawOutput = Array.from(outputTensor.data ?? []);
    const probabilities = softmax(rawOutput);
    const predictions = formatPredictions(probabilities);

    const processingTimeMs = Number((performance.now() - timerStart).toFixed(2));

    return res.json({
      success: true,
      predictions,
      raw_output: rawOutput,
      processing_time: Number((processingTimeMs / 1000).toFixed(4)),
      processing_time_ms: processingTimeMs
    });
  } catch (error) {
    console.error('Prediction failed:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Inference error'
    });
  }
});

app.post('/analyze-features', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Missing image file'
      });
    }

    // Analyze image properties using sharp
    const image = sharp(req.file.buffer);
    const metadata = await image.metadata();
    const stats = await image.stats();

    // Extract color information
    const dominantColors = stats.channels.map((channel, idx) => {
      const colorName = ['red', 'green', 'blue'][idx];
      return {
        channel: colorName,
        mean: Math.round(channel.mean),
        min: channel.min,
        max: channel.max
      };
    });

    // Determine dominant color
    const [r, g, b] = dominantColors.map(c => c.mean);
    let colorDescription = '';
    if (r > g && r > b) colorDescription = 'đỏ';
    else if (g > r && g > b) colorDescription = 'xanh lá';
    else if (b > r && b > g) colorDescription = 'xanh dương';
    else if (r > 200 && g > 200 && b > 200) colorDescription = 'trắng';
    else if (r < 50 && g < 50 && b < 50) colorDescription = 'đen';
    else colorDescription = 'nhiều màu';

    // Detect patterns based on variance
    const variance = stats.channels.map(c => 
      Math.sqrt(c.mean * (1 - c.mean / 255))
    );
    const avgVariance = variance.reduce((a, b) => a + b, 0) / variance.length;
    
    const hasPattern = avgVariance > 50;
    const features = {
      colors: [colorDescription],
      hasPattern,
      brightness: (r + g + b) / 3 > 128 ? 'sáng' : 'tối',
      dimensions: {
        width: metadata.width,
        height: metadata.height
      }
    };

    return res.json({
      success: true,
      features,
      metadata: {
        format: metadata.format,
        space: metadata.space,
        channels: metadata.channels
      }
    });
  } catch (error) {
    console.error('Feature analysis failed:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Analysis error'
    });
  }
});

app.post('/analyze-text', (req, res) => {
  const { text = '' } = req.body ?? {};
  const keywords = String(text)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  res.json({
    success: true,
    keywords,
    suggestions: keywords.slice(0, 3).map((keyword) => `${keyword}_suggestion`)
  });
});

app.use((err, _req, res, _next) => {
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: `Ảnh vượt quá giới hạn ${MAX_IMAGE_MB}MB`
    });
  }

  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`AI detection server running on http://localhost:${PORT}`);
});
