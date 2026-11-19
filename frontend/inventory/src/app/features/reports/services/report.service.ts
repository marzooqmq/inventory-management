import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiService } from '../../../core/services/api.service';
import { environment } from '../../../../environments/environment';
import {
  SalesReportFilter,
  SalesReportResponse,
  CostProfitReportResponse,
  SalesProfitReportResponse,
  ProductionExecutionReportResponse,
  StageProgressResponse,
  ProductionOutputReportResponse,
  ProductionVsSalesResponse,
  ProductionVsSalesMonthlyResponse,
  FinishedGoodsReportResponse,
} from '../models/report.models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly baseUrl = environment.apiUrl;

  constructor(private api: ApiService, private http: HttpClient) {}

  // ── Sales Report  (GET /sales-reports) ───────────────────────────────────
  getSalesReport(filter: SalesReportFilter): Observable<SalesReportResponse> {
    const params: any = { page: filter.page, size: filter.size };
    if (filter.startDate)     params['startDate']     = filter.startDate;
    if (filter.endDate)       params['endDate']       = filter.endDate;
    if (filter.month)         params['month']         = filter.month;
    if (filter.year)          params['year']          = filter.year;
    if (filter.invoiceNumber) params['invoiceNumber'] = filter.invoiceNumber;
    if (filter.customerId)    params['customerId']    = filter.customerId;
    if (filter.productId)     params['productId']     = filter.productId;
    if (filter.paymentStatus) params['paymentStatus'] = filter.paymentStatus;
    return this.api.get<SalesReportResponse>('sales-reports', params);
  }

  getSalesReportPdfUrl(filter: SalesReportFilter): string {
    const p = new URLSearchParams();
    if (filter.startDate)     p.set('startDate',     filter.startDate);
    if (filter.endDate)       p.set('endDate',       filter.endDate);
    if (filter.month)         p.set('month',         String(filter.month));
    if (filter.year)          p.set('year',          String(filter.year));
    if (filter.invoiceNumber) p.set('invoiceNumber', filter.invoiceNumber);
    if (filter.customerId)    p.set('customerId',    String(filter.customerId));
    if (filter.productId)     p.set('productId',     String(filter.productId));
    if (filter.paymentStatus) p.set('paymentStatus', filter.paymentStatus);
    return `${this.baseUrl}/sales-reports/pdf?${p.toString()}`;
  }

  downloadSalesReportPdf(filter: SalesReportFilter): Observable<Blob> {
    let params = new HttpParams();
    if (filter.startDate)    params = params.set('startDate', filter.startDate);
    if (filter.endDate)      params = params.set('endDate', filter.endDate);
    if (filter.month)        params = params.set('month', String(filter.month));
    if (filter.year)         params = params.set('year', String(filter.year));
    if (filter.invoiceNumber) params = params.set('invoiceNumber', filter.invoiceNumber);
    if (filter.customerId)   params = params.set('customerId', String(filter.customerId));
    if (filter.productId)    params = params.set('productId', String(filter.productId));
    if (filter.paymentStatus) params = params.set('paymentStatus', filter.paymentStatus);
    return this.http.get(`${this.baseUrl}/sales-reports/pdf`, { params, responseType: 'blob' });
  }

  // ── Cost & Profit Report  (GET /profit-reports/cost) ─────────────────────
  getCostProfitReport(startDate: string, endDate: string, productId?: number): Observable<CostProfitReportResponse> {
    const params: any = { startDate, endDate };
    if (productId) params['productId'] = productId;
    return this.api.get<CostProfitReportResponse>('profit-reports/cost', params);
  }

  // ── Sales Profit Report  (GET /profit-reports/sales) ─────────────────────
  getSalesProfitReport(startDate: string, endDate: string, productId?: number): Observable<SalesProfitReportResponse> {
    const params: any = { startDate, endDate };
    if (productId) params['productId'] = productId;
    return this.api.get<SalesProfitReportResponse>('profit-reports/sales', params);
  }

  // ── Production Execution  (GET /production-reports/execution) ────────────
  getProductionExecutionReport(
    startDate?: string, endDate?: string, month?: number, year?: number, page = 0, size = 20
  ): Observable<ProductionExecutionReportResponse> {
    const params: any = { page, size };
    if (startDate) params['startDate'] = startDate;
    if (endDate)   params['endDate']   = endDate;
    if (month)     params['month']     = month;
    if (year)      params['year']      = year;
    return this.api.get<ProductionExecutionReportResponse>('production-reports/execution', params);
  }

  // ── Stage Progress  (GET /production-reports/stage-progress) ─────────────
  getStageProgressReport(
    startDate?: string, endDate?: string, page = 0, size = 20
  ): Observable<StageProgressResponse> {
    const params: any = { page, size };
    if (startDate) params['startDate'] = startDate;
    if (endDate)   params['endDate']   = endDate;
    return this.api.get<StageProgressResponse>('production-reports/stage-progress', params);
  }

  // ── Production Output  (GET /production-reports/output) ──────────────────
  getProductionOutputReport(
    startDate: string, endDate: string, productId?: number, page = 0, size = 20
  ): Observable<ProductionOutputReportResponse> {
    const params: any = { startDate, endDate, page, size };
    if (productId) params['productId'] = productId;
    return this.api.get<ProductionOutputReportResponse>('production-reports/output', params);
  }

  // ── Production vs Sales Summary  (GET /production-vs-sales) ──────────────
  getProductionVsSalesReport(startDate: string, endDate: string, productId?: number): Observable<ProductionVsSalesResponse> {
    const params: any = { startDate, endDate };
    if (productId) params['productId'] = productId;
    return this.api.get<ProductionVsSalesResponse>('production-vs-sales', params);
  }

  // ── Production vs Sales Monthly  (GET /production-vs-sales/monthly) ──────
  getProductionVsSalesMonthly(startDate: string, endDate: string, productId?: number): Observable<ProductionVsSalesMonthlyResponse> {
    const params: any = { startDate, endDate };
    if (productId) params['productId'] = productId;
    return this.api.get<ProductionVsSalesMonthlyResponse>('production-vs-sales/monthly', params);
  }

  // ── Finished Goods Stock Report  (GET /finished-stock/report) ────────────
  getFinishedGoodsReport(
    startDate?: string, endDate?: string, productId?: number, page = 0, size = 20
  ): Observable<FinishedGoodsReportResponse> {
    const params: any = { page, size };
    if (startDate) params['startDate'] = startDate;
    if (endDate)   params['endDate']   = endDate;
    if (productId) params['productId'] = productId;
    return this.api.get<FinishedGoodsReportResponse>('finished-stock/report', params);
  }

}
