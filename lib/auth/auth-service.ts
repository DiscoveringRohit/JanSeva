import { UserProfile } from "@/lib/data/mock-data";
import { DEFAULT_USER_FALLBACK } from "@/lib/data/default-location";
import {
  AuthResponse,
  LoginCredentials,
  PasswordResetResponse,
  RegisterCredentials,
  UserRole,
} from "./auth-types";

declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};


/**
 * JanSeva Authentication Service
 * 
 * NOTE FOR BACKEND TEAM:
 * This service currently provides a frontend-only mock implementation for prototypes and UI demos.
 * To integrate with the real backend API:
 * 1. Replace the mock promises with actual API calls (e.g., fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`))
 * 2. Store session tokens (JWT/HTTP-only cookies) as per security guidelines.
 * 3. Return the authenticated UserProfile and auth token.
 */

export const authService = {
  /**
   * Login endpoint
   * Connects to: POST /api/auth/login/
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      const response = await fetch(`${API_URL}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.identifier,
          password: credentials.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.detail || "Invalid credentials. Please try again.",
          errors: errorData,
        };
      }

      const tokenData = await response.json();
      const token = tokenData.access;

      // Fetch user profile details
      const profileResponse = await fetch(`${API_URL}/api/auth/profile/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!profileResponse.ok) {
        return {
          success: false,
          message: "Failed to retrieve user profile details.",
        };
      }

      const userProfile = await profileResponse.json();
      
      const formattedUser: UserProfile = {
        id: userProfile.id.toString(),
        name: userProfile.username,
        email: userProfile.email,
        phone: userProfile.phone_number || "",
        avatar: userProfile.avatar || DEFAULT_USER_FALLBACK.avatar,
        ward: userProfile.ward || DEFAULT_USER_FALLBACK.ward,
        wardNumber: userProfile.ward_number || DEFAULT_USER_FALLBACK.wardNumber,
        role: userProfile.role,
        karmaXP: userProfile.karma_xp,
        level: userProfile.level,
        levelTitle: userProfile.level_title,
        verifiedCitizen: userProfile.verified_citizen,
        aadhaarLinked: userProfile.aadhaar_linked,
        stats: userProfile.stats || {
          issuesReported: 0,
          issuesResolved: 0,
          upvotesGiven: 0,
          verificationVotes: 0,
          civicImpactScore: 10,
        },
        badges: userProfile.badges || [],
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_token", token);
        localStorage.setItem("janseva_refresh_token", tokenData.refresh);
        localStorage.setItem("janseva_user", JSON.stringify(formattedUser));
      }

      return {
        success: true,
        user: formattedUser,
        token: token,
        message: "Login successful",
      };
    } catch (e: any) {
      return {
        success: false,
        message: "Server is unreachable. Please make sure the backend is running.",
      };
    }
  },

  /**
   * Registration endpoint
   * Connects to: POST /api/auth/register/
   */
  async register(data: RegisterCredentials): Promise<AuthResponse> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      const response = await fetch(`${API_URL}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.identifier,
          email: data.identifier.includes("@") ? data.identifier.trim() : "",
          phone_number: !data.identifier.includes("@") ? data.identifier.trim() : "",
          password: data.password,
          fullName: data.fullName,
          role: data.role || "citizen",
          ward: data.ward,
          wardNumber: data.wardNumber,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          message: errorData.error || "Registration failed. Please try again.",
          errors: errorData,
        };
      }

      const resData = await response.json();
      const token = resData.token;
      const userProfile = resData.user;

      const formattedUser: UserProfile = {
        id: userProfile.id.toString(),
        name: userProfile.username,
        email: userProfile.email,
        phone: userProfile.phone_number || "",
        avatar: userProfile.avatar || DEFAULT_USER_FALLBACK.avatar,
        ward: userProfile.ward || DEFAULT_USER_FALLBACK.ward,
        wardNumber: userProfile.ward_number || DEFAULT_USER_FALLBACK.wardNumber,
        role: userProfile.role,
        karmaXP: userProfile.karma_xp,
        level: userProfile.level,
        levelTitle: userProfile.level_title,
        verifiedCitizen: userProfile.verified_citizen,
        aadhaarLinked: userProfile.aadhaar_linked,
        stats: userProfile.stats || {
          issuesReported: 0,
          issuesResolved: 0,
          upvotesGiven: 0,
          verificationVotes: 0,
          civicImpactScore: 10,
        },
        badges: userProfile.badges || [],
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_token", token);
        localStorage.setItem("janseva_refresh_token", resData.refresh);
        localStorage.setItem("janseva_user", JSON.stringify(formattedUser));
      }

      return {
        success: true,
        user: formattedUser,
        token: token,
        message: "Registration successful",
      };
    } catch (e: any) {
      return {
        success: false,
        message: "Server is unreachable. Please make sure the backend is running.",
      };
    }
  },

  /**
   * Password reset endpoint
   * Connects to: POST /api/auth/forgot-password/
   */
  async requestPasswordReset(identifier: string): Promise<PasswordResetResponse> {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    try {
      const response = await fetch(`${API_URL}/api/auth/login/request-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: identifier.includes("@") ? identifier : "test@test.com",
          phone_number: !identifier.includes("@") ? identifier : "1234567890",
        }),
      });

      if (!response.ok) {
        return {
          success: false,
          message: "Failed to request OTP. Check email/phone number.",
        };
      }

      return {
        success: true,
        message: `OTP code has been sent successfully to ${identifier}.`,
      };
    } catch (e: any) {
      return {
        success: false,
        message: "Server is unreachable.",
      };
    }
  },
};

