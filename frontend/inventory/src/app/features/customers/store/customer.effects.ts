import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { CustomerService } from '../services/customer.service';
import { ToastService } from '../../../core/services/toast.service';
import * as CustomerActions from './customer.actions';

@Injectable()
export class CustomerEffects {
  private actions$ = inject(Actions);
  private customerService = inject(CustomerService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  loadCustomers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.loadCustomers),
      switchMap(() =>
        this.customerService.getAll().pipe(
          map(customers => CustomerActions.loadCustomersSuccess({ customers })),
          catchError(error => of(CustomerActions.loadCustomersFailure({ error: error.message })))
        )
      )
    )
  );

  loadCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.loadCustomer),
      switchMap(({ id }) =>
        this.customerService.getById(id).pipe(
          map(customer => CustomerActions.loadCustomerSuccess({ customer })),
          catchError(error => of(CustomerActions.loadCustomerFailure({ error: error.message })))
        )
      )
    )
  );

  searchCustomers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.searchCustomers),
      switchMap(({ query }) =>
        this.customerService.search(query).pipe(
          map(customers => CustomerActions.searchCustomersSuccess({ customers })),
          catchError(error => of(CustomerActions.searchCustomersFailure({ error: error.message })))
        )
      )
    )
  );

  createCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.createCustomer),
      switchMap(({ customer }) =>
        this.customerService.create(customer).pipe(
          map(created => CustomerActions.createCustomerSuccess({ customer: created })),
          catchError(error => of(CustomerActions.createCustomerFailure({ error: error.message })))
        )
      )
    )
  );

  createCustomerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CustomerActions.createCustomerSuccess),
        tap(() => {
          this.toastService.success('Customer created successfully');
          this.router.navigate(['/customers']);
        })
      ),
    { dispatch: false }
  );

  updateCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.updateCustomer),
      switchMap(({ id, customer }) =>
        this.customerService.update(id, customer).pipe(
          map(updated => CustomerActions.updateCustomerSuccess({ customer: updated })),
          catchError(error => of(CustomerActions.updateCustomerFailure({ error: error.message })))
        )
      )
    )
  );

  updateCustomerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CustomerActions.updateCustomerSuccess),
        tap(() => {
          this.toastService.success('Customer updated successfully');
          this.router.navigate(['/customers']);
        })
      ),
    { dispatch: false }
  );

  deleteCustomer$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CustomerActions.deleteCustomer),
      switchMap(({ id }) =>
        this.customerService.delete(id).pipe(
          map(() => CustomerActions.deleteCustomerSuccess({ id })),
          catchError(error => of(CustomerActions.deleteCustomerFailure({ error: error.message })))
        )
      )
    )
  );

  deleteCustomerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CustomerActions.deleteCustomerSuccess),
        tap(() => this.toastService.success('Customer deleted successfully'))
      ),
    { dispatch: false }
  );

  handleFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          CustomerActions.loadCustomersFailure,
          CustomerActions.loadCustomerFailure,
          CustomerActions.createCustomerFailure,
          CustomerActions.updateCustomerFailure,
          CustomerActions.deleteCustomerFailure
        ),
        tap(({ error }) => this.toastService.error(error || 'An error occurred'))
      ),
    { dispatch: false }
  );
}
