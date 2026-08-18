import { UserProfile } from "@/lib/data/mock-data";

export type UserRole = "citizen" | "officer" | "corporator" | "admin";

export interface ExtendedUserProfile extends UserProfile {
  status?: "active" | "pending_approval" | "rejected";
  emailVerified?: boolean;
  googleId?: string;
  department?: string;
  officialEmail?: string;
  city?: string;
}

export interface LoginCredentials {
  identifier: string; // Email or Mobile number
  password: string;
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
  officialEmail?: string;
  department?: string;
  agreedToTerms?: boolean;
}

export interface GoogleAuthCredentials {
  credential?: string;
  googleId?: string;
  email: string;
  name: string;
  avatar?: string;
  role?: UserRole;
}

export interface CompleteProfileCredentials {
  userId: string;
  city: string;
  ward: string;
  wardNumber: number;
}

export interface AuthResponse {
  success: boolean;
  user?: ExtendedUserProfile;
  token?: string;
  message?: string;
  errors?: Record<string, string>;
  requiresVerification?: boolean;
  alreadyVerified?: boolean;
  pendingApproval?: boolean;
  needsProfileCompletion?: boolean;
  emailDelivery?: unknown;
}

export interface PasswordResetRequest {
  identifier: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  token?: string;
}
