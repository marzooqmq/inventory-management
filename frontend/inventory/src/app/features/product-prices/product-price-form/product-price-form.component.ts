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
import * as ProductPriceActions from '../store/product-price.actions';
import * as ProductPriceSelectors from '../store/product-price.selectors';
import * as ProductSelectors from '../../products/store/product.selectors';
import * as ProductActions from '../../products/store/product.actions';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ProductResponseDTO } from '../../products/models/product.model';
import { CustomerType } from '../models/product-price.model';

@Component({
  selector: 'app-product-price-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputNumberModule, ButtonModule, DropdownModule, RippleModule, PageHeaderComponent],
  templateUrl: './product-price-form.component.html',
  styleUrl: './product-price-form.component.css'
})
export class ProductPriceFormComponent implements OnInit, OnDestroy {
  productPriceForm: FormGroup;
  loading$: Observable<boolean>;
  products$: Observable<ProductResponseDTO[]>;
  customerTypes = [{ label: 'Distributor', value: CustomerType.DISTRIBUTOR }, { label: 'Dealer', value: CustomerType.DEALER }, { label: 'Direct Customer', value: CustomerType.DIRECT_CUSTOMER }];
  isEditMode = false;
  productPriceId?: number;
  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder, private store: Store, private route: ActivatedRoute, private router: Router) {
    this.loading$ = this.store.select(ProductPriceSelectors.selectProductPricesLoading);
    this.products$ = this.store.select(ProductSelectors.selectAllProducts);
    this.productPriceForm = this.fb.group({ productId: [null, Validators.required], customerType: [null, Validators.required], pricePerBox: [0, [Validators.required, Validators.min(0)]] });
  }

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());
    this.store.dispatch(ProductPriceActions.loadProductPrices());
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.productPriceId = +id;
      this.store.select(ProductPriceSelectors.selectAllProductPrices).pipe(takeUntil(this.destroy$)).subscribe(productPrices => {
        const productPrice = productPrices.find(pp => pp.id === this.productPriceId);
        if (productPrice) this.productPriceForm.patchValue(productPrice);
      });
    }
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  onSubmit(): void {
    if (this.productPriceForm.valid) {
      const formValue = this.productPriceForm.value;
      if (this.isEditMode && this.productPriceId) {
        this.store.dispatch(ProductPriceActions.updateProductPrice({ id: this.productPriceId, productPrice: formValue }));
      } else {
        this.store.dispatch(ProductPriceActions.createProductPrice({ productPrice: formValue }));
      }
    }
  }

  onCancel(): void { this.router.navigate(['/product-prices']); }

  isFieldInvalid(fieldName: string): boolean { const field = this.productPriceForm.get(fieldName); return !!(field && field.invalid && field.touched); }

  getErrorMessage(fieldName: string): string {
    const field = this.productPriceForm.get(fieldName);
    if (field?.hasError('required')) return `${this.getFieldLabel(fieldName)} is required`;
    if (field?.hasError('min')) return `${this.getFieldLabel(fieldName)} must be at least ${field.errors?.['min'].min}`;
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = { productId: 'Product', customerType: 'Customer type', pricePerBox: 'Price per box' };
    return labels[fieldName] || fieldName;
  }
}
