import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

interface OrderItemRow {
  product_name: string;
  quantity: number;
  price: number;
}

interface OrderRow {
  id: string;
  user_id?: string | null;
  customer_name?: string;
  customer_email?: string;
  total?: number;
  status?: string;
  date: string;
  items_count?: number;
  payment_method?: string;
  shipping_address?: string;
  tracking_number?: string;
  note?: string | null;
  source?: string | null;
  metadata?: Record<string, unknown> | null;
  last_status_change?: string | null;
  order_items?: OrderItemRow[];
}

interface CustomerRow {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  tier?: string;
  join_date?: string;
  loyalty_points?: number;
}

interface ProductRow {
  id: string;
  name?: string;
  stock?: number | null;
  sold_count?: number | null;
  price?: number | null;
}

const LOW_STOCK_THRESHOLD = 15;
const PROGRESS_STATUSES = new Set(['cho xu ly', 'dang chuan bi', 'dang giao']);
const DAYS_IN_TREND = 14;
const MS_IN_DAY = 1000 * 60 * 60 * 24;

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

const buildRevenueTrend = (orders: OrderRow[]) => {
  const today = new Date();
  const buckets = new Map<string, { date: string; label: string; revenue: number; orders: number }>();

  for (let offset = DAYS_IN_TREND - 1; offset >= 0; offset -= 1) {
    const cursor = new Date(today);
    cursor.setDate(today.getDate() - offset);
    const key = toDateKey(cursor);
    buckets.set(key, {
      date: key,
      label: cursor.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
      revenue: 0,
      orders: 0
    });
  }

  orders.forEach((order) => {
    const orderDate = new Date(order.date);
    if (Number.isNaN(orderDate.getTime())) return;
    const key = toDateKey(orderDate);
    const bucket = buckets.get(key);
    if (!bucket) return;
    bucket.revenue += Number(order.total || 0);
    bucket.orders += 1;
  });

  return Array.from(buckets.values());
};

const computeWeeklyRevenue = (orders: OrderRow[]) => {
  const cutoff = Date.now() - 7 * MS_IN_DAY;
  return orders.reduce((sum, order) => {
    const time = new Date(order.date).getTime();
    if (Number.isNaN(time) || time < cutoff) {
      return sum;
    }
    return sum + Number(order.total || 0);
  }, 0);
};

const computeMonthlyGrowth = (orders: OrderRow[]) => {
  const now = Date.now();
  const last30Start = now - 30 * MS_IN_DAY;
  const prev30Start = now - 60 * MS_IN_DAY;

  let last30 = 0;
  let prev30 = 0;

  orders.forEach((order) => {
    const time = new Date(order.date).getTime();
    if (Number.isNaN(time)) return;
    const value = Number(order.total || 0);
    if (time >= last30Start) {
      last30 += value;
    } else if (time >= prev30Start && time < last30Start) {
      prev30 += value;
    }
  });

  if (prev30 === 0) {
    return last30 > 0 ? 100 : 0;
  }

  return Number((((last30 - prev30) / prev30) * 100).toFixed(1));
};

const calculateInventoryValue = (products: ProductRow[]) =>
  products.reduce((sum, product) => sum + (product.stock ?? 0) * Number(product.price ?? 0), 0);

const buildInventoryAlerts = (rows: ProductRow[], threshold: number) => {
  return rows
    .filter((item) => (item.stock ?? 0) <= threshold)
    .map((item) => ({
      productId: item.id,
      name: item.name,
      stock: Number(item.stock ?? 0),
      threshold,
      soldCount: item.sold_count !== null && item.sold_count !== undefined ? Number(item.sold_count) : undefined
    }))
    .sort((a, b) => a.stock - b.stock);
};

const mapOrder = (order: OrderRow) => {
  const items = Array.isArray(order.order_items) ? order.order_items : [];
  const itemsCount =
    order.items_count !== null && order.items_count !== undefined
      ? Number(order.items_count)
      : items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const total = Number(order.total ?? 0);
  const date = order.date || order.last_status_change || new Date().toISOString();

  return {
    id: order.id,
    customer: order.customer_name || order.customer_email || 'Khách hàng',
    email: order.customer_email || '',
    total,
    status: order.status || 'Chờ xử lý',
    date,
    items: itemsCount,
    paymentMethod: order.payment_method || 'cod',
    shippingAddress: order.shipping_address,
    trackingNumber: order.tracking_number,
    note: order.note ?? undefined,
    source: order.source ?? undefined,
    products: items.map((item) => ({
      name: item.product_name,
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0)
    }))
  };
};

