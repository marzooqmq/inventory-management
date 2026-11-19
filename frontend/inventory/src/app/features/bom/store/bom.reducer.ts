import { createReducer, on } from '@ngrx/store';
import { BOMState } from '../models/bom.model';
import * as BOMActions from './bom.actions';

export const initialState: BOMState = {
  boms: [],
  selectedBOM: null,
  loading: false,
  error: null
};

export const bomReducer = createReducer(
  initialState,

  // Load All BOMs
  on(BOMActions.loadBOMs, (state) => ({ ...state, loading: true, error: null })),
  on(BOMActions.loadBOMsSuccess, (state, { boms }) => ({ ...state, boms, loading: false, error: null })),
  on(BOMActions.loadBOMsFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Load Single BOM
  on(BOMActions.loadBOM, (state) => ({ ...state, loading: true, error: null })),
  on(BOMActions.loadBOMSuccess, (state, { bom }) => ({ ...state, selectedBOM: bom, loading: false, error: null })),
  on(BOMActions.loadBOMFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Create BOM
  on(BOMActions.createBOM, (state) => ({ ...state, loading: true, error: null })),
  on(BOMActions.createBOMSuccess, (state, { bom }) => ({ ...state, boms: [...state.boms, bom], loading: false, error: null })),
  on(BOMActions.createBOMFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Update BOM
  on(BOMActions.updateBOM, (state) => ({ ...state, loading: true, error: null })),
  on(BOMActions.updateBOMSuccess, (state, { bom }) => ({
    ...state,
    boms: state.boms.map(b => b.id === bom.id ? bom : b),
    selectedBOM: bom,
    loading: false,
    error: null
  })),
  on(BOMActions.updateBOMFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // Delete BOM
  on(BOMActions.deleteBOM, (state) => ({ ...state, loading: true, error: null })),
  on(BOMActions.deleteBOMSuccess, (state, { id }) => ({
    ...state,
    boms: state.boms.filter(b => b.id !== id),
    loading: false,
    error: null
  })),
  on(BOMActions.deleteBOMFailure, (state, { error }) => ({ ...state, loading: false, error }))
);
