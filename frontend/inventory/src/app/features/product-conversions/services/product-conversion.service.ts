import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ProductConversionRequestDTO, ProductConversionResponseDTO } from '../models/product-conversion.model';

@Injectable({
  providedIn: 'root'
})
export class ProductConversionService {
  private readonly endpoint = 'product-conversions';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<ProductConversionResponseDTO[]> {
    return this.apiService.get<ProductConversionResponseDTO[]>(this.endpoint);
  }

  getById(id: number): Observable<ProductConversionResponseDTO> {
    return this.apiService.get<ProductConversionResponseDTO>(`${this.endpoint}/${id}`);
  }

  create(productConversion: ProductConversionRequestDTO): Observable<ProductConversionResponseDTO> {
    return this.apiService.post<ProductConversionResponseDTO>(this.endpoint, productConversion);
  }

  update(id: number, productConversion: ProductConversionRequestDTO): Observable<ProductConversionResponseDTO> {
    return this.apiService.put<ProductConversionResponseDTO>(`${this.endpoint}/${id}`, productConversion);
  }

  delete(id: number): Observable<string> {
    return this.apiService.deleteText(`${this.endpoint}/${id}`);
  }
}
