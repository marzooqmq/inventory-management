import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { RippleModule } from 'primeng/ripple';
import * as ProductConversionActions from '../store/product-conversion.actions';
import * as ProductConversionSelectors from '../store/product-conversion.selectors';
import * as ProductSelectors from '../../products/store/product.selectors';
import * as ProductActions from '../../products/store/product.actions';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProductResponseDTO } from '../../products/models/product.model';
import { UnitType } from '../models/product-conversion.model';

@Component({
  selector: 'app-product-conversion-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputNumberModule, ButtonModule, DropdownModule, RippleModule, PageHeaderComponent],
  templateUrl: './product-conversion-form.component.html',
  styleUrl: './product-conversion-form.component.css'
})
export class ProductConversionFormComponent implements OnInit, OnDestroy {
  productConversionForm: FormGroup;
  loading$: Observable<boolean>;
  products$: Observable<ProductResponseDTO[]>;
  unitTypes = [
    { label: 'Box', value: UnitType.BOX },
    { label: 'Case', value: UnitType.CASE }
  ];
  isEditMode = false;
  productConversionId?: number;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private store: Store, private route: ActivatedRoute, private router: Router) {
    this.loading$ = this.store.select(ProductConversionSelectors.selectProductConversionsLoading);
    this.products$ = this.store.select(ProductSelectors.selectAllProducts);
    this.productConversionForm = this.fb.group({ productId: [null, Validators.required], unitName: [null, Validators.required], boxesPerUnit: [0, [Validators.required, Validators.min(1)]] });
  }

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());
    this.store.dispatch(ProductConversionActions.loadProductConversions());
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productConversionId = +id;
      this.store.select(ProductConversionSelectors.selectAllProductConversions).pipe(takeUntil(this.destroy$)).subscribe(productConversions => {
        const productConversion = productConversions.find(pc => pc.id === this.productConversionId);
        if (productConversion) this.productConversionForm.patchValue(productConversion);
      });
    }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  onSubmit(): void {
    if (this.productConversionForm.valid) {
      const formValue = this.productConversionForm.value;
      if (this.isEditMode && this.productConversionId) {
        this.store.dispatch(ProductConversionActions.updateProductConversion({ id: this.productConversionId, productConversion: formValue }));
      } else {
        this.store.dispatch(ProductConversionActions.createProductConversion({ productConversion: formValue }));
      }
    }
  }

  onCancel(): void { this.router.navigate(['/product-conversions']); }

  isFieldInvalid(fieldName: string): boolean { const field = this.productConversionForm.get(fieldName); return !!(field && field.invalid && field.touched); }

  getErrorMessage(fieldName: string): string {
    const field = this.productConversionForm.get(fieldName);
    if (field?.hasError('required')) return `${this.getFieldLabel(fieldName)} is required`;
    if (field?.hasError('min')) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors?.['min'].min}`;
    if (field?.hasError('minlength')) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors?.['minlength'].requiredLength} characters`;
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = { productId: 'Product', unitName: 'Unit type', boxesPerUnit: 'Boxes per unit' };
    return labels[fieldName] || fieldName;
  }
}
