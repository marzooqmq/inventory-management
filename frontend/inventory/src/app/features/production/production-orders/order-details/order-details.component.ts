import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { TimelineModule } from 'primeng/timeline';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { ProductionOrderService } from '../../services/production-order.service';
import { ProductionExecutionService } from '../../services/production-execution.service';
import { MaterialUsageService } from '../../services/material-usage.service';
import { 
  ProductionOrder, 
  ProductionStage, 
  ProductionStageExecution,
  ProductionOrderStatus,
  RawMaterialUsage,
  StageProgress
} from '../../models/production-order.model';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    TagModule,
    ProgressBarModule,
    TimelineModule,
    TableModule,
    DialogModule,
    InputNumberModule,
    ConfirmDialogModule,
    ToastModule,
    PageHeaderComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent implements OnInit, OnDestroy {
  order: ProductionOrder | null = null;
  orderId: number | null = null;
  loading = false;
  
  // Expose enum to template
  ProductionStage = ProductionStage;
  
  // Stage tracking
  stageProgress: Map<ProductionStage, StageProgress> = new Map();
  stages = [
    ProductionStage.SEALING,
    ProductionStage.FINAL_CUTTING,
    ProductionStage.FOLDING,
    ProductionStage.PACKING
  ];
  
  // Material usage
  materialUsages: RawMaterialUsage[] = [];
  
  // Dialog states
  showStageDialog = false;
  showCancelDialog = false;
  selectedStage: ProductionStage | null = null;
  stageToCancel: ProductionStage | null = null;
  processQuantity: number | null = null;
  executingStage = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productionOrderService: ProductionOrderService,
    private executionService: ProductionExecutionService,
    private materialUsageService: MaterialUsageService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.orderId) {
      this.loadOrderDetails();
    }
  }

  ngOnDestroy(): void {
  }

  loadOrderDetails(): void {
    if (!this.orderId) return;
    
    this.loading = true;
    this.productionOrderService.getById(this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.initializeStageProgress();
        this.loadStageExecutions();
        this.loadMaterialUsages();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading order:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load production order details'
        });
        this.loading = false;
      }
    });
  }

  loadStageExecutions(): void {
    if (!this.orderId) return;
    
    this.executionService.getExecutionsByOrderId(this.orderId).subscribe({
      next: (executions) => {
        console.log('Loaded executions:', executions);
        this.updateStageProgressFromExecutions(executions);
      },
      error: (error) => {
        console.error('Error loading stage executions:', error);
      }
    });
  }

  updateStageProgressFromExecutions(executions: ProductionStageExecution[]): void {
    if (!this.order) return;

    console.log('Order:', this.order);
    console.log('Order Quantity:', this.order.quantity);

    // Group executions by stage
    const executionsByStage = new Map<ProductionStage, ProductionStageExecution[]>();
    executions.forEach(execution => {
      const stageExecutions = executionsByStage.get(execution.stage) || [];
      stageExecutions.push(execution);
      executionsByStage.set(execution.stage, stageExecutions);
    });

    // Update each stage's progress - must process in order
    this.stages.forEach((stage, index) => {
      const progress = this.stageProgress.get(stage);
      if (!progress) return;

      const stageExecutions = executionsByStage.get(stage) || [];
      progress.executions = stageExecutions;

      // Calculate PROCESSED (sum of all execution outputs for this stage)
      progress.outputQty = stageExecutions.reduce((sum, exec) => sum + exec.outputQty, 0);

      // Calculate INPUT QTY
      if (index === 0) {
        // SEALING stage - input is always order quantity
        progress.inputQty = this.order!.quantity;
      } else {
        // Other stages - input is previous stage's total output
        const prevStage = this.stages[index - 1];
        const prevProgress = this.stageProgress.get(prevStage);
        progress.inputQty = prevProgress ? prevProgress.outputQty : 0;
      }

      // Calculate REMAINING
      progress.balanceQty = progress.inputQty - progress.outputQty;

      // Update completion status
      progress.completed = progress.balanceQty === 0 && progress.outputQty > 0;
      progress.inProgress = progress.outputQty > 0 && progress.balanceQty > 0;

      console.log(`${stage}:`, {
        inputQty: progress.inputQty,
        outputQty: progress.outputQty,
        balanceQty: progress.balanceQty,
        executions: stageExecutions.length
      });
    });
  }

  initializeStageProgress(): void {
    this.stages.forEach(stage => {
      const progress: StageProgress = {
        stage,
        completed: false,
        inProgress: false,
        inputQty: 0,
        outputQty: 0,
        balanceQty: 0,
        executions: []
      };
      this.stageProgress.set(stage, progress);
    });
  }

  loadMaterialUsages(): void {
    this.materialUsageService.getAll().subscribe({
      next: (usages) => {
        this.materialUsages = usages.filter(u => u.productionOrderId === this.orderId);
      },
      error: (error) => {
        console.error('Error loading material usages:', error);
      }
    });
  }

  openStageDialog(stage: ProductionStage): void {
    this.selectedStage = stage;
    this.processQuantity = this.getMaxProcessQuantity(stage);
    this.showStageDialog = true;
  }

  getMaxProcessQuantity(stage: ProductionStage): number {
    const currentProgress = this.stageProgress.get(stage);
    if (!currentProgress) return 0;
    
    // Return the balance quantity available for this stage
    return currentProgress.balanceQty;
  }

  getPreviousStage(stage: ProductionStage): ProductionStage | null {
    const index = this.stages.indexOf(stage);
    return index > 0 ? this.stages[index - 1] : null;
  }

  executeStage(): void {
    if (!this.selectedStage || !this.orderId) return;
    
    this.executingStage = true;
    const request = {
      productionOrderId: this.orderId,
      stage: this.selectedStage,
      processQty: this.selectedStage !== ProductionStage.SEALING ? this.processQuantity || undefined : undefined
    };
    
    this.executionService.executeStage(request).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${this.getStageLabel(this.selectedStage!)} stage executed successfully`
        });
        this.showStageDialog = false;
        this.executingStage = false;
        this.loadOrderDetails();
      },
      error: (error) => {
        console.error('Error executing stage:', error);
        const errorMessage = error.error?.message || error.error || 'Failed to execute stage';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.executingStage = false;
      }
    });
  }

  cancelLastStage(stage: ProductionStage): void {
    if (!this.orderId) return;
    this.stageToCancel = stage;
    this.showCancelDialog = true;
  }

  confirmCancelStage(): void {
    if (!this.orderId || !this.stageToCancel) return;
    
    this.executionService.cancelStage(this.orderId, this.stageToCancel).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${this.getStageLabel(this.stageToCancel!)} stage cancelled successfully`
        });
        this.showCancelDialog = false;
        this.stageToCancel = null;
        this.loadOrderDetails();
      },
      error: (error) => {
        console.error('Error cancelling stage:', error);
        const errorMessage = error.error?.message || error.error || 'Failed to cancel stage';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage
        });
        this.showCancelDialog = false;
        this.stageToCancel = null;
      }
    });
  }

  getStageLabel(stage: ProductionStage | null): string {
    if (!stage) return '';
    return stage.replace(/_/g, ' ');
  }

  getStageIcon(stage: ProductionStage): string {
    const progress = this.stageProgress.get(stage);
    if (progress?.completed) return 'pi-check-circle';
    if (progress?.inProgress) return 'pi-spin pi-spinner';
    return 'pi-circle';
  }

  getStageColor(stage: ProductionStage): string {
    const progress = this.stageProgress.get(stage);
    if (progress?.completed) return 'success';
    if (progress?.inProgress) return 'info';
    return 'secondary';
  }

  canExecuteStage(stage: ProductionStage): boolean {
    if (!this.order || this.order.status === ProductionOrderStatus.COMPLETED || 
        this.order.status === ProductionOrderStatus.CANCELLED) {
      return false;
    }
    
    const currentProgress = this.stageProgress.get(stage);
    if (!currentProgress) return false;
    
    if (stage === ProductionStage.SEALING) {
      // Can execute SEALING if there's balance quantity
      return currentProgress.balanceQty > 0;
    }
    
    const previousStage = this.getPreviousStage(stage);
    const prevProgress = previousStage ? this.stageProgress.get(previousStage) : null;
    
    if (prevProgress && currentProgress) {
      // Can execute if previous stage has output and current stage has balance quantity
      return prevProgress.outputQty > 0 && currentProgress.balanceQty > 0;
    }
    
    return false;
  }

  canCancelStage(stage: ProductionStage): boolean {
    const progress = this.stageProgress.get(stage);
    if (!progress || progress.executions.length === 0) {
      return false;
    }
    
    // Check if any subsequent stages have executions
    const currentIndex = this.stages.indexOf(stage);
    for (let i = currentIndex + 1; i < this.stages.length; i++) {
      const nextStageProgress = this.stageProgress.get(this.stages[i]);
      if (nextStageProgress && nextStageProgress.executions.length > 0) {
        return false; // Cannot cancel if subsequent stages have executions
      }
    }
    
    return true;
  }

  getProgressPercentage(): number {
    if (!this.order) return 0;
    
    const completedStages = Array.from(this.stageProgress.values())
      .filter(p => p.completed).length;
    
    return (completedStages / this.stages.length) * 100;
  }

  getCompletedStagesCount(): number {
    return Array.from(this.stageProgress.values()).filter(p => p.completed).length;
  }

  isActiveOrder(): boolean {
    return this.order?.status !== ProductionOrderStatus.COMPLETED && 
           this.order?.status !== ProductionOrderStatus.CANCELLED;
  }

  getStatusSeverity(status?: ProductionOrderStatus): 'success' | 'info' | 'warning' | 'danger' | 'secondary' {
    switch (status) {
      case ProductionOrderStatus.COMPLETED: return 'success';
      case ProductionOrderStatus.CREATED: return 'secondary';
      case ProductionOrderStatus.CANCELLED: return 'danger';
      default: return 'info';
    }
  }

  getStatusLabel(status?: ProductionOrderStatus): string {
    if (!status) return 'Unknown';
    
    const statusStr = String(status).toUpperCase();
    switch (statusStr) {
      case 'CREATED': return 'Created';
      case 'SEALING_IN_PROGRESS': return 'Sealing';
      case 'FINAL_CUTTING_IN_PROGRESS': return 'Final Cutting';
      case 'FOLDING_IN_PROGRESS': return 'Folding';
      case 'PACKING_IN_PROGRESS': return 'Packing';
      case 'COMPLETED': return 'Completed';
      case 'CANCELLED': return 'Cancelled';
      default: return 'Created';
    }
  }

  getStatusClass(status?: ProductionOrderStatus): string {
    if (!status) return 'status-created';
    
    const statusStr = String(status).toUpperCase();
    switch (statusStr) {
      case 'CREATED': return 'status-created';
      case 'SEALING_IN_PROGRESS': return 'status-sealing';
      case 'FINAL_CUTTING_IN_PROGRESS': return 'status-cutting';
      case 'FOLDING_IN_PROGRESS': return 'status-folding';
      case 'PACKING_IN_PROGRESS': return 'status-packing';
      case 'COMPLETED': return 'status-completed';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-created';
    }
  }

  goBack(): void {
    this.router.navigate(['/production/orders']);
  }
}
