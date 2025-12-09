export interface Profile {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  loyaltyPoints?: number;
  tier?: string;
  joinDate?: string;
  cart?: any[];
}