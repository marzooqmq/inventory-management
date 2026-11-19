import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { RawMaterialRequestDTO, RawMaterialResponseDTO } from '../models/raw-material.model';

@Injectable({
  providedIn: 'root'
})
export class RawMaterialService {
  private endpoint = 'raw-materials';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<RawMaterialResponseDTO[]> {
    return this.apiService.get<RawMaterialResponseDTO[]>(this.endpoint);
  }

  getById(id: number): Observable<RawMaterialResponseDTO> {
    return this.apiService.get<RawMaterialResponseDTO>(`${this.endpoint}/${id}`);
  }

  create(rawMaterial: RawMaterialRequestDTO): Observable<RawMaterialResponseDTO> {
    return this.apiService.post<RawMaterialResponseDTO>(this.endpoint, rawMaterial);
  }

  update(id: number, rawMaterial: RawMaterialRequestDTO): Observable<RawMaterialResponseDTO> {
    return this.apiService.put<RawMaterialResponseDTO>(`${this.endpoint}/${id}`, rawMaterial);
  }

  delete(id: number): Observable<string> {
    return this.apiService.deleteText(`${this.endpoint}/${id}`);
  }
}
