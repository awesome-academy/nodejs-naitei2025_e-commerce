import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';
import { verifyVnpayReturn, VnpayVerifyResult } from '../services/paymentService';

const formatCurrency = (value?: number) => {
  if (!value || Number.isNaN(value)) return '';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value);
};

const VnpayReturn: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Đang xác thực thanh toán...');
  const [result, setResult] = useState<VnpayVerifyResult | null>(null);

  useEffect(() => {
    const queryString = location.search.startsWith('?')
      ? location.search.slice(1)
      : location.search;

    if (!queryString) {
      setStatus('error');
      setMessage('Thiếu tham số thanh toán từ VNPay');
      return;
    }

    (async () => {
      try {
        const verifyResult = await verifyVnpayReturn(queryString);
        setResult(verifyResult);
        setStatus(verifyResult.success ? 'success' : 'error');
        setMessage(
          verifyResult.message ||
            (verifyResult.success ? 'Thanh toán thành công' : 'Thanh toán thất bại')
        );

        localStorage.setItem('vnpayLastResult', JSON.stringify(verifyResult));
        showToast(
          verifyResult.success ? 'success' : 'error',
          verifyResult.message ||
            (verifyResult.success ? 'Thanh toán VNPay thành công' : 'Thanh toán VNPay thất bại')
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Không thể xác thực kết quả thanh toán';
        setStatus('error');
        setMessage(errorMessage);
        localStorage.setItem(
          'vnpayLastResult',
          JSON.stringify({ success: false, message: errorMessage })
        );
        showToast('error', errorMessage);
      }
    })();
  }, [location.search, showToast]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white shadow-sm rounded-lg p-6 max-w-lg w-full text-center">
        <h1 className="text-2xl font-semibold mb-2">Kết quả thanh toán VNPay</h1>
        <p className="text-gray-600 mb-4">{message}</p>

        {status !== 'pending' && (
          <div
            className={`inline-block px-3 py-1 rounded-full text-sm mb-4 ${
              status === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {status === 'success' ? 'Thành công' : 'Không thành công'}
          </div>
        )}

        {result && (
          <div className="text-left bg-gray-50 border rounded-lg p-4 space-y-2 mb-6">
            <div className="flex justify-between text-sm text-gray-700">
              <span>Mã giao dịch:</span>
              <span className="font-medium">{result.orderId || '-'}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Số tiền:</span>
              <span className="font-medium">{formatCurrency(result.amount)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Ngân hàng:</span>
              <span className="font-medium">{result.bankCode || 'Không xác định'}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-700">
              <span>Mã phản hồi:</span>
              <span className="font-medium">{result.code || '-'}</span>
            </div>
            {result.transactionNo && (
              <div className="flex justify-between text-sm text-gray-700">
                <span>Mã giao dịch ngân hàng:</span>
                <span className="font-medium">{result.transactionNo}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-3 space-y-3 sm:space-y-0">
          <button
            onClick={() => navigate('/checkout')}
            className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            Quay lại thanh toán
          </button>
          <Link
            to="/"
            className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VnpayReturn;
