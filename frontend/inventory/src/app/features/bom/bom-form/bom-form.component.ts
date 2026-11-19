import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { BOMResponseDTO } from '../models/bom.model';
import { ProductResponseDTO } from '../../products/models/product.model';
import { RawMaterialResponseDTO } from '../../raw-materials/models/raw-material.model';
import { selectSelectedBOM, selectBOMsLoading } from '../store/bom.selectors';
import { selectAllProducts } from '../../products/store/product.selectors';
import { selectAllRawMaterials } from '../../raw-materials/store/raw-material.selectors';
import * as BOMActions from '../store/bom.actions';
import * as ProductActions from '../../products/store/product.actions';
import * as RawMaterialActions from '../../raw-materials/store/raw-material.actions';

@Component({
  selector: 'app-bom-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputNumberModule,
    DropdownModule,
    ButtonModule,
    PageHeaderComponent
  ],
  templateUrl: './bom-form.component.html',
  styleUrl: './bom-form.component.css'
})
export class BOMFormComponent implements OnInit {
  bomForm: FormGroup;
  loading$: Observable<boolean>;
  isEditMode = false;
  bomId: number | null = null;
  selectedBOM$: Observable<BOMResponseDTO | null>;
  products$: Observable<ProductResponseDTO[]>;
  rawMaterials$: Observable<RawMaterialResponseDTO[]>;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.selectedBOM$ = this.store.select(selectSelectedBOM);
    this.loading$ = this.store.select(selectBOMsLoading);
    this.products$ = this.store.select(selectAllProducts);
    this.rawMaterials$ = this.store.select(selectAllRawMaterials);

    this.bomForm = this.fb.group({
      productId: [null, Validators.required],
      materialId: [null, Validators.required],
      qtyRequired: [0, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit(): void {
    // Load products and raw materials for dropdowns
    this.store.dispatch(ProductActions.loadProducts());
    this.store.dispatch(RawMaterialActions.loadRawMaterials());

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.bomId = +params['id'];
        this.store.dispatch(BOMActions.loadBOM({ id: this.bomId }));
        
        this.selectedBOM$.subscribe(bom => {
          if (bom) {
            this.bomForm.patchValue({
              productId: bom.productId,
              materialId: bom.materialId,
              qtyRequired: bom.qtyRequired
            });
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.bomForm.valid) {
      const formValue = this.bomForm.value;
      
      if (this.isEditMode && this.bomId) {
        this.selectedBOM$.subscribe(bom => {
          if (bom) {
            const updatedBOM: BOMResponseDTO = {
              id: this.bomId!,
              productId: formValue.productId,
              productName: bom.productName,
              materialId: formValue.materialId,
              materialName: bom.materialName,
              qtyRequired: formValue.qtyRequired
            };
            this.store.dispatch(BOMActions.updateBOM({ id: this.bomId!, bom: updatedBOM }));
          }
        }).unsubscribe();
      } else {
        this.store.dispatch(BOMActions.createBOM({ bom: formValue }));
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/bom']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bomForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.bomForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    
    if (field?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be greater than 0`;
    }
    
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      productId: 'Product',
      materialId: 'Raw Material',
      qtyRequired: 'Quantity Required'
    };
    return labels[fieldName] || fieldName;
  }
}
