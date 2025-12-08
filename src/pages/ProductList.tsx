import React, { useState, useMemo } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, categories, subcategories } from '../data/products';

const ProductList: React.FC = () => {
  const params = useParams<{ category: string }>();
  const category = params.category || window.location.pathname.split('/')[1];
  const [searchParams] = useSearchParams();
  const subcategoryFromUrl = searchParams.get('subcategory');
  
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(subcategoryFromUrl || 'all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000]);
  const [showFilters, setShowFilters] = useState(false);

  // Update selected subcategory when URL changes
  React.useEffect(() => {
    setSelectedSubcategory(subcategoryFromUrl || 'all');
  }, [subcategoryFromUrl]);

  // Reset filters when category changes
  React.useEffect(() => {
    setSelectedSubcategory('all');
    setSortBy('default');
    setPriceRange([0, 2000000]);
  }, [category]);
  const currentCategory = categories.find(cat => cat.id === category);
  
  const filteredProducts = useMemo(() => {
    let result = products.filter(product => product.category === category);
    
    // Filter by subcategory
    if (selectedSubcategory !== 'all') {
      result = result.filter(product => product.subcategory === selectedSubcategory);
    }
    
    // Filter by price range
    result = result.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Sort products
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    
    return result;
  }, [category, selectedSubcategory, sortBy, priceRange]);

  const categorySubcategories = category && subcategories[category as keyof typeof subcategories] || [];

  if (!currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Danh mục không tồn tại
          </h2>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-red-600">Trang chủ</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <Link to={currentCategory.path} className="text-gray-600 hover:text-red-600">{currentCategory.name}</Link>
            {selectedSubcategory !== 'all' && (
              <>
                <ChevronRight size={16} className="text-gray-400" />
                <span className="text-gray-900 font-medium">{selectedSubcategory}</span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedSubcategory !== 'all' ? selectedSubcategory : currentCategory.name}
              </h1>
              <p className="text-gray-600">
                {filteredProducts.length} sản phẩm
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
                  <option value="rating">Đánh giá cao nhất</option>
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
              
              {/* Subcategory Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Danh mục</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="subcategory"
                      value="all"
                      checked={selectedSubcategory === 'all'}
                      onChange={(e) => setSelectedSubcategory(e.target.value)}
                      className="mr-2 text-red-600"
                    />
                    Tất cả {currentCategory.name}
                  </label>
                  {categorySubcategories.map((subcat) => (
                    <label key={subcat} className="flex items-center">
                      <input
                        type="radio"
                        name="subcategory"
                        value={subcat}
                        checked={selectedSubcategory === subcat}
                        onChange={(e) => setSelectedSubcategory(e.target.value)}
                        className="mr-2 text-red-600"
                      />
                      {subcat}
                    </label>
                  ))}
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

              {/* Quick Filters */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Lọc nhanh</h4>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      setSelectedSubcategory('all');
                      setSortBy('newest');
                    }}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                  >
                    Sản phẩm mới
                  </button>
                  <button 
                    onClick={() => {
                      const saleProducts = products.filter(p => p.isSale && p.category === category);
                      if (saleProducts.length > 0) {
                        setSortBy('default');
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                  >
                    Khuyến mãi
                  </button>
                  <button 
                    onClick={() => setSortBy('rating')}
                    className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded"
                  >
                    Bán chạy nhất
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Filter size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-gray-600 mb-4">
                  Thử thay đổi bộ lọc để xem thêm sản phẩm khác
                </p>
                <button
                  onClick={() => {
                    setSelectedSubcategory('all');
                    setPriceRange([0, 2000000]);
                    setSortBy('default');
                  }}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Xóa bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;