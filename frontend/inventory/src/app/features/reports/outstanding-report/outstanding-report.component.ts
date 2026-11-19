import {
  ChangeDetectionStrategy, ChangeDetectorRef,
  Component, OnDestroy, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { SkeletonModule } from 'primeng/skeleton';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ReportService } from '../services/report.service';
import { CustomerService } from '../../customers/services/customer.service';
import { OutstandingRecordDTO, OutstandingReportResponse } from '../models/report.models';
import { CustomerResponseDTO } from '../../customers/models/customer.model';

@Component({
  selector: 'app-outstanding-report',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule,
    DropdownModule, SkeletonModule,
    PageHeaderComponent,
  ],
  templateUrl: './outstanding-report.component.html',
  styleUrls: ['./outstanding-report.component.css'],
})
export class OutstandingReportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = false;
  data: OutstandingReportResponse | null = null;
  selectedCustomerId: number | null = null;
  customerOptions: { label: string; value: number }[] = [];

  constructor(
    private reportService: ReportService,
    private customerService: CustomerService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadReport();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCustomers(): void {
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
    this.loading = true;
    this.cdr.markForCheck();
    this.reportService.getOutstandingReport(this.selectedCustomerId || undefined)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => { this.data = res; this.loading = false; this.cdr.markForCheck(); },
        error: () =>   { this.loading = false; this.cdr.markForCheck(); },
      });
  }

  onApplyFilter(): void { this.loadReport(); }

  onClearFilter(): void {
    this.selectedCustomerId = null;
    this.loadReport();
  }

  onExportCsv(): void {
    if (!this.data?.records?.length) return;
    const header = [
      'Customer', 'Total Invoices', 'Total Amount', 'Paid Amount', 'Balance',
      '0-30 Days', '31-60 Days', '61-90 Days', '90+ Days'
    ].join(',');
    const rows = this.data.records.map(r => [
      `"${r.customerName}"`,
      r.totalInvoices,
      this.rawNum(r.totalAmount),
      this.rawNum(r.paidAmount),
      this.rawNum(r.balanceAmount),
      this.rawNum(r.bucket0To30),
      this.rawNum(r.bucket31To60),
      this.rawNum(r.bucket61To90),
      this.rawNum(r.bucketAbove90),
    ].join(','));
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `outstanding-report-${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Helpers ──────────────────────────────────────────────── */
  formatCurrency(val: number | null | undefined): string {
    if (val == null) return '₹0.00';
    return '₹' + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  agingClass(bucket: 'b1' | 'b2' | 'b3' | 'b4'): string {
    const classMap: Record<string, string> = {
      b1: 'bucket-current',
      b2: 'bucket-warning',
      b3: 'bucket-late',
      b4: 'bucket-critical',
    };
    return classMap[bucket];
  }

  agingBarWidth(value: number): number {
    if (!this.data?.totalOutstanding || this.data.totalOutstanding === 0) return 0;
    return Math.round((Number(value) / Number(this.data.totalOutstanding)) * 100);
  }

  private rawNum(val: number | null | undefined): string {
    return val != null ? Number(val).toFixed(2) : '0.00';
  }
}
