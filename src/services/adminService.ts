import { apiFetch } from './apiClient';
import type { Product } from '../data/products';

export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  totalRevenue: number;
  monthlyGrowth: number;
  pendingOrders: number;
  lowStockItems: number;
  weeklyRevenue: number;
  inventoryValue: number;
  averageOrderValue: number;
}

export interface AdminOrderProduct {
  name: string;
  quantity: number;
  price: number;
}

export interface AdminOrder {
  id: string;
  customer: string;
  email: string;
  total: number;
  status: string;
  date: string;
  items: number;
  paymentMethod: string;
  shippingAddress?: string;
  trackingNumber?: string;
  note?: string;
  source?: string;
  products: AdminOrderProduct[];
}

export interface AdminCustomer {
  id: string;
  originalId?: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  joinDate?: string;
  status: string;
  lastOrderDate?: string;
  averageOrderValue?: number;
  loyaltyPoints?: number;
}

export interface SalesTrendPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

export interface InventoryAlert {
  productId: string;
  name: string;
  stock: number;
  threshold: number;
  soldCount?: number;
}

export interface AdminOverviewResponse {
  stats: AdminStats;
  recentOrders: AdminOrder[];
  customers: AdminCustomer[];
  pendingOrders: AdminOrder[];
  revenueTrend: SalesTrendPoint[];
  inventoryAlerts: InventoryAlert[];
}

export const getAdminOverview = async (): Promise<AdminOverviewResponse> => {
  const payload = await apiFetch('/admin/overview');
  return payload?.data as AdminOverviewResponse;
};

type ProductUpdateFields = Partial<
  Pick<Product, 'name' | 'price' | 'originalPrice' | 'subcategory' | 'category' | 'stock' | 'soldCount' | 'description' | 'colors' | 'sizes' | 'features' | 'isNew' | 'isSale' | 'rating' | 'reviewCount'>
>;
type ProductUpdateFieldsExt = ProductUpdateFields & { images?: string[] };

export const updateProductDetails = async (
  productId: string,
  updates: ProductUpdateFieldsExt,
  _options?: { actorId?: string; stockDelta?: number; reason?: string }
) => {
  const payload = await apiFetch(`/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ ...updates })
  });
  return payload?.data;
};

export const deleteProduct = async (productId: string) => {
  await apiFetch(`/products/${productId}`, {
    method: 'DELETE'
  });
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  actorId?: string,
  note?: string
) => {
  const payload = await apiFetch(`/admin/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, actorId, note })
  });
  return payload?.data as AdminOrder | null;
};

export const getCustomerDetails = async (customerId: string): Promise<{
  customer: AdminCustomer;
  orders: AdminOrder[];
} | null> => {
  const payload = await apiFetch(`/admin/customers/${customerId}`);
  return payload?.data ?? null;
};
