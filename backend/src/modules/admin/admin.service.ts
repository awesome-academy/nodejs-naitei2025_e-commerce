import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import type { 
  AdminStats, 
  AdminOrder, 
  AdminCustomer, 
  SalesTrendPoint, 
  InventoryAlert, 
  AdminOverviewResponse 
} from './admin.dto';

const LOW_STOCK_THRESHOLD = 15;
const PROGRESS_STATUSES = new Set(['Chờ xử lý', 'Đang chuẩn bị', 'Đang giao']);
const DAYS_IN_TREND = 14;
const MS_IN_DAY = 1000 * 60 * 60 * 24;

@Injectable()
export class AdminService {
  constructor(private readonly supabase: SupabaseService) {}

  private toDateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private buildRevenueTrend(orders: any[]): SalesTrendPoint[] {
    const today = new Date();
    const buckets = new Map<string, SalesTrendPoint>();

    for (let offset = DAYS_IN_TREND - 1; offset >= 0; offset--) {
      const cursor = new Date(today);
      cursor.setDate(today.getDate() - offset);
      const key = this.toDateKey(cursor);
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
      const key = this.toDateKey(orderDate);
      const bucket = buckets.get(key);
      if (!bucket) return;
      bucket.revenue += Number(order.total || 0);
      bucket.orders += 1;
    });

    return Array.from(buckets.values());
  }

  private computeWeeklyRevenue(orders: any[]): number {
    const cutoff = Date.now() - 7 * MS_IN_DAY;
    return orders.reduce((sum, order) => {
      const time = new Date(order.date).getTime();
      if (Number.isNaN(time) || time < cutoff) return sum;
      return sum + Number(order.total || 0);
    }, 0);
  }

  private computeMonthlyGrowth(orders: any[]): number {
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

    if (prev30 === 0) return last30 > 0 ? 100 : 0;
    return Number((((last30 - prev30) / prev30) * 100).toFixed(1));
  }

  private calculateInventoryValue(products: any[]): number {
    return products.reduce((sum, p) => sum + (p.stock ?? 0) * Number(p.price ?? 0), 0);
  }

  private mapOrder(order: any): AdminOrder {
    return {
      id: order.id,
      customer: order.customer_name || 'Khách hàng',
      email: order.customer_email || '',
      total: Number(order.total || 0),
      status: order.status || 'Chờ xử lý',
      date: order.date,
      items: Number(order.items_count || 0),
      paymentMethod: order.payment_method || 'cod',
      shippingAddress: order.shipping_address,
      trackingNumber: order.tracking_number,
      note: order.note || undefined,
      products: Array.isArray(order.order_items)
        ? order.order_items.map((item: any) => ({
            name: item.product_name,
            quantity: item.quantity,
            price: Number(item.price || 0)
          }))
        : []
    };
  }

  private mapCustomer(
    customer: any,
    aggregates: Map<string, { totalOrders: number; totalSpent: number }>
  ): AdminCustomer {
    const stats = aggregates.get(customer.id) || { totalOrders: 0, totalSpent: 0 };
    return {
      id: `CUST${String(customer.id).slice(0, 6)}`,
      name: customer.name || customer.email || 'Khách hàng',
      email: customer.email || '',
      phone: customer.phone,
      totalOrders: stats.totalOrders,
      totalSpent: stats.totalSpent,
      joinDate: customer.join_date,
      status: customer.tier || 'Regular'
    };
  }

  async getOverview(): Promise<AdminOverviewResponse> {
    const [ordersResult, customersResult, productsResult] = await Promise.all([
      this.supabase.getClient()
        .from('orders')
        .select('*, order_items(*)')
        .order('date', { ascending: false }),
      this.supabase.getClient()
        .from('profiles')
        .select('id, name, email, phone, tier, join_date')
        .eq('role', 'customer'),
      this.supabase.getClient()
        .from('products')
        .select('id, name, stock, sold_count, price')
    ]);

    if (ordersResult.error) throw ordersResult.error;
    if (customersResult.error) throw customersResult.error;
    if (productsResult.error) throw productsResult.error;

    const ordersData = ordersResult.data || [];
    const customersData = customersResult.data || [];
    const productsData = productsResult.data || [];

    const recentOrders = ordersData.slice(0, 10).map(order => this.mapOrder(order));

    const pendingOrders = ordersData
      .filter(order => PROGRESS_STATUSES.has(order.status || ''))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
      .map(order => this.mapOrder(order));

    const revenueTrend = this.buildRevenueTrend(ordersData);

    const inventoryAlerts: InventoryAlert[] = productsData
      .filter(p => (p.stock ?? 0) <= LOW_STOCK_THRESHOLD)
      .map(p => ({
        productId: p.id,
        name: p.name,
        stock: Number(p.stock ?? 0),
        threshold: LOW_STOCK_THRESHOLD,
        soldCount: p.sold_count !== null ? Number(p.sold_count) : undefined
      }))
      .sort((a, b) => a.stock - b.stock);

    const orderAggregates = ordersData.reduce((acc, order) => {
      const key = order.user_id || order.customer_email;
      if (!key) return acc;
      const prev = acc.get(key) || { totalOrders: 0, totalSpent: 0 };
      acc.set(key, {
        totalOrders: prev.totalOrders + 1,
        totalSpent: prev.totalSpent + Number(order.total || 0)
      });
      return acc;
    }, new Map<string, { totalOrders: number; totalSpent: number }>());

    const customers = customersData.map(c => this.mapCustomer(c, orderAggregates));

    const totalRevenue = ordersData.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const weeklyRevenue = this.computeWeeklyRevenue(ordersData);
    const monthlyGrowth = this.computeMonthlyGrowth(ordersData);
    const averageOrderValue = ordersData.length ? totalRevenue / ordersData.length : 0;
    const inventoryValue = this.calculateInventoryValue(productsData);

    const stats: AdminStats = {
      totalProducts: productsData.length,
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

  async logActivity(
    actorId: string | undefined,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, unknown>
  ) {
    try {
      await this.supabase.getClient().from('admin_activity_logs').insert({
        actor_id: actorId ?? null,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata
      });
    } catch (error) {
      console.warn('logActivity error', error);
    }
  }

  async updateProduct(
    productId: string,
    updates: any,
    actorId?: string
  ) {
    const payload: any = { ...updates };
    if (updates.originalPrice !== undefined) {
      payload.originalprice = updates.originalPrice;
      delete payload.originalPrice;
    }
    if (updates.soldCount !== undefined) {
      payload.sold_count = updates.soldCount;
      delete payload.soldCount;
    }

    const { data, error } = await this.supabase.getClient()
      .from('products')
      .update(payload)
      .eq('id', productId)
      .select()
      .maybeSingle();

    if (error) throw error;

    await this.logActivity(actorId, 'update_product', 'product', productId, payload);
    return data;
  }

  async deleteProduct(productId: string, actorId?: string) {
    const { error } = await this.supabase.getClient()
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) throw error;
    await this.logActivity(actorId, 'delete_product', 'product', productId);
  }

  async updateOrderStatus(
    orderId: string,
    status: string,
    actorId?: string,
    note?: string
  ) {
    const payload: any = {
      status,
      last_status_change: new Date().toISOString()
    };
    if (note) payload.note = note;

    const { data, error } = await this.supabase.getClient()
      .from('orders')
      .update(payload)
      .eq('id', orderId)
      .select('*, order_items(*)')
      .maybeSingle();

    if (error) throw error;

    await this.logActivity(actorId, 'update_status', 'order', orderId, { status });
    return data ? this.mapOrder(data) : null;
  }
}