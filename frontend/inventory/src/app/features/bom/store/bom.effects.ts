import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { BOMService } from '../services/bom.service';
import * as BOMActions from './bom.actions';
import { BOMResponseDTO } from '../models/bom.model';
import { ToastService } from '../../../core/services/toast.service';

@Injectable()
export class BOMEffects {
  constructor(
    private actions$: Actions,
    private bomService: BOMService,
    private toastService: ToastService,
    private router: Router
  ) {}

  loadBOMs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BOMActions.loadBOMs),
      mergeMap(() =>
        this.bomService.getAll().pipe(
          map((boms: BOMResponseDTO[]) => BOMActions.loadBOMsSuccess({ boms })),
          catchError((error) => of(BOMActions.loadBOMsFailure({ error: error.message })))
        )
      )
    )
  );

  loadBOM$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BOMActions.loadBOM),
      mergeMap(({ id }) =>
        this.bomService.getById(id).pipe(
          map((bom: BOMResponseDTO) => BOMActions.loadBOMSuccess({ bom })),
          catchError((error) => of(BOMActions.loadBOMFailure({ error: error.message })))
        )
      )
    )
  );

  createBOM$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BOMActions.createBOM),
      mergeMap(({ bom }) =>
        this.bomService.create(bom).pipe(
          map((bom: BOMResponseDTO) => BOMActions.createBOMSuccess({ bom })),
          catchError((error) => of(BOMActions.createBOMFailure({ error: error.message })))
        )
      )
    )
  );

  createBOMSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BOMActions.createBOMSuccess),
        tap(() => {
          this.toastService.success('BOM created successfully');
          this.router.navigate(['/bom']);
        })
      ),
    { dispatch: false }
  );

  updateBOM$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BOMActions.updateBOM),
      mergeMap(({ id, bom }) =>
        this.bomService.update(id, bom).pipe(
          map((bom: BOMResponseDTO) => BOMActions.updateBOMSuccess({ bom })),
          catchError((error) => of(BOMActions.updateBOMFailure({ error: error.message })))
        )
      )
    )
  );

  updateBOMSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BOMActions.updateBOMSuccess),
        tap(() => {
          this.toastService.success('BOM updated successfully');
          this.router.navigate(['/bom']);
        })
      ),
    { dispatch: false }
  );

  deleteBOM$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BOMActions.deleteBOM),
      mergeMap(({ id }) =>
        this.bomService.delete(id).pipe(
          map(() => BOMActions.deleteBOMSuccess({ id })),
          catchError((error) => of(BOMActions.deleteBOMFailure({ error: error.message })))
        )
      )
    )
  );

  deleteBOMSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BOMActions.deleteBOMSuccess),
        tap(() => {
          this.toastService.success('BOM deleted successfully');
        })
      ),
    { dispatch: false }
  );

  bomFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          BOMActions.loadBOMsFailure,
          BOMActions.loadBOMFailure,
          BOMActions.createBOMFailure,
          BOMActions.updateBOMFailure,
          BOMActions.deleteBOMFailure
        ),
        tap(({ error }) => {
          this.toastService.error(error);
        })
      ),
    { dispatch: false }
  );
}

