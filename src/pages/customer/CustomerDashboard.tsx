import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, 
  Package, 
  Heart, 
  MapPin, 
  CreditCard, 
  Settings,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Star,
  Edit,
  Trash2,
  Plus,
  Eye,
  Bell,
  Gift,
  Award,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import {
  getCustomerDashboard,
  CustomerOrder,
  WishlistItem,
  Address,
  PaymentMethod,
  DashboardNotification
} from '../../services/customerService';
import { cancelOrder } from '../../services/orderService';
import { formatPaymentMethod } from '../../utils/payment';

const CustomerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { user, logout } = useAuth();
  const { items, total } = useCart();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [notifications, setNotifications] = useState<DashboardNotification[]>([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!user) {
      setLoadingDashboard(false);
      return;
    }

    (async () => {
      try {
        setDashboardError('');
        const data = await getCustomerDashboard(user.id);
        if (!isMounted) return;
        setOrders(data.orders || []);
        setWishlist(data.wishlist || []);
        setAddresses(data.addresses || []);
        setPaymentMethods(data.paymentMethods || []);
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error('Customer dashboard error', err);
        if (!isMounted) return;
        setDashboardError('Không thể tải dữ liệu khách hàng.');
      } finally {
        if (isMounted) setLoadingDashboard(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (loadingDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Đang tải dữ liệu khách hàng...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Bạn cần đăng nhập để xem thông tin khách hàng.
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!user) return;
    const confirm = window.confirm('Bạn chắc chắn muốn hủy đơn hàng này?');
    if (!confirm) return;
    setCancellingOrderId(orderId);
    try {
      await cancelOrder(orderId, user.id);
      const data = await getCustomerDashboard(user.id);
      setOrders(data.orders || []);
    } catch (err) {
      console.error('cancel order error', err);
      alert('Không thể hủy đơn hàng: ' + ((err as any)?.message || String(err)));
    } finally {
      setCancellingOrderId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã giao': return 'bg-green-100 text-green-800';
      case 'Đang giao': return 'bg-blue-100 text-blue-800';
      case 'Đang chuẩn bị': return 'bg-orange-100 text-orange-800';
      case 'Chờ xử lý': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Đã giao': return <CheckCircle size={16} className="text-green-600" />;
      case 'Đang giao': return <Truck size={16} className="text-blue-600" />;
      case 'Đang chuẩn bị': return <Package size={16} className="text-orange-600" />;
      default: return <Clock size={16} className="text-yellow-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Tài khoản của tôi</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>{new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              </button>
              <Link
                to="/"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {dashboardError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            {dashboardError}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* User Info */}
              <div className="flex items-center space-x-3 mb-6 pb-6 border-b">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <User size={32} className="text-red-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{user?.name}</h2>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  <div className="flex items-center mt-1">
                    <Award size={14} className="text-yellow-500 mr-1" />
                    <span className="text-xs text-yellow-600">Thành viên VIP</span>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Tổng quan', icon: User },
                  { id: 'orders', label: 'Đơn hàng của tôi', icon: Package },
                  { id: 'wishlist', label: 'Danh sách yêu thích', icon: Heart },
                  { id: 'addresses', label: 'Sổ địa chỉ', icon: MapPin },
                  { id: 'payments', label: 'Thanh toán', icon: CreditCard },
                  { id: 'notifications', label: 'Thông báo', icon: Bell },
                  { id: 'settings', label: 'Cài đặt tài khoản', icon: Settings },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-red-50 text-red-600 border-l-4 border-red-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    {item.id === 'notifications' && notifications.filter(n => !n.read).length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {notifications.filter(n => !n.read).length}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Logout Button */}
              <div className="mt-6 pt-6 border-t">
                <button
                  onClick={logout}
                  className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Chào mừng trở lại, {user?.name}!</h2>
                      <p className="opacity-90">Cảm ơn bạn đã là thành viên VIP của UNIQLO</p>
                    </div>
                    <Gift size={48} className="opacity-80" />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Đơn hàng</p>
                        <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                        <p className="text-xs text-green-600">+2 tháng này</p>
                      </div>
                      <Package size={32} className="text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Yêu thích</p>
                        <p className="text-2xl font-bold text-gray-900">{wishlist.length}</p>
                        <p className="text-xs text-blue-600">+1 tuần này</p>
                      </div>
                      <Heart size={32} className="text-red-500" />
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Giỏ hàng</p>
                        <p className="text-2xl font-bold text-gray-900">{items.length}</p>
                        <p className="text-xs text-orange-600">Sản phẩm</p>
                      </div>
                      <ShoppingBag size={32} className="text-green-500" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Điểm tích lũy</p>
                        <p className="text-2xl font-bold text-gray-900">1,250</p>
                        <p className="text-xs text-purple-600">Điểm</p>
                      </div>
                      <Award size={32} className="text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold">Đơn hàng gần đây</h3>
                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="text-red-600 hover:text-red-700 font-medium"
                    >
                      Xem tất cả
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {orders.slice(0, 3).map((order) => (
                      <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(order.status)}
                            <div>
                              <h4 className="font-medium">Đơn hàng #{order.id}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(order.date).toLocaleDateString('vi-VN')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                            <p className="font-semibold text-red-600 mt-1">{formatPrice(order.total)}</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                          <p>{order.items} sản phẩm</p>
                          <Link to={`/order/${order.id}`} className="text-red-600 hover:text-red-700">
                            Xem chi tiết →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Current Cart */}
                {items.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Giỏ hàng hiện tại</h3>
                      <Link 
                        to="/cart"
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Xem giỏ hàng
                      </Link>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <ShoppingBag size={24} className="text-red-600" />
                        <div>
                          <p className="font-medium">{items.length} sản phẩm trong giỏ</p>
                          <p className="text-sm text-gray-600">Sẵn sàng thanh toán</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-red-600">{formatPrice(total)}</p>
                        <Link 
                          to="/checkout"
                          className="inline-block mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          Thanh toán ngay
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Khuyến mãi dành cho bạn</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <Gift size={20} className="text-yellow-600" />
                        <div>
                          <p className="font-medium text-yellow-800">Giảm 15% đơn hàng tiếp theo</p>
                          <p className="text-sm text-yellow-600">Áp dụng cho thành viên VIP</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                        <Truck size={20} className="text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-800">Miễn phí giao hàng</p>
                          <p className="text-sm text-blue-600">Cho tất cả đơn hàng</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
                    <div className="space-y-2">
                      <button 
                        onClick={() => setActiveTab('wishlist')}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        💝 Xem danh sách yêu thích
                      </button>
                      <button 
                        onClick={() => setActiveTab('addresses')}
                        className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        📍 Quản lý địa chỉ
                      </button>
                      <Link 
                        to="/size-guide"
                        className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        📏 Hướng dẫn chọn size
                      </Link>
                      <Link 
                        to="/contact"
                        className="block w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        📞 Liên hệ hỗ trợ
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-6">Đơn hàng của tôi</h3>
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(order.status)}
                          <div>
                            <h4 className="text-lg font-medium">Đơn hàng #{order.id}</h4>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center">
                                <Clock size={14} className="mr-1" />
                                {new Date(order.date).toLocaleDateString('vi-VN')}
                              </span>
                              <span>Mã vận đơn: {order.trackingNumber}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right mt-4 lg:mt-0">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <p className="text-lg font-bold text-red-600 mt-2">{formatPrice(order.total)}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-medium mb-2">Sản phẩm đã đặt:</h5>
                        <div className="space-y-2">
                          {order.products.map((product, index) => (
                            <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded">
                              <span>{product.name} x{product.quantity}</span>
                              <span className="font-medium">{formatPrice(product.price)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm border-t pt-4">
                        <div>
                          <p className="text-gray-600 mb-1">Địa chỉ giao hàng:</p>
                          <p className="font-medium">{order.shippingAddress}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">Thanh toán:</p>
                          <p className="font-medium">{formatPaymentMethod(order.paymentMethod || (order as any).payment_method)}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4">
                        <button className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                          Theo dõi đơn hàng
                        </button>
                        {order.status === 'Đã giao' && (
                          <>
                            <button className="px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors">
                              Đánh giá sản phẩm
                            </button>
                            <button className="px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors">
                              Mua lại
                            </button>
                          </>
                        )}
                        {order.status !== 'Đã giao' && order.status !== 'Đã hủy' && (
                          <button
                            disabled={cancellingOrderId === order.id}
                            onClick={() => handleCancelOrder(order.id)}
                            className={`px-4 py-2 rounded-lg transition-colors ${cancellingOrderId === order.id ? 'bg-gray-200 text-gray-500' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                          >
                            {cancellingOrderId === order.id ? 'Đang hủy...' : 'Hủy đơn hàng'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Danh sách yêu thích ({wishlist.length})</h3>
                  <button className="text-red-600 hover:text-red-700 font-medium">
                    Xóa tất cả
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wishlist.map((item) => {
                    const ratingValue = item.rating ?? 0;
                    const filledStars = Math.floor(ratingValue);
                    return (
                    <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-48 object-cover"
                        />
                        {!item.inStock && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-medium">Hết hàng</span>
                          </div>
                        )}
                        <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium mb-2 line-clamp-2">{item.name}</h4>
                        <div className="flex items-center space-x-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              fill={i < filledStars ? "currentColor" : "none"}
                              className={i < filledStars ? "text-yellow-400" : "text-gray-300"}
                            />
                          ))}
                          <span className="text-sm text-gray-600">({ratingValue.toFixed(1)})</span>
                        </div>
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-lg font-bold text-red-600">{formatPrice(item.price)}</span>
                          {item.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(item.originalPrice)}
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Link 
                            to={`/product/${item.id}`}
                            className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm text-center hover:bg-red-700 transition-colors"
                          >
                            Xem chi tiết
                          </Link>
                          <button 
                            disabled={!item.inStock}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {item.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
                          </button>
                        </div>
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Sổ địa chỉ</h3>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                    <Plus size={16} />
                    <span>Thêm địa chỉ mới</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium">{address.name}</h4>
                            {address.isDefault && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="text-gray-900 mb-1">{address.fullName}</p>
                          <p className="text-gray-600 mb-1">{address.phone}</p>
                          <p className="text-gray-600">{address.address}</p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {!address.isDefault && (
                        <button className="mt-3 text-sm text-red-600 hover:text-red-700">
                          Đặt làm địa chỉ mặc định
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Phương thức thanh toán</h3>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                    <Plus size={16} />
                    <span>Thêm thẻ mới</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <CreditCard size={24} className="text-gray-600" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{method.name}</h4>
                              {method.isDefault && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                  Mặc định
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600">{method.details}</p>
                            {method.expiry && (
                              <p className="text-sm text-gray-500">Hết hạn: {method.expiry}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                            <Edit size={16} />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {!method.isDefault && (
                        <button className="mt-3 text-sm text-red-600 hover:text-red-700">
                          Đặt làm mặc định
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Thông báo</h3>
                  <button className="text-red-600 hover:text-red-700 font-medium">
                    Đánh dấu tất cả đã đọc
                  </button>
                </div>
                
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`border rounded-lg p-4 ${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            {!notification.read && (
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2">{notification.message}</p>
                          <p className="text-sm text-gray-500">{notification.time}</p>
                        </div>
                        <button className="p-1 text-gray-400 hover:text-gray-600">
                          <Eye size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-6">Cài đặt tài khoản</h3>
                
                <div className="space-y-8">
                  {/* Personal Information */}
                  <div className="border-b pb-6">
                    <h4 className="font-medium mb-4">Thông tin cá nhân</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Họ và tên
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.name}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          defaultValue={user?.email}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          defaultValue="0901234567"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ngày sinh
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Change */}
                  <div className="border-b pb-6">
                    <h4 className="font-medium mb-4">Đổi mật khẩu</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mật khẩu mới
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Xác nhận mật khẩu mới
                        </label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notification Preferences */}
                  <div className="border-b pb-6">
                    <h4 className="font-medium mb-4">Tùy chọn thông báo</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span>Nhận thông báo về đơn hàng qua email</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span>Nhận thông báo khuyến mãi</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span>Nhận newsletter hàng tuần</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span>Nhận thông báo sản phẩm mới</span>
                      </label>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div>
                    <h4 className="font-medium mb-4">Quyền riêng tư</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-3" />
                        <span>Cho phép lưu lịch sử duyệt web</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-3" />
                        <span>Chia sẻ dữ liệu để cải thiện trải nghiệm</span>
                      </label>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-6">
                    <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
