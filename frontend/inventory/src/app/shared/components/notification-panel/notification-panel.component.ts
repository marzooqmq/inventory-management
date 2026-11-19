import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Notification, NotificationType } from '../../../shared/models/notification.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.css']
})
export class NotificationPanelComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  notifications: Notification[] = [];
  NotificationType = NotificationType;

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
  }

  closePanel(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onNotificationClick(notification: Notification): void {
    this.notificationService.markAsRead(notification.id);
    
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
      this.closePanel();
    }
  }

  removeNotification(notification: Notification, event: Event): void {
    event.stopPropagation();
    this.notificationService.removeNotification(notification.id);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    this.notificationService.clearAll();
    this.closePanel();
  }

  getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.COST_APPROVAL:
        return 'pi-dollar';
      case NotificationType.LOW_INVENTORY:
        return 'pi-inbox';
      case NotificationType.PENDING_ORDER:
        return 'pi-shopping-cart';
      case NotificationType.SYSTEM_ALERT:
        return 'pi-exclamation-triangle';
      default:
        return 'pi-info-circle';
    }
  }

  getNotificationColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.COST_APPROVAL:
        return 'notification-cost';
      case NotificationType.LOW_INVENTORY:
        return 'notification-inventory';
      case NotificationType.PENDING_ORDER:
        return 'notification-order';
      case NotificationType.SYSTEM_ALERT:
        return 'notification-alert';
      default:
        return 'notification-info';
    }
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }
}
