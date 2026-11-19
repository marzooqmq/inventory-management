import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { BadgeModule } from 'primeng/badge';
import { MenuItem } from 'primeng/api';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/auth/services/auth.service';
import { CostApprovalService } from '../../core/services/cost-approval.service';
import { NotificationPanelComponent } from '../../shared/components/notification-panel/notification-panel.component';
import { User } from '../../core/auth/models/user.model';
import { AppConstants } from '../../core/constants/app.constants';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    MenuModule,
    RippleModule,
    BadgeModule,
    NotificationPanelComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy, OnDestroy {
  userMenuItems: MenuItem[] = [];
  currentUser: User | null = null;
  showNotificationPanel = false;
  unreadNotificationsCount$: Observable<number>;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private toastService: ToastService,
    private costApprovalService: CostApprovalService,
    private router: Router
  ) {
    this.unreadNotificationsCount$ = this.notificationService.unreadCount$;
  }

  ngOnInit(): void {
    // Get current user immediately
    this.currentUser = this.authService.getCurrentUser();
    
    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.initUserMenu();
    
    // Start polling for cost approvals
    this.costApprovalService.startPolling();
  }

  ngOnDestroy(): void {
    this.costApprovalService.stopPolling();
  }

  toggleNotificationPanel(): void {
    this.showNotificationPanel = !this.showNotificationPanel;
  }

  initUserMenu(): void {
    this.userMenuItems = [
      {
        label: 'Change Password',
        icon: 'pi pi-key',
        command: () => this.changePassword()
      },
      {
        separator: true
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  }

  changePassword(): void {
    this.router.navigate(['/change-password']);
  }

  logout(): void {
    this.toastService.info('See you soon!', 'Logged Out');
    setTimeout(() => {
      this.authService.logout();
    }, 500);
  }

  getRoleDisplayName(): string {
    if (!this.currentUser?.role) {
      return 'User';
    }
    
    // Map backend role to display name from AppConstants
    const role = this.currentUser.role.toUpperCase();
    
    if (role === AppConstants.ROLES.ADMIN || role.includes('ADMIN')) {
      return 'Administrator';
    } else if (role === AppConstants.ROLES.PRODUCTION || role.includes('PRODUCTION')) {
      return 'Production Manager';
    } else if (role === AppConstants.ROLES.BILLING || role.includes('ACCOUNTANT')) {
      return 'Accountant';
    }
    
    // Return original role if no match (capitalize first letter)
    return this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1).toLowerCase();
  }
}

export default HeaderComponent;
