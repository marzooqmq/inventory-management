import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ProductionCostRequestDTO, ProductionCostResponseDTO } from '../models/production-cost.model';

@Injectable({
  providedIn: 'root'
})
export class ProductionCostService {
  private readonly endpoint = 'production-costs';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<ProductionCostResponseDTO[]> {
    return this.apiService.get<ProductionCostResponseDTO[]>(this.endpoint);
  }

  getById(id: number): Observable<ProductionCostResponseDTO> {
    return this.apiService.get<ProductionCostResponseDTO>(`${this.endpoint}/${id}`);
  }

  create(productionCost: ProductionCostRequestDTO): Observable<ProductionCostResponseDTO> {
    return this.apiService.post<ProductionCostResponseDTO>(this.endpoint, productionCost);
  }

  update(id: number, productionCost: ProductionCostRequestDTO): Observable<ProductionCostResponseDTO> {
    return this.apiService.put<ProductionCostResponseDTO>(`${this.endpoint}/${id}`, productionCost);
  }

  delete(id: number): Observable<string> {
    return this.apiService.deleteText(`${this.endpoint}/${id}`);
  }
}
