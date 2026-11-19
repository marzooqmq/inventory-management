export interface SalesDashboardKpiDTO {
  todayRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueGrowthPercent: number | null;
  outstandingDues: number;
  totalInvoicesThisMonth: number;
  averageOrderValue: number;
  totalCustomers: number;
}

export interface SalesDashboardMonthlyTrendDTO {
  year: number;
  month: number;
  monthLabel: string;
  revenue: number;
  invoiceCount: number;
}

export interface SalesDashboardPaymentBreakdownDTO {
  paidCount: number;
  partiallyPaidCount: number;
  unpaidCount: number;
  paidAmount: number;
  partiallyPaidAmount: number;
  unpaidAmount: number;
}

export interface SalesDashboardTopCustomerDTO {
  customerId: number;
  customerName: string;
  invoiceCount: number;
  totalRevenue: number;
}

export interface SalesDashboardTopProductDTO {
  productId: number;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface SalesDashboardCustomerTypeDTO {
  distributorRevenue: number;
  dealerRevenue: number;
  directCustomerRevenue: number;
  distributorCount: number;
  dealerCount: number;
  directCustomerCount: number;
}

export interface SalesDashboardDuesAgingDTO {
  days0to30: number;
  days31to60: number;
  days61to90: number;
  days90plus: number;
  count0to30: number;
  count31to60: number;
  count61to90: number;
  count90plus: number;
}

export interface SalesDashboardRecentInvoiceDTO {
  id: number;
  invoiceNumber: string;
  customerName: string;
  netAmount: number;
  paidAmount: number;
  paymentStatus: string;
  invoiceStatus: string;
  invoiceDate: string;
}

export interface SalesDashboardDTO {
  kpiCards: SalesDashboardKpiDTO;
  revenueTrend: SalesDashboardMonthlyTrendDTO[];
  paymentBreakdown: SalesDashboardPaymentBreakdownDTO;
  topCustomers: SalesDashboardTopCustomerDTO[];
  topProducts: SalesDashboardTopProductDTO[];
  customerTypeRevenue: SalesDashboardCustomerTypeDTO;
  duesAging: SalesDashboardDuesAgingDTO;
  recentInvoices: SalesDashboardRecentInvoiceDTO[];
}
