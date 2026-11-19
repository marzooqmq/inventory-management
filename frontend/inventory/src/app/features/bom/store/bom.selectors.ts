import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BOMState } from '../models/bom.model';

export const selectBOMState = createFeatureSelector<BOMState>('boms');

export const selectAllBOMs = createSelector(
  selectBOMState,
  (state: BOMState) => state.boms
);

export const selectSelectedBOM = createSelector(
  selectBOMState,
  (state: BOMState) => state.selectedBOM
);

export const selectBOMsLoading = createSelector(
  selectBOMState,
  (state: BOMState) => state.loading
);

export const selectBOMsError = createSelector(
  selectBOMState,
  (state: BOMState) => state.error
);
