import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ProductPriceRequestDTO, ProductPriceResponseDTO } from '../models/product-price.model';

@Injectable({
  providedIn: 'root'
})
export class ProductPriceService {
  private readonly endpoint = 'product-prices';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<ProductPriceResponseDTO[]> {
    return this.apiService.get<ProductPriceResponseDTO[]>(this.endpoint);
  }

  getById(id: number): Observable<ProductPriceResponseDTO> {
    return this.apiService.get<ProductPriceResponseDTO>(`${this.endpoint}/${id}`);
  }

  create(productPrice: ProductPriceRequestDTO): Observable<ProductPriceResponseDTO> {
    return this.apiService.post<ProductPriceResponseDTO>(this.endpoint, productPrice);
  }

  update(id: number, productPrice: ProductPriceRequestDTO): Observable<ProductPriceResponseDTO> {
    return this.apiService.put<ProductPriceResponseDTO>(`${this.endpoint}/${id}`, productPrice);
  }

  delete(id: number): Observable<string> {
    return this.apiService.deleteText(`${this.endpoint}/${id}`);
  }
}
