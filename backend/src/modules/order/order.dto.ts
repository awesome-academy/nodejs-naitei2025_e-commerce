export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id?: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  paymentMethod?: string;
  status?: string;
  note?: string;
  items: OrderItem[];
  total: number;
  itemsCount?: number;
  date?: string;
}