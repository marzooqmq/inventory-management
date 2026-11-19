import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BoxStockState } from './box-stock.reducer';

export const selectBoxStockState = createFeatureSelector<BoxStockState>('boxStock');

export const selectAllBoxStocks = createSelector(
  selectBoxStockState,
  (state) => state.boxStocks
);

export const selectSelectedBoxStock = createSelector(
  selectBoxStockState,
  (state) => state.selectedBoxStock
);

export const selectBoxStocksLoading = createSelector(
  selectBoxStockState,
  (state) => state.loading
);

export const selectBoxStocksError = createSelector(
  selectBoxStockState,
  (state) => state.error
);