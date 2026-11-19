import { createFeatureSelector, createSelector } from '@ngrx/store';
import { InvoiceState } from '../models/invoice.model';

export const selectInvoiceState = createFeatureSelector<InvoiceState>('invoices');

export const selectAllInvoices = createSelector(
  selectInvoiceState,
  (state) => state.invoices
);

export const selectSelectedInvoice = createSelector(
  selectInvoiceState,
  (state) => state.selectedInvoice
);

export const selectInvoicesLoading = createSelector(
  selectInvoiceState,
  (state) => state.loading
);

export const selectInvoicesError = createSelector(
  selectInvoiceState,
  (state) => state.error
);

// Additional selectors
export const selectPendingInvoices = createSelector(
  selectAllInvoices,
  (invoices) => invoices.filter(inv => inv.paymentStatus === 'UNPAID' || inv.paymentStatus === 'PARTIALLY_PAID')
);

export const selectPaidInvoices = createSelector(
  selectAllInvoices,
  (invoices) => invoices.filter(inv => inv.paymentStatus === 'PAID')
);

export const selectActiveInvoices = createSelector(
  selectAllInvoices,
  (invoices) => invoices.filter(inv => inv.status === 'CREATED')
);
