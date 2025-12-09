import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { Profile } from './profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly supabase: SupabaseService) {}

  async findAll(): Promise<Profile[]> {
    const { data, error } = await this.supabase.getClient()
      .from('profiles')
      .select('*');
    if (error) throw error;
    return data;
  }

  async findOne(id: string): Promise<Profile | null> {
    const { data, error } = await this.supabase.getClient()
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(profile: Profile): Promise<Profile> {
    // Chuyển đổi sang snake_case nếu cần
    const payload = {
      ...profile,
      loyalty_points: profile.loyaltyPoints,
      join_date: profile.joinDate,
    };
    const { data, error } = await this.supabase.getClient()
      .from('profiles')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async update(id: string, profile: Partial<Profile>): Promise<Profile | null> {
    const payload: any = {};
    if (profile.name !== undefined) payload.name = profile.name;
    if (profile.email !== undefined) payload.email = profile.email;
    if (profile.phone !== undefined) payload.phone = profile.phone;
    if (profile.role !== undefined) payload.role = profile.role;
    if (profile.loyaltyPoints !== undefined) payload.loyalty_points = profile.loyaltyPoints;
    if (profile.tier !== undefined) payload.tier = profile.tier;
    if (profile.joinDate !== undefined) payload.join_date = profile.joinDate;
    if (profile.cart !== undefined) payload.cart = profile.cart;

    const { data, error } = await this.supabase.getClient()
      .from('profiles')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async remove(id: string): Promise<void> {
    const { error } = await this.supabase.getClient()
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }
}