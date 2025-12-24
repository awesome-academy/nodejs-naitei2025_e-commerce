import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Camera,
  Upload,
  X,
  Search,
  Loader,
  Sparkles,
  AlertTriangle,
  BadgeCheck,
  Cpu,
  Tag,
  Clock,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { products, type Product } from '../data/products';
import { defaultColabService, type ImageAnalysisResult } from '../services/colabService';
import { getProducts } from '../services/productService';
import { pickProductsForLabel, normalizeAiLabel } from '../utils/aiLabelMapping';

const humanizeLabel = (value?: string | null) => {
  if (!value) return 'Không xác định';
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/(^|\s)\S/g, (char) => char.toUpperCase());
};

interface AIImageSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  product: Product;
  confidence: number;
  similarity: number;
}

type AnalysisSource = 'ai' | 'demo';

interface AnalysisInsight {
  source: AnalysisSource;
  labelDisplay?: string;
  rawLabel?: string;
  category?: string;
  subcategory?: string;
  confidence?: number;
  processingTime?: number;
  features?: string[];
  notes?: string;
  predictions?: Array<{
    label: string;
    rawLabel?: string;
    confidence: number;
  }>;
}

const AIImageSearch: React.FC<AIImageSearchProps> = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [analysisError, setAnalysisError] = useState<string>('');
  const [catalog, setCatalog] = useState<Product[]>(products);
  const [analysisInsight, setAnalysisInsight] = useState<AnalysisInsight | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const mergeCatalogs = (baseCatalog: Product[], remoteCatalog?: Product[]) => {
    const map = new Map<string, Product>();
    baseCatalog.forEach((item) => map.set(item.id, item));
    remoteCatalog?.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const remoteProducts = await getProducts();
        if (isMounted && remoteProducts && remoteProducts.length > 0) {
          setCatalog(mergeCatalogs(products, remoteProducts));
        }
      } catch (error) {
        console.error('Không thể tải catalog từ Supabase', error);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const resolvePredictionLabel = (prediction?: { label?: string; rawLabel?: string }) =>
    humanizeLabel(prediction?.rawLabel ?? prediction?.label ?? 'Nhãn chưa xác định');

  const analyzeImageWithServer = useCallback(
    async (imageFile: File): Promise<{ results: SearchResult[]; insight: AnalysisInsight | null }> => {
      const response = await defaultColabService.analyzeImage(imageFile);

      if (!response.success) {
        throw new Error(response.error || 'Lỗi phân tích hình ảnh');
      }

      const payload = response.data as ImageAnalysisResult | undefined;
      const predictions = payload?.predictions ?? [];

      if (predictions.length === 0) {
        return { results: [], insight: null };
      }

      const seenProducts = new Set<string>();
      const aggregated: SearchResult[] = [];

      predictions.forEach((prediction, predictionIndex) => {
        const labelKey =
          prediction.normalizedLabel ||
          normalizeAiLabel(prediction.rawLabel) ||
          normalizeAiLabel(prediction.label) ||
          `label-${predictionIndex + 1}`;
        const productLimit = predictionIndex === 0 ? 6 : 4;
        
        console.log(`[AI Search] Prediction ${predictionIndex + 1}:`, {
          rawLabel: prediction.rawLabel,
          normalizedLabel: prediction.normalizedLabel,
          labelKey,
          category: prediction.category,
          subcategory: prediction.subcategory
        });
        
        const relatedProducts = pickProductsForLabel(
          labelKey, 
          catalog, 
          productLimit,
          prediction.category,
          prediction.subcategory
        );
        
        console.log(`[AI Search] Found ${relatedProducts.length} products for label "${labelKey}"`);

        relatedProducts.forEach((product, productIndex) => {
          if (seenProducts.has(product.id)) {
            return;
          }

          seenProducts.add(product.id);

          const baseConfidence = prediction.confidence || 0.75;
          const decay = predictionIndex * 0.12 + productIndex * 0.05;
          const confidenceScore = Math.max(0.45, Math.min(0.99, baseConfidence - decay));

          aggregated.push({
            product,
            confidence: confidenceScore,
            similarity: Math.max(0.4, confidenceScore - 0.05)
          });
        });
      });

      if (aggregated.length === 0) {
        const fallbackLabel = predictions[0]?.normalizedLabel || 
                              normalizeAiLabel(predictions[0]?.rawLabel) || 
                              normalizeAiLabel(predictions[0]?.label) ||
                              'unknown';
        const fallbackProducts = pickProductsForLabel(
          fallbackLabel, 
          catalog, 
          6,
          predictions[0]?.category,
          predictions[0]?.subcategory
        );
        fallbackProducts.forEach((product, index) => {
          aggregated.push({
            product,
            confidence: Math.max(0.5, 0.9 - index * 0.05),
            similarity: Math.max(0.45, 0.85 - index * 0.05)
          });
        });
      }

      const sortedResults = aggregated.sort((a, b) => b.confidence - a.confidence);
      const topPrediction = predictions[0];

      const insight: AnalysisInsight = {
        source: 'ai',
        labelDisplay: resolvePredictionLabel(topPrediction),
        rawLabel: topPrediction.rawLabel,
        category: topPrediction.category,
        subcategory: topPrediction.subcategory,
        confidence: topPrediction.confidence,
        processingTime: payload?.processing_time,
        features: [],
        predictions: predictions.map((predictionItem) => ({
          label: resolvePredictionLabel(predictionItem),
          rawLabel: predictionItem.rawLabel,
          confidence: predictionItem.confidence
        }))
      };

      return {
        results: sortedResults,
        insight
      };
    },
    [catalog]
  );


  const mockAnalyzeImage = useCallback(
    async (imageFile?: File): Promise<{ results: SearchResult[]; insight: AnalysisInsight }> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let targetSubcategory = '';
    let targetCategory: 'men' | 'women' | 'kids' = 'men';
    
    if (imageFile) {
      const fileName = imageFile.name.toLowerCase();
      
      if (fileName.includes('shirt') || fileName.includes('ao') || fileName.includes('sơ mi')) {
        targetSubcategory = 'Áo Sơ Mi';
      } else if (fileName.includes('tshirt') || fileName.includes('thun') || fileName.includes('t-shirt')) {
        targetSubcategory = 'T-shirt';
      } else if (fileName.includes('jean') || fileName.includes('jeans')) {
        targetSubcategory = 'Quần Jean';
      } else if (fileName.includes('dress') || fileName.includes('vay') || fileName.includes('váy') || fileName.includes('dam')) {
        targetSubcategory = 'Váy';
        targetCategory = 'women';
      } else if (fileName.includes('jacket') || fileName.includes('khoac') || fileName.includes('khoác')) {
        targetSubcategory = 'Áo Khoác';
      } else if (fileName.includes('polo')) {
        targetSubcategory = 'Áo Polo';
      } else if (fileName.includes('kaki') || fileName.includes('chino')) {
        targetSubcategory = 'Quần Kaki';
      } else if (fileName.includes('short')) {
        targetSubcategory = 'Quần Short';
      } else if (fileName.includes('sneaker') || fileName.includes('shoe') || fileName.includes('giay')) {
        targetSubcategory = 'Giày';
      } else if (fileName.includes('bag') || fileName.includes('tui') || fileName.includes('túi')) {
        targetSubcategory = 'Túi xách';
        targetCategory = 'women';
      } else {
        const popularTypes = ['T-shirt', 'Áo Sơ Mi', 'Quần Jean', 'Váy', 'Áo Khoác'];
        targetSubcategory = popularTypes[Math.floor(Math.random() * popularTypes.length)];
        if (targetSubcategory === 'Váy') targetCategory = 'women';
      }
    } else {
      const allSubcategories = ['T-shirt', 'Áo Sơ Mi', 'Quần Jean', 'Váy', 'Áo Khoác', 'Áo Polo'];
      targetSubcategory = allSubcategories[Math.floor(Math.random() * allSubcategories.length)];
      if (targetSubcategory === 'Váy') targetCategory = 'women';
    }
    
    const sameTypeProducts = catalog.filter(p => 
      p.subcategory === targetSubcategory
    );
    
    if (sameTypeProducts.length === 0) {
      const fallbackProducts = catalog.filter(p => p.category === targetCategory);
      const mockResults: SearchResult[] = fallbackProducts.slice(0, 5).map((product, index) => ({
        product,
        confidence: Math.max(0.5, 0.85 - (index * 0.08)),
        similarity: Math.max(0.45, 0.80 - (index * 0.08))
      }));
      
      return {
        results: mockResults,
        insight: {
          source: 'demo',
          labelDisplay: targetSubcategory || 'Gợi ý ngẫu nhiên',
          rawLabel: targetSubcategory,
          category: targetCategory,
          subcategory: targetSubcategory,
          confidence: 0.75,
          features: []
        }
      };
    }
    
    // Lấy tối đa 5 sản phẩm cùng loại
    const mockResults: SearchResult[] = sameTypeProducts
      .slice(0, 5)
      .map((product, index) => ({
        product,
        confidence: Math.max(0.55, 0.92 - (index * 0.08)),
        similarity: Math.max(0.5, 0.88 - (index * 0.08))
      }));

    return {
      results: mockResults,
      insight: {
        source: 'demo',
        labelDisplay: targetSubcategory || 'Gợi ý ngẫu nhiên',
        rawLabel: targetSubcategory,
        category: targetCategory,
        subcategory: targetSubcategory,
        confidence: mockResults[0]?.confidence,
        features: [targetSubcategory || 'Popular Picks'],
        notes: 'Đang sử dụng AI demo tại chỗ'
      }
    };
  }, [catalog]);

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
        const aiPayload = await analyzeImageWithServer(file);
        if (!aiPayload.results.length) {
          throw new Error('AI server chưa trả về sản phẩm phù hợp');
        }
        setSearchResults(aiPayload.results);
        setAnalysisInsight(aiPayload.insight ?? null);
      } catch (error) {
        const fallbackPayload = await mockAnalyzeImage(file);
        setSearchResults(fallbackPayload.results);
        setAnalysisInsight({
          ...fallbackPayload.insight,
          notes: 'Đang dùng AI demo do máy chủ nhận diện chưa phản hồi'
        });
        setAnalysisError(
          error instanceof Error
            ? error.message
            : 'Không thể phân tích hình ảnh với AI server'
        );
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  }, [analyzeImageWithServer, mockAnalyzeImage, catalog]);

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

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
    onClose();
  };

  const resetSearch = () => {
    setSelectedImage(null);
    setSearchResults([]);
    setIsAnalyzing(false);
    setAnalysisError('');
    setAnalysisInsight(null);
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
                AI nhận diện sản phẩm thời trang từ Flask server nội bộ
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
          <div className="grid grid-cols-1 gap-6">
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
                        AI Flask sẽ phân tích hình ảnh và đề xuất danh sách sản phẩm tương tự
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
                            AI đang phân tích...
                          </h3>
                          <p className="text-purple-700">
                            Vui lòng đợi trong giây lát để tìm sản phẩm tương tự
                          </p>
                          <div className="mt-4 bg-purple-200 rounded-full h-2">
                            <div className="bg-purple-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                          </div>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Search size={20} className="text-green-600" />
                              <h3 className="text-lg font-semibold text-gray-900">
                                Tìm thấy {searchResults.length} sản phẩm tương tự
                              </h3>
                            </div>
                            {analysisInsight && (
                              <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                                {analysisInsight.source === 'ai' ? 'AI Flask' : 'AI Demo'}
                              </span>
                            )}
                          </div>
                          {analysisError && (
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
                              <AlertTriangle size={16} className="text-yellow-600 mt-0.5" />
                              <p className="text-sm text-yellow-800">{analysisError}</p>
                            </div>
                          )}
                          {analysisInsight && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                              <div className="lg:col-span-2 border rounded-lg p-4 bg-white">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2 text-gray-500 text-sm">
                                    <Tag size={18} className="text-purple-600" />
                                    <span>Nhãn nhận diện</span>
                                  </div>
                                  <div className="flex items-center space-x-1 text-xs text-emerald-600">
                                    <BadgeCheck size={16} />
                                    <span>
                                      {analysisInsight.source === 'ai' ? 'AI chuẩn' : 'Demo'}
                                    </span>
                                  </div>
                                </div>
                                <div className="mt-3">
                                  <p className="text-2xl font-bold text-gray-900">
                                    {analysisInsight.labelDisplay || 'Không xác định'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {analysisInsight.category ? `Danh mục: ${analysisInsight.category}` : ''}
                                    {analysisInsight.subcategory ? ` • ${analysisInsight.subcategory}` : ''}
                                  </p>
                                </div>
                                {analysisInsight.features && analysisInsight.features.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-2">
                                    {analysisInsight.features.slice(0, 4).map((feature) => (
                                      <span
                                        key={feature}
                                        className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full"
                                      >
                                        {feature}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {analysisInsight.predictions && analysisInsight.predictions.length > 0 && (
                                  <div className="mt-4">
                                    <p className="text-xs text-gray-500 mb-1">Top nhãn dự đoán</p>
                                    <div className="flex flex-wrap gap-2">
                                      {analysisInsight.predictions.map((prediction, index) => (
                                        <span
                                          key={`${prediction.rawLabel}-${index}`}
                                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                                        >
                                          #{index + 1} {prediction.label} —{' '}
                                          {Math.round((prediction.confidence || 0) * 100)}%
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="border rounded-lg p-4 bg-gray-50 space-y-3">
                                <div className="flex items-center space-x-2">
                                  <Activity size={16} className="text-blue-600" />
                                  <div>
                                    <p className="text-xs text-gray-500">Độ tin cậy</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                      {analysisInsight.confidence
                                        ? `${Math.round(analysisInsight.confidence * 100)}%`
                                        : '—'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Clock size={16} className="text-blue-600" />
                                  <div>
                                    <p className="text-xs text-gray-500">Thời gian xử lý</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                      {analysisInsight.processingTime
                                        ? `${analysisInsight.processingTime.toFixed(2)}s`
                                        : '—'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Cpu size={16} className="text-blue-600" />
                                  <div>
                                    <p className="text-xs text-gray-500">Nguồn phân tích</p>
                                    <p className="text-sm font-medium text-gray-900">
                                      {analysisInsight.source === 'ai'
                                        ? 'Flask AI Server'
                                        : 'AI Demo Engine'}
                                    </p>
                                  </div>
                                </div>
                                {analysisInsight.notes && (
                                  <p className="text-xs text-gray-500">{analysisInsight.notes}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Search Results */}
                  {(() => {
                    if (searchResults.length > 0 && !isAnalyzing) {
                      const [primaryResult, ...otherResults] = searchResults;
                      return (
                        <div className="space-y-6">
                          {primaryResult && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div
                                className="border rounded-xl p-5 bg-gradient-to-br from-white to-purple-50 hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => handleProductClick(primaryResult.product.id)}
                              >
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <p className="text-xs uppercase tracking-wide text-purple-600 font-semibold">
                                      Gợi ý chính
                                    </p>
                                    <h4 className="text-2xl font-bold text-gray-900 mt-1">
                                      {primaryResult.product.name}
                                    </h4>
                                  </div>
                                  <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
                                    {primaryResult.product.subcategory}
                                  </span>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                  <img
                                    src={primaryResult.product.images[0]}
                                    alt={primaryResult.product.name}
                                    className="w-full sm:w-48 h-48 object-cover rounded-lg"
                                  />
                                  <div className="flex-1 space-y-3">
                                    <div>
                                      <p className="text-sm text-gray-500">Giá bán</p>
                                      <div className="flex items-center space-x-2">
                                        <span className="text-2xl font-semibold text-red-600">
                                          {formatPrice(primaryResult.product.price)}
                                        </span>
                                        {primaryResult.product.originalPrice && (
                                          <span className="text-sm text-gray-400 line-through">
                                            {formatPrice(primaryResult.product.originalPrice)}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="bg-white rounded-lg p-3 border">
                                        <p className="text-xs text-gray-500">Độ tin cậy AI</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                          {Math.round(primaryResult.confidence * 100)}%
                                        </p>
                                      </div>
                                      <div className="bg-white rounded-lg p-3 border">
                                        <p className="text-xs text-gray-500">Độ tương tự</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                          {Math.round(primaryResult.similarity * 100)}%
                                        </p>
                                      </div>
                                    </div>
                                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                      Xem chi tiết sản phẩm
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="border rounded-xl p-5 bg-white space-y-4">
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 mb-2">Điểm nổi bật</p>
                                  <ul className="space-y-2 text-sm text-gray-600 list-disc list-inside">
                                    {primaryResult.product.features.slice(0, 4).map((feature) => (
                                      <li key={feature}>{feature}</li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Màu sắc</p>
                                    <p className="text-sm text-gray-900">
                                      {primaryResult.product.colors.slice(0, 3).join(', ')}
                                      {primaryResult.product.colors.length > 3 ? '…' : ''}
                                    </p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Kích cỡ có sẵn</p>
                                    <p className="text-sm text-gray-900">
                                      {primaryResult.product.sizes.slice(0, 3).join(', ')}
                                      {primaryResult.product.sizes.length > 3 ? '…' : ''}
                                    </p>
                                  </div>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3">
                                  <p className="text-xs text-gray-500">Danh mục</p>
                                  <p className="text-sm text-gray-900">
                                    {primaryResult.product.category === 'men'
                                      ? 'Nam'
                                      : primaryResult.product.category === 'women'
                                        ? 'Nữ'
                                        : 'Trẻ em'}{' '}
                                    • {primaryResult.product.subcategory}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                          {otherResults.length > 0 && (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="text-lg font-semibold text-gray-900">Gợi ý bổ sung</h4>
                                <span className="text-sm text-gray-500">
                                  {otherResults.length} sản phẩm liên quan
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {otherResults.map((result) => (
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
                                          <h5 className="font-medium text-gray-900 line-clamp-2">
                                            {result.product.name}
                                          </h5>
                                          <span className="text-xs text-gray-500">
                                            {Math.round(result.similarity * 100)}%
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                          {result.product.subcategory} •{' '}
                                          {result.product.category === 'men'
                                            ? 'Nam'
                                            : result.product.category === 'women'
                                              ? 'Nữ'
                                              : 'Trẻ em'}
                                        </p>
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
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })()}
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
                  Máy chủ AI nhận diện sản phẩm
                </h4>
                <p className="text-sm text-blue-800">
                  Ảnh được gửi đến Flask API (`/predict`) để suy luận nhãn, sau đó hệ thống ánh xạ sang các sản phẩm trong danh mục.
                  Nếu server tạm thời không phản hồi, chế độ AI demo nội bộ sẽ tự động kích hoạt để vẫn có gợi ý.
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
