import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { FinishedGoodsStockResponseDTO } from '../models/finished-goods-stock.model';

@Injectable({
  providedIn: 'root'
})
export class FinishedGoodsStockService {
  private readonly endpoint = 'finished-stock';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<FinishedGoodsStockResponseDTO[]> {
    return this.apiService.get<FinishedGoodsStockResponseDTO[]>(this.endpoint);
  }

  getById(id: number): Observable<FinishedGoodsStockResponseDTO> {
    return this.apiService.get<FinishedGoodsStockResponseDTO>(`${this.endpoint}/${id}`);
  }
}
