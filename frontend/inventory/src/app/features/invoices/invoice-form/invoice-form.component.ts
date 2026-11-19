import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, forkJoin } from 'rxjs';
import { takeUntil, map, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { AutoComplete, AutoCompleteModule } from 'primeng/autocomplete';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { CustomerResponseDTO } from '../../customers/models/customer.model';
import { ProductResponseDTO } from '../../products/models/product.model';
import { ProductPriceResponseDTO } from '../../product-prices/models/product-price.model';
import { CustomerService } from '../../customers/services/customer.service';
import { ProductService } from '../../products/services/product.service';
import { ProductPriceService } from '../../product-prices/services/product-price.service';
import { ProductConversionService } from '../../product-conversions/services/product-conversion.service';
import { ProductConversionResponseDTO } from '../../product-conversions/models/product-conversion.model';
import * as InvoiceActions from '../store/invoice.actions';
import * as InvoiceSelectors from '../store/invoice.selectors';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

interface InvoiceFormItem {
  product: ProductResponseDTO | null;
  quantity: number;
  unitType: string; // 'BOX' or 'CASE'
  price: number;
  subtotal: number;
}

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    ButtonModule,
    DropdownModule,
    InputNumberModule,
    AutoCompleteModule,
    TableModule,
    DialogModule,
    InputTextareaModule,
    InputTextModule,
    TooltipModule,
    TagModule,
    PageHeaderComponent
  ],
  templateUrl: './invoice-form.component.html',
  styleUrl: './invoice-form.component.css'
})
export class InvoiceFormComponent implements OnInit, OnDestroy {
  @ViewChild('customerAutoComplete') customerAutoComplete!: AutoComplete;
  
  invoiceForm: FormGroup;
  loading$: Observable<boolean>;
  private destroy$ = new Subject<void>();

  customers: CustomerResponseDTO[] = [];
  products: ProductResponseDTO[] = [];
  productPrices: ProductPriceResponseDTO[] = [];
  productConversions: ProductConversionResponseDTO[] = [];
  filteredCustomers: CustomerResponseDTO[] = [];
  selectedCustomer: CustomerResponseDTO | null = null;
  
  showProductDialog = false;
  showNewCustomerDialog = false;
  newCustomerForm: FormGroup;
  selectedProducts: Map<number, InvoiceFormItem> = new Map();
  productSearchQuery: string = '';

