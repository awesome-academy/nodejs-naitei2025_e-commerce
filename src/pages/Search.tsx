import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronRight, Filter, SlidersHorizontal, Search as SearchIcon, Camera, Sparkles } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products } from '../data/products';
import ImageSearch from '../components/ImageSearch';

const Search: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [sortBy, setSortBy] = useState<string>('default');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [showFilters, setShowFilters] = useState(false);
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false);

  const searchResults = useMemo(() => {
    let results = products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.subcategory.toLowerCase().includes(query.toLowerCase()) ||
      product.features.some(feature => feature.toLowerCase().includes(query.toLowerCase()))
    );

    // Filter by category
    if (selectedCategory !== 'all') {
      results = results.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    results = results.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Sort results
    switch (sortBy) {
      case 'price-low':
        results.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        results.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        results.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        break;
    }

    return results;
  }, [query, selectedCategory, priceRange, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-red-600">Trang chủ</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">Tìm kiếm</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Kết quả tìm kiếm cho "{query}"
              </h1>
              <p className="text-gray-600">
                {searchResults.length} sản phẩm được tìm thấy
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter size={16} />
                <span>Bộ lọc</span>
              </button>
              
              <button
                onClick={() => setIsImageSearchOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Camera size={16} />
                <span>Tìm bằng ảnh</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <SlidersHorizontal size={16} className="text-gray-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="default">Mặc định</option>
                  <option value="newest">Mới nhất</option>
                  <option value="price-low">Giá thấp đến cao</option>
                  <option value="price-high">Giá cao đến thấp</option>
                  <option value="name">Tên A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-64 lg:flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Bộ lọc</h3>
              
              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Danh mục</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value="all"
                      checked={selectedCategory === 'all'}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="mr-2 text-red-600"
                    />
                    Tất cả
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value="men"
                      checked={selectedCategory === 'men'}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="mr-2 text-red-600"
                    />
                    Nam
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value="women"
                      checked={selectedCategory === 'women'}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="mr-2 text-red-600"
                    />
                    Nữ
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value="kids"
                      checked={selectedCategory === 'kids'}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="mr-2 text-red-600"
                    />
                    Trẻ em
                  </label>
                </div>
              </div>
              
              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Khoảng giá</h4>
                <div className="space-y-3">
                  <div>
                    <input
                      type="range"
                      min="0"
                      max="2000000"
                      step="50000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0đ</span>
                    <span>{priceRange[1].toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1">
            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {searchResults.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <SearchIcon size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-600 mb-4">
                  Không có sản phẩm nào phù hợp với từ khóa "{query}"
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => setIsImageSearchOpen(true)}
                    className="inline-flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Sparkles size={16} />
                    <span>Thử tìm bằng hình ảnh</span>
                  </button>
                  <div>
                    <Link
                      to="/"
                      className="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Về trang chủ
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Search Modal */}
      <ImageSearch 
        isOpen={isImageSearchOpen} 
        onClose={() => setIsImageSearchOpen(false)} 
      />
    </div>
  );
};

export default Search;