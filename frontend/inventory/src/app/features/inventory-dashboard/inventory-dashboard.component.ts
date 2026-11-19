import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChartModule, UIChart } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { SelectButtonModule } from 'primeng/selectbutton';
import { RippleModule } from 'primeng/ripple';
import { CalendarModule } from 'primeng/calendar';
import { Subject, takeUntil, finalize, forkJoin } from 'rxjs';
import { InventoryDashboardService } from './services/inventory-dashboard.service';
import {
  DashboardSummary,
  StockBreakdown,
  ProductionDaily,
  ProductionStageCount,
  LowStockItem,
  ProductionTrend,
  TopProduct,
  MaterialConsumption,
  ReorderPoint
} from './models/dashboard.models';

@Component({
  selector: 'app-inventory-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ChartModule,
    TableModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    TooltipModule,
    SelectButtonModule,
    RippleModule,
    CalendarModule
  ],
  templateUrl: './inventory-dashboard.component.html',
  styleUrls: ['./inventory-dashboard.component.css']
})
export class InventoryDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private eventSource?: EventSource;

  @ViewChild('stagesChartEl')  stagesChartEl?: UIChart;
  @ViewChild('topProductsChartEl') topProductsChartEl?: UIChart;
  @ViewChild('materialChartEl') materialChartEl?: UIChart;

  // Data properties
  summary: DashboardSummary | null = null;
  stockBreakdown: StockBreakdown | null = null;
  productionDaily: ProductionDaily[] = [];
  productionStages: ProductionStageCount | null = null;
  lowStockItems: LowStockItem[] = [];
  productionTrend: ProductionTrend[] = [];
  productionTrendData: ProductionTrend[] = [];
  topProducts: TopProduct[] = [];
  topProductsByValue: TopProduct[] = [];
  topProductsByQuantity: TopProduct[] = [];

  // Priority 2: Material Consumption & Reorder Intelligence
  materialConsumption: MaterialConsumption[] = [];
  reorderPoints: ReorderPoint[] = [];

  // Selected date for production
  selectedProductionDate: Date = new Date();
  maxDate: Date = new Date();
  showProductionCalendar: boolean = false;

  // Loading states
  loadingSummary = false;
  loadingStockBreakdown = false;
  loadingProductionDaily = false;
  loadingProductionStages = false;
  loadingLowStock = false;
  loadingProductionTrend = false;
  loadingTopProducts = false;
  loadingMaterialConsumption = false;
  loadingReorderPoints = false;

  // Chart view toggle
  chartViewOptions = [
    { label: 'Value (₹)', value: 'value', icon: 'pi pi-money-bill' },
    { label: 'Boxes', value: 'boxes', icon: 'pi pi-box' },
    { label: 'Pads', value: 'pads', icon: 'pi pi-list' }
  ];
  selectedChartView: 'value' | 'boxes' | 'pads' = 'value';

  // Category colors matching product screen
  categoryColors: { [key: string]: string } = {
    'PREMIUM': '#3b82f6',
    'ULTRA_THIN': '#10b981',
    'LINER': '#f59e0b',
    'OTHERS': '#8b5cf6'
  };

  // Helper method to format stockout date
  formatStockoutDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }

  // Helper method to get count of urgent reorder items
  getUrgentReorderCount(): number {
    return this.reorderPoints.filter(r => r.shouldReorderNow).length;
  }

  get chartTitle(): string {
    switch (this.selectedChartView) {
      case 'value':
        return 'Top 10 Products by Stock Value';
      case 'boxes':
        return 'Top 10 Products by Quantity (Boxes)';
      case 'pads':
        return 'Top 10 Products by Quantity (Pads)';
      default:
        return 'Top 10 Products by Stock';
    }
  }

  // Chart data
  stockBreakdownChart: any;
  productionTrendChart: any;
  productionStagesChart: any;
  topProductsChart: any;
  materialConsumptionChart: any;
  daysOfSupplyChart: any;

  // Chart options - General default
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {}
      }
    }
  };

  // Production Trend Chart Options
  productionTrendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          afterBody: (context: any) => {
            // Show product-wise breakdown only
            if (context[0] && this.productionTrendData && this.productionTrendData[context[0].dataIndex]) {
              const trendData = this.productionTrendData[context[0].dataIndex];
              if (trendData.productWiseQuantity && Object.keys(trendData.productWiseQuantity).length > 0) {
                const lines: string[] = [];
                Object.entries(trendData.productWiseQuantity).forEach(([product, quantity]) => {
                  lines.push(`${product}: ${quantity}`);
                });
                return lines;
              }
            }
            return [];
          }
        }
      }
    }
  };

  // Stock Distribution Chart Options
  stockDistributionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: ${this.formatCurrency(value)}`;
          }
        }
      }
    }
  };

  // Production Pipeline Chart Options
  productionPipelineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const count = context.parsed.y || 0;
            return `Orders in Stage: ${count}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#94a3b8' }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { stepSize: 1, font: { size: 11 }, color: '#94a3b8' }
      }
    }
  };

  // Top Products Chart Options
  topProductsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const productName = context.label || '';
            const value = context.parsed.y || 0;
            
            if (this.selectedChartView === 'value') {
              return `Stock Value (₹): ${this.formatCurrency(value)}`;
            } else if (this.selectedChartView === 'boxes') {
              return `Stock Quantity: ${this.formatNumber(value)} boxes`;
            } else {
              return `Stock Quantity: ${this.formatNumber(value)} pads`;
            }
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#94a3b8' }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 }, color: '#94a3b8' }
      }
    }
  };

  // Material Consumption Chart Options
  materialConsumptionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.x || 0;
            return `Weekly Consumption: ${this.formatNumber(value)} kg`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 11 }, color: '#94a3b8' }
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#94a3b8' }
      }
    }
  };

  // Days of Supply Chart Options
  daysOfSupplyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y || 0;
            const material = this.materialConsumption.find(m => m.materialName === context.label);
            return [
              `Days of Supply: ${this.formatNumber(value)} days`,
              material ? `Current Stock: ${this.formatNumber(material.currentStock)} ${material.unit}` : ''
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, color: '#94a3b8' }
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        title: { display: true, text: 'Days', color: '#94a3b8', font: { size: 11 } },
        ticks: { font: { size: 11 }, color: '#94a3b8' }
      }
    }
  };

  constructor(
    private dashboardService: InventoryDashboardService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAllData();
    this.initializeSSE();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.closeSSE();
  }

  refreshDashboard(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.loadSummary();
    this.loadStockBreakdown();
    this.loadProductionDaily();
    this.loadProductionStages();
    this.loadLowStockItems();
    this.loadProductionTrend();
    this.loadTopProductsData();
    this.loadMaterialConsumption();
    this.loadReorderPoints();
  }

  loadSummary(): void {
    this.loadingSummary = true;
    this.dashboardService.getSummary()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingSummary = false)
      )
      .subscribe({
        next: (data) => this.summary = data,
        error: (err) => console.error('Error loading summary:', err)
      });
  }

  loadStockBreakdown(): void {
    this.loadingStockBreakdown = true;
    this.dashboardService.getStockBreakdown()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingStockBreakdown = false)
      )
      .subscribe({
        next: (data) => {
          this.stockBreakdown = data;
          this.updateStockBreakdownChart(data);
        },
        error: (err) => console.error('Error loading stock breakdown:', err)
      });
  }

  loadProductionDaily(): void {
    this.loadProductionByDate();
  }

  loadProductionStages(): void {
    this.loadingProductionStages = true;
    this.dashboardService.getProductionStageCount()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingProductionStages = false)
      )
      .subscribe({
        next: (data) => {
          this.productionStages = data;
          this.updateProductionStagesChart(data);
        },
        error: (err) => console.error('Error loading production stages:', err)
      });
  }

  loadLowStockItems(): void {
    this.loadingLowStock = true;
    this.dashboardService.getLowStockItems()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingLowStock = false)
      )
      .subscribe({
        next: (data) => this.lowStockItems = data,
        error: (err) => console.error('Error loading low stock items:', err)
      });
  }

  loadProductionTrend(): void {
    this.loadingProductionTrend = true;
    this.dashboardService.getProductionTrend(7)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingProductionTrend = false)
      )
      .subscribe({
        next: (data) => {
          this.productionTrend = data;
          this.updateProductionTrendChart(data);
        },
        error: (err) => console.error('Error loading production trend:', err)
      });
  }

  loadTopProductsData(): void {
    this.loadingTopProducts = true;
    forkJoin({
      byValue: this.dashboardService.getTopProducts(10),
      byQuantity: this.dashboardService.getTopProductsByQuantity(10)
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingTopProducts = false)
      )
      .subscribe({
        next: (data) => {
          this.topProductsByValue = data.byValue;
          this.topProductsByQuantity = data.byQuantity;
          this.updateTopProductsChart();
        },
        error: (err) => console.error('Error loading top products:', err)
      });
  }

  updateStockBreakdownChart(data: StockBreakdown): void {
    this.stockBreakdownChart = {
      labels: ['Raw Materials', 'Finished Goods', 'Boxes'],
      datasets: [{
        data: [
          data.rawMaterialStockValue,
          data.finishedGoodsStockValue,
          data.boxStockValue
        ],
        backgroundColor: ['#14b8a6', '#3b82f6', '#f59e0b'],
        hoverBackgroundColor: ['#0d9488', '#2563eb', '#d97706']
      }]
    };
  }

  updateProductionTrendChart(data: ProductionTrend[]): void {
    this.productionTrendChart = {
      labels: data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        label: 'Total Production',
        data: data.map(d => d.totalQuantity),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    };
    
    // Store production trend data for tooltip
    this.productionTrendData = data;
  }

  updateProductionStagesChart(data: ProductionStageCount): void {
    this.productionStagesChart = {
      labels: ['Sealing', 'Final Cutting', 'Folding', 'Packing'],
      datasets: [{
        label: 'Orders in Stage',
        data: [data.sealingCount, data.finalCuttingCount, data.foldingCount, data.packingCount],
        backgroundColor: ['#0891b2', '#0284c7', '#14b8a6', '#06b6d4'],
        borderColor:      ['#0e7490', '#0369a1', '#0d9488', '#0891b2'],
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false
      }]
    };
    setTimeout(() => this.applyVerticalGradient(this.stagesChartEl), 50);
  }

  updateTopProductsChart(): void {
    let data: TopProduct[] = [];
    let label = '';
    
    if (this.selectedChartView === 'value') {
      data = this.topProductsByValue;
      label = 'Stock Value (₹)';
      this.topProductsChart = {
        labels: data.map(p => p.productName),
        datasets: [{
          label: label,
          data: data.map(p => p.stockValue),
          backgroundColor: '#0891b2',
          borderColor: '#0e7490',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false
        }]
      };
    } else if (this.selectedChartView === 'boxes') {
      data = this.topProductsByQuantity;
      label = 'Stock Quantity (Boxes)';
      this.topProductsChart = {
        labels: data.map(p => p.productName),
        datasets: [{
          label: label,
          data: data.map(p => p.boxQuantity || 0),
          backgroundColor: '#14b8a6',
          borderColor: '#0d9488',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false
        }]
      };
    } else { // pads
      data = this.topProductsByQuantity;
      label = 'Stock Quantity (Pads)';
      this.topProductsChart = {
        labels: data.map(p => p.productName),
        datasets: [{
          label: label,
          data: data.map(p => p.stockQuantity),
          backgroundColor: '#0284c7',
          borderColor: '#0369a1',
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false
        }]
      };
    }

    // Force chart update
    this.topProductsChart = { ...this.topProductsChart };
    setTimeout(() => this.applyVerticalGradient(this.topProductsChartEl), 50);
  }

  onChartViewChange(): void {
    this.updateTopProductsChart();
  }

  // Navigation methods
  scrollToLowStockSection(): void {
    const element = document.getElementById('low-stock-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Add a highlight effect
      element.classList.add('highlight-section');
      setTimeout(() => element.classList.remove('highlight-section'), 2000);
    }
  }

  navigateToEditItem(item: LowStockItem): void {
    if (item.itemType === 'RAW_MATERIAL') {
      // Navigate to raw material stock page with query parameter to open edit dialog
      this.router.navigate(['/raw-material-stocks'], { 
        queryParams: { editStockId: item.itemId } 
      });
    } else if (item.itemType === 'BOX') {
      // Navigate to box stock page with query parameter to open edit dialog
      this.router.navigate(['/box-stocks'], { 
        queryParams: { editStockId: item.itemId } 
      });
    } else if (item.itemType === 'PRODUCT') {
      // Products don't have stock update - stock is from production only
      // Navigate to production page or show info message
      console.log('Product stock is managed through production, not direct updates');
    }
  }

  initializeSSE(): void {
    try {
      this.eventSource = this.dashboardService.createEventSource();

      this.eventSource.addEventListener('summary-update', (event: any) => {
        const data = JSON.parse(event.data);
        this.summary = data;
      });

      this.eventSource.addEventListener('stage-update', (event: any) => {
        const data = JSON.parse(event.data);
        this.productionStages = data;
        this.updateProductionStagesChart(data);
      });

      this.eventSource.addEventListener('low-stock-update', (event: any) => {
        const data = JSON.parse(event.data);
        this.lowStockItems = data;
      });

      this.eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        this.closeSSE();
      };

    } catch (error) {
      console.error('Error initializing SSE:', error);
    }
  }

  closeSSE(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = undefined;
    }
  }

  private applyVerticalGradient(chartRef: UIChart | undefined): void {
    if (!chartRef?.chart) return;
    const chart = chartRef.chart;
    const ctx = (chart.canvas as HTMLCanvasElement).getContext('2d');
    if (!ctx) return;
    const h = (chart.canvas as HTMLCanvasElement).offsetHeight || 300;
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, 'rgba(8,145,178,0.85)');
    gradient.addColorStop(1, 'rgba(8,145,178,0.35)');
    chart.data.datasets[0].backgroundColor = gradient;
    chart.update();
  }

  private applyHorizontalGradient(chartRef: UIChart | undefined): void {
    if (!chartRef?.chart) return;
    const chart = chartRef.chart;
    const ctx = (chart.canvas as HTMLCanvasElement).getContext('2d');
    if (!ctx) return;
    const w = (chart.canvas as HTMLCanvasElement).offsetWidth || 400;
    const gradient = ctx.createLinearGradient(w, 0, 0, 0);
    gradient.addColorStop(0, 'rgba(8,145,178,0.85)');
    gradient.addColorStop(1, 'rgba(8,145,178,0.35)');
    chart.data.datasets[0].backgroundColor = gradient;
    chart.update();
  }

  getSeverityClass(severity: string): string {
    const severityMap: { [key: string]: string } = {
      'CRITICAL': 'danger',  // Red for critical items
      'WARNING': 'warning',  // Orange/amber for warning
      'LOW': 'success'       // Green for low priority/safe
    };
    return severityMap[severity] || 'info';
  }

  getTypeColor(type: string): string {
    const typeColors: { [key: string]: string } = {
      'RAW_MATERIAL': 'info',
      'BOX': 'success',
      'PRODUCT': 'warning'
    };
    return typeColors[type] || 'info';
  }

  getTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'RAW_MATERIAL': 'Raw Material',
      'BOX': 'Box',
      'PRODUCT': 'Product'
    };
    return labels[type] || type;
  }

  getCategoryColor(category: string): string {
    return this.categoryColors[category] || this.categoryColors['OTHERS'];
  }

  getCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'PREMIUM': 'Premium',
      'ULTRA_THIN': 'Ultra Thin',
      'LINER': 'Liner',
      'OTHERS': 'Others'
    };
    return labels[category] || category;
  }

  getProductionDateTitle(): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(this.selectedProductionDate);
    selected.setHours(0, 0, 0, 0);
    
    if (today.getTime() === selected.getTime()) {
      return "Today's Production";
    } else {
      return `Production on ${selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
  }

  onProductionDateChange(): void {
    this.loadProductionByDate();
  }

  loadProductionByDate(): void {
    this.loadingProductionDaily = true;
    // Format date in local timezone to avoid UTC conversion issues
    const year = this.selectedProductionDate.getFullYear();
    const month = String(this.selectedProductionDate.getMonth() + 1).padStart(2, '0');
    const day = String(this.selectedProductionDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    this.dashboardService.getProductionDaily(dateStr)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingProductionDaily = false)
      )
      .subscribe({
        next: (data: ProductionDaily[]) => this.productionDaily = data,
        error: (err: any) => console.error('Error loading production by date:', err)
      });
  }

  // Priority 2: Material Consumption & Reorder Intelligence
  loadMaterialConsumption(): void {
    this.loadingMaterialConsumption = true;
    this.dashboardService.getMaterialConsumption()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingMaterialConsumption = false)
      )
      .subscribe({
        next: (data) => {
          this.materialConsumption = data;
          this.updateMaterialConsumptionChart(data);
          this.updateDaysOfSupplyChart(data);
        },
        error: (err) => console.error('Error loading material consumption:', err)
      });
  }

  loadReorderPoints(): void {
    this.loadingReorderPoints = true;
    this.dashboardService.getReorderPoints()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loadingReorderPoints = false)
      )
      .subscribe({
        next: (data) => {
          this.reorderPoints = data;
        },
        error: (err) => console.error('Error loading reorder points:', err)
      });
  }

  updateMaterialConsumptionChart(data: MaterialConsumption[]): void {
    const sortedData = [...data].sort((a, b) => b.weeklyConsumption - a.weeklyConsumption).slice(0, 6);
    
    this.materialConsumptionChart = {
      labels: sortedData.map(m => m.materialName),
      datasets: [{
        label: 'Weekly Consumption (kg)',
        data: sortedData.map(m => m.weeklyConsumption),
        backgroundColor: '#0891b2',
        borderColor: '#0e7490',
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false
      }]
    };
    setTimeout(() => this.applyHorizontalGradient(this.materialChartEl), 50);
  }

  updateDaysOfSupplyChart(data: MaterialConsumption[]): void {
    const sortedData = [...data].sort((a, b) => a.daysOfSupply - b.daysOfSupply);
    
    this.daysOfSupplyChart = {
      labels: sortedData.map(m => m.materialName),
      datasets: [{
        label: 'Days of Supply',
        data: sortedData.map(m => m.daysOfSupply),
        backgroundColor: sortedData.map(m => {
          if (m.status === 'CRITICAL') return '#ef4444';
          if (m.status === 'WARNING') return '#f59e0b';
          return '#10b981';
        }),
        borderColor: sortedData.map(m => {
          if (m.status === 'CRITICAL') return '#dc2626';
          if (m.status === 'WARNING') return '#d97706';
          return '#059669';
        }),
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false
      }]
    };
  }

  getConsumptionStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'CRITICAL': 'danger',
      'WARNING': 'warning',
      'HEALTHY': 'success'
    };
    return statusMap[status] || 'info';
  }

  getReorderStatusClass(shouldReorder: boolean): string {
    return shouldReorder ? 'danger' : 'success';
  }

  getDaysUntilStockout(item: LowStockItem): number {
    if (!item.dailyConsumption || item.dailyConsumption <= 0) return 999;
    return Math.floor(item.currentQuantity / item.dailyConsumption);
  }

  formatActionDate(item: LowStockItem): string {
    const days = this.getDaysUntilStockout(item);
    if (days >= 999) return 'N/A';
    
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  formatNumber(value: number): string {
    return new Intl.NumberFormat('en-IN').format(value);
  }
}
