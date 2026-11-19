import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';
import { Chart, registerables } from 'chart.js';

import { SalesDashboardService } from './sales-dashboard.service';
import { SalesDashboardDTO } from './models/sales-dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'app-sales-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    CardModule,
    TagModule,
    ButtonModule,
    TooltipModule,
    RippleModule,
    SkeletonModule,
    DatePipe,
  ],
  template: `
    <div class="sales-dashboard">

      <!-- ── Page Header ────────────────────────────────────────────────── -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="header-left">
            <h1 class="page-title">
              <i class="pi pi-chart-line"></i>
              Sales Dashboard
            </h1>
            <p class="page-subtitle">Real-time revenue, customer and collections overview</p>
          </div>
          <div class="header-right">
            <button
              pButton
              pRipple
              icon="pi pi-refresh"
              label="Refresh"
              class="p-button-primary refresh-btn"
              (click)="load()"
              [loading]="loading">
            </button>
          </div>
        </div>
      </div>

      <!-- ── Loading State ─────────────────────────────────────────────── -->
      <div *ngIf="loading && !data" class="loading-state">
        <div class="kpi-grid">
          <p-card *ngFor="let i of [1,2,3,4,5,6]" styleClass="kpi-card">
            <div class="kpi-content">
              <p-skeleton shape="circle" size="48px"></p-skeleton>
              <div class="kpi-details">
                <p-skeleton width="80px" height="0.75rem"></p-skeleton>
                <p-skeleton width="120px" height="1.75rem" styleClass="mt-1"></p-skeleton>
              </div>
            </div>
          </p-card>
        </div>
      </div>

      <!-- ── Error State ───────────────────────────────────────────────── -->
      <div *ngIf="error && !data" class="error-state">
        <i class="pi pi-exclamation-circle"></i>
        <p>{{ error }}</p>
        <button pButton pRipple label="Try Again" icon="pi pi-refresh"
          class="p-button-primary" (click)="load()"></button>
      </div>

      <!-- ── Dashboard Content ─────────────────────────────────────────── -->
      <ng-container *ngIf="data">

        <!-- ── KPI Cards ────────────────────────────────────────────────── -->
        <div class="kpi-grid">

          <p-card styleClass="kpi-card">
            <div class="kpi-content">
              <div class="kpi-icon primary">
                <i class="pi pi-indian-rupee"></i>
              </div>
              <div class="kpi-details">
                <span class="kpi-label">Today's Revenue</span>
                <h3 class="kpi-value">{{ fmt(data.kpiCards.todayRevenue) }}</h3>
              </div>
            </div>
          </p-card>

          <p-card styleClass="kpi-card">
            <div class="kpi-content">
              <div class="kpi-icon success">
                <i class="pi pi-chart-line"></i>
              </div>
              <div class="kpi-details">
                <span class="kpi-label">This Month's Revenue</span>
                <h3 class="kpi-value">{{ fmt(data.kpiCards.thisMonthRevenue) }}</h3>
                <span class="kpi-meta"
                  [class.text-success]="(data.kpiCards.revenueGrowthPercent ?? 0) >= 0"
                  [class.text-danger]="(data.kpiCards.revenueGrowthPercent ?? 0) < 0">
                  <i class="pi"
                    [class.pi-arrow-up]="(data.kpiCards.revenueGrowthPercent ?? 0) >= 0"
                    [class.pi-arrow-down]="(data.kpiCards.revenueGrowthPercent ?? 0) < 0"></i>
                  {{ data.kpiCards.revenueGrowthPercent != null
                      ? (data.kpiCards.revenueGrowthPercent | number:'1.1-1') + '%'
                      : 'N/A' }}
                  vs last month
                </span>
              </div>
            </div>
          </p-card>

          <p-card styleClass="kpi-card">
            <div class="kpi-content">
              <div class="kpi-icon danger">
                <i class="pi pi-exclamation-triangle"></i>
              </div>
              <div class="kpi-details">
                <span class="kpi-label">Outstanding Dues</span>
                <h3 class="kpi-value text-danger">{{ fmt(data.kpiCards.outstandingDues) }}</h3>
              </div>
            </div>
          </p-card>

          <p-card styleClass="kpi-card">
            <div class="kpi-content">
              <div class="kpi-icon info">
                <i class="pi pi-receipt"></i>
              </div>
              <div class="kpi-details">
                <span class="kpi-label">Invoices This Month</span>
                <h3 class="kpi-value">{{ data.kpiCards.totalInvoicesThisMonth }}</h3>
              </div>
            </div>
          </p-card>

          <p-card styleClass="kpi-card">
            <div class="kpi-content">
              <div class="kpi-icon warning">
                <i class="pi pi-wallet"></i>
              </div>
              <div class="kpi-details">
                <span class="kpi-label">Avg Order Value</span>
                <h3 class="kpi-value">{{ fmt(data.kpiCards.averageOrderValue) }}</h3>
              </div>
            </div>
          </p-card>

          <p-card styleClass="kpi-card">
            <div class="kpi-content">
              <div class="kpi-icon teal">
                <i class="pi pi-users"></i>
              </div>
              <div class="kpi-details">
                <span class="kpi-label">Total Customers</span>
                <h3 class="kpi-value">{{ data.kpiCards.totalCustomers }}</h3>
              </div>
            </div>
          </p-card>

        </div>

        <!-- ── Revenue Trend + Payment Breakdown ──────────────────────── -->
        <div class="dashboard-content">

          <div class="chart-section">
            <p-card>
              <ng-template pTemplate="header">
                <div class="card-header">
                  <h3 class="card-title">
                    <i class="pi pi-chart-bar"></i>
                    Revenue Trend
                  </h3>
                  <span class="card-subtitle">Last 12 months · Net revenue</span>
                </div>
              </ng-template>
              <div class="chart-container">
                <canvas #revenueChart></canvas>
              </div>
            </p-card>
          </div>

          <div class="chart-section">
            <p-card>
              <ng-template pTemplate="header">
                <div class="card-header">
                  <h3 class="card-title">
                    <i class="pi pi-circle-fill"></i>
                    Payment Status
                  </h3>
                  <span class="card-subtitle">All invoices by collection status</span>
                </div>
              </ng-template>
              <div class="donut-wrapper">
                <canvas #paymentChart class="donut-canvas"></canvas>
                <div class="donut-legend">
                  <div class="legend-item">
                    <span class="legend-dot" style="background:#10b981"></span>
                    <span class="legend-label">Paid</span>
                    <strong class="legend-count">{{ data.paymentBreakdown.paidCount }}</strong>
                    <span class="legend-amount">{{ fmt(data.paymentBreakdown.paidAmount) }}</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-dot" style="background:#f59e0b"></span>
                    <span class="legend-label">Partial</span>
                    <strong class="legend-count">{{ data.paymentBreakdown.partiallyPaidCount }}</strong>
                    <span class="legend-amount">{{ fmt(data.paymentBreakdown.partiallyPaidAmount) }}</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-dot" style="background:#ef4444"></span>
                    <span class="legend-label">Unpaid</span>
                    <strong class="legend-count">{{ data.paymentBreakdown.unpaidCount }}</strong>
                    <span class="legend-amount">{{ fmt(data.paymentBreakdown.unpaidAmount) }}</span>
                  </div>
                </div>
              </div>
            </p-card>
          </div>

          <!-- ── Dues Aging ─────────────────────────────────────────────── -->
          <div class="chart-section">
            <p-card>
              <ng-template pTemplate="header">
                <div class="card-header">
                  <h3 class="card-title">
                    <i class="pi pi-clock"></i>
                    Outstanding Dues Aging
                  </h3>
                  <span class="card-subtitle">Unpaid balance by invoice age</span>
                </div>
              </ng-template>
              <div class="chart-container">
                <canvas #agingChart></canvas>
              </div>
              <div class="aging-strip">
                <div class="aging-chip chip-green">
                  <span class="chip-label">0 – 30 days</span>
                  <strong class="chip-value">{{ fmt(data.duesAging.days0to30) }}</strong>
                  <em class="chip-count">{{ data.duesAging.count0to30 }} inv</em>
                </div>
                <div class="aging-chip chip-amber">
                  <span class="chip-label">31 – 60 days</span>
                  <strong class="chip-value">{{ fmt(data.duesAging.days31to60) }}</strong>
                  <em class="chip-count">{{ data.duesAging.count31to60 }} inv</em>
                </div>
                <div class="aging-chip chip-orange">
                  <span class="chip-label">61 – 90 days</span>
                  <strong class="chip-value">{{ fmt(data.duesAging.days61to90) }}</strong>
                  <em class="chip-count">{{ data.duesAging.count61to90 }} inv</em>
                </div>
                <div class="aging-chip chip-red">
                  <span class="chip-label">90+ days</span>
                  <strong class="chip-value">{{ fmt(data.duesAging.days90plus) }}</strong>
                  <em class="chip-count">{{ data.duesAging.count90plus }} inv</em>
                </div>
              </div>
            </p-card>
          </div>

          <!-- ── Customer Type ────────────────────────────────────────────── -->
          <div class="chart-section">
            <p-card>
              <ng-template pTemplate="header">
                <div class="card-header">
                  <h3 class="card-title">
                    <i class="pi pi-users"></i>
                    Sales by Customer Type
                  </h3>
                  <span class="card-subtitle">This month's revenue by channel</span>
                </div>
              </ng-template>
              <div class="donut-wrapper">
                <canvas #customerTypeChart class="donut-canvas"></canvas>
                <div class="donut-legend">
                  <div class="legend-item">
                    <span class="legend-dot" style="background:#0891b2"></span>
                    <span class="legend-label">Distributor</span>
                    <span class="legend-amount">{{ fmt(data.customerTypeRevenue.distributorRevenue) }}</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-dot" style="background:#0284c7"></span>
                    <span class="legend-label">Dealer</span>
                    <span class="legend-amount">{{ fmt(data.customerTypeRevenue.dealerRevenue) }}</span>
                  </div>
                  <div class="legend-item">
                    <span class="legend-dot" style="background:#14b8a6"></span>
                    <span class="legend-label">Direct</span>
                    <span class="legend-amount">{{ fmt(data.customerTypeRevenue.directCustomerRevenue) }}</span>
                  </div>
                </div>
              </div>
            </p-card>
          </div>
          <!-- ── Top Customers ──────────────────────────────────────────── -->
          <div class="table-section">
            <p-card>
              <ng-template pTemplate="header">
                <div class="card-header">
                  <h3 class="card-title">
                    <i class="pi pi-star"></i>
                    Top 10 Customers
                  </h3>
                  <span class="card-subtitle">By total revenue · All time</span>
                </div>
              </ng-template>
              <div class="table-scroll">
                <table class="modern-table">
                  <thead>
                    <tr>
                      <th class="cell-rank">#</th>
                      <th>Customer</th>
                      <th class="cell-right">Invoices</th>
                      <th class="cell-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let c of data.topCustomers; let i = index" class="table-row">
                      <td class="cell-rank">
                        <span class="rank-badge"
                          [class.gold]="i===0" [class.silver]="i===1" [class.bronze]="i===2">
                          {{ i + 1 }}
                        </span>
                      </td>
                      <td>
                        <div class="customer-info">
                          <span class="customer-avatar">{{ c.customerName.charAt(0) }}</span>
                          <span class="customer-name">{{ c.customerName }}</span>
                        </div>
                      </td>
                      <td class="cell-right sno-text">{{ c.invoiceCount }}</td>
                      <td class="cell-right rev-value">{{ fmt(c.totalRevenue) }}</td>
                    </tr>
                    <tr *ngIf="data.topCustomers.length === 0">
                      <td colspan="4" class="no-data-cell">
                        <div class="no-data-message">
                          <i class="pi pi-users"></i>
                          <p>No customer data yet</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </p-card>
          </div>

          <!-- ── Top Products ───────────────────────────────────────────── -->
          <div class="table-section">
            <p-card>
              <ng-template pTemplate="header">
                <div class="card-header">
                  <h3 class="card-title">
                    <i class="pi pi-box"></i>
                    Top 10 Products
                  </h3>
                  <span class="card-subtitle">By total revenue · All time</span>
                </div>
              </ng-template>
              <div class="table-scroll">
                <table class="modern-table">
                  <thead>
                    <tr>
                      <th class="cell-rank">#</th>
                      <th>Product</th>
                      <th class="cell-right">Qty Sold</th>
                      <th class="cell-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let p of data.topProducts; let i = index" class="table-row">
                      <td class="cell-rank">
                        <span class="rank-badge"
                          [class.gold]="i===0" [class.silver]="i===1" [class.bronze]="i===2">
                          {{ i + 1 }}
                        </span>
                      </td>
                      <td class="customer-name">{{ p.productName }}</td>
                      <td class="cell-right sno-text">{{ p.totalQuantity | number }}</td>
                      <td class="cell-right rev-value">{{ fmt(p.totalRevenue) }}</td>
                    </tr>
                    <tr *ngIf="data.topProducts.length === 0">
                      <td colspan="4" class="no-data-cell">
                        <div class="no-data-message">
                          <i class="pi pi-box"></i>
                          <p>No product data yet</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </p-card>
          </div>

          <!-- ── Recent Invoices ─────────────────────────────────────────── -->
          <div class="table-section full-width">
            <p-card>
              <ng-template pTemplate="header">
                <div class="card-header">
                  <h3 class="card-title">
                    <i class="pi pi-file-invoice"></i>
                    Recent Invoices
                  </h3>
                  <span class="card-subtitle">Latest 15 transactions</span>
                  <a routerLink="/invoices" class="view-all-link">
                    View all <i class="pi pi-arrow-right"></i>
                  </a>
                </div>
              </ng-template>
              <div class="table-scroll">
                <table class="modern-table">
                  <thead>
                    <tr>
                      <th>Invoice #</th>
                      <th>Customer</th>
                      <th class="cell-right">Amount</th>
                      <th class="cell-right">Paid</th>
                      <th class="cell-right">Balance</th>
                      <th class="cell-center">Payment</th>
                      <th class="cell-center">Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let inv of data.recentInvoices" class="table-row">
                      <td>
                        <a [routerLink]="['/invoices', inv.id]" class="inv-link">
                          {{ inv.invoiceNumber }}
                        </a>
                      </td>
                      <td class="customer-name">{{ inv.customerName }}</td>
                      <td class="cell-right main-amount">{{ fmt(inv.netAmount) }}</td>
                      <td class="cell-right paid-amount">{{ fmt(inv.paidAmount) }}</td>
                      <td class="cell-right"
                        [class.due-text]="(inv.netAmount - inv.paidAmount) > 0">
                        {{ fmt(inv.netAmount - inv.paidAmount) }}
                      </td>
                      <td class="cell-center">
                        <p-tag
                          [value]="paymentLabel(inv.paymentStatus)"
                          [severity]="paymentSeverity(inv.paymentStatus)">
                        </p-tag>
                      </td>
                      <td class="cell-center">
                        <p-tag
                          [value]="inv.invoiceStatus"
                          [severity]="invoiceSeverity(inv.invoiceStatus)">
                        </p-tag>
                      </td>
                      <td class="date-cell">{{ inv.invoiceDate | date:'dd MMM yy, h:mm a' }}</td>
                    </tr>
                    <tr *ngIf="data.recentInvoices.length === 0" class="no-data-row">
                      <td colspan="8" class="no-data-cell">
                        <div class="no-data-message">
                          <i class="pi pi-file-invoice"></i>
                          <p>No invoices found</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </p-card>
          </div>

        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    /* ── Container ─────────────────────────────────────────────────────── */
    .sales-dashboard {
      padding: 1.5rem;
      max-width: 1600px;
      margin: 0 auto;
      background: #f8fafc;
      min-height: 100vh;
    }

    /* ── Page Header ───────────────────────────────────────────────────── */
    .dashboard-header {
      background: white;
      border-radius: 12px;
      padding: 1.5rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .header-left { flex: 1; }

    .header-right {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .page-title i {
      color: #0891b2;
      font-size: 1.5rem;
    }

    .page-subtitle {
      color: #64748b;
      font-size: 0.95rem;
      margin: 0.5rem 0 0 0;
    }

    .refresh-btn {
      padding: 0.625rem 1.25rem;
      font-weight: 600;
      font-size: 0.875rem;
      background: #0891b2 !important;
      border: none !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
    }

    .refresh-btn:enabled:hover {
      background: #0e7490 !important;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }

    /* ── Loading State ─────────────────────────────────────────────────── */
    .loading-state { margin-bottom: 1.5rem; }

    /* ── Error State ───────────────────────────────────────────────────── */
    .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      gap: 1rem;
      color: #64748b;
      font-size: 0.95rem;
    }

    .error-state .pi-exclamation-circle {
      font-size: 2.5rem;
      color: #ef4444;
    }

    /* ── KPI Grid ──────────────────────────────────────────────────────── */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    :host ::ng-deep .kpi-card .p-card-body {
      padding: 1rem;
      height: 100%;
    }

    :host ::ng-deep .kpi-card .p-card-content {
      padding: 0;
      height: 100%;
    }

    :host ::ng-deep .kpi-card {
      transition: all 0.3s ease;
      border: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      height: 110px;
    }

    :host ::ng-deep .kpi-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }

    .kpi-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      height: 100%;
    }

    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.375rem;
      flex-shrink: 0;
    }

    .kpi-icon.primary { background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); color: white; }
    .kpi-icon.success { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
    .kpi-icon.danger  { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }
    .kpi-icon.info    { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; }
    .kpi-icon.warning { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
    .kpi-icon.teal    { background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: white; }

    .kpi-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .kpi-label {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .kpi-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      line-height: 1.1;
    }

    .kpi-value.text-danger { color: #ef4444; }

    .kpi-meta {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    /* ── Dashboard Content Grid ────────────────────────────────────────── */
    .dashboard-content {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.5rem;
    }

    .chart-section, .table-section {
      grid-column: span 1;
    }

    .full-width {
      grid-column: span 2;
    }

    @media (max-width: 1024px) {
      .dashboard-content { grid-template-columns: 1fr; }
      .full-width { grid-column: span 1; }
    }

    /* ── p-card Overrides ──────────────────────────────────────────────── */
    :host ::ng-deep .p-card {
      border-radius: 12px;
      border: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
    }

    :host ::ng-deep .p-card:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    :host ::ng-deep .p-card .p-card-header {
      border-bottom: 1px solid #e2e8f0;
      padding: 0.875rem 1.125rem;
      background: #f8fafc;
      border-radius: 12px 12px 0 0;
    }

    :host ::ng-deep .p-card .p-card-body {
      padding: 1.125rem;
    }

    :host ::ng-deep .p-card .p-card-content {
      padding: 0;
    }

    /* ── Card Header ───────────────────────────────────────────────────── */
    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .card-title {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .card-title i {
      color: #64748b;
      font-size: 1.125rem;
    }

    .card-subtitle {
      font-size: 0.8rem;
      color: #94a3b8;
      flex: 1;
    }

    .view-all-link {
      font-size: 0.8rem;
      color: #0891b2;
      text-decoration: none;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      white-space: nowrap;
    }

    .view-all-link:hover { text-decoration: underline; }

    /* ── Chart Container ───────────────────────────────────────────────── */
    .chart-container {
      position: relative;
      min-height: 260px;
      width: 100%;
    }

    .chart-container canvas {
      width: 100% !important;
    }

    /* ── Donut Chart ───────────────────────────────────────────────────── */
    .donut-wrapper {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 0.5rem 0;
    }

    .donut-canvas {
      width: 160px !important;
      height: 160px !important;
      flex-shrink: 0;
    }

    .donut-legend {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      flex: 1;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }

    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .legend-label {
      flex: 1;
      color: #374151;
    }

    .legend-count {
      font-weight: 700;
      color: #1e293b;
      font-size: 0.9rem;
    }

    .legend-amount {
      font-size: 0.78rem;
      color: #64748b;
    }

    /* ── Dues Aging Strip ──────────────────────────────────────────────── */
    .aging-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .aging-chip {
      border-radius: 8px;
      padding: 0.6rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .chip-label  { font-size: 0.7rem; font-weight: 500; color: #374151; }
    .chip-value  { font-size: 0.85rem; font-weight: 700; color: #1e293b; }
    .chip-count  { font-size: 0.7rem; font-style: normal; color: #94a3b8; }

    .chip-green  { background: #f0fdf4; border: 1px solid #bbf7d0; }
    .chip-amber  { background: #fffbeb; border: 1px solid #fde68a; }
    .chip-orange { background: #fff7ed; border: 1px solid #fed7aa; }
    .chip-red    { background: #fef2f2; border: 1px solid #fecaca; }

    /* ── Table ─────────────────────────────────────────────────────────── */
    .table-scroll { overflow-x: auto; }

    .modern-table {
      width: 100%;
      border-collapse: collapse;
    }

    .modern-table thead {
      background: var(--surface-100, #f8fafc);
    }

    .modern-table thead th {
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-color-secondary, #64748b);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid var(--surface-border, #e2e8f0);
      white-space: nowrap;
    }

    .modern-table tbody tr {
      border-bottom: 1px solid var(--surface-border, #e2e8f0);
      transition: background-color 0.2s;
    }

    .modern-table tbody tr:hover {
      background-color: var(--surface-hover, #f8fafc);
    }

    .modern-table tbody td {
      padding: 0.875rem 1rem;
      vertical-align: middle;
      font-size: 0.875rem;
      color: #374151;
    }

    .cell-rank   { width: 50px; }
    .cell-right  { text-align: right !important; }
    .cell-center { text-align: center !important; }

    .sno-text    { color: #64748b; font-weight: 600; }
    .main-amount { font-weight: 700; color: #0f172a; font-variant-numeric: tabular-nums; }
    .paid-amount { color: #059669; font-weight: 600; }
    .due-text    { color: #dc2626; font-weight: 600; }
    .rev-value   { font-weight: 700; color: #0f172a; font-variant-numeric: tabular-nums; }
    .date-cell   { font-size: 0.78rem; color: #64748b; white-space: nowrap; }

    .inv-link {
      color: #0891b2;
      text-decoration: none;
      font-weight: 600;
      font-family: 'Courier New', monospace;
    }
    .inv-link:hover { text-decoration: underline; }

    /* ── Customer Info Cell ────────────────────────────────────────────── */
    .customer-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .customer-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #e0f2fe;
      color: #0891b2;
      font-size: 0.75rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .customer-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.875rem;
    }

    /* ── Rank Badge ────────────────────────────────────────────────────── */
    .rank-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      font-size: 0.72rem;
      font-weight: 700;
      background: #f1f5f9;
      color: #64748b;
    }

    .rank-badge.gold   { background: #fef9c3; color: #a16207; }
    .rank-badge.silver { background: #f1f5f9; color: #475569; }
    .rank-badge.bronze { background: #fdf3e7; color: #92400e; }

    /* ── No Data ───────────────────────────────────────────────────────── */
    .no-data-row  { border-bottom: none !important; }
    .no-data-cell { padding: 2.5rem !important; }

    .no-data-message {
      text-align: center;
      color: #94a3b8;
    }

    .no-data-message i {
      font-size: 2.5rem;
      opacity: 0.3;
      display: block;
      margin-bottom: 0.75rem;
    }

    .no-data-message p {
      font-size: 0.95rem;
    }

    /* ── p-tag Badge Overrides (matches invoice list screen) ─────────── */
    :host ::ng-deep .p-tag {
      padding: 5px 10px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 6px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    :host ::ng-deep .p-tag.p-tag-success {
      background: #d1fae5;
      color: #059669;
    }

    :host ::ng-deep .p-tag.p-tag-danger {
      background: #fee2e2;
      color: #dc2626;
    }

    :host ::ng-deep .p-tag.p-tag-warning {
      background: #fef3c7;
      color: #d97706;
    }

    :host ::ng-deep .p-tag.p-tag-info {
      background: #dbeafe;
      color: #2563eb;
    }

    :host ::ng-deep .p-tag.p-tag-secondary {
      background: #f1f5f9;
      color: #64748b;
    }

    /* ── Helpers ───────────────────────────────────────────────────────── */
    .text-success { color: #10b981; }
    .text-danger  { color: #ef4444; }
    .mt-1         { margin-top: 0.5rem; }

    /* ── Responsive ────────────────────────────────────────────────────── */
    @media (max-width: 768px) {
      .header-content { flex-direction: column; align-items: flex-start; }
      .header-right   { width: 100%; justify-content: flex-end; }
      .page-title     { font-size: 1.5rem; }
      .aging-strip    { grid-template-columns: repeat(2, 1fr); }
      .donut-wrapper  { flex-direction: column; align-items: flex-start; }
    }
  `]
})
export class SalesDashboardComponent implements OnInit, OnDestroy {

