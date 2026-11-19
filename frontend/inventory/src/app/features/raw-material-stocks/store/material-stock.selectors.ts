import { createFeatureSelector, createSelector } from '@ngrx/store';
import { MaterialStockState } from '../models/material-stock.model';

export const selectMaterialStockState = createFeatureSelector<MaterialStockState>('materialStock');

export const selectAllMaterialStocks = createSelector(
  selectMaterialStockState,
  (state: MaterialStockState) => state.materialStocks
);

export const selectSelectedMaterialStock = createSelector(
  selectMaterialStockState,
  (state: MaterialStockState) => state.selectedMaterialStock
);

export const selectMaterialStocksLoading = createSelector(
  selectMaterialStockState,
  (state: MaterialStockState) => state.loading
);

export const selectMaterialStocksError = createSelector(
  selectMaterialStockState,
  (state: MaterialStockState) => state.error
);

export const selectMaterialStockById = (id: number) => createSelector(
  selectAllMaterialStocks,
  (materialStocks) => materialStocks.find(ms => ms.id === id)
);
