import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { ReportService } from '../services/report.service';
import { ProductService } from '../../products/services/product.service';
import {
  ProductionVsSalesRecordDTO, ProductionVsSalesResponse,
  ProductionVsSalesMonthlyRecordDTO, ProductionVsSalesProductSummaryDTO, ProductionVsSalesMonthlyResponse
} from '../models/report.models';

type Tab = 'summary' | 'monthly';

@Component({
  selector: 'app-production-vs-sales',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, DropdownModule, SkeletonModule, ButtonModule],
  templateUrl: './production-vs-sales.component.html',
  styleUrls: ['./production-vs-sales.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionVsSalesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeTab: Tab = 'summary';

  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedProductId: number | null = null;

  productOptions: { label: string; value: number | null }[] = [{ label: 'All Products', value: null }];

  /* Summary */
  summaryResponse: ProductionVsSalesResponse | null = null;
  summaryLoading = false;

  /* Monthly */
  monthlyResponse: ProductionVsSalesMonthlyResponse | null = null;
  monthlyLoading = false;

  constructor(
    private reportService: ReportService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private loadProducts(): void {
    this.productService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const list = res?.data ?? res ?? [];
        this.productOptions = [
          { label: 'All Products', value: null },
          ...list.map((p: any) => ({ label: p.name ?? p.productName ?? String(p.id), value: p.id }))
        ];
        this.cdr.markForCheck();
      }
    });
  }

  setTab(tab: Tab): void {
    this.activeTab = tab;
    if (this.startDate && this.endDate) this.loadCurrentTab();
  }

  onApplyFilters(): void {
    if (!this.startDate || !this.endDate) return;
    this.loadCurrentTab();
  }

  onClearFilters(): void {
    this.startDate = null; this.endDate = null; this.selectedProductId = null;
    this.summaryResponse = null; this.monthlyResponse = null;
    this.cdr.markForCheck();
  }

  private loadCurrentTab(): void {
    if (this.activeTab === 'summary') this.loadSummary();
    else this.loadMonthly();
  }

  loadSummary(): void {
    if (!this.startDate || !this.endDate) return;
    this.summaryLoading = true;
    this.cdr.markForCheck();
    this.reportService.getProductionVsSalesReport(this.fmt(this.startDate)!, this.fmt(this.endDate)!, this.selectedProductId ?? undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: r => { this.summaryResponse = r; this.summaryLoading = false; this.cdr.markForCheck(); },
        error: () => { this.summaryLoading = false; this.cdr.markForCheck(); }
      });
  }

  loadMonthly(): void {
    if (!this.startDate || !this.endDate) return;
    this.monthlyLoading = true;
    this.cdr.markForCheck();
    this.reportService.getProductionVsSalesMonthly(this.fmt(this.startDate)!, this.fmt(this.endDate)!, this.selectedProductId ?? undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: r => { this.monthlyResponse = r; this.monthlyLoading = false; this.cdr.markForCheck(); },
        error: () => { this.monthlyLoading = false; this.cdr.markForCheck(); }
      });
  }

  get summaryRecords(): ProductionVsSalesRecordDTO[] { return this.summaryResponse?.records ?? []; }
  get monthlyRecords(): ProductionVsSalesMonthlyRecordDTO[] { return this.monthlyResponse?.records ?? []; }
  get productSummaries(): ProductionVsSalesProductSummaryDTO[] { return this.monthlyResponse?.productSummary ?? []; }
  get datesRequired(): boolean { return !this.startDate || !this.endDate; }

  stockClass(val: number): string {
    if (val > 0) return 'td-green';
    if (val < 0) return 'td-red';
    return '';
  }

  private fmt(d: Date | null): string | undefined {
    if (!d) return undefined;
    return d.toISOString().split('T')[0];
  }
}