  @ViewChild('revenueChart')      private revenueRef!:      ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentChart')      private paymentRef!:      ElementRef<HTMLCanvasElement>;
  @ViewChild('customerTypeChart') private customerTypeRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('agingChart')        private agingRef!:        ElementRef<HTMLCanvasElement>;

  data: SalesDashboardDTO | null = null;
  loading = false;
  error: string | null = null;

  private charts: Chart[] = [];
  private loadSub?: Subscription;

  constructor(
    private svc: SalesDashboardService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void { this.load(); }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
    this.charts.forEach(c => c.destroy());
  }

  load(): void {
    this.loadSub?.unsubscribe();
    this.loading = true;
    this.error = null;
    this.charts.forEach(c => c.destroy());
    this.charts = [];
    this.cdr.markForCheck();

    this.loadSub = this.svc.getDashboard().subscribe({
      next: (d) => {
        this.data = d;
        this.loading = false;
        this.cdr.markForCheck();
        setTimeout(() => this.initCharts(), 0);
      },
      error: () => {
        this.error = 'Failed to load dashboard. Please try again.';
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  // ── Charts ─────────────────────────────────────────────────────────────

  private initCharts(): void {
    if (!this.data) return;
    this.buildRevenueChart();
    this.buildPaymentChart();
    this.buildCustomerTypeChart();
    this.buildAgingChart();
  }

  private buildRevenueChart(): void {
    if (!this.revenueRef) return;
    const ctx = this.revenueRef.nativeElement.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(8,145,178,0.85)');
    gradient.addColorStop(1, 'rgba(8,145,178,0.35)');

    this.charts.push(new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.data!.revenueTrend.map(m => m.monthLabel),
        datasets: [{
          label: 'Revenue (₹)',
          data: this.data!.revenueTrend.map(m => Number(m.revenue)),
          backgroundColor: gradient,
          borderColor: '#0891b2',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ' ₹' + this.fmtNum(c.parsed.y ?? 0) } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { font: { size: 11 }, color: '#94a3b8', callback: (v) => '₹' + this.fmtNum(+v) }
          }
        }
      }
    }));
  }

