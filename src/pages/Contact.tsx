import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MapPin, Phone, Mail, Clock, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-red-600">Trang chủ</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">Liên hệ</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Liên hệ với chúng tôi
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi 
            qua các kênh dưới đây hoặc gửi tin nhắn trực tiếp.
          </p>
        </div>
      </section>

      {/* Contact Info & Form */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">
                Thông tin liên hệ
              </h2>

              <div className="space-y-6">
                {[
                  {
                    icon: <MapPin size={24} />,
                    title: 'Địa chỉ cửa hàng',
                    content: [
                      '123 Đường Nguyễn Huệ, Quận 1, TP.HCM',
                      '456 Đường Hoàn Kiếm, Hà Nội',
                      '789 Đường Hải Châu, Đà Nẵng'
                    ]
                  },
                  {
                    icon: <Phone size={24} />,
                    title: 'Số điện thoại',
                    content: [
                      'Hotline: 1900 1000',
                      'Hỗ trợ khách hàng: 028 3822 1000',
                      'Phòng kinh doanh: 024 3936 1000'
                    ]
                  },
                  {
                    icon: <Mail size={24} />,
                    title: 'Email',
                    content: [
                      'Hỗ trợ khách hàng: support@uniqlo.vn',
                      'Hợp tác kinh doanh: business@uniqlo.vn',
                      'Báo chí: press@uniqlo.vn'
                    ]
                  },
                  {
                    icon: <Clock size={24} />,
                    title: 'Giờ làm việc',
                    content: [
                      'Thứ 2 - Thứ 6: 9:00 - 21:00',
                      'Thứ 7 - Chủ nhật: 9:00 - 22:00',
                      'Hotline: 24/7'
                    ]
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="text-red-600 mt-1">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <div className="space-y-1">
                        {item.content.map((line, idx) => (
                          <p key={idx} className="text-gray-600">
                            {line}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Map */}
              <div className="mt-8">
                <h3 className="font-semibold text-gray-900 mb-4">Bản đồ</h3>
                <div className="relative w-full h-72 rounded-lg overflow-hidden shadow-sm border">
                  <iframe
                    title="Cửa hàng tại Nguyễn Huệ, Quận 1"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.503375623733!2d106.7017551758275!3d10.77204135929512!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3175292f7e2a2d43%3A0x6d0b6c2ef2b83e1b!2zTmd1eeG7hW4gSMawbmc!5e0!3m2!1svi!2svi!4v1734202890000!5m2!1svi!2svi"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <div className="bg-gray-50 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Gửi tin nhắn cho chúng tôi
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Họ và tên *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
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
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="Nhập email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chủ đề *
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                    >
                      <option value="">Chọn chủ đề</option>
                      <option value="product">Thông tin sản phẩm</option>
                      <option value="order">Đơn hàng</option>
                      <option value="return">Đổi trả</option>
                      <option value="complaint">Khiếu nại</option>
                      <option value="suggestion">Góp ý</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tin nhắn *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      placeholder="Nhập nội dung tin nhắn..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Send size={20} />
                    <span>Gửi tin nhắn</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Câu hỏi thường gặp
            </h2>

            <div className="space-y-6">
              {[
                {
                  question: 'Làm thế nào để tôi biết size phù hợp?',
                  answer: 'Bạn có thể tham khảo bảng size chi tiết trên từng trang sản phẩm hoặc đến cửa hàng để thử trực tiếp. Chúng tôi cũng có dịch vụ tư vấn size qua hotline.'
                },
                {
                  question: 'Chính sách đổi trả như thế nào?',
                  answer: 'Bạn có thể đổi trả sản phẩm trong vòng 30 ngày kể từ ngày mua với điều kiện sản phẩm còn nguyên tem mác, chưa qua sử dụng và có hóa đơn mua hàng.'
                },
                {
                  question: 'Thời gian giao hàng bao lâu?',
                  answer: 'Thời gian giao hàng từ 1-3 ngày làm việc tại TP.HCM và Hà Nội, 3-5 ngày làm việc tại các tỉnh thành khác. Miễn phí giao hàng cho đơn từ 500.000đ.'
                },
                {
                  question: 'Tôi có thể thanh toán bằng cách nào?',
                  answer: 'Chúng tôi hỗ trợ thanh toán COD, thẻ tín dụng/ghi nợ, chuyển khoản ngân hàng và các ví điện tử phổ biến như MoMo, ZaloPay.'
                },
                {
                  question: 'Làm sao để theo dõi đơn hàng?',
                  answer: 'Sau khi đặt hàng thành công, bạn sẽ nhận được mã đơn hàng qua email/SMS. Bạn có thể tra cứu tình trạng đơn hàng trên website hoặc liên hệ hotline.'
                }
              ].map((faq, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
