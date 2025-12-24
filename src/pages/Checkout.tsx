import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CreditCard, Truck, MapPin } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { createOrder } from '../services/orderService';
import { useToast } from '../contexts/ToastContext';
import { createVnpayPaymentUrl, VnpayVerifyResult } from '../services/paymentService';

const Checkout: React.FC = () => {
  const { items, total, itemCount, clearCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();
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
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [vnpayNotice, setVnpayNotice] = useState('');
  const [vnpOrderId, setVnpOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name,
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const generateTxnRef = () => {
    const cryptoObj = typeof crypto !== 'undefined' ? crypto : (window as any).crypto;
    if (cryptoObj?.randomUUID) {
      return cryptoObj.randomUUID();
    }
    const randomHex = () => Math.floor(Math.random() * 0xffffffff)
      .toString(16)
      .padStart(8, '0');
    return `${randomHex()}-${randomHex().slice(0, 4)}-${randomHex().slice(0, 4)}-${randomHex().slice(0, 4)}-${randomHex()}`
      .slice(0, 36);
  };

  useEffect(() => {
    const applyVnpayResult = (raw: unknown) => {
      if (!raw || typeof raw !== 'object') {
        return;
      }
      const result = raw as VnpayVerifyResult;
      if (result.orderId) {
        setVnpOrderId(result.orderId);
      }
      setVnpayNotice(
        (result.message || '') +
          (result.amount ? ` — ${formatPrice(result.amount)}` : '')
      );

      if (result.success) {
        setPaymentConfirmed(true);
        setFormData((prev) => ({ ...prev, paymentMethod: 'card' }));
        setStep(3);
        showToast('success', result.message || 'Thanh toán VNPay thành công');
      } else {
        showToast('error', result?.message || 'Thanh toán VNPay không thành công');
      }
    };

    const stored = localStorage.getItem('vnpayLastResult');
    if (stored) {
      try {
        applyVnpayResult(JSON.parse(stored));
      } catch (error) {
        console.warn('Không thể đọc kết quả VNPay từ localStorage', error);
      } finally {
        localStorage.removeItem('vnpayLastResult');
      }
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'vnpayLastResult' && event.newValue) {
        try {
          applyVnpayResult(JSON.parse(event.newValue));
        } catch (error) {
          console.warn('Không thể parse kết quả VNPay', error);
        } finally {
          localStorage.removeItem('vnpayLastResult');
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [showToast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // If user changes payment method, reset payment confirmation
    if (name === 'paymentMethod') {
      setPaymentConfirmed(false);
      setVnpayNotice('');
    }
  };

  const startVnpayPayment = async () => {
    if (paymentProcessing || submitting) {
      return;
    }

    setPaymentProcessing(true);
    setSubmitError('');
    try {
      const txnRef = vnpOrderId || generateTxnRef();
      setVnpOrderId(txnRef);
      const returnUrl = `${window.location.origin}/payment/vnpay-return`;
      const orderInfo =
        formData.notes ||
        (formData.fullName ? `Thanh toán đơn hàng cho ${formData.fullName}` : 'Thanh toán đơn hàng');

      const shippingAddress = [formData.address, formData.ward, formData.district, formData.city]
        .filter(Boolean)
        .join(', ');
      const orderItems = items.map((item) => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const response = await createVnpayPaymentUrl({
        amount: total,
        orderId: txnRef,
        orderInfo,
        locale: 'vn',
        returnUrl,
        order: {
          id: txnRef,
          userId: user?.id ?? null,
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress,
          paymentMethod: 'card',
          status: 'Đang thanh toán',
          note: formData.notes || 'Khởi tạo thanh toán VNPay',
          items: orderItems,
          total
        }
      });

      setVnpayNotice('Đã mở trang thanh toán VNPay trong tab mới. Vui lòng hoàn tất thanh toán.');
      showToast('info', 'Đang chuyển tới VNPay trong tab mới');
      window.open(response.paymentUrl, '_blank', 'noopener');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể khởi tạo thanh toán VNPay';
      setSubmitError(message);
      showToast('error', message);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Nếu đang ở bước 2 và chọn thanh toán bằng thẻ → nếu chưa xác nhận thì mở popup QR,
    // nếu đã xác nhận thì cho phép chuyển sang bước 3
    if (step === 2 && formData.paymentMethod === 'card') {
      if (!paymentConfirmed) {
        await startVnpayPayment();
        return;
      }
      setStep(3);
      return;
    }

    // Nếu không phải thẻ thì tiếp tục như bình thường
    if (step < 3) {
      setStep(step + 1);
      return;
    }


    // If on final step but card payment isn't confirmed, trigger VNPay flow again
    if (step === 3 && formData.paymentMethod === 'card' && !paymentConfirmed) {
      await startVnpayPayment();
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const shippingAddress = [formData.address, formData.ward, formData.district, formData.city]
        .filter(Boolean)
        .join(', ');
      const orderItems = items.map((item) => ({
        productId: item.id,
        productName: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const order = await createOrder({
        id: formData.paymentMethod === 'card' ? (vnpOrderId || generateTxnRef()) : undefined,
        userId: user?.id,
        customerName: formData.fullName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress,
        paymentMethod: formData.paymentMethod,
        status: 'Chờ xử lý',
        note: formData.notes,
        items: orderItems,
        total
      });

      setOrderSuccess(true);
      setCreatedOrderId(order.id);
      clearCart();
      showToast('success', 'Đặt hàng thành công');
    } catch (error) {
      console.error('Tạo đơn hàng thất bại', error);
      let detailMessage = 'Không thể tạo đơn hàng, vui lòng thử lại.';
      if (error instanceof Error && error.message) {
        detailMessage = `Không thể tạo đơn hàng: ${error.message}`;
      } else if (error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string') {
        detailMessage = `Không thể tạo đơn hàng: ${(error as any).message}`;
      }
      setSubmitError(detailMessage);
      showToast('error', detailMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled =
    submitting ||
    (step === 3 && formData.paymentMethod === 'card' && !paymentConfirmed) ||
    (paymentProcessing && step === 2);

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
                {orderSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                    Đặt hàng thành công! Mã đơn hàng: <strong>{createdOrderId}</strong>
                  </div>
                )}

                {submitError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                    {submitError}
                  </div>
                )}
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
                        <h3 className="text-lg font-semibold mb-2">Thanh toán qua VNPay</h3>
                        <p className="text-sm text-gray-600">
                          Chúng tôi sẽ mở trang VNPay trong tab mới để bạn chọn ngân hàng hoặc ví điện tử.
                          Sau khi thanh toán thành công, quay lại tab này để hoàn tất đơn hàng.
                        </p>

                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={startVnpayPayment}
                            disabled={paymentProcessing}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                          >
                            {paymentProcessing ? 'Đang chuyển tới VNPay...' : 'Thanh toán qua VNPay'}
                          </button>
                          {paymentConfirmed && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700">
                              ✔ Đã xác nhận VNPay
                            </span>
                          )}
                        </div>

                        {vnpayNotice && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                            {vnpayNotice}
                          </div>
                        )}

                        <p className="text-sm text-gray-600">
                          Tổng tiền: <span className="font-semibold text-red-600">{formatPrice(total)}</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Nếu đã thanh toán thành công nhưng chưa thấy cập nhật, hãy bấm "Tiếp tục" để đi tới bước xác nhận.
                        </p>
                      </div>
                    )}

                    
                  </div>
                )}

                {/* Step 3: Order Confirmation */}
                {step === 3 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-6">Xác nhận đơn hàng</h2>
                    {paymentConfirmed && (
                      <div className="p-3 bg-green-100 text-green-700 rounded mb-4">
                        ✔ Thanh toán thành công!
                      </div>
                    )}

                    
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
                    disabled={isSubmitDisabled}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors ml-auto disabled:bg-gray-400"
                  >
                    {step === 3 ? (submitting ? 'Đang xử lý...' : 'Đặt hàng') : 'Tiếp tục'}
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
