import { apiFetch } from './apiClient';
import type { CartItem } from '../types/cart';

export const fetchRemoteCart = async (userId: string): Promise<CartItem[]> => {
  if (!userId) {
    return [];
  }

  const payload = await apiFetch(`/profiles/${userId}/cart`);
  const data = payload?.data as CartItem[] | undefined;
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data;
};

export const saveRemoteCart = async (userId: string, cart: CartItem[]) => {
  if (!userId) {
    return;
  }

  await apiFetch(`/profiles/${userId}/cart`, {
    method: 'PUT',
    body: JSON.stringify({ cart })
  });
};
