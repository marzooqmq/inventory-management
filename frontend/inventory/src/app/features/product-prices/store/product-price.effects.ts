import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ProductPriceService } from '../services/product-price.service';
import * as ProductPriceActions from './product-price.actions';
import { ToastService } from '../../../core/services/toast.service';

@Injectable()
export class ProductPriceEffects {
  loadProductPrices$ = createEffect(() => this.actions$.pipe(ofType(ProductPriceActions.loadProductPrices), switchMap(() => this.productPriceService.getAll().pipe(map(productPrices => ProductPriceActions.loadProductPricesSuccess({ productPrices })), catchError(error => { this.toastService.error('Failed to load product prices'); return of(ProductPriceActions.loadProductPricesFailure({ error: error.message })); })))));
  
  loadProductPrice$ = createEffect(() => this.actions$.pipe(ofType(ProductPriceActions.loadProductPrice), switchMap(({ id }) => this.productPriceService.getById(id).pipe(map(productPrice => ProductPriceActions.loadProductPriceSuccess({ productPrice })), catchError(error => { this.toastService.error('Failed to load product price'); return of(ProductPriceActions.loadProductPriceFailure({ error: error.message })); })))));
  
  createProductPrice$ = createEffect(() => this.actions$.pipe(ofType(ProductPriceActions.createProductPrice), switchMap(({ productPrice }) => this.productPriceService.create(productPrice).pipe(map(createdProductPrice => { this.toastService.success('Product price created successfully'); return ProductPriceActions.createProductPriceSuccess({ productPrice: createdProductPrice }); }), catchError(error => { this.toastService.error('Failed to create product price'); return of(ProductPriceActions.createProductPriceFailure({ error: error.message })); })))));
  
  updateProductPrice$ = createEffect(() => this.actions$.pipe(ofType(ProductPriceActions.updateProductPrice), switchMap(({ id, productPrice }) => this.productPriceService.update(id, productPrice).pipe(map(updatedProductPrice => { this.toastService.success('Product price updated successfully'); return ProductPriceActions.updateProductPriceSuccess({ productPrice: updatedProductPrice }); }), catchError(error => { this.toastService.error('Failed to update product price'); return of(ProductPriceActions.updateProductPriceFailure({ error: error.message })); })))));
  
  deleteProductPrice$ = createEffect(() => this.actions$.pipe(ofType(ProductPriceActions.deleteProductPrice), switchMap(({ id }) => this.productPriceService.delete(id).pipe(map(() => { this.toastService.success('Product price deleted successfully'); return ProductPriceActions.deleteProductPriceSuccess({ id }); }), catchError(error => { this.toastService.error('Failed to delete product price'); return of(ProductPriceActions.deleteProductPriceFailure({ error: error.message })); })))));
  
  navigateAfterCreate$ = createEffect(() => this.actions$.pipe(ofType(ProductPriceActions.createProductPriceSuccess, ProductPriceActions.updateProductPriceSuccess), tap(() => this.router.navigate(['/product-prices']))), { dispatch: false });

  constructor(private actions$: Actions, private productPriceService: ProductPriceService, private toastService: ToastService, private router: Router) {}
}

