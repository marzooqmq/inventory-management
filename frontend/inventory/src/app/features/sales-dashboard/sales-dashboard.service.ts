import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { SalesDashboardDTO } from './models/sales-dashboard.model';

@Injectable({ providedIn: 'root' })
export class SalesDashboardService {
  private readonly endpoint = 'sales-dashboard';

  constructor(private api: ApiService) {}

  getDashboard(): Observable<SalesDashboardDTO> {
    return this.api.get<SalesDashboardDTO>(this.endpoint);
  }
}
