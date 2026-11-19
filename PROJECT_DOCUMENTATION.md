# Inventory Management System - Complete A-Z Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Database Design](#database-design)
6. [Backend System](#backend-system)
7. [Frontend System](#frontend-system)
8. [Core Features](#core-features)
9. [Setup and Installation](#setup-and-installation)
10. [Running the Application](#running-the-application)
11. [API Documentation](#api-documentation)
12. [Key Workflows](#key-workflows)
13. [Security](#security)
14. [Performance Considerations](#performance-considerations)
15. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is Way2Care Inventory?

Way2Care Inventory Management System is a comprehensive enterprise solution designed to manage inventory, billing, and production workflows for healthcare or manufacturing organizations. It provides tools for tracking raw materials, finished goods, inventory stocks, product conversions, pricing, and generating detailed reports and invoices.

### Project Goals

- **Centralized Inventory Management**: Track raw materials, finished goods, and intermediate stock levels
- **Production Management**: Monitor production processes and costs
- **Billing & Invoicing**: Generate accurate invoices and billing documentation
- **Cost Approval Workflows**: Manage cost approvals with automated workflows
- **Real-time Dashboards**: Visualize inventory and sales data
- **Multi-user Support**: Role-based access control for different user types
- **Report Generation**: Generate comprehensive reports with PDF export

### Target Users

- **Inventory Managers**: Manage stock levels and material movements
- **Production Supervisors**: Track production runs and costs
- **Finance Team**: Generate invoices and approve costs
- **Management**: View dashboards and reports
- **System Administrators**: Configure system settings and manage users

---

## System Architecture

### High-Level Architecture Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                    End Users (Browsers)                        │
└──────────────────────────┬─────────────────────────────────────┘
                           │ HTTP/HTTPS
                           ▼
┌────────────────────────────────────────────────────────────────┐
│              Frontend: Angular 17 Application                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  • Dashboard & Analytics                              │  │
│  │  • Form-based Data Entry                             │  │
│  │  • Reports & Export                                  │  │
│  │  • Authentication UI                                │  │
│  │  • State Management (NgRx)                          │  │
│  │  Port: 4200 (Development) / 80 (Production)         │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────┬─────────────────────────────────────┘
                           │ REST API Calls
                           ▼
┌────────────────────────────────────────────────────────────────┐
│            Backend: Spring Boot 3.3.5 REST API                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  • Authentication & Authorization (JWT/Spring Security)│  │
│  │  • Business Logic Layer                               │  │
│  │  • Entity Management                                  │  │
│  │  • PDF Generation                                     │  │
│  │  • Data Validation                                    │  │
│  │  • Error Handling                                     │  │
│  │  Port: 9090                                           │  │
│  │  Context: /inventory                                  │  │
│  └─────────────────────────────────────────────────────┘  │
└──────────────────────────┬─────────────────────────────────────┘
                           │ SQL Queries (JDBC/JPA)
                           ▼
┌────────────────────────────────────────────────────────────────┐
│             Database: PostgreSQL 12+                           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  • Normalized Schema                                  │  │
│  │  • Entity Relationships (Foreign Keys)               │  │
│  │  • Data Integrity & Constraints                      │  │
│  │  • Transaction Management                            │  │
│  │  Port: 5432                                          │  │
│  │  Database: inventory                                 │  │
│  └─────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
1. User Action (Browser)
   ↓
2. Angular Frontend (UI Component → Service → NgRx Store)
   ↓
3. HTTP Request (JWT Token in Header)
   ↓
4. Spring Boot Controller (Request Validation)
   ↓
5. Service Layer (Business Logic)
   ↓
6. Repository Layer (Data Access)
   ↓
7. Database Query (PostgreSQL)
   ↓
8. Response (JSON + Status Code)
   ↓
9. Frontend Store Update (NgRx)
   ↓
10. UI Re-render (Angular Components)
```

---

## Technology Stack

### Backend Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Spring Boot | 3.3.5 | REST API Framework |
| **Runtime** | Java | 17 LTS | Programming Language |
| **Build Tool** | Maven | 3.9+ | Dependency Management |
| **ORM** | Spring Data JPA/Hibernate | Latest | Object-Relational Mapping |
| **Security** | Spring Security | Latest | Authentication & Authorization |
| **Authentication** | JWT (JJWT) | 0.11.5 | Token-based Authentication |
| **Database Driver** | PostgreSQL JDBC | Latest | Database Connection |
| **PDF Generation** | iText | 8.0.5 | PDF Report Creation |
| **Validation** | Spring Validation | Latest | Data Validation |
| **Lombok** | Lombok | Latest | Code Generation (Getters, Setters) |

### Frontend Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | Angular | 17.3.0 | SPA Framework |
| **Language** | TypeScript | 5.4.2 | Programming Language |
| **Package Manager** | npm | Latest | Dependency Management |
| **UI Library** | PrimeNG | 17.0.0 | Pre-built UI Components |
| **Icons** | PrimeIcons | 7.0.0 | Icon Library |
| **State Management** | NgRx | 17.0.0 | Redux-style State Management |
| **HTTP Client** | Angular HttpClient | 17.3.0 | API Communication |
| **Routing** | Angular Router | 17.3.0 | Client-side Routing |
| **Charts** | Chart.js | 4.5.1 | Data Visualization |
| **Date Handling** | date-fns | 4.1.0 | Date Manipulation |
| **Token Decode** | jwt-decode | 4.0.0 | JWT Token Parsing |
| **Testing** | Jasmine/Karma | Latest | Unit Testing Framework |

### Database Technology

- **DBMS**: PostgreSQL 12+
- **Dialect**: PostgreSQL Dialect (Hibernate)
- **Port**: 5432
- **Username**: postgres
- **Password**: Set locally through `SPRING_DATASOURCE_PASSWORD`; do not commit it
- **Database Name**: inventory

### Development Tools

- **IDE**: VS Code or IntelliJ IDEA
- **Version Control**: Git/GitHub
- **Runtime**: Node.js 18+ (Frontend Development)
- **JDK**: Java 17

---

## Project Structure

### Directory Organization

```
way2care-inventory/
│
├── backend/
│   └── inventory-management/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/com/way2care/inventorymanagement/
│       │   │   │   ├── config/                    # Configuration classes
│       │   │   │   ├── controller/                # REST Controllers
│       │   │   │   ├── service/                   # Business Logic
│       │   │   │   ├── repository/                # Database Access
│       │   │   │   ├── entity/                    # JPA Entities
│       │   │   │   ├── dto/                       # Data Transfer Objects
│       │   │   │   ├── exception/                 # Custom Exceptions
│       │   │   │   ├── security/                  # Security Configuration
│       │   │   │   └── util/                      # Utility Classes
│       │   │   └── resources/
│       │   │       ├── application.yml            # Application Configuration
│       │   │       ├── application-prod.yml       # Production Config
│       │   │       ├── fonts/                     # Custom Fonts (PDF)
│       │   │       ├── images/                    # Images (Logos, etc.)
│       │   │       ├── static/                    # Web Resources
│       │   │       └── templates/                 # Email Templates
│       │   └── test/
│       │       └── java/com/way2care/inventorymanagement/
│       │           └── *Test classes              # Unit Tests
│       ├── pom.xml                                # Maven Configuration
│       ├── mvnw / mvnw.cmd                        # Maven Wrapper
│       └── HELP.md                                # Help Documentation
│
├── frontend/
│   └── inventory/
│       ├── src/
│       │   ├── app/
│       │   │   ├── app.component.*                # Root Component
│       │   │   ├── app.config.ts                  # App Configuration
│       │   │   ├── app.routes.ts                  # Route Configuration
│       │   │   │
│       │   │   ├── core/
│       │   │   │   ├── auth/
│       │   │   │   │   ├── guards/                # Route Guards
│       │   │   │   │   ├── interceptors/          # HTTP Interceptors
│       │   │   │   │   ├── models/                # Auth Models
│       │   │   │   │   └── services/              # Auth Service
│       │   │   │   ├── constants/
│       │   │   │   │   └── app.constants.ts       # App Constants
│       │   │   │   ├── models/
│       │   │   │   │   └── api-response.model.ts  # API Response Model
│       │   │   │   └── services/
│       │   │   │       ├── api.service.ts         # HTTP Service
│       │   │   │       └── *.service.ts           # Domain Services
│       │   │   │
│       │   │   ├── features/
│       │   │   │   ├── auth/                      # Authentication Module
│       │   │   │   ├── bom/                       # BOM Management
│       │   │   │   ├── box-stocks/                # Box Stock Tracking
│       │   │   │   ├── boxes/                     # Box Management
│       │   │   │   ├── cost-approvals/            # Cost Approval Workflow
│       │   │   │   ├── customers/                 # Customer Management
│       │   │   │   ├── dashboard/                 # Main Dashboard
│       │   │   │   ├── finished-goods-stocks/     # FG Stock Management
│       │   │   │   ├── inventory-dashboard/       # Inventory Stats
│       │   │   │   ├── invoices/                  # Invoice Management
│       │   │   │   ├── product-conversions/       # Product Conversion
│       │   │   │   ├── product-prices/            # Pricing Management
│       │   │   │   ├── production/                # Production Planning
│       │   │   │   ├── production-costs/          # Production Costs
│       │   │   │   ├── products/                  # Product Catalog
│       │   │   │   ├── raw-material-stocks/       # RM Stock Management
│       │   │   │   ├── raw-materials/             # Raw Material Catalog
│       │   │   │   ├── reports/                   # Reports & Charts
│       │   │   │   ├── sales-dashboard/           # Sales Statistics
│       │   │   │   └── settings/                  # System Settings
│       │   │   │
│       │   │   ├── layout/
│       │   │   │   ├── footer/                    # Footer Component
│       │   │   │   ├── header/                    # Header Component
│       │   │   │   ├── main-layout/               # Main Layout
│       │   │   │   └── sidebar/                   # Sidebar Navigation
│       │   │   │
│       │   │   ├── shared/
│       │   │   │   ├── components/                # Reusable Components
│       │   │   │   ├── directives/                # Custom Directives
│       │   │   │   ├── models/                    # Shared Models/Interfaces
│       │   │   │   ├── pipes/                     # Custom Pipes
│       │   │   │   └── utils/                     # Shared Utilities
│       │   │
│       │   ├── assets/
│       │   │   └── images/                        # Static Images
│       │   │
│       │   ├── environments/
│       │   │   ├── environment.ts                 # Development Config
│       │   │   └── environment.prod.ts            # Production Config
│       │   │
│       │   ├── styles/
│       │   │   ├── action-buttons.css             # Common Button Styles
│       │   │   └── styles.css                     # Global Styles
│       │   │
│       │   ├── index.html                         # HTML Entry Point
│       │   ├── main.ts                            # TypeScript Entry Point
│       │   └── styles.css                         # Global Stylesheet
│       │
│       ├── src/app/features/[module]/
│       │   ├── components/
│       │   │   ├── list/                          # Data List View
│       │   │   ├── form/                          # Form/Create Component
│       │   │   └── detail/                        # Detail View
│       │   ├── services/
│       │   │   └── [module].service.ts            # Module Service
│       │   ├── models/
│       │   │   └── [module].model.ts              # Module Models
│       │   └── [module].routes.ts                 # Module Routes
│       │
│       ├── angular.json                           # Angular CLI Config
│       ├── tsconfig.json                          # TypeScript Config
│       ├── tsconfig.app.json                      # App TypeScript Config
│       ├── tsconfig.spec.json                     # Test TypeScript Config
│       ├── package.json                           # npm Dependencies
│       └── README.md                              # Frontend README
│
└── README.md                                       # Project README
```

---

## Database Design

### Entity-Relationship Diagram Overview

The system manages multiple entities with relationships:

```
Users                    │
  ├─ id (PK)            │
  ├─ username           │    Roles
  ├─ email              │    ├─ ADMIN
  ├─ password_hash      │    ├─ MANAGER
  ├─ role               │────┤─ SUPERVISOR
  └─ is_active          │    ├─ OPERATOR
                        │    └─ VIEWER
                        │
Products                │    Raw Materials
  ├─ id (PK)           │    ├─ id (PK)
  ├─ code              │    ├─ name
  ├─ name              │    ├─ unit_price
  ├─ description       │    ├─ quantity_in_stock
  ├─ category          │    └─ reorder_level
  ├─ price             │
  ├─ unit_type         │    Boxes
  └─ is_active         │    ├─ id (PK)
                       │    ├─ box_code
Customers              │    ├─ dimensions
  ├─ id (PK)          │    ├─ capacity
  ├─ name             │    ├─ unit_cost
  ├─ contact_person  │    └─ current_stock
  ├─ email            │
  ├─ phone            │    Invoices
  ├─ address          │    ├─ id (PK)
  └─ is_active        │    ├─ invoice_no
                      │    ├─ customer_id (FK)
Production            │    ├─ total_amount
  ├─ id (PK)         │    ├─ invoice_date
  ├─ product_id (FK) │    └─ status
  ├─ quantity        │
  ├─ start_date      │    Cost Approvals
  ├─ end_date        │    ├─ id (PK)
  ├─ status          │    ├─ production_id (FK)
  └─ notes           │    ├─ cost_amount
                     │    ├─ status
```

### Key Tables

1. **users** - User accounts and authentication
2. **products** - Product catalog with pricing
3. **raw_materials** - Raw material inventory
4. **boxes** - Packaging materials
5. **customers** - Customer information
6. **production** - Production run records
7. **production_costs** - Associated costs
8. **invoices** - Customer invoicing
9. **cost_approvals** - Approval workflows
10. **raw_material_stocks** - Stock levels for RM
11. **finished_goods_stocks** - FG inventory tracking
12. **box_stocks** - Box inventory tracking
13. **product_conversions** - Unit conversions
14. **product_prices** - Historical pricing

---

## Backend System

### Backend Architecture

The backend follows a **layered architecture** pattern:

```
┌───────────────────────────────────────┐
│  Controller Layer (REST Endpoints)   │
│  @RestController, @RequestMapping     │
└────────────────┬──────────────────────┘
                 │ Receives HTTP Requests
                 ▼
┌───────────────────────────────────────┐
│  Service Layer (Business Logic)      │
│  @Service - Contains core logic       │
└────────────────┬──────────────────────┘
                 │ Processing & Validation
                 ▼
┌───────────────────────────────────────┐
│  Repository Layer (Data Access)      │
│  @Repository - connects to database   │
└────────────────┬──────────────────────┘
                 │ CRUD Operations
                 ▼
┌───────────────────────────────────────┐
│  Database Layer (PostgreSQL)          │
│  Persists and retrieves data         │
└───────────────────────────────────────┘
```

### Key Backend Components

#### 1. **Controllers** (REST Endpoints)

Controllers handle HTTP requests and responses:

```java
@RestController
@RequestMapping("/inventory/api/products")
public class ProductController {
    @GetMapping
    public List<Product> getAllProducts() { }
    
    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) { }
    
    @PostMapping
    public Product createProduct(@RequestBody ProductDTO dto) { }
    
    @PutMapping("/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody ProductDTO dto) { }
    
    @DeleteMapping("/{id}")
    public void deleteProduct(@PathVariable Long id) { }
}
```

**Main Controllers:**
- ProductController - Product management
- RawMaterialController - Raw material operations
- BoxController - Packaging management
- CustomerController - Customer data
- InvoiceController - Invoice generation
- ProductionController - Production planning
- CostApprovalController - Cost approval workflow
- ReportController - Report generation
- UserController - User management

#### 2. **Services** (Business Logic)

Services contain the core business logic:

```java
@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public Product createProduct(ProductDTO dto) {
        // Validation
        // Business Logic
        // Database Save
        return productRepository.save(product);
    }
}
```

**Main Services:**
- ProductService - Product operations
- InventoryService - Stock management
- InvoiceService - Invoice generation & calculation
- ProductionService - Production workflows
- CostApprovalService - Approval processing
- ReportService - Report generation
- AuthService - Authentication logic
- UserService - User management

#### 3. **Repositories** (Data Access)

Repositories handle database queries:

```java
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
    Product findByCode(String code);
    List<Product> findByIsActive(Boolean isActive);
}
```

**Main Repositories:**
- ProductRepository
- RawMaterialRepository
- InventoryRepository
- InvoiceRepository
- ProductionRepository
- UserRepository
- CostApprovalRepository

#### 4. **Entities** (Data Models)

Entities represent database tables:

```java
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String code;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    private String category;
    
    @Column(name = "is_active", columnDefinition = "boolean default true")
    private Boolean isActive;
    
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private LocalDateTime createdAt;
}
```

#### 5. **DTOs** (Data Transfer Objects)

DTOs format data for API requests/responses:

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDTO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
}
```

#### 6. **Security Configuration**

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) {
        http
            .csrf().disable()
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/inventory/auth/**").permitAll()
                .requestMatchers("/inventory/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### Application Configuration (application.yml)

```yaml
server:
  port: 9090
  servlet:
    context-path: /inventory

spring:
  application:
    name: InventoryManagement
  
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:postgresql://localhost:5432/inventory}
    username: ${SPRING_DATASOURCE_USERNAME:postgres}
    password: ${SPRING_DATASOURCE_PASSWORD}
    driver-class-name: org.postgresql.Driver
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
    properties:
      hibernate:
        dialect: org.hibernate.dialect.PostgreSQLDialect

jwt:
  secret: ${JWT_SECRET}
  expiry: 3600000  # 1 hour
```

---

## Frontend System

### Frontend Architecture

The frontend uses **Angular with component-based architecture** and **state management with NgRx**:

```
┌──────────────────────────────────────┐
│   User Interface (Components)       │
│   ├─ Dashboard Component            │
│   ├─ Product List Component         │
│   ├─ Form Components                │
│   └─ Report Components              │
└────────────────┬─────────────────────┘
                 │ User Actions
                 ▼
┌──────────────────────────────────────┐
│   NgRx Store (State Management)     │
│   ├─ Actions                         │
│   ├─ Reducers                        │
│   ├─ Selectors                       │
│   └─ Effects                         │
└────────────────┬─────────────────────┘
                 │ Dispatches Effects
                 ▼
┌──────────────────────────────────────┐
│   Services (Business Logic)          │
│   ├─ HTTP Services                   │
│   ├─ API Service                     │
│   └─ Local Storage Service           │
└────────────────┬─────────────────────┘
                 │ API Calls
                 ▼
┌──────────────────────────────────────┐
│   Backend REST API                   │
│   (Spring Boot Endpoints)            │
└──────────────────────────────────────┘
```

### Key Frontend Components

#### 1. **AppComponent** (Root Component)

```typescript
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Way2Care Inventory';
  
  constructor(private authService: AuthService) {}
  
  ngOnInit() {
    this.authService.checkAuthStatus();
  }
}
```

#### 2. **Routing Configuration** (app.routes.ts)

```typescript
export const APP_ROUTES: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/components/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/products/components/product-list.component')
          .then(m => m.ProductListComponent)
      },
      {
        path: 'invoices',
        loadComponent: () => import('./features/invoices/components/invoice-list.component')
          .then(m => m.InvoiceListComponent)
      }
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/components/login.component')
      .then(m => m.LoginComponent)
  }
];
```

#### 3. **Services** (API Communication)

```typescript
@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = '/inventory/api/products';
  
  constructor(private http: HttpClient) {}
  
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }
  
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }
  
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }
  
  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }
  
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

#### 4. **Components Structure** (Feature Modules)

Each feature follows this structure:

```
feature/
├── components/
│   ├── list/
│   │   ├── feature-list.component.ts
│   │   ├── feature-list.component.html
│   │   └── feature-list.component.css
│   ├── form/
│   │   ├── feature-form.component.ts
│   │   ├── feature-form.component.html
│   │   └── feature-form.component.css
│   └── detail/
│       ├── feature-detail.component.ts
│       ├── feature-detail.component.html
│       └── feature-detail.component.css
├── services/
│   └── feature.service.ts
├── models/
│   └── feature.model.ts
└── feature.routes.ts
```

#### 5. **NgRx State Management**

```typescript
// Actions
export const loadProducts = createAction(
  '[Product] Load Products'
);

export const loadProductsSuccess = createAction(
  '[Product] Load Products Success',
  props<{ products: Product[] }>()
);

// Reducer
const initialState: ProductState = {
  products: [],
  loading: false,
  error: null
};

export const productReducer = createReducer(
  initialState,
  on(loadProducts, state => ({ ...state, loading: true })),
  on(loadProductsSuccess, (state, { products }) => ({
    ...state,
    products,
    loading: false
  }))
);

// Selectors
export const selectProducts = createSelector(
  selectProductState,
  (state: ProductState) => state.products
);

// Effects
@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProducts),
      switchMap(() =>
        this.productService.getProducts().pipe(
          map(products => loadProductsSuccess({ products }))
        )
      )
    )
  );
}
```

#### 6. **HTTP Interceptor** (JWT Authentication)

```typescript
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(request);
  }
}
```

### UI Components Hierarchy

```
AppComponent
├── MainLayoutComponent
│   ├── HeaderComponent
│   ├── SidebarComponent
│   ├── Main Content Area
│   │   └── Router Outlet (Page Components)
│   └── FooterComponent
│
Feature Pages Examples:
├── DashboardComponent
│   ├── StatisticsChartComponent
│   ├── InventoryStatusComponent
│   └── RecentTransactionsComponent
│
├── ProductListComponent
│   ├── SearchFilterComponent
│   ├── DataTableComponent
│   └── ActionButtonsComponent
│
├── ProductFormComponent
│   ├── InputFieldComponent (repeated)
│   ├── SelectDropdownComponent
│   ├── ValidationErrorComponent
│   └── SubmitButtonComponent
│
└── ReportComponent
    ├── FilterComponent
    ├── ChartComponent (Chart.js)
    └── ExportButtonComponent
```

---

## Core Features

### 1. **Authentication & Authorization**

The system implements JWT-based authentication:

**Login Flow:**
```
1. User enters username/password
2. Frontend sends credentials to /auth/login
3. Backend validates credentials
4. Backend generates JWT token
5. Frontend stores token in localStorage
6. Frontend includes token in all API requests
7. Backend validates token in requests
8. Access granted if token valid
```

**Roles:**
- **ADMIN**: Full system access, user management
- **MANAGER**: Can approve costs, view reports
- **SUPERVISOR**: Can create production records, manage inventory
- **OPERATOR**: Can enter data, view reports
- **VIEWER**: Read-only access

### 2. **Inventory Management**

Tracks three types of inventory:

**Raw Materials Inventory**
- Incoming raw material purchases
- Stock level tracking
- Reorder point management
- Supplier information
- Historical data

**Box Inventory**
- Packaging material tracking
- Box types and capacities
- Cost per unit
- Current stock levels
- Reorder management

**Finished Goods Inventory**
- Completed product tracking
- Stock levels
- Warehouse location
- Expiry date tracking
- Quick movement metrics

### 3. **Production Management**

**Production Process:**
```
1. Create Production Order
   ├─ Select Product
   ├─ Enter Quantity
   ├─ Set Timeline
   └─ Assign Resources

2. Track Production
   ├─ Monitor Progress
   ├─ Record Issues
   ├─ Update Status
   └─ Log Costs

3. Complete Production
   ├─ Record Actual Costs
   ├─ Submit for Approval
   ├─ Update FG Stock
   └─ Close Order
```

### 4. **Cost Approval Workflow**

**Approval Process:**
```
Production Costs Submitted
    ↓
Manager Reviews
    ├─ Approve
    │   ├─ Cost finalized
    │   └─ Production closed
    └─ Reject
        ├─ Send back for revision
        └─ Production pending
```

### 5. **Invoicing System**

**Invoice Generation:**
- Select customer
- Add billable items
- Calculate totals with tax
- Generate PDF
- Email to customer
- Track payment status

**Invoice Features:**
- Invoice numbering system
- Item-wise costing
- Tax calculation
- Discount options
- Payment terms
- Delivery tracking

### 6. **Reporting & Analytics**

**Available Reports:**
- **Inventory Reports**: Stock levels, movement history
- **Sales Reports**: Revenue by period, customer
- **Production Reports**: Output, costs, efficiency
- **Financial Reports**: Total revenue, expenses
- **Trend Analysis**: Historical data trends

**Dashboard Displays:**
- Key Performance Indicators (KPIs)
- Graphical representations (Chart.js)
- Real-time inventory status
- Recent transactions
- Alerts and notifications

### 7. **Product Management**

**Product Operations:**
- Create product catalog
- Set pricing
- Define units (kg, boxes, pieces)
- Categorize products
- Track active/inactive status

**Product Conversions:**
- Convert units (e.g., 1kg to 2 boxes)
- Manage recipe/formulations
- Track ingredient consumption

### 8. **Customer Management**

**Customer Data:**
- Contact information
- Billing address
- Payment history
- Order history
- Communication preferences

### 9. **Settings & Configuration**

**System Settings:**
- Company information
- Tax configurations
- Invoice templates
- Email settings
- Notification preferences
- System parameters

---

## Setup and Installation

### Prerequisites

#### For Backend Development:
- Java Development Kit (JDK) 17 or higher
- Maven 3.6 or higher
- PostgreSQL 12 or higher

#### For Frontend Development:
- Node.js 18 or higher
- npm 9 or higher

#### For Both:
- Git
- VS Code or IntelliJ IDEA
- Postman (for API testing)

### Step 1: Clone the Repository

```bash
git clone https://github.com/way2care/inventory-management.git
cd inventory-management
```

### Step 2: Database Setup

1. **Install PostgreSQL:**
   - Download from https://www.postgresql.org/
   - Install and run PostgreSQL service

2. **Create Database:**
   ```sql
   CREATE DATABASE inventory;
   CREATE USER postgres WITH PASSWORD '<your-local-database-password>';
   GRANT ALL PRIVILEGES ON DATABASE inventory TO postgres;
   ```

3. **Verify Connection:**
   ```bash
   psql -h localhost -U postgres -d inventory
   ```

### Step 3: Backend Setup

```bash
cd backend/inventory-management

# Install dependencies
mvn clean install

# Build the project
mvn clean package

# Run the application
mvn spring-boot:run

# Or run the JAR
java -jar target/inventory-management-0.0.1-SNAPSHOT.jar
```

**Backend will start at:** `http://localhost:9090/inventory`

### Step 4: Frontend Setup

```bash
cd frontend/inventory

# Install dependencies
npm install

# Start development server
npm start

# Or use ng CLI
ng serve
```

**Frontend will start at:** `http://localhost:4200`

### Step 5: Access the Application

1. Open browser to `http://localhost:4200`
2. Default credentials (create or configure):
   - Username: `admin`
   - Password: `admin123` (change in production)
3. Dashboard should load successfully

---

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend/inventory-management
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend/inventory
npm start
```

**In Browser:**
Navigate to `http://localhost:4200`

### Production Mode

**Backend:**
```bash
cd backend/inventory-management
mvn clean package -DskipTests
java -jar target/inventory-management-0.0.1-SNAPSHOT.jar \
  --spring.profiles.active=prod \
  --spring.datasource.url=jdbc:postgresql://prod-server:5432/inventory \
  --spring.datasource.username=prod_user \
  --spring.datasource.password=prod_password
```

**Frontend:**
```bash
cd frontend/inventory
ng build --configuration production
# Deploy the dist/inventory folder to a web server
```

### Testing

**Backend Unit Tests:**
```bash
cd backend/inventory-management
mvn test
mvn test -Dtest=ProductServiceTest
```

**Frontend Unit Tests:**
```bash
cd frontend/inventory
npm test
ng test
```

---

## API Documentation

### Base URL
```
http://localhost:9090/inventory/api
```

### Authentication

All endpoints (except `/auth/*`) require JWT token in header:

```
Authorization: Bearer <jwt_token>
```

### Main API Endpoints

#### Authentication
```
POST   /auth/login              → Login and get JWT token
POST   /auth/logout             → Logout
POST   /auth/refresh            → Refresh token
GET    /auth/validate-token     → Validate current token
```

#### Products
```
GET    /products                → Get all products
GET    /products/{id}           → Get product by ID
GET    /products/code/{code}    → Get product by code
POST   /products                → Create new product
PUT    /products/{id}           → Update product
DELETE /products/{id}           → Delete product
```

#### Raw Materials
```
GET    /raw-materials           → Get all raw materials
GET    /raw-materials/{id}      → Get by ID
POST   /raw-materials           → Create new
PUT    /raw-materials/{id}      → Update
DELETE /raw-materials/{id}      → Delete
GET    /raw-materials/stock/all → Get current stock levels
```

#### Boxes
```
GET    /boxes                   → Get all boxes
GET    /boxes/{id}              → Get by ID
POST   /boxes                   → Create new
PUT    /boxes/{id}              → Update
DELETE /boxes/{id}              → Delete
GET    /boxes/stock/{id}        → Get box stock level
```

#### Customers
```
GET    /customers               → Get all customers
GET    /customers/{id}          → Get by ID
POST   /customers               → Create new
PUT    /customers/{id}          → Update
DELETE /customers/{id}          → Delete
```

#### Invoices
```
GET    /invoices                → Get all invoices
GET    /invoices/{id}           → Get by ID
POST   /invoices                → Create new
PUT    /invoices/{id}           → Update
DELETE /invoices/{id}           → Delete
GET    /invoices/{id}/pdf       → Download invoice as PDF
POST   /invoices/{id}/send      → Send invoice via email
```

#### Production
```
GET    /production              → Get all production orders
GET    /production/{id}         → Get by ID
POST   /production              → Create new
PUT    /production/{id}         → Update status
DELETE /production/{id}         → Delete
GET    /production/{id}/costs   → Get associated costs
```

#### Cost Approvals
```
GET    /cost-approvals          → Get all approvals
GET    /cost-approvals/{id}     → Get by ID
POST   /cost-approvals          → Submit for approval
PUT    /cost-approvals/{id}     → Approve/Reject
```

#### Reports
```
GET    /reports/inventory       → Inventory report
GET    /reports/sales           → Sales report
GET    /reports/production      → Production report
GET    /reports/financial       → Financial report
GET    /reports/pdf             → Generate PDF report
```

#### Users
```
GET    /users                   → Get all users
GET    /users/{id}              → Get by ID
POST   /users                   → Create new user
PUT    /users/{id}              → Update user
DELETE /users/{id}              → Delete user
PUT    /users/{id}/password     → Change password
```

### Example API Calls

**Login:**
```bash
curl -X POST http://localhost:9090/inventory/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": 1,
    "username": "admin",
    "role": "ADMIN"
  }
}
```

**Get Products:**
```bash
curl -X GET http://localhost:9090/inventory/api/products \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Create Product:**
```bash
curl -X POST http://localhost:9090/inventory/api/products \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PROD001",
    "name": "Product Name",
    "description": "Description",
    "price": 100.00,
    "category": "Category1"
  }'
```

---

## Key Workflows

### Workflow 1: Complete Production Cycle

```
1. CREATE PRODUCTION ORDER
   ├─ Manager selects product
   ├─ Enters quantity needed
   ├─ Sets production timeline
   └─ Status: PENDING

2. PRODUCTION PLANNING
   ├─ Assign resources/team
   ├─ Schedule shifts
   ├─ Status: PLANNED

3. PRODUCTION EXECUTION
   ├─ Start production
   ├─ Monitor progress
   ├─ Record issues
   ├─ Update raw material consumption
   └─ Status: IN_PROGRESS

4. PRODUCTION COMPLETION
   ├─ Mark as complete
   ├─ Record actual output
   ├─ Verify quality
   └─ Status: COMPLETED

5. COST RECORDING
   ├─ Enter production costs
   ├─ Record material costs
   ├─ Record labor costs
   ├─ Add overhead
   └─ Submit for approval

6. COST APPROVAL
   ├─ Manager reviews costs
   ├─ Approves or rejects
   ├─ If approved:
   │   ├─ Production order closed
   │   └─ FG stock updated
   └─ If rejected:
       └─ Send back to operator

7. INVENTORY UPDATE
   ├─ Increase FG stock
   ├─ Decrease RM stock
   ├─ Update box inventory
   └─ Status: CLOSED
```

### Workflow 2: Invoice Generation & Payment

```
1. CUSTOMER ORDER RECEIVED
   ├─ Select customer
   ├─ Select products/items
   ├─ Enter quantities
   └─ Status: DRAFT

2. INVOICE CALCULATION
   ├─ Calculate item totals
   ├─ Apply discounts (if any)
   ├─ Add tax
   ├─ Calculate final total
   └─ Status: PENDING

3. INVOICE GENERATION
   ├─ Assign invoice number
   ├─ Set invoice date
   ├─ Set payment terms
   ├─ Generate PDF
   └─ Status: GENERATED

4. INVOICE DISTRIBUTION
   ├─ Email to customer
   ├─ Print hard copy
   ├─ Save in system
   └─ Status: SENT

5. PAYMENT TRACKING
   ├─ Customer makes payment
   ├─ Update payment status
   ├─ Reconcile accounts
   └─ Status: PAID

6. REPORTING
   ├─ Record in financial reports
   ├─ Update revenue metrics
   └─ Close invoice
```

### Workflow 3: Cost Approval Process

```
1. PRODUCTION COST ENTRY
   ├─ Operator records costs
   ├─ Details entered:
   │   ├─ Material costs
   │   ├─ Labor costs
   │   └─ Overhead
   └─ Status: SUBMITTED

2. COST REVIEW
   ├─ Manager receives notification
   ├─ Reviews cost details
   ├─ Verifies against budget
   ├─ Checks for anomalies
   └─ Status: UNDER_REVIEW

3. APPROVAL DECISION
   ├─ If costs acceptable:
   │   ├─ Approve
   │   ├─ Add comments
   │   └─ Submit approval
   ├─ If costs need revision:
   │   ├─ Request changes
   │   ├─ Send back to operator
   │   └─ Status: REJECTED
   └─ Status: APPROVED

4. FINAL PROCESSING
   ├─ Close production order
   ├─ Update financial records
   ├─ Archive cost data
   ├─ Generate cost report
   └─ Status: FINALIZED
```

---

## Security

### Authentication

**JWT Implementation:**
- Token generated on successful login
- Token valid for 1 hour (configurable)
- Token includes user ID, username, role
- Refresh token mechanism available
- Token validated on every API request

```yaml
jwt:
  secret: ${JWT_SECRET}
  expiry: 3600000  # 1 hour
```

### Authorization

**Role-Based Access Control (RBAC):**

```
ADMIN Role:
  ├─ All user management
  ├─ System configuration
  ├─ All reports
  ├─ Batch operations
  └─ Audit logs

MANAGER Role:
  ├─ Approve costs
  ├─ View all reports
  ├─ Create customers
  ├─ Manage invoicing
  └─ View dashboard

SUPERVISOR Role:
  ├─ Create production orders
  ├─ Manage inventory
  ├─ Record costs
  ├─ View reports (limited)
  └─ View dashboard

OPERATOR Role:
  ├─ Data entry
  ├─ View own entries
  ├─ Limited reports
  └─ Basic dashboard

VIEWER Role:
  ├─ Read-only access
  ├─ View reports
  ├─ View dashboard
  └─ No modifications
```

### Data Security

**Password Security:**
- Passwords hashed using BCrypt
- Minimum 8 characters required
- Salt added to each password
- Password change enforced periodically

**Data Encryption:**
- Sensitive data encrypted at rest
- HTTPS recommended for production
- Database credentials encrypted

**API Security:**
- CORS enabled for approved domains
- Input validation on all endpoints
- SQL injection prevention (JPA)
- XSS protection headers

### Audit & Logging

**Logged Operations:**
- User login/logout
- Data creation/modification/deletion
- Cost approvals
- Invoice generation
- Invoice payments
- Production events
- System configuration changes

**Log Storage:**
- Database or file system
- Timestamp on all entries
- User ID recorded
- Action details logged
- IP address tracked (optional)

---

## Performance Considerations

### Backend Performance

**Database Optimization:**
- Indexes on frequently queried columns
- Connection pooling (HikariCP)
- Query optimization with JPA
- Lazy loading for related entities
- Pagination for large datasets

**Business Logic:**
- Cache frequently accessed data
- Batch operations where possible
- Asynchronous processing for heavy tasks
- Queue-based processing for reports

**Server Tuning:**
- JVM heap size configuration
- Garbage collection tuning
- Thread pool configuration
- Database connection limits

### Frontend Performance

**Code Optimization:**
- Lazy loading of modules
- Tree-shaking to remove unused code
- AOT (Ahead-of-Time) compilation
- Bundle size optimization
- Code splitting by route

**Asset Optimization:**
- Image compression
- Minification of CSS/JS
- Gzip compression
- CDN for static assets
- Cache-busting strategies

**Runtime Performance:**
- OnPush change detection
- Virtual scrolling for large lists
- Debouncing of search inputs
- Pagination for lists
- Lazy loading of data

### Scalability

**Horizontal Scaling:**
- Stateless API servers
- Load balancer for multiple instances
- Database replication
- Session management

**Caching Strategy:**
- Redis for session cache
- Client-side caching
- API response caching
- Browser caching

---

## Troubleshooting

### Common Backend Issues

#### Issue: Backend won't start
**Solution:**
```
1. Check Java version: java -version
   Should be 17 or higher

2. Check PostgreSQL is running:
   psql -U postgres -d inventory

3. Check database connection:
   Verify application.yml settings

4. Check ports:
   Port 9090 must be available
   netstat -ano | findstr :9090

5. Check Maven build:
   mvn clean install
   Look for compilation errors
```

#### Issue: Database connection refused
**Solution:**
```
1. Start PostgreSQL service
2. Verify database 'inventory' exists
3. Check username/password in application.yml
4. Test connection: 
   psql -h localhost -U postgres -d inventory
```

#### Issue: JWT token invalid
**Solution:**
```
1. Check token expiry (1 hour default)
2. Verify secret key in configuration
3. Refresh token: POST /auth/refresh
4. Login again to get new token
```

### Common Frontend Issues

#### Issue: CORS errors in browser console
**Solution:**
```
1. Check backend CORS configuration
2. Request API from correct domain
3. Check Authorization header
4. Verify token format: Bearer <token>
```

#### Issue: Components not loading
**Solution:**
```
1. Check browser console for errors
2. Verify route configuration
3. Check lazy loading settings
4. Clear browser cache (Ctrl+Shift+Delete)
5. Check network tab for API failures
```

#### Issue: Data not displaying
**Solution:**
```
1. Check API response in Network tab
2. Verify NgRx store state
3. Check component subscription
4. Look for HTTP interceptor issues
5. Check authentication token validity
```

### Common Database Issues

#### Issue: Out of disk space
**Solution:**
```sql
-- Check database size
SELECT pg_database.datname, 
  pg_size_pretty(pg_database_size(pg_database.datname)) 
FROM pg_database;

-- Check table sizes
SELECT schemaname, tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) 
FROM pg_tables 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Archive old data
DELETE FROM production_costs WHERE created_at < NOW() - INTERVAL '1 year';
```

#### Issue: Slow queries
**Solution:**
```sql
-- Enable query logging
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Check inefficient queries
EXPLAIN ANALYZE SELECT * FROM products WHERE category = 'X';

-- Create needed indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
```

### Recovery Procedures

#### Database Backup
```bash
pg_dump -U postgres -d inventory > backup_$(date +%Y%m%d).sql
```

#### Database Restore
```bash
psql -U postgres -d inventory < backup_20240101.sql
```

#### Clear Application Cache
```bash
# Frontend
npm run build --prod

# Backend
mvn clean install -DskipTests
```

---

## Conclusion

The Way2Care Inventory Management System is a comprehensive, enterprise-grade solution for managing inventory, production, and billing operations. It provides a modern, scalable architecture with:

- **Robust Backend**: Spring Boot with JWT security, JPA for ORM, comprehensive business logic
- **Rich Frontend**: Angular with state management, responsive design, real-time dashboards
- **Reliable Database**: PostgreSQL with proper schema design and relationships
- **Security**: Role-based access control, encrypted passwords, audit logging
- **Scalability**: Horizontal scaling capabilities, caching strategies, performance optimization
- **Maintainability**: Clean architecture, comprehensive documentation, error handling

This system can be deployed in production environments, scaled horizontally, and extended with additional features as needed.

---

**Document Version:** 2.0  
**Created:** September 29, 2026  
**Last Updated:** November 15, 2026  
**Project Name:** Inventory Management System
