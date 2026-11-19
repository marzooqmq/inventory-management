import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { ProductRequestDTO, ProductResponseDTO } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly endpoint = 'products';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<ProductResponseDTO[]> {
    return this.apiService.get<ProductResponseDTO[]>(this.endpoint);
  }

  getById(id: number): Observable<ProductResponseDTO> {
    return this.apiService.get<ProductResponseDTO>(`${this.endpoint}/${id}`);
  }

  create(product: ProductRequestDTO): Observable<ProductResponseDTO> {
    return this.apiService.post<ProductResponseDTO>(this.endpoint, product);
  }

  update(id: number, product: ProductRequestDTO): Observable<ProductResponseDTO> {
    return this.apiService.put<ProductResponseDTO>(`${this.endpoint}/${id}`, product);
  }

  delete(id: number): Observable<string> {
    return this.apiService.deleteText(`${this.endpoint}/${id}`);
  }
}
