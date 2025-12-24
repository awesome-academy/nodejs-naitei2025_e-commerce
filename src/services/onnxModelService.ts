import * as ort from 'onnxruntime-web';

interface ModelPrediction {
  product_id: string;
  confidence: number;
  similarity: number;
  category: string;
  subcategory?: string;
  features: string[];
  alternatives?: string[];
}

interface ModelLabel {
  class: number;
  label: string;
  product_id: string;
  category: string;
  subcategory?: string;
  features: string[];
  alternatives?: string[];
}

class ONNXModelService {
  private session: ort.InferenceSession | null = null;
  private labels: ModelLabel[] = [];
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Load model labels
      const labelsResponse = await fetch('/model-labels.json');
      this.labels = await labelsResponse.json();

      // Load ONNX model
      this.session = await ort.InferenceSession.create('/model (1).onnx', {
        executionProviders: ['wasm'],
      });

      this.isInitialized = true;
      console.log('ONNX Model initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ONNX model:', error);
      throw error;
    }
  }

  async predictImage(imageFile: File): Promise<ModelPrediction[]> {
    if (!this.isInitialized || !this.session) {
      await this.initialize();
    }

    try {
      // Preprocess image
      const imageData = await this.preprocessImage(imageFile);
      
      // Run inference
      const feeds = { input: new ort.Tensor('float32', imageData, [1, 1, 28, 28]) };
      const results = await this.session!.run(feeds);
      
      // Get output tensor
      const output = results.output.data as Float32Array;
      
      // Get top predictions
      const predictions = this.getTopPredictions(output, 3);
      
      return predictions;
    } catch (error) {
      console.error('Prediction failed:', error);
      throw error;
    }
  }

  private async preprocessImage(imageFile: File): Promise<Float32Array> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = 28;
        canvas.height = 28;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw and resize image
        ctx.drawImage(img, 0, 0, 28, 28);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, 28, 28);
        const pixels = imageData.data;

        // Convert to grayscale and normalize
        const float32Data = new Float32Array(28 * 28);
        for (let i = 0; i < 28 * 28; i++) {
          const offset = i * 4;
          // Convert RGB to grayscale
          const gray = (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 3;
          // Normalize to [0, 1]
          float32Data[i] = gray / 255.0;
        }

        resolve(float32Data);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(imageFile);
    });
  }

  private getTopPredictions(output: Float32Array, topK: number): ModelPrediction[] {
    // Apply softmax
    const exp = Array.from(output).map(x => Math.exp(x));
    const sumExp = exp.reduce((a, b) => a + b, 0);
    const softmax = exp.map(x => x / sumExp);

    // Get top K predictions
    const predictions = softmax
      .map((confidence, classIndex) => {
        const label = this.labels.find(l => l.class === classIndex);
        if (!label) return null;

        const prediction: ModelPrediction = {
          product_id: label.product_id,
          confidence: confidence,
          similarity: confidence * 0.95, // Slight adjustment for similarity score
          category: label.category,
          subcategory: label.subcategory,
          features: label.features,
          alternatives: label.alternatives
        };
        return prediction;
      })
      .filter((p): p is ModelPrediction => p !== null)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, topK);

    return predictions;
  }

  isModelReady(): boolean {
    return this.isInitialized;
  }
}

// Export singleton instance
export const onnxModelService = new ONNXModelService();
export type { ModelPrediction };