  constructor(
    private fb: FormBuilder,
    private store: Store,
    private router: Router,
    private customerService: CustomerService,
    private productService: ProductService,
    private productPriceService: ProductPriceService,
    private productConversionService: ProductConversionService
  ) {
    this.loading$ = this.store.select(InvoiceSelectors.selectInvoicesLoading);
    this.invoiceForm = this.createForm();
    this.newCustomerForm = this.createNewCustomerForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      searchCustomer: ['', Validators.required]
    });
  }

  private createNewCustomerForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      address: ['', Validators.required],
      district: ['', Validators.required],
      state: ['', Validators.required],
      country: ['India', Validators.required],
      zipCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      type: ['DEALER', Validators.required],
      discount: [0, [Validators.min(0), Validators.max(100)]]
    });
  }

  private loadInitialData(): void {
    forkJoin({
      customers: this.customerService.getAll(),
      products: this.productService.getAll(),
      prices: this.productPriceService.getAll(),
      conversions: this.productConversionService.getAll()
    }).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.customers = data.customers;
        this.filteredCustomers = data.customers;
        this.products = data.products.filter(p => p.active);
        this.productPrices = data.prices;
        this.productConversions = data.conversions;
      },
      error: (err) => console.error('Error loading data:', err)
    });
  }

  filterCustomers(event: any): void {
    // Disable autocomplete filtering - only show results on button click
    this.filteredCustomers = [];
  }

  onSearchCustomer(): void {
    const query = this.invoiceForm.get('searchCustomer')?.value;
    
    // Handle both string input and customer object
    let searchQuery = '';
    if (typeof query === 'string') {
      searchQuery = query.trim();
    } else if (query && typeof query === 'object' && 'name' in query) {
      searchQuery = query.name.trim();
    }
    
    if (!searchQuery) {
      this.filteredCustomers = [];
      return;
    }
    
    // Call backend API search when search button is clicked
    this.customerService.search(searchQuery).subscribe({
      next: (results) => {
        this.filteredCustomers = results;
        // Trigger the autocomplete to show dropdown
        if (this.customerAutoComplete) {
          // Focus the input first
          const inputEl = this.customerAutoComplete.el.nativeElement.querySelector('input');
          if (inputEl) {
            inputEl.focus();
          }
          // Show the dropdown
          setTimeout(() => {
            this.customerAutoComplete.show();
          }, 50);
        }
      },
      error: (err) => {
        console.error('Error searching customers:', err);
        this.filteredCustomers = [];
      }
    });
  }

  onCustomerSelect(customer: CustomerResponseDTO): void {
    this.selectedCustomer = customer;
    // Recalculate prices based on customer type
    this.updateAllPrices();
  }

  onCustomerClear(): void {
    this.selectedCustomer = null;
    this.selectedProducts.clear();
    this.filteredCustomers = [];
  }

  openNewCustomerDialog(): void {
    this.newCustomerForm.reset({ type: 'DEALER', discount: 0, country: 'India' });
    this.showNewCustomerDialog = true;
  }

  onCreateNewCustomer(): void {
    if (this.newCustomerForm.valid) {
      this.customerService.create(this.newCustomerForm.value)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newCustomer) => {
            this.customers.push(newCustomer);
            this.selectedCustomer = newCustomer;
            this.invoiceForm.patchValue({ searchCustomer: newCustomer.name });
            this.showNewCustomerDialog = false;
          },
          error: (err) => console.error('Error creating customer:', err)
        });
    }
  }

  onAddProducts(): void {
    if (!this.selectedCustomer) {
      alert('Please select a customer first');
      return;
    }
    this.productSearchQuery = ''; // Reset search when opening dialog
    this.showProductDialog = true;
  }

  onProductSelect(product: ProductResponseDTO): void {
    if (!this.selectedProducts.has(product.id)) {
      const price = this.getProductPrice(product.id);
      this.selectedProducts.set(product.id, {
        product,
        quantity: 1,
        unitType: 'BOX', // Default to BOX
        price: price,
        subtotal: price
      });
    }
    this.showProductDialog = false;
  }

  // Zoho-style: Add product but keep dialog open for adding multiple items
  onProductAdd(product: ProductResponseDTO): void {
    if (!this.selectedProducts.has(product.id)) {
      const price = this.getProductPrice(product.id);
      this.selectedProducts.set(product.id, {
        product,
        quantity: 1,
        unitType: 'BOX',
        price: price,
        subtotal: price
      });
      // Don't close dialog - let user add more products (Zoho behavior)
    }
  }

  onRemoveProduct(productId: number): void {
    this.selectedProducts.delete(productId);
  }

  updateQuantity(productId: number, quantity: number): void {
    const item = this.selectedProducts.get(productId);
    if (item && quantity > 0) {
      item.quantity = quantity;
      item.subtotal = item.price * quantity;
      this.selectedProducts.set(productId, item);
    }
  }

  updateUnitType(productId: number, unitType: string): void {
    const item = this.selectedProducts.get(productId);
    if (item && item.product) {
      item.unitType = unitType;
      
      // Recalculate price based on unit type
      const pricePerBox = this.getProductPrice(productId);
      
      if (unitType === 'CASE') {
        const conversion = this.productConversions.find(
          c => c.productId === productId && c.unitName === 'CASE'
        );
        if (conversion) {
          item.price = pricePerBox * conversion.boxesPerUnit;
          item.subtotal = item.price * item.quantity;
        }
      } else {
        // BOX
        item.price = pricePerBox;
        item.subtotal = item.price * item.quantity;
      }
      
      this.selectedProducts.set(productId, item);
    }
  }

  getProductPrice(productId: number): number {
    if (!this.selectedCustomer) return 0;
    
    const priceEntry = this.productPrices.find(p => 
      p.productId === productId && p.customerType === this.selectedCustomer!.type
    );
    
    return priceEntry ? priceEntry.pricePerBox : 0;
  }

  private updateAllPrices(): void {
    this.selectedProducts.forEach((item, productId) => {
      const pricePerBox = this.getProductPrice(productId);
      
      if (item.unitType === 'CASE') {
        const conversion = this.productConversions.find(
          c => c.productId === productId && c.unitName === 'CASE'
        );
        if (conversion) {
          item.price = pricePerBox * conversion.boxesPerUnit;
        } else {
          item.price = pricePerBox;
        }
      } else {
        item.price = pricePerBox;
      }
      
      item.subtotal = item.price * item.quantity;
      this.selectedProducts.set(productId, item);
    });
  }

  getProductsArray(): InvoiceFormItem[] {
    return Array.from(this.selectedProducts.values());
  }

  getAvailableProducts(): ProductResponseDTO[] {
    return this.products.filter(p => !this.selectedProducts.has(p.id));
  }

  getFilteredProducts(): ProductResponseDTO[] {
    const available = this.getAvailableProducts();
    if (!this.productSearchQuery || this.productSearchQuery.trim() === '') {
      return available;
    }
    
    const query = this.productSearchQuery.toLowerCase().trim();
    return available.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.size.toLowerCase().includes(query)
    );
  }

  calculateSubtotal(): number {
    let total = 0;
    this.selectedProducts.forEach(item => {
      total += item.subtotal;
    });
    return total;
  }

  getTotalItems(): number {
    let count = 0;
    this.selectedProducts.forEach(item => {
      count += item.quantity;
    });
    return count;
  }

  filterProducts(event: any): void {
    // Product filtering handled by Angular's *ngFor filtering
  }



  getSubtotal(): number {
    return this.calculateSubtotal();
  }

  getDiscount(): number {
    if (!this.selectedCustomer) {
      return 0;
    }
    const discount = this.selectedCustomer.discount || 0;
    if (discount <= 0) {
      return 0;
    }
    const subtotal = this.getSubtotal();
    return (subtotal * discount) / 100;
  }

  getAmountBeforeTax(): number {
    return this.getSubtotal() - this.getDiscount();
  }

  getTotal(): number {
    return this.getAmountBeforeTax();
  }

  onSubmit(): void {
    // Zoho Billing behavior: Direct save without confirmation
    // Validation only, no confirmation dialog
    if (!this.selectedCustomer) {
      return; // Button is disabled, this shouldn't happen
    }
    
    if (this.selectedProducts.size === 0) {
      return; // Button is disabled, this shouldn't happen
    }

    // Direct invoice creation (Zoho-style)
    const items = this.getProductsArray().map(item => ({
      productId: item.product!.id,
      quantity: item.quantity,
      unitType: item.unitType
    }));

    const invoiceRequest = {
      customerId: this.selectedCustomer.id,
      items
    };

    this.store.dispatch(InvoiceActions.createInvoice({ invoice: invoiceRequest }));
  }

  onCancel(): void {
    this.router.navigate(['/invoices']);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  }

  getCustomerTypeLabel(type: string): string {
    switch (type) {
      case 'DISTRIBUTOR': return 'Distributor';
      case 'DEALER': return 'Dealer';
      case 'DIRECT_CUSTOMER': return 'Direct Customer';
      default: return type;
    }
  }

  getCategoryLabel(category: string): string {
    switch (category) {
      case 'ULTRA_THIN': return 'Ultra Thin';
      case 'PREMIUM': return 'Premium';
      case 'LINER': return 'Liner';
      case 'NA': return 'N/A';
      default: return category;
    }
  }

  getCategorySeverity(category: string): string {
    switch (category) {
      case 'ULTRA_THIN': return 'info';
      case 'PREMIUM': return 'success';
      case 'LINER': return 'warning';
      case 'NA': return 'secondary';
      default: return 'secondary';
    }
  }

}
