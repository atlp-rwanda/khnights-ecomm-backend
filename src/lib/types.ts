import { User } from '../entities/User';

export type Product = {
  id: string;
  vendor: User;
  name: string;
  description: string;
  images: string[];
  newPrice: number;
  oldPrice?: number;
  expirationDate?: Date;
  quantity: number;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
};
