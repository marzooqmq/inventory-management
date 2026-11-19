export interface ProductPriceRequestDTO {
  productId: number;
  customerType: string;
  pricePerBox: number;
}

export interface ProductPriceResponseDTO {
  id: number;
  productId: number;
  productName?: string;
  customerType: string;
  pricePerBox: number;
}

export interface ProductPriceState {
  productPrices: ProductPriceResponseDTO[];
  selectedProductPrice: ProductPriceResponseDTO | null;
  loading: boolean;
  error: string | null;
}

export enum CustomerType {
  DISTRIBUTOR = 'DISTRIBUTOR',
  DEALER = 'DEALER',
  DIRECT_CUSTOMER = 'DIRECT_CUSTOMER'
}
