export interface MaterialStockRequestDTO {
  materialId: number;
  quantity: number;
}

export interface MaterialStockResponseDTO {
  id: number;
  materialId: number;
  materialName: string;
  quantity: number;
  lastUpdated?: string | null;
}

export interface MaterialStockState {
  materialStocks: MaterialStockResponseDTO[];
  selectedMaterialStock: MaterialStockResponseDTO | null;
  loading: boolean;
  error: string | null;
}
