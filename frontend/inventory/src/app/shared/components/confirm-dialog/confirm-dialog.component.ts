import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ConfirmDialogModule],
  template: `<p-confirmDialog></p-confirmDialog>`,
  styles: [`
    :host ::ng-deep {
      .p-confirm-dialog {
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        border: none;
        max-width: 450px;
      }

      .p-confirm-dialog .p-dialog-header {
        background: white;
        border-bottom: 1px solid #e5e7eb;
        padding: 1.25rem 1.5rem;
        border-radius: 8px 8px 0 0;
      }

      .p-confirm-dialog .p-dialog-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: #111827;
      }

      .p-confirm-dialog .p-dialog-header-icon {
        width: 2rem;
        height: 2rem;
        color: #6b7280;
      }

      .p-confirm-dialog .p-dialog-header-icon:hover {
        color: #374151;
        background: #f3f4f6;
      }

      .p-confirm-dialog .p-dialog-content {
        padding: 1.5rem;
        background: white;
      }

      .p-confirm-dialog-message {
        margin-left: 0.75rem;
        color: #374151;
        font-size: 0.9375rem;
        line-height: 1.5;
      }

      .p-confirm-dialog-icon {
        font-size: 2rem;
        color: #f59e0b;
      }

      .p-confirm-dialog .p-dialog-footer {
        padding: 1rem 1.5rem;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        border-radius: 0 0 8px 8px;
        gap: 0.75rem;
      }

      .p-confirm-dialog .p-button {
        padding: 0.625rem 1.25rem;
        font-size: 0.875rem;
        font-weight: 600;
        border-radius: 6px;
        transition: all 0.15s ease;
      }

      .p-confirm-dialog .p-confirm-dialog-reject {
        background: #0891b2 !important;
        border: none !important;
        color: white !important;
      }

      .p-confirm-dialog .p-confirm-dialog-reject:hover {
        background: #0e7490 !important;
      }

      .p-confirm-dialog .p-button.p-button-text {
        background: #0891b2;
        border: none;
        color: white;
      }

      .p-confirm-dialog .p-button.p-button-text:hover {
        background: #0e7490;
      }

      .p-confirm-dialog .p-confirm-dialog-accept,
      .p-confirm-dialog .p-button.p-button-danger {
        background: #ef4444 !important;
        border: none !important;
        color: white !important;
      }

      .p-confirm-dialog .p-confirm-dialog-accept:hover,
      .p-confirm-dialog .p-button.p-button-danger:hover {
        background: #dc2626 !important;
      }
    }
  `]
})
export class ConfirmDialogComponent {}
