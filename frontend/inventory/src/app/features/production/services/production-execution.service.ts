import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Production, 
  ProductionStageExecution, 
  ProductionStageRequest,
  ProductionStage 
} from '../models/production-order.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductionExecutionService {
  private apiUrl = `${environment.apiUrl}/production-executions`;
  private productionUrl = `${environment.apiUrl}/productions`;

  constructor(private http: HttpClient) {}

  executeStage(request: ProductionStageRequest): Observable<ProductionStageExecution> {
    return this.http.post<ProductionStageExecution>(this.apiUrl, request);
  }

  cancelStage(productionOrderId: number, stage: ProductionStage): Observable<string> {
    const params = new HttpParams()
      .set('productionOrderId', productionOrderId.toString())
      .set('stage', stage);
    
    return this.http.post<string>(`${this.apiUrl}/cancel`, null, { params, responseType: 'text' as 'json' });
  }

  getExecutionsByOrderId(productionOrderId: number): Observable<ProductionStageExecution[]> {
    return this.http.get<ProductionStageExecution[]>(`${this.apiUrl}/order/${productionOrderId}`);
  }

  getAllProductions(): Observable<Production[]> {
    return this.http.get<Production[]>(this.productionUrl);
  }

  getProductionById(id: number): Observable<Production> {
    return this.http.get<Production>(`${this.productionUrl}/${id}`);
  }
}
