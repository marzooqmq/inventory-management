import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ProductConversionService } from '../services/product-conversion.service';
import * as ProductConversionActions from './product-conversion.actions';
import { ToastService } from '../../../core/services/toast.service';

@Injectable()
export class ProductConversionEffects {
  
  loadProductConversions$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductConversionActions.loadProductConversions),
      switchMap(() =>
        this.productConversionService.getAll().pipe(
          map(productConversions => ProductConversionActions.loadProductConversionsSuccess({ productConversions })),
          catchError(error => {
            this.toastService.error('Failed to load product conversions');
            return of(ProductConversionActions.loadProductConversionsFailure({ error: error.message }));
          })
        )
      )
    )
  );

  loadProductConversion$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductConversionActions.loadProductConversion),
      switchMap(({ id }) =>
        this.productConversionService.getById(id).pipe(
          map(productConversion => ProductConversionActions.loadProductConversionSuccess({ productConversion })),
          catchError(error => {
            this.toastService.error('Failed to load product conversion');
            return of(ProductConversionActions.loadProductConversionFailure({ error: error.message }));
          })
        )
      )
    )
  );

  createProductConversion$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductConversionActions.createProductConversion),
      switchMap(({ productConversion }) =>
        this.productConversionService.create(productConversion).pipe(
          map(createdProductConversion => {
            this.toastService.success('Product conversion created successfully');
            return ProductConversionActions.createProductConversionSuccess({ productConversion: createdProductConversion });
          }),
          catchError(error => {
            this.toastService.error('Failed to create product conversion');
            return of(ProductConversionActions.createProductConversionFailure({ error: error.message }));
          })
        )
      )
    )
  );

  updateProductConversion$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductConversionActions.updateProductConversion),
      switchMap(({ id, productConversion }) =>
        this.productConversionService.update(id, productConversion).pipe(
          map(updatedProductConversion => {
            this.toastService.success('Product conversion updated successfully');
            return ProductConversionActions.updateProductConversionSuccess({ productConversion: updatedProductConversion });
          }),
          catchError(error => {
            this.toastService.error('Failed to update product conversion');
            return of(ProductConversionActions.updateProductConversionFailure({ error: error.message }));
          })
        )
      )
    )
  );

  deleteProductConversion$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductConversionActions.deleteProductConversion),
      switchMap(({ id }) =>
        this.productConversionService.delete(id).pipe(
          map(() => {
            this.toastService.success('Product conversion deleted successfully');
            return ProductConversionActions.deleteProductConversionSuccess({ id });
          }),
          catchError(error => {
            this.toastService.error('Failed to delete product conversion');
            return of(ProductConversionActions.deleteProductConversionFailure({ error: error.message }));
          })
        )
      )
    )
  );

  navigateAfterCreate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ProductConversionActions.createProductConversionSuccess, ProductConversionActions.updateProductConversionSuccess),
        tap(() => this.router.navigate(['/product-conversions']))
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private productConversionService: ProductConversionService,
    private toastService: ToastService,
    private router: Router
  ) {}
}

