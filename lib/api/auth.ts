import { UserProfile } from "@/lib/data/mock-data";
import { authService } from "@/lib/auth/auth-service-cookie3";

const MOCK_AUTH_USER: UserProfile = {
  id: "USR-9482",
  name: "Citizen",
  username: "citizen_user",
  email: "citizen@example.com",
  phone: "+91 98765 43210",
  gender: "Prefer not to say",
  avatar: "",
  ward: "Shanti Nagar",
  wardNumber: 42,
  pincode: "751030",
  role: "citizen",
  civicCitizenXP: 10,
  level: 1,
  levelTitle: "Active Citizen",
  verifiedCitizen: false,
  aadhaarLinked: false,
  stats: {
    issuesReported: 0,
    issuesResolved: 0,
    upvotesGiven: 0,
    verificationVotes: 0,
    civicImpactScore: 10,
  },
  badges: [],
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: any;
  token?: string;
  errors?: any;
}

export function normalizeUser(rawUser: any): UserProfile {
  if (!rawUser) return rawUser;
  
  const name =
    rawUser.name ||
    rawUser.full_name ||
    rawUser.fullName ||
    rawUser.profile?.full_name ||
    rawUser.profile?.public_username ||
    rawUser.username ||
    "Citizen";

  const username = rawUser.username || rawUser.profile?.public_username || name.toLowerCase().replace(/\s+/g, '_');
  const email = rawUser.email || "";
  const phone = rawUser.phone || rawUser.phone_number || rawUser.mobile || "";
  const avatar = rawUser.avatar || "";
  const role = rawUser.role || "citizen";
  
  const levelTitle = rawUser.levelTitle || rawUser.level_title || (role === "officer" ? "Ward Officer" : "Active Citizen");
  
  let department = rawUser.department || "";
  if (!department && role === "officer" && levelTitle.includes(" Officer")) {
    department = levelTitle.replace(" Officer", "").trim();
  }
  
  const ward = rawUser.ward_details?.name || rawUser.ward || "ITER College Road";
  const wardNumber = rawUser.ward_details?.ward_number || rawUser.wardNumber || 63;

  const civicCitizenXP = rawUser.civicCitizenXP ?? rawUser.karma_xp ?? 10;
  const level = rawUser.level ?? 1;

  const verifiedCitizen = rawUser.verifiedCitizen ?? rawUser.verified_citizen ?? false;
  const aadhaarLinked = rawUser.aadhaarLinked ?? rawUser.aadhaar_linked ?? false;

  const stats = rawUser.stats || {
    issuesReported: 0,
    issuesResolved: 0,
    upvotesGiven: 0,
    verificationVotes: 0,
    civicImpactScore: 10,
  };

  const badges = rawUser.badges || [];

  return {
    id: String(rawUser.id || "USR-" + Math.floor(Math.random() * 10000)),
    name,
    username,
    email,
    phone,
    gender: rawUser.gender || "Prefer not to say",
    avatar,
    ward,
    wardNumber,
    city: rawUser.city || rawUser.city_name || "",
    pincode: rawUser.pin_code || rawUser.pincode || "751030",
    department,
    role,
    civicCitizenXP,
    level,
    levelTitle,
    verifiedCitizen,
    aadhaarLinked,
    stats,
    badges,
  };
}

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 12000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(id);
  }
}