const normalizeStatus = (value?: string | null) => (value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim();

const mapCustomer = (
  customer: CustomerRow,
  aggregates: Map<string, { totalOrders: number; totalSpent: number; lastOrderDate?: string }>
) => {
  const stats = aggregates.get(customer.id) || { totalOrders: 0, totalSpent: 0 };
  const avgOrderValue = stats.totalOrders > 0 ? stats.totalSpent / stats.totalOrders : 0;
  return {
    id: `CUST${String(customer.id).slice(0, 6)}`,
    originalId: customer.id,
    name: customer.name || customer.email || 'Khách hàng',
    email: customer.email || '',
    phone: customer.phone,
    totalOrders: stats.totalOrders,
    totalSpent: stats.totalSpent,
    joinDate: customer.join_date,
    status: customer.tier || 'Regular',
    lastOrderDate: stats.lastOrderDate,
    averageOrderValue: avgOrderValue,
    loyaltyPoints: customer.loyalty_points
  };
};

@Injectable()
export class AdminService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getOverview() {
    const supabase = this.supabaseService.getClient();

    const [ordersResult, customersResult, productsResult] = await Promise.allSettled([
      supabase.from('orders').select('*, order_items(*)').order('date', { ascending: false }),
      supabase.from('profiles').select('id, name, email, phone, tier, join_date, loyalty_points').eq('role', 'customer'),
      supabase.from('products').select('id, name, stock, sold_count, price').order('stock', { ascending: true })
    ]);

    const ordersData: OrderRow[] =
      ordersResult.status === 'fulfilled' && !ordersResult.value.error
        ? (ordersResult.value.data as OrderRow[]) || []
        : [];
    const customersData: CustomerRow[] =
      customersResult.status === 'fulfilled' && !customersResult.value.error
        ? (customersResult.value.data as CustomerRow[]) || []
        : [];
    const productRows: ProductRow[] =
      productsResult.status === 'fulfilled' && !productsResult.value.error
        ? (productsResult.value.data as ProductRow[]) || []
        : [];

    const recentOrders = ordersData.slice(0, 10).map(mapOrder);

    const pendingOrders = ordersData
      .filter((order) => PROGRESS_STATUSES.has(normalizeStatus(order.status)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
      .map(mapOrder);

    const revenueTrend = buildRevenueTrend(ordersData);
    const inventoryAlerts = buildInventoryAlerts(productRows, LOW_STOCK_THRESHOLD);

    const orderAggregates = ordersData.reduce(
      (acc, order) => {
        const key = order.user_id || order.customer_email;
        if (!key) return acc;
        const prev = acc.get(key) || { totalOrders: 0, totalSpent: 0, lastOrderDate: undefined };
        const orderDate = order.date;
        const isNewer = !prev.lastOrderDate || (orderDate && new Date(orderDate) > new Date(prev.lastOrderDate));
        acc.set(key, {
          totalOrders: prev.totalOrders + 1,
          totalSpent: prev.totalSpent + Number(order.total || 0),
          lastOrderDate: isNewer ? orderDate : prev.lastOrderDate
        });
        return acc;
      },
      new Map<string, { totalOrders: number; totalSpent: number; lastOrderDate?: string }>()
    );

    const customers = customersData
      .map((customer) => mapCustomer(customer, orderAggregates))
      .sort((a, b) => b.totalSpent - a.totalSpent);

    const totalRevenue = ordersData.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const weeklyRevenue = computeWeeklyRevenue(ordersData);
    const monthlyGrowth = computeMonthlyGrowth(ordersData);
    const averageOrderValue = ordersData.length ? totalRevenue / ordersData.length : 0;
    const inventoryValue = calculateInventoryValue(productRows);

    const stats = {
      totalProducts: productRows.length,
      totalOrders: ordersData.length,
      totalCustomers: customersData.length,
      totalRevenue,
      monthlyGrowth,
      pendingOrders: pendingOrders.length,
      lowStockItems: inventoryAlerts.length,
      weeklyRevenue,
      inventoryValue,
      averageOrderValue
    };

    return {
      stats,
      recentOrders,
      customers,
      pendingOrders,
      revenueTrend,
      inventoryAlerts
    };
  }

  async updateOrderStatus(orderId: string, status: string, actorId?: string, note?: string) {
    const supabase = this.supabaseService.getClient();
    const payload: Record<string, unknown> = { status };
    if (note !== undefined) {
      payload.note = note;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(payload)
      .eq('id', orderId)
      .select('*, order_items(*)')
      .maybeSingle();

    if (error) throw error;

    try {
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        status,
        note: note ?? null,
        changed_by: actorId ?? null
      });
    } catch {
      // ignore
    }

    return data ? mapOrder(data as OrderRow) : null;
  }

  async getCustomerDetails(customerId: string) {
    const supabase = this.supabaseService.getClient();
    const customerResponse = await supabase
      .from('profiles')
      .select('id, name, email, phone, tier, join_date, loyalty_points')
      .eq('id', customerId)
      .maybeSingle();

    if (customerResponse.error || !customerResponse.data) {
      return null;
    }

    const customer = customerResponse.data as CustomerRow;

    const ordersResponse = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .or(`user_id.eq.${customerId},customer_email.eq.${customer.email || ''}`)
      .order('date', { ascending: false });

    const ordersData: OrderRow[] = !ordersResponse.error && ordersResponse.data
      ? (ordersResponse.data as OrderRow[])
      : [];

    const orderAggregates = ordersData.reduce(
      (acc, order) => {
        const prev = acc.get(customerId) || { totalOrders: 0, totalSpent: 0, lastOrderDate: undefined };
        const orderDate = order.date;
        const isNewer = !prev.lastOrderDate || (orderDate && new Date(orderDate) > new Date(prev.lastOrderDate));
        acc.set(customerId, {
          totalOrders: prev.totalOrders + 1,
          totalSpent: prev.totalSpent + Number(order.total || 0),
          lastOrderDate: isNewer ? orderDate : prev.lastOrderDate
        });
        return acc;
      },
      new Map<string, { totalOrders: number; totalSpent: number; lastOrderDate?: string }>()
    );

    const customerInfo = mapCustomer(customer, orderAggregates);
    const orders = ordersData.map(mapOrder);

    return {
      customer: customerInfo,
      orders
    };
  }
}


