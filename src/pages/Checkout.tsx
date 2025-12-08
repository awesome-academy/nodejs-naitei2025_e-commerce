import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CreditCard, Truck, MapPin, Phone, Mail } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Checkout: React.FC = () => {
  const { items, total, itemCount } = useCart();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Shipping Info
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    ward: '',
    // Payment Info
    paymentMethod: 'cod',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    // Order Notes
    notes: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Process order
      alert('Đặt hàng thành công!');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Giỏ hàng trống
          </h2>
          <p className="text-gray-600 mb-6">
            Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán
          </p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-red-600">Trang chủ</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <Link to="/cart" className="text-gray-600 hover:text-red-600">Giỏ hàng</Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">Thanh toán</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: 1, title: 'Thông tin giao hàng', icon: MapPin },
              { step: 2, title: 'Phương thức thanh toán', icon: CreditCard },
              { step: 3, title: 'Xác nhận đơn hàng', icon: Truck }
            ].map((item) => (
              <div key={item.step} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step >= item.step ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  <item.icon size={20} />
                </div>
                <span className={`ml-2 font-medium ${
                  step >= item.step ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Shipping Information */}
                {step === 1 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Thông tin giao hàng</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Họ và tên *
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                    </div>

                    <div className="mb-4">
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
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        placeholder="Số nhà, tên đường"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tỉnh/Thành phố *
                        </label>
                        <select
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        >
                          <option value="">Chọn tỉnh/thành</option>
                          <option value="ho-chi-minh">TP. Hồ Chí Minh</option>
                          <option value="ha-noi">Hà Nội</option>
                          <option value="da-nang">Đà Nẵng</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quận/Huyện *
                        </label>
                        <select
                          name="district"
                          value={formData.district}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        >
                          <option value="">Chọn quận/huyện</option>
                          <option value="quan-1">Quận 1</option>
                          <option value="quan-2">Quận 2</option>
                          <option value="quan-3">Quận 3</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phường/Xã *
                        </label>
                        <select
                          name="ward"
                          value={formData.ward}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        >
                          <option value="">Chọn phường/xã</option>
                          <option value="phuong-1">Phường 1</option>
                          <option value="phuong-2">Phường 2</option>
                          <option value="phuong-3">Phường 3</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment Method */}
                {step === 2 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Phương thức thanh toán</h2>
                    
                    <div className="space-y-4 mb-6">
                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={formData.paymentMethod === 'cod'}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          <Truck className="mr-3 text-red-600" size={24} />
                          <div>
                            <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                            <div className="text-sm text-gray-600">Thanh toán bằng tiền mặt khi nhận hàng</div>
                          </div>
                        </div>
                      </label>

                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="card"
                          checked={formData.paymentMethod === 'card'}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          <CreditCard className="mr-3 text-red-600" size={24} />
                          <div>
                            <div className="font-medium">Thẻ tín dụng/ghi nợ</div>
                            <div className="text-sm text-gray-600">Visa, Mastercard, JCB</div>
                          </div>
                        </div>
                      </label>
                    </div>

                    {formData.paymentMethod === 'card' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Số thẻ *
                          </label>
                          <input
                            type="text"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleInputChange}
                            placeholder="1234 5678 9012 3456"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tên trên thẻ *
                          </label>
                          <input
                            type="text"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Ngày hết hạn *
                            </label>
                            <input
                              type="text"
                              name="expiryDate"
                              value={formData.expiryDate}
                              onChange={handleInputChange}
                              placeholder="MM/YY"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              CVV *
                            </label>
                            <input
                              type="text"
                              name="cvv"
                              value={formData.cvv}
                              onChange={handleInputChange}
                              placeholder="123"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Order Confirmation */}
                {step === 3 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Xác nhận đơn hàng</h2>
                    
                    <div className="space-y-6">
                      {/* Shipping Info */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium mb-2">Thông tin giao hàng</h3>
                        <p className="text-sm text-gray-600">
                          {formData.fullName}<br />
                          {formData.phone}<br />
                          {formData.email}<br />
                          {formData.address}, {formData.ward}, {formData.district}, {formData.city}
                        </p>
                      </div>

                      {/* Payment Info */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium mb-2">Phương thức thanh toán</h3>
                        <p className="text-sm text-gray-600">
                          {formData.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : 'Thẻ tín dụng/ghi nợ'}
                        </p>
                      </div>

                      {/* Order Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ghi chú đơn hàng
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Ghi chú thêm cho đơn hàng (tùy chọn)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Quay lại
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ml-auto"
                  >
                    {step === 3 ? 'Đặt hàng' : 'Tiếp tục'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>
              
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}`} className="flex items-center space-x-3">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-600">
                        {item.selectedColor} - {item.selectedSize} x{item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-red-600">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính ({itemCount} sản phẩm)</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Phí vận chuyển</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-red-600 border-t pt-2">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;