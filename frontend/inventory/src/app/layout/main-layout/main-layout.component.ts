import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { ReportSwitcherComponent } from '../../features/reports/report-switcher/report-switcher.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastModule,
    HeaderComponent,
    SidebarComponent,
    ReportSwitcherComponent
  ],
  providers: [MessageService],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent {
  isSidebarCollapsed = false;

  constructor(public router: Router) {}

  onSidebarCollapsedChange(collapsed: boolean): void {
    this.isSidebarCollapsed = collapsed;
  }
}

export default MainLayoutComponent;
