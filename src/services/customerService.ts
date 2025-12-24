import { apiFetch } from './apiClient';

export interface CustomerOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface CustomerOrder {
  id: string;
  date: string;
  status: string;
  total: number;
  items: number;
  products: CustomerOrderItem[];
  shippingAddress?: string;
  paymentMethod?: string;
  trackingNumber?: string;
}

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  inStock: boolean;
  rating?: number;
}

export interface Address {
  id: number;
  name: string;
  fullName: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: number;
  type: string;
  name: string;
  details: string;
  expiry?: string;
  isDefault: boolean;
}

export interface DashboardNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  tier: string;
  loyaltyPoints: number;
  totalOrders: number;
  totalSpent: number;
  joinDate?: string;
}

export interface CustomerDashboardResponse {
  profile: CustomerProfile;
  orders: CustomerOrder[];
  wishlist: WishlistItem[];
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  notifications: DashboardNotification[];
}

export const getCustomerDashboard = async (userId: string): Promise<CustomerDashboardResponse> => {
  if (!userId) {
    throw new Error('User ID is required to load dashboard');
  }

  const payload = await apiFetch(`/customers/${userId}/dashboard`);
  return payload?.data as CustomerDashboardResponse;
};
