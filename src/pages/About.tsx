import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Users, Globe, Heart, Award } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-red-600">Trang chủ</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">Về chúng tôi</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Về UNIQLO Vietnam
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Chúng tôi tin rằng quần áo tốt có thể cải thiện cuộc sống của mọi người. 
              Đó là lý do tại sao chúng tôi tạo ra LifeWear - quần áo chất lượng cao 
              với thiết kế hoàn hảo, được làm cho tất cả mọi người, ở mọi nơi.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Sứ mệnh của chúng tôi
              </h2>
              <p className="text-gray-600 mb-6">
                UNIQLO được thành lập với sứ mệnh tạo ra quần áo thật sự tốt với giá trị 
                tuyệt vời - quần áo có thể cải thiện cuộc sống hàng ngày của mọi người.
              </p>
              <p className="text-gray-600 mb-6">
                Chúng tôi không chỉ đơn thuần là một thương hiệu thời trang. Chúng tôi là 
                một công ty công nghệ với tâm hồn nghệ thuật, luôn đổi mới và cải tiến để 
                mang đến những sản phẩm tốt nhất.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-2xl font-bold text-red-600">20+</h3>
                  <p className="text-gray-600">Năm kinh nghiệm</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-2xl font-bold text-red-600">1000+</h3>
                  <p className="text-gray-600">Cửa hàng toàn cầu</p>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg"
                alt="UNIQLO Mission"
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Giá trị cốt lõi
            </h2>
            <p className="text-gray-600">
              Những giá trị này định hướng mọi hoạt động của chúng tôi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Heart size={40} />,
                title: 'Khách hàng là trung tâm',
                description: 'Chúng tôi luôn đặt nhu cầu và mong muốn của khách hàng lên hàng đầu'
              },
              {
                icon: <Award size={40} />,
                title: 'Chất lượng vượt trội',
                description: 'Cam kết mang đến sản phẩm chất lượng cao với giá cả hợp lý'
              },
              {
                icon: <Users size={40} />,
                title: 'Đội ngũ tận tâm',
                description: 'Nhân viên là tài sản quý giá nhất của chúng tôi'
              },
              {
                icon: <Globe size={40} />,
                title: 'Trách nhiệm xã hội',
                description: 'Cam kết phát triển bền vững và bảo vệ môi trường'
              }
            ].map((value, index) => (
              <div key={index} className="text-center">
                <div className="text-red-600 mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Lịch sử phát triển
            </h2>

            <div className="space-y-12">
              {[
                {
                  year: '1984',
                  title: 'Khởi đầu tại Hiroshima',
                  description: 'UNIQLO được thành lập tại Hiroshima, Nhật Bản với tên gọi ban đầu là "Unique Clothing Warehouse"'
                },
                {
                  year: '2001',
                  title: 'Mở rộng quốc tế',
                  description: 'Cửa hàng UNIQLO đầu tiên tại London mở cửa, đánh dấu bước đi ra thế giới'
                },
                {
                  year: '2019',
                  title: 'Đến Việt Nam',
                  description: 'UNIQLO chính thức có mặt tại Việt Nam với cửa hàng đầu tiên tại TP.HCM'
                },
                {
                  year: '2024',
                  title: 'Phát triển mạnh mẽ',
                  description: 'Hiện tại, UNIQLO đã có nhiều cửa hàng trên toàn quốc và phát triển mạnh mẽ thương mại điện tử'
                }
              ].map((milestone, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-24 h-24 bg-red-600 text-white rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold">{milestone.year}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Trải nghiệm UNIQLO ngay hôm nay
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Khám phá bộ sưu tập LifeWear mới nhất của chúng tôi
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-3 bg-white text-red-600 font-medium rounded-full hover:bg-gray-100 transition-colors"
          >
            Mua sắm ngay
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;