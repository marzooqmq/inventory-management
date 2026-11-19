import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { ProductResponseDTO } from '../models/product.model';
import * as ProductActions from '../store/product.actions';
import * as ProductSelectors from '../store/product.selectors';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, TableModule, TagModule, TooltipModule, PageHeaderComponent, ConfirmDialogComponent],
  providers: [ConfirmationService],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit, OnDestroy {
  products$: Observable<ProductResponseDTO[]>;
  filteredProducts$: Observable<ProductResponseDTO[]>;
  loading$: Observable<boolean>;
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  constructor(private store: Store, private router: Router, private confirmationService: ConfirmationService) {
    this.products$ = this.store.select(ProductSelectors.selectAllProducts);
    this.loading$ = this.store.select(ProductSelectors.selectProductsLoading);
    this.filteredProducts$ = this.products$;
  }

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());
    this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(searchTerm => { this.filterProducts(searchTerm || ''); });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private filterProducts(searchTerm: string): void {
    this.filteredProducts$ = this.products$.pipe(map(products => { if (!searchTerm.trim()) { return products; } const term = searchTerm.toLowerCase(); return products.filter(product => product.name.toLowerCase().includes(term) || product.description?.toLowerCase().includes(term) || product.category.toLowerCase().includes(term) || product.size.toLowerCase().includes(term)); }));
  }

  onAddProduct(): void { this.router.navigate(['/products/new']); }
  onEditProduct(id: number): void { this.router.navigate(['/products/edit', id]); }
  onDeleteProduct(product: ProductResponseDTO): void { this.confirmationService.confirm({ message: `Are you sure you want to delete "${product.name}"?`, header: 'Confirm Delete', icon: 'pi pi-exclamation-triangle', acceptButtonStyleClass: 'p-button-danger', accept: () => { this.store.dispatch(ProductActions.deleteProduct({ id: product.id })); } }); }
  getCategoryLabel(category: string): string { return category.replace('_', ' '); }
  getCategorySeverity(category: string): string { switch (category) { case 'ULTRA_THIN': return 'info'; case 'PREMIUM': return 'success'; case 'LINER': return 'warning'; default: return 'secondary'; } }
}
