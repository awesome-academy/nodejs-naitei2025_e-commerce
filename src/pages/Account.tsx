import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ChevronRight, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Account: React.FC = () => {
  const [showLogin, setShowLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { isAuthenticated, isAdmin, user, login, register, loading: authLoading } = useAuth();

  // Redirect if already logged in
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Đang tải thông tin tài khoản...
      </div>
    );
  }

  if (isAuthenticated) {
    const backofficeRoles = ['admin', 'editor', 'viewer'];
    const destination = backofficeRoles.includes(user?.role ?? '') ? '/admin' : '/customer';
    return <Navigate to={destination} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!showLogin && password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      let success = false;
      
      if (showLogin) {
        success = await login(email, password);
      } else {
        success = await register(name, email, password, phone);
      }
      
      if (!success) {
        setError(showLogin ? 'Email hoặc mật khẩu không đúng' : 'Đăng ký thất bại');
      }
    } catch {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-red-600">Trang chủ</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">Tài khoản</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User size={32} className="text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {showLogin ? 'Đăng nhập' : 'Đăng ký'}
              </h1>
              <p className="text-gray-600">
                {showLogin ? 'Đăng nhập để truy cập tài khoản của bạn' : 'Tạo tài khoản mới'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!showLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={!showLogin}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="Nhập họ và tên"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required={!showLogin}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Nhập email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Nhập mật khẩu"
                />
              </div>

              {!showLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required={!showLogin}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Đang xử lý...' : (showLogin ? 'Đăng nhập' : 'Đăng ký')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {showLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                <button
                  onClick={() => {
                    setShowLogin(!showLogin);
                    setError('');
                  }}
                  className="text-red-600 hover:text-red-700 font-medium ml-1"
                >
                  {showLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
                </button>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mt-4">
                Bằng việc đăng nhập, bạn đồng ý với{' '}
                <a href="#" className="text-red-600 hover:text-red-700">
                  Điều khoản sử dụng
                </a>{' '}
                và{' '}
                <a href="#" className="text-red-600 hover:text-red-700">
                  Chính sách bảo mật
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
