import { CURRENT_USER } from "@/lib/data/mock-data";
import { ExtendedUserProfile } from "./auth-types";

export interface StoredUser {
  profile: ExtendedUserProfile;
  passwordHash: string; // Plain/hashed password stored securely for server validation
  verificationToken?: string;
  resetToken?: string;
  createdAt: string;
}

// Global server instance storage across hot reloads in Next.js dev server
const globalForAuth = globalThis as unknown as {
  jansevaUsers: Map<string, StoredUser>;
  verificationTokens: Map<string, { email: string; expiresAt: number }>; // token -> {email, expiresAt}
  resetTokens: Map<string, { email: string; expiresAt: number }>; // token -> {email, expiresAt}
};

if (!globalForAuth.jansevaUsers) {
  globalForAuth.jansevaUsers = new Map<string, StoredUser>();
  globalForAuth.verificationTokens = new Map<string, { email: string; expiresAt: number }>();
  globalForAuth.resetTokens = new Map<string, { email: string; expiresAt: number }>();

  // Seed default Citizen: Asmit Gupta
  const defaultCitizen: ExtendedUserProfile = {
    ...CURRENT_USER,
    id: "JS-CIT-88219",
    name: "Asmit Gupta",
    email: "asmit.gupta@civic.in",
    phone: "+91 98765 43210",
    role: "citizen",
    city: "Bengaluru",
    ward: "Shanti Nagar",
    wardNumber: 42,
    status: "active",
    emailVerified: true,
  };

  globalForAuth.jansevaUsers.set("asmit.gupta@civic.in", {
    profile: defaultCitizen,
    passwordHash: "citizen2026",
    createdAt: new Date().toISOString(),
  });

  globalForAuth.jansevaUsers.set("+91 98765 43210", {
    profile: defaultCitizen,
    passwordHash: "citizen2026",
    createdAt: new Date().toISOString(),
  });

  // Seed default Officer: Er. Ramesh Kulkarni
  const defaultOfficer: ExtendedUserProfile = {
    id: "JS-OFF-4412",
    name: "Er. Ramesh Kulkarni",
    email: "ramesh.kulkarni@bbmp.gov.in",
    officialEmail: "ramesh.kulkarni@bbmp.gov.in",
    phone: "+91 94808 12345",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    city: "Bengaluru",
    ward: "Shanti Nagar",
    wardNumber: 42,
    department: "Public Works Department",
    role: "officer",
    status: "active",
    emailVerified: true,
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

  globalForAuth.jansevaUsers.set("ramesh.kulkarni@bbmp.gov.in", {
    profile: defaultOfficer,
    passwordHash: "officer2026",
    createdAt: new Date().toISOString(),
  });
}

export const userStore = {
  findUserByIdentifier(identifier: string): StoredUser | undefined {
    const key = identifier.trim().toLowerCase();
    const entries = Array.from(globalForAuth.jansevaUsers.entries());
    for (const [k, u] of entries) {
      if (
        k.toLowerCase() === key ||
        u.profile.email.toLowerCase() === key ||
        u.profile.phone === key ||
        (u.profile.officialEmail && u.profile.officialEmail.toLowerCase() === key)
      ) {
        return u;
      }
    }
    return undefined;
  },

  findUserByGoogleId(googleId: string): StoredUser | undefined {
    const users = Array.from(globalForAuth.jansevaUsers.values());
    for (const u of users) {
      if (u.profile.googleId === googleId) {
        return u;
      }
    }
    return undefined;
  },

  createUser(stored: StoredUser): StoredUser {
    const emailKey = stored.profile.email.toLowerCase();
    globalForAuth.jansevaUsers.set(emailKey, stored);
    if (stored.profile.phone) {
      globalForAuth.jansevaUsers.set(stored.profile.phone, stored);
    }
    return stored;
  },

  updateUser(email: string, updates: Partial<ExtendedUserProfile>): StoredUser | undefined {
    const stored = this.findUserByIdentifier(email);
    if (!stored) return undefined;
    stored.profile = { ...stored.profile, ...updates };
    return stored;
  },

  createVerificationToken(email: string): string {
    const token = `verify_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    globalForAuth.verificationTokens.set(token, {
      email: email.toLowerCase(),
      expiresAt,
    });
    return token;
  },

  verifyEmailToken(token: string): { status: "success" | "expired" | "invalid"; email?: string; message?: string } {
    const data = globalForAuth.verificationTokens.get(token);
    if (!data) {
      return { status: "invalid", message: "Invalid or non-existent verification link." };
    }

    if (Date.now() > data.expiresAt) {
      globalForAuth.verificationTokens.delete(token);
      return { status: "expired", message: "Verification link has expired (24-hour limit). Please request a new verification email." };
    }

    const email = data.email;
    const user = this.findUserByIdentifier(email);
    if (user) {
      user.profile.emailVerified = true;
      globalForAuth.verificationTokens.delete(token);
      return { status: "success", email, message: "Email address verified successfully!" };
    }

    return { status: "invalid", message: "User account associated with this token was not found." };
  },

  verifyUserEmailDirectly(email: string): boolean {
    const user = this.findUserByIdentifier(email);
    if (user) {
      user.profile.emailVerified = true;
      return true;
    }
    return false;
  },

  createResetToken(email: string): string {
    const token = `reset_${Math.random().toString(36).substring(2)}_${Date.now()}`;
    globalForAuth.resetTokens.set(token, {
      email: email.toLowerCase(),
      expiresAt: Date.now() + 3600000, // 1 hour
    });
    return token;
  },

  verifyResetToken(token: string): string | null {
    const data = globalForAuth.resetTokens.get(token);
    if (!data) return null;
    if (Date.now() > data.expiresAt) {
      globalForAuth.resetTokens.delete(token);
      return null;
    }
    return data.email;
  },

  resetPassword(token: string, newPassword: string): boolean {
    const email = this.verifyResetToken(token);
    if (!email) return false;
    const user = this.findUserByIdentifier(email);
    if (user) {
      user.passwordHash = newPassword;
      globalForAuth.resetTokens.delete(token);
      return true;
    }
    return false;
  },
};
