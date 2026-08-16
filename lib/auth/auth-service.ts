import { CURRENT_USER, UserProfile } from "@/lib/data/mock-data";
import {
  AuthResponse,
  LoginCredentials,
  PasswordResetResponse,
  RegisterCredentials,
  UserRole,
} from "./auth-types";

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

const SIMULATED_LATENCY_MS = 500;

export const authService = {
  /**
   * Mock login endpoint
   * Connect to: POST /api/auth/login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));

    const { identifier, password, role = "citizen" } = credentials;

    // Basic frontend validation
    if (!identifier || !identifier.trim()) {
      return {
        success: false,
        message: "Please enter your email or mobile number.",
        errors: { identifier: "Email or mobile number is required" },
      };
    }

    if (!password || password.length < 4) {
      return {
        success: false,
        message: "Password must be at least 4 characters long.",
        errors: { password: "Password is too short" },
      };
    }

    // Role-based mock user profile generation
    let loggedInUser: UserProfile;

    if (role === "officer") {
      loggedInUser = {
        id: "JS-OFF-4412",
        name: identifier.includes("@") ? identifier.split("@")[0].replace(".", " ") : "Er. Ramesh Kulkarni",
        email: identifier.includes("@") ? identifier : "ramesh.kulkarni@bbmp.gov.in",
        phone: !identifier.includes("@") ? identifier : "+91 94808 12345",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        ward: "Shanti Nagar",
        wardNumber: 42,
        role: "officer",
        karmaXP: 3820,
        level: 8,
        levelTitle: "Senior Ward Officer",
        verifiedCitizen: true,
        aadhaarLinked: true,
        stats: {
          issuesReported: 0,
          issuesResolved: 142,
          upvotesGiven: 420,
          verificationVotes: 198,
          civicImpactScore: 98,
        },
        badges: CURRENT_USER.badges,
      };
    } else {
      loggedInUser = {
        ...CURRENT_USER,
        id: `JS-CIT-${Math.floor(10000 + Math.random() * 90000)}`,
        name: identifier.includes("@")
          ? identifier.split("@")[0].replace(".", " ")
          : CURRENT_USER.name,
        email: identifier.includes("@") ? identifier : "asmit.gupta@civic.in",
        phone: !identifier.includes("@") ? identifier : "+91 98765 43210",
        role: "citizen",
      };
    }

    return {
      success: true,
      user: loggedInUser,
      token: "mock-jwt-token-janseva-proto-" + Date.now(),
      message: "Login successful",
    };
  },

  /**
   * Mock registration endpoint
   * Connect to: POST /api/auth/register
   */
  async register(data: RegisterCredentials): Promise<AuthResponse> {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));

    const errors: Record<string, string> = {};

    if (!data.fullName || !data.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!data.identifier || !data.identifier.trim()) {
      errors.identifier = "Email or mobile number is required";
    }

    if (!data.password || data.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (data.confirmPassword && data.password !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!data.city || !data.city.trim()) {
      errors.city = "City is required";
    }

    if (!data.ward || !data.ward.trim()) {
      errors.ward = "Ward selection is required";
    }

    if (!data.agreedToTerms) {
      errors.agreedToTerms = "You must agree to the Terms & Conditions";
    }

    if (Object.keys(errors).length > 0) {
      return {
        success: false,
        message: "Please correct the highlighted errors.",
        errors,
      };
    }

    const newUser: UserProfile = {
      id: `JS-CIT-${Math.floor(10000 + Math.random() * 90000)}`,
      name: data.fullName.trim(),
      email: data.identifier.includes("@") ? data.identifier.trim() : `${data.fullName.toLowerCase().replace(/\s+/g, ".")}@civic.in`,
      phone: !data.identifier.includes("@") ? data.identifier.trim() : "+91 98765 43210",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
      ward: data.ward,
      wardNumber: data.wardNumber || 42,
      role: (data.role === "officer" || data.role === "corporator" ? data.role : "citizen"),
      karmaXP: 100, // Welcome bonus XP for new citizens
      level: 1,
      levelTitle: "Active Citizen",
      verifiedCitizen: true,
      aadhaarLinked: false,
      stats: {
        issuesReported: 0,
        issuesResolved: 0,
        upvotesGiven: 0,
        verificationVotes: 0,
        civicImpactScore: 10,
      },
      badges: [
        {
          id: "badge-welcome",
          name: "Civic Pioneer",
          icon: "🌟",
          description: "Joined JanSeva community",
          unlockedAt: new Date().toISOString(),
        },
      ],
    };

    return {
      success: true,
      user: newUser,
      token: "mock-jwt-token-janseva-registered-" + Date.now(),
      message: "Account created successfully",
    };
  },

  /**
   * Mock password reset endpoint
   * Connect to: POST /api/auth/forgot-password
   */
  async requestPasswordReset(identifier: string): Promise<PasswordResetResponse> {
    await new Promise((resolve) => setTimeout(resolve, SIMULATED_LATENCY_MS));

    if (!identifier || !identifier.trim()) {
      return {
        success: false,
        message: "Please enter your registered email or mobile number.",
      };
    }

    return {
      success: true,
      message: `Password reset link/OTP has been sent to ${identifier}. Please check your inbox or SMS.`,
    };
  },
};
