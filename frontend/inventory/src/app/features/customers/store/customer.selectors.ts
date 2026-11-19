import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CustomerState } from '../models/customer.model';

export const selectCustomerState = createFeatureSelector<CustomerState>('customers');

export const selectAllCustomers = createSelector(
  selectCustomerState,
  (state) => state.customers
);

export const selectSelectedCustomer = createSelector(
  selectCustomerState,
  (state) => state.selectedCustomer
);

export const selectCustomersLoading = createSelector(
  selectCustomerState,
  (state) => state.loading
);

export const selectCustomersError = createSelector(
  selectCustomerState,
  (state) => state.error
);
