import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ProductionCostService } from '../services/production-cost.service';
import * as ProductionCostActions from './production-cost.actions';
import { ToastService } from '../../../core/services/toast.service';

@Injectable()
export class ProductionCostEffects {
  
  loadProductionCosts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductionCostActions.loadProductionCosts),
      switchMap(() =>
        this.productionCostService.getAll().pipe(
          map(productionCosts => ProductionCostActions.loadProductionCostsSuccess({ productionCosts })),
          catchError(error => {
            this.toastService.error('Failed to load production costs');
            return of(ProductionCostActions.loadProductionCostsFailure({ error: error.message }));
          })
        )
      )
    )
  );

  loadProductionCost$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductionCostActions.loadProductionCost),
      switchMap(({ id }) =>
        this.productionCostService.getById(id).pipe(
          map(productionCost => ProductionCostActions.loadProductionCostSuccess({ productionCost })),
          catchError(error => {
            this.toastService.error('Failed to load production cost');
            return of(ProductionCostActions.loadProductionCostFailure({ error: error.message }));
          })
        )
      )
    )
  );

  createProductionCost$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductionCostActions.createProductionCost),
      switchMap(({ productionCost }) =>
        this.productionCostService.create(productionCost).pipe(
          map(createdProductionCost => {
            this.toastService.success('Production cost created successfully');
            return ProductionCostActions.createProductionCostSuccess({ productionCost: createdProductionCost });
          }),
          catchError(error => {
            this.toastService.error('Failed to create production cost');
            return of(ProductionCostActions.createProductionCostFailure({ error: error.message }));
          })
        )
      )
    )
  );

  updateProductionCost$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductionCostActions.updateProductionCost),
      switchMap(({ id, productionCost }) =>
        this.productionCostService.update(id, productionCost).pipe(
          map(updatedProductionCost => {
            this.toastService.success('Production cost updated successfully');
            return ProductionCostActions.updateProductionCostSuccess({ productionCost: updatedProductionCost });
          }),
          catchError(error => {
            this.toastService.error('Failed to update production cost');
            return of(ProductionCostActions.updateProductionCostFailure({ error: error.message }));
          })
        )
      )
    )
  );

  deleteProductionCost$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductionCostActions.deleteProductionCost),
      switchMap(({ id }) =>
        this.productionCostService.delete(id).pipe(
          map(() => {
            this.toastService.success('Production cost deleted successfully');
            return ProductionCostActions.deleteProductionCostSuccess({ id });
          }),
          catchError(error => {
            this.toastService.error('Failed to delete production cost');
            return of(ProductionCostActions.deleteProductionCostFailure({ error: error.message }));
          })
        )
      )
    )
  );

  navigateAfterCreate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ProductionCostActions.createProductionCostSuccess, ProductionCostActions.updateProductionCostSuccess),
        tap(() => this.router.navigate(['/production-costs']))
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private productionCostService: ProductionCostService,
    private toastService: ToastService,
    private router: Router
  ) {}
}

