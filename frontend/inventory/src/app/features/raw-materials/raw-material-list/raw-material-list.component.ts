import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map, startWith } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { RawMaterialResponseDTO } from '../models/raw-material.model';
import { selectAllRawMaterials, selectRawMaterialsLoading } from '../store/raw-material.selectors';
import * as RawMaterialActions from '../store/raw-material.actions';

@Component({
  selector: 'app-raw-material-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TooltipModule,
    PageHeaderComponent,
    ConfirmDialogComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './raw-material-list.component.html',
  styleUrl: './raw-material-list.component.css'
})
export class RawMaterialListComponent implements OnInit {
  rawMaterials$: Observable<RawMaterialResponseDTO[]>;
  filteredRawMaterials$: Observable<RawMaterialResponseDTO[]>;
  loading$: Observable<boolean>;
  searchControl = new FormControl('');

  constructor(
    private store: Store,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {
    this.rawMaterials$ = this.store.select(selectAllRawMaterials);
    this.loading$ = this.store.select(selectRawMaterialsLoading);

    this.filteredRawMaterials$ = combineLatest([
      this.rawMaterials$,
      this.searchControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([rawMaterials, searchTerm]) => {
        if (!searchTerm) {
          return rawMaterials;
        }
        const term = searchTerm.toLowerCase();
        return rawMaterials.filter(rm =>
          rm.name.toLowerCase().includes(term) ||
          rm.purchaseUnit.toLowerCase().includes(term) ||
          rm.consumptionUnit.toLowerCase().includes(term)
        );
      })
    );
  }

  ngOnInit(): void {
    this.store.dispatch(RawMaterialActions.loadRawMaterials());
  }

  onAddRawMaterial(): void {
    this.router.navigate(['/raw-materials/new']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/raw-materials/edit', id]);
  }

  onDelete(rawMaterial: RawMaterialResponseDTO): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${rawMaterial.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(RawMaterialActions.deleteRawMaterial({ id: rawMaterial.id }));
      }
    });
  }
}
