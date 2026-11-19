import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CardModule } from 'primeng/card';
import { InputNumberModule } from 'primeng/inputnumber';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { RippleModule } from 'primeng/ripple';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { BoxRequestDTO, BoxResponseDTO } from '../models/box.model';
import { ProductResponseDTO } from '../../products/models/product.model';
import { selectAllProducts } from '../../products/store/product.selectors';
import { selectSelectedBox, selectBoxesLoading } from '../store/box.selectors';
import * as BoxActions from '../store/box.actions';
import * as ProductActions from '../../products/store/product.actions';

@Component({
  selector: 'app-box-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputNumberModule,
    CheckboxModule,
    ButtonModule,
    DropdownModule,
    RippleModule,
    PageHeaderComponent
  ],
  templateUrl: './box-form.component.html',
  styleUrl: './box-form.component.css'
})
export class BoxFormComponent implements OnInit {
  boxForm: FormGroup;
  isEditMode = false;
  boxId?: number;
  products$: Observable<ProductResponseDTO[]>;
  loading$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.products$ = this.store.select(selectAllProducts);
    this.loading$ = this.store.select(selectBoxesLoading);

    this.boxForm = this.fb.group({
      productId: [null, Validators.required],
      boxCostPerPad: [null, [Validators.required, Validators.min(0)]],
      active: [true]
    });
  }

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());

    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.boxId = +params['id'];
        this.store.dispatch(BoxActions.loadBox({ id: this.boxId }));
        
        this.store.select(selectSelectedBox).subscribe(box => {
          if (box) {
            this.boxForm.patchValue({
              productId: box.productId,
              boxCostPerPad: box.boxCostPerPad,
              active: box.active
            });
          }
        });
      } else {
        this.store.dispatch(BoxActions.clearSelectedBox());
      }
    });
  }

  onSubmit(): void {
    if (this.boxForm.valid) {
      const formValue = this.boxForm.value;
      const boxData: BoxRequestDTO = {
        productId: formValue.productId,
        boxCostPerPad: formValue.boxCostPerPad,
        active: formValue.active
      };

      if (this.isEditMode && this.boxId) {
        this.store.dispatch(BoxActions.updateBox({ id: this.boxId, box: boxData }));
      } else {
        this.store.dispatch(BoxActions.createBox({ box: boxData }));
      }
    } else {
      Object.keys(this.boxForm.controls).forEach(key => {
        const control = this.boxForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/boxes']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.boxForm.get(fieldName);
    return !!(field?.invalid && (field?.dirty || field?.touched));
  }

  getErrorMessage(fieldName: string): string {
    const control = this.boxForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('min')) {
      return 'Value must be greater than or equal to 0';
    }
    return '';
  }
}
