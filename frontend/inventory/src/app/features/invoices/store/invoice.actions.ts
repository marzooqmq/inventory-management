import { createAction, props } from '@ngrx/store';
import { InvoiceRequestDTO, InvoiceResponseDTO, InvoicePaymentDTO } from '../models/invoice.model';

// Load Invoices
export const loadInvoices = createAction('[Invoice List] Load Invoices');

export const loadInvoicesSuccess = createAction(
  '[Invoice API] Load Invoices Success',
  props<{ invoices: InvoiceResponseDTO[] }>()
);

export const loadInvoicesFailure = createAction(
  '[Invoice API] Load Invoices Failure',
  props<{ error: string }>()
);

// Load Single Invoice
export const loadInvoice = createAction(
  '[Invoice Detail] Load Invoice',
  props<{ id: number }>()
);

export const loadInvoiceSuccess = createAction(
  '[Invoice API] Load Invoice Success',
  props<{ invoice: InvoiceResponseDTO }>()
);

export const loadInvoiceFailure = createAction(
  '[Invoice API] Load Invoice Failure',
  props<{ error: string }>()
);

// Create Invoice
export const createInvoice = createAction(
  '[Invoice Form] Create Invoice',
  props<{ invoice: InvoiceRequestDTO }>()
);

export const createInvoiceSuccess = createAction(
  '[Invoice API] Create Invoice Success',
  props<{ invoice: InvoiceResponseDTO }>()
);

export const createInvoiceFailure = createAction(
  '[Invoice API] Create Invoice Failure',
  props<{ error: string }>()
);

// Cancel Invoice
export const cancelInvoice = createAction(
  '[Invoice Detail] Cancel Invoice',
  props<{ id: number }>()
);

export const cancelInvoiceSuccess = createAction(
  '[Invoice API] Cancel Invoice Success',
  props<{ id: number }>()
);

export const cancelInvoiceFailure = createAction(
  '[Invoice API] Cancel Invoice Failure',
  props<{ error: string }>()
);

// Add Payment
export const addPayment = createAction(
  '[Invoice Detail] Add Payment',
  props<{ invoiceId: number; payment: InvoicePaymentDTO }>()
);

export const addPaymentSuccess = createAction(
  '[Invoice API] Add Payment Success',
  props<{ invoiceId: number }>()
);

export const addPaymentFailure = createAction(
  '[Invoice API] Add Payment Failure',
  props<{ error: string }>()
);

// Download PDF
export const downloadPdf = createAction(
  '[Invoice Detail] Download PDF',
  props<{ id: number }>()
);

export const downloadPdfSuccess = createAction(
  '[Invoice API] Download PDF Success'
);

export const downloadPdfFailure = createAction(
  '[Invoice API] Download PDF Failure',
  props<{ error: string }>()
);
