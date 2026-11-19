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
import { FinishedGoodsReportRecordDTO, FinishedGoodsReportResponse } from '../models/report.models';

@Component({
  selector: 'app-finished-goods-report',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, DropdownModule, SkeletonModule, ButtonModule],
  templateUrl: './finished-goods-report.component.html',
  styleUrls: ['./finished-goods-report.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FinishedGoodsReportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedProductId: number | null = null;
  page = 0;
  pageSize = 20;

  productOptions: { label: string; value: number | null }[] = [{ label: 'All Products', value: null }];

  response: FinishedGoodsReportResponse | null = null;
  records: FinishedGoodsReportRecordDTO[] = [];
  loading = false;

  constructor(
    private reportService: ReportService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadReport();
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

  loadReport(): void {
    this.loading = true;
    this.cdr.markForCheck();
    const sd = this.fmt(this.startDate);
    const ed = this.fmt(this.endDate);
    this.reportService.getFinishedGoodsReport(sd, ed, this.selectedProductId ?? undefined, this.page, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: r => { this.response = r; this.records = r.records ?? []; this.loading = false; this.cdr.markForCheck(); },
        error: () => { this.loading = false; this.cdr.markForCheck(); }
      });
  }

  onApplyFilters(): void { this.page = 0; this.loadReport(); }

  onClearFilters(): void {
    this.startDate = null; this.endDate = null; this.selectedProductId = null;
    this.page = 0;
    this.loadReport();
  }

  get pages(): number[] {
    const total = this.response?.totalPages ?? 0;
    return Array.from({ length: total }, (_, i) => i);
  }

  goToPage(p: number): void { this.page = p; this.loadReport(); }

  formatDate(val: string | undefined): string {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private fmt(d: Date | null): string | undefined {
    if (!d) return undefined;
    return d.toISOString().split('T')[0];
  }
}
