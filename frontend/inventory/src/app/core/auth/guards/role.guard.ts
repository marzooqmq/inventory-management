import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const allowedRoles = route.data['roles'] as string[];
  const user = authService.getCurrentUser();
  
  if (!user || !user.role) {
    router.navigate(['/dashboard']);
    return false;
  }

  // Check if user's role is in the allowed roles list
  const hasRole = allowedRoles.some(role => 
    user.role?.toUpperCase() === role.toUpperCase()
  );

  if (hasRole) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
