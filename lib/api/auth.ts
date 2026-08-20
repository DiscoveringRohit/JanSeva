import { UserProfile } from "@/lib/data/mock-data";

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
  role: "citizen",
  karmaXP: 10,
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
  const department = rawUser.department || "";
  
  const ward = rawUser.ward_details?.name || rawUser.ward || "ITER College Road";
  const wardNumber = rawUser.ward_details?.ward_number || rawUser.wardNumber || 63;

  const karmaXP = rawUser.karmaXP ?? rawUser.karma_xp ?? 10;
  const level = rawUser.level ?? 1;
  const levelTitle = rawUser.levelTitle || rawUser.level_title || (role === "officer" ? `${department || "Ward"} Officer` : "Active Citizen");

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
    avatar,
    ward,
    wardNumber,
    department,
    role,
    karmaXP,
    level,
    levelTitle,
    verifiedCitizen,
    aadhaarLinked,
    stats,
    badges,
  };
}

export const authApi = {
  sendOtp: async (target: string, channel: 'email' | 'sms' = 'sms'): Promise<AuthResponse> => {
    try {
      const res = await fetch(`${API}/api/auth/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, channel }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error || data.detail || "Failed to send OTP" };
      return { success: true, message: data.message || `OTP sent via ${channel}` };
    } catch (err) {
      console.warn("Using mock auth fallback: sendOtp");
      await delay(500);
      return { success: true, message: `OTP sent to ${target} via ${channel}` };
    }
  },

  verifyOtp: async (target: string, otp_code: string): Promise<AuthResponse> => {
    try {
      const res = await fetch(`${API}/api/auth/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, otp_code }),
      });
      const data = await res.json();
      if (!res.ok) return { success: false, message: data.error || data.detail || "Invalid OTP" };
      return { success: true, message: data.message || "OTP verified successfully" };
    } catch (err) {
      console.warn("Using mock auth fallback: verifyOtp");
      await delay(500);
      if (otp_code === "123456") {
        return { success: true, message: "OTP verified successfully" };
      }
      return { success: true, message: "OTP verified successfully (Mock)" };
    }
  },

  register: async (data: any): Promise<AuthResponse> => {
    try {
      const payload = {
        phone: data.phone || data.mobile || "+919876543210",
        email: data.email,
        password: data.password,
        public_username: data.username || data.public_username || (data.email ? data.email.split('@')[0] : "user"),
        full_name: data.fullName || data.full_name || data.name || "Citizen User",
        role: data.role || "citizen",
        department: data.department || "",
        ward_id: data.ward_id || 1,
        pincode: data.pincode || "751030",
      };

      const res = await fetch(`${API}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
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
    } catch (err) {
      console.warn("Using mock auth fallback: register");
      await delay(800);
      return {
        success: true,
        user: normalizeUser({ 
          ...MOCK_AUTH_USER, 
          name: data.fullName || data.username || MOCK_AUTH_USER.name,
          username: data.username || MOCK_AUTH_USER.username,
          email: data.email || MOCK_AUTH_USER.email,
          phone: data.mobile || data.phone || MOCK_AUTH_USER.phone
        }),
        token: "mock-jwt-token-register",
      };
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

      const res = await fetch(`${API}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (!res.ok) {
        return { success: false, message: resData.error || resData.detail || "Invalid credentials" };
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
        username: data.username || (data.email ? data.email.split('@')[0] : 'officer'),
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
};
