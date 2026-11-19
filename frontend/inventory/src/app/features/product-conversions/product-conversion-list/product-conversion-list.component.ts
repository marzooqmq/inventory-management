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
import { ProductConversionResponseDTO } from '../models/product-conversion.model';
import { ProductResponseDTO } from '../../products/models/product.model';
import * as ProductConversionSelectors from '../store/product-conversion.selectors';
import * as ProductConversionActions from '../store/product-conversion.actions';
import * as ProductSelectors from '../../products/store/product.selectors';
import * as ProductActions from '../../products/store/product.actions';

@Component({
  selector: 'app-product-conversion-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TooltipModule, PageHeaderComponent, ConfirmDialogComponent],
  providers: [ConfirmationService],
  templateUrl: './product-conversion-list.component.html',
  styleUrl: './product-conversion-list.component.css'
})
export class ProductConversionListComponent implements OnInit {
  productConversionsWithNames$: Observable<ProductConversionResponseDTO[]>;
  filteredProductConversions$: Observable<ProductConversionResponseDTO[]>;
  loading$: Observable<boolean>;
  searchControl = new FormControl('');

  constructor(private store: Store, private router: Router, private confirmationService: ConfirmationService) {
    const productConversions$ = this.store.select(ProductConversionSelectors.selectAllProductConversions);
    const products$ = this.store.select(ProductSelectors.selectAllProducts);
    this.loading$ = this.store.select(ProductConversionSelectors.selectProductConversionsLoading);

    this.productConversionsWithNames$ = combineLatest([productConversions$, products$]).pipe(map(([productConversions, products]) => productConversions.map(pc => ({ ...pc, productName: products.find(p => p.id === pc.productId)?.name || 'Unknown Product' }))));

    this.filteredProductConversions$ = combineLatest([this.productConversionsWithNames$, this.searchControl.valueChanges.pipe(startWith(''))]).pipe(map(([productConversions, searchTerm]) => { if (!searchTerm) return productConversions; const term = searchTerm.toLowerCase(); return productConversions.filter(pc => pc.productName?.toLowerCase().includes(term)); }));
  }

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts());
    this.store.dispatch(ProductConversionActions.loadProductConversions());
  }

  onAdd(): void { this.router.navigate(['/product-conversions/new']); }
  onEdit(id: number): void { this.router.navigate(['/product-conversions/edit', id]); }
  onDelete(productConversion: ProductConversionResponseDTO): void {
    this.confirmationService.confirm({ message: `Are you sure you want to delete conversion for "${productConversion.productName}"?`, header: 'Confirm Delete', icon: 'pi pi-exclamation-triangle', accept: () => { this.store.dispatch(ProductConversionActions.deleteProductConversion({ id: productConversion.id })); } });
  }
}
