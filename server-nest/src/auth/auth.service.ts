import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SupabaseService } from '../supabase/supabase.service';

interface ProfileRow {
  id: string;
  email: string;
  name?: string | null;
  phone?: string | null;
  role?: string | null;
  password_hash?: string | null;
  avatar?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService
  ) {}

  private mapUser(profile: ProfileRow) {
    return {
      id: profile.id,
      name: profile.name || profile.email,
      email: profile.email,
      role: profile.role || 'customer',
      avatar: profile.avatar || undefined,
      phone: profile.phone || undefined
    };
  }

  async register(input: { name: string; email: string; password: string; phone?: string }) {
    const supabase = this.supabaseService.getClient();

    const { data: existing } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', input.email)
      .maybeSingle<ProfileRow>();

    if (existing) {
      throw new UnauthorizedException('Email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, 10);
    const payload = {
      email: input.email,
      name: input.name,
      phone: input.phone ?? null,
      role: 'customer',
      password_hash: passwordHash
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert(payload)
      .select('*')
      .single<ProfileRow>();

    if (error || !data) {
      throw new UnauthorizedException(error?.message || 'Unable to create account');
    }

    const token = this.jwtService.sign({
      sub: data.id,
      email: data.email,
      role: data.role || 'customer'
    });

    return { token, user: this.mapUser(data) };
  }

  async login(input: { email: string; password: string }) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', input.email)
      .maybeSingle<ProfileRow>();

    if (error || !data || !data.password_hash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const ok = await bcrypt.compare(input.password, data.password_hash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      sub: data.id,
      email: data.email,
      role: data.role || 'customer'
    });

    return { token, user: this.mapUser(data) };
  }

  async getProfile(userId: string) {
    const supabase = this.supabaseService.getClient();
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle<ProfileRow>();

    if (!data) {
      return null;
    }

    return this.mapUser(data);
  }
}
