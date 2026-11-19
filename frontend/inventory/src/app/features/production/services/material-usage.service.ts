import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RawMaterialUsage } from '../models/production-order.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MaterialUsageService {
  private apiUrl = `${environment.apiUrl}/raw-material-usage`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<RawMaterialUsage[]> {
    return this.http.get<RawMaterialUsage[]>(this.apiUrl);
  }

  getById(id: number): Observable<RawMaterialUsage> {
    return this.http.get<RawMaterialUsage>(`${this.apiUrl}/${id}`);
  }
}
