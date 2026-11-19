import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { MaterialStockResponseDTO } from '../models/material-stock.model';
import * as MaterialStockActions from '../store/material-stock.actions';
import * as MaterialStockSelectors from '../store/material-stock.selectors';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-stock-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    PageHeaderComponent,
    ConfirmDialogComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.css'
})
export class StockListComponent implements OnInit, OnDestroy {
  materialStocks$: Observable<MaterialStockResponseDTO[]>;
  filteredMaterialStocks$: Observable<MaterialStockResponseDTO[]>;
  loading$: Observable<boolean>;
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService
  ) {
    this.materialStocks$ = this.store.select(MaterialStockSelectors.selectAllMaterialStocks);
    this.loading$ = this.store.select(MaterialStockSelectors.selectMaterialStocksLoading);
    this.filteredMaterialStocks$ = this.materialStocks$;
  }

  ngOnInit(): void {
    this.store.dispatch(MaterialStockActions.loadMaterialStocks());
    
    // Check for editStockId query parameter
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['editStockId']) {
        const stockId = Number(params['editStockId']);
        if (!isNaN(stockId)) {
          // Navigate to edit screen with the stock ID
          this.router.navigate(['/raw-material-stocks/edit', stockId], {
            replaceUrl: true // Replace URL to remove query param
          });
        }
      }
    });
    
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filterMaterialStocks(searchTerm || '');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private filterMaterialStocks(searchTerm: string): void {
    this.filteredMaterialStocks$ = this.materialStocks$.pipe(
      map(stocks => {
        if (!searchTerm.trim()) {
          return stocks;
        }
        const term = searchTerm.toLowerCase();
        return stocks.filter(stock =>
          stock.materialName.toLowerCase().includes(term)
        );
      })
    );
  }

  onAdd(): void {
    this.router.navigate(['/raw-material-stocks/new']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/raw-material-stocks/edit', id]);
  }

  onDelete(stock: MaterialStockResponseDTO): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete stock for "${stock.materialName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(MaterialStockActions.deleteMaterialStock({ id: stock.id }));
      }
    });
  }

  getStockStatusLabel(quantity: number): string {
    if (quantity >= 80) return 'High Stock';
    if (quantity >= 50) return 'Medium Stock';
    return 'Low Stock';
  }

  getStockStatusClass(quantity: number): string {
    if (quantity >= 80) return 'status-high';
    if (quantity >= 50) return 'status-medium';
    return 'status-low';
  }

  getStockStatusIcon(quantity: number): string {
    if (quantity >= 80) return 'pi-check-circle';
    if (quantity >= 50) return 'pi-exclamation-circle';
    return 'pi-times-circle';
  }
}
