import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductState } from '../models/product.model';

export const selectProductState = createFeatureSelector<ProductState>('products');

export const selectAllProducts = createSelector(
  selectProductState,
  (state) => state.products
);

export const selectSelectedProduct = createSelector(
  selectProductState,
  (state) => state.selectedProduct
);

export const selectProductsLoading = createSelector(
  selectProductState,
  (state) => state.loading
);

export const selectProductsError = createSelector(
  selectProductState,
  (state) => state.error
);

export const selectProductById = (id: number) => createSelector(
  selectAllProducts,
  (products) => products.find(p => p.id === id)
);

export const selectActiveProducts = createSelector(
  selectAllProducts,
  (products) => products.filter(p => p.active)
);

export const selectProductsByCategory = (category: string) => createSelector(
  selectAllProducts,
  (products) => products.filter(p => p.category === category)
);
