import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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

const dtoToPayload = (dto: CreateProductDto | UpdateProductDto): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};
  
  if ('name' in dto && dto.name !== undefined) payload.name = dto.name;
  if ('price' in dto && dto.price !== undefined) payload.price = dto.price;
  if ('originalPrice' in dto && dto.originalPrice !== undefined) payload.originalprice = dto.originalPrice;
  if ('category' in dto && dto.category !== undefined) payload.category = dto.category;
  if ('subcategory' in dto && dto.subcategory !== undefined) payload.subcategory = dto.subcategory;
  if ('description' in dto && dto.description !== undefined) payload.description = dto.description;
  if ('isNew' in dto && dto.isNew !== undefined) payload.isnew = dto.isNew;
  if ('isSale' in dto && dto.isSale !== undefined) payload.issale = dto.isSale;
  if ('rating' in dto && dto.rating !== undefined) payload.rating = dto.rating;
  if ('reviewCount' in dto && dto.reviewCount !== undefined) payload.reviewcount = dto.reviewCount;
  if ('stock' in dto && dto.stock !== undefined) payload.stock = dto.stock;
  if ('soldCount' in dto && dto.soldCount !== undefined) payload.sold_count = dto.soldCount;
  
  // Convert arrays to JSON strings for PostgreSQL
  if ('images' in dto && dto.images !== undefined) payload.images = JSON.stringify(dto.images);
  if ('colors' in dto && dto.colors !== undefined) payload.colors = JSON.stringify(dto.colors);
  if ('sizes' in dto && dto.sizes !== undefined) payload.sizes = JSON.stringify(dto.sizes);
  if ('features' in dto && dto.features !== undefined) payload.features = JSON.stringify(dto.features);
  
  return payload;
};

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

  async create(dto: CreateProductDto) {
    const supabase = this.supabaseService.getClient();
    const payload = dtoToPayload(dto);
    
    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data ? mapProductRow(data as ProductRow) : null;
  }

  async update(id: string, dto: UpdateProductDto) {
    const supabase = this.supabaseService.getClient();
    const payload = dtoToPayload(dto);
    
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