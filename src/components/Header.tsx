import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search as SearchIcon, ChevronDown } from 'lucide-react';

const Header: React.FC = () => {
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">Store</h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors">
              Trang chủ
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setShowProductsMenu(true)}
              onMouseLeave={() => setShowProductsMenu(false)}
            >
              <button className="text-gray-700 hover:text-gray-900 transition-colors flex items-center space-x-1">
                <span>Sản phẩm</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showProductsMenu && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2">
                  <Link
                    to="/men"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Nam
                  </Link>
                  <Link
                    to="/women"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Nữ
                  </Link>
                  <Link
                    to="/kids"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Trẻ em
                  </Link>
                </div>
              )}
            </div>

            <Link to="/about" className="text-gray-700 hover:text-gray-900 transition-colors">
              Giới thiệu
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-gray-900 transition-colors">
              Liên hệ
            </Link>
          </nav>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              />
              <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Link to="/search" className="lg:hidden text-gray-700 hover:text-gray-900 transition-colors">
              <SearchIcon className="w-5 h-5" />
            </Link>
            <Link to="/account" className="text-gray-700 hover:text-gray-900 transition-colors">
              <User className="w-5 h-5" />
            </Link>
            <Link to="/cart" className="text-gray-700 hover:text-gray-900 transition-colors">
              <ShoppingCart className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />
            <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>
      </div>
    </header>
  );
};

export default Header;