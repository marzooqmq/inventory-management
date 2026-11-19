import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule],
  template: `
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <i *ngIf="icon" [class]="'pi pi-' + icon"></i>
            {{ title }}
          </h1>
          <p *ngIf="subtitle" class="page-subtitle">{{ subtitle }}</p>
        </div>
        <div class="header-right">
          <ng-content select="[actions]"></ng-content>
          <button 
            *ngIf="showAddButton"
            pButton
            pRipple
            [label]="addButtonLabel"
            icon="pi pi-plus"
            class="p-button-primary add-btn"
            (click)="onAdd.emit()">
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      background: white;
      border-radius: 12px;
      padding: 1.5rem 2rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .header-left {
      flex: 1;
    }

    .page-title {
      font-size: 1.75rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .page-title i {
      color: #0891b2;
      font-size: 1.5rem;
    }

    .page-subtitle {
      color: #64748b;
      font-size: 0.95rem;
      margin: 0.5rem 0 0 0;
    }

    .header-right {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .add-btn {
      padding: 0.625rem 1.25rem;
      font-weight: 600;
      font-size: 0.875rem;
      background: #0891b2;
      border: none;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
    }

    .add-btn:hover {
      background: #0e7490;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
    }

    @media (max-width: 768px) {
      .header-content {
        flex-direction: column;
        align-items: flex-start;
      }

      .page-title {
        font-size: 1.5rem;
      }

      .header-right {
        width: 100%;
        justify-content: flex-end;
      }
    }
  `]
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() showAddButton: boolean = false;
  @Input() addButtonLabel: string = 'Add New';
  @Output() onAdd = new EventEmitter<void>();
}
