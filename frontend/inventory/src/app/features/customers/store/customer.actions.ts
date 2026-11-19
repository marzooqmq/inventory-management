import { createAction, props } from '@ngrx/store';
import { CustomerRequestDTO, CustomerResponseDTO } from '../models/customer.model';

// Load Customers
export const loadCustomers = createAction('[Customer List] Load Customers');

export const loadCustomersSuccess = createAction(
  '[Customer API] Load Customers Success',
  props<{ customers: CustomerResponseDTO[] }>()
);

export const loadCustomersFailure = createAction(
  '[Customer API] Load Customers Failure',
  props<{ error: string }>()
);

// Load Single Customer
export const loadCustomer = createAction(
  '[Customer Form] Load Customer',
  props<{ id: number }>()
);

export const loadCustomerSuccess = createAction(
  '[Customer API] Load Customer Success',
  props<{ customer: CustomerResponseDTO }>()
);

export const loadCustomerFailure = createAction(
  '[Customer API] Load Customer Failure',
  props<{ error: string }>()
);

// Search Customers
export const searchCustomers = createAction(
  '[Customer Search] Search Customers',
  props<{ query: string }>()
);

export const searchCustomersSuccess = createAction(
  '[Customer API] Search Customers Success',
  props<{ customers: CustomerResponseDTO[] }>()
);

export const searchCustomersFailure = createAction(
  '[Customer API] Search Customers Failure',
  props<{ error: string }>()
);

// Create Customer
export const createCustomer = createAction(
  '[Customer Form] Create Customer',
  props<{ customer: CustomerRequestDTO }>()
);

export const createCustomerSuccess = createAction(
  '[Customer API] Create Customer Success',
  props<{ customer: CustomerResponseDTO }>()
);

export const createCustomerFailure = createAction(
  '[Customer API] Create Customer Failure',
  props<{ error: string }>()
);

// Update Customer
export const updateCustomer = createAction(
  '[Customer Form] Update Customer',
  props<{ id: number; customer: CustomerRequestDTO }>()
);

export const updateCustomerSuccess = createAction(
  '[Customer API] Update Customer Success',
  props<{ customer: CustomerResponseDTO }>()
);

export const updateCustomerFailure = createAction(
  '[Customer API] Update Customer Failure',
  props<{ error: string }>()
);

// Delete Customer
export const deleteCustomer = createAction(
  '[Customer List] Delete Customer',
  props<{ id: number }>()
);

export const deleteCustomerSuccess = createAction(
  '[Customer API] Delete Customer Success',
  props<{ id: number }>()
);

export const deleteCustomerFailure = createAction(
  '[Customer API] Delete Customer Failure',
  props<{ error: string }>()
);
