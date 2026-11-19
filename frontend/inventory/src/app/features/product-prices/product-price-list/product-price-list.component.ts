import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import * as ProductPriceActions from '../store/product-price.actions';
import * as ProductPriceSelectors from '../store/product-price.selectors';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ProductPriceResponseDTO, CustomerType } from '../models/product-price.model';

interface ProductPriceWithName extends ProductPriceResponseDTO { productName?: string; }

interface GroupedPrices {
  customerType: CustomerType;
  label: string;
  prices: ProductPriceWithName[];
  expanded: boolean;
}

@Component({
  selector: 'app-product-price-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, TooltipModule, PageHeaderComponent, ConfirmDialogComponent],
  providers: [ConfirmationService],
  templateUrl: './product-price-list.component.html',
  styleUrl: './product-price-list.component.css',
  animations: [
    trigger('slideDown', [
      state('collapsed', style({
        height: '0',
        opacity: '0',
        overflow: 'hidden'
      })),
      state('expanded', style({
        height: '*',
        opacity: '1',
        overflow: 'visible'
      })),
      transition('collapsed <=> expanded', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ])
    ])
  ]
})
export class ProductPriceListComponent implements OnInit {
  searchControl = new FormControl('');
  productPrices$: Observable<ProductPriceWithName[]>;
  groupedProductPrices$: Observable<GroupedPrices[]>;
  loading$: Observable<boolean>;

  constructor(private store: Store, private router: Router, private confirmationService: ConfirmationService) {
    this.loading$ = this.store.select(ProductPriceSelectors.selectProductPricesLoading);
    this.productPrices$ = this.store.select(ProductPriceSelectors.selectAllProductPrices);
    this.groupedProductPrices$ = combineLatest([this.productPrices$, this.searchControl.valueChanges.pipe(startWith(''))]).pipe(
      map(([productPrices, search]) => {
        // Filter by search
        let filtered = productPrices;
        if (search) {
          const s = search.toLowerCase();
          filtered = productPrices.filter(pp => pp.productName?.toLowerCase().includes(s) || pp.customerType.toLowerCase().includes(s));
        }
        
        // Group by customer type
        const groups: GroupedPrices[] = [
          { customerType: CustomerType.DISTRIBUTOR, label: 'Distributor Prices', prices: [], expanded: false },
          { customerType: CustomerType.DEALER, label: 'Dealer Prices', prices: [], expanded: false },
          { customerType: CustomerType.DIRECT_CUSTOMER, label: 'Direct Customer Prices', prices: [], expanded: false }
        ];
        
        filtered.forEach(price => {
          const group = groups.find(g => g.customerType === price.customerType);
          if (group) group.prices.push(price);
        });
        
        // Return only groups that have prices
        return groups.filter(g => g.prices.length > 0);
      })
    );
  }

  ngOnInit(): void {
    this.store.dispatch(ProductPriceActions.loadProductPrices());
  }

  onAdd(): void { this.router.navigate(['/product-prices/new']); }

  onEdit(id: number): void { this.router.navigate(['/product-prices/edit', id]); }

  onDelete(productPrice: ProductPriceWithName): void {
    this.confirmationService.confirm({
      message: `Delete price for ${productPrice.productName} (${productPrice.customerType})?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.store.dispatch(ProductPriceActions.deleteProductPrice({ id: productPrice.id }))
    });
  }

  getCustomerTypeBadgeClass(customerType: string): string {
    const classes: { [key: string]: string } = { DISTRIBUTOR: 'badge-distributor', DEALER: 'badge-dealer', DIRECT_CUSTOMER: 'badge-direct' };
    return classes[customerType] || 'badge-default';
  }

  getCustomerTypeIcon(customerType: CustomerType): string {
    const icons: { [key: string]: string } = {
      DISTRIBUTOR: 'pi pi-building',
      DEALER: 'pi pi-shopping-bag',
      DIRECT_CUSTOMER: 'pi pi-user'
    };
    return icons[customerType] || 'pi pi-tag';
  }

  getCustomerTypeDescription(customerType: CustomerType): string {
    const descriptions: { [key: string]: string } = {
      DISTRIBUTOR: 'Wholesale pricing for bulk distributors',
      DEALER: 'Competitive pricing for authorized dealers',
      DIRECT_CUSTOMER: 'Retail pricing for direct customers'
    };
    return descriptions[customerType] || '';
  }

  toggleGroup(group: GroupedPrices): void {
    group.expanded = !group.expanded;
  }
}
