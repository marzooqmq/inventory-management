import { createReducer, on } from '@ngrx/store';
import { InvoiceState } from '../models/invoice.model';
import * as InvoiceActions from './invoice.actions';

export const initialState: InvoiceState = {
  invoices: [],
  selectedInvoice: null,
  loading: false,
  error: null
};

export const invoiceReducer = createReducer(
  initialState,

  // Load Invoices
  on(InvoiceActions.loadInvoices, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(InvoiceActions.loadInvoicesSuccess, (state, { invoices }) => ({
    ...state,
    invoices,
    loading: false,
    error: null
  })),

  on(InvoiceActions.loadInvoicesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Invoice
  on(InvoiceActions.loadInvoice, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(InvoiceActions.loadInvoiceSuccess, (state, { invoice }) => ({
    ...state,
    selectedInvoice: invoice,
    loading: false,
    error: null
  })),

  on(InvoiceActions.loadInvoiceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Invoice
  on(InvoiceActions.createInvoice, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(InvoiceActions.createInvoiceSuccess, (state, { invoice }) => ({
    ...state,
    invoices: [invoice, ...state.invoices],
    loading: false,
    error: null
  })),

  on(InvoiceActions.createInvoiceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Cancel Invoice
  on(InvoiceActions.cancelInvoice, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(InvoiceActions.cancelInvoiceSuccess, (state, { id }) => ({
    ...state,
    invoices: state.invoices.map(inv =>
      inv.id === id ? { ...inv, status: 'CANCELLED' } : inv
    ),
    selectedInvoice: state.selectedInvoice?.id === id
      ? { ...state.selectedInvoice, status: 'CANCELLED' }
      : state.selectedInvoice,
    loading: false,
    error: null
  })),

  on(InvoiceActions.cancelInvoiceFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Add Payment
  on(InvoiceActions.addPayment, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(InvoiceActions.addPaymentSuccess, (state, { invoiceId }) => ({
    ...state,
    loading: false,
    error: null
  })),

  on(InvoiceActions.addPaymentFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Download PDF
  on(InvoiceActions.downloadPdf, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(InvoiceActions.downloadPdfSuccess, (state) => ({
    ...state,
    loading: false,
    error: null
  })),

  on(InvoiceActions.downloadPdfFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
