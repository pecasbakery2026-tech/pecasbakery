export type Role = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export type Unit = 'g' | 'kg' | 'pzas' | 'ml' | 'l';

export interface Employee {
  id: string;
  name: string;
  role: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: Unit;
  stock: number;
  minStockAlert: number;
  unitCost: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  estimatedCost: number;
  stock: number;
  status: 'Disponible' | 'Agotado';
  assignedVendor?: string;
  vendorStock?: number;
  image?: string;
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  date: string;
  items: SaleItem[];
  total: number;
  totalCost: number;
  paymentMethod: 'Efectivo' | 'Transferencia' | 'Tarjeta';
  customerType: 'Mostrador' | 'Pedido especial' | 'Evento';
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'Alquiler' | 'Servicios' | 'Transporte' | 'Otros';
}
