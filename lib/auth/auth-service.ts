import {
  AuthResponse,
  LoginCredentials,
  PasswordResetResponse,
  RegisterCredentials,
  GoogleAuthCredentials,
  CompleteProfileCredentials,
} from "./auth-types";

import { WardOption } from "@/lib/data/cities-wards";

export const authService = {
  /**
   * Fetch available municipal cities
   */
  async getCities(): Promise<string[]> {
    try {
      const res = await fetch("/api/cities");
      const data = await res.json();

      if (data.success && Array.isArray(data.cities)) {
        return data.cities;
      }

      return [];
    } catch {
      return [];
    }
  },

  /**
   * Fetch wards dynamically by city
   */
  async getWards(city: string): Promise<WardOption[]> {
    try {
      const res = await fetch(
        `/api/wards?city=${encodeURIComponent(city)}`
      );

      const data = await res.json();

      if (data.success && Array.isArray(data.wards)) {
        return data.wards;
      }

      return [];
    } catch {
      return [];
    }
  },

  /**
   * Login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      return data;
    } catch {
      return {
        success: false,
        message:
          "Unable to connect to JanSeva authentication server. Please try again.",
      };
    }
  },

  /**
   * Register Citizen / Officer
   */
  async register(
    credentials: RegisterCredentials
  ): Promise<AuthResponse> {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      return data;
    } catch {
      return {
        success: false,
        message:
          "Unable to complete registration. Please check your connection and try again.",
      };
    }
  },

  /**
   * Google OAuth login and account linking
   */
  async loginWithGoogle(
    googleData: GoogleAuthCredentials
  ): Promise<AuthResponse> {
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(googleData),
      });

      const data = await res.json();

      return data;
    } catch {
      return {
        success: false,
        message:
          "Google sign-in was unsuccessful. Please try again.",
      };
    }
  },

  /**
   * Verify email using the token from the email link
   */
  async verifyEmailToken(
    token: string
  ): Promise<AuthResponse> {
    try {
      const res = await fetch(
        `/api/auth/verify-email?token=${encodeURIComponent(token)}`,
        {
          method: "GET",
        }
      );

      const data = await res.json();

      return data;
    } catch {
      return {
        success: false,
        message:
          "Unable to verify email address. Please check your internet connection.",
      };
    }
  },

  /**
   * Resend verification email
   */
  async resendVerificationEmail(
    email: string
  ): Promise<AuthResponse> {
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          action: "resend",
        }),
      });

      const data = await res.json();

      return data;
    } catch {
      return {
        success: false,
        message:
          "Unable to resend verification email. Please try again.",
      };
    }
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(
    identifier: string
  ): Promise<PasswordResetResponse> {
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier,
          action: "request",
        }),
      });

      const data = await res.json();

      return data;
    } catch {
      return {
        success: false,
        message:
          "Failed to send reset link. Please check your connection.",
      };
    }
  },

  /**
   * Complete City/Ward profile after Google OAuth
   */
  async completeProfile(
    data: CompleteProfileCredentials & { email: string }
  ): Promise<AuthResponse> {
    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      return result;
    } catch {
      return {
        success: false,
        message:
          "Failed to update profile. Please try again.",
      };
    }
  },
};