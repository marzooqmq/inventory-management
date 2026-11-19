import { createAction, props } from '@ngrx/store';
import { BoxStockRequestDTO, BoxStockResponseDTO } from '../models/box-stock.model';

export const loadBoxStocks = createAction('[Box Stock] Load All');
export const loadBoxStocksSuccess = createAction('[Box Stock] Load All Success', props<{ boxStocks: BoxStockResponseDTO[] }>());
export const loadBoxStocksFailure = createAction('[Box Stock] Load All Failure', props<{ error: any }>());

export const loadBoxStock = createAction('[Box Stock] Load', props<{ id: number }>());
export const loadBoxStockSuccess = createAction('[Box Stock] Load Success', props<{ boxStock: BoxStockResponseDTO }>());
export const loadBoxStockFailure = createAction('[Box Stock] Load Failure', props<{ error: any }>());

export const createBoxStock = createAction('[Box Stock] Create', props<{ boxStock: BoxStockRequestDTO }>());
export const createBoxStockSuccess = createAction('[Box Stock] Create Success', props<{ boxStock: BoxStockResponseDTO }>());
export const createBoxStockFailure = createAction('[Box Stock] Create Failure', props<{ error: any }>());

export const updateBoxStock = createAction('[Box Stock] Update', props<{ id: number, boxStock: BoxStockRequestDTO }>());
export const updateBoxStockSuccess = createAction('[Box Stock] Update Success', props<{ boxStock: BoxStockResponseDTO }>());
export const updateBoxStockFailure = createAction('[Box Stock] Update Failure', props<{ error: any }>());

export const deleteBoxStock = createAction('[Box Stock] Delete', props<{ id: number }>());
export const deleteBoxStockSuccess = createAction('[Box Stock] Delete Success', props<{ id: number }>());
export const deleteBoxStockFailure = createAction('[Box Stock] Delete Failure', props<{ error: any }>());