import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import type { Product } from '../data/products';

interface SimilarityResult {
  product: Product;
  similarity: number;
}

class ImageSimilarityService {
  private model: mobilenet.MobileNet | null = null;
  private productEmbeddings: Map<string, number[]> = new Map();
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🔄 Loading MobileNet model...');
      
      // Load MobileNet model
      this.model = await mobilenet.load({
        version: 2,
        alpha: 1.0,
      });
      
      this.isInitialized = true;
      console.log('✅ MobileNet model loaded successfully!');
    } catch (error) {
      console.error('❌ Failed to load MobileNet model:', error);
      throw error;
    }
  }

  /**
   * Tìm sản phẩm tương tự với hình ảnh upload
   */
  async findSimilarProducts(
    imageFile: File,
    products: Product[],
    topK: number = 5
  ): Promise<SimilarityResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // 1. Extract embedding từ hình upload
      const uploadedEmbedding = await this.getImageEmbedding(imageFile);
      
      // 2. Tính similarity với từng sản phẩm
      const similarities: SimilarityResult[] = [];
      
      for (const product of products) {
        // Lấy embedding của sản phẩm (từ ảnh đầu tiên)
        let productEmbedding = this.productEmbeddings.get(product.id);
        
        if (!productEmbedding) {
          // Nếu chưa có, tải và extract embedding
          try {
            productEmbedding = await this.getImageEmbeddingFromUrl(product.images[0]);
            this.productEmbeddings.set(product.id, productEmbedding);
          } catch (error) {
            console.warn(`Failed to get embedding for product ${product.id}:`, error);
            continue;
          }
        }
        
        // Tính cosine similarity
        const similarity = this.cosineSimilarity(uploadedEmbedding, productEmbedding);
        
        similarities.push({
          product,
          similarity
        });
      }
      
      // 3. Sắp xếp theo độ tương đồng và lấy top K
      const topResults = similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);
      
      console.log('✅ Found similar products:', topResults.map(r => ({
        name: r.product.name,
        similarity: `${(r.similarity * 100).toFixed(1)}%`
      })));
      
      return topResults;
      
    } catch (error) {
      console.error('❌ Failed to find similar products:', error);
      throw error;
    }
  }

  /**
   * Extract embedding từ File
   */
  private async getImageEmbedding(imageFile: File): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = async (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = async () => {
        try {
          if (!this.model) {
            throw new Error('Model not loaded');
          }

          // Convert image to tensor
          const tensor = tf.browser.fromPixels(img);
          
          // Get embedding (before final classification layer)
          const embedding = this.model.infer(tensor, true) as tf.Tensor;
          
          // Convert to array
          const embeddingArray = await embedding.data();
          
          // Cleanup
          tensor.dispose();
          embedding.dispose();
          
          resolve(Array.from(embeddingArray));
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(imageFile);
    });
  }

  /**
   * Extract embedding từ URL
   */
  private async getImageEmbeddingFromUrl(imageUrl: string): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = async () => {
        try {
          if (!this.model) {
            throw new Error('Model not loaded');
          }

          // Convert image to tensor
          const tensor = tf.browser.fromPixels(img);
          
          // Get embedding
          const embedding = this.model.infer(tensor, true) as tf.Tensor;
          
          // Convert to array
          const embeddingArray = await embedding.data();
          
          // Cleanup
          tensor.dispose();
          embedding.dispose();
          
          resolve(Array.from(embeddingArray));
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error(`Failed to load image from ${imageUrl}`));
      img.src = imageUrl;
    });
  }

  /**
   * Tính cosine similarity giữa 2 vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }

  /**
   * Preload embeddings cho tất cả sản phẩm (optional - để tăng tốc)
   */
  async preloadProductEmbeddings(products: Product[]): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log(`🔄 Preloading embeddings for ${products.length} products...`);
    
    for (const product of products) {
      if (!this.productEmbeddings.has(product.id)) {
        try {
          const embedding = await this.getImageEmbeddingFromUrl(product.images[0]);
          this.productEmbeddings.set(product.id, embedding);
        } catch (error) {
          console.warn(`Failed to preload embedding for ${product.id}:`, error);
        }
      }
    }
    
    console.log(`✅ Preloaded ${this.productEmbeddings.size} product embeddings`);
  }

  isModelReady(): boolean {
    return this.isInitialized && this.model !== null;
  }
}

// Export singleton instance
export const imageSimilarityService = new ImageSimilarityService();
export type { SimilarityResult };
