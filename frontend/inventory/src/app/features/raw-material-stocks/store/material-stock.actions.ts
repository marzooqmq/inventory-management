import { createAction, props } from '@ngrx/store';
import { MaterialStockRequestDTO, MaterialStockResponseDTO } from '../models/material-stock.model';

// Load All Material Stocks
export const loadMaterialStocks = createAction('[Material Stock] Load Material Stocks');
export const loadMaterialStocksSuccess = createAction('[Material Stock] Load Material Stocks Success', props<{ materialStocks: MaterialStockResponseDTO[] }>());
export const loadMaterialStocksFailure = createAction('[Material Stock] Load Material Stocks Failure', props<{ error: string }>());

// Load Material Stock by ID
export const loadMaterialStock = createAction('[Material Stock] Load Material Stock', props<{ id: number }>());
export const loadMaterialStockSuccess = createAction('[Material Stock] Load Material Stock Success', props<{ materialStock: MaterialStockResponseDTO }>());
export const loadMaterialStockFailure = createAction('[Material Stock] Load Material Stock Failure', props<{ error: string }>());

// Create Material Stock
export const createMaterialStock = createAction('[Material Stock] Create Material Stock', props<{ request: MaterialStockRequestDTO }>());
export const createMaterialStockSuccess = createAction('[Material Stock] Create Material Stock Success', props<{ materialStock: MaterialStockResponseDTO }>());
export const createMaterialStockFailure = createAction('[Material Stock] Create Material Stock Failure', props<{ error: string }>());

// Update Material Stock
export const updateMaterialStock = createAction('[Material Stock] Update Material Stock', props<{ id: number; request: MaterialStockRequestDTO }>());
export const updateMaterialStockSuccess = createAction('[Material Stock] Update Material Stock Success', props<{ materialStock: MaterialStockResponseDTO }>());
export const updateMaterialStockFailure = createAction('[Material Stock] Update Material Stock Failure', props<{ error: string }>());

// Delete Material Stock
export const deleteMaterialStock = createAction('[Material Stock] Delete Material Stock', props<{ id: number }>());
export const deleteMaterialStockSuccess = createAction('[Material Stock] Delete Material Stock Success', props<{ id: number }>());
export const deleteMaterialStockFailure = createAction('[Material Stock] Delete Material Stock Failure', props<{ error: string }>());

// Clear Selected
export const clearSelectedMaterialStock = createAction('[Material Stock] Clear Selected Material Stock');
