import { createAction, props } from '@ngrx/store';
import { RawMaterialRequestDTO, RawMaterialResponseDTO } from '../models/raw-material.model';

// Load All Raw Materials
export const loadRawMaterials = createAction(
  '[Raw Materials] Load Raw Materials'
);

export const loadRawMaterialsSuccess = createAction(
  '[Raw Materials] Load Raw Materials Success',
  props<{ rawMaterials: RawMaterialResponseDTO[] }>()
);

export const loadRawMaterialsFailure = createAction(
  '[Raw Materials] Load Raw Materials Failure',
  props<{ error: string }>()
);

// Load Single Raw Material
export const loadRawMaterial = createAction(
  '[Raw Materials] Load Raw Material',
  props<{ id: number }>()
);

export const loadRawMaterialSuccess = createAction(
  '[Raw Materials] Load Raw Material Success',
  props<{ rawMaterial: RawMaterialResponseDTO }>()
);

export const loadRawMaterialFailure = createAction(
  '[Raw Materials] Load Raw Material Failure',
  props<{ error: string }>()
);

// Create Raw Material
export const createRawMaterial = createAction(
  '[Raw Materials] Create Raw Material',
  props<{ rawMaterial: RawMaterialRequestDTO }>()
);

export const createRawMaterialSuccess = createAction(
  '[Raw Materials] Create Raw Material Success',
  props<{ rawMaterial: RawMaterialResponseDTO }>()
);

export const createRawMaterialFailure = createAction(
  '[Raw Materials] Create Raw Material Failure',
  props<{ error: string }>()
);

// Update Raw Material
export const updateRawMaterial = createAction(
  '[Raw Materials] Update Raw Material',
  props<{ id: number; rawMaterial: RawMaterialRequestDTO }>()
);

export const updateRawMaterialSuccess = createAction(
  '[Raw Materials] Update Raw Material Success',
  props<{ rawMaterial: RawMaterialResponseDTO }>()
);

export const updateRawMaterialFailure = createAction(
  '[Raw Materials] Update Raw Material Failure',
  props<{ error: string }>()
);

// Delete Raw Material
export const deleteRawMaterial = createAction(
  '[Raw Materials] Delete Raw Material',
  props<{ id: number }>()
);

export const deleteRawMaterialSuccess = createAction(
  '[Raw Materials] Delete Raw Material Success',
  props<{ id: number }>()
);

export const deleteRawMaterialFailure = createAction(
  '[Raw Materials] Delete Raw Material Failure',
  props<{ error: string }>()
);
