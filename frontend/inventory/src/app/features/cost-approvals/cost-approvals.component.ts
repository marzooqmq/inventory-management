import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CalendarModule } from 'primeng/calendar';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { TagModule } from 'primeng/tag';
import { ProductResponseDTO } from '../products/models/product.model';
import * as ProductSelectors from '../products/store/product.selectors';
import * as ProductActions from '../products/store/product.actions';
import { CostApprovalService } from '../../core/services/cost-approval.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cost-approvals',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    CalendarModule,
    TooltipModule,
    RippleModule,
    TagModule,
    PageHeaderComponent
  ],
  templateUrl: './cost-approvals.component.html',
  styleUrl: './cost-approvals.component.css'
})
export class CostApprovalsComponent implements OnInit {
  pendingApprovals$: Observable<ProductResponseDTO[]>;
  loading$: Observable<boolean>;
  
  showApprovalDialog = false;
  selectedProduct: ProductResponseDTO | null = null;
  effectiveDate: Date = new Date();
  today: Date = new Date();

  constructor(
    private store: Store,
    private costApprovalService: CostApprovalService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.loading$ = this.store.select(ProductSelectors.selectProductsLoading);
    this.pendingApprovals$ = this.store.select(ProductSelectors.selectAllProducts).pipe(
      map(products => products.filter(p => p.costDirty))
    );
  }

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());
  }

  openApprovalDialog(product: ProductResponseDTO): void {
    this.selectedProduct = product;
    this.effectiveDate = new Date();
    this.showApprovalDialog = true;
  }

  closeApprovalDialog(): void {
    this.showApprovalDialog = false;
    this.selectedProduct = null;
  }

  approveCostChange(): void {
    if (!this.selectedProduct) return;

    const effectiveDateStr = this.effectiveDate.toISOString().split('T')[0];
    const newCostPrice = this.selectedProduct.calculatedCostPrice;
    
    console.log('Approving cost for product:', {
      productId: this.selectedProduct.id,
      productName: this.selectedProduct.name,
      currentCost: this.selectedProduct.costPrice,
      calculatedCost: newCostPrice,
      effectiveDate: effectiveDateStr
    });
    
    this.costApprovalService.approveCostChange(
      this.selectedProduct.id, 
      effectiveDateStr,
      newCostPrice
    ).subscribe({
        next: (response) => {
          console.log('Approval response:', response);
          this.toastService.success('Cost price approved successfully', 'Success');
          this.closeApprovalDialog();
          
          // Wait a moment for backend to process, then reload
          setTimeout(() => {
            this.store.dispatch(ProductActions.loadProducts());
          }, 1000);
        },
        error: (error) => {
          console.error('Approval error:', error);
          const errorMsg = error.error?.message || 'Failed to approve cost price';
          this.toastService.error(errorMsg, 'Error');
        }
      });
  }

  formatCurrency(value: number | null | undefined): string {
    const amount = value == null || !Number.isFinite(Number(value)) ? 0 : Number(value);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }

  getCategorySeverity(category?: string): 'info' | 'success' | 'warning' | 'secondary' {
    if (!category) return 'secondary';
    
    switch (category) {
      case 'ULTRA_THIN':
        return 'info';
      case 'PREMIUM':
        return 'success';
      case 'LINER':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  getCategoryLabel(category?: string): string {
    return category || 'N/A';
  }
}

