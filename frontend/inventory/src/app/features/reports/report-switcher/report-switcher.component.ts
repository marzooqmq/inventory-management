import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

interface ReportLink {
  label: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-report-switcher',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './report-switcher.component.html',
  styleUrls: ['./report-switcher.component.css'],
})
export class ReportSwitcherComponent {
  private readonly userRole: string;

  private readonly reports: ReportLink[] = [
    { label: 'Sales Report', route: '/reports/sales', roles: ['ADMIN', 'ACCOUNTANT'] },
    { label: 'Cost & Profit', route: '/reports/cost-profit', roles: ['ADMIN'] },
    { label: 'Production Report', route: '/reports/production', roles: ['ADMIN', 'PRODUCTION_MANAGER'] },
    { label: 'Production vs Sales', route: '/reports/production-vs-sales', roles: ['ADMIN', 'PRODUCTION_MANAGER'] },
    { label: 'Finished Goods', route: '/reports/finished-goods', roles: ['ADMIN', 'PRODUCTION_MANAGER'] },
  ];

  constructor(authService: AuthService, private router: Router) {
    this.userRole = authService.getCurrentUser()?.role ?? '';
  }

  get visibleReports(): ReportLink[] {
    return this.reports.filter(report => report.roles.includes(this.userRole));
  }

  isActive(route: string): boolean {
    return this.router.url.split('?')[0] === route;
  }
}
