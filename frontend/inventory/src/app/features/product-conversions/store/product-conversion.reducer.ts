import { createReducer, on } from '@ngrx/store';
import { ProductConversionState } from '../models/product-conversion.model';
import * as ProductConversionActions from './product-conversion.actions';

export const initialState: ProductConversionState = {
  productConversions: [],
  selectedProductConversion: null,
  loading: false,
  error: null
};

export const productConversionReducer = createReducer(
  initialState,
  
  on(ProductConversionActions.loadProductConversions, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductConversionActions.loadProductConversionsSuccess, (state, { productConversions }) => ({
    ...state,
    productConversions,
    loading: false,
    error: null
  })),
  on(ProductConversionActions.loadProductConversionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(ProductConversionActions.loadProductConversion, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductConversionActions.loadProductConversionSuccess, (state, { productConversion }) => ({
    ...state,
    selectedProductConversion: productConversion,
    loading: false,
    error: null
  })),
  on(ProductConversionActions.loadProductConversionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(ProductConversionActions.createProductConversion, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductConversionActions.createProductConversionSuccess, (state, { productConversion }) => ({
    ...state,
    productConversions: [...state.productConversions, productConversion],
    loading: false,
    error: null
  })),
  on(ProductConversionActions.createProductConversionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(ProductConversionActions.updateProductConversion, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductConversionActions.updateProductConversionSuccess, (state, { productConversion }) => ({
    ...state,
    productConversions: state.productConversions.map(pc => pc.id === productConversion.id ? productConversion : pc),
    selectedProductConversion: productConversion,
    loading: false,
    error: null
  })),
  on(ProductConversionActions.updateProductConversionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(ProductConversionActions.deleteProductConversion, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductConversionActions.deleteProductConversionSuccess, (state, { id }) => ({
    ...state,
    productConversions: state.productConversions.filter(pc => pc.id !== id),
    loading: false,
    error: null
  })),
  on(ProductConversionActions.deleteProductConversionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  on(ProductConversionActions.clearSelectedProductConversion, (state) => ({
    ...state,
    selectedProductConversion: null
  }))
);
