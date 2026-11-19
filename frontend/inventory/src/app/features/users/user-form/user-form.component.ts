import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { PasswordModule } from 'primeng/password';
import { CardModule } from 'primeng/card';
import { RippleModule } from 'primeng/ripple';
import { UserService } from '../services/user.service';
import { UserRole, getRoleDisplayName } from '../models/user.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    PasswordModule,
    CardModule,
    RippleModule,
    PageHeaderComponent
  ],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css'
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  userId: number | null = null;
  isEditMode = false;
  loading = false;
  submitting = false;

  roleOptions = [
    { label: getRoleDisplayName(UserRole.ADMIN), value: UserRole.ADMIN },
    { label: getRoleDisplayName(UserRole.PRODUCTION_MANAGER), value: UserRole.PRODUCTION_MANAGER },
    { label: getRoleDisplayName(UserRole.ACCOUNTANT), value: UserRole.ACCOUNTANT }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.userId = +params['id'];
        this.isEditMode = true;
        this.loadUser();
      }
    });
  }

  initForm(): void {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: [null, Validators.required]
    });

    // Add password match validator
    this.userForm.get('confirmPassword')?.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
    });
    this.userForm.get('password')?.valueChanges.subscribe(() => {
      this.checkPasswordMatch();
    });
  }

  checkPasswordMatch(): void {
    const password = this.userForm.get('password')?.value;
    const confirmPassword = this.userForm.get('confirmPassword')?.value;
    
    if (confirmPassword && password !== confirmPassword) {
      this.userForm.get('confirmPassword')?.setErrors({ mismatch: true });
    }
  }

  loadUser(): void {
    if (!this.userId) return;

    this.loading = true;
    this.userService.getById(this.userId).subscribe({
      next: (user) => {
        // In edit mode, only role can be updated
        this.userForm.patchValue({
          username: user.username,
          role: user.role
        });

        // Disable username and password fields in edit mode
        this.userForm.get('username')?.disable();
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('confirmPassword')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
        this.userForm.get('confirmPassword')?.updateValueAndValidity();

        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.submitting = true;

    if (this.isEditMode && this.userId) {
      // Update only role
      const updateData = {
        role: this.userForm.get('role')?.value
      };

      this.userService.update(this.userId, updateData).subscribe({
        next: () => {
          setTimeout(() => this.router.navigate(['/users']), 1000);
        },
        error: (error) => {
          this.submitting = false;
        }
      });
    } else {
      // Create new user
      const userData = {
        username: this.userForm.get('username')?.value,
        password: this.userForm.get('password')?.value,
        role: this.userForm.get('role')?.value
      };

      this.userService.create(userData).subscribe({
        next: () => {
          setTimeout(() => this.router.navigate(['/users']), 1000);
        },
        error: (error) => {
          this.submitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (!field || !field.errors) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['minlength']) {
      return `Minimum length is ${field.errors['minlength'].requiredLength}`;
    }
    if (field.errors['mismatch']) return 'Passwords do not match';

    return 'Invalid value';
  }
}
