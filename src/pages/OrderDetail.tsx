import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getOrderById, getOrderHistory } from '../services/orderService';
import { getCustomerDashboard } from '../services/customerService';
import { updateOrderStatus } from '../services/adminService';
import { format as formatPrice } from '../utils/price';
import { formatPaymentMethod } from '../utils/payment';

const OrderDetail: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const ord = await getOrderById(id);
        setOrder(ord);
        const hist = await getOrderHistory(id);
        setHistory(hist || []);
      } catch (err) {
        console.error('getOrderById error', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleStatusChange = async (value: string) => {
    if (!order) return;
    setStatusUpdating(true);
    try {
      await updateOrderStatus(order.id, value, user?.id);
      const ord = await getOrderById(order.id);
      setOrder(ord);
      const hist = await getOrderHistory(order.id);
      setHistory(hist || []);
    } catch (err) {
      console.error('update order status error', err);
      alert('Không thể cập nhật trạng thái: ' + ((err as any)?.message || String(err)));
    } finally {
      setStatusUpdating(false);
    }
  };

  if (loading) return <div>Đang tải đơn hàng...</div>;
  if (!order) return <div>Không tìm thấy đơn hàng.</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white p-6 rounded shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chi tiết đơn hàng #{order.id}</h2>
          <Link to={user ? '/customer' : '/admin'} className="text-sm text-blue-600">Quay lại</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Khách hàng:</strong> {order.customer_name || order.customer}</p>
            <p><strong>Email:</strong> {order.customer_email || order.email}</p>
            <p><strong>Ngày:</strong> {new Date(order.date).toLocaleString('vi-VN')}</p>
            <p><strong>Địa chỉ giao hàng:</strong> {order.shipping_address}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-red-600">{formatPrice(order.total)}</p>
            <p className="text-sm">Thanh toán: {formatPaymentMethod(order.payment_method || order.paymentMethod)}</p>
            <div className="mt-2">
              {user && user.role === 'admin' ? (
                <select value={order.status} disabled={statusUpdating} onChange={(e) => handleStatusChange(e.target.value)} className="border px-2 py-1 rounded">
                  {['Chờ xử lý','Đang chuẩn bị','Đang giao','Đã giao','Đã hủy'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              ) : (
                <span className="px-2 py-1 rounded-full bg-gray-100">{order.status}</span>
              )}
            </div>
          </div>
        </div>

        <h3 className="mt-4 font-semibold">Sản phẩm</h3>
        <div className="space-y-2 mt-2">
            {order.order_items && order.order_items.map((p: any, idx: number) => (
            <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>{p.product_name || p.name} x{p.quantity}</div>
              <div className="font-medium">{formatPrice(p.price)}</div>
            </div>
          ))}
        </div>

        <h3 className="mt-4 font-semibold">Lịch sử trạng thái</h3>
        <div className="mt-2">
          {history.length ? (
            <ul className="space-y-2 text-sm">
              {history.map((h) => (
                <li key={h.id} className="flex justify-between items-start">
                  <div>
                    <div className="text-sm">{h.status}</div>
                    {h.note && <div className="text-xs text-gray-600">{h.note}</div>}
                  </div>
                  <div className="text-xs text-gray-500">{new Date(h.changed_at).toLocaleString('vi-VN')}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">Không có lịch sử.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
