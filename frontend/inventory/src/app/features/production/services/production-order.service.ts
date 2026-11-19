import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProductionOrder, ProductionOrderRequest } from '../models/production-order.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductionOrderService {
  private apiUrl = `${environment.apiUrl}/production-orders`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ProductionOrder[]> {
    return this.http.get<ProductionOrder[]>(this.apiUrl);
  }

  getById(id: number): Observable<ProductionOrder> {
    return this.http.get<ProductionOrder>(`${this.apiUrl}/${id}`);
  }

  create(request: ProductionOrderRequest): Observable<ProductionOrder> {
    return this.http.post<ProductionOrder>(this.apiUrl, request);
  }

  update(id: number, request: ProductionOrderRequest): Observable<ProductionOrder> {
    return this.http.put<ProductionOrder>(`${this.apiUrl}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
