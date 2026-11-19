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
import { BoxResponseDTO } from '../models/box.model';
import { selectAllBoxes, selectBoxesLoading } from '../store/box.selectors';
import * as BoxActions from '../store/box.actions';

@Component({
  selector: 'app-box-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TooltipModule,
    PageHeaderComponent,
    ConfirmDialogComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './box-list.component.html',
  styleUrl: './box-list.component.css'
})
export class BoxListComponent implements OnInit {
  boxes$: Observable<BoxResponseDTO[]>;
  filteredBoxes$: Observable<BoxResponseDTO[]>;
  loading$: Observable<boolean>;
  searchControl = new FormControl('');

  constructor(
    private store: Store,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {
    this.boxes$ = this.store.select(selectAllBoxes);
    this.loading$ = this.store.select(selectBoxesLoading);

    this.filteredBoxes$ = combineLatest([
      this.boxes$,
      this.searchControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([boxes, searchTerm]) => {
        if (!searchTerm) {
          return boxes;
        }
        const term = searchTerm.toLowerCase();
        return boxes.filter(box =>
          box.productName.toLowerCase().includes(term)
        );
      })
    );
  }

  ngOnInit(): void {
    this.store.dispatch(BoxActions.loadBoxes());
  }

  onAddBox(): void {
    this.router.navigate(['/boxes/new']);
  }

  onEdit(id: number): void {
    this.router.navigate(['/boxes/edit', id]);
  }

  onDelete(box: BoxResponseDTO): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete box for "${box.productName}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(BoxActions.deleteBox({ id: box.id }));
      }
    });
  }
}
