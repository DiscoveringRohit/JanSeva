// Cookie-based auth service (HttpOnly refresh cookie + in-memory access token)
import { UserProfile } from "@/lib/data/mock-data";
import { AuthResponse, LoginCredentials, PasswordResetResponse, RegisterCredentials } from "./auth-types";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

let accessToken: string | null = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function refreshAccessWithCookie(): Promise<string | null> {
  try {
    const res = await fetch(`${API}/api/auth/token/refresh/cookie/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.access) {
      setAccessToken(data.access);
      return data.access;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("Content-Type", "application/json");
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

  const opts: RequestInit = { ...init, headers, credentials: "include" };
  let res = await fetch(input, opts);
  if (res.status !== 401) return res;

  // try refresh via cookie
  const newAccess = await refreshAccessWithCookie();
  if (!newAccess) return res;

  // retry original request with new access token
  headers.set("Authorization", `Bearer ${newAccess}`);
  res = await fetch(input, { ...init, headers, credentials: "include" });
  return res;
}

export const authService = {
  async tryRestoreSession(): Promise<boolean> {
    // Attempt to get an access token from server via refresh cookie
    const newAccess = await refreshAccessWithCookie();
    if (newAccess) return true;
    return false;
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API}/api/auth/login/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: credentials.identifier, password: credentials.password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, message: err.detail || "Login failed", errors: err };
      }

      const data = await res.json();
      if (data?.access) {
        setAccessToken(data.access);
        // fetch profile
        const profileRes = await fetchWithAuth(`${API}/api/auth/profile/`);
        if (profileRes.ok) {
          const user = await profileRes.json();
          if (typeof window !== "undefined") localStorage.setItem("janseva_user", JSON.stringify(user));
          return { success: true, user, token: data.access, message: "Login successful" };
        }
        return { success: true, token: data.access, message: "Login successful" };
      }

      return { success: false, message: "Login did not return access token" };
    } catch (e: any) {
      return { success: false, message: "Network error" };
    }
  },

  async logout() {
    try {
      await fetch(`${API}/api/auth/logout/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      // ignore network errors — still clear client state
    }

    // Clear client-side state
    setAccessToken(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("janseva_user");
    }

    return true;
  },

  async register(data: RegisterCredentials): Promise<AuthResponse> {
    try {
      const res = await fetch(`${API}/api/auth/register/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, message: err.error || "Registration failed", errors: err };
      }
      const d = await res.json();
      if (d?.access) {
        setAccessToken(d.access);
      }
      if (d?.user && typeof window !== "undefined") {
        localStorage.setItem("janseva_user", JSON.stringify(d.user));
      }
      return { success: true, user: d.user, token: d.access };
    } catch (e) {
      return { success: false, message: "Network error" };
    }
  },

  async requestOtp(payload: { email?: string; phone_number?: string }) {
    try {
      const res = await fetch(`${API}/api/auth/login/request-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await res.json();
    } catch (e) {
      return { success: false, message: "Network error" } as PasswordResetResponse;
    }
  },

  async verifyOtp(payload: { email?: string; phone_number?: string; otp_code: string }) {
    try {
      const res = await fetch(`${API}/api/auth/login/verify-otp/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, message: err.error || "OTP verify failed" };
      }
      const data = await res.json();
      if (data?.access) setAccessToken(data.access);
      const profileRes = await fetchWithAuth(`${API}/api/auth/profile/`);
      if (profileRes.ok) {
        const user = await profileRes.json();
        if (typeof window !== "undefined") localStorage.setItem("janseva_user", JSON.stringify(user));
        return { success: true, user } as any;
      }
      return { success: true } as any;
    } catch (e) {
      return { success: false, message: "Network error" } as any;
    }
  }
};
