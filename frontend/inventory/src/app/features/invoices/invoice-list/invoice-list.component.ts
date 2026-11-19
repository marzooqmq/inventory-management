import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { InvoiceResponseDTO } from '../models/invoice.model';
import { InvoiceService } from '../services/invoice.service';
import { ToastService } from '../../../core/services/toast.service';
import * as InvoiceActions from '../store/invoice.actions';
import * as InvoiceSelectors from '../store/invoice.selectors';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    DropdownModule,
    DialogModule,
    InputNumberModule,
    PageHeaderComponent
  ],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.css'
})
export class InvoiceListComponent implements OnInit, OnDestroy {
  invoices$: Observable<InvoiceResponseDTO[]>;
  filteredInvoices$: Observable<InvoiceResponseDTO[]>;
  loading$: Observable<boolean>;
  searchControl = new FormControl('');
  statusFilter = new FormControl('ALL');
  paymentFilter = new FormControl('ALL');
  private destroy$ = new Subject<void>();

  showPaymentDialog = false;
  paymentAmount: number | null = null;
  selectedInvoice: InvoiceResponseDTO | null = null;
  paymentError: string = '';

  statusOptions = [
    { label: 'All Status', value: 'ALL' },
    { label: 'Created', value: 'CREATED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  paymentOptions = [
    { label: 'All Payments', value: 'ALL' },
    { label: 'Unpaid', value: 'UNPAID' },
    { label: 'Partially Paid', value: 'PARTIALLY_PAID' },
    { label: 'Paid', value: 'PAID' }
  ];

  constructor(
    private store: Store,
    private router: Router,
    private invoiceService: InvoiceService,
    private toastService: ToastService
  ) {
    this.invoices$ = this.store.select(InvoiceSelectors.selectAllInvoices);
    this.loading$ = this.store.select(InvoiceSelectors.selectInvoicesLoading);
    this.filteredInvoices$ = this.invoices$;
  }

  ngOnInit(): void {
    this.store.dispatch(InvoiceActions.loadInvoices());
    
    // Search functionality
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => this.applyFilters());

    // Status filter
    this.statusFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());

    // Payment filter
    this.paymentFilter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private applyFilters(): void {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    const status = this.statusFilter.value;
    const payment = this.paymentFilter.value;

    this.filteredInvoices$ = this.invoices$.pipe(
      map(invoices => {
        let filtered = invoices;

        // Search filter
        if (searchTerm) {
          filtered = filtered.filter(inv =>
            inv.invoiceNumber.toLowerCase().includes(searchTerm) ||
            inv.customerName.toLowerCase().includes(searchTerm) ||
            inv.phoneNumber.includes(searchTerm)
          );
        }

        // Status filter
        if (status && status !== 'ALL') {
          filtered = filtered.filter(inv => inv.status === status);
        }

        // Payment filter
        if (payment && payment !== 'ALL') {
          filtered = filtered.filter(inv => inv.paymentStatus === payment);
        }

        return filtered;
      })
    );
  }

  onCreateInvoice(): void {
    this.router.navigate(['/invoices/new']);
  }

  onViewInvoice(id: number): void {
    this.router.navigate(['/invoices', id]);
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

  getPaymentStatusLabel(status: string): string {
    switch (status) {
      case 'PAID': return 'Paid';
      case 'PARTIALLY_PAID': return 'Partial';
      case 'UNPAID': return 'Unpaid';
      default: return status;
    }
  }

  onAddPayment(invoice: InvoiceResponseDTO): void {
    this.selectedInvoice = invoice;
    this.paymentAmount = null;
    this.paymentError = '';
    this.showPaymentDialog = true;
  }

  confirmPayment(): void {
    // Clear previous error
    this.paymentError = '';
    
    if (!this.selectedInvoice) {
      this.paymentError = 'Please select an invoice';
      return;
    }

    if (!this.paymentAmount || this.paymentAmount <= 0) {
      this.paymentError = 'Please enter a valid payment amount';
      return;
    }

    // Let backend handle all business validation (overpayment, cancelled invoice, etc.)
    const payment = { paidAmount: this.paymentAmount };
    this.invoiceService.addPayment(this.selectedInvoice.id, payment)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.toastService.success('Payment added successfully');
          this.store.dispatch(InvoiceActions.loadInvoices());
          this.showPaymentDialog = false;
          this.selectedInvoice = null;
          this.paymentAmount = null;
          this.paymentError = '';
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
  }

  onCancelInvoice(invoiceId: number): void {
    if (confirm('Are you sure you want to cancel this invoice? Stock will be restored.')) {
      this.invoiceService.cancel(invoiceId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.toastService.success('Invoice cancelled successfully');
            this.store.dispatch(InvoiceActions.loadInvoices());
          },
          error: (err: any) => {
            this.toastService.error('Failed to cancel invoice: ' + err.error.message);
          }
        });
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
      month: 'short',
      year: 'numeric'
    });
  }
}
