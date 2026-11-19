export interface DashboardSummary {
  totalProducts: number;
  activeProducts: number;
  totalStockValue: number;
  lowStockItemsCount: number;
  activeProductionOrders: number;
}

export interface StockBreakdown {
  rawMaterialStockValue: number;
  rawMaterialStockCount: number;
  finishedGoodsStockValue: number;
  finishedGoodsStockCount: number;
  boxStockValue: number;
  boxStockCount: number;
}

export interface ProductionDaily {
  productId: number;
  productName: string;
  productCategory: string;
  quantityProduced: number;
  productionDate: string;
}

export interface ProductionStageCount {
  sealingCount: number;
  finalCuttingCount: number;
  foldingCount: number;
  packingCount: number;
  completedCount: number;
  totalActive: number;
}

export interface LowStockItem {
  itemType: string;
  itemId: number;
  itemName: string;
  currentQuantity: number;
  minStockLevel: number;
  stockDeficit: number;
  severity: 'CRITICAL' | 'WARNING' | 'LOW';
  // Enhanced fields for Priority 2
  daysOfSupply?: number;
  actionRequiredBy?: string; // Date when stock hits zero
  suggestedOrderQty?: number;
  dailyConsumption?: number;
}

export interface ProductionTrend {
  date: string;
  totalQuantity: number;
  productWiseQuantity: { [key: string]: number };
}

export interface TopProduct {
  productId: number;
  productName: string;
  stockQuantity: number; // Total pads
  boxQuantity: number;
  loosePads: number;
  stockValue: number;
  transactionCount: number;
}

// New models for Priority 2: Material Consumption & Reorder Intelligence
export interface MaterialConsumption {
  materialId: number;
  materialName: string;
  dailyConsumption: number;
  weeklyConsumption: number;
  currentStock: number;
  daysOfSupply: number;
  unit: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
}

export interface ReorderPoint {
  itemType: 'RAW_MATERIAL' | 'BOX';
  itemId: number;
  itemName: string;
  currentStock: number;
  dailyConsumption: number;
  leadTimeDays: number;
  safetyStock: number;
  reorderPoint: number;
  suggestedOrderQty: number;
  economicOrderQty: number;
  shouldReorderNow: boolean;
  stockoutDate: string;
  unit: string;
}
