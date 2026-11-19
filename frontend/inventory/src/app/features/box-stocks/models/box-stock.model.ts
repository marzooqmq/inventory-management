export interface BoxStockRequestDTO {
  boxId: number;
  quantity: number;
  minStockLevel: number;
}

export interface BoxStockResponseDTO {
  id: number;
  boxId: number;
  productId: number;
  productName: string;
  quantity: number;
  minStockLevel: number;
  lastUpdated: string; // ISO string from backend
}