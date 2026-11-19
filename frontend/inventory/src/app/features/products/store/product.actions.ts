import { createAction, props } from '@ngrx/store';
import { ProductRequestDTO, ProductResponseDTO } from '../models/product.model';

// Load Products
export const loadProducts = createAction('[Product List] Load Products');

export const loadProductsSuccess = createAction(
  '[Product API] Load Products Success',
  props<{ products: ProductResponseDTO[] }>()
);

export const loadProductsFailure = createAction(
  '[Product API] Load Products Failure',
  props<{ error: string }>()
);

// Load Single Product
export const loadProduct = createAction(
  '[Product Form] Load Product',
  props<{ id: number }>()
);

export const loadProductSuccess = createAction(
  '[Product API] Load Product Success',
  props<{ product: ProductResponseDTO }>()
);

export const loadProductFailure = createAction(
  '[Product API] Load Product Failure',
  props<{ error: string }>()
);

// Create Product
export const createProduct = createAction(
  '[Product Form] Create Product',
  props<{ product: ProductRequestDTO }>()
);

export const createProductSuccess = createAction(
  '[Product API] Create Product Success',
  props<{ product: ProductResponseDTO }>()
);

export const createProductFailure = createAction(
  '[Product API] Create Product Failure',
  props<{ error: string }>()
);

// Update Product
export const updateProduct = createAction(
  '[Product Form] Update Product',
  props<{ id: number; product: ProductRequestDTO }>()
);

export const updateProductSuccess = createAction(
  '[Product API] Update Product Success',
  props<{ product: ProductResponseDTO }>()
);

export const updateProductFailure = createAction(
  '[Product API] Update Product Failure',
  props<{ error: string }>()
);

// Delete Product
export const deleteProduct = createAction(
  '[Product List] Delete Product',
  props<{ id: number }>()
);

export const deleteProductSuccess = createAction(
  '[Product API] Delete Product Success',
  props<{ id: number }>()
);

export const deleteProductFailure = createAction(
  '[Product API] Delete Product Failure',
  props<{ error: string }>()
);

// Clear Selected Product
export const clearSelectedProduct = createAction(
  '[Product] Clear Selected Product'
);
