import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, OnDestroy, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ReportService } from '../services/report.service';
import { ProductService } from '../../products/services/product.service';
import {
  CostProfitReportResponse,
  CostProfitMonthlyDTO,
  SalesProfitReportResponse,
  SalesProfitMonthlyDTO,
  ProfitSummary,
} from '../models/report.models';
import { ProductResponseDTO } from '../../products/models/product.model';

type ActiveTab = 'cost' | 'sales';

@Component({
  selector: 'app-cost-profit-report',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    ButtonModule, CalendarModule, DropdownModule, SkeletonModule,
    PageHeaderComponent,
  ],
  templateUrl: './cost-profit-report.component.html',
  styleUrls: ['./cost-profit-report.component.css'],
})
export class CostProfitReportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = false;
  activeTab: ActiveTab = 'cost';

  costData: CostProfitReportResponse | null = null;
  salesData: SalesProfitReportResponse | null = null;

  dateRange: Date[] | null = [
    new Date(new Date().getFullYear(), 0, 1),
    new Date(),
  ];
  selectedProductId: number | null = null;
  productOptions: { label: string; value: number }[] = [];

  constructor(
    private reportService: ReportService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadReport();
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }

  private loadProducts(): void {
    this.productService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (products: ProductResponseDTO[]) => {
        this.productOptions = [
          { label: 'All Products', value: 0 },
          ...products.map(p => ({ label: p.name, value: p.id })),
        ];
        this.cdr.markForCheck();
      },
    });
  }

  loadReport(): void {
    if (!this.dateRange?.[0] || !this.dateRange?.[1]) return;
    this.loading = true;
    this.cdr.markForCheck();

    const startDate = this.formatDate(this.dateRange[0]);
    const endDate = this.formatDate(this.dateRange[1]);
    const productId = this.selectedProductId || undefined;

    if (this.activeTab === 'cost') {
      this.reportService.getCostProfitReport(startDate, endDate, productId)
        .pipe(takeUntil(this.destroy$)).subscribe({
          next: (res) => { this.costData = res; this.loading = false; this.cdr.markForCheck(); },
          error: () => { this.loading = false; this.cdr.markForCheck(); },
        });
    } else {
      this.reportService.getSalesProfitReport(startDate, endDate, productId)
        .pipe(takeUntil(this.destroy$)).subscribe({
          next: (res) => { this.salesData = res; this.loading = false; this.cdr.markForCheck(); },
          error: () => { this.loading = false; this.cdr.markForCheck(); },
        });
    }
  }

  setTab(tab: ActiveTab): void {
    if (this.activeTab === tab) return;
    this.activeTab = tab;
    this.loadReport();
  }

  onApplyFilters(): void { this.loadReport(); }

  onClearFilters(): void {
    this.dateRange = [new Date(new Date().getFullYear(), 0, 1), new Date()];
    this.selectedProductId = null;
    this.loadReport();
  }

  get currentSummary(): ProfitSummary | null {
    return this.activeTab === 'cost' ? this.costData?.summary ?? null : this.salesData?.summary ?? null;
  }

  get costRecords(): CostProfitMonthlyDTO[] { return this.costData?.records ?? []; }
  get salesRecords(): SalesProfitMonthlyDTO[] { return this.salesData?.records ?? []; }

  marginClass(margin: number): string {
    if (margin >= 20) return 'margin-good';
    if (margin >= 10) return 'margin-ok';
    return 'margin-low';
  }

  formatCurrency(val: number | null | undefined): string {
    if (val == null) return '0.00';
    return Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  formatPercent(val: number | null | undefined): string {
    if (val == null) return '0.00%';
    return Number(val).toFixed(2) + '%';
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
