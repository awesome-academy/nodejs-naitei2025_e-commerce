import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

interface ProductRow {
  id: string;
  name?: string;
  price?: number | string;
  originalprice?: number | string | null;
  originalPrice?: number | string | null;
  category?: string;
  subcategory?: string;
  images?: unknown;
  colors?: unknown;
  sizes?: unknown;
  description?: string;
  features?: unknown;
  isnew?: boolean;
  isNew?: boolean;
  issale?: boolean;
  isSale?: boolean;
  rating?: number | string | null;
  reviewcount?: number | string | null;
  stock?: number | string | null;
  sold_count?: number | string | null;
}

const parseJsonArray = (field: unknown): string[] => {
  if (Array.isArray(field)) {
    return field.map((item) => String(item));
  }

  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
    } catch {
      return [];
    }
  }

  return [];
};

const isValidCategory = (value: unknown): value is 'men' | 'women' | 'kids' =>
  value === 'men' || value === 'women' || value === 'kids';

const mapProductRow = (row: ProductRow) => ({
  id: String(row.id),
  name: row.name ?? '',
  price: typeof row.price === 'number' ? row.price : Number(row.price ?? 0),
  originalPrice:
    row.originalprice !== null && row.originalprice !== undefined
      ? Number(row.originalprice)
      : row.originalPrice !== null && row.originalPrice !== undefined
      ? Number(row.originalPrice)
      : undefined,
  category: isValidCategory(row.category) ? row.category : 'men',
  subcategory: row.subcategory ?? '',
  images: parseJsonArray(row.images),
  colors: parseJsonArray(row.colors),
  sizes: parseJsonArray(row.sizes),
  description: row.description ?? '',
  features: parseJsonArray(row.features),
  isNew: row.isnew ?? row.isNew ?? false,
  isSale: row.issale ?? row.isSale ?? false,
  rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : undefined,
  reviewCount:
    row.reviewcount !== null && row.reviewcount !== undefined ? Number(row.reviewcount) : undefined,
  stock: row.stock !== null && row.stock !== undefined ? Number(row.stock) : undefined,
  soldCount: row.sold_count !== null && row.sold_count !== undefined ? Number(row.sold_count) : undefined
});

@Injectable()
export class ProductsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async getAll() {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    return Array.isArray(data) ? data.map(mapProductRow) : [];
  }

  async getById(id: string) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapProductRow(data as ProductRow) : null;
  }

  async getRelated(category: string, excludeId?: string, limit = 4) {
    const supabase = this.supabaseService.getClient();
    let query = supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .limit(limit);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return Array.isArray(data) ? data.map(mapProductRow) : [];
  }

  async create(payload: Record<string, unknown>) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? mapProductRow(data as ProductRow) : null;
  }

  async update(id: string, payload: Record<string, unknown>) {
    const supabase = this.supabaseService.getClient();
    const { data, error } = await supabase
      .from('products')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? mapProductRow(data as ProductRow) : null;
  }

  async delete(id: string) {
    const supabase = this.supabaseService.getClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
}
