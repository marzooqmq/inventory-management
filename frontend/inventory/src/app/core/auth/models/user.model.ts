export interface User {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  role?: string;
  createdAt?: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: User;
  passwordChanged: boolean; // false = must change password, true = already changed
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
  token?: string;
}
