import { Product } from '../data/products';

export interface CartItem extends Product {
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}
