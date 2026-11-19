import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductConversionState } from '../models/product-conversion.model';

export const selectProductConversionState = createFeatureSelector<ProductConversionState>('productConversions');

export const selectAllProductConversions = createSelector(
  selectProductConversionState,
  (state: ProductConversionState) => state.productConversions
);

export const selectSelectedProductConversion = createSelector(
  selectProductConversionState,
  (state: ProductConversionState) => state.selectedProductConversion
);

export const selectProductConversionsLoading = createSelector(
  selectProductConversionState,
  (state: ProductConversionState) => state.loading
);

export const selectProductConversionsError = createSelector(
  selectProductConversionState,
  (state: ProductConversionState) => state.error
);
