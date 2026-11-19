import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { BOMRequestDTO, BOMResponseDTO } from '../models/bom.model';

@Injectable({
  providedIn: 'root'
})
export class BOMService {
  private endpoint = 'bom';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<BOMResponseDTO[]> {
    return this.apiService.get<BOMResponseDTO[]>(this.endpoint);
  }

  getById(id: number): Observable<BOMResponseDTO> {
    return this.apiService.get<BOMResponseDTO>(`${this.endpoint}/${id}`);
  }

  create(bom: BOMRequestDTO): Observable<BOMResponseDTO> {
    return this.apiService.post<BOMResponseDTO>(this.endpoint, bom);
  }

  createAll(boms: BOMRequestDTO[]): Observable<BOMResponseDTO[]> {
    return this.apiService.post<BOMResponseDTO[]>(`${this.endpoint}/list`, boms);
  }

  update(id: number, bom: BOMResponseDTO): Observable<BOMResponseDTO> {
    return this.apiService.put<BOMResponseDTO>(`${this.endpoint}/${id}`, bom);
  }

  delete(id: number): Observable<string> {
    return this.apiService.deleteText(`${this.endpoint}/${id}`);
  }
}
