import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService } from 'primeng/api';
import { CustomerResponseDTO } from '../models/customer.model';
import { CustomerService } from '../services/customer.service';
import * as CustomerActions from '../store/customer.actions';
import * as CustomerSelectors from '../store/customer.selectors';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    InputTextareaModule,
    InputTextModule,
    PageHeaderComponent,
    ConfirmDialogComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit, OnDestroy {
  customers$: Observable<CustomerResponseDTO[]>;
  filteredCustomers$: Observable<CustomerResponseDTO[]>;
  loading$: Observable<boolean>;
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  // Edit dialog
  showEditDialog = false;
  editingSaving = false;
  editingCustomer: CustomerResponseDTO | null = null;
  editCustomerForm: FormGroup;

  readonly customerTypeOptions = [
    { label: 'Distributor',     value: 'DISTRIBUTOR' },
    { label: 'Dealer',          value: 'DEALER' },
    { label: 'Direct Customer', value: 'DIRECT_CUSTOMER' }
  ];

  constructor(
    private store: Store,
    private fb: FormBuilder,
    private customerService: CustomerService,
    private confirmationService: ConfirmationService
  ) {
    this.customers$ = this.store.select(CustomerSelectors.selectAllCustomers);
    this.loading$ = this.store.select(CustomerSelectors.selectCustomersLoading);
    this.filteredCustomers$ = this.customers$;
    this.editCustomerForm = this.fb.group({
      name:     ['', Validators.required],
      phone:    ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address:  [''],
      district: [''],
      state:    [''],
      country:  ['India'],
      zipCode:  ['', Validators.pattern(/^\d{6}$/)],
      type:     ['DEALER', Validators.required],
      discount: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    this.store.dispatch(CustomerActions.loadCustomers());
    
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(searchTerm => {
        this.filterCustomers(searchTerm || '');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private filterCustomers(searchTerm: string): void {
    this.filteredCustomers$ = this.customers$.pipe(
      map(customers => {
        if (!searchTerm.trim()) {
          return customers;
        }
        
        const term = searchTerm.toLowerCase();
        return customers.filter(customer =>
          customer.name.toLowerCase().includes(term) ||
          customer.phone.includes(term) ||
          customer.type.toLowerCase().includes(term) ||
          customer.district?.toLowerCase().includes(term)
        );
      })
    );
  }

  onEditCustomer(customer: CustomerResponseDTO): void {
    this.editingCustomer = customer;
    this.editCustomerForm.patchValue({
      name:     customer.name,
      phone:    customer.phone,
      address:  customer.address  ?? '',
      district: customer.district ?? '',
      state:    customer.state    ?? '',
      country:  customer.country  ?? 'India',
      zipCode:  customer.zipCode  ?? '',
      type:     customer.type,
      discount: customer.discount ?? 0
    });
    this.showEditDialog = true;
  }

  onSaveCustomer(): void {
    if (this.editCustomerForm.invalid || !this.editingCustomer) return;
    this.editingSaving = true;
    this.customerService.update(this.editingCustomer.id, this.editCustomerForm.value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.store.dispatch(CustomerActions.loadCustomers());
          this.showEditDialog = false;
          this.editingSaving = false;
          this.editingCustomer = null;
        },
        error: (err) => {
          console.error('Error updating customer:', err);
          this.editingSaving = false;
        }
      });
  }

  onDeleteCustomer(customer: CustomerResponseDTO): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${customer.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(CustomerActions.deleteCustomer({ id: customer.id }));
      }
    });
  }

  getCustomerTypeLabel(type: string): string {
    switch (type) {
      case 'DISTRIBUTOR': return 'Distributor';
      case 'DEALER': return 'Dealer';
      case 'DIRECT_CUSTOMER': return 'Direct Customer';
      default: return type;
    }
  }

  getCustomerTypeSeverity(type: string): string {
    switch (type) {
      case 'DISTRIBUTOR': return 'success';
      case 'DEALER': return 'info';
      case 'DIRECT_CUSTOMER': return 'warning';
      default: return 'secondary';
    }
  }
}
