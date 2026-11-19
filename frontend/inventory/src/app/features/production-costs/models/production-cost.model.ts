export interface ProductionCostRequestDTO {
  productId: number;
  labourCost: number;
  transportCost: number;
  herbalCost: number;
  machineCost: number;
  overheadCost: number;
}

export interface ProductionCostResponseDTO {
  id: number;
  productId: number;
  productName?: string;
  labourCost: number;
  transportCost: number;
  herbalCost: number;
  machineCost: number;
  overheadCost: number;
  totalCost: number;
}

export interface ProductionCostState {
  productionCosts: ProductionCostResponseDTO[];
  selectedProductionCost: ProductionCostResponseDTO | null;
  loading: boolean;
  error: string | null;
}
