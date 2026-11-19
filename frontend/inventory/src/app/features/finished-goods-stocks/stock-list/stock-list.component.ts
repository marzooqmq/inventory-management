import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, takeUntil, debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { FinishedGoodsStockResponseDTO } from '../models/finished-goods-stock.model';
import { FinishedGoodsStockService } from '../services/finished-goods-stock.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-finished-goods-stock-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TableModule,
    TooltipModule,
    TagModule,
    InputTextModule,
    PageHeaderComponent
  ],
  templateUrl: './stock-list.component.html',
  styleUrl: './stock-list.component.css'
})
export class FinishedGoodsStockListComponent implements OnInit, OnDestroy {
  stocks: FinishedGoodsStockResponseDTO[] = [];
  filteredStocks: FinishedGoodsStockResponseDTO[] = [];
  loading = false;
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  constructor(
    private finishedGoodsStockService: FinishedGoodsStockService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStocks();
    
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.filterStocks(searchTerm || '');
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStocks(): void {
    this.loading = true;
    this.finishedGoodsStockService.getAll()
      .pipe(
        finalize(() => this.loading = false),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (stocks) => {
          this.stocks = stocks;
          this.filteredStocks = stocks;
        },
        error: (error) => {
          console.error('Error loading finished goods stocks:', error);
        }
      });
  }

  private filterStocks(searchTerm: string): void {
    if (!searchTerm.trim()) {
      this.filteredStocks = this.stocks;
      return;
    }
    
    const term = searchTerm.toLowerCase();
    this.filteredStocks = this.stocks.filter(stock =>
      stock.productName.toLowerCase().includes(term)
    );
  }

  getMinStockLevel(stock: FinishedGoodsStockResponseDTO): number {
    // Default minimum stock level (can be configured per product)
    return 100;
  }

  getStockStatusLabel(stock: FinishedGoodsStockResponseDTO): string {
    const quantity = stock.boxQuantity;
    const minLevel = this.getMinStockLevel(stock);
    
    if (quantity === 0) return 'Out of Stock';
    if (quantity < minLevel * 0.5) return 'Low Stock';
    if (quantity < minLevel) return 'Medium Stock';
    return 'Good Stock';
  }

  getStockStatusClass(stock: FinishedGoodsStockResponseDTO): string {
    const quantity = stock.boxQuantity;
    const minLevel = this.getMinStockLevel(stock);
    
    if (quantity === 0) return 'status-out';
    if (quantity < minLevel * 0.5) return 'status-low';
    if (quantity < minLevel) return 'status-medium';
    return 'status-high';
  }

  getStockStatusIcon(stock: FinishedGoodsStockResponseDTO): string {
    const quantity = stock.boxQuantity;
    const minLevel = this.getMinStockLevel(stock);
    
    if (quantity === 0) return 'pi-times-circle';
    if (quantity < minLevel * 0.5) return 'pi-exclamation-circle';
    if (quantity < minLevel) return 'pi-exclamation-triangle';
    return 'pi-check-circle';
  }

  onView(id: number): void {
    this.router.navigate(['/inventory-dashboard']);
  }
}
