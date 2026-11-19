import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MaterialStockService } from '../services/material-stock.service';
import * as MaterialStockActions from './material-stock.actions';
import { ToastService } from '../../../core/services/toast.service';

@Injectable()
export class MaterialStockEffects {

  loadMaterialStocks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MaterialStockActions.loadMaterialStocks),
      switchMap(() =>
        this.materialStockService.getAll().pipe(
          map(materialStocks => MaterialStockActions.loadMaterialStocksSuccess({ materialStocks })),
          catchError(error => {
            this.toastService.error('Failed to load material stocks');
            return of(MaterialStockActions.loadMaterialStocksFailure({ error: error.message }));
          })
        )
      )
    )
  );

  loadMaterialStock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MaterialStockActions.loadMaterialStock),
      switchMap(({ id }) =>
        this.materialStockService.getById(id).pipe(
          map(materialStock => MaterialStockActions.loadMaterialStockSuccess({ materialStock })),
          catchError(error => {
            this.toastService.error('Failed to load material stock');
            return of(MaterialStockActions.loadMaterialStockFailure({ error: error.message }));
          })
        )
      )
    )
  );

  createMaterialStock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MaterialStockActions.createMaterialStock),
      switchMap(({ request }) =>
        this.materialStockService.create(request).pipe(
          map(materialStock => {
            this.toastService.success('Material stock created successfully');
            return MaterialStockActions.createMaterialStockSuccess({ materialStock });
          }),
          catchError(error => {
            const errorMsg = error?.error?.message || 
              error?.message || 'Failed to create material stock';
            this.toastService.error(errorMsg);
            return of(MaterialStockActions.createMaterialStockFailure({ error: error.message }));
          })
        )
      )
    )
  );

  createMaterialStockSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MaterialStockActions.createMaterialStockSuccess),
      tap(() => this.router.navigate(['/raw-material-stocks']))
    ),
    { dispatch: false }
  );

  updateMaterialStock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MaterialStockActions.updateMaterialStock),
      switchMap(({ id, request }) =>
        this.materialStockService.update(id, request).pipe(
          map(materialStock => {
            this.toastService.success('Material stock updated successfully');
            return MaterialStockActions.updateMaterialStockSuccess({ materialStock });
          }),
          catchError(error => {
            this.toastService.error('Failed to update material stock');
            return of(MaterialStockActions.updateMaterialStockFailure({ error: error.message }));
          })
        )
      )
    )
  );

  updateMaterialStockSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MaterialStockActions.updateMaterialStockSuccess),
      tap(() => this.router.navigate(['/raw-material-stocks']))
    ),
    { dispatch: false }
  );

  deleteMaterialStock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MaterialStockActions.deleteMaterialStock),
      switchMap(({ id }) =>
        this.materialStockService.delete(id).pipe(
          map(() => {
            this.toastService.success('Material stock deleted successfully', 'Success');
            return MaterialStockActions.deleteMaterialStockSuccess({ id });
          }),
          catchError(error => {
            this.toastService.error('Failed to delete material stock', 'Error');
            return of(MaterialStockActions.deleteMaterialStockFailure({ error: error.message }));
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private materialStockService: MaterialStockService,
    private toastService: ToastService,
    private router: Router
  ) {}
}