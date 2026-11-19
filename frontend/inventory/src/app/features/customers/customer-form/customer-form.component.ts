import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CustomerType, CustomerResponseDTO } from '../models/customer.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import * as CustomerActions from '../store/customer.actions';
import * as CustomerSelectors from '../store/customer.selectors';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    InputTextareaModule,
    ButtonModule,
    PageHeaderComponent
  ],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.css'
})
export class CustomerFormComponent implements OnInit {
  customerForm: FormGroup;
  loading$: Observable<boolean>;
  isEditMode = false;
  customerId?: number;

  customerTypes = [
    { label: 'Distributor (Buys in Cases)', value: CustomerType.DISTRIBUTOR },
    { label: 'Dealer', value: CustomerType.DEALER },
    { label: 'Direct Customer (Retail)', value: CustomerType.DIRECT_CUSTOMER }
  ];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loading$ = this.store.select(CustomerSelectors.selectCustomersLoading);
    this.customerForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.customerId = +params['id'];
        this.loadCustomer(this.customerId);
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      type: [null, Validators.required],
      discount: [0, [Validators.min(0), Validators.max(100)]],
      address: [''],
      district: [''],
      state: [''],
      country: ['India'],
      zipCode: ['', Validators.pattern(/^[0-9]{6}$/)]
    });
  }

  private loadCustomer(id: number): void {
    this.store.dispatch(CustomerActions.loadCustomer({ id }));
    
    this.store.select(CustomerSelectors.selectSelectedCustomer).subscribe(customer => {
      if (customer) {
        this.patchForm(customer);
      }
    });
  }

  private patchForm(customer: CustomerResponseDTO): void {
    this.customerForm.patchValue({
      name: customer.name,
      phone: customer.phone,
      type: customer.type,
      discount: customer.discount || 0,
      address: customer.address || '',
      district: customer.district || '',
      state: customer.state || '',
      country: customer.country || 'India',
      zipCode: customer.zipCode || ''
    });
  }

  onSubmit(): void {
    if (this.customerForm.valid) {
      const customerData = this.customerForm.value;
      
      if (this.isEditMode && this.customerId) {
        this.store.dispatch(
          CustomerActions.updateCustomer({
            id: this.customerId,
            customer: customerData
          })
        );
      } else {
        this.store.dispatch(CustomerActions.createCustomer({ customer: customerData }));
      }
    } else {
      this.markFormGroupTouched(this.customerForm);
    }
  }

  onCancel(): void {
    this.router.navigate(['/customers']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.customerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.customerForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum ${minLength} characters required`;
    }
    
    if (field?.hasError('pattern')) {
      if (fieldName === 'phone') {
        return 'Please enter a valid 10-digit phone number';
      }
      if (fieldName === 'zipCode') {
        return 'Please enter a valid 6-digit PIN code';
      }
    }
    
    if (field?.hasError('min')) {
      return 'Value must be greater than or equal to 0';
    }
    
    if (field?.hasError('max')) {
      return 'Discount cannot exceed 100%';
    }
    
    return '';
  }
}
