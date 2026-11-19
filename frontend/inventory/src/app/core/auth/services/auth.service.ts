import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { User, LoginRequest, LoginResponse, ChangePasswordRequest } from '../models/user.model';
import { environment } from '../../../../environments/environment';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('auth/login', credentials).pipe(
      tap(response => {
        this.setSession(response);
      })
    );
  }

  logout(): void {
    const token = this.getToken();
    
    if (token) {
      // Call backend logout API to blacklist the token
      this.apiService.post('auth/logout', {}).subscribe({
        next: () => {
          this.clearSession();
        },
        error: () => {
          // Even if API fails, clear local session for security
          this.clearSession();
        }
      });
    } else {
      this.clearSession();
    }
  }

  private clearSession(): void {
    localStorage.removeItem(environment.tokenKey);
    localStorage.removeItem(environment.userKey);
    localStorage.removeItem(environment.passwordChangeRequiredKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  changePassword(request: ChangePasswordRequest): Observable<string> {
    return this.apiService.postText('users/change-password', request).pipe(
      tap((response: string) => {
        // Password changed successfully, set passwordChanged to true
        this.setPasswordChanged(true);
        // If backend returns a new token (though it seems to return text message)
        // Check if response looks like a JWT token
        if (response && response.split('.').length === 3) {
          localStorage.setItem(environment.tokenKey, response);
        }
      })
    );
  }

  isPasswordChangeRequired(): boolean {
    const changed = localStorage.getItem(environment.passwordChangeRequiredKey);
    // If passwordChanged is 'true', password change is NOT required
    // If passwordChanged is 'false', password change IS required
    // If null/undefined, treat as not required (safe default)
    if (changed === null || changed === 'null' || changed === 'undefined') {
      return false;
    }
    return changed === 'false';
  }

  setPasswordChanged(changed: boolean): void {
    localStorage.setItem(environment.passwordChangeRequiredKey, String(changed));
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    return !this.isTokenExpired(token);
  }

  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  private setSession(response: LoginResponse): void {
    localStorage.setItem(environment.tokenKey, response.token);
    
    // If user object is provided in response, use it
    if (response.user) {
      localStorage.setItem(environment.userKey, JSON.stringify(response.user));
      this.currentUserSubject.next(response.user);
    } else {
      // Otherwise, try to extract user info from JWT token
      try {
        const decoded: any = jwtDecode(response.token);
        const user: User = {
          id: decoded.userId || decoded.id || 0,
          username: decoded.sub || decoded.username || 'User',
          email: decoded.email || '',
          fullName: decoded.fullName || decoded.name || '',
          role: decoded.role || decoded.authorities?.[0] || 'Role'
        };
        localStorage.setItem(environment.userKey, JSON.stringify(user));
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
    
    // Store passwordChanged flag from backend
    this.setPasswordChanged(response.passwordChanged);
  }

  private getUserFromStorage(): User | null {
    try {
      const userStr = localStorage.getItem(environment.userKey);
      if (!userStr || userStr === 'undefined' || userStr === 'null') {
        return null;
      }
      return JSON.parse(userStr);
    } catch (error) {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      const expirationDate = decoded.exp * 1000;
      return Date.now() >= expirationDate;
    } catch (error) {
      return true;
    }
  }
}
