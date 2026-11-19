import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as ProductActions from './product.actions';
import { ProductResponseDTO } from '../models/product.model';
import { ProductService } from '../services/product.service';
import { ToastService } from '../../../core/services/toast.service';

@Injectable()
export class ProductEffects {

  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      switchMap(() =>
        this.productService.getAll().pipe(
          map((products: ProductResponseDTO[]) => ProductActions.loadProductsSuccess({ products })),
          catchError(error => of(ProductActions.loadProductsFailure({ 
            error: error.message || 'Failed to load products' 
          })))
        )
      )
    )
  );

  loadProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProduct),
      switchMap(({ id }) =>
        this.productService.getById(id).pipe(
          map((product: ProductResponseDTO) => ProductActions.loadProductSuccess({ product })),
          catchError(error => of(ProductActions.loadProductFailure({ 
            error: error.message || 'Failed to load product' 
          })))
        )
      )
    )
  );

  createProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.createProduct),
      switchMap(({ product }) =>
        this.productService.create(product).pipe(
          map((createdProduct: ProductResponseDTO) => ProductActions.createProductSuccess({ product: createdProduct })),
          catchError(error => of(ProductActions.createProductFailure({ 
            error: error.message || 'Failed to create product' 
          })))
        )
      )
    )
  );

  createProductSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.createProductSuccess),
      tap(() => {
        this.toastService.success('Product created successfully!', 'Success');
        this.router.navigate(['/products']);
      })
    ),
    { dispatch: false }
  );

  updateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.updateProduct),
      switchMap(({ id, product }) =>
        this.productService.update(id, product).pipe(
          map((updatedProduct: ProductResponseDTO) => ProductActions.updateProductSuccess({ product: updatedProduct })),
          catchError(error => of(ProductActions.updateProductFailure({ 
            error: error.message || 'Failed to update product' 
          })))
        )
      )
    )
  );

  updateProductSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.updateProductSuccess),
      tap(() => {
        this.toastService.success('Product updated successfully!', 'Success');
        this.router.navigate(['/products']);
      })
    ),
    { dispatch: false }
  );

  deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.deleteProduct),
      switchMap(({ id }) =>
        this.productService.delete(id).pipe(
          map(() => ProductActions.deleteProductSuccess({ id })),
          catchError(error => of(ProductActions.deleteProductFailure({ 
            error: error.message || 'Failed to delete product' 
          })))
        )
      )
    )
  );

  deleteProductSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.deleteProductSuccess),
      tap(() => {
        this.toastService.success('Product deleted successfully!', 'Success');
      })
    ),
    { dispatch: false }
  );

  handleErrors$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        ProductActions.loadProductsFailure,
        ProductActions.loadProductFailure,
        ProductActions.createProductFailure,
        ProductActions.updateProductFailure,
        ProductActions.deleteProductFailure
      ),
      tap(({ error }) => {
        this.toastService.error(error, 'Error');
      })
    ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private productService: ProductService,
    private toastService: ToastService,
    private router: Router
  ) {}
}
