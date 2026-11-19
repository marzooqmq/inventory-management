import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { InvoiceResponseDTO } from '../models/invoice.model';
import { InvoiceService } from '../services/invoice.service';
import * as InvoiceActions from '../store/invoice.actions';
import * as InvoiceSelectors from '../store/invoice.selectors';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    DialogModule,
    InputNumberModule,
    PageHeaderComponent,
    ConfirmDialogComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.css'
})
export class InvoiceDetailComponent implements OnInit, OnDestroy {
  invoice$: Observable<InvoiceResponseDTO | null>;
  loading$: Observable<boolean>;
  invoiceId!: number;
  showPaymentDialog = false;
  paymentForm: FormGroup;
  paymentError: string = '';
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private invoiceService: InvoiceService
  ) {
    this.invoice$ = this.store.select(InvoiceSelectors.selectSelectedInvoice);
    this.loading$ = this.store.select(InvoiceSelectors.selectInvoicesLoading);
    this.paymentForm = this.fb.group({
      paidAmount: [null, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.invoiceId = +params['id'];
      this.store.dispatch(InvoiceActions.loadInvoice({ id: this.invoiceId }));
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onBack(): void {
    this.router.navigate(['/invoices']);
  }

  onDownloadPdf(): void {
    this.store.dispatch(InvoiceActions.downloadPdf({ id: this.invoiceId }));
  }

  onPrint(): void {
    // Get current invoice data
    this.invoice$.subscribe(invoice => {
      if (invoice) {
        // Download and print the backend-generated PDF in same page
        this.invoiceService.downloadPdf(invoice.id).subscribe({
          next: (blob: Blob) => {
            const url = window.URL.createObjectURL(blob);
            
            // Create hidden iframe for printing
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = url;
            document.body.appendChild(iframe);
            
            // Print when loaded
            iframe.onload = () => {
              iframe.contentWindow?.print();
              // Clean up after print
              setTimeout(() => {
                document.body.removeChild(iframe);
                window.URL.revokeObjectURL(url);
              }, 1000);
            };
          },
          error: () => {
            this.toastService.error('Failed to load PDF for printing');
          }
        });
      }
    }).unsubscribe();
  }

  onAddPayment(): void {
    this.showPaymentDialog = true;
    this.paymentForm.reset();
    this.paymentError = ''; // Clear any previous errors
  }

  submitPayment(invoice: InvoiceResponseDTO): void {
    // Clear previous error
    this.paymentError = '';
    
    if (this.paymentForm.valid) {
      const payment = this.paymentForm.value;
      
      // Basic validation: Check if payment amount is provided
      if (!payment.paidAmount || payment.paidAmount <= 0) {
        this.paymentError = 'Please enter a valid payment amount';
        return;
      }
      
      // Let backend handle all business validation (overpayment, cancelled invoice, etc.)
      this.invoiceService.addPayment(this.invoiceId, payment)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success('Payment added successfully');
            this.showPaymentDialog = false;
            this.paymentError = '';
            // Reload invoice
            setTimeout(() => {
              this.store.dispatch(InvoiceActions.loadInvoice({ id: this.invoiceId }));
            }, 500);
          },
          error: (err: any) => {
            // Display backend error message in dialog field
            let errorMessage = 'Failed to add payment';
            
            // Try different error structures
            if (err.error && typeof err.error === 'object' && err.error.message) {
              errorMessage = err.error.message;
            } else if (err.error && typeof err.error === 'string') {
              // Try to parse as JSON first
              try {
                const parsedError = JSON.parse(err.error);
                errorMessage = parsedError.message || parsedError.error || err.error;
              } catch {
                errorMessage = err.error;
              }
            } else if (err.message) {
              errorMessage = err.message;
            }
            
            this.paymentError = errorMessage;
          }
        });
    } else {
      this.paymentError = 'Please fill in all required fields';
    }
  }

  onCancelInvoice(invoice: InvoiceResponseDTO): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to cancel invoice ${invoice.invoiceNumber}? This will restore the stock.`,
      header: 'Cancel Invoice',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(InvoiceActions.cancelInvoice({ id: this.invoiceId }));
        setTimeout(() => {
          this.store.dispatch(InvoiceActions.loadInvoice({ id: this.invoiceId }));
        }, 500);
      }
    });
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'CREATED': return 'info';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'danger';
      default: return 'secondary';
    }
  }

  getPaymentSeverity(paymentStatus: string): string {
    switch (paymentStatus) {
      case 'PAID': return 'success';
      case 'PARTIALLY_PAID': return 'warning';
      case 'UNPAID': return 'danger';
      default: return 'secondary';
    }
  }

  getPaymentStatusLabel(paymentStatus: string): string {
    switch (paymentStatus) {
      case 'PAID': return 'Paid';
      case 'PARTIALLY_PAID': return 'Partially Paid';
      case 'UNPAID': return 'Unpaid';
      default: return paymentStatus;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  canAddPayment(invoice: InvoiceResponseDTO): boolean {
    return (invoice.status === 'CREATED' || invoice.status === 'COMPLETED') && 
           (invoice.paymentStatus === 'UNPAID' || invoice.paymentStatus === 'PARTIALLY_PAID');
  }

  canCancelInvoice(invoice: InvoiceResponseDTO): boolean {
    return invoice.status === 'CREATED';
  }

  getRemainingAmount(invoice: InvoiceResponseDTO): number {
    const paidAmount = invoice.paidAmount || 0;
    return invoice.netAmount - paidAmount;
  }
}
