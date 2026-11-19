import { createAction, props } from '@ngrx/store';
import { BOMRequestDTO, BOMResponseDTO } from '../models/bom.model';

// Load All BOMs
export const loadBOMs = createAction('[BOM] Load BOMs');
export const loadBOMsSuccess = createAction('[BOM] Load BOMs Success', props<{ boms: BOMResponseDTO[] }>());
export const loadBOMsFailure = createAction('[BOM] Load BOMs Failure', props<{ error: string }>());

// Load Single BOM
export const loadBOM = createAction('[BOM] Load BOM', props<{ id: number }>());
export const loadBOMSuccess = createAction('[BOM] Load BOM Success', props<{ bom: BOMResponseDTO }>());
export const loadBOMFailure = createAction('[BOM] Load BOM Failure', props<{ error: string }>());

// Create BOM
export const createBOM = createAction('[BOM] Create BOM', props<{ bom: BOMRequestDTO }>());
export const createBOMSuccess = createAction('[BOM] Create BOM Success', props<{ bom: BOMResponseDTO }>());
export const createBOMFailure = createAction('[BOM] Create BOM Failure', props<{ error: string }>());

// Update BOM
export const updateBOM = createAction('[BOM] Update BOM', props<{ id: number; bom: BOMResponseDTO }>());
export const updateBOMSuccess = createAction('[BOM] Update BOM Success', props<{ bom: BOMResponseDTO }>());
export const updateBOMFailure = createAction('[BOM] Update BOM Failure', props<{ error: string }>());

// Delete BOM
export const deleteBOM = createAction('[BOM] Delete BOM', props<{ id: number }>());
export const deleteBOMSuccess = createAction('[BOM] Delete BOM Success', props<{ id: number }>());
export const deleteBOMFailure = createAction('[BOM] Delete BOM Failure', props<{ error: string }>());
