import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { InvoiceService } from '../services/invoice.service';
import { ToastService } from '../../../core/services/toast.service';
import * as InvoiceActions from './invoice.actions';

@Injectable()
export class InvoiceEffects {
  private actions$ = inject(Actions);
  private invoiceService = inject(InvoiceService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  loadInvoices$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoiceActions.loadInvoices),
      switchMap(() =>
        this.invoiceService.getAll().pipe(
          map(invoices => InvoiceActions.loadInvoicesSuccess({ invoices })),
          catchError(error => of(InvoiceActions.loadInvoicesFailure({ error: error.message })))
        )
      )
    )
  );

  loadInvoice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoiceActions.loadInvoice),
      switchMap(({ id }) =>
        this.invoiceService.getById(id).pipe(
          map(invoice => InvoiceActions.loadInvoiceSuccess({ invoice })),
          catchError(error => of(InvoiceActions.loadInvoiceFailure({ error: error.message })))
        )
      )
    )
  );

  createInvoice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoiceActions.createInvoice),
      switchMap(({ invoice }) =>
        this.invoiceService.create(invoice).pipe(
          map(created => InvoiceActions.createInvoiceSuccess({ invoice: created })),
          catchError(error => of(InvoiceActions.createInvoiceFailure({ error: error.message })))
        )
      )
    )
  );

  createInvoiceSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(InvoiceActions.createInvoiceSuccess),
        tap(({ invoice }) => {
          this.toastService.success(`Invoice ${invoice.invoiceNumber} created successfully`);
          this.router.navigate(['/invoices', invoice.id]);
        })
      ),
    { dispatch: false }
  );

  cancelInvoice$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoiceActions.cancelInvoice),
      switchMap(({ id }) =>
        this.invoiceService.cancel(id).pipe(
          map(() => InvoiceActions.cancelInvoiceSuccess({ id })),
          catchError(error => of(InvoiceActions.cancelInvoiceFailure({ error: error.message })))
        )
      )
    )
  );

  cancelInvoiceSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(InvoiceActions.cancelInvoiceSuccess),
        tap(() => {
          this.toastService.success('Invoice cancelled successfully');
          // Reload to refresh data
          this.actions$.pipe(ofType(InvoiceActions.loadInvoice));
        })
      ),
    { dispatch: false }
  );

  addPayment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoiceActions.addPayment),
      switchMap(({ invoiceId, payment }) =>
        this.invoiceService.addPayment(invoiceId, payment).pipe(
          map(() => InvoiceActions.addPaymentSuccess({ invoiceId })),
          catchError(error => {
            // Extract backend error message
            const errorMessage = error.error?.message || error.message || 'Failed to add payment';
            return of(InvoiceActions.addPaymentFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  addPaymentSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(InvoiceActions.addPaymentSuccess),
        tap(({ invoiceId }) => {
          this.toastService.success('Payment added successfully');
          // Invoice will be reloaded via the component
        })
      ),
    { dispatch: false }
  );

  downloadPdf$ = createEffect(() =>
    this.actions$.pipe(
      ofType(InvoiceActions.downloadPdf),
      switchMap(({ id }) =>
        this.invoiceService.downloadPdf(id).pipe(
          tap(blob => {
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `invoice-${id}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
          }),
          map(() => InvoiceActions.downloadPdfSuccess()),
          catchError(error => of(InvoiceActions.downloadPdfFailure({ error: error.message })))
        )
      )
    )
  );

  downloadPdfSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(InvoiceActions.downloadPdfSuccess),
        tap(() => this.toastService.success('Invoice PDF downloaded'))
      ),
    { dispatch: false }
  );

  handleFailure$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          InvoiceActions.loadInvoicesFailure,
          InvoiceActions.loadInvoiceFailure,
          InvoiceActions.createInvoiceFailure,
          InvoiceActions.cancelInvoiceFailure,
          InvoiceActions.addPaymentFailure,
          InvoiceActions.downloadPdfFailure
        ),
        tap(({ error }) => this.toastService.error(error || 'An error occurred'))
      ),
    { dispatch: false }
  );
}
