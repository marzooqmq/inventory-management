import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ProductionOrderService } from '../../services/production-order.service';
import { ProductService } from '../../../products/services/product.service';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    ToastModule,
    PageHeaderComponent
  ],
  templateUrl: './order-form.component.html',
  styleUrl: './order-form.component.css'
})
export class OrderFormComponent implements OnInit {
  orderForm!: FormGroup;
  products: any[] = [];
  isEditMode = false;
  orderId: number | null = null;
  loading = false;
  submitting = false;
  minDate = new Date();

  constructor(
    private fb: FormBuilder,
    private productionOrderService: ProductionOrderService,
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadProducts();
    this.checkEditMode();
  }

  initForm(): void {
    this.orderForm = this.fb.group({
      productId: [null, Validators.required],
      quantity: [null, [Validators.required, Validators.min(1)]]
    });
  }

  loadProducts(): void {
    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data.map(p => ({
          label: p.name,
          value: p.id
        }));
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load products'
        });
      }
    });
  }

  checkEditMode(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.orderId = +id;
      this.loadOrder();
    }
  }

  loadOrder(): void {
    if (!this.orderId) return;
    
    this.loading = true;
    this.productionOrderService.getById(this.orderId).subscribe({
      next: (order) => {
        this.orderForm.patchValue({
          productId: this.products.find(p => p.label === order.productName)?.value,
          quantity: order.quantity
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load production order'
        });
        this.loading = false;
        this.goBack();
      }
    });
  }

  onSubmit(): void {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.orderForm.value;
    const request = {
      productId: formValue.productId,
      quantity: formValue.quantity
    };

    const operation = this.isEditMode && this.orderId
      ? this.productionOrderService.update(this.orderId, request)
      : this.productionOrderService.create(request);

    operation.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `Production order ${this.isEditMode ? 'updated' : 'created'} successfully`
        });
        this.goBack();
      },
      error: (error) => {
        console.error('Error saving order:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${this.isEditMode ? 'update' : 'create'} production order`
        });
        this.submitting = false;
      }
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  goBack(): void {
    this.router.navigate(['/production/orders']);
  }

  get f() {
    return this.orderForm.controls;
  }
}