export const authApi = {
  sendOtp: async (target: string, channel: 'email' | 'sms' = 'sms'): Promise<AuthResponse> => {
    try {
      const res = await fetchWithTimeout(`${API}/api/auth/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, channel }),
      }, 12000);
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error || data.detail || data.message || "Failed to send OTP" };
      return { success: true, message: data.message || `OTP sent via ${channel}` };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, message: "OTP request timed out. Please try again." };
      }
      return { success: false, message: err.message || "Network connection error. Please check your connection." };
    }
  },

  verifyOtp: async (target: string, otp_code: string): Promise<AuthResponse> => {
    try {
      const res = await fetchWithTimeout(`${API}/api/auth/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, otp_code }),
      }, 10000);
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error || data.detail || data.message || "Invalid or expired OTP" };
      return { success: true, message: data.message || "OTP verified successfully" };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, message: "Verification request timed out." };
      }
      return { success: false, message: err.message || "Network error during OTP verification." };
    }
  },

  register: async (data: any): Promise<AuthResponse> => {
    try {
      const payload = {
        phone: data.phone || data.mobile || "",
        email: data.email,
        password: data.password,
        public_username: data.username || data.public_username || (data.email ? data.email.split('@')[0] : "user"),
        full_name: data.fullName || data.full_name || data.name || "Citizen User",
        role: data.role || "citizen",
        department: data.department || "",
        ward_id: data.ward_id || 1,
        pincode: data.pincode || "751030",
      };

      const res = await fetchWithTimeout(`${API}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }, 15000);
      const resData = await res.json();
      if (!res.ok) {
        const errorMsg = resData.error || resData.detail || (resData.non_field_errors ? resData.non_field_errors[0] : "Registration failed");
        return { success: false, message: errorMsg, errors: resData };
      }
      return {
        success: true,
        user: normalizeUser(resData.user),
        token: resData.access,
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, message: "Registration request timed out." };
      }
      return { success: false, message: err.message || "Network error during registration." };
    }
  },

  login: async (data: any): Promise<AuthResponse> => {
    try {
      const identifier = data.identifier || data.username || data.phone || "";
      const isPhone = /^[0-9+]+$/.test(identifier.trim());

      const payload: any = { password: data.password };
      if (isPhone) {
        payload.phone = identifier;
      } else {
        payload.username = identifier;
      }

      const res = await fetchWithTimeout(`${API}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }, 10000);
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, message: resData.error || resData.detail || resData.message || "Invalid credentials" };
      }
      return {
        success: true,
        user: normalizeUser(resData.user),
        token: resData.access,
      };
    } catch (err) {
      console.warn("Using mock auth fallback: login");
      await delay(800);
      
      const identifier = data.identifier || "";
      const isEmail = identifier.includes("@");
      
      return {
        success: true,
        user: normalizeUser({
          ...MOCK_AUTH_USER,
          username: data.identifier && !isEmail ? data.identifier : MOCK_AUTH_USER.username,
          email: isEmail ? identifier : MOCK_AUTH_USER.email,
          phone: !isEmail && identifier ? identifier : MOCK_AUTH_USER.phone,
        }),
        token: "mock-jwt-token-login",
      };
    }
  },

  officerRegister: async (data: any): Promise<AuthResponse> => {
    try {
      const validCodes: Record<string, string> = {
        "Electricity": "ELEC2026",
        "Water": "WATR2026",
        "Roads": "ROAD2026",
        "Sanitation": "SANI2026",
        "Municipal": "MUNI2026",
      };
      
      const expectedCode = validCodes[data.department];
      if (data.accessCode && expectedCode && data.accessCode !== expectedCode) {
        return { success: false, message: "Invalid department access code" };
      }

      return await authApi.register({
        fullName: data.fullName,
        email: data.email,
        phone: data.mobile || data.phone,
        username: data.username || (data.email ? data.email.split('@')[0] + '_officer' : 'officer'),
        password: data.password,
        role: "officer",
        department: data.department,
      });
    } catch (err) {
      console.warn("Using mock auth fallback: officerRegister");
      await delay(800);
      
      return {
        success: true,
        user: { 
          ...MOCK_AUTH_USER, 
          name: data.fullName,
          role: "officer",
          department: data.department,
          levelTitle: `${data.department} Officer`
        },
        token: "mock-jwt-token-officer-register",
      };
    }
  },

  requestPasswordReset: async (email: string): Promise<AuthResponse> => {
    try {
      const res = await authService.requestPasswordReset(email);
      return {
        success: res.success,
        message: res.message
      };
    } catch (err) {
      console.warn("Using mock auth fallback: requestPasswordReset");
      await delay(800);
      return {
        success: true,
        message: "Password reset link sent successfully"
      };
    }
  },

  updateProfile: async (data: any): Promise<AuthResponse> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("janseva_token") : null;
      let userData: any = null;
      
      if (token) {
        try {
          const res = await fetch(`${API}/api/auth/profile/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data),
          });

          if (res.ok) {
            userData = await res.json();
          }
        } catch (backendErr) {
          console.warn("Backend update failed, updating client session:", backendErr);
        }
      }

      // Merge and save to localStorage
      const existingUserStr = typeof window !== "undefined" ? localStorage.getItem("janseva_user") : null;
      const existingUser = existingUserStr ? JSON.parse(existingUserStr) : {};
      
      const mergedUser = normalizeUser({
        ...existingUser,
        ...(userData || {}),
        ...data,
        name: data.full_name || data.name || (data.first_name ? `${data.first_name} ${data.last_name || ''}`.trim() : existingUser.name),
        avatar: data.avatar !== undefined ? data.avatar : existingUser.avatar,
        phone: data.phone_number || data.phone || existingUser.phone,
        city: data.city || existingUser.city,
        pincode: data.pin_code || data.pincode || existingUser.pincode,
        gender: data.gender || existingUser.gender,
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_user", JSON.stringify(mergedUser));
      }

      return { success: true, user: mergedUser };
    } catch (error) {
      console.error("Profile update error:", error);
      return { success: false, message: "Failed to update profile." };
    }
  },
};
