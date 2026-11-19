export interface Product {
  id?: number;
  name: string;
  category: ProductCategory;
  size: ProductSize;
  description?: string;
  padsPerBox: number;
  mrp?: number;
  costPrice?: number;
  active: boolean;
}

export interface ProductRequestDTO {
  name: string;
  category: ProductCategory;
  size: ProductSize;
  description?: string;
  padsPerBox: number;
  mrp?: number;
  active: boolean;
}

export interface ProductResponseDTO {
  id: number;
  name: string;
  category: string;
  size: string;
  description?: string;
  padsPerBox: number;
  mrp?: number;
  costPrice?: number;
  active: boolean;
  // Cost approval fields
  costDirty?: boolean;
  calculatedCostPrice?: number;
  costCalculatedAt?: string;
}

export enum ProductCategory {
  ULTRA_THIN = 'ULTRA_THIN',
  PREMIUM = 'PREMIUM',
  LINER = 'LINER',
  NA = 'NA'
}

export enum ProductSize {
  XL = 'XL',
  XXL = 'XXL',
  XXXL = 'XXXL',
  NA = 'NA'
}

export interface ProductState {
  products: ProductResponseDTO[];
  selectedProduct: ProductResponseDTO | null;
  loading: boolean;
  error: string | null;
}
