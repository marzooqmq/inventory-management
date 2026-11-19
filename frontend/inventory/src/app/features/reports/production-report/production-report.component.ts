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
  ProductionExecutionRecordDTO, ProductionExecutionReportResponse,
  StageProgressOrderDTO, StageProgressResponse,
  ProductionOutputRecordDTO, ProductionOutputReportResponse
} from '../models/report.models';

type Tab = 'execution' | 'stage' | 'output';

@Component({
  selector: 'app-production-report',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule, DropdownModule, SkeletonModule, ButtonModule],
  templateUrl: './production-report.component.html',
  styleUrls: ['./production-report.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionReportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  activeTab: Tab = 'execution';

  /* shared filters */
  startDate: Date | null = null;
  endDate: Date | null = null;
  selectedProductId: number | null = null;
  selectedMonth: number | null = null;
  selectedYear: number | null = null;

  /* dropdowns */
  productOptions: { label: string; value: number | null }[] = [{ label: 'All Products', value: null }];
  monthOptions = [
    { label: 'All Months', value: null },
    { label: 'January', value: 1 }, { label: 'February', value: 2 }, { label: 'March', value: 3 },
    { label: 'April', value: 4 }, { label: 'May', value: 5 }, { label: 'June', value: 6 },
    { label: 'July', value: 7 }, { label: 'August', value: 8 }, { label: 'September', value: 9 },
    { label: 'October', value: 10 }, { label: 'November', value: 11 }, { label: 'December', value: 12 }
  ];
  yearOptions: { label: string; value: number | null }[] = [];

  /* Execution */
  execRecords: ProductionExecutionRecordDTO[] = [];
  execResponse: ProductionExecutionReportResponse | null = null;
  execPage = 0;
  execPageSize = 20;
  execLoading = false;

  /* Stage Progress */
  stageRecords: StageProgressOrderDTO[] = [];
  stageResponse: StageProgressResponse | null = null;
  stagePage = 0;
  stagePageSize = 20;
  stageLoading = false;
  expandedOrders = new Set<number>();

  /* Output */
  outputRecords: ProductionOutputRecordDTO[] = [];
  outputResponse: ProductionOutputReportResponse | null = null;
  outputPage = 0;
  outputPageSize = 20;
  outputLoading = false;

  constructor(
    private reportService: ReportService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.buildYears();
    this.loadProducts();
    this.loadCurrentTab();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private buildYears(): void {
    const cur = new Date().getFullYear();
    this.yearOptions = [{ label: 'All Years', value: null }];
    for (let y = cur; y >= cur - 5; y--) {
      this.yearOptions.push({ label: String(y), value: y });
    }
  }

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
    this.loadCurrentTab();
  }

  private loadCurrentTab(): void {
    if (this.activeTab === 'execution') this.loadExecution();
    else if (this.activeTab === 'stage') this.loadStage();
    else this.loadOutput();
  }

  onApplyFilters(): void {
    this.execPage = 0; this.stagePage = 0; this.outputPage = 0;
    this.loadCurrentTab();
  }

  onClearFilters(): void {
    this.startDate = null; this.endDate = null;
    this.selectedProductId = null; this.selectedMonth = null; this.selectedYear = null;
    this.execPage = 0; this.stagePage = 0; this.outputPage = 0;
    this.loadCurrentTab();
  }

  /* ── Execution ───────────────────────────────────────────── */
  loadExecution(): void {
    this.execLoading = true;
    this.cdr.markForCheck();
    const sd = this.fmt(this.startDate);
    const ed = this.fmt(this.endDate);
    this.reportService.getProductionExecutionReport(sd, ed, this.selectedMonth ?? undefined, this.selectedYear ?? undefined, this.execPage, this.execPageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: r => { this.execResponse = r; this.execRecords = r.records ?? []; this.execLoading = false; this.cdr.markForCheck(); },
        error: () => { this.execLoading = false; this.cdr.markForCheck(); }
      });
  }

  get execPages(): number[] {
    const total = this.execResponse?.totalPages ?? 0;
    return Array.from({ length: total }, (_, i) => i);
  }

  execGoToPage(p: number): void { this.execPage = p; this.loadExecution(); }

  /* ── Stage Progress ──────────────────────────────────────── */
  loadStage(): void {
    this.stageLoading = true;
    this.cdr.markForCheck();
    const sd = this.fmt(this.startDate);
    const ed = this.fmt(this.endDate);
    this.reportService.getStageProgressReport(sd, ed, this.stagePage, this.stagePageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: r => { this.stageResponse = r; this.stageRecords = r.records ?? []; this.stageLoading = false; this.cdr.markForCheck(); },
        error: () => { this.stageLoading = false; this.cdr.markForCheck(); }
      });
  }

  toggleOrder(id: number): void {
    if (this.expandedOrders.has(id)) this.expandedOrders.delete(id);
    else this.expandedOrders.add(id);
    this.cdr.markForCheck();
  }

  isExpanded(id: number): boolean { return this.expandedOrders.has(id); }

  get stagePages(): number[] {
    const total = this.stageResponse?.totalPages ?? 0;
    return Array.from({ length: total }, (_, i) => i);
  }

  stageGoToPage(p: number): void { this.stagePage = p; this.loadStage(); }

  /* ── Output ──────────────────────────────────────────────── */
  loadOutput(): void {
    if (!this.startDate || !this.endDate) { this.outputRecords = []; this.outputResponse = null; this.cdr.markForCheck(); return; }
    this.outputLoading = true;
    this.cdr.markForCheck();
    this.reportService.getProductionOutputReport(this.fmt(this.startDate)!, this.fmt(this.endDate)!, this.selectedProductId ?? undefined, this.outputPage, this.outputPageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: r => { this.outputResponse = r; this.outputRecords = r.records ?? []; this.outputLoading = false; this.cdr.markForCheck(); },
        error: () => { this.outputLoading = false; this.cdr.markForCheck(); }
      });
  }

  get outputPages(): number[] {
    const total = this.outputResponse?.totalPages ?? 0;
    return Array.from({ length: total }, (_, i) => i);
  }

  outputGoToPage(p: number): void { this.outputPage = p; this.loadOutput(); }

  /* ── Helpers ─────────────────────────────────────────────── */
  private fmt(d: Date | null): string | undefined {
    if (!d) return undefined;
    return d.toISOString().split('T')[0];
  }

  formatCurrency(val: number | undefined): string {
    if (val == null) return '₹0.00';
    return '₹' + val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatDate(val: string | undefined): string {
    if (!val) return '—';
    return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  statusClass(status: string | undefined): string {
    if (!status) return 'badge-default';
    const s = status.toUpperCase();
    if (s === 'COMPLETED') return 'badge-completed';
    if (s === 'IN_PROGRESS' || s === 'IN PROGRESS') return 'badge-inprogress';
    if (s === 'PENDING') return 'badge-pending';
    if (s === 'CANCELLED') return 'badge-cancelled';
    return 'badge-default';
  }

  stageStatusClass(status: string | undefined): string {
    if (!status) return 'stage-default';
    const s = status.toUpperCase();
    if (s === 'COMPLETED') return 'stage-completed';
    if (s === 'IN_PROGRESS' || s === 'IN PROGRESS') return 'stage-inprogress';
    if (s === 'PENDING') return 'stage-pending';
    return 'stage-default';
  }
}
