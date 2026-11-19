import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BoxStockService } from '../services/box-stock.service';
import * as BoxStockActions from './box-stock.actions';
import { ToastService } from '../../../core/services/toast.service';

@Injectable()
export class BoxStockEffects {

  loadBoxStocks$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoxStockActions.loadBoxStocks),
      switchMap(() =>
        this.boxStockService.getAll().pipe(
          map(boxStocks => BoxStockActions.loadBoxStocksSuccess({ boxStocks })),
          catchError(error => {
            this.toastService.error('Failed to load box stocks');
            return of(BoxStockActions.loadBoxStocksFailure({ error: error.message }));
          })
        )
      )
    )
  );

  loadBoxStock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoxStockActions.loadBoxStock),
      switchMap(({ id }) =>
        this.boxStockService.getById(id).pipe(
          map(boxStock => BoxStockActions.loadBoxStockSuccess({ boxStock })),
          catchError(error => {
            this.toastService.error('Failed to load box stock');
            return of(BoxStockActions.loadBoxStockFailure({ error: error.message }));
          })
        )
      )
    )
  );

  createBoxStock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoxStockActions.createBoxStock),
      switchMap(({ boxStock }) =>
        this.boxStockService.create(boxStock).pipe(
          map(boxStock => {
            this.toastService.success('Box stock created successfully');
            return BoxStockActions.createBoxStockSuccess({ boxStock });
          }),
          catchError(error => {
            const errorMsg = error?.error?.message || 
              error?.message || 'Failed to create box stock';
            this.toastService.error(errorMsg);
            return of(BoxStockActions.createBoxStockFailure({ error: error.message }));
          })
        )
      )
    )
  );

  createBoxStockSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoxStockActions.createBoxStockSuccess),
      tap(() => this.router.navigate(['/box-stocks']))
    ),
    { dispatch: false }
  );

  updateBoxStock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoxStockActions.updateBoxStock),
      switchMap(({ id, boxStock }) =>
        this.boxStockService.update(id, boxStock).pipe(
          map(boxStock => {
            this.toastService.success('Box stock updated successfully');
            return BoxStockActions.updateBoxStockSuccess({ boxStock });
          }),
          catchError(error => {
            this.toastService.error('Failed to update box stock');
            return of(BoxStockActions.updateBoxStockFailure({ error: error.message }));
          })
        )
      )
    )
  );

  updateBoxStockSuccess$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoxStockActions.updateBoxStockSuccess),
      tap(() => this.router.navigate(['/box-stocks']))
    ),
    { dispatch: false }
  );

  deleteBoxStock$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoxStockActions.deleteBoxStock),
      switchMap(({ id }) =>
        this.boxStockService.delete(id).pipe(
          map(() => {
            this.toastService.success('Box stock deleted successfully', 'Success');
            return BoxStockActions.deleteBoxStockSuccess({ id });
          }),
          catchError(error => {
            this.toastService.error('Failed to delete box stock', 'Error');
            return of(BoxStockActions.deleteBoxStockFailure({ error: error.message }));
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private boxStockService: BoxStockService,
    private toastService: ToastService,
    private router: Router
  ) {}
}