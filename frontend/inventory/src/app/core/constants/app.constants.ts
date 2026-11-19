export class AppConstants {
  // API Endpoints
  static readonly API_ENDPOINTS = {
    AUTH: {
      LOGIN: 'auth/login',
      LOGOUT: 'auth/logout',
      CHANGE_PASSWORD: 'users/change-password'
    },
    USERS: 'users',
    PRODUCTS: 'products',
    RAW_MATERIALS: 'raw-materials',
    BOXES: 'boxes',
    BOM: 'bom',
    PRODUCTION: 'production',
    INVENTORY: 'inventory',
    CUSTOMERS: 'customers',
    INVOICES: 'invoices',
    REPORTS: 'reports'
  };

  // User Roles
  static readonly ROLES = {
    ADMIN: 'ADMIN',
    PRODUCTION: 'PRODUCTION MANAGER',
    BILLING: 'ACCOUNTANT'
   
  };

  // Pagination
  static readonly DEFAULT_PAGE_SIZE = 10;
  static readonly PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

  // Date Formats
  static readonly DATE_FORMAT = 'dd/MM/yyyy';
  static readonly DATETIME_FORMAT = 'dd/MM/yyyy HH:mm:ss';
}
