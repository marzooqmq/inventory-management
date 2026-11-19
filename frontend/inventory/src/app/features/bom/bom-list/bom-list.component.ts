import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map, startWith, BehaviorSubject } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { BOMResponseDTO } from '../models/bom.model';
import { selectAllBOMs, selectBOMsLoading } from '../store/bom.selectors';
import * as BOMActions from '../store/bom.actions';

interface GroupedBOM {
  productId: number;
  productName: string;
  materials: BOMResponseDTO[];
  expanded: boolean;
}

@Component({
  selector: 'app-bom-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TooltipModule,
    PageHeaderComponent,
    ConfirmDialogComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './bom-list.component.html',
  styleUrl: './bom-list.component.css',
  animations: [
    trigger('slideDown', [
      state('collapsed', style({
        height: '0',
        overflow: 'hidden',
        opacity: '0'
      })),
      state('expanded', style({
        height: '*',
        overflow: 'visible',
        opacity: '1'
      })),
      transition('collapsed <=> expanded', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ])
  ]
})
export class BOMListComponent implements OnInit {
  boms$: Observable<BOMResponseDTO[]>;
  groupedBOMs$: Observable<GroupedBOM[]>;
  loading$: Observable<boolean>;
  searchControl = new FormControl('');
  expandedState: Map<number, boolean> = new Map();
  allExpanded = false;
  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  constructor(
    private store: Store,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {
    this.boms$ = this.store.select(selectAllBOMs);
    this.loading$ = this.store.select(selectBOMsLoading);

    this.groupedBOMs$ = combineLatest([
      this.boms$,
      this.searchControl.valueChanges.pipe(startWith('')),
      this.refreshTrigger$
    ]).pipe(
      map(([boms, searchTerm]) => {
        let filteredBoms = boms;
        const hasSearchTerm = !!searchTerm && searchTerm.trim() !== '';
        
        if (hasSearchTerm) {
          const term = searchTerm.toLowerCase();
          filteredBoms = boms.filter(bom =>
            bom.productName.toLowerCase().includes(term) ||
            bom.materialName.toLowerCase().includes(term)
          );
        }

        // Group by product
        const grouped = filteredBoms.reduce((acc, bom) => {
          const existing = acc.find(g => g.productId === bom.productId);
          if (existing) {
            existing.materials.push(bom);
          } else {
            // Auto-expand if searching or check stored state
            const expanded = hasSearchTerm || this.getExpandedState(bom.productId);
            acc.push({
              productId: bom.productId,
              productName: bom.productName,
              materials: [bom],
              expanded
            });
          }
          return acc;
        }, [] as GroupedBOM[]);

        return grouped;
      })
    );
  }

  ngOnInit(): void {
    this.store.dispatch(BOMActions.loadBOMs());
    this.loadExpandedState();
  }

  toggleGroup(group: GroupedBOM): void {
    group.expanded = !group.expanded;
    this.saveExpandedState(group.productId, group.expanded);
  }

  toggleAll(): void {
    this.allExpanded = !this.allExpanded;
    // Update all product states in the map
    this.boms$.pipe(
      map(boms => {
        const productIds = new Set(boms.map(bom => bom.productId));
        productIds.forEach(productId => {
          this.saveExpandedState(productId, this.allExpanded);
        });
      })
    ).subscribe(() => {
      // Trigger re-computation of grouped BOMs
      this.refreshTrigger$.next();
    }).unsubscribe();
  }

  trackByProductId(index: number, group: GroupedBOM): number {
    return group.productId;
  }

  trackByBomId(index: number, bom: BOMResponseDTO): number {
    return bom.id;
  }

  private getExpandedState(productId: number): boolean {
    return this.expandedState.get(productId) ?? false;
  }

  private saveExpandedState(productId: number, expanded: boolean): void {
    this.expandedState.set(productId, expanded);
    try {
      const stateObj: { [key: number]: boolean } = {};
      this.expandedState.forEach((value, key) => {
        stateObj[key] = value;
      });
      localStorage.setItem('bom-expanded-state', JSON.stringify(stateObj));
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }

  private loadExpandedState(): void {
    try {
      const saved = localStorage.getItem('bom-expanded-state');
      if (saved) {
        const stateObj = JSON.parse(saved);
        Object.keys(stateObj).forEach(key => {
          this.expandedState.set(Number(key), stateObj[key]);
        });
      }
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }

  onAddBOM(): void {
    this.router.navigate(['/bom/new']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/bom/edit', id]);
  }

  onDelete(bom: BOMResponseDTO): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete BOM for "${bom.productName}" - "${bom.materialName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(BOMActions.deleteBOM({ id: bom.id }));
      }
    });
  }
}
