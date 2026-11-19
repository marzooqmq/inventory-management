export interface RawMaterialRequestDTO {
  name: string;
  costPerUnit: number;
  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;
  minStockLevel: number;
  active: boolean;
}

export interface RawMaterialResponseDTO {
  id: number;
  name: string;
  costPerUnit: number;
  purchaseUnit: string;
  consumptionUnit: string;
  conversionFactor: number;
  minStockLevel: number;
  active: boolean;
}

export interface RawMaterialState {
  rawMaterials: RawMaterialResponseDTO[];
  selectedRawMaterial: RawMaterialResponseDTO | null;
  loading: boolean;
  error: string | null;
}
