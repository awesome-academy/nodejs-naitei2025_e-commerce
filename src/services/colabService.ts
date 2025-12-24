import { getLabelInfo, normalizeAiLabel } from '../utils/aiLabelMapping';

interface ColabConfig {
  colabUrl: string;
  apiKey?: string;
  modelEndpoint: string;
}

interface AIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
}

interface RankedPrediction {
  label: string;
  rawLabel: string;
  normalizedLabel: string;
  confidence: number;
  category?: string;
  subcategory?: string;
  demoProductIds?: string[];
}

interface ImageAnalysisResult {
  predictions: RankedPrediction[];
  processing_time?: number;
}

class ColabService {
  private config: ColabConfig;
  private isConnected: boolean = false;

  constructor(config: ColabConfig) {
    this.config = config;
  }

  // Kiểm tra kết nối với Colab
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.colabUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      this.isConnected = response.ok;
      return this.isConnected;
    } catch (error) {
      console.error('Colab connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Gửi hình ảnh để phân tích
  async analyzeImage(imageFile: File): Promise<AIResponse<ImageAnalysisResult>> {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch(`${this.config.colabUrl}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data?.error) {
        throw new Error(typeof data.error === 'string' ? data.error : 'AI server error');
      }

      const rawPredictions = Array.isArray(data?.predictions) ? data.predictions : [];
      const fallbackPredictions = data?.top1 ? [data.top1] : [];
      const predictionSource = (rawPredictions.length > 0 ? rawPredictions : fallbackPredictions) as Array<{
        class_name?: string;
        label?: string;
        confidence?: number;
      }>;

      if (predictionSource.length === 0) {
        throw new Error('AI server did not return any predictions');
      }

      const rankedPredictions: RankedPrediction[] = predictionSource.map(
        (
          prediction: { class_name?: string; label?: string; confidence?: number },
          index: number
        ) => {
          const rawLabel =
            prediction?.class_name ??
            prediction?.label ??
            `label-${index + 1}`;
          const normalizedLabel = normalizeAiLabel(rawLabel) || rawLabel;
          const labelInfo = getLabelInfo(rawLabel);
          const confidence =
            typeof prediction?.confidence === 'number'
              ? prediction.confidence
              : 0;

          return {
            label: labelInfo?.displayName ?? rawLabel,
            rawLabel,
            normalizedLabel,
            confidence,
            category: labelInfo?.category,
            subcategory: labelInfo?.subcategory,
            demoProductIds: labelInfo?.demoProductIds
          };
        }
      );

      return {
        success: true,
        data: {
          predictions: rankedPredictions,
          processing_time: typeof data?.processing_time === 'number'
            ? data.processing_time
            : undefined
        }
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi phân tích ảnh'
      };
    }
  }

  // Phân tích features của ảnh (màu sắc, pattern, etc.)
  async analyzeImageFeatures(imageFile: File): Promise<AIResponse<{
    features: {
      colors: string[];
      hasPattern: boolean;
      brightness: string;
      dimensions: { width: number; height: number };
    };
    metadata: {
      format: string;
      space: string;
      channels: number;
    };
  }>> {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${this.config.colabUrl}/analyze-features`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        data: data
      };
    } catch (error) {
      console.error('Error analyzing image features:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi phân tích features'
      };
    }
  }

  // Gửi text để phân tích
  async analyzeText(text: string): Promise<AIResponse<Record<string, unknown>>> {
    try {
      const response = await fetch(`${this.config.colabUrl}/analyze-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify({
          text: text,
          task: 'product_search',
          language: 'vi'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Text analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi phân tích text'
      };
    }
  }

  // Lấy thông tin model
  async getModelInfo(): Promise<AIResponse<Record<string, unknown>>> {
    try {
      const response = await fetch(`${this.config.colabUrl}/model-info`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Get model info failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi lấy thông tin model'
      };
    }
  }

  // Cập nhật cấu hình
  updateConfig(newConfig: Partial<ColabConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.isConnected = false; // Reset connection status
  }

  // Lấy trạng thái kết nối
  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Tạo instance mặc định
const resolveDefaultUrl = () => {
  return (
    import.meta.env.VITE_AI_API_URL ||
    import.meta.env.VITE_COLAB_URL ||
    'http://127.0.0.1:8000'
  );
};

const defaultColabService = new ColabService({
  colabUrl: resolveDefaultUrl(),
  apiKey: import.meta.env.VITE_COLAB_API_KEY,
  modelEndpoint: '/predict'
});

export { ColabService, defaultColabService };
export type { ColabConfig, AIResponse, ImageAnalysisResult };
