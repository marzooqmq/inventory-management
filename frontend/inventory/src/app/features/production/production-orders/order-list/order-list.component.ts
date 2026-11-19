import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ProductionOrderService } from '../../services/production-order.service';
import { ProductionOrder, ProductionOrderStatus } from '../../models/production-order.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    DropdownModule,
    ConfirmDialogModule,
    ToastModule,
    PageHeaderComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {
  orders: ProductionOrder[] = [];
  filteredOrders: ProductionOrder[] = [];
  loading = false;
  
  statusOptions = [
    { label: 'All Status', value: null },
    { label: 'Created', value: ProductionOrderStatus.CREATED },
    { label: 'Sealing', value: ProductionOrderStatus.SEALING_IN_PROGRESS },
    { label: 'Final Cutting', value: ProductionOrderStatus.FINAL_CUTTING_IN_PROGRESS },
    { label: 'Folding', value: ProductionOrderStatus.FOLDING_IN_PROGRESS },
    { label: 'Packing', value: ProductionOrderStatus.PACKING_IN_PROGRESS },
    { label: 'Completed', value: ProductionOrderStatus.COMPLETED },
    { label: 'Cancelled', value: ProductionOrderStatus.CANCELLED }
  ];
  
  selectedStatus: ProductionOrderStatus | null = null;

  constructor(
    private productionOrderService: ProductionOrderService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.productionOrderService.getAll().subscribe({
      next: (data) => {
        this.orders = data;
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load production orders'
        });
        this.loading = false;
      }
    });
  }

  applyFilter(): void {
    if (this.selectedStatus) {
      this.filteredOrders = this.orders.filter(order => order.status === this.selectedStatus);
    } else {
      this.filteredOrders = [...this.orders];
    }
  }

  onFilterChange(): void {
    this.applyFilter();
  }

  navigateToNew(): void {
    this.router.navigate(['/production/orders/new']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/production/orders/edit', id]);
  }

  navigateToDetails(id: number): void {
    this.router.navigate(['/production/orders', id]);
  }

  startProduction(order: ProductionOrder): void {
    this.router.navigate(['/production/orders', order.id]);
  }

  deleteOrder(order: ProductionOrder): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete production order for ${order.productName}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.productionOrderService.delete(order.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Production order deleted successfully'
            });
            this.loadOrders();
          },
          error: (error) => {
            console.error('Error deleting order:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete production order'
            });
          }
        });
      }
    });
  }

  getStatusSeverity(status?: ProductionOrderStatus): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (status) {
      case ProductionOrderStatus.COMPLETED:
        return 'success';
      case ProductionOrderStatus.CREATED:
        return 'secondary';
      case ProductionOrderStatus.SEALING_IN_PROGRESS:
      case ProductionOrderStatus.FINAL_CUTTING_IN_PROGRESS:
      case ProductionOrderStatus.FOLDING_IN_PROGRESS:
      case ProductionOrderStatus.PACKING_IN_PROGRESS:
        return 'info';
      case ProductionOrderStatus.CANCELLED:
        return 'danger';
      default:
        return 'secondary';
    }
  }

  getStatusLabel(status?: ProductionOrderStatus): string {
    console.log('Getting label for status:', status);
    if (!status) return 'Created';
    
    // Handle string status values from backend
    const statusStr = String(status).toUpperCase();
    
    switch (statusStr) {
      case 'CREATED':
        return 'Created';
      case 'SEALING_IN_PROGRESS':
        return 'Sealing';
      case 'FINAL_CUTTING_IN_PROGRESS':
        return 'Final Cutting';
      case 'FOLDING_IN_PROGRESS':
        return 'Folding';
      case 'PACKING_IN_PROGRESS':
        return 'Packing';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        console.warn('Unknown status:', status);
        return 'Created';
    }
  }

  getStatusClass(status?: ProductionOrderStatus): string {
    if (!status) return 'status-created';
    
    // Handle string status values from backend
    const statusStr = String(status).toUpperCase();
    
    switch (statusStr) {
      case 'CREATED':
        return 'status-created';
      case 'SEALING_IN_PROGRESS':
        return 'status-sealing';
      case 'FINAL_CUTTING_IN_PROGRESS':
        return 'status-cutting';
      case 'FOLDING_IN_PROGRESS':
        return 'status-folding';
      case 'PACKING_IN_PROGRESS':
        return 'status-packing';
      case 'COMPLETED':
        return 'status-completed';
      case 'CANCELLED':
        return 'status-cancelled';
      default:
        return 'status-created';
    }
  }

  canEdit(order: ProductionOrder): boolean {
    return order.status === ProductionOrderStatus.CREATED;
  }

  canDelete(order: ProductionOrder): boolean {
    return order.status === ProductionOrderStatus.CREATED;
  }

  canStartProduction(order: ProductionOrder): boolean {
    return order.status === ProductionOrderStatus.CREATED;
  }

  canTrack(order: ProductionOrder): boolean {
    return order.status !== ProductionOrderStatus.CREATED && 
           order.status !== ProductionOrderStatus.CANCELLED;
  }
}
