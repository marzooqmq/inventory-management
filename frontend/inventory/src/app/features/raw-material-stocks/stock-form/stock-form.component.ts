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
import * as MaterialStockActions from '../store/material-stock.actions';
import * as MaterialStockSelectors from '../store/material-stock.selectors';
import * as RawMaterialSelectors from '../../raw-materials/store/raw-material.selectors';
import * as RawMaterialActions from '../../raw-materials/store/raw-material.actions';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RawMaterialResponseDTO } from '../../raw-materials/models/raw-material.model';

@Component({
  selector: 'app-stock-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputNumberModule,
    ButtonModule,
    DropdownModule,
    RippleModule,
    PageHeaderComponent
  ],
  templateUrl: './stock-form.component.html',
  styleUrl: './stock-form.component.css'
})
export class StockFormComponent implements OnInit, OnDestroy {
  materialStockForm: FormGroup;
  loading$: Observable<boolean>;
  rawMaterials$: Observable<RawMaterialResponseDTO[]>;
  isEditMode = false;
  materialStockId?: number;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.loading$ = this.store.select(MaterialStockSelectors.selectMaterialStocksLoading);
    this.rawMaterials$ = this.store.select(RawMaterialSelectors.selectAllRawMaterials);
    
    this.materialStockForm = this.fb.group({
      materialId: [null, Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.store.dispatch(RawMaterialActions.loadRawMaterials());
    this.store.dispatch(MaterialStockActions.loadMaterialStocks());

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.materialStockId = +id;
      
      this.store.select(MaterialStockSelectors.selectAllMaterialStocks).pipe(
        takeUntil(this.destroy$)
      ).subscribe(materialStocks => {
        const materialStock = materialStocks.find(ms => ms.id === this.materialStockId);
        if (materialStock) {
          this.materialStockForm.patchValue({
            materialId: materialStock.materialId,
            quantity: materialStock.quantity
          });
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(): void {
    if (this.materialStockForm.valid) {
      const formValue = this.materialStockForm.value;
      
      if (this.isEditMode && this.materialStockId) {
        this.store.dispatch(MaterialStockActions.updateMaterialStock({
          id: this.materialStockId,
          request: formValue
        }));
      } else {
        this.store.dispatch(MaterialStockActions.createMaterialStock({
          request: formValue
        }));
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/raw-material-stocks']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.materialStockForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.materialStockForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (field?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be at least ${field.errors?.['min'].min}`;
    }
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      materialId: 'Raw material',
      quantity: 'Quantity'
    };
    return labels[fieldName] || fieldName;
  }
}
