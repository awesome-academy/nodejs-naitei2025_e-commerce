import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <span className="text-2xl font-bold">UNIQLO</span>
            </div>
            <p className="text-gray-300 mb-4">
              Thời trang chất lượng cao với giá cả hợp lý, phù hợp cho mọi người.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Sản phẩm</h3>
            <ul className="space-y-2">
              <li><Link to="/men" className="text-gray-300 hover:text-white transition-colors">Nam</Link></li>
              <li><Link to="/women" className="text-gray-300 hover:text-white transition-colors">Nữ</Link></li>
              <li><Link to="/kids" className="text-gray-300 hover:text-white transition-colors">Trẻ em</Link></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Sản phẩm mới</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Khuyến mãi</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hỗ trợ khách hàng</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Hướng dẫn đặt hàng</a></li>
              <li><Link to="/return-policy" className="text-gray-300 hover:text-white transition-colors">Chính sách đổi trả</Link></li>
              <li><Link to="/size-guide" className="text-gray-300 hover:text-white transition-colors">Bảng size</Link></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Câu hỏi thường gặp</a></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-red-600" />
                <span className="text-gray-300">123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-red-600" />
                <span className="text-gray-300">1900 1000</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-red-600" />
                <span className="text-gray-300">contact@uniqlo.vn</span>
              </div>
            </div>
            
            {/* Newsletter */}
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Đăng ký nhận tin</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Email của bạn"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-l focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <button className="px-4 py-2 bg-red-600 text-white rounded-r hover:bg-red-700 transition-colors">
                  Đăng ký
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © 2024 UNIQLO Vietnam. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Chính sách bảo mật
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Điều khoản sử dụng
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Sitemap
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;