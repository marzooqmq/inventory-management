import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProductionCostResponseDTO } from '../models/production-cost.model';
import { ProductResponseDTO } from '../../products/models/product.model';
import * as ProductionCostSelectors from '../store/production-cost.selectors';
import * as ProductionCostActions from '../store/production-cost.actions';
import * as ProductSelectors from '../../products/store/product.selectors';
import * as ProductActions from '../../products/store/product.actions';

@Component({
  selector: 'app-production-cost-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TooltipModule,
    PageHeaderComponent,
    ConfirmDialogComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './production-cost-list.component.html',
  styleUrl: './production-cost-list.component.css'
})
export class ProductionCostListComponent implements OnInit {
  productionCostsWithNames$: Observable<ProductionCostResponseDTO[]>;
  filteredProductionCosts$: Observable<ProductionCostResponseDTO[]>;
  loading$: Observable<boolean>;
  searchControl = new FormControl('');

  constructor(
    private store: Store,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {
    const productionCosts$ = this.store.select(ProductionCostSelectors.selectAllProductionCosts);
    const products$ = this.store.select(ProductSelectors.selectAllProducts);
    this.loading$ = this.store.select(ProductionCostSelectors.selectProductionCostsLoading);

    // Combine production costs with product names
    this.productionCostsWithNames$ = combineLatest([
      productionCosts$,
      products$
    ]).pipe(
      map(([productionCosts, products]) => {
        return productionCosts.map(pc => ({
          ...pc,
          productName: products.find(p => p.id === pc.productId)?.name || 'Unknown Product'
        }));
      })
    );

    this.filteredProductionCosts$ = combineLatest([
      this.productionCostsWithNames$,
      this.searchControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([productionCosts, searchTerm]) => {
        if (!searchTerm) {
          return productionCosts;
        }
        const term = searchTerm.toLowerCase();
        return productionCosts.filter(pc =>
          pc.productName?.toLowerCase().includes(term)
        );
      })
    );
  }

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());
    this.store.dispatch(ProductionCostActions.loadProductionCosts());
  }

  onAdd(): void {
    this.router.navigate(['/production-costs/new']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/production-costs/edit', id]);
  }

  onDelete(productionCost: ProductionCostResponseDTO): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete production cost for "${productionCost.productName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.store.dispatch(ProductionCostActions.deleteProductionCost({ id: productionCost.id }));
      }
    });
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
