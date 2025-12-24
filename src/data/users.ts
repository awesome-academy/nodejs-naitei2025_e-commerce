export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  address?: string;
  phone?: string;
  role: 'customer';
  orders?: string[]; // danh sách id đơn hàng
}

export const users: User[] = [
  {
    id: 'user-1',
    name: 'Nguyễn Văn A',
    email: 'user1@example.com',
    password: '123456',
    address: '123 Nguyễn Trãi, Hà Nội',
    phone: '0901234567',
    role: 'customer',
    orders: []
  },
  {
    id: 'user-2',
    name: 'Trần Thị B',
    email: 'user2@example.com',
    password: '123456',
    address: '456 Lê Lợi, TP.HCM',
    phone: '0907654321',
    role: 'customer',
    orders: []
  }
];