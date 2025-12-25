import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

interface OrderItemInput {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

@Injectable()
export class OrdersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private async ensureProductsExist(items: OrderItemInput[]) {
    const ids = Array.from(new Set(items.map((item) => item.productId).filter(Boolean)));
    if (!ids.length) return;

    const supabase = this.supabaseService.getClient();
    const { data: existingProducts, error: selectError } = await supabase
      .from('products')
      .select('id')
      .in('id', ids);

    if (selectError) throw selectError;

    const existingIds = new Set(existingProducts?.map((row) => row.id) ?? []);
    const missingItems = ids
      .filter((id) => !existingIds.has(id))
      .map((id) => {
        const item = items.find((i) => i.productId === id);
        return item
          ? {
              id: item.productId,
              name: item.productName,
              price: item.price
            }
          : null;
      })
      .filter(Boolean) as { id: string; name: string; price: number }[];

    if (!missingItems.length) return;

    const { error: insertError } = await supabase.from('products').insert(missingItems);
    if (insertError) throw insertError;
  }

  async createOrder(input: any) {
    await this.ensureProductsExist(input.items ?? []);

    const supabase = this.supabaseService.getClient();
    let existingOrder: any = null;

    if (input.id) {
      const { data: existing, error: existingError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', input.id)
        .maybeSingle();
      if (existingError) throw existingError;
      existingOrder = existing;
    }

    const resolvedStatus = input.status ?? existingOrder?.status ?? 'Chờ xử lý';

    const payload = {
      id: input.id || existingOrder?.id || undefined,
      user_id: input.userId || null,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      shipping_address: input.shippingAddress,
      payment_method: input.paymentMethod ?? existingOrder?.payment_method ?? 'cod',
      status: resolvedStatus,
      note: input.note ?? existingOrder?.note,
      total: input.total ?? existingOrder?.total ?? 0,
      items_count: (input.items ?? []).reduce((sum: number, item: any) => sum + item.quantity, 0),
      date: existingOrder?.date ?? new Date().toISOString(),
      metadata: existingOrder?.metadata ?? {}
    };

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .upsert(payload, { onConflict: 'id' })
      .select()
      .single();

    if (orderError) throw orderError;

    if (!existingOrder) {
      const orderId = orderData.id;
      const itemsPayload = (input.items ?? []).map((item: any) => ({
        order_id: orderId,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(itemsPayload);
      if (itemsError) {
        await supabase.from('orders').delete().eq('id', orderId);
        throw itemsError;
      }
    }

    return orderData;
  }

  async cancelOrder(orderId: string, userId?: string, note?: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'Đã hủy' })
      .eq('id', orderId)
      .select()
      .maybeSingle();

    if (error) throw error;

    try {
      await supabase.from('order_status_history').insert({
        order_id: orderId,
        status: 'Đã hủy',
        note: note ?? null,
        changed_by: userId ?? null
      });
    } catch {
      // ignore
    }

    return data;
  }

  async getOrderById(orderId: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getOrderHistory(orderId: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('order_status_history')
      .select('*')
      .eq('order_id', orderId)
      .order('changed_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }
}
