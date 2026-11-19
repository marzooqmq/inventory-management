import { createReducer, on } from '@ngrx/store';
import { ProductPriceState } from '../models/product-price.model';
import * as ProductPriceActions from './product-price.actions';

export const initialState: ProductPriceState = {
  productPrices: [],
  selectedProductPrice: null,
  loading: false,
  error: null
};

export const productPriceReducer = createReducer(
  initialState,
  on(ProductPriceActions.loadProductPrices, (state) => ({ ...state, loading: true, error: null })),
  on(ProductPriceActions.loadProductPricesSuccess, (state, { productPrices }) => ({ ...state, productPrices, loading: false, error: null })),
  on(ProductPriceActions.loadProductPricesFailure, (state, { error }) => ({ ...state, loading: false, error })),
  
  on(ProductPriceActions.loadProductPrice, (state) => ({ ...state, loading: true, error: null })),
  on(ProductPriceActions.loadProductPriceSuccess, (state, { productPrice }) => ({ ...state, selectedProductPrice: productPrice, loading: false, error: null })),
  on(ProductPriceActions.loadProductPriceFailure, (state, { error }) => ({ ...state, loading: false, error })),
  
  on(ProductPriceActions.createProductPrice, (state) => ({ ...state, loading: true, error: null })),
  on(ProductPriceActions.createProductPriceSuccess, (state, { productPrice }) => ({ ...state, productPrices: [...state.productPrices, productPrice], loading: false, error: null })),
  on(ProductPriceActions.createProductPriceFailure, (state, { error }) => ({ ...state, loading: false, error })),
  
  on(ProductPriceActions.updateProductPrice, (state) => ({ ...state, loading: true, error: null })),
  on(ProductPriceActions.updateProductPriceSuccess, (state, { productPrice }) => ({ 
    ...state, 
    productPrices: state.productPrices.map(p => p.id === productPrice.id ? productPrice : p), 
    selectedProductPrice: productPrice, 
    loading: false, 
    error: null 
  })),
  on(ProductPriceActions.updateProductPriceFailure, (state, { error }) => ({ ...state, loading: false, error })),
  
  on(ProductPriceActions.deleteProductPrice, (state) => ({ ...state, loading: true, error: null })),
  on(ProductPriceActions.deleteProductPriceSuccess, (state, { id }) => ({ ...state, productPrices: state.productPrices.filter(p => p.id !== id), loading: false, error: null })),
  on(ProductPriceActions.deleteProductPriceFailure, (state, { error }) => ({ ...state, loading: false, error })),
  
  on(ProductPriceActions.clearSelectedProductPrice, (state) => ({ ...state, selectedProductPrice: null }))
);
