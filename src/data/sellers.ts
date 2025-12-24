import { Product } from './products';

export interface Seller {
  id: string;
  name: string;
  email: string;
  password: string;
  shopName: string;
  phone?: string;
  address?: string;
  role: 'seller';
  products: Product['id'][]; // danh sách ID sản phẩm mà seller sở hữu
}

export const sellers: Seller[] = [
  {
    id: 'seller-1',
    name: 'Cửa hàng Tokyo Style',
    email: 'seller1@example.com',
    password: '123456',
    shopName: 'Tokyo Style',
    phone: '0911222333',
    address: '12 Nguyễn Huệ, TP.HCM',
    role: 'seller',
    products: ['men-tshirt-1', 'men-polo-2', 'men-jean-1']
  },
  {
    id: 'seller-2',
    name: 'Saigon Outfit',
    email: 'seller2@example.com',
    password: '123456',
    shopName: 'Saigon Outfit',
    phone: '0911444555',
    address: '45 Hai Bà Trưng, Hà Nội',
    role: 'seller',
    products: ['men-shirt-2', 'men-tshirt-3', 'men-jean-2']
  }
];
