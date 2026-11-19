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
import * as BoxStockActions from '../store/box-stock.actions';
import * as BoxStockSelectors from '../store/box-stock.selectors';
import * as BoxSelectors from '../../boxes/store/box.selectors';
import * as BoxActions from '../../boxes/store/box.actions';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { BoxResponseDTO } from '../../boxes/models/box.model';

@Component({
  selector: 'app-box-stock-form',
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
  styleUrls: ['./stock-form.component.css']
})
export class BoxStockFormComponent implements OnInit, OnDestroy {
  boxStockForm: FormGroup;
  loading$: Observable<boolean>;
  boxes$: Observable<BoxResponseDTO[]>;
  isEditMode = false;
  boxStockId?: number;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.loading$ = this.store.select(BoxStockSelectors.selectBoxStocksLoading);
    this.boxes$ = this.store.select(BoxSelectors.selectAllBoxes);
    
    this.boxStockForm = this.fb.group({
      boxId: [null, Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      minStockLevel: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.store.dispatch(BoxActions.loadBoxes());
    this.store.dispatch(BoxStockActions.loadBoxStocks());

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.boxStockId = +id;
      
      this.store.select(BoxStockSelectors.selectAllBoxStocks).pipe(
        takeUntil(this.destroy$)
      ).subscribe(boxStocks => {
        const boxStock = boxStocks.find(bs => bs.id === this.boxStockId);
        if (boxStock) {
          this.boxStockForm.patchValue({
            boxId: boxStock.boxId,
            quantity: boxStock.quantity,
            minStockLevel: boxStock.minStockLevel
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
    if (this.boxStockForm.valid) {
      const formValue = this.boxStockForm.value;
      
      if (this.isEditMode && this.boxStockId) {
        this.store.dispatch(BoxStockActions.updateBoxStock({
          id: this.boxStockId,
          boxStock: formValue
        }));
      } else {
        this.store.dispatch(BoxStockActions.createBoxStock({
          boxStock: formValue
        }));
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/box-stocks']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.boxStockForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.boxStockForm.get(fieldName);
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
      boxId: 'Box',
      quantity: 'Quantity',
      minStockLevel: 'Minimum stock level'
    };
    return labels[fieldName] || fieldName;
  }
}
