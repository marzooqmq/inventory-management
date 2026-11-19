import { createReducer, on } from '@ngrx/store';
import { BoxState } from '../models/box.model';
import * as BoxActions from './box.actions';

export const initialState: BoxState = {
  boxes: [],
  selectedBox: null,
  loading: false,
  error: null
};

export const boxReducer = createReducer(
  initialState,
  
  // Load Boxes
  on(BoxActions.loadBoxes, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(BoxActions.loadBoxesSuccess, (state, { boxes }) => ({
    ...state,
    boxes,
    loading: false,
    error: null
  })),
  on(BoxActions.loadBoxesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load Single Box
  on(BoxActions.loadBox, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(BoxActions.loadBoxSuccess, (state, { box }) => ({
    ...state,
    selectedBox: box,
    loading: false,
    error: null
  })),
  on(BoxActions.loadBoxFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Create Box
  on(BoxActions.createBox, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(BoxActions.createBoxSuccess, (state, { box }) => ({
    ...state,
    boxes: [...state.boxes, box],
    loading: false,
    error: null
  })),
  on(BoxActions.createBoxFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Update Box
  on(BoxActions.updateBox, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(BoxActions.updateBoxSuccess, (state, { box }) => ({
    ...state,
    boxes: state.boxes.map(b => b.id === box.id ? box : b),
    selectedBox: box,
    loading: false,
    error: null
  })),
  on(BoxActions.updateBoxFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Delete Box
  on(BoxActions.deleteBox, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(BoxActions.deleteBoxSuccess, (state, { id }) => ({
    ...state,
    boxes: state.boxes.filter(b => b.id !== id),
    loading: false,
    error: null
  })),
  on(BoxActions.deleteBoxFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Clear Selected Box
  on(BoxActions.clearSelectedBox, (state) => ({
    ...state,
    selectedBox: null
  }))
);
