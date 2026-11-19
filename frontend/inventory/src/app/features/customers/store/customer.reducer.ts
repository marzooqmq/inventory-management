import { createReducer, on } from '@ngrx/store';
import { CustomerState } from '../models/customer.model';
import * as CustomerActions from './customer.actions';

export const initialState: CustomerState = {
  customers: [],
  selectedCustomer: null,
  loading: false,
  error: null
};

export const customerReducer = createReducer(
  initialState,

  // Load Customers
  on(CustomerActions.loadCustomers, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CustomerActions.loadCustomersSuccess, (state, { customers }) => ({
    ...state,
    customers,
    loading: false,
    error: null
  })),

  on(CustomerActions.loadCustomersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Search Customers
  on(CustomerActions.searchCustomers, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CustomerActions.searchCustomersSuccess, (state, { customers }) => ({
    ...state,
    customers,
    loading: false,
    error: null
  })),

  on(CustomerActions.searchCustomersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Customer
  on(CustomerActions.loadCustomer, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CustomerActions.loadCustomerSuccess, (state, { customer }) => ({
    ...state,
    selectedCustomer: customer,
    loading: false,
    error: null
  })),

  on(CustomerActions.loadCustomerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Customer
  on(CustomerActions.createCustomer, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CustomerActions.createCustomerSuccess, (state, { customer }) => ({
    ...state,
    customers: [...state.customers, customer],
    loading: false,
    error: null
  })),

  on(CustomerActions.createCustomerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Customer
  on(CustomerActions.updateCustomer, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CustomerActions.updateCustomerSuccess, (state, { customer }) => ({
    ...state,
    customers: state.customers.map(c => c.id === customer.id ? customer : c),
    selectedCustomer: customer,
    loading: false,
    error: null
  })),

  on(CustomerActions.updateCustomerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Customer
  on(CustomerActions.deleteCustomer, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(CustomerActions.deleteCustomerSuccess, (state, { id }) => ({
    ...state,
    customers: state.customers.filter(c => c.id !== id),
    loading: false,
    error: null
  })),

  on(CustomerActions.deleteCustomerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
