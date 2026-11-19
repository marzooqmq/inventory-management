export enum UserRole {
  ADMIN = 'ADMIN',
  PRODUCTION_MANAGER = 'PRODUCTION_MANAGER',
  ACCOUNTANT = 'ACCOUNTANT'
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UserRequest {
  username: string;
  password: string;
  role: UserRole;
}

export interface UserUpdateRequest {
  role: UserRole;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// Helper to get role display name
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.PRODUCTION_MANAGER]: 'Production Manager',
    [UserRole.ACCOUNTANT]: 'Accountant'
  };
  return roleNames[role];
}

// Helper to get role color for badges
export function getRoleSeverity(role: UserRole): string {
  const severities: Record<UserRole, string> = {
    [UserRole.ADMIN]: 'danger',
    [UserRole.PRODUCTION_MANAGER]: 'warning',
    [UserRole.ACCOUNTANT]: 'info'
  };
  return severities[role];
}
