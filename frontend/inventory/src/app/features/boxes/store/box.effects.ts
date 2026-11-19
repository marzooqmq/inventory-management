import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { BoxService } from '../services/box.service';
import * as BoxActions from './box.actions';
import { NotificationService } from '../../../core/services/notification.service';
import { ToastService } from '../../../core/services/toast.service';

@Injectable()
export class BoxEffects {
  
  loadBoxes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoxActions.loadBoxes),
      switchMap(() =>
        this.boxService.getAll().pipe(
          map(boxes => BoxActions.loadBoxesSuccess({ boxes })),
          catchError(error => {
            this.toastService.error('Failed to load boxes');
            return of(BoxActions.loadBoxesFailure({ error: error.message }));
          })
        )
      )
    )
  );

  loadBox$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoxActions.loadBox),
      switchMap(({ id }) =>
        this.boxService.getById(id).pipe(
          map(box => BoxActions.loadBoxSuccess({ box })),
          catchError(error => {
            this.toastService.error('Failed to load box');
            return of(BoxActions.loadBoxFailure({ error: error.message }));
          })
        )
      )
    )
  );

  createBox$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoxActions.createBox),
      switchMap(({ box }) =>
        this.boxService.create(box).pipe(
          map(createdBox => {
            this.toastService.success('Box created successfully');
            return BoxActions.createBoxSuccess({ box: createdBox });
          }),
          catchError(error => {
            this.toastService.error('Failed to create box');
            return of(BoxActions.createBoxFailure({ error: error.message }));
          })
        )
      )
    )
  );

  updateBox$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoxActions.updateBox),
      switchMap(({ id, box }) =>
        this.boxService.update(id, box).pipe(
          map(updatedBox => {
            this.toastService.success('Box updated successfully');
            return BoxActions.updateBoxSuccess({ box: updatedBox });
          }),
          catchError(error => {
            this.toastService.error('Failed to update box');
            return of(BoxActions.updateBoxFailure({ error: error.message }));
          })
        )
      )
    )
  );

  deleteBox$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoxActions.deleteBox),
      switchMap(({ id }) =>
        this.boxService.delete(id).pipe(
          map(() => {
            this.toastService.success('Box deleted successfully');
            return BoxActions.deleteBoxSuccess({ id });
          }),
          catchError(error => {
            this.toastService.error('Failed to delete box');
            return of(BoxActions.deleteBoxFailure({ error: error.message }));
          })
        )
      )
    )
  );

  navigateAfterCreate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BoxActions.createBoxSuccess, BoxActions.updateBoxSuccess),
        tap(() => this.router.navigate(['/boxes']))
      ),
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private boxService: BoxService,
    private toastService: ToastService,
    private router: Router
  ) {}
}

