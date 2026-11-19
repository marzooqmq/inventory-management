import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { RawMaterialService } from '../services/raw-material.service';
import * as RawMaterialActions from './raw-material.actions';
import { RawMaterialResponseDTO } from '../models/raw-material.model';
import { ToastService } from '../../../core/services/toast.service';

@Injectable()
export class RawMaterialEffects {
  constructor(
    private actions$: Actions,
    private rawMaterialService: RawMaterialService,
    private toastService: ToastService,
    private router: Router
  ) {}

  loadRawMaterials$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.loadRawMaterials),
      mergeMap(() =>
        this.rawMaterialService.getAll().pipe(
          map((rawMaterials: RawMaterialResponseDTO[]) =>
            RawMaterialActions.loadRawMaterialsSuccess({ rawMaterials })
          ),
          catchError((error) =>
            of(RawMaterialActions.loadRawMaterialsFailure({ error: error.message }))
          )
        )
      )
    )
  );

  loadRawMaterial$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.loadRawMaterial),
      mergeMap(({ id }) =>
        this.rawMaterialService.getById(id).pipe(
          map((rawMaterial: RawMaterialResponseDTO) =>
            RawMaterialActions.loadRawMaterialSuccess({ rawMaterial })
          ),
          catchError((error) =>
            of(RawMaterialActions.loadRawMaterialFailure({ error: error.message }))
          )
        )
      )
    )
  );

  createRawMaterial$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.createRawMaterial),
      mergeMap(({ rawMaterial }) =>
        this.rawMaterialService.create(rawMaterial).pipe(
          map((rawMaterial: RawMaterialResponseDTO) =>
            RawMaterialActions.createRawMaterialSuccess({ rawMaterial })
          ),
          catchError((error) =>
            of(RawMaterialActions.createRawMaterialFailure({ error: error.message }))
          )
        )
      )
    )
  );

  createRawMaterialSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RawMaterialActions.createRawMaterialSuccess),
        tap(() => {
          this.toastService.success('Raw Material created successfully');
          this.router.navigate(['/raw-materials']);
        })
      ),
    { dispatch: false }
  );

  updateRawMaterial$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.updateRawMaterial),
      mergeMap(({ id, rawMaterial }) =>
        this.rawMaterialService.update(id, rawMaterial).pipe(
          map((rawMaterial: RawMaterialResponseDTO) =>
            RawMaterialActions.updateRawMaterialSuccess({ rawMaterial })
          ),
          catchError((error) =>
            of(RawMaterialActions.updateRawMaterialFailure({ error: error.message }))
          )
        )
      )
    )
  );

  updateRawMaterialSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RawMaterialActions.updateRawMaterialSuccess),
        tap(() => {
          this.toastService.success('Raw Material updated successfully');
          this.router.navigate(['/raw-materials']);
        })
      ),
    { dispatch: false }
  );

  deleteRawMaterial$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RawMaterialActions.deleteRawMaterial),
      mergeMap(({ id }) =>
        this.rawMaterialService.delete(id).pipe(
          map(() => RawMaterialActions.deleteRawMaterialSuccess({ id })),
          catchError((error) =>
            of(RawMaterialActions.deleteRawMaterialFailure({ error: error.message }))
          )
        )
      )
    )
  );

  deleteRawMaterialSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RawMaterialActions.deleteRawMaterialSuccess),
        tap(() => {
          this.toastService.success('Raw Material deleted successfully');
        })
      ),
    { dispatch: false }
  );

  rawMaterialFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          RawMaterialActions.loadRawMaterialsFailure,
          RawMaterialActions.loadRawMaterialFailure,
          RawMaterialActions.createRawMaterialFailure,
          RawMaterialActions.updateRawMaterialFailure,
          RawMaterialActions.deleteRawMaterialFailure
        ),
        tap(({ error }) => {
          this.toastService.error(error);
        })
      ),
    { dispatch: false }
  );
}

