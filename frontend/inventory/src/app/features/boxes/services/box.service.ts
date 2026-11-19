import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { BoxRequestDTO, BoxResponseDTO } from '../models/box.model';

@Injectable({
  providedIn: 'root'
})
export class BoxService {
  private readonly endpoint = 'boxes';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<BoxResponseDTO[]> {
    return this.apiService.get<BoxResponseDTO[]>(this.endpoint);
  }

  getById(id: number): Observable<BoxResponseDTO> {
    return this.apiService.get<BoxResponseDTO>(`${this.endpoint}/${id}`);
  }

  create(box: BoxRequestDTO): Observable<BoxResponseDTO> {
    return this.apiService.post<BoxResponseDTO>(this.endpoint, box);
  }

  update(id: number, box: BoxRequestDTO): Observable<BoxResponseDTO> {
    return this.apiService.put<BoxResponseDTO>(`${this.endpoint}/${id}`, box);
  }

  delete(id: number): Observable<string> {
    return this.apiService.deleteText(`${this.endpoint}/${id}`);
  }
}
