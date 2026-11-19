import { createAction, props } from '@ngrx/store';
import { ProductionCostRequestDTO, ProductionCostResponseDTO } from '../models/production-cost.model';

// Load Production Costs
export const loadProductionCosts = createAction('[Production Cost List] Load Production Costs');
export const loadProductionCostsSuccess = createAction(
  '[Production Cost API] Load Production Costs Success',
  props<{ productionCosts: ProductionCostResponseDTO[] }>()
);
export const loadProductionCostsFailure = createAction(
  '[Production Cost API] Load Production Costs Failure',
  props<{ error: string }>()
);

// Load Single Production Cost
export const loadProductionCost = createAction(
  '[Production Cost Form] Load Production Cost',
  props<{ id: number }>()
);
export const loadProductionCostSuccess = createAction(
  '[Production Cost API] Load Production Cost Success',
  props<{ productionCost: ProductionCostResponseDTO }>()
);
export const loadProductionCostFailure = createAction(
  '[Production Cost API] Load Production Cost Failure',
  props<{ error: string }>()
);

// Create Production Cost
export const createProductionCost = createAction(
  '[Production Cost Form] Create Production Cost',
  props<{ productionCost: ProductionCostRequestDTO }>()
);
export const createProductionCostSuccess = createAction(
  '[Production Cost API] Create Production Cost Success',
  props<{ productionCost: ProductionCostResponseDTO }>()
);
export const createProductionCostFailure = createAction(
  '[Production Cost API] Create Production Cost Failure',
  props<{ error: string }>()
);

// Update Production Cost
export const updateProductionCost = createAction(
  '[Production Cost Form] Update Production Cost',
  props<{ id: number; productionCost: ProductionCostRequestDTO }>()
);
export const updateProductionCostSuccess = createAction(
  '[Production Cost API] Update Production Cost Success',
  props<{ productionCost: ProductionCostResponseDTO }>()
);
export const updateProductionCostFailure = createAction(
  '[Production Cost API] Update Production Cost Failure',
  props<{ error: string }>()
);

// Delete Production Cost
export const deleteProductionCost = createAction(
  '[Production Cost List] Delete Production Cost',
  props<{ id: number }>()
);
export const deleteProductionCostSuccess = createAction(
  '[Production Cost API] Delete Production Cost Success',
  props<{ id: number }>()
);
export const deleteProductionCostFailure = createAction(
  '[Production Cost API] Delete Production Cost Failure',
  props<{ error: string }>()
);

// Clear Selected Production Cost
export const clearSelectedProductionCost = createAction('[Production Cost Form] Clear Selected Production Cost');
