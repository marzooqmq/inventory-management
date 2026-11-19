import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';
import { SalesDashboardDTO } from '../sales-dashboard/models/sales-dashboard.model';
import { SalesDashboardService } from '../sales-dashboard/sales-dashboard.service';
import { DashboardSummary, LowStockItem, ProductionStageCount } from '../inventory-dashboard/models/dashboard.models';
import { InventoryDashboardService } from '../inventory-dashboard/services/inventory-dashboard.service';
import { User } from '../../core/auth/models/user.model';

interface DashboardMetric {
  label: string;
  value: string;
  loading: boolean;
  note: string;
  icon: string;
  color: string;
  route: string;
}

interface QuickAction {
  label: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  readonly currentDate = new Date();
  readonly currentUser: User | null;
  readonly role: string;

  salesData: SalesDashboardDTO | null = null;
  inventorySummary: DashboardSummary | null = null;
  lowStockItems: LowStockItem[] = [];
  productionStages: ProductionStageCount | null = null;

  salesLoading = false;
  inventoryLoading = false;
  lowStockLoading = false;
  stagesLoading = false;
  salesError = false;
  inventoryError = false;
  lowStockError = false;
  stagesError = false;

  constructor(
    authService: AuthService,
    private salesDashboardService: SalesDashboardService,
    private inventoryDashboardService: InventoryDashboardService,
    private cdr: ChangeDetectorRef,
  ) {
    this.currentUser = authService.getCurrentUser();
    this.role = this.currentUser?.role?.toUpperCase().replace(/\s+/g, '_') ?? '';
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get displayName(): string {
    return this.currentUser?.fullName?.trim() || this.currentUser?.username || 'there';
  }

  get roleTitle(): string {
    switch (this.role) {
      case 'ADMIN': return 'Administrator';
      case 'ACCOUNTANT': return 'Accountant';
      case 'PRODUCTION_MANAGER': return 'Production Manager';
      default: return 'Team Member';
    }
  }

  get hasSalesAccess(): boolean {
    return this.role === 'ADMIN' || this.role === 'ACCOUNTANT';
  }

  get hasInventoryAccess(): boolean {
    return this.role === 'ADMIN' || this.role === 'PRODUCTION_MANAGER';
  }

  get metrics(): DashboardMetric[] {
    const metrics: DashboardMetric[] = [];

    if (this.hasSalesAccess) {
      metrics.push(
        {
          label: 'Sales This Month',
          value: this.salesData?.kpiCards ? this.formatCurrency(this.salesData.kpiCards.thisMonthRevenue) : '—',
          loading: this.salesLoading,
          note: 'Revenue recorded this month',
          icon: 'pi pi-chart-line',
          color: 'cyan',
          route: '/sales-dashboard',
        },
        {
          label: 'Outstanding Dues',
          value: this.salesData?.kpiCards ? this.formatCurrency(this.salesData.kpiCards.outstandingDues) : '—',
          loading: this.salesLoading,
          note: 'Unpaid and partially paid invoices',
          icon: 'pi pi-wallet',
          color: 'orange',
          route: '/invoices',
        },
      );
    }

    if (this.role === 'ACCOUNTANT') {
      metrics.push(
        {
          label: "Today's Sales",
          value: this.salesData?.kpiCards ? this.formatCurrency(this.salesData.kpiCards.todayRevenue) : '—',
          loading: this.salesLoading,
          note: 'Revenue recorded today',
          icon: 'pi pi-calendar',
          color: 'blue',
          route: '/sales-dashboard',
        },
        {
          label: 'Invoices This Month',
          value: this.salesData?.kpiCards ? this.formatNumber(this.salesData.kpiCards.totalInvoicesThisMonth) : '—',
          loading: this.salesLoading,
          note: 'Invoices issued this month',
          icon: 'pi pi-file-invoice',
          color: 'green',
          route: '/invoices',
        },
      );
    }

    if (this.hasInventoryAccess) {
      metrics.push(
        {
          label: 'Active Products',
          value: this.inventorySummary ? this.formatNumber(this.inventorySummary.activeProducts) : '—',
          loading: this.inventoryLoading,
          note: this.inventorySummary ? `${this.formatNumber(this.inventorySummary.totalProducts)} products in catalog` : 'Product catalog',
          icon: 'pi pi-box',
          color: 'blue',
          route: '/inventory-dashboard',
        },
        {
          label: 'Low Stock Alerts',
          value: this.inventorySummary ? this.formatNumber(this.inventorySummary.lowStockItemsCount) : '—',
          loading: this.inventoryLoading,
          note: this.inventorySummary?.lowStockItemsCount ? 'Items need replenishment' : 'Items below stock level',
          icon: 'pi pi-exclamation-triangle',
          color: 'orange',
          route: '/inventory-dashboard',
        },
        {
          label: 'Active Production Orders',
          value: this.inventorySummary ? this.formatNumber(this.inventorySummary.activeProductionOrders) : '—',
          loading: this.inventoryLoading,
          note: 'Orders currently in progress',
          icon: 'pi pi-cog',
          color: 'green',
          route: '/production/orders',
        },
        {
          label: 'Inventory Value',
          value: this.inventorySummary ? this.formatCurrency(this.inventorySummary.totalStockValue) : '—',
          loading: this.inventoryLoading,
          note: 'Current stock valuation',
          icon: 'pi pi-chart-bar',
          color: 'violet',
          route: '/inventory-dashboard',
        },
      );
    }

    return metrics;
  }

  get quickActions(): QuickAction[] {
    if (this.role === 'ADMIN') {
      return [
        { label: 'New Invoice', description: 'Create a customer invoice', icon: 'pi pi-plus', route: '/invoices/new' },
        { label: 'Production Orders', description: 'Review and manage orders', icon: 'pi pi-sliders-h', route: '/production/orders' },
        { label: 'Inventory', description: 'View stock and alerts', icon: 'pi pi-warehouse', route: '/inventory-dashboard' },
        { label: 'Cost Approvals', description: 'Review pending product costs', icon: 'pi pi-check-circle', route: '/cost-approvals' },
      ];
    }

    if (this.role === 'ACCOUNTANT') {
      return [
        { label: 'New Invoice', description: 'Create a customer invoice', icon: 'pi pi-plus', route: '/invoices/new' },
        { label: 'Invoices', description: 'Review payments and balances', icon: 'pi pi-file-invoice', route: '/invoices' },
        { label: 'Sales Dashboard', description: 'Explore revenue and sales trends', icon: 'pi pi-chart-line', route: '/sales-dashboard' },
        { label: 'Customers', description: 'View and manage customers', icon: 'pi pi-users', route: '/customers' },
      ];
    }

    if (this.role === 'PRODUCTION_MANAGER') {
      return [
        { label: 'Production Orders', description: 'Manage production workflow', icon: 'pi pi-sliders-h', route: '/production/orders' },
        { label: 'Inventory Dashboard', description: 'Review stock and production status', icon: 'pi pi-chart-bar', route: '/inventory-dashboard' },
        { label: 'Raw Material Stock', description: 'Check available materials', icon: 'pi pi-database', route: '/raw-material-stocks' },
        { label: 'Finished Goods', description: 'Review finished goods stock', icon: 'pi pi-shopping-bag', route: '/finished-goods-stocks' },
      ];
    }

    return [];
  }

  get recentInvoices(): SalesDashboardDTO['recentInvoices'] {
    return this.salesData?.recentInvoices?.slice(0, 5) ?? [];
  }

  loadDashboard(): void {
    if (this.hasSalesAccess) this.loadSalesDashboard();
    if (this.hasInventoryAccess) this.loadInventoryDashboard();
  }

  retrySales(): void {
    this.loadSalesDashboard();
  }

  retryInventory(): void {
    this.loadInventoryDashboard();
  }

  retryLowStock(): void {
    this.loadLowStockItems();
  }

  retryStages(): void {
    this.loadProductionStages();
  }

  formatCurrency(value: number | null | undefined): string {
    if (value == null || !Number.isFinite(Number(value))) return '—';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(Number(value));
  }

  formatNumber(value: number | null | undefined): string {
    if (value == null || !Number.isFinite(Number(value))) return '—';
    return new Intl.NumberFormat('en-IN').format(Number(value));
  }

  invoiceBalance(invoice: SalesDashboardDTO['recentInvoices'][number]): number {
    return Math.max(0, Number(invoice.netAmount ?? 0) - Number(invoice.paidAmount ?? 0));
  }

  private loadSalesDashboard(): void {
    this.salesLoading = true;
    this.salesError = false;
    this.cdr.markForCheck();

    this.salesDashboardService.getDashboard().pipe(takeUntil(this.destroy$)).subscribe({
      next: data => {
        this.salesData = data;
        this.salesLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.salesError = true;
        this.salesLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private loadInventoryDashboard(): void {
    this.inventoryLoading = true;
    this.inventoryError = false;
    this.cdr.markForCheck();

    this.inventoryDashboardService.getSummary().pipe(takeUntil(this.destroy$)).subscribe({
      next: data => {
        this.inventorySummary = data;
        this.inventoryLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.inventoryError = true;
        this.inventoryLoading = false;
        this.cdr.markForCheck();
      },
    });

    this.loadLowStockItems();
    this.loadProductionStages();
  }

  private loadLowStockItems(): void {
    this.lowStockLoading = true;
    this.lowStockError = false;
    this.cdr.markForCheck();

    this.inventoryDashboardService.getLowStockItems().pipe(takeUntil(this.destroy$)).subscribe({
      next: data => {
        this.lowStockItems = data;
        this.lowStockLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.lowStockError = true;
        this.lowStockLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private loadProductionStages(): void {
    this.stagesLoading = true;
    this.stagesError = false;
    this.cdr.markForCheck();

    this.inventoryDashboardService.getProductionStageCount().pipe(takeUntil(this.destroy$)).subscribe({
      next: data => {
        this.productionStages = data;
        this.stagesLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.stagesError = true;
        this.stagesLoading = false;
        this.cdr.markForCheck();
      },
    });
  }
}

export default DashboardComponent;
