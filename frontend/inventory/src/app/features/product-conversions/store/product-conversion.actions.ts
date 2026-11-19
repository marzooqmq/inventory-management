import { createAction, props } from '@ngrx/store';
import { ProductConversionRequestDTO, ProductConversionResponseDTO } from '../models/product-conversion.model';

// Load Product Conversions
export const loadProductConversions = createAction('[Product Conversion List] Load Product Conversions');
export const loadProductConversionsSuccess = createAction(
  '[Product Conversion API] Load Product Conversions Success',
  props<{ productConversions: ProductConversionResponseDTO[] }>()
);
export const loadProductConversionsFailure = createAction(
  '[Product Conversion API] Load Product Conversions Failure',
  props<{ error: string }>()
);

// Load Single Product Conversion
export const loadProductConversion = createAction(
  '[Product Conversion Form] Load Product Conversion',
  props<{ id: number }>()
);
export const loadProductConversionSuccess = createAction(
  '[Product Conversion API] Load Product Conversion Success',
  props<{ productConversion: ProductConversionResponseDTO }>()
);
export const loadProductConversionFailure = createAction(
  '[Product Conversion API] Load Product Conversion Failure',
  props<{ error: string }>()
);

// Create Product Conversion
export const createProductConversion = createAction(
  '[Product Conversion Form] Create Product Conversion',
  props<{ productConversion: ProductConversionRequestDTO }>()
);
export const createProductConversionSuccess = createAction(
  '[Product Conversion API] Create Product Conversion Success',
  props<{ productConversion: ProductConversionResponseDTO }>()
);
export const createProductConversionFailure = createAction(
  '[Product Conversion API] Create Product Conversion Failure',
  props<{ error: string }>()
);

// Update Product Conversion
export const updateProductConversion = createAction(
  '[Product Conversion Form] Update Product Conversion',
  props<{ id: number; productConversion: ProductConversionRequestDTO }>()
);
export const updateProductConversionSuccess = createAction(
  '[Product Conversion API] Update Product Conversion Success',
  props<{ productConversion: ProductConversionResponseDTO }>()
);
export const updateProductConversionFailure = createAction(
  '[Product Conversion API] Update Product Conversion Failure',
  props<{ error: string }>()
);

// Delete Product Conversion
export const deleteProductConversion = createAction(
  '[Product Conversion List] Delete Product Conversion',
  props<{ id: number }>()
);
export const deleteProductConversionSuccess = createAction(
  '[Product Conversion API] Delete Product Conversion Success',
  props<{ id: number }>()
);
export const deleteProductConversionFailure = createAction(
  '[Product Conversion API] Delete Product Conversion Failure',
  props<{ error: string }>()
);

// Clear Selected Product Conversion
export const clearSelectedProductConversion = createAction('[Product Conversion Form] Clear Selected Product Conversion');
