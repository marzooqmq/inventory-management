import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';

interface ReportCard {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  roles: string[];
  badge?: string;
}

@Component({
  selector: 'app-reports-hub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './reports-hub.component.html',
  styleUrls: ['./reports-hub.component.css'],
})
export class ReportsHubComponent {
  userRole: string;

  reports: ReportCard[] = [
    {
      title: 'Sales Report',
      description: 'Invoice-level sales data with customer, product, and payment tracking. Export to PDF.',
      icon: 'pi pi-chart-line',
      route: '/reports/sales',
      color: 'blue',
      roles: ['ADMIN', 'ACCOUNTANT'],
    },
    {
      title: 'Cost & Profit Analysis',
      description: 'Monthly production cost vs revenue and sales profit margin breakdown by product.',
      icon: 'pi pi-percentage',
      route: '/reports/cost-profit',
      color: 'green',
      roles: ['ADMIN'],
    },
    {
      title: 'Production Report',
      description: 'Production execution status, stage-wise progress, and output quantity analysis.',
      icon: 'pi pi-sitemap',
      route: '/reports/production',
      color: 'indigo',
      roles: ['ADMIN', 'PRODUCTION_MANAGER'],
    },
    {
      title: 'Production vs Sales',
      description: 'Compare produced quantity against sold quantity with monthly trend and stock position.',
      icon: 'pi pi-sort-alt',
      route: '/reports/production-vs-sales',
      color: 'orange',
      roles: ['ADMIN', 'PRODUCTION_MANAGER'],
    },
    {
      title: 'Finished Goods',
      description: 'Date-wise finished goods production output with product-wise summary.',
      icon: 'pi pi-box',
      route: '/reports/finished-goods',
      color: 'cyan',
      roles: ['ADMIN', 'PRODUCTION_MANAGER'],
    },
  ];

  constructor(private authService: AuthService, private router: Router) {
    const user = this.authService.getCurrentUser();
    this.userRole = user?.role || '';
  }

  get visibleReports(): ReportCard[] {
    return this.reports.filter(r => r.roles.includes(this.userRole));
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
