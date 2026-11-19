import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface SettingsOption {
  title: string;
  description: string;
  icon: string;
  route: string;
  category: string;
}

@Component({
  selector: 'app-settings-hub',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './settings-hub.component.html',
  styleUrls: ['./settings-hub.component.css'],
})
export class SettingsHubComponent {
  readonly options: SettingsOption[] = [
    {
      title: 'Products',
      description: 'Manage product details, categories, and specifications.',
      icon: 'pi pi-shopping-bag',
      route: '/products',
      category: 'Product Catalog',
    },
    {
      title: 'Product Prices',
      description: 'Set and maintain product selling prices.',
      icon: 'pi pi-tag',
      route: '/product-prices',
      category: 'Product Catalog',
    },
    {
      title: 'Product Conversions',
      description: 'Configure product unit and packaging conversions.',
      icon: 'pi pi-sort-alt',
      route: '/product-conversions',
      category: 'Product Catalog',
    },
    {
      title: 'Raw Materials',
      description: 'Manage the raw materials used in production.',
      icon: 'pi pi-database',
      route: '/raw-materials',
      category: 'Production Setup',
    },
    {
      title: 'Boxes',
      description: 'Manage box and packaging definitions.',
      icon: 'pi pi-box',
      route: '/boxes',
      category: 'Production Setup',
    },
    {
      title: 'Bill of Materials',
      description: 'Define the materials and quantities required for each product.',
      icon: 'pi pi-list-check',
      route: '/bom',
      category: 'Production Setup',
    },
    {
      title: 'Production Costs',
      description: 'Maintain production cost components by product.',
      icon: 'pi pi-money-bill',
      route: '/production-costs',
      category: 'Production Setup',
    },
    {
      title: 'Cost Approvals',
      description: 'Review and approve calculated product costs.',
      icon: 'pi pi-check-circle',
      route: '/cost-approvals',
      category: 'Production Setup',
    },
    {
      title: 'Users',
      description: 'Manage user accounts and access to the application.',
      icon: 'pi pi-users',
      route: '/users',
      category: 'Access Management',
    },
  ];

  get categories(): string[] {
    return [...new Set(this.options.map(option => option.category))];
  }

  optionsIn(category: string): SettingsOption[] {
    return this.options.filter(option => option.category === category);
  }
}
