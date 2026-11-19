import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductPriceState } from '../models/product-price.model';

export const selectProductPriceState = createFeatureSelector<ProductPriceState>('productPrices');
export const selectAllProductPrices = createSelector(selectProductPriceState, (state: ProductPriceState) => state.productPrices);
export const selectSelectedProductPrice = createSelector(selectProductPriceState, (state: ProductPriceState) => state.selectedProductPrice);
export const selectProductPricesLoading = createSelector(selectProductPriceState, (state: ProductPriceState) => state.loading);
export const selectProductPricesError = createSelector(selectProductPriceState, (state: ProductPriceState) => state.error);
