import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItemDto } from './dto/order-item.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private async ensureProductsExist(items: OrderItemDto[]) {
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

  async createOrder(dto: CreateOrderDto) {
    await this.ensureProductsExist(dto.items ?? []);

    const supabase = this.supabaseService.getClient();
    let existingOrder: any = null;

    if (dto.id) {
      const { data: existing, error: existingError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', dto.id)
        .maybeSingle();
      if (existingError) throw existingError;
      existingOrder = existing;
    }

    const resolvedStatus = dto.status ?? existingOrder?.status ?? 'Chờ xử lý';

    const payload = {
      id: dto.id || existingOrder?.id || undefined,
      user_id: dto.userId || null,
      customer_name: dto.customerName,
      customer_email: dto.customerEmail,
      customer_phone: dto.customerPhone,
      shipping_address: dto.shippingAddress,
      payment_method: dto.paymentMethod ?? existingOrder?.payment_method ?? 'cod',
      status: resolvedStatus,
      note: dto.note ?? existingOrder?.note,
      total: dto.total ?? existingOrder?.total ?? 0,
      items_count: (dto.items ?? []).reduce((sum, item) => sum + item.quantity, 0),
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
      const itemsPayload = (dto.items ?? []).map((item) => ({
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
    } catch (historyError) {
      console.error('Failed to insert order status history:', historyError);
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

  async fetchOrderHistory(orderId: string) {
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