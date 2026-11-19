export interface BOMRequestDTO {
  productId: number;
  materialId: number;
  qtyRequired: number;
}

export interface BOMResponseDTO {
  id: number;
  productId: number;
  productName: string;
  materialId: number;
  materialName: string;
  qtyRequired: number;
}

export interface BOMState {
  boms: BOMResponseDTO[];
  selectedBOM: BOMResponseDTO | null;
  loading: boolean;
  error: string | null;
}
