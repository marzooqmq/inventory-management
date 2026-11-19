import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CustomerRequestDTO, CustomerResponseDTO } from '../models/customer.model';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly endpoint = 'customers';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<CustomerResponseDTO[]> {
    return this.apiService.get<CustomerResponseDTO[]>(this.endpoint);
  }

  getById(id: number): Observable<CustomerResponseDTO> {
    return this.apiService.get<CustomerResponseDTO>(`${this.endpoint}/${id}`);
  }

  search(query: string): Observable<CustomerResponseDTO[]> {
    return this.apiService.get<CustomerResponseDTO[]>(`${this.endpoint}/search`, { query });
  }

  create(customer: CustomerRequestDTO): Observable<CustomerResponseDTO> {
    return this.apiService.post<CustomerResponseDTO>(this.endpoint, customer);
  }

  update(id: number, customer: CustomerRequestDTO): Observable<CustomerResponseDTO> {
    return this.apiService.put<CustomerResponseDTO>(`${this.endpoint}/${id}`, customer);
  }

  delete(id: number): Observable<string> {
    return this.apiService.deleteText(`${this.endpoint}/${id}`);
  }
}
