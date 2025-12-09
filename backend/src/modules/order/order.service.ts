import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Order, OrderItem } from './order.dto';


@Injectable()
export class OrderService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<Order[]> {
    const { data, error } = await this.supabase.getClient()
      .from('orders')
      .select('*');
    if (error) throw error;
    return data;
  }

  async findOne(id: string): Promise<Order | null> {
    const { data, error } = await this.supabase.getClient()
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async create(order: Order): Promise<Order> {
    const payload = {
      user_id: order.userId || null,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      customer_phone: order.customerPhone,
      shipping_address: order.shippingAddress,
      payment_method: order.paymentMethod,
      status: order.status || 'Chờ xử lý',
      note: order.note,
      total: order.total,
      items_count: Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0,
      date: new Date().toISOString(),
    };

    const { data: orderData, error: orderError } = await this.supabase.getClient()
      .from('orders')
      .insert(payload)
      .select()
      .single();
    if (orderError) throw orderError;

    // Insert order items (nếu có bảng order_items)
    if (Array.isArray(order.items) && orderData?.id) {
      const itemsPayload = order.items.map((item) => ({
        order_id: orderData.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        price: item.price,
      }));
      const { error: itemsError } = await this.supabase.getClient()
        .from('order_items')
        .insert(itemsPayload);
      if (itemsError) throw itemsError;
    }

    return orderData;
  }

  async update(id: string, order: Partial<Order>): Promise<Order> {
    // Chuyển đổi các trường sang snake_case nếu có
    const payload: any = {};
    if (order.userId !== undefined) payload.user_id = order.userId;
    if (order.customerName !== undefined) payload.customer_name = order.customerName;
    if (order.customerEmail !== undefined) payload.customer_email = order.customerEmail;
    if (order.customerPhone !== undefined) payload.customer_phone = order.customerPhone;
    if (order.shippingAddress !== undefined) payload.shipping_address = order.shippingAddress;
    if (order.paymentMethod !== undefined) payload.payment_method = order.paymentMethod;
    if (order.status !== undefined) payload.status = order.status;
    if (order.note !== undefined) payload.note = order.note;
    if (order.total !== undefined) payload.total = order.total;
    if (order.items !== undefined) payload.items_count = Array.isArray(order.items) ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
    if (order.date !== undefined) payload.date = order.date;

    const { data, error } = await this.supabase.getClient()
      .from('orders')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase.getClient()
      .from('orders')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}