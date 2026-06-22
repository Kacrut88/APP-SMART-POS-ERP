export interface Product {
  id: number;
  name: string;
  stockIn: number;
  stockOut: number;
  price: number;
}

export interface Transaction {
  id: string;
  date: string;
  type: string;
  desc: string;
  payment: string;
  debit: number;
  credit: number;
  invoice: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}
