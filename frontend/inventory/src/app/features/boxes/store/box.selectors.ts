import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BoxState } from '../models/box.model';

export const selectBoxState = createFeatureSelector<BoxState>('boxes');

export const selectAllBoxes = createSelector(
  selectBoxState,
  (state: BoxState) => state.boxes
);

export const selectSelectedBox = createSelector(
  selectBoxState,
  (state: BoxState) => state.selectedBox
);

export const selectBoxesLoading = createSelector(
  selectBoxState,
  (state: BoxState) => state.loading
);

export const selectBoxesError = createSelector(
  selectBoxState,
  (state: BoxState) => state.error
);
