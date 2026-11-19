export interface BoxRequestDTO {
  productId: number;
  boxCostPerPad: number;
  active: boolean;
}

export interface BoxResponseDTO {
  id: number;
  productId: number;
  productName: string;
  boxCostPerPad: number;
  active: boolean;
}

export interface BoxState {
  boxes: BoxResponseDTO[];
  selectedBox: BoxResponseDTO | null;
  loading: boolean;
  error: string | null;
}
