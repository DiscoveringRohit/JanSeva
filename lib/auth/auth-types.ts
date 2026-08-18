import { UserProfile } from "@/lib/data/mock-data";

export type UserRole = "citizen" | "officer" | "corporator" | "admin";

export interface LoginCredentials {
  identifier: string; // Email or Mobile number
  password: string;
  rememberMe?: boolean;
  role?: UserRole;
}

export interface RegisterCredentials {
  fullName: string;
  identifier: string; // Email or Mobile number
  password: string;
  confirmPassword?: string;
  city: string;
  ward: string;
  wardNumber: number;
  role?: UserRole;
  agreedToTerms: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  token?: string;
  message?: string;
  errors?: Record<string, string>;
}

export interface PasswordResetRequest {
  identifier: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}
