import { createReducer, on } from '@ngrx/store';
import * as BoxStockActions from './box-stock.actions';
import { BoxStockResponseDTO } from '../models/box-stock.model';

export interface BoxStockState {
  boxStocks: BoxStockResponseDTO[];
  selectedBoxStock: BoxStockResponseDTO | null;
  loading: boolean;
  error: any;
}

export const initialState: BoxStockState = {
  boxStocks: [],
  selectedBoxStock: null,
  loading: false,
  error: null,
};

export const boxStockReducer = createReducer(
  initialState,
  on(BoxStockActions.loadBoxStocks, (state) => ({ ...state, loading: true })),
  on(BoxStockActions.loadBoxStocksSuccess, (state, { boxStocks }) => ({ ...state, loading: false, boxStocks })),
  on(BoxStockActions.loadBoxStocksFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(BoxStockActions.loadBoxStock, (state) => ({ ...state, loading: true })),
  on(BoxStockActions.loadBoxStockSuccess, (state, { boxStock }) => ({ ...state, loading: false, selectedBoxStock: boxStock })),
  on(BoxStockActions.loadBoxStockFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(BoxStockActions.createBoxStock, (state) => ({ ...state, loading: true })),
  on(BoxStockActions.createBoxStockSuccess, (state, { boxStock }) => ({ ...state, loading: false, boxStocks: [...state.boxStocks, boxStock] })),
  on(BoxStockActions.createBoxStockFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(BoxStockActions.updateBoxStock, (state) => ({ ...state, loading: true })),
  on(BoxStockActions.updateBoxStockSuccess, (state, { boxStock }) => ({
    ...state,
    loading: false,
    boxStocks: state.boxStocks.map(b => b.id === boxStock.id ? boxStock : b),
    selectedBoxStock: boxStock,
  })),
  on(BoxStockActions.updateBoxStockFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(BoxStockActions.deleteBoxStock, (state) => ({ ...state, loading: true })),
  on(BoxStockActions.deleteBoxStockSuccess, (state, { id }) => ({
    ...state,
    loading: false,
    boxStocks: state.boxStocks.filter(b => b.id !== id),
  })),
  on(BoxStockActions.deleteBoxStockFailure, (state, { error }) => ({ ...state, loading: false, error })),
);