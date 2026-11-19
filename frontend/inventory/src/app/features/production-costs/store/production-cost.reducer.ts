import { createReducer, on } from '@ngrx/store';
import { ProductionCostState } from '../models/production-cost.model';
import * as ProductionCostActions from './production-cost.actions';

export const initialState: ProductionCostState = {
  productionCosts: [],
  selectedProductionCost: null,
  loading: false,
  error: null
};

export const productionCostReducer = createReducer(
  initialState,
  
  // Load Production Costs
  on(ProductionCostActions.loadProductionCosts, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductionCostActions.loadProductionCostsSuccess, (state, { productionCosts }) => ({
    ...state,
    productionCosts,
    loading: false,
    error: null
  })),
  on(ProductionCostActions.loadProductionCostsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Production Cost
  on(ProductionCostActions.loadProductionCost, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductionCostActions.loadProductionCostSuccess, (state, { productionCost }) => ({
    ...state,
    selectedProductionCost: productionCost,
    loading: false,
    error: null
  })),
  on(ProductionCostActions.loadProductionCostFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Production Cost
  on(ProductionCostActions.createProductionCost, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductionCostActions.createProductionCostSuccess, (state, { productionCost }) => ({
    ...state,
    productionCosts: [...state.productionCosts, productionCost],
    loading: false,
    error: null
  })),
  on(ProductionCostActions.createProductionCostFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Production Cost
  on(ProductionCostActions.updateProductionCost, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductionCostActions.updateProductionCostSuccess, (state, { productionCost }) => ({
    ...state,
    productionCosts: state.productionCosts.map(pc => pc.id === productionCost.id ? productionCost : pc),
    selectedProductionCost: productionCost,
    loading: false,
    error: null
  })),
  on(ProductionCostActions.updateProductionCostFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Production Cost
  on(ProductionCostActions.deleteProductionCost, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ProductionCostActions.deleteProductionCostSuccess, (state, { id }) => ({
    ...state,
    productionCosts: state.productionCosts.filter(pc => pc.id !== id),
    loading: false,
    error: null
  })),
  on(ProductionCostActions.deleteProductionCostFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Clear Selected Production Cost
  on(ProductionCostActions.clearSelectedProductionCost, (state) => ({
    ...state,
    selectedProductionCost: null
  }))
);
