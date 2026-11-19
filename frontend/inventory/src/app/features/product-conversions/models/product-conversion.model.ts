export enum UnitType {
  BOX = 'BOX',
  CASE = 'CASE'
}

export interface ProductConversionRequestDTO {
  productId: number;
  unitName: UnitType;
  boxesPerUnit: number;
}

export interface ProductConversionResponseDTO {
  id: number;
  productId: number;
  productName?: string;
  unitName: UnitType;
  boxesPerUnit: number;
}

export interface ProductConversionState {
  productConversions: ProductConversionResponseDTO[];
  selectedProductConversion: ProductConversionResponseDTO | null;
  loading: boolean;
  error: string | null;
}
