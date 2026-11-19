import { createReducer, on } from '@ngrx/store';
import { RawMaterialState } from '../models/raw-material.model';
import * as RawMaterialActions from './raw-material.actions';

export const initialState: RawMaterialState = {
  rawMaterials: [],
  selectedRawMaterial: null,
  loading: false,
  error: null
};

export const rawMaterialReducer = createReducer(
  initialState,

  // Load All Raw Materials
  on(RawMaterialActions.loadRawMaterials, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RawMaterialActions.loadRawMaterialsSuccess, (state, { rawMaterials }) => ({
    ...state,
    rawMaterials,
    loading: false,
    error: null
  })),

  on(RawMaterialActions.loadRawMaterialsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Raw Material
  on(RawMaterialActions.loadRawMaterial, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RawMaterialActions.loadRawMaterialSuccess, (state, { rawMaterial }) => ({
    ...state,
    selectedRawMaterial: rawMaterial,
    loading: false,
    error: null
  })),

  on(RawMaterialActions.loadRawMaterialFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Raw Material
  on(RawMaterialActions.createRawMaterial, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RawMaterialActions.createRawMaterialSuccess, (state, { rawMaterial }) => ({
    ...state,
    rawMaterials: [...state.rawMaterials, rawMaterial],
    loading: false,
    error: null
  })),

  on(RawMaterialActions.createRawMaterialFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Raw Material
  on(RawMaterialActions.updateRawMaterial, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RawMaterialActions.updateRawMaterialSuccess, (state, { rawMaterial }) => ({
    ...state,
    rawMaterials: state.rawMaterials.map(rm =>
      rm.id === rawMaterial.id ? rawMaterial : rm
    ),
    selectedRawMaterial: rawMaterial,
    loading: false,
    error: null
  })),

  on(RawMaterialActions.updateRawMaterialFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Raw Material
  on(RawMaterialActions.deleteRawMaterial, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(RawMaterialActions.deleteRawMaterialSuccess, (state, { id }) => ({
    ...state,
    rawMaterials: state.rawMaterials.filter(rm => rm.id !== id),
    loading: false,
    error: null
  })),

  on(RawMaterialActions.deleteRawMaterialFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  }))
);
