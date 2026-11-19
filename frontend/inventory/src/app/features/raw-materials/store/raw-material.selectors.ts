import { createFeatureSelector, createSelector } from '@ngrx/store';
import { RawMaterialState } from '../models/raw-material.model';

export const selectRawMaterialState = createFeatureSelector<RawMaterialState>('rawMaterials');

export const selectAllRawMaterials = createSelector(
  selectRawMaterialState,
  (state: RawMaterialState) => state.rawMaterials
);

export const selectSelectedRawMaterial = createSelector(
  selectRawMaterialState,
  (state: RawMaterialState) => state.selectedRawMaterial
);

export const selectRawMaterialsLoading = createSelector(
  selectRawMaterialState,
  (state: RawMaterialState) => state.loading
);

export const selectRawMaterialsError = createSelector(
  selectRawMaterialState,
  (state: RawMaterialState) => state.error
);
