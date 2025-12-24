import React, { createContext, useContext, useReducer, ReactNode, useEffect, useState } from 'react';
import { Product } from '../data/products';
import { useAuth } from './AuthContext';
import type { CartItem } from '../types/cart';
import { fetchRemoteCart, saveRemoteCart } from '../services/cartService';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; color: string; size: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'CLEAR_CART' };

export const initialCartState: CartState = {
  items: [],
  total: 0,
  itemCount: 0
};

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, color, size, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.id === product.id && item.selectedColor === color && item.selectedSize === size
      );

      let newItems;
      if (existingItemIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          ...product,
          quantity,
          selectedColor: color,
          selectedSize: size
        };
        newItems = [...state.items, newItem];
      }

      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => 
        `${item.id}-${item.selectedColor}-${item.selectedSize}` !== action.payload
      );
      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        `${item.id}-${item.selectedColor}-${item.selectedSize}` === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);

      const total = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = newItems.reduce((count, item) => count + item.quantity, 0);

      return { items: newItems, total, itemCount };
    }

    case 'SET_CART': {
      const total = action.payload.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const itemCount = action.payload.reduce((count, item) => count + item.quantity, 0);
      return {
        items: action.payload,
        total,
        itemCount
      };
    }

    case 'CLEAR_CART': {
      return initialCartState;
    }

    default:
      return state;
  }
}

interface CartContextType extends CartState {
  addItem: (product: Product, color: string, size: string, quantity: number) => void;
  removeItem: (id: string, color: string, size: string) => void;
  updateQuantity: (id: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);
  const { user } = useAuth();
  const [hasHydrated, setHasHydrated] = useState(false);

  const addItem = (product: Product, color: string, size: string, quantity: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, color, size, quantity } });
  };

  const removeItem = (id: string, color: string, size: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: `${id}-${color}-${size}` });
  };

  const updateQuantity = (id: string, color: string, size: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id: `${id}-${color}-${size}`, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      dispatch({ type: 'SET_CART', payload: [] });
      setHasHydrated(true);
      return () => {
        isMounted = false;
      };
    }

    setHasHydrated(false);
    (async () => {
      try {
        const remoteCart = await fetchRemoteCart(user.id);
        if (isMounted) {
          dispatch({ type: 'SET_CART', payload: remoteCart });
        }
      } catch (error) {
        console.error('Không thể tải giỏ hàng từ Supabase', error);
      } finally {
        if (isMounted) {
          setHasHydrated(true);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !hasHydrated) {
      return;
    }

    saveRemoteCart(user.id, state.items).catch((error) =>
      console.error('Không thể đồng bộ giỏ hàng lên Supabase', error)
    );
  }, [user, state.items, hasHydrated]);

  const value: CartContextType = {
    ...state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
