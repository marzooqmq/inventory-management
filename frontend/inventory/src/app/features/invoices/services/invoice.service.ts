import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { InvoiceRequestDTO, InvoiceResponseDTO, InvoicePaymentDTO } from '../models/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly endpoint = 'invoices';

  constructor(private apiService: ApiService) {}

  getAll(): Observable<InvoiceResponseDTO[]> {
    return this.apiService.get<InvoiceResponseDTO[]>(this.endpoint);
  }

  getById(id: number): Observable<InvoiceResponseDTO> {
    return this.apiService.get<InvoiceResponseDTO>(`${this.endpoint}/${id}`);
  }

  create(invoice: InvoiceRequestDTO): Observable<InvoiceResponseDTO> {
    return this.apiService.post<InvoiceResponseDTO>(this.endpoint, invoice);
  }

  cancel(id: number): Observable<string> {
    return this.apiService.putText(`${this.endpoint}/cancel/${id}`, {});
  }

  addPayment(invoiceId: number, payment: InvoicePaymentDTO): Observable<string> {
    return this.apiService.putText(`${this.endpoint}/payment/${invoiceId}`, payment);
  }

  downloadPdf(id: number): Observable<Blob> {
    return this.apiService.getBlob(`${this.endpoint}/pdf/${id}`);
  }
}
