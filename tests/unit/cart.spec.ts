import { cartReducer, initialCartState } from '../../src/contexts/CartContext';
import type { Product } from '../../src/data/products';
import type { CartItem } from '../../src/types/cart';

const sampleProduct: Product = {
  id: 'test-product',
  name: 'Test Product',
  price: 100000,
  category: 'men',
  subcategory: 'T-shirt',
  images: ['img-1'],
  colors: ['Đỏ'],
  sizes: ['M'],
  description: 'Test product',
  features: ['Feature'],
  isNew: false,
  rating: 4,
  reviewCount: 1
};

const sampleItem: CartItem = {
  ...sampleProduct,
  quantity: 1,
  selectedColor: 'Đỏ',
  selectedSize: 'M'
};

describe('Cart reducer', () => {
  it('adds a new item to the cart', () => {
    const next = cartReducer(initialCartState, {
      type: 'ADD_ITEM',
      payload: {
        product: sampleProduct,
        color: 'Đỏ',
        size: 'M',
        quantity: 1
      }
    });

    expect(next.items).toHaveLength(1);
    expect(next.total).toBe(sampleProduct.price);
  });

  it('updates quantity for existing variant', () => {
    const stateWithItem = {
      ...initialCartState,
      items: [{ ...sampleItem }],
      total: sampleItem.price,
      itemCount: 1
    };

    const next = cartReducer(stateWithItem, {
      type: 'UPDATE_QUANTITY',
      payload: {
        id: `${sampleProduct.id}-Đỏ-M`,
        quantity: 3
      }
    });

    expect(next.items[0].quantity).toBe(3);
    expect(next.total).toBe(sampleProduct.price * 3);
  });

  it('clears the cart when requested', () => {
    const populatedState = {
      ...initialCartState,
      items: [{ ...sampleItem }],
      total: sampleItem.price,
      itemCount: 1
    };

    const cleared = cartReducer(populatedState, { type: 'CLEAR_CART' });
    expect(cleared.items).toHaveLength(0);
    expect(cleared.total).toBe(0);
    expect(cleared.itemCount).toBe(0);
  });
});
