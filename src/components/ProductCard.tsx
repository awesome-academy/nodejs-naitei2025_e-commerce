import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { Product } from '../data/products';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add with first available color and size
    if (product.colors.length > 0 && product.sizes.length > 0) {
      addItem(product, product.colors[0], product.sizes[0], 1);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        {/* Image Container */}
        <div className="relative overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col space-y-1">
            {product.isNew && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                MỚI
              </span>
            )}
            {product.isSale && (
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                GIẢM GIÁ
              </span>
            )}
          </div>

          {/* Hover Actions */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
              <Heart size={16} className="text-gray-600" />
            </button>
            <button
              onClick={handleQuickAdd}
              className="p-2 bg-red-600 rounded-full shadow-md hover:bg-red-700 transition-colors"
            >
              <ShoppingBag size={16} className="text-white" />
            </button>
          </div>

          {/* Color Options */}
          <div className="absolute bottom-3 left-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {product.colors.slice(0, 4).map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{
                  backgroundColor: color === 'Trắng' ? '#ffffff' :
                                 color === 'Đen' ? '#000000' :
                                 color === 'Xanh' ? '#3b82f6' :
                                 color === 'Đỏ' ? '#ef4444' :
                                 color === 'Xám' ? '#6b7280' :
                                 color === 'Hồng' ? '#ec4899' :
                                 color === 'Vàng' ? '#eab308' :
                                 color === 'Be' ? '#d2b48c' : '#94a3b8'
                }}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-white bg-black bg-opacity-50 px-1 rounded">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
            {product.name}
          </h3>
          
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg font-bold text-red-600">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center space-x-1 mb-3">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={12} 
                    fill={i < Math.floor(product.rating || 0) ? "currentColor" : "none"}
                    className={i < Math.floor(product.rating || 0) ? "text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">
                {product.rating} ({product.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Features */}
          <div className="flex flex-wrap gap-1">
            {product.features.slice(0, 2).map((feature, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;