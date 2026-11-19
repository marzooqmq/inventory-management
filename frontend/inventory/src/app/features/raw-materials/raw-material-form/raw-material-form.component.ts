import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { RawMaterialResponseDTO } from '../models/raw-material.model';
import { selectSelectedRawMaterial, selectRawMaterialsLoading } from '../store/raw-material.selectors';
import * as RawMaterialActions from '../store/raw-material.actions';

@Component({
  selector: 'app-raw-material-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    CheckboxModule,
    ButtonModule,
    PageHeaderComponent
  ],
  templateUrl: './raw-material-form.component.html',
  styleUrl: './raw-material-form.component.css'
})
export class RawMaterialFormComponent implements OnInit {
  rawMaterialForm: FormGroup;
  loading$: Observable<boolean>;
  isEditMode = false;
  rawMaterialId: number | null = null;
  selectedRawMaterial$: Observable<RawMaterialResponseDTO | null>;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.selectedRawMaterial$ = this.store.select(selectSelectedRawMaterial);
    this.loading$ = this.store.select(selectRawMaterialsLoading);

    this.rawMaterialForm = this.fb.group({
      name: ['', Validators.required],
      costPerUnit: [0, [Validators.required, Validators.min(0)]],
      purchaseUnit: ['', Validators.required],
      consumptionUnit: ['', Validators.required],
      conversionFactor: [0, [Validators.required, Validators.min(0)]],
      minStockLevel: [0, [Validators.required, Validators.min(0)]],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.rawMaterialId = +params['id'];
        this.store.dispatch(RawMaterialActions.loadRawMaterial({ id: this.rawMaterialId }));
        
        this.selectedRawMaterial$.subscribe(rawMaterial => {
          if (rawMaterial) {
            this.rawMaterialForm.patchValue({
              name: rawMaterial.name,
              costPerUnit: rawMaterial.costPerUnit,
              purchaseUnit: rawMaterial.purchaseUnit,
              consumptionUnit: rawMaterial.consumptionUnit,
              conversionFactor: rawMaterial.conversionFactor,
              minStockLevel: rawMaterial.minStockLevel,
              active: rawMaterial.active
            });
          }
        });
      }
    });
  }

  onSubmit(): void {
    if (this.rawMaterialForm.valid) {
      const formValue = this.rawMaterialForm.value;
      
      if (this.isEditMode && this.rawMaterialId) {
        this.store.dispatch(
          RawMaterialActions.updateRawMaterial({
            id: this.rawMaterialId,
            rawMaterial: formValue
          })
        );
      } else {
        this.store.dispatch(
          RawMaterialActions.createRawMaterial({ rawMaterial: formValue })
        );
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/raw-materials']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.rawMaterialForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getErrorMessage(fieldName: string): string {
    const field = this.rawMaterialForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    
    if (field?.hasError('min')) {
      return `${this.getFieldLabel(fieldName)} must be greater than or equal to 0`;
    }
    
    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Name',
      costPerUnit: 'Cost Per Unit',
      purchaseUnit: 'Purchase Unit',
      consumptionUnit: 'Consumption Unit',
      conversionFactor: 'Conversion Factor',
      minStockLevel: 'Minimum Stock Level'
    };
    return labels[fieldName] || fieldName;
  }
}