  private buildPaymentChart(): void {
    if (!this.paymentRef) return;
    const pb = this.data!.paymentBreakdown;
    this.charts.push(new Chart(this.paymentRef.nativeElement.getContext('2d')!, {
      type: 'doughnut',
      data: {
        labels: ['Paid', 'Partial', 'Unpaid'],
        datasets: [{
          data: [Number(pb.paidAmount), Number(pb.partiallyPaidAmount), Number(pb.unpaidAmount)],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 2, borderColor: '#ffffff', hoverOffset: 6,
        }]
      },
      options: {
        responsive: false, cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ' ₹' + this.fmtNum(c.parsed) } }
        }
      }
    }));
  }

  private buildCustomerTypeChart(): void {
    if (!this.customerTypeRef) return;
    const ct = this.data!.customerTypeRevenue;
    this.charts.push(new Chart(this.customerTypeRef.nativeElement.getContext('2d')!, {
      type: 'doughnut',
      data: {
        labels: ['Distributor', 'Dealer', 'Direct Customer'],
        datasets: [{
          data: [Number(ct.distributorRevenue), Number(ct.dealerRevenue), Number(ct.directCustomerRevenue)],
          backgroundColor: ['#0891b2', '#0284c7', '#14b8a6'],
          borderWidth: 2, borderColor: '#ffffff', hoverOffset: 6,
        }]
      },
      options: {
        responsive: false, cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ' ₹' + this.fmtNum(c.parsed) } }
        }
      }
    }));
  }

  private buildAgingChart(): void {
    if (!this.agingRef) return;
    const ag = this.data!.duesAging;
    this.charts.push(new Chart(this.agingRef.nativeElement.getContext('2d')!, {
      type: 'bar',
      data: {
        labels: ['0–30 days', '31–60 days', '61–90 days', '90+ days'],
        datasets: [{
          label: 'Outstanding (₹)',
          data: [Number(ag.days0to30), Number(ag.days31to60), Number(ag.days61to90), Number(ag.days90plus)],
          backgroundColor: ['#bbf7d0', '#fde68a', '#fed7aa', '#fecaca'],
          borderColor:      ['#10b981', '#f59e0b', '#f97316', '#ef4444'],
          borderWidth: 1.5, borderRadius: 6, borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ' ₹' + this.fmtNum(c.parsed.y ?? 0) } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
          y: {
            grid: { color: '#f1f5f9' },
            ticks: { font: { size: 11 }, color: '#94a3b8', callback: (v) => '₹' + this.fmtNum(+v) }
          }
        }
      }
    }));
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  fmt(value: number | null | undefined): string {
    if (value == null) return '₹0';
    return '₹' + this.fmtNum(value);
  }

  private fmtNum(value: number): string {
    if (value >= 1_00_00_000) return (value / 1_00_00_000).toFixed(2) + ' Cr';
    if (value >= 1_00_000)    return (value / 1_00_000).toFixed(2)    + ' L';
    return new Intl.NumberFormat('en-IN').format(Math.round(value));
  }

  paymentSeverity(status: string): string {
    switch (status) {
      case 'PAID':           return 'success';
      case 'PARTIALLY_PAID': return 'warning';
      case 'UNPAID':         return 'danger';
      default:               return 'info';
    }
  }

  paymentLabel(status: string): string {
    switch (status) {
      case 'PAID':           return 'Paid';
      case 'PARTIALLY_PAID': return 'Partial';
      case 'UNPAID':         return 'Unpaid';
      default:               return status ?? '—';
    }
  }

  invoiceSeverity(status: string): string {
    switch (status) {
      case 'CREATED':   return 'info';
      case 'COMPLETED': return 'success';
      case 'CANCELLED': return 'danger';
      default:          return 'secondary';
    }
  }
}
