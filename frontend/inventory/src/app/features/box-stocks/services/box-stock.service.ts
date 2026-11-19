import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { BoxStockRequestDTO, BoxStockResponseDTO } from '../models/box-stock.model';

@Injectable({ providedIn: 'root' })
export class BoxStockService {
  private endpoint = 'box-stocks';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<BoxStockResponseDTO[]> {
    return this.apiService.get(this.endpoint);
  }

  getById(id: number): Observable<BoxStockResponseDTO> {
    return this.apiService.get(`${this.endpoint}/${id}`);
  }

  create(boxStock: BoxStockRequestDTO): Observable<BoxStockResponseDTO> {
    return this.apiService.post(this.endpoint, boxStock);
  }

  update(id: number, boxStock: BoxStockRequestDTO): Observable<BoxStockResponseDTO> {
    return this.apiService.put(`${this.endpoint}/${id}`, boxStock);
  }

  delete(id: number): Observable<string> {
    return this.apiService.deleteText(`${this.endpoint}/${id}`);
  }
}