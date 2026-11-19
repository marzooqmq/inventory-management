import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';
import { passwordChangeGuard } from './core/auth/guards/password-change.guard';
import { roleGuard } from './core/auth/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
  },
  {
    path: 'change-password',
    loadComponent: () => import('./features/auth/change-password/change-password.component'),
    canActivate: [authGuard]
  },
  {
    path: '',
    loadComponent: () => import('./layout/main-layout/main-layout.component'),
    canActivate: [authGuard, passwordChangeGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'inventory-dashboard',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MANAGER'] },
        loadComponent: () => import('./features/inventory-dashboard/inventory-dashboard.component').then(m => m.InventoryDashboardComponent)
      },
      {
        path: 'finished-goods-stocks',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MANAGER'] },
        loadComponent: () => import('./features/finished-goods-stocks/stock-list/stock-list.component').then(m => m.FinishedGoodsStockListComponent)
      },
      {
        path: 'products',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/products/product-list/product-list.component').then(m => m.ProductListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/products/product-form/product-form.component')
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/products/product-form/product-form.component')
          }
        ]
      },
      {
        path: 'raw-materials',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/raw-materials/raw-material-list/raw-material-list.component').then(m => m.RawMaterialListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/raw-materials/raw-material-form/raw-material-form.component').then(m => m.RawMaterialFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/raw-materials/raw-material-form/raw-material-form.component').then(m => m.RawMaterialFormComponent)
          }
        ]
      },
      {
        path: 'raw-material-stocks',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MANAGER'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/raw-material-stocks/stock-list/stock-list.component').then(m => m.StockListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/raw-material-stocks/stock-form/stock-form.component').then(m => m.StockFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/raw-material-stocks/stock-form/stock-form.component').then(m => m.StockFormComponent)
          }
        ]
      },
      {
        path: 'bom',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/bom/bom-list/bom-list.component').then(m => m.BOMListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/bom/bom-form/bom-form.component').then(m => m.BOMFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/bom/bom-form/bom-form.component').then(m => m.BOMFormComponent)
          }
        ]
      },
      {
        path: 'boxes',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/boxes/box-list/box-list.component').then(m => m.BoxListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/boxes/box-form/box-form.component').then(m => m.BoxFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/boxes/box-form/box-form.component').then(m => m.BoxFormComponent)
          }
        ]
      },
      {
        path: 'box-stocks',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/box-stocks/stock-list/stock-list.component').then(m => m.BoxStockListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/box-stocks/stock-form/stock-form.component').then(m => m.BoxStockFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/box-stocks/stock-form/stock-form.component').then(m => m.BoxStockFormComponent)
          }
        ]
      },
      {
        path: 'production-costs',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/production-costs/production-cost-list/production-cost-list.component').then(m => m.ProductionCostListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/production-costs/production-cost-form/production-cost-form.component').then(m => m.ProductionCostFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/production-costs/production-cost-form/production-cost-form.component').then(m => m.ProductionCostFormComponent)
          }
        ]
      },
      {
        path: 'product-conversions',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/product-conversions/product-conversion-list/product-conversion-list.component').then(m => m.ProductConversionListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/product-conversions/product-conversion-form/product-conversion-form.component').then(m => m.ProductConversionFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/product-conversions/product-conversion-form/product-conversion-form.component').then(m => m.ProductConversionFormComponent)
          }
        ]
      },
      {
        path: 'product-prices',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/product-prices/product-price-list/product-price-list.component').then(m => m.ProductPriceListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/product-prices/product-price-form/product-price-form.component').then(m => m.ProductPriceFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/product-prices/product-price-form/product-price-form.component').then(m => m.ProductPriceFormComponent)
          }
        ]
      },
      {
        path: 'cost-approvals',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./features/cost-approvals/cost-approvals.component').then(m => m.CostApprovalsComponent)
      },
      {
        path: 'customers',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ACCOUNTANT'] },
        loadComponent: () => import('./features/customers/customer-list/customer-list.component').then(m => m.CustomerListComponent)
      },
      {
        path: 'invoices',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ACCOUNTANT'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/invoices/invoice-list/invoice-list.component').then(m => m.InvoiceListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/invoices/invoice-form/invoice-form.component').then(m => m.InvoiceFormComponent)
          },
          {
            path: ':id',
            loadComponent: () => import('./features/invoices/invoice-detail/invoice-detail.component').then(m => m.InvoiceDetailComponent)
          }
        ]
      },
      {
        path: 'sales-dashboard',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ACCOUNTANT'] },
        loadComponent: () => import('./features/sales-dashboard/sales-dashboard.component').then(m => m.SalesDashboardComponent)
      },
      {
        path: 'production',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MANAGER'] },
        children: [
          {
            path: 'orders',
            loadComponent: () => import('./features/production/production-orders/order-list/order-list.component').then(m => m.OrderListComponent)
          },
          {
            path: 'orders/new',
            loadComponent: () => import('./features/production/production-orders/order-form/order-form.component').then(m => m.OrderFormComponent)
          },
          {
            path: 'orders/edit/:id',
            loadComponent: () => import('./features/production/production-orders/order-form/order-form.component').then(m => m.OrderFormComponent)
          },
          {
            path: 'orders/:id',
            loadComponent: () => import('./features/production/production-orders/order-details/order-details.component').then(m => m.OrderDetailsComponent)
          },
          {
            path: '',
            redirectTo: 'orders',
            pathMatch: 'full'
          }
        ]
      },
      {
        path: 'reports',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ACCOUNTANT', 'PRODUCTION_MANAGER'] },
        loadComponent: () => import('./features/reports/reports-hub/reports-hub.component').then(m => m.ReportsHubComponent)
      },
      {
        path: 'reports/sales',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ACCOUNTANT'] },
        loadComponent: () => import('./features/reports/sales-report/sales-report.component').then(m => m.SalesReportComponent)
      },
      {
        path: 'reports/cost-profit',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./features/reports/cost-profit-report/cost-profit-report.component').then(m => m.CostProfitReportComponent)
      },
      {
        path: 'reports/production',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MANAGER'] },
        loadComponent: () => import('./features/reports/production-report/production-report.component').then(m => m.ProductionReportComponent)
      },
      {
        path: 'reports/production-vs-sales',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MANAGER'] },
        loadComponent: () => import('./features/reports/production-vs-sales/production-vs-sales.component').then(m => m.ProductionVsSalesComponent)
      },
      {
        path: 'reports/finished-goods',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'PRODUCTION_MANAGER'] },
        loadComponent: () => import('./features/reports/finished-goods-report/finished-goods-report.component').then(m => m.FinishedGoodsReportComponent)
      },
      {
        path: 'settings',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./features/settings/settings-hub/settings-hub.component').then(m => m.SettingsHubComponent)
      },
      {
        path: 'users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        children: [
          {
            path: '',
            loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./features/users/user-form/user-form.component').then(m => m.UserFormComponent)
          }
        ]
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
