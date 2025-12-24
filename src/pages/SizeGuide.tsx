import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Ruler, User } from 'lucide-react';

const SizeGuide: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('men');
  const [selectedType, setSelectedType] = useState('tops');

  const sizeCharts = {
    men: {
      tops: {
        title: 'Áo Nam (T-shirt, Polo, Sơ mi)',
        headers: ['Size', 'Vai (cm)', 'Ngực (cm)', 'Eo (cm)', 'Dài áo (cm)', 'Tay áo (cm)'],
        data: [
          ['XS', '42', '88', '82', '66', '58'],
          ['S', '44', '92', '86', '68', '60'],
          ['M', '46', '96', '90', '70', '62'],
          ['L', '48', '100', '94', '72', '64'],
          ['XL', '50', '104', '98', '74', '66'],
          ['XXL', '52', '108', '102', '76', '68']
        ]
      },
      bottoms: {
        title: 'Quần Nam (Jean, Kaki, Short)',
        headers: ['Size', 'Eo (cm)', 'Mông (cm)', 'Đùi (cm)', 'Dài quần (cm)', 'Ống quần (cm)'],
        data: [
          ['28', '71', '88', '54', '102', '16'],
          ['29', '74', '91', '55', '104', '16.5'],
          ['30', '76', '94', '56', '106', '17'],
          ['31', '79', '97', '57', '108', '17.5'],
          ['32', '81', '100', '58', '110', '18'],
          ['33', '84', '103', '59', '112', '18.5'],
          ['34', '86', '106', '60', '114', '19']
        ]
      }
    },
    women: {
      tops: {
        title: 'Áo Nữ (Blouse, T-shirt, Cardigan)',
        headers: ['Size', 'Vai (cm)', 'Ngực (cm)', 'Eo (cm)', 'Dài áo (cm)', 'Tay áo (cm)'],
        data: [
          ['XS', '36', '80', '64', '58', '54'],
          ['S', '38', '84', '68', '60', '56'],
          ['M', '40', '88', '72', '62', '58'],
          ['L', '42', '92', '76', '64', '60'],
          ['XL', '44', '96', '80', '66', '62'],
          ['XXL', '46', '100', '84', '68', '64']
        ]
      },
      bottoms: {
        title: 'Quần/Váy Nữ',
        headers: ['Size', 'Eo (cm)', 'Mông (cm)', 'Đùi (cm)', 'Dài (cm)', 'Ống quần (cm)'],
        data: [
          ['XS', '60', '86', '50', '98', '14'],
          ['S', '64', '90', '52', '100', '14.5'],
          ['M', '68', '94', '54', '102', '15'],
          ['L', '72', '98', '56', '104', '15.5'],
          ['XL', '76', '102', '58', '106', '16'],
          ['XXL', '80', '106', '60', '108', '16.5']
        ]
      }
    },
    kids: {
      tops: {
        title: 'Áo Trẻ em',
        headers: ['Size', 'Tuổi', 'Chiều cao (cm)', 'Ngực (cm)', 'Dài áo (cm)'],
        data: [
          ['100', '3-4', '95-105', '56', '38'],
          ['110', '4-5', '105-115', '60', '42'],
          ['120', '5-6', '115-125', '64', '46'],
          ['130', '7-8', '125-135', '68', '50'],
          ['140', '9-10', '135-145', '72', '54'],
          ['150', '11-12', '145-155', '76', '58']
        ]
      },
      bottoms: {
        title: 'Quần Trẻ em',
        headers: ['Size', 'Tuổi', 'Chiều cao (cm)', 'Eo (cm)', 'Dài quần (cm)'],
        data: [
          ['100', '3-4', '95-105', '50', '58'],
          ['110', '4-5', '105-115', '52', '64'],
          ['120', '5-6', '115-125', '54', '70'],
          ['130', '7-8', '125-135', '56', '76'],
          ['140', '9-10', '135-145', '58', '82'],
          ['150', '11-12', '145-155', '60', '88']
        ]
      }
    }
  };

  const currentChart = sizeCharts[selectedCategory as keyof typeof sizeCharts][selectedType as keyof typeof sizeCharts.men];

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-red-600">Trang chủ</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">Hướng dẫn chọn size</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Ruler size={48} className="text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Hướng dẫn chọn size
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Tìm size phù hợp nhất cho bạn với bảng size chi tiết và hướng dẫn đo size chuẩn xác
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Category Selection */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'men', label: 'Nam' },
              { id: 'women', label: 'Nữ' },
              { id: 'kids', label: 'Trẻ em' }
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type Selection */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedType('tops')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'tops'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'text-gray-600 hover:text-gray-900 border border-gray-200'
              }`}
            >
              Áo
            </button>
            <button
              onClick={() => setSelectedType('bottoms')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedType === 'bottoms'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : 'text-gray-600 hover:text-gray-900 border border-gray-200'
              }`}
            >
              {selectedCategory === 'kids' ? 'Quần' : selectedCategory === 'women' ? 'Quần/Váy' : 'Quần'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Size Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {currentChart.title}
                </h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {currentChart.headers.map((header, index) => (
                        <th key={index} className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {currentChart.data.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className={`px-4 py-3 text-sm ${
                            cellIndex === 0 ? 'font-medium text-red-600' : 'text-gray-900'
                          }`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Size Notes */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Lưu ý quan trọng:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Các số đo được tính theo cm và có thể chênh lệch ±1-2cm</li>
                <li>• Nên chọn size lớn hơn nếu bạn thích mặc rộng rãi</li>
                <li>• Với chất liệu co giãn, có thể chọn size vừa hoặc nhỏ hơn</li>
                <li>• Khi phân vân giữa 2 size, nên chọn size lớn hơn</li>
              </ul>
            </div>
          </div>

          {/* Measurement Guide */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <User size={24} className="text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Cách đo size chuẩn
                </h3>
              </div>

              <div className="space-y-6">
                {selectedType === 'tops' ? (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">1. Vai</h4>
                      <p className="text-sm text-gray-600">
                        Đo từ điểm vai này sang điểm vai kia, qua phần lưng
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">2. Ngực</h4>
                      <p className="text-sm text-gray-600">
                        Đo vòng ngực tại điểm rộng nhất, băng đo ngang với mặt đất
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">3. Eo</h4>
                      <p className="text-sm text-gray-600">
                        Đo vòng eo tại điểm nhỏ nhất của thân người
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">4. Dài áo</h4>
                      <p className="text-sm text-gray-600">
                        Đo từ điểm cao nhất của vai xuống gấu áo
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">5. Tay áo</h4>
                      <p className="text-sm text-gray-600">
                        Đo từ điểm vai xuống cổ tay khi tay duỗi thẳng
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">1. Eo</h4>
                      <p className="text-sm text-gray-600">
                        Đo vòng eo tại điểm nhỏ nhất của thân người
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">2. Mông</h4>
                      <p className="text-sm text-gray-600">
                        Đo vòng mông tại điểm rộng nhất
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">3. Đùi</h4>
                      <p className="text-sm text-gray-600">
                        Đo vòng đùi tại điểm rộng nhất của đùi
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">4. Dài quần</h4>
                      <p className="text-sm text-gray-600">
                        Đo từ eo xuống mắt cá chân
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Mẹo đo size:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Đo khi mặc đồ lót thông thường</li>
                  <li>• Giữ thước đo vừa khít, không quá chặt</li>
                  <li>• Đứng thẳng, thở bình thường khi đo</li>
                  <li>• Nhờ người khác hỗ trợ đo để chính xác hơn</li>
                </ul>
              </div>
            </div>

            {/* Contact Support */}
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-medium text-red-900 mb-2">Cần hỗ trợ?</h4>
              <p className="text-sm text-red-800 mb-3">
                Liên hệ với chúng tôi để được tư vấn size miễn phí
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-red-800">📞 Hotline: 1900 1000</p>
                <p className="text-red-800">💬 Chat: Góc phải màn hình</p>
                <p className="text-red-800">📧 Email: support@uniqlo.vn</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;