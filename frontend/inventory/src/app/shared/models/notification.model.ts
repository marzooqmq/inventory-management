/**
 * Generic Notification System
 * Supports multiple notification types (cost approvals, inventory alerts, etc.)
 */

export enum NotificationType {
  COST_APPROVAL = 'COST_APPROVAL',
  LOW_INVENTORY = 'LOW_INVENTORY',
  PENDING_ORDER = 'PENDING_ORDER',
  SYSTEM_ALERT = 'SYSTEM_ALERT',
  INFO = 'INFO'
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  count?: number;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;  // Where to navigate when clicked
  data?: any;  // Type-specific data
}

// Cost approval specific data
export interface CostApprovalNotificationData {
  productId: number;
  productName: string;
  currentCost: number;
  newCost: number;
}
