import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { RippleModule } from 'primeng/ripple';

import * as ProductionCostActions from '../store/production-cost.actions';
import * as ProductionCostSelectors from '../store/production-cost.selectors';
import * as ProductSelectors from '../../products/store/product.selectors';
import * as ProductActions from '../../products/store/product.actions';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProductResponseDTO } from '../../products/models/product.model';

@Component({
  selector: 'app-production-cost-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    DropdownModule,
    RippleModule,
    PageHeaderComponent
  ],
  templateUrl: './production-cost-form.component.html',
  styleUrls: ['./production-cost-form.component.css']
})
export class ProductionCostFormComponent implements OnInit, OnDestroy {
  productionCostForm: FormGroup;
  loading$: Observable<boolean>;
  products$: Observable<ProductResponseDTO[]>;
  isEditMode = false;
  productionCostId?: number;
  totalCost = 0;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.loading$ = this.store.select(ProductionCostSelectors.selectProductionCostsLoading);
    this.products$ = this.store.select(ProductSelectors.selectAllProducts);

    this.productionCostForm = this.fb.group({
      productId: [null, Validators.required],
      labourCost: [0, [Validators.required, Validators.min(0)]],
      transportCost: [0, [Validators.required, Validators.min(0)]],
      herbalCost: [0, [Validators.required, Validators.min(0)]],
      machineCost: [0, [Validators.required, Validators.min(0)]],
      overheadCost: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());

    // Subscribe to form value changes to calculate total cost
    this.productionCostForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.calculateTotalCost();
      });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productionCostId = +id;
      this.store.dispatch(ProductionCostActions.loadProductionCost({ id: this.productionCostId }));

      this.store.select(ProductionCostSelectors.selectSelectedProductionCost)
        .pipe(takeUntil(this.destroy$))
        .subscribe(productionCost => {
          if (productionCost) {
            this.productionCostForm.patchValue({
              productId: productionCost.productId,
              labourCost: productionCost.labourCost,
              transportCost: productionCost.transportCost,
              herbalCost: productionCost.herbalCost,
              machineCost: productionCost.machineCost,
              overheadCost: productionCost.overheadCost
            });
            this.calculateTotalCost();
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.store.dispatch(ProductionCostActions.clearSelectedProductionCost());
  }

  calculateTotalCost(): void {
    const formValue = this.productionCostForm.value;
    this.totalCost = 
      (formValue.labourCost || 0) +
      (formValue.transportCost || 0) +
      (formValue.herbalCost || 0) +
      (formValue.machineCost || 0) +
      (formValue.overheadCost || 0);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productionCostForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.productionCostForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be positive`;
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      productId: 'Product',
      labourCost: 'Labour cost',
      transportCost: 'Transport cost',
      herbalCost: 'Herbal cost',
      machineCost: 'Machine cost',
      overheadCost: 'Overhead cost'
    };
    return labels[fieldName] || fieldName;
  }

  onSubmit(): void {
    if (this.productionCostForm.valid) {
      const formValue = this.productionCostForm.value;

      if (this.isEditMode && this.productionCostId) {
        this.store.dispatch(
          ProductionCostActions.updateProductionCost({
            id: this.productionCostId,
            productionCost: formValue
          })
        );
      } else {
        this.store.dispatch(
          ProductionCostActions.createProductionCost({
            productionCost: formValue
          })
        );
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/production-costs']);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
}
