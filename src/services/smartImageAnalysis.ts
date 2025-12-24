interface ImageFeatures {
  dominantColor: { r: number; g: number; b: number };
  brightness: number;
  colorfulness: number;
  aspectRatio: number;
  isLightBackground: boolean;
}

interface AnalysisResult {
  predictedCategory: 'shirt' | 'tshirt' | 'jean' | 'dress' | 'jacket' | 'shoe' | 'bag' | 'accessory';
  confidence: number;
  features: ImageFeatures;
}

export class SmartImageAnalyzer {
  async analyzeImage(imageFile: File): Promise<AnalysisResult> {
    const features = await this.extractFeatures(imageFile);
    const category = this.predictCategory(features);
    
    return {
      predictedCategory: category.type,
      confidence: category.confidence,
      features
    };
  }

  private async extractFeatures(imageFile: File): Promise<ImageFeatures> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Resize for analysis
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Calculate features
        let totalR = 0, totalG = 0, totalB = 0;
        let totalBrightness = 0;
        let colorVariance = 0;
        
        const pixelCount = pixels.length / 4;
        
        for (let i = 0; i < pixels.length; i += 4) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          
          totalR += r;
          totalG += g;
          totalB += b;
          
          const brightness = (r + g + b) / 3;
          totalBrightness += brightness;
          
          // Color variance (how colorful vs grayscale)
          const mean = brightness;
          colorVariance += Math.abs(r - mean) + Math.abs(g - mean) + Math.abs(b - mean);
        }
        
        const avgR = totalR / pixelCount;
        const avgG = totalG / pixelCount;
        const avgB = totalB / pixelCount;
        const avgBrightness = totalBrightness / pixelCount;
        const colorfulness = colorVariance / (pixelCount * 3);
        
        resolve({
          dominantColor: { r: avgR, g: avgG, b: avgB },
          brightness: avgBrightness / 255,
          colorfulness: Math.min(1, colorfulness / 100),
          aspectRatio: img.width / img.height,
          isLightBackground: avgBrightness > 200
        });
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(imageFile);
    });
  }

  private predictCategory(features: ImageFeatures): { type: AnalysisResult['predictedCategory']; confidence: number } {
    const { dominantColor, brightness, colorfulness, aspectRatio, isLightBackground } = features;
    
    // Heuristics based on image characteristics
    
    // Check if it's clothing (upper body) vs pants vs accessories
    const isGrayish = Math.abs(dominantColor.r - dominantColor.g) < 30 && 
                      Math.abs(dominantColor.g - dominantColor.b) < 30;
    const isBlueish = dominantColor.b > Math.max(dominantColor.r, dominantColor.g) + 15;
    const isVeryLight = brightness > 0.7 && isLightBackground;
    const isDark = brightness < 0.4;
    
    // SHIRT (Áo Sơ Mi) - Highest priority for formal shirts
    // White/light shirts, formal, structured appearance
    if (isVeryLight && aspectRatio > 0.7 && aspectRatio < 1.4 && colorfulness < 0.3) {
      return { type: 'shirt', confidence: 0.90 };
    }
    
    // Gray shirts (like the current image)
    if (isGrayish && brightness > 0.45 && brightness < 0.75 && aspectRatio > 0.8 && aspectRatio < 1.3) {
      return { type: 'shirt', confidence: 0.88 };
    }
    
    // Dark formal shirts
    if (isDark && isGrayish && aspectRatio > 0.8 && aspectRatio < 1.2 && colorfulness < 0.4) {
      return { type: 'shirt', confidence: 0.85 };
    }
    
    // Dress/Skirt detection: Usually tall aspect ratio, colorful
    if (aspectRatio < 0.7 && colorfulness > 0.3) {
      return { type: 'dress', confidence: 0.82 };
    }
    
    // T-SHIRT - More casual, simpler
    if (aspectRatio > 0.8 && aspectRatio < 1.3 && !isVeryLight) {
      if (colorfulness > 0.4 || !isGrayish) {
        return { type: 'tshirt', confidence: 0.80 };
      }
    }
    
    // Jacket detection: Darker colors, structured
    if (isDark && aspectRatio > 0.9 && aspectRatio < 1.3) {
      return { type: 'jacket', confidence: 0.78 };
    }
    
    // Jean/Pants detection: Blue-ish or very dark, horizontal or vertical
    if (isBlueish) {
      return { type: 'jean', confidence: 0.85 };
    }
    
    if (isDark && aspectRatio < 1.2 && !isGrayish) {
      return { type: 'jean', confidence: 0.80 };
    }
    
    // Shoes detection: Usually darker, wide/compact shape
    if (aspectRatio > 1.4 && brightness < 0.55) {
      return { type: 'shoe', confidence: 0.82 };
    }
    
    // Bag detection: Various colors, square-ish
    if (aspectRatio > 1.1 && aspectRatio < 1.6 && colorfulness > 0.3 && brightness > 0.4) {
      return { type: 'bag', confidence: 0.76 };
    }
    
    // Default: If nothing else matches and it's light/grayish upper body -> probably a shirt
    if (aspectRatio > 0.8 && aspectRatio < 1.4 && (isVeryLight || isGrayish)) {
      return { type: 'shirt', confidence: 0.75 };
    }
    
    // Final fallback: T-shirt (most common casual item)
    return { type: 'tshirt', confidence: 0.70 };
  }
}

export const smartImageAnalyzer = new SmartImageAnalyzer();
