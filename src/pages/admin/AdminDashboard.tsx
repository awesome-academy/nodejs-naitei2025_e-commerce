import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Download,
  Settings,
  Bell,
  Calendar,
  DollarSign,
  Sparkles
} from 'lucide-react';
import { products } from '../../data/products';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { user, logout } = useAuth();

  // Mock data
  const stats = {
    totalProducts: products.length,
    totalOrders: 156,
    totalCustomers: 89,
    totalRevenue: 45600000,
    monthlyGrowth: 12.5,
    pendingOrders: 23,
    lowStockItems: 8
  };

  const recentOrders = [
    { 
      id: 'ORD001', 
      customer: 'Nguyễn Văn A', 
      email: 'nguyenvana@email.com',
      total: 890000, 
      status: 'Đã giao', 
      date: '2024-01-15',
      items: 2,
      paymentMethod: 'COD'
    },
    { 
      id: 'ORD002', 
      customer: 'Trần Thị B', 
      email: 'tranthib@email.com',
      total: 1290000, 
      status: 'Đang giao', 
      date: '2024-01-20',
      items: 3,
      paymentMethod: 'Card'
    },
    { 
      id: 'ORD003', 
      customer: 'Lê Văn C', 
      email: 'levanc@email.com',
      total: 650000, 
      status: 'Chờ xử lý', 
      date: '2024-01-22',
      items: 1,
      paymentMethod: 'COD'
    },
    { 
      id: 'ORD004', 
      customer: 'Phạm Thị D', 
      email: 'phamthid@email.com',
      total: 1450000, 
      status: 'Đã xác nhận', 
      date: '2024-01-23',
      items: 4,
      paymentMethod: 'Card'
    },
    { 
      id: 'ORD005', 
      customer: 'Hoàng Văn E', 
      email: 'hoangvane@email.com',
      total: 780000, 
      status: 'Đang chuẩn bị', 
      date: '2024-01-24',
      items: 2,
      paymentMethod: 'COD'
    }
  ];

  const customers = [
    {
      id: 'CUST001',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@email.com',
      phone: '0901234567',
      totalOrders: 5,
      totalSpent: 2450000,
      joinDate: '2023-08-15',
      status: 'VIP'
    },
    {
      id: 'CUST002',
      name: 'Trần Thị B',
      email: 'tranthib@email.com',
      phone: '0907654321',
      totalOrders: 3,
      totalSpent: 1890000,
      joinDate: '2023-10-20',
      status: 'Regular'
    },
    {
      id: 'CUST003',
      name: 'Lê Văn C',
      email: 'levanc@email.com',
      phone: '0912345678',
      totalOrders: 8,
      totalSpent: 3200000,
      joinDate: '2023-06-10',
      status: 'VIP'
    }
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã giao': return 'bg-green-100 text-green-800';
      case 'Đang giao': return 'bg-blue-100 text-blue-800';
      case 'Đã xác nhận': return 'bg-purple-100 text-purple-800';
      case 'Đang chuẩn bị': return 'bg-orange-100 text-orange-800';
      case 'Chờ xử lý': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>{new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-semibold text-sm">
                    {user?.name?.charAt(0)}
                  </span>
                </div>
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
              <Link
                to="/"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <nav className="space-y-2">
                {[
                  { id: 'overview', label: 'Tổng quan', icon: BarChart3 },
                  { id: 'products', label: 'Sản phẩm', icon: Package },
                  { id: 'orders', label: 'Đơn hàng', icon: ShoppingCart },
                  { id: 'customers', label: 'Khách hàng', icon: Users },
                  { id: 'analytics', label: 'Thống kê', icon: TrendingUp },
                  { id: 'settings', label: 'Cài đặt', icon: Settings },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === item.id
                        ? 'bg-red-50 text-red-600 border-l-4 border-red-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { 
                      title: 'Tổng sản phẩm', 
                      value: stats.totalProducts, 
                      icon: Package, 
                      color: 'bg-blue-500',
                      change: '+5 tuần này'
                    },
                    { 
                      title: 'Đơn hàng', 
                      value: stats.totalOrders, 
                      icon: ShoppingCart, 
                      color: 'bg-green-500',
                      change: '+12 tuần này'
                    },
                    { 
                      title: 'Khách hàng', 
                      value: stats.totalCustomers, 
                      icon: Users, 
                      color: 'bg-purple-500',
                      change: '+8 tuần này'
                    },
                    { 
                      title: 'Doanh thu', 
                      value: formatPrice(stats.totalRevenue), 
                      icon: DollarSign, 
                      color: 'bg-red-500',
                      change: `+${stats.monthlyGrowth}% tháng này`
                    },
                  ].map((stat, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-full ${stat.color}`}>
                          <stat.icon size={24} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mb-2">
                          {typeof stat.value === 'string' ? stat.value : stat.value.toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600">{stat.change}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4 text-orange-600">Cần xử lý</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Đơn hàng chờ xử lý</span>
                        <span className="font-semibold text-orange-600">{stats.pendingOrders}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Sản phẩm sắp hết</span>
                        <span className="font-semibold text-red-600">{stats.lowStockItems}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4 text-blue-600">Hoạt động hôm nay</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Đơn hàng mới</span>
                        <span className="font-semibold text-blue-600">8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Khách hàng mới</span>
                        <span className="font-semibold text-green-600">3</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-lg font-semibold mb-4 text-green-600">Doanh thu hôm nay</h3>
                    <div className="space-y-3">
                      <div className="text-2xl font-bold text-green-600">
                        {formatPrice(2450000)}
                      </div>
                      <div className="text-sm text-gray-600">
                        +15% so với hôm qua
                      </div>
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
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3">Mã đơn</th>
                          <th className="text-left py-3">Khách hàng</th>
                          <th className="text-left py-3">Tổng tiền</th>
                          <th className="text-left py-3">Trạng thái</th>
                          <th className="text-left py-3">Ngày</th>
                          <th className="text-left py-3">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentOrders.slice(0, 5).map((order) => (
                          <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 font-medium">{order.id}</td>
                            <td className="py-3">{order.customer}</td>
                            <td className="py-3">{formatPrice(order.total)}</td>
                            <td className="py-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3">{new Date(order.date).toLocaleDateString('vi-VN')}</td>
                            <td className="py-3">
                              <button className="text-blue-600 hover:text-blue-800 text-sm">
                                Xem chi tiết
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
                  <h3 className="text-lg font-semibold">Quản lý sản phẩm</h3>
                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                    <div className="flex space-x-2">
                      <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Tìm sản phẩm..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      >
                        <option value="all">Tất cả danh mục</option>
                        <option value="men">Nam</option>
                        <option value="women">Nữ</option>
                        <option value="kids">Trẻ em</option>
                      </select>
                    </div>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2">
                      <Plus size={16} />
                      <span>Thêm sản phẩm</span>
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Hình ảnh</th>
                        <th className="text-left py-3">Tên sản phẩm</th>
                        <th className="text-left py-3">Danh mục</th>
                        <th className="text-left py-3">Giá</th>
                        <th className="text-left py-3">Tồn kho</th>
                        <th className="text-left py-3">Trạng thái</th>
                        <th className="text-left py-3">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.slice(0, 10).map((product) => (
                        <tr key={product.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          </td>
                          <td className="py-3">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.subcategory}</p>
                            </div>
                          </td>
                          <td className="py-3 capitalize">{product.category === 'men' ? 'Nam' : product.category === 'women' ? 'Nữ' : 'Trẻ em'}</td>
                          <td className="py-3">
                            <div>
                              <p className="font-medium">{formatPrice(product.price)}</p>
                              {product.originalPrice && (
                                <p className="text-sm text-gray-500 line-through">
                                  {formatPrice(product.originalPrice)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="py-3">
                            <span className="text-sm">
                              {Math.floor(Math.random() * 100) + 10}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              Còn hàng
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                <Eye size={16} />
                              </button>
                              <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                                <Edit size={16} />
                              </button>
                              <button className="p-1 text-red-600 hover:bg-red-50 rounded">
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-6 flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Hiển thị 10 trong {filteredProducts.length} sản phẩm
                  </p>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                      Trước
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white rounded">
                      1
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                      2
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Quản lý đơn hàng</h3>
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                      <Filter size={16} />
                      <span>Lọc</span>
                    </button>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                      <Download size={16} />
                      <span>Xuất Excel</span>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                        <div>
                          <h4 className="text-lg font-medium">Đơn hàng #{order.id}</h4>
                          <div className="flex flex-col md:flex-row md:items-center md:space-x-4 text-sm text-gray-600 mt-1">
                            <span>Khách hàng: {order.customer}</span>
                            <span>Email: {order.email}</span>
                            <span>Ngày: {new Date(order.date).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </div>
                        <div className="text-right mt-4 md:mt-0">
                          <p className="text-lg font-semibold">{formatPrice(order.total)}</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Số lượng sản phẩm:</span>
                          <span className="ml-2 font-medium">{order.items} sản phẩm</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Thanh toán:</span>
                          <span className="ml-2 font-medium">{order.paymentMethod}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                            Xem chi tiết
                          </button>
                          <button className="px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100">
                            Cập nhật
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold">Quản lý khách hàng</h3>
                  <div className="flex space-x-2">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Tìm khách hàng..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
                      <Download size={16} />
                      <span>Xuất Excel</span>
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3">Khách hàng</th>
                        <th className="text-left py-3">Liên hệ</th>
                        <th className="text-left py-3">Đơn hàng</th>
                        <th className="text-left py-3">Tổng chi tiêu</th>
                        <th className="text-left py-3">Ngày tham gia</th>
                        <th className="text-left py-3">Trạng thái</th>
                        <th className="text-left py-3">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                <span className="text-red-600 font-semibold">
                                  {customer.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">{customer.name}</p>
                                <p className="text-sm text-gray-600">{customer.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3">
                            <div>
                              <p className="text-sm">{customer.email}</p>
                              <p className="text-sm text-gray-600">{customer.phone}</p>
                            </div>
                          </td>
                          <td className="py-3 font-medium">{customer.totalOrders}</td>
                          <td className="py-3 font-medium text-green-600">
                            {formatPrice(customer.totalSpent)}
                          </td>
                          <td className="py-3">
                            {new Date(customer.joinDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              customer.status === 'VIP' 
                                ? 'bg-purple-100 text-purple-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {customer.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex space-x-2">
                              <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                                <Eye size={16} />
                              </button>
                              <button className="p-1 text-green-600 hover:bg-green-50 rounded">
                                <Edit size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-6">Thống kê bán hàng</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <TrendingUp size={48} className="text-green-500 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold mb-2">Biểu đồ doanh thu</h4>
                      <p className="text-gray-600">Chức năng đang phát triển</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                      <BarChart3 size={48} className="text-blue-500 mx-auto mb-4" />
                      <h4 className="text-lg font-semibold mb-2">Thống kê sản phẩm</h4>
                      <p className="text-gray-600">Chức năng đang phát triển</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-6">Cài đặt hệ thống</h3>
                <div className="space-y-6">
                  <div className="border-b pb-6">
                    <h4 className="font-medium mb-4">Thông tin cửa hàng</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên cửa hàng
                        </label>
                        <input
                          type="text"
                          defaultValue="UNIQLO Vietnam"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email liên hệ
                        </label>
                        <input
                          type="email"
                          defaultValue="contact@uniqlo.vn"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-b pb-6">
                    <h4 className="font-medium mb-4">Cài đặt thanh toán</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span>Thanh toán khi nhận hàng (COD)</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        <span>Thanh toán bằng thẻ tín dụng</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        <span>Ví điện tử</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-4">Cài đặt giao hàng</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phí giao hàng miễn phí từ
                        </label>
                        <input
                          type="number"
                          defaultValue="500000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Thời gian giao hàng (ngày)
                        </label>
                        <input
                          type="number"
                          defaultValue="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-6">
                    <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                      Lưu cài đặt
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

export default AdminDashboard;