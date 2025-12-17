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
  products: AdminOrderProduct[];
}

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  joinDate?: string;
  status: string;
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