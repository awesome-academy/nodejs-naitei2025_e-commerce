import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class ProfilesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getProfile(id: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  }

  async updateProfile(id: string, payload: Record<string, unknown>) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async getCart(id: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('cart')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data?.cart ?? [];
  }

  async updateCart(id: string, cart: any[]) {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase
      .from('profiles')
      .update({ cart })
      .eq('id', id);
    if (error) throw error;
    return true;
  }

  async getCustomerDashboard(userId: string) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const supabase = this.supabaseService.getClient();
    const [
      { data: profileData, error: profileError },
      { data: ordersData, error: ordersError }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
      supabase.from('orders').select('*, order_items(*)').eq('user_id', userId).order('date', { ascending: false })
    ]);

    if (profileError) throw profileError;
    if (ordersError) throw ordersError;

    const orders = (ordersData ?? []).map((order: any) => ({
      id: order.id,
      date: order.date,
      status: order.status || 'Chờ xử lý',
      total: Number(order.total || 0),
      items: Number(order.items_count || 0),
      shippingAddress: order.shipping_address,
      paymentMethod: order.payment_method,
      trackingNumber: order.tracking_number,
      products: Array.isArray(order.order_items)
        ? order.order_items.map((item: any) => ({
            name: item.product_name,
            quantity: item.quantity,
            price: Number(item.price || 0)
          }))
        : []
    }));

    const totalSpent = orders.reduce((sum: number, order: any) => sum + Number(order.total || 0), 0);
    const profileRecord = profileData ?? null;

    return {
      profile: {
        id: profileRecord?.id || userId,
        name: profileRecord?.name || profileRecord?.email || 'Khách hàng',
        email: profileRecord?.email || '',
        phone: profileRecord?.phone,
        tier: profileRecord?.tier || 'Regular',
        loyaltyPoints: profileRecord?.loyalty_points || 0,
        totalOrders: orders.length,
        totalSpent,
        joinDate: profileRecord?.join_date
      },
      orders,
      wishlist: profileRecord?.wishlist ?? [],
      addresses: profileRecord?.addresses ?? [],
      paymentMethods: profileRecord?.payment_methods ?? [],
      notifications: profileRecord?.notifications ?? []
    };
  }
}
