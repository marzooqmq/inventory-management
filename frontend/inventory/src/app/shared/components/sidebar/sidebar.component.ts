import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { filter } from 'rxjs/operators';

interface MenuItem {
  label: string;
  icon: string;
  route?: string;
  roles: string[];
  children?: MenuItem[];
  expanded?: boolean;
}


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output() collapsedChange = new EventEmitter<boolean>();
  isCollapsed = false;
  isMobileOpen = false;
  userRole: string = '';
  flyoutMenu: MenuItem | null = null;
  flyoutMenuPosition = { top: 0, left: 0 };
  private flyoutHideTimeout: any = null;

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'pi pi-home',
      route: '/dashboard',
      roles: ['ADMIN', 'ACCOUNTANT', 'MANAGER', 'STAFF', 'PRODUCTION_MANAGER']
    },
    {
      label: 'Inventory',
      icon: 'pi pi-warehouse',
      roles: ['ADMIN', 'PRODUCTION_MANAGER'],
      expanded: false,
      children: [
        {
          label: 'Inventory Dashboard',
          icon: 'pi pi-chart-bar',
          route: '/inventory-dashboard',
          roles: ['ADMIN', 'PRODUCTION_MANAGER']
        },
        {
          label: 'Finished Goods Stock',
          icon: 'pi pi-shopping-bag',
          route: '/finished-goods-stocks',
          roles: ['ADMIN', 'PRODUCTION_MANAGER']
        },
        {
          label: 'Raw Material Stock',
          icon: 'pi pi-database',
          route: '/raw-material-stocks',
          roles: ['ADMIN', 'PRODUCTION_MANAGER']
        },
        {
          label: 'Box Stock',
          icon: 'pi pi-box',
          route: '/box-stocks',
          roles: ['ADMIN', 'PRODUCTION_MANAGER']
        }
      ]
    },
    {
      label: 'Production',
      icon: 'pi pi-sitemap',
      roles: ['ADMIN', 'PRODUCTION_MANAGER'],
      expanded: false,
      children: [
        {
          label: 'Production Orders',
          icon: 'pi pi-sliders-h',
          route: '/production/orders',
          roles: ['ADMIN', 'PRODUCTION_MANAGER']
        }
      ]
    },
    {
      label: 'Billing',
      icon: 'pi pi-money-bill',
      roles: ['ADMIN', 'ACCOUNTANT'],
      expanded: false,
      children: [
        {
          label: 'Sales Dashboard',
          icon: 'pi pi-chart-bar',
          route: '/sales-dashboard',
          roles: ['ADMIN', 'ACCOUNTANT']
        },
        {
          label: 'Invoices',
          icon: 'pi pi-file-invoice',
          route: '/invoices',
          roles: ['ADMIN', 'ACCOUNTANT']
        },
        {
          label: 'Customers',
          icon: 'pi pi-users',
          route: '/customers',
          roles: ['ADMIN', 'ACCOUNTANT']
        }
      ]
    },
    {
      label: 'Reports',
      icon: 'pi pi-file-export',
      route: '/reports',
      roles: ['ADMIN', 'ACCOUNTANT', 'PRODUCTION_MANAGER'],
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      route: '/settings',
      roles: ['ADMIN'],
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userRole = user?.role || '';
    const reportsItem = this.menuItems.find(item => item.label === 'Reports');
    if (reportsItem) {
      reportsItem.route = this.userRole === 'PRODUCTION_MANAGER'
        ? '/reports/production'
        : '/reports/sales';
    }
    
    // Auto-expand parent menu if child is active
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.expandActiveParent();
      this.isMobileOpen = false;
    });
    
    this.expandActiveParent();
  }

  expandActiveParent(): void {
    this.menuItems.forEach(item => {
      if (item.children && this.hasActiveChild(item)) {
        item.expanded = true;
      }
    });
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.collapsedChange.emit(this.isCollapsed);
  }

  toggleMobileMenu(): void {
    if (this.isCollapsed) {
      this.isCollapsed = false;
      this.collapsedChange.emit(false);
    }
    this.isMobileOpen = !this.isMobileOpen;
  }

  closeMobileMenu(): void {
    this.isMobileOpen = false;
  }

  onEscapeKey(): void {
    this.closeMobileMenu();
    this.hideFlyoutMenu();
  }

  roleDisplayName(): string {
    switch (this.userRole) {
      case 'ADMIN': return 'Administrator';
      case 'ACCOUNTANT': return 'Accountant';
      case 'PRODUCTION_MANAGER': return 'Production Manager';
      default: return this.userRole.replace(/_/g, ' ');
    }
  }

  hasAccess(roles: string[]): boolean {
    return roles.includes(this.userRole);
  }

  getVisibleMenuItems(): MenuItem[] {
    return this.menuItems.filter(item => this.hasAccess(item.roles));
  }

  toggleMenuItem(item: MenuItem, event?: MouseEvent): void {
    if (item.children) {
      // If sidebar is collapsed, show flyout menu instead
      if (this.isCollapsed) {
        this.showFlyoutMenu(item, event);
      } else {
        // Normal toggle behavior when sidebar is expanded
        item.expanded = !item.expanded;
      }
    }
  }

  showFlyoutMenu(item: MenuItem, event?: MouseEvent): void {
    if (event) {
      const target = event.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.flyoutMenuPosition = {
        top: rect.top,
        left: rect.right + 5
      };
    }
    this.flyoutMenu = item;
  }

  hideFlyoutMenu(): void {
    this.flyoutMenu = null;
    this.clearFlyoutTimeout();
  }

  hideFlyoutMenuDelayed(): void {
    this.flyoutHideTimeout = setTimeout(() => {
      this.flyoutMenu = null;
    }, 200);
  }

  clearFlyoutTimeout(): void {
    if (this.flyoutHideTimeout) {
      clearTimeout(this.flyoutHideTimeout);
      this.flyoutHideTimeout = null;
    }
  }

  onFlyoutMouseEnter(item: MenuItem, event: MouseEvent): void {
    if (this.isCollapsed) {
      this.clearFlyoutTimeout();
      this.showFlyoutMenu(item, event);
    }
  }

  keepFlyoutOpen(): void {
    this.clearFlyoutTimeout();
  }

  hasVisibleChildren(item: MenuItem): boolean {
    return !!(item.children && item.children.some(child => this.hasAccess(child.roles)));
  }

  hasActiveChild(item: MenuItem): boolean {
    if (!item.children) return false;
    return item.children.some(child => 
      child.route && this.router.url.includes(child.route)
    );
  }

  isParentActive(item: MenuItem): boolean {
    return this.hasActiveChild(item);
  }
}
