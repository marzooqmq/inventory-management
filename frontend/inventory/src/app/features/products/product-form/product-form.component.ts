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
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ProductCategory, ProductSize, ProductResponseDTO } from '../models/product.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import * as ProductActions from '../store/product.actions';
import * as ProductSelectors from '../store/product.selectors';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    InputTextareaModule,
    CheckboxModule,
    ButtonModule,
    PageHeaderComponent
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  loading$: Observable<boolean>;
  isEditMode = false;
  productId?: number;

  categories = [
    { label: 'Ultra Thin', value: ProductCategory.ULTRA_THIN },
    { label: 'Premium', value: ProductCategory.PREMIUM },
    { label: 'Liner', value: ProductCategory.LINER },
    { label: 'NA', value: ProductCategory.NA }
  ];

  sizes = [
    { label: 'XL', value: ProductSize.XL },
    { label: 'XXL', value: ProductSize.XXL },
    { label: 'XXXL', value: ProductSize.XXXL },
    { label: 'NA', value: ProductSize.NA }
  ];

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loading$ = this.store.select(ProductSelectors.selectProductsLoading);
    this.productForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = +params['id'];
        this.loadProduct(this.productId);
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: [null, Validators.required],
      size: [null, Validators.required],
      description: [''],
      padsPerBox: [null, [Validators.required, Validators.min(1)]],
      mrp: [null, [Validators.required, Validators.min(0)]],
      active: [true]
    });
  }

  private loadProduct(id: number): void {
    this.store.dispatch(ProductActions.loadProduct({ id }));
    
    this.store.select(ProductSelectors.selectSelectedProduct).subscribe(product => {
      if (product) {
        this.patchForm(product);
      }
    });
  }

  private patchForm(product: ProductResponseDTO): void {
    this.productForm.patchValue({
      name: product.name,
      category: product.category,
      size: product.size,
      description: product.description,
      padsPerBox: product.padsPerBox,
      mrp: product.mrp,
      active: product.active
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.markFormGroupTouched(this.productForm);
      return;
    }

    const formValue = this.productForm.value;

    if (this.isEditMode && this.productId) {
      this.store.dispatch(ProductActions.updateProduct({ 
        id: this.productId, 
        product: formValue 
      }));
    } else {
      this.store.dispatch(ProductActions.createProduct({ product: formValue }));
    }
  }

  onCancel(): void {
    this.router.navigate(['/products']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.productForm.get(fieldName);
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('minlength')) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    }
    if (control?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be at least ${control.errors?.['min'].min}`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Product Name',
      category: 'Category',
      size: 'Size',
      padsPerBox: 'Pads Per Box',
      mrp: 'MRP'
    };
    return labels[fieldName] || fieldName;
  }
}

export default ProductFormComponent;
