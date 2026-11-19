import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProductionCostState } from '../models/production-cost.model';

export const selectProductionCostState = createFeatureSelector<ProductionCostState>('productionCosts');

export const selectAllProductionCosts = createSelector(
  selectProductionCostState,
  (state: ProductionCostState) => state.productionCosts
);

export const selectSelectedProductionCost = createSelector(
  selectProductionCostState,
  (state: ProductionCostState) => state.selectedProductionCost
);

export const selectProductionCostsLoading = createSelector(
  selectProductionCostState,
  (state: ProductionCostState) => state.loading
);

export const selectProductionCostsError = createSelector(
  selectProductionCostState,
  (state: ProductionCostState) => state.error
);
