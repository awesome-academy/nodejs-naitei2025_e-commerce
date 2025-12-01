import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const ReturnPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-red-600">Trang chủ</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">Chính sách đổi trả</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <RefreshCw size={48} className="text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chính sách đổi trả
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất với chính sách đổi trả linh hoạt và thuận tiện
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: <Clock size={32} />,
              title: '30 ngày đổi trả',
              description: 'Thời gian đổi trả dài hạn'
            },
            {
              icon: <RefreshCw size={32} />,
              title: 'Miễn phí đổi trả',
              description: 'Không tính phí đổi trả tại cửa hàng'
            },
            {
              icon: <CheckCircle size={32} />,
              title: 'Quy trình đơn giản',
              description: 'Chỉ cần hóa đơn và sản phẩm'
            }
          ].map((item, index) => (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-red-600 mb-4 flex justify-center">
                {item.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {item.title}
              </h3>
              <p className="text-gray-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* General Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Chính sách chung
              </h2>
              
              <div className="bg-white border rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle size={20} className="text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Thời gian đổi trả</h3>
                      <p className="text-gray-600">30 ngày kể từ ngày mua hàng (theo hóa đơn)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle size={20} className="text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Điều kiện sản phẩm</h3>
                      <p className="text-gray-600">Sản phẩm còn nguyên tem mác, chưa qua sử dụng, không có mùi lạ</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle size={20} className="text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Hóa đơn mua hàng</h3>
                      <p className="text-gray-600">Cần có hóa đơn gốc hoặc hóa đơn điện tử</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <CheckCircle size={20} className="text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-gray-900">Hình thức đổi trả</h3>
                      <p className="text-gray-600">Đổi size, đổi màu, đổi sản phẩm khác hoặc hoàn tiền</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Return Process */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Quy trình đổi trả
              </h2>
              
              <div className="space-y-4">
                {[
                  {
                    step: 1,
                    title: 'Kiểm tra điều kiện',
                    description: 'Đảm bảo sản phẩm đáp ứng điều kiện đổi trả và trong thời hạn 30 ngày'
                  },
                  {
                    step: 2,
                    title: 'Chuẩn bị giấy tờ',
                    description: 'Mang theo hóa đơn mua hàng và sản phẩm cần đổi trả'
                  },
                  {
                    step: 3,
                    title: 'Đến cửa hàng',
                    description: 'Đến bất kỳ cửa hàng UNIQLO nào trên toàn quốc'
                  },
                  {
                    step: 4,
                    title: 'Xử lý đổi trả',
                    description: 'Nhân viên sẽ kiểm tra và xử lý đổi trả trong 5-10 phút'
                  }
                ].map((item) => (
                  <div key={item.step} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Special Cases */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Trường hợp đặc biệt
              </h2>
              
              <div className="space-y-4">
                <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle size={20} className="text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-yellow-800 mb-2">Sản phẩm khuyến mãi</h3>
                      <p className="text-yellow-700">
                        Sản phẩm giảm giá trên 50% chỉ được đổi size trong vòng 7 ngày, không hoàn tiền
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle size={20} className="text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-800 mb-2">Sản phẩm đặc biệt</h3>
                      <p className="text-blue-700">
                        Đồ lót, tất/vớ, phụ kiện cá nhân chỉ được đổi khi còn nguyên seal, chưa mở bao bì
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle size={20} className="text-green-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-green-800 mb-2">Lỗi từ nhà sản xuất</h3>
                      <p className="text-green-700">
                        Sản phẩm bị lỗi kỹ thuật sẽ được đổi trả không giới hạn thời gian và hoàn tiền 100%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Online Returns */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Đổi trả hàng mua online
              </h2>
              
              <div className="bg-white border rounded-lg p-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Cách 1: Đổi trả tại cửa hàng</h3>
                  <p className="text-gray-600">
                    Mang sản phẩm và hóa đơn điện tử đến bất kỳ cửa hàng UNIQLO nào
                  </p>
                  
                  <h3 className="font-medium text-gray-900 mt-6">Cách 2: Gửi trả qua đường bưu điện</h3>
                  <ul className="text-gray-600 space-y-2">
                    <li>• Liên hệ hotline 1900 1000 để được hướng dẫn</li>
                    <li>• Đóng gói sản phẩm cẩn thận kèm theo hóa đơn</li>
                    <li>• Gửi về địa chỉ được cung cấp (phí ship khách hàng trả)</li>
                    <li>• Thời gian xử lý: 3-5 ngày làm việc sau khi nhận hàng</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Cannot Return */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-4">
                <XCircle size={24} className="text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-red-900">
                  Không được đổi trả
                </h3>
              </div>
              
              <ul className="space-y-2 text-sm text-red-800">
                <li>• Sản phẩm đã qua sử dụng, có dấu hiệu bẩn</li>
                <li>• Sản phẩm bị rách, hỏng do lỗi người dùng</li>
                <li>• Sản phẩm có mùi lạ (nước hoa, thuốc lá...)</li>
                <li>• Sản phẩm đã cắt bỏ tem mác</li>
                <li>• Quá thời hạn 30 ngày</li>
                <li>• Không có hóa đơn mua hàng</li>
                <li>• Sản phẩm đặt may theo yêu cầu</li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cần hỗ trợ?
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Hotline</p>
                  <p className="text-red-600">1900 1000</p>
                  <p className="text-gray-600">24/7 - Miễn phí</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-red-600">support@uniqlo.vn</p>
                  <p className="text-gray-600">Phản hồi trong 24h</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">Live Chat</p>
                  <p className="text-gray-600">9:00 - 21:00 hàng ngày</p>
                </div>
              </div>
            </div>

            {/* Store Locator */}
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tìm cửa hàng gần nhất
              </h3>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-900">TP. Hồ Chí Minh</p>
                  <p className="text-gray-600">15 cửa hàng</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">Hà Nội</p>
                  <p className="text-gray-600">8 cửa hàng</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">Đà Nẵng</p>
                  <p className="text-gray-600">2 cửa hàng</p>
                </div>
              </div>
              
              <Link
                to="/contact"
                className="inline-block mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Xem tất cả cửa hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnPolicy;