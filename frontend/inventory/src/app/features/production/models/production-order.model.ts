export enum ProductionOrderStatus {
  CREATED = 'CREATED',
  SEALING_IN_PROGRESS = 'SEALING_IN_PROGRESS',
  FINAL_CUTTING_IN_PROGRESS = 'FINAL_CUTTING_IN_PROGRESS',
  FOLDING_IN_PROGRESS = 'FOLDING_IN_PROGRESS',
  PACKING_IN_PROGRESS = 'PACKING_IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum ProductionStage {
  SEALING = 'SEALING',
  FINAL_CUTTING = 'FINAL_CUTTING',
  FOLDING = 'FOLDING',
  PACKING = 'PACKING'
}

export enum ProductionStageStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED'
}

export interface ProductionOrder {
  id: number;
  productName: string;
  quantity: number;
  startDate: string;
  endDate?: string;
  status: ProductionOrderStatus;
}

export interface ProductionOrderRequest {
  productId: number;
  quantity: number;
}

export interface ProductionStageExecution {
  id: number;
  productionOrderId: number;
  stage: ProductionStage;
  inputQty: number;
  outputQty: number;
  balanceQty: number;
  status: ProductionStageStatus;
  executedAt: string;
}

export interface ProductionStageRequest {
  productionOrderId: number;
  stage: ProductionStage;
  processQty?: number;
}

export interface Production {
  id: number;
  productionOrderId: number;
  productName: string;
  quantityProduced: number;
  timestamp: string;
}

export interface RawMaterialUsage {
  id: number;
  productionOrderId: number;
  productionProductName: string;
  materialId: number;
  materialName: string;
  qtyUsed: number;
  wastage: number;
  timestamp: string;
}

export interface StageProgress {
  stage: ProductionStage;
  completed: boolean;
  inProgress: boolean;
  inputQty: number;
  outputQty: number;
  balanceQty: number;
  executions: ProductionStageExecution[];
}
