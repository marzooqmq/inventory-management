import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { MessageService } from 'primeng/api';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';
import { errorInterceptor } from './core/auth/interceptors/error.interceptor';
import { productReducer } from './features/products/store/product.reducer';
import { ProductEffects } from './features/products/store/product.effects';
import { rawMaterialReducer } from './features/raw-materials/store/raw-material.reducer';
import { RawMaterialEffects } from './features/raw-materials/store/raw-material.effects';
import { bomReducer } from './features/bom/store/bom.reducer';
import { BOMEffects } from './features/bom/store/bom.effects';
import { boxReducer } from './features/boxes/store/box.reducer';
import { BoxEffects } from './features/boxes/store/box.effects';
import { productionCostReducer } from './features/production-costs/store/production-cost.reducer';
import { ProductionCostEffects } from './features/production-costs/store/production-cost.effects';
import { productConversionReducer } from './features/product-conversions/store/product-conversion.reducer';
import { ProductConversionEffects } from './features/product-conversions/store/product-conversion.effects';
import { productPriceReducer } from './features/product-prices/store/product-price.reducer';
import { ProductPriceEffects } from './features/product-prices/store/product-price.effects';
import { materialStockReducer } from './features/raw-material-stocks/store/material-stock.reducer';
import { MaterialStockEffects } from './features/raw-material-stocks/store/material-stock.effects';
import { boxStockReducer } from './features/box-stocks/store/box-stock.reducer';
import { BoxStockEffects } from './features/box-stocks/store/box-stock.effects';
import { customerReducer } from './features/customers/store/customer.reducer';
import { CustomerEffects } from './features/customers/store/customer.effects';
import { invoiceReducer } from './features/invoices/store/invoice.reducer';
import { InvoiceEffects } from './features/invoices/store/invoice.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimations(),
    provideStore({ 
      products: productReducer,
      rawMaterials: rawMaterialReducer,
      boms: bomReducer,
      boxes: boxReducer,
      productionCosts: productionCostReducer,
      productConversions: productConversionReducer,
      productPrices: productPriceReducer,
      materialStock: materialStockReducer,
      boxStock: boxStockReducer,
      customers: customerReducer,
      invoices: invoiceReducer
    }),
    provideEffects([ProductEffects, RawMaterialEffects, BOMEffects, BoxEffects, ProductionCostEffects, ProductConversionEffects, ProductPriceEffects, MaterialStockEffects, BoxStockEffects, CustomerEffects, InvoiceEffects]),
    provideStoreDevtools({ maxAge: 25, logOnly: false }),
    MessageService
  ]
};

