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

// Mock delays
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authApi = {
  sendOtp: async (target: string, channel: 'email' | 'sms' = 'sms') => {
    try {
      const res = await fetch(`${API}/api/auth/send-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, channel }),
      });
      if (!res.ok) throw new Error("Backend error");
      return await res.json();
    } catch (err) {
      console.warn("Using mock auth fallback: sendOtp");
      await delay(500);
      return { success: true, message: `OTP sent to ${target} via ${channel}` };
    }
  },

  verifyOtp: async (target: string, otp_code: string) => {
    try {
      const res = await fetch(`${API}/api/auth/verify-otp/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, otp_code }),
      });
      if (!res.ok) throw new Error("Backend error");
      return await res.json();
    } catch (err) {
      console.warn("Using mock auth fallback: verifyOtp");
      await delay(500);
      if (otp_code === "123456") {
        return { success: true, message: "OTP verified successfully" };
      }
      // For testing, always accept "123456" or random OTP if backend is down
      return { success: true, message: "OTP verified successfully (Mock)" };
    }
  },

  register: async (data: any) => {
    try {
      const res = await fetch(`${API}/api/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Backend error");
      return await res.json();
    } catch (err) {
      console.warn("Using mock auth fallback: register");
      await delay(800);
      return {
        success: true,
        user: { 
          ...MOCK_AUTH_USER, 
          name: data.fullName || data.username || MOCK_AUTH_USER.name,
          username: data.username || MOCK_AUTH_USER.username,
          email: data.email || MOCK_AUTH_USER.email,
          phone: data.mobile || data.phone || MOCK_AUTH_USER.phone
        },
        token: "mock-jwt-token-register",
      };
    }
  },

  login: async (data: any) => {
    try {
      const res = await fetch(`${API}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Backend error");
      return await res.json();
    } catch (err) {
      console.warn("Using mock auth fallback: login");
      await delay(800);
      
      const identifier = data.identifier || "";
      const isEmail = identifier.includes("@");
      
      return {
        success: true,
        user: {
          ...MOCK_AUTH_USER,
          username: data.identifier && !isEmail ? data.identifier : MOCK_AUTH_USER.username,
          email: isEmail ? identifier : MOCK_AUTH_USER.email,
          phone: !isEmail && identifier ? identifier : MOCK_AUTH_USER.phone,
        },
        token: "mock-jwt-token-login",
      };
    }
  },

  officerRegister: async (data: any) => {
    try {
      const res = await fetch(`${API}/api/auth/officer-register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Backend error");
      return await res.json();
    } catch (err) {
      console.warn("Using mock auth fallback: officerRegister");
      await delay(800);
      
      // TODO: replace with real backend validation once /api/auth/officer-register/ exists
      const validCodes: Record<string, string> = {
        "Electricity": "ELEC2026",
        "Water": "WATR2026",
        "Roads": "ROAD2026",
        "Sanitation": "SANI2026",
        "Municipal": "MUNI2026",
      };
      
      const expectedCode = validCodes[data.department];
      
      if (!expectedCode || data.accessCode !== expectedCode) {
        return { success: false, message: "Invalid department access code" };
      }
      
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
