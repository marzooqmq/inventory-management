// ═══════════════════════════════════════════════════════════════
// SALES REPORT  (GET /sales-reports)
// ═══════════════════════════════════════════════════════════════
export interface SalesReportDTO {
  invoiceNumber: string;
  customerName: string;
  productName: string;
  quantity: number;
  unitType: string;
  quantityInBoxes: number;
  rate: number;
  total: number;
  netAmount: number;
  paidAmount: number;
  paymentStatus: string;
  invoiceDate: string;
}

export interface SalesReportResponse {
  records: SalesReportDTO[];
  totalInvoices: number;
  totalQuantityInBoxes: number;
  grossAmount: number;
  discountAmount: number;
  netAmount: number;
  paidAmount: number;
  balanceAmount: number;
  page: number;
  size: number;
  totalPages: number;
  totalRecords: number;
}

export interface SalesReportFilter {
  startDate?: string;
  endDate?: string;
  month?: number;
  year?: number;
  invoiceNumber?: string;
  customerId?: number;
  productId?: number;
  paymentStatus?: string;
  page: number;
  size: number;
}

// ═══════════════════════════════════════════════════════════════
// COST & PROFIT REPORT  (GET /profit-reports/cost)
// ═══════════════════════════════════════════════════════════════
export interface CostProfitMonthlyDTO {
  productId: number;
  productName: string;
  yearMonth: string;
  producedQty: number;
  soldQty: number;
  revenue: number;
  costPerBox: number;
  totalCost: number;
  profit: number;
  marginPercent: number;
}

export interface ProfitSummary {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  overallMarginPercent: number;
}

export interface CostProfitReportResponse {
  records: CostProfitMonthlyDTO[];
  summary: ProfitSummary;
}

// ═══════════════════════════════════════════════════════════════
// SALES PROFIT REPORT  (GET /profit-reports/sales)
// ═══════════════════════════════════════════════════════════════
export interface SalesProfitMonthlyDTO {
  productId: number;
  productName: string;
  yearMonth: string;
  soldQty: number;
  revenue: number;
  costPerBox: number;
  totalCost: number;
  profit: number;
  marginPercent: number;
}

export interface SalesProfitReportResponse {
  records: SalesProfitMonthlyDTO[];
  summary: ProfitSummary;
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTION EXECUTION REPORT  (GET /production-reports/execution)
// ═══════════════════════════════════════════════════════════════
export interface ProductionExecutionRecordDTO {
  productionOrderId: number;
  productName: string;
  orderQty: number;
  producedQty: number;
  orderStatus: string;
  startDate: string;
  endDate: string;
}

export interface ProductionExecutionReportResponse {
  records: ProductionExecutionRecordDTO[];
  totalOrders: number;
  totalProducedQty: number;
  page: number;
  size: number;
  totalPages: number;
  totalRecords: number;
}

// ═══════════════════════════════════════════════════════════════
// STAGE PROGRESS REPORT  (GET /production-reports/stage-progress)
// ═══════════════════════════════════════════════════════════════
export interface StageProgressDTO {
  stage: string;
  stageStatus: string;
  inputQty: number;
  outputQty: number;
  balanceQty: number;
  executedAt: string;
}

export interface StageProgressOrderDTO {
  productionOrderId: number;
  productName: string;
  stages: StageProgressDTO[];
}

export interface StageProgressResponse {
  records: StageProgressOrderDTO[];
  page: number;
  size: number;
  totalPages: number;
  totalRecords: number;
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTION OUTPUT REPORT  (GET /production-reports/output)
// ═══════════════════════════════════════════════════════════════
export interface ProductionOutputRecordDTO {
  productId: number;
  productName: string;
  boxesProduced: number;
  productionDate: string;
}

export interface ProductionOutputReportResponse {
  records: ProductionOutputRecordDTO[];
  totalProducts: number;
  totalBoxesProduced: number;
  page: number;
  size: number;
  totalPages: number;
  totalRecords: number;
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTION VS SALES  (GET /production-vs-sales)
// ═══════════════════════════════════════════════════════════════
export interface ProductionVsSalesRecordDTO {
  productId: number;
  productName: string;
  producedQty: number;
  soldQty: number;
  closingStock: number;
}

export interface ProductionVsSalesResponse {
  records: ProductionVsSalesRecordDTO[];
  totalProducedQty: number;
  totalSoldQty: number;
  totalClosingStock: number;
}

// ═══════════════════════════════════════════════════════════════
// PRODUCTION VS SALES MONTHLY  (GET /production-vs-sales/monthly)
// ═══════════════════════════════════════════════════════════════
export interface ProductionVsSalesMonthlyRecordDTO {
  productId: number;
  productName: string;
  yearMonth: string;
  producedQty: number;
  soldQty: number;
  netQty: number;
  cumulativeStock: number;
}

export interface ProductionVsSalesProductSummaryDTO {
  productId: number;
  productName: string;
  totalProduced: number;
  totalSold: number;
  stockAvailable: number;
}

export interface ProductionVsSalesMonthlyResponse {
  records: ProductionVsSalesMonthlyRecordDTO[];
  productSummary: ProductionVsSalesProductSummaryDTO[];
  totalProduced: number;
  totalSold: number;
  stockAvailable: number;
}

// ═══════════════════════════════════════════════════════════════
// FINISHED GOODS STOCK REPORT  (GET /finished-stock/report)
// ═══════════════════════════════════════════════════════════════
export interface FinishedGoodsReportRecordDTO {
  productId: number;
  productName: string;
  boxesProduced: number;
  loosePadsProduced: number;
  productionDate: string;
}

export interface FinishedGoodsReportResponse {
  records: FinishedGoodsReportRecordDTO[];
  totalProducts: number;
  totalBoxesProduced: number;
  totalLoosePadsProduced: number;
  page: number;
  size: number;
  totalPages: number;
  totalRecords: number;
}


