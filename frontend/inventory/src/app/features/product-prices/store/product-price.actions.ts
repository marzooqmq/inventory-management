import { createAction, props } from '@ngrx/store';
import { ProductPriceRequestDTO, ProductPriceResponseDTO } from '../models/product-price.model';

export const loadProductPrices = createAction('[Product Price List] Load Product Prices');
export const loadProductPricesSuccess = createAction('[Product Price API] Load Product Prices Success', props<{ productPrices: ProductPriceResponseDTO[] }>());
export const loadProductPricesFailure = createAction('[Product Price API] Load Product Prices Failure', props<{ error: string }>());

export const loadProductPrice = createAction('[Product Price Form] Load Product Price', props<{ id: number }>());
export const loadProductPriceSuccess = createAction('[Product Price API] Load Product Price Success', props<{ productPrice: ProductPriceResponseDTO }>());
export const loadProductPriceFailure = createAction('[Product Price API] Load Product Price Failure', props<{ error: string }>());

export const createProductPrice = createAction('[Product Price Form] Create Product Price', props<{ productPrice: ProductPriceRequestDTO }>());
export const createProductPriceSuccess = createAction('[Product Price API] Create Product Price Success', props<{ productPrice: ProductPriceResponseDTO }>());
export const createProductPriceFailure = createAction('[Product Price API] Create Product Price Failure', props<{ error: string }>());

export const updateProductPrice = createAction('[Product Price Form] Update Product Price', props<{ id: number; productPrice: ProductPriceRequestDTO }>());
export const updateProductPriceSuccess = createAction('[Product Price API] Update Product Price Success', props<{ productPrice: ProductPriceResponseDTO }>());
export const updateProductPriceFailure = createAction('[Product Price API] Update Product Price Failure', props<{ error: string }>());

export const deleteProductPrice = createAction('[Product Price List] Delete Product Price', props<{ id: number }>());
export const deleteProductPriceSuccess = createAction('[Product Price API] Delete Product Price Success', props<{ id: number }>());
export const deleteProductPriceFailure = createAction('[Product Price API] Delete Product Price Failure', props<{ error: string }>());

export const clearSelectedProductPrice = createAction('[Product Price Form] Clear Selected Product Price');
