import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const passwordChangeGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Check if password change is required
  const passwordChangeRequired = authService.isPasswordChangeRequired();

  // If on change-password route and it's required or optional, allow
  if (state.url === '/change-password') {
    return true;
  }

  // If trying to access other routes but password change is required
  if (passwordChangeRequired) {
    router.navigate(['/change-password']);
    return false;
  }

  // Allow access to other routes if password change is not required
  return true;
};
