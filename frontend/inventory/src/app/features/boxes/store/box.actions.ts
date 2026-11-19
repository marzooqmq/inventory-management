import { createAction, props } from '@ngrx/store';
import { BoxRequestDTO, BoxResponseDTO } from '../models/box.model';

// Load Boxes
export const loadBoxes = createAction('[Box List] Load Boxes');
export const loadBoxesSuccess = createAction(
  '[Box API] Load Boxes Success',
  props<{ boxes: BoxResponseDTO[] }>()
);
export const loadBoxesFailure = createAction(
  '[Box API] Load Boxes Failure',
  props<{ error: string }>()
);

// Load Single Box
export const loadBox = createAction(
  '[Box Form] Load Box',
  props<{ id: number }>()
);
export const loadBoxSuccess = createAction(
  '[Box API] Load Box Success',
  props<{ box: BoxResponseDTO }>()
);
export const loadBoxFailure = createAction(
  '[Box API] Load Box Failure',
  props<{ error: string }>()
);

// Create Box
export const createBox = createAction(
  '[Box Form] Create Box',
  props<{ box: BoxRequestDTO }>()
);
export const createBoxSuccess = createAction(
  '[Box API] Create Box Success',
  props<{ box: BoxResponseDTO }>()
);
export const createBoxFailure = createAction(
  '[Box API] Create Box Failure',
  props<{ error: string }>()
);

// Update Box
export const updateBox = createAction(
  '[Box Form] Update Box',
  props<{ id: number; box: BoxRequestDTO }>()
);
export const updateBoxSuccess = createAction(
  '[Box API] Update Box Success',
  props<{ box: BoxResponseDTO }>()
);
export const updateBoxFailure = createAction(
  '[Box API] Update Box Failure',
  props<{ error: string }>()
);

// Delete Box
export const deleteBox = createAction(
  '[Box List] Delete Box',
  props<{ id: number }>()
);
export const deleteBoxSuccess = createAction(
  '[Box API] Delete Box Success',
  props<{ id: number }>()
);
export const deleteBoxFailure = createAction(
  '[Box API] Delete Box Failure',
  props<{ error: string }>()
);

// Clear Selected Box
export const clearSelectedBox = createAction('[Box Form] Clear Selected Box');
