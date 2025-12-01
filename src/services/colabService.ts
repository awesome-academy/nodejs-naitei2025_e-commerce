interface ColabConfig {
  colabUrl: string;
  apiKey?: string;
  modelEndpoint: string;
}

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
  confidence?: number;
}

interface ImageAnalysisResult {
  predictions: Array<{
    product_id: string;
    confidence: number;
    similarity: number;
    category: string;
    features: string[];
  }>;
  processing_time: number;
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
  async analyzeImage(imageFile: File): Promise<AIResponse> {
    if (!this.isConnected) {
      const connected = await this.checkConnection();
      if (!connected) {
        return {
          success: false,
          error: 'Không thể kết nối với Google Colab. Vui lòng kiểm tra lại.'
        };
      }
    }

    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('model_type', 'fashion_recognition');
      formData.append('return_features', 'true');

      const response = await fetch(`${this.config.colabUrl}${this.config.modelEndpoint}`, {
        method: 'POST',
        headers: {
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ImageAnalysisResult = await response.json();
      
      return {
        success: true,
        data: result,
        confidence: result.predictions[0]?.confidence || 0
      };
    } catch (error) {
      console.error('Image analysis failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lỗi không xác định'
      };
    }
  }

  // Gửi text để phân tích
  async analyzeText(text: string): Promise<AIResponse> {
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
  async getModelInfo(): Promise<AIResponse> {
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
const defaultColabService = new ColabService({
  colabUrl: import.meta.env.VITE_COLAB_URL || 'https://your-colab-ngrok-url.ngrok.io',
  apiKey: import.meta.env.VITE_COLAB_API_KEY,
  modelEndpoint: '/predict'
});

export { ColabService, defaultColabService };
export type { ColabConfig, AIResponse, ImageAnalysisResult };