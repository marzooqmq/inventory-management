import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Notification, NotificationType } from '../../shared/models/notification.model';

/**
 * Generic Notification Service
 * Manages all types of notifications in the application
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  addNotification(notification: Notification): void {
    const notifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...notifications]);
    this.updateUnreadCount();
  }

  removeNotification(id: string): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== id);
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
  }

  markAsRead(id: string): void {
    const notifications = this.notificationsSubject.value.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  getNotifications(): Notification[] {
    return this.notificationsSubject.value;
  }

  getNotificationsByType(type: NotificationType): Notification[] {
    return this.notificationsSubject.value.filter(n => n.type === type);
  }

  /**
   * Convenience methods for quick notifications
   */
  success(message: string, title: string = 'Success'): void {
    this.addNotification({
      id: this.generateId(),
      type: NotificationType.INFO,
      title,
      message,
      timestamp: new Date(),
      read: false
    });
  }

  error(message: string, title: string = 'Error'): void {
    this.addNotification({
      id: this.generateId(),
      type: NotificationType.SYSTEM_ALERT,
      title,
      message,
      timestamp: new Date(),
      read: false
    });
  }

  info(message: string, title: string = 'Information'): void {
    this.addNotification({
      id: this.generateId(),
      type: NotificationType.INFO,
      title,
      message,
      timestamp: new Date(),
      read: false
    });
  }

  warning(message: string, title: string = 'Warning'): void {
    this.addNotification({
      id: this.generateId(),
      type: NotificationType.SYSTEM_ALERT,
      title,
      message,
      timestamp: new Date(),
      read: false
    });
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
