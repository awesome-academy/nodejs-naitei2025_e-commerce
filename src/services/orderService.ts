import { apiFetch } from './apiClient';

interface OrderItemInput {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CreateOrderInput {
  id?: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod: string;
  status?: string;
  note?: string;
  items: OrderItemInput[];
  total: number;
}

export const createOrder = async (input: CreateOrderInput) => {
  const payload = await apiFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(input)
  });
  return payload?.data;
};

export const cancelOrder = async (orderId: string, userId?: string, note?: string) => {
  const payload = await apiFetch(`/orders/${orderId}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ userId, note })
  });
  return payload?.data;
};

export const getOrderById = async (orderId: string) => {
  const payload = await apiFetch(`/orders/${orderId}`);
  return payload?.data;
};

export const getOrderHistory = async (orderId: string) => {
  const payload = await apiFetch(`/orders/${orderId}/history`);
  return payload?.data;
};
