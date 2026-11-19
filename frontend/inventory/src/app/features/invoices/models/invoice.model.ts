export interface Invoice {
  id?: number;
  invoiceNumber?: string;
  customerId: number;
  customerName?: string;
  phoneNumber?: string;
  totalAmount?: number;
  discount?: number;
  netAmount?: number;
  status?: InvoiceStatus;
  paymentStatus?: PaymentStatus;
  paidAmount?: number;
  invoiceDate?: string;
  items: InvoiceItem[];
}

export interface InvoiceItem {
  productId: number;
  productName?: string;
  quantity: number;
  unitType?: UnitType;
  quantityInBoxes?: number;
  rate?: number;
  total?: number;
}

export interface InvoiceRequestDTO {
  customerId: number;
  items: InvoiceItemRequestDTO[];
}

export interface InvoiceItemRequestDTO {
  productId: number;
  quantity: number;
}

export interface InvoiceResponseDTO {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  phoneNumber: string;
  totalAmount: number;
  discount: number;
  netAmount: number;
  status: string;
  paymentStatus: string;
  paidAmount: number;
  invoiceDate: string;
  items: InvoiceItemResponseDTO[];
}

export interface InvoiceItemResponseDTO {
  productId: number;
  productName: string;
  quantity: number;
  unitType: string;
  quantityInBoxes: number;
  rate: number;
  total: number;
}

export interface InvoicePaymentDTO {
  paidAmount: number;
}

export enum InvoiceStatus {
  CREATED = 'CREATED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PaymentStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID'
}

export enum UnitType {
  BOX = 'BOX',
  CASE = 'CASE'
}

export interface InvoiceState {
  invoices: InvoiceResponseDTO[];
  selectedInvoice: InvoiceResponseDTO | null;
  loading: boolean;
  error: string | null;
}

// Helper interface for product selection in invoice form
export interface ProductSelectionItem {
  productId: number;
  productName: string;
  quantity: number;
  availableStock?: number;
  price?: number;
  total?: number;
}
