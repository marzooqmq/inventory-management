import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, OnDestroy, OnInit
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ReportService } from '../services/report.service';
import { ProductService } from '../../products/services/product.service';
import { CustomerService } from '../../customers/services/customer.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SalesReportDTO, SalesReportFilter, SalesReportResponse } from '../models/report.models';
import { ProductResponseDTO } from '../../products/models/product.model';
import { CustomerResponseDTO } from '../../customers/models/customer.model';

type QuickPreset = 'today' | 'thisWeek' | 'thisMonth' | 'thisQuarter' | 'thisYear' | 'custom';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, DatePipe,
    ButtonModule, CalendarModule, DropdownModule, InputTextModule, SkeletonModule, TooltipModule,
    PageHeaderComponent,
  ],
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.css'],
})
export class SalesReportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = false;
  data: SalesReportResponse | null = null;

  // â”€â”€ Quick Date Presets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  activePreset: QuickPreset = 'thisMonth';
  dateRange: Date[] | null = null;

  presets: { key: QuickPreset; label: string }[] = [
    { key: 'today',       label: 'Today'        },
    { key: 'thisWeek',    label: 'This Week'     },
    { key: 'thisMonth',   label: 'This Month'    },
    { key: 'thisQuarter', label: 'This Quarter'  },
    { key: 'thisYear',    label: 'This Year'     },
    { key: 'custom',      label: 'Custom Range'  },
  ];

  // â”€â”€ Filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  invoiceNumber = '';
  selectedProductId: number | null = null;
  selectedCustomerId: number | null = null;
  selectedPaymentStatus = '';

  productOptions: { label: string; value: number }[] = [];
  customerOptions: { label: string; value: number }[] = [];

  paymentStatusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Paid',         value: 'PAID' },
    { label: 'Partial',      value: 'PARTIALLY_PAID' },
    { label: 'Unpaid',       value: 'UNPAID' },
  ];

  pageSizeOptions = [
    { label: '10 / page',  value: 10  },
    { label: '20 / page',  value: 20  },
    { label: '50 / page',  value: 50  },
    { label: '100 / page', value: 100 },
  ];

  // â”€â”€ Pagination â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  page = 0;
  pageSize = 20;

  constructor(
    private reportService: ReportService,
    private productService: ProductService,
    private customerService: CustomerService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDropdowns();
    this.applyPreset('thisMonth');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // â”€â”€ Preset Logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  applyPreset(preset: QuickPreset): void {
    this.activePreset = preset;
    if (preset !== 'custom') {
      this.dateRange = this.getPresetRange(preset);
      this.page = 0;
      this.loadReport();
    }
    this.cdr.markForCheck();
  }

  private getPresetRange(preset: QuickPreset): [Date, Date] {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const d = now.getDate();

    switch (preset) {
      case 'today':
        return [new Date(y, m, d), new Date(y, m, d)];
      case 'thisWeek': {
        const dow = now.getDay();
        const monday = new Date(y, m, d - (dow === 0 ? 6 : dow - 1));
        const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
        return [monday, sunday];
      }
      case 'thisMonth':
        return [new Date(y, m, 1), new Date(y, m + 1, 0)];
      case 'thisQuarter': {
        const qStart = Math.floor(m / 3) * 3;
        return [new Date(y, qStart, 1), new Date(y, qStart + 3, 0)];
      }
      case 'thisYear':
        return [new Date(y, 0, 1), new Date(y, 11, 31)];
      default:
        return [new Date(y, m, 1), new Date(y, m + 1, 0)];
    }
  }

  // â”€â”€ Data Loading â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private loadDropdowns(): void {
    this.productService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (products: ProductResponseDTO[]) => {
        this.productOptions = [
          { label: 'All Products', value: 0 },
          ...products.map(p => ({ label: p.name, value: p.id })),
        ];
        this.cdr.markForCheck();
      },
    });
    this.customerService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (customers: CustomerResponseDTO[]) => {
        this.customerOptions = [
          { label: 'All Customers', value: 0 },
          ...customers.map(c => ({ label: c.name, value: c.id })),
        ];
        this.cdr.markForCheck();
      },
    });
  }

  loadReport(): void {
    const start = this.resolvedStart;
    const end   = this.resolvedEnd;
    if (!start || !end) return;

    this.loading = true;
    this.cdr.markForCheck();

    const filter: any = { page: this.page, size: this.pageSize };
    filter['startDate'] = this.formatDate(start);
    filter['endDate']   = this.formatDate(end);
    if (this.invoiceNumber.trim())  filter['invoiceNumber'] = this.invoiceNumber.trim();
    if (this.selectedProductId)     filter['productId']     = this.selectedProductId;
    if (this.selectedCustomerId)    filter['customerId']    = this.selectedCustomerId;
    if (this.selectedPaymentStatus) filter['paymentStatus'] = this.selectedPaymentStatus;

    this.reportService.getSalesReport(filter).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => { this.data = res; this.loading = false; this.cdr.markForCheck(); },
      error: ()    => { this.loading = false; this.cdr.markForCheck(); },
    });
  }

  onApplyFilters(): void {
    if (this.activePreset === 'custom' && (!this.dateRange?.[0] || !this.dateRange?.[1])) return;
    this.page = 0;
    this.loadReport();
  }

  onClearFilters(): void {
    this.invoiceNumber = '';
    this.selectedProductId = null;
    this.selectedCustomerId = null;
    this.selectedPaymentStatus = '';
    this.page = 0;
    this.applyPreset('thisMonth');
  }

  onPageSizeChange(): void {
    this.page = 0;
    this.loadReport();
  }

  goToPage(p: number): void {
    this.page = p;
    this.loadReport();
  }

  // â”€â”€ Export â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  onDownloadPdf(): void {
    const start = this.resolvedStart;
    const end   = this.resolvedEnd;
    if (!start || !end) return;

    const filter: SalesReportFilter = {
      startDate: this.formatDate(start),
      endDate: this.formatDate(end),
      invoiceNumber: this.invoiceNumber.trim() || undefined,
      productId: this.selectedProductId ?? undefined,
      customerId: this.selectedCustomerId ?? undefined,
      paymentStatus: this.selectedPaymentStatus || undefined,
      page: this.page,
      size: this.pageSize,
    };

    this.reportService.downloadSalesReportPdf(filter)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `sales-report-${this.formatDate(start)}-to-${this.formatDate(end)}.pdf`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        },
        error: () => this.notificationService.error('Failed to download the sales report PDF.'),
      });
  }

  onExportCsv(): void {
    if (!this.data?.records?.length) return;
    const header = [
      'Invoice No', 'Date', 'Customer', 'Product', 'Qty', 'Unit', 'Boxes',
      'Rate', 'Gross Total', 'Net Amount', 'Paid', 'Balance Due', 'Payment Status'
    ].join(',');
    const rows = this.data.records.map(r => [
      `"${r.invoiceNumber}"`,
      r.invoiceDate ? r.invoiceDate.substring(0, 10) : '',
      `"${r.customerName}"`,
      `"${r.productName}"`,
      r.quantity,
      r.unitType,
      r.quantityInBoxes,
      Number(r.rate).toFixed(2),
      Number(r.total).toFixed(2),
      Number(r.netAmount).toFixed(2),
      Number(r.paidAmount).toFixed(2),
      Number(this.rowBalance(r)).toFixed(2),
      r.paymentStatus,
    ].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales-report-${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // â”€â”€ Computed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  get resolvedStart(): Date | null {
    return this.dateRange?.[0] ?? null;
  }

  get resolvedEnd(): Date | null {
    return this.dateRange?.[1] ?? null;
  }

  get dateRangeLabel(): string {
    if (!this.dateRange?.[0] || !this.dateRange?.[1]) return '';
    const opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' };
    const s = this.dateRange[0].toLocaleDateString('en-IN', opts);
    const e = this.dateRange[1].toLocaleDateString('en-IN', opts);
    return s === e ? s : `${s} â€“ ${e}`;
  }

  get activeFiltersCount(): number {
    let count = 0;
    if (this.invoiceNumber.trim())  count++;
    if (this.selectedCustomerId)    count++;
    if (this.selectedProductId)     count++;
    if (this.selectedPaymentStatus) count++;
    return count;
  }

  get pages(): number[] {
    return Array.from({ length: this.data?.totalPages ?? 0 }, (_, i) => i);
  }

  rowBalance(row: SalesReportDTO): number {
    return Math.max(0, Number(row.netAmount) - Number(row.paidAmount));
  }

  // â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  paymentClass(status: string): string {
    switch (status) {
      case 'PAID':           return 'badge-paid';
      case 'PARTIALLY_PAID': return 'badge-partial';
      case 'UNPAID':         return 'badge-unpaid';
      default:               return 'badge-default';
    }
  }

  paymentLabel(status: string): string {
    switch (status) {
      case 'PAID':           return 'Paid';
      case 'PARTIALLY_PAID': return 'Partial';
      case 'UNPAID':         return 'Unpaid';
      default:               return status;
    }
  }

  formatCurrency(val: number | null | undefined): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val == null ? 0 : Number(val));
  }

  private formatDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}
