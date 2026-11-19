import { createReducer, on } from '@ngrx/store';
import { MaterialStockState } from '../models/material-stock.model';
import * as MaterialStockActions from './material-stock.actions';

export const initialState: MaterialStockState = {
  materialStocks: [],
  selectedMaterialStock: null,
  loading: false,
  error: null
};

export const materialStockReducer = createReducer(
  initialState,

  // Load All
  on(MaterialStockActions.loadMaterialStocks, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(MaterialStockActions.loadMaterialStocksSuccess, (state, { materialStocks }) => ({
    ...state,
    materialStocks,
    loading: false,
    error: null
  })),
  on(MaterialStockActions.loadMaterialStocksFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load By ID
  on(MaterialStockActions.loadMaterialStock, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(MaterialStockActions.loadMaterialStockSuccess, (state, { materialStock }) => ({
    ...state,
    selectedMaterialStock: materialStock,
    loading: false,
    error: null
  })),
  on(MaterialStockActions.loadMaterialStockFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create
  on(MaterialStockActions.createMaterialStock, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(MaterialStockActions.createMaterialStockSuccess, (state, { materialStock }) => ({
    ...state,
    materialStocks: [...state.materialStocks, materialStock],
    loading: false,
    error: null
  })),
  on(MaterialStockActions.createMaterialStockFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update
  on(MaterialStockActions.updateMaterialStock, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(MaterialStockActions.updateMaterialStockSuccess, (state, { materialStock }) => ({
    ...state,
    materialStocks: state.materialStocks.map(ms => ms.id === materialStock.id ? materialStock : ms),
    selectedMaterialStock: materialStock,
    loading: false,
    error: null
  })),
  on(MaterialStockActions.updateMaterialStockFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Delete
  on(MaterialStockActions.deleteMaterialStock, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(MaterialStockActions.deleteMaterialStockSuccess, (state, { id }) => ({
    ...state,
    materialStocks: state.materialStocks.filter(ms => ms.id !== id),
    loading: false,
    error: null
  })),
  on(MaterialStockActions.deleteMaterialStockFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Clear Selected
  on(MaterialStockActions.clearSelectedMaterialStock, (state) => ({
    ...state,
    selectedMaterialStock: null
  }))
);
