import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';
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
} from '../models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class InventoryDashboardService {
  private readonly endpoint = 'inventory-dashboard';

  constructor(private apiService: ApiService) {}

  getSummary(): Observable<DashboardSummary> {
    return this.apiService.get<DashboardSummary>(`${this.endpoint}/summary`);
  }

  getStockBreakdown(): Observable<StockBreakdown> {
    return this.apiService.get<StockBreakdown>(`${this.endpoint}/stock-breakdown`);
  }

  getProductionDaily(date?: string): Observable<ProductionDaily[]> {
    const params = date ? { date } : undefined;
    return this.apiService.get<ProductionDaily[]>(`${this.endpoint}/production-daily`, params);
  }

  getProductionStageCount(): Observable<ProductionStageCount> {
    return this.apiService.get<ProductionStageCount>(`${this.endpoint}/production-stages`);
  }

  getLowStockItems(): Observable<LowStockItem[]> {
    return this.apiService.get<LowStockItem[]>(`${this.endpoint}/low-stock-items`);
  }

  getProductionTrend(days: number = 7): Observable<ProductionTrend[]> {
    return this.apiService.get<ProductionTrend[]>(`${this.endpoint}/production-trend`, { days });
  }

  getTopProducts(limit: number = 10): Observable<TopProduct[]> {
    return this.apiService.get<TopProduct[]>(`${this.endpoint}/top-products`, { limit });
  }

  getTopProductsByQuantity(limit: number = 10): Observable<TopProduct[]> {
    return this.apiService.get<TopProduct[]>(`${this.endpoint}/top-products-by-quantity`, { limit });
  }

  // Priority 2: Material Consumption & Reorder Intelligence
  getMaterialConsumption(): Observable<MaterialConsumption[]> {
    return this.apiService.get<MaterialConsumption[]>(`${this.endpoint}/material-consumption`);
  }

  getReorderPoints(): Observable<ReorderPoint[]> {
    return this.apiService.get<ReorderPoint[]>(`${this.endpoint}/reorder-points`);
  }

  /**
   * Create SSE connection for real-time updates
   */
  createEventSource(): EventSource {
    const token = localStorage.getItem('auth_token');
    const url = `${environment.apiUrl}/inventory-dashboard/stream${token ? '?token=' + token : ''}`;
    
    return new EventSource(url);
  }
}
