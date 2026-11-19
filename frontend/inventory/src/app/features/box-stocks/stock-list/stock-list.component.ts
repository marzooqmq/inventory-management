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
import { BoxStockResponseDTO } from '../models/box-stock.model';
import * as BoxStockActions from '../store/box-stock.actions';
import * as BoxStockSelectors from '../store/box-stock.selectors';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-box-stock-list',
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
export class BoxStockListComponent implements OnInit, OnDestroy {
  boxStocks$: Observable<BoxStockResponseDTO[]>;
  filteredBoxStocks$: Observable<BoxStockResponseDTO[]>;
  loading$: Observable<boolean>;
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store,
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService: ConfirmationService
  ) {
    this.boxStocks$ = this.store.select(BoxStockSelectors.selectAllBoxStocks);
    this.loading$ = this.store.select(BoxStockSelectors.selectBoxStocksLoading);
    this.filteredBoxStocks$ = this.boxStocks$;
  }

  ngOnInit(): void {
    this.store.dispatch(BoxStockActions.loadBoxStocks());

    // Check for editStockId query parameter
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['editStockId']) {
        const stockId = Number(params['editStockId']);
        if (!isNaN(stockId)) {
          // Navigate to edit screen with the stock ID
          this.router.navigate(['/box-stocks/edit', stockId], {
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
      this.filterBoxStocks(searchTerm || '');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private filterBoxStocks(searchTerm: string): void {
    this.filteredBoxStocks$ = this.boxStocks$.pipe(
      map(stocks => {
        if (!searchTerm.trim()) {
          return stocks;
        }
        const term = searchTerm.toLowerCase();
        return stocks.filter(stock =>
          stock.productName.toLowerCase().includes(term)
        );
      })
    );
  }

  onAdd(): void {
    this.router.navigate(['/box-stocks/new']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/box-stocks/edit', id]);
  }

  onDelete(stock: BoxStockResponseDTO): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete stock for "${stock.productName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(BoxStockActions.deleteBoxStock({ id: stock.id }));
      }
    });
  }

  getStockStatusClass(quantity: number, minLevel: number): string {
    const ratio = quantity / minLevel;
    if (ratio <= 0.5) return 'status-critical';
    if (ratio <= 1.0) return 'status-low';
    if (ratio <= 1.5) return 'status-warning';
    return 'status-good';
  }

  getStockStatusIcon(quantity: number, minLevel: number): string {
    const ratio = quantity / minLevel;
    if (ratio <= 0.5) return 'pi-exclamation-triangle';
    if (ratio <= 1.0) return 'pi-exclamation-circle';
    if (ratio <= 1.5) return 'pi-info-circle';
    return 'pi-check-circle';
  }

  getStockStatusLabel(quantity: number, minLevel: number): string {
    const ratio = quantity / minLevel;
    if (ratio <= 0.5) return 'Critical';
    if (ratio <= 1.0) return 'Low';
    if (ratio <= 1.5) return 'Warning';
    return 'Good';
  }
}