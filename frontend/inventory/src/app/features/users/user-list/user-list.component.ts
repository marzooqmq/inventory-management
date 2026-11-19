import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService } from 'primeng/api';
import { UserService } from '../services/user.service';
import { User, UserRole, getRoleDisplayName, getRoleSeverity } from '../models/user.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    PageHeaderComponent,
    ConfirmDialogComponent
  ],
  providers: [ConfirmationService],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css'
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  loading = false;
  searchQuery = '';

  constructor(
    private userService: UserService,
    private router: Router,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }

  onAddUser(): void {
    this.router.navigate(['/users/new']);
  }

  onEditUser(id: number): void {
    this.router.navigate(['/users/edit', id]);
  }

  onSearch(): void {
    if (!this.searchQuery?.trim()) {
      this.filteredUsers = this.users;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.username.toLowerCase().includes(query) ||
      getRoleDisplayName(user.role).toLowerCase().includes(query)
    );
  }

  getRoleDisplay(role: UserRole): string {
    return getRoleDisplayName(role);
  }

  getRoleSeverity(role: UserRole): string {
    return getRoleSeverity(role);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
