import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight, Heart, Share2, Plus, Minus, ShoppingBag, Star, Truck, Shield } from 'lucide-react';
import { products } from '../data/products';
import { useCart } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addItem } = useCart();
  
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  const product = products.find(p => p.id === id);
  const relatedProducts = products.filter(p => 
    p.category === product?.category && p.id !== id
  ).slice(0, 4);

  if (!product) {
    return <div>Product not found</div>;
  }

  // Initialize selections
  React.useEffect(() => {
    if (product) {
      setSelectedColor(product.colors[0]);
      setSelectedSize(product.sizes[0]);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (selectedColor && selectedSize) {
      addItem(product, selectedColor, selectedSize, quantity);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-red-600">Trang chủ</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <Link 
              to={`/${product.category}`} 
              className="text-gray-600 hover:text-red-600"
            >
              {product.category === 'men' ? 'Nam' : 
               product.category === 'women' ? 'Nữ' : 'Trẻ em'}
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 ${
                      selectedImageIndex === index ? 'border-red-600' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex space-x-2">
              {product.isNew && (
                <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                  SỐN PHẨM MỚI
                </span>
              )}
              {product.isSale && (
                <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                  KHUYẾN MÃI
                </span>
              )}
            </div>

            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-3xl font-bold text-red-600">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(128 đánh giá)</span>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-gray-700">{product.description}</p>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold mb-2">Tính năng:</h3>
              <ul className="space-y-1">
                {product.features.map((feature, index) => (
                  <li key={index} className="text-gray-700 flex items-center">
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-semibold mb-3">Màu sắc: {selectedColor}</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                      selectedColor === color
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="font-semibold mb-3">Kích thước: {selectedSize}</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                      selectedSize === size
                        ? 'border-red-600 bg-red-50 text-red-600'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="font-semibold mb-3">Số lượng:</h3>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={!selectedColor || !selectedSize}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingBag size={20} />
                <span>Thêm vào giỏ hàng</span>
              </button>
              
              <div className="flex space-x-3">
                <button className="flex-1 border border-gray-300 hover:bg-gray-50 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <Heart size={20} />
                  <span>Yêu thích</span>
                </button>
                <button className="flex-1 border border-gray-300 hover:bg-gray-50 py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2">
                  <Share2 size={20} />
                  <span>Chia sẻ</span>
                </button>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="border-t pt-6 space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Truck size={16} className="text-red-600" />
                <span>Miễn phí giao hàng cho đơn từ 500.000đ</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Shield size={16} className="text-red-600" />
                <span>Đổi trả trong 30 ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;