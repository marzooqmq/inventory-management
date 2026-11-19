import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MaterialStockRequestDTO, MaterialStockResponseDTO } from '../models/material-stock.model';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class MaterialStockService {
  private readonly endpoint = 'raw-material-stocks';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<MaterialStockResponseDTO[]> {
    return this.apiService.get<MaterialStockResponseDTO[]>(this.endpoint);
  }

  getById(id: number): Observable<MaterialStockResponseDTO> {
    return this.apiService.get<MaterialStockResponseDTO>(`${this.endpoint}/${id}`);
  }

  create(request: MaterialStockRequestDTO): Observable<MaterialStockResponseDTO> {
    return this.apiService.post<MaterialStockResponseDTO>(this.endpoint, request);
  }

  update(id: number, request: MaterialStockRequestDTO): Observable<MaterialStockResponseDTO> {
    return this.apiService.put<MaterialStockResponseDTO>(`${this.endpoint}/${id}`, request);
  }

  delete(id: number): Observable<string> {
    return this.apiService.delete<string>(`${this.endpoint}/${id}`);
  }
}
