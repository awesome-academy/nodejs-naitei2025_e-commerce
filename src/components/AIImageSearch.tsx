import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, X, Search, Loader, Sparkles, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { products } from '../data/products';
import { defaultColabService } from '../services/colabService';
import ColabConnection from './ColabConnection';

interface AIImageSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  product: any;
  confidence: number;
  similarity: number;
}

const AIImageSearch: React.FC<AIImageSearchProps> = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isColabConnected, setIsColabConnected] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Phân tích hình ảnh bằng AI từ Colab
  const analyzeImageWithColab = useCallback(async (imageFile: File): Promise<SearchResult[]> => {
    if (!isColabConnected) {
      throw new Error('Chưa kết nối với Google Colab AI');
    }

    const response = await defaultColabService.analyzeImage(imageFile);
    
    if (!response.success) {
      throw new Error(response.error || 'Lỗi phân tích hình ảnh');
    }

    // Chuyển đổi kết quả từ Colab thành format của website
    const colabResults = response.data.predictions || [];
    const searchResults: SearchResult[] = [];

    for (const prediction of colabResults) {
      // Tìm sản phẩm tương ứng trong database
      const product = products.find(p => 
        p.id === prediction.product_id || 
        p.category === prediction.category ||
        p.subcategory.toLowerCase().includes(prediction.category?.toLowerCase() || '')
      );

      if (product) {
        searchResults.push({
          product,
          confidence: prediction.confidence,
          similarity: prediction.similarity
        });
      }
    }

    // Nếu không tìm thấy sản phẩm chính xác, tìm sản phẩm tương tự
    if (searchResults.length === 0 && colabResults.length > 0) {
      const topPrediction = colabResults[0];
      const similarProducts = products.filter(p => 
        p.category === topPrediction.category ||
        topPrediction.features?.some((feature: string) => 
          p.features.some(pf => pf.toLowerCase().includes(feature.toLowerCase()))
        )
      ).slice(0, 4);

      similarProducts.forEach((product, index) => {
        searchResults.push({
          product,
          confidence: Math.max(0.5, topPrediction.confidence - (index * 0.1)),
          similarity: Math.max(0.4, topPrediction.similarity - (index * 0.1))
        });
      });
    }

    return searchResults.sort((a, b) => b.confidence - a.confidence);
  }, [isColabConnected]);

  // Fallback: Mock AI analysis nếu không kết nối Colab
  const mockAnalyzeImage = useCallback(async (): Promise<SearchResult[]> => {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults: SearchResult[] = [
      {
        product: products.find(p => p.id === 'men-tshirt-1') || products[0],
        confidence: 0.85,
        similarity: 0.82
      },
      {
        product: products.find(p => p.id === 'men-tshirt-2') || products[1],
        confidence: 0.78,
        similarity: 0.75
      },
      {
        product: products.find(p => p.id === 'women-tshirt-1') || products[2],
        confidence: 0.72,
        similarity: 0.68
      }
    ];

    return mockResults;
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setAnalysisError('Vui lòng chọn file hình ảnh');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageUrl = e.target?.result as string;
      setSelectedImage(imageUrl);
      setIsAnalyzing(true);
      setSearchResults([]);
      setAnalysisError('');

      try {
        let results: SearchResult[];
        
        if (isColabConnected) {
          results = await analyzeImageWithColab(file);
        } else {
          results = await mockAnalyzeImage();
        }
        
        setSearchResults(results);
      } catch (error) {
        console.error('Error analyzing image:', error);
        setAnalysisError(error instanceof Error ? error.message : 'Có lỗi xảy ra khi phân tích hình ảnh');
        
        // Fallback to mock results if Colab fails
        if (isColabConnected) {
          try {
            const fallbackResults = await mockAnalyzeImage();
            setSearchResults(fallbackResults);
            setAnalysisError('Sử dụng AI demo do lỗi kết nối Colab');
          } catch (fallbackError) {
            console.error('Fallback analysis failed:', fallbackError);
          }
        }
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }, [isColabConnected, analyzeImageWithColab, mockAnalyzeImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-blue-600 bg-blue-100';
    if (confidence >= 0.4) return 'text-orange-600 bg-orange-100';
    return 'text-gray-600 bg-gray-100';
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  const resetSearch = () => {
    setSelectedImage(null);
    setSearchResults([]);
    setIsAnalyzing(false);
    setAnalysisError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles size={24} className="text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tìm kiếm bằng AI</h2>
              <p className="text-sm text-gray-600">
                {isColabConnected ? 'Sử dụng AI từ Google Colab' : 'Sử dụng AI demo'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colab Connection Panel */}
            <div className="lg:col-span-1">
              <ColabConnection onConnectionChange={setIsColabConnected} />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              {!selectedImage ? (
                /* Upload Area */
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                    dragActive 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="p-4 bg-purple-100 rounded-full">
                        <Upload size={48} className="text-purple-600" />
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Tải lên hình ảnh sản phẩm
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {isColabConnected 
                          ? 'AI sẽ phân tích hình ảnh bằng model đã train trên Colab'
                          : 'Sử dụng AI demo để tìm sản phẩm tương tự'
                        }
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Upload size={20} />
                        <span>Chọn từ máy tính</span>
                      </button>
                      
                      <button
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center justify-center space-x-2 px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        <Camera size={20} />
                        <span>Chụp ảnh</span>
                      </button>
                    </div>

                    <div className="text-sm text-gray-500">
                      Hỗ trợ: JPG, PNG, GIF (tối đa 10MB)
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                /* Results Area */
                <div className="space-y-6">
                  {/* Uploaded Image */}
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-1/3">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-gray-900">Hình ảnh đã tải lên</h3>
                          <button
                            onClick={resetSearch}
                            className="text-sm text-purple-600 hover:text-purple-700"
                          >
                            Tải ảnh khác
                          </button>
                        </div>
                        <img
                          src={selectedImage}
                          alt="Uploaded"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Analysis Status */}
                    <div className="lg:w-2/3">
                      {isAnalyzing ? (
                        <div className="bg-purple-50 rounded-lg p-6 text-center">
                          <div className="flex justify-center mb-4">
                            <Loader size={48} className="text-purple-600 animate-spin" />
                          </div>
                          <h3 className="text-lg font-semibold text-purple-900 mb-2">
                            {isColabConnected ? 'AI Colab đang phân tích...' : 'AI đang phân tích...'}
                          </h3>
                          <p className="text-purple-700">
                            Vui lòng đợi trong giây lát để tìm sản phẩm tương tự
                          </p>
                          <div className="mt-4 bg-purple-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                          </div>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div>
                          <div className="flex items-center space-x-2 mb-4">
                            <Search size={20} className="text-green-600" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              Tìm thấy {searchResults.length} sản phẩm tương tự
                            </h3>
                          </div>
                          <p className="text-gray-600 mb-4">
                            {isColabConnected 
                              ? 'Kết quả từ AI model đã train trên Google Colab'
                              : 'Kết quả từ AI demo - kết nối Colab để có độ chính xác cao hơn'
                            }
                          </p>
                          {analysisError && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
                              <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
                              <p className="text-sm text-yellow-800">{analysisError}</p>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && !isAnalyzing && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {searchResults.map((result, index) => (
                        <div
                          key={result.product.id}
                          className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleProductClick(result.product.id)}
                        >
                          <div className="flex space-x-4">
                            <img
                              src={result.product.images[0]}
                              alt={result.product.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-gray-900 line-clamp-2">
                                  {result.product.name}
                                </h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(result.confidence)}`}>
                                  {Math.round(result.confidence * 100)}%
                                </span>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">
                                {result.product.subcategory} • {result.product.category === 'men' ? 'Nam' : result.product.category === 'women' ? 'Nữ' : 'Trẻ em'}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-red-600">
                                    {formatPrice(result.product.price)}
                                  </span>
                                  {result.product.originalPrice && (
                                    <span className="text-sm text-gray-500 line-through">
                                      {formatPrice(result.product.originalPrice)}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Độ tương tự: {Math.round(result.similarity * 100)}%
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI Info Note */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Sparkles size={20} className="text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">
                  Tích hợp Google Colab AI
                </h4>
                <p className="text-sm text-blue-800">
                  {isColabConnected 
                    ? 'Đang sử dụng AI model đã train trên Google Colab. Model có thể nhận diện chính xác màu sắc, kiểu dáng, chất liệu và đề xuất sản phẩm tương tự.'
                    : 'Kết nối với Google Colab để sử dụng AI model đã train với độ chính xác cao. Hiện tại đang sử dụng AI demo với kết quả mẫu.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIImageSearch;