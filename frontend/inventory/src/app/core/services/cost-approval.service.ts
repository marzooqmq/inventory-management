import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription, Observable } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProductResponseDTO } from '../../features/products/models/product.model';
import { environment } from '../../../environments/environment';
import { NotificationService } from './notification.service';
import { NotificationType } from '../../shared/models/notification.model';

/**
 * Cost Approval Service
 * Polls backend for products with pending cost approvals
 * Creates notifications in the generic notification system
 */
@Injectable({
  providedIn: 'root'
})
export class CostApprovalService implements OnDestroy {
  private readonly POLLING_INTERVAL = 30000; // 30 seconds
  private readonly API_URL = `${environment.apiUrl}/products`;
  private readonly APPROVAL_API_URL = `${environment.apiUrl}/product-costs`;
  
  private pollingSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  /**
   * Start polling for cost approvals
   */
  startPolling(): void {
    if (this.pollingSubscription) {
      return;
    }

    // Initial check
    this.checkForPendingApprovals();

    // Poll every 30 seconds
    this.pollingSubscription = interval(this.POLLING_INTERVAL)
      .pipe(
        switchMap(() => this.http.get<ProductResponseDTO[]>(this.API_URL)),
        catchError(error => {
          console.error('Error polling for cost approvals:', error);
          return of([]);
        })
      )
      .subscribe(products => {
        this.updateNotifications(products);
      });
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  /**
   * Check for pending approvals (one-time)
   */
  private checkForPendingApprovals(): void {
    this.http.get<ProductResponseDTO[]>(this.API_URL)
      .pipe(
        catchError(error => {
          console.error('Error fetching products:', error);
          return of([]);
        })
      )
      .subscribe(products => {
        this.updateNotifications(products);
      });
  }

  /**
   * Update notifications based on products with costDirty=true
   */
  private updateNotifications(products: ProductResponseDTO[]): void {
    const pendingProducts = products.filter(p => p.costDirty);
    
    if (pendingProducts.length > 0) {
      // Remove old cost approval notifications
      const existing = this.notificationService.getNotificationsByType(NotificationType.COST_APPROVAL);
      existing.forEach(n => this.notificationService.removeNotification(n.id));

      // Add new notification
      this.notificationService.addNotification({
        id: `cost-approval-${Date.now()}`,
        type: NotificationType.COST_APPROVAL,
        title: 'Cost Price Approval Required',
        message: `${pendingProducts.length} product${pendingProducts.length > 1 ? 's' : ''} need${pendingProducts.length === 1 ? 's' : ''} cost approval`,
        count: pendingProducts.length,
        timestamp: new Date(),
        read: false,
        actionUrl: '/cost-approvals',
        data: pendingProducts
      });
    }
  }

  /**
   * Approve cost change
   */
  approveCostChange(productId: number, effectiveDate: string, newCostPrice?: number): Observable<any> {
    return this.http.post(`${this.APPROVAL_API_URL}/approve`, {
      productId,
      effectiveDate,
      costPerBox: newCostPrice
    });
  }

  /**
   * Get cost history
   */
  getCostHistory(productId: number): Observable<any> {
    return this.http.get(`${this.APPROVAL_API_URL}/history/${productId}`);
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
