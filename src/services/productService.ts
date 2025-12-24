import { apiFetch } from './apiClient';
import { products as localProducts, Product } from '../data/products';

export type ProductRaw = Product;

export const buildFallbackProducts = (): Product[] =>
  localProducts.map((product, index) => ({
    ...product,
    originalPrice: product.originalPrice ?? null,
    stock: product.stock ?? 40 + (index % 6) * 5,
    soldCount: product.soldCount ?? 80 + index * 3
  }));

export const getProducts = async (): Promise<Product[] | null> => {
  try {
    const payload = await apiFetch('/products');
    return Array.isArray(payload?.data) ? (payload.data as Product[]) : [];
  } catch (e) {
    console.error('getProducts exception', e);
    return null;
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  if (!id) {
    return null;
  }

  try {
    const payload = await apiFetch(`/products/${id}`);
    return payload?.data ?? null;
  } catch (e) {
    console.error('getProductById exception', e);
    return null;
  }
};

export const getRelatedProducts = async (
  category: string,
  excludeId?: string,
  limit = 4
): Promise<Product[]> => {
  if (!category) {
    return [];
  }

  try {
    const params = new URLSearchParams();
    params.set('category', category);
    if (excludeId) params.set('excludeId', excludeId);
    params.set('limit', String(limit));
    const payload = await apiFetch(`/products/related?${params.toString()}`);
    return Array.isArray(payload?.data) ? (payload.data as Product[]) : [];
  } catch (e) {
    console.error('getRelatedProducts exception', e);
    return [];
  }
};

export const createProduct = async (input: Partial<Product>): Promise<Product | null> => {
  try {
    const payload = await apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    return payload?.data ?? null;
  } catch (e) {
    console.error('createProduct exception', e);
    return null;
  }
};

export const updateProduct = async (productId: string, input: Partial<Product>): Promise<Product | null> => {
  try {
    const payload = await apiFetch(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    });
    return payload?.data ?? null;
  } catch (e) {
    console.error('updateProduct exception', e);
    return null;
  }
};

export const uploadProductImage = async (file: File, productId?: string): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    if (productId) {
      formData.append('productId', productId);
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/storage/upload`, {
      method: 'POST',
      body: formData
    });

    const payload = await response.json();
    if (!response.ok || !payload?.success) {
      throw new Error(payload?.error || 'Không th? upload ?nh');
    }

    return payload?.data?.url as string;
  } catch (e) {
    console.error('uploadProductImage error', e);
    if (e instanceof Error) {
      throw e;
    }
    throw new Error('L?i khi upload ?nh s?n ph?m');
  }
};

export const deleteProductImageByUrl = async (url: string): Promise<boolean> => {
  try {
    const payload = await apiFetch('/storage/delete', {
      method: 'DELETE',
      body: JSON.stringify({ url })
    });
    return Boolean(payload?.data?.removed);
  } catch (e) {
    console.error('deleteProductImageByUrl error', e);
    return false;
  }
};
