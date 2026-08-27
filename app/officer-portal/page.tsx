"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { authApi } from "@/lib/api/auth";
import {
  Shield,
  Mail,
  User,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  KeyRound,
  Building,
  Lock,
  ShieldCheck,
  Radio,
  Sparkles,
  Users,
  Clock,
  Award,
  ChevronRight,
  Layers,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEPARTMENTS = [
  { id: "Water", label: "Water Works & Sewerage Division", icon: "💧", slug: "water" },
  { id: "Roads", label: "Roads & Infrastructure (PWD)", icon: "🛣️", slug: "roads" },
  { id: "Electricity", label: "Power & Streetlight Grid", icon: "⚡", slug: "electricity" },
  { id: "Sanitation", label: "Sanitation & Solid Waste Division", icon: "🧹", slug: "sanitation" },
  { id: "Municipal", label: "Zonal Executive Commissioner Desk", icon: "🏛️", slug: "municipal" },
];

export default function OfficerPortalPage() {
  const router = useRouter();
  const { user, setUser } = useApp();

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Registration details
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Sign In details
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signedInUser, setSignedInUser] = useState<any>(null);

  // Common access state
  const [department, setDepartment] = useState("Water");
  const [accessCode, setAccessCode] = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // If already authenticated as officer, auto-redirect to their department
  useEffect(() => {
    if (user && (user.role === "officer" || user.role === "corporator")) {
      const dept = user.department ? user.department.toLowerCase() : "water";
      router.push(`/officer/${dept}`);
    }
  }, [user, router]);

  // =============== SIGN IN LOGIC ===============
  const validateSignIn = () => {
    const errors: Record<string, string> = {};
    if (!loginEmail.trim() || !loginEmail.includes("@")) errors.loginEmail = "Please enter a valid official email";
    if (!loginPassword.trim()) errors.loginPassword = "Password is required";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignInStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateSignIn()) return;

    setIsLoading(true);
    try {
      const res = await authApi.login({ username: loginEmail, password: loginPassword });
      if (res.success && res.user) {
        if (res.user.role !== "officer" && res.user.role !== "corporator") {
          setError("Access Denied: This account is registered as a Citizen. Please use the Citizen Portal or contact the Municipal Administrator.");
        } else {
          setSignedInUser(res.user);
          if (res.user.department) {
            setDepartment(res.user.department);
          }
          setSuccessMessage("Credentials Verified");
          setTimeout(() => {
            setSuccessMessage(null);
            setStep(2);
          }, 600);
        }
      } else {
        setError(res.message || "Invalid credentials. Please verify your official email and password.");
      }
    } catch (err: any) {
      setError(err.message || "Network error. Please ensure backend server is active.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!accessCode.trim()) {
      setFieldErrors({ accessCode: "Department security access code is required" });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage("Department Access Granted");
      
      const updatedUser = {
        ...signedInUser,
        role: "officer",
        department: department
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_user", JSON.stringify(updatedUser));
      }
      setUser(updatedUser);

      setTimeout(() => {
        router.push(`/officer/${department.toLowerCase()}`);
      }, 500);
    }, 800);
  };

  // =============== REGISTRATION LOGIC ===============
  const validateRegStep1 = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = "Please enter your full official name";
    if (!phone.trim() || !/^[0-9+]{10,14}$/.test(phone.trim())) errors.phone = "Enter a valid official mobile number";
    if (!email.trim() || !email.includes("@")) errors.email = "Enter a valid official email";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateRegStep1()) return;

    setIsLoading(true);
    try {
      const res = await authApi.sendOtp(email || phone, "email");
      if (res.success) {
        setSuccessMessage("Verification OTP dispatched to official email");
        setTimeout(() => {
          setSuccessMessage(null);
          setStep(2);
        }, 800);
      } else {
        setError(res.message || "Failed to dispatch OTP");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp.trim() || otp.length < 4) {
      setFieldErrors({ otp: "Enter the 6-digit OTP code" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp(email, otp);
      if (res.success || (res.message && res.message.includes("success"))) {
        setSuccessMessage("OTP Authenticated");
        setTimeout(() => {
          setSuccessMessage(null);
          setStep(3);
        }, 600);
      } else {
        setError(res.message || "Invalid OTP code");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const errors: Record<string, string> = {};
    if (!accessCode.trim()) errors.accessCode = "Department access code is required";
    if (!password.trim() || password.length < 6) errors.password = "Password must be at least 6 characters";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsLoading(true);
    try {
      const payload = {
        name: fullName,
        username: email.split("@")[0] + "_officer",
        email: email,
        phone: phone,
        password: password,
        role: "officer",
        department: department,
        levelTitle: `Officer - ${department}`,
        verifiedCitizen: true
      };

      const res = await authApi.register(payload);
      if (res.success && res.user) {
        setSuccessMessage("Authority Account Provisioned Successfully");
        const authOfficer = {
          ...res.user,
          role: "officer",
          department: department
        };
        if (typeof window !== "undefined") {
          localStorage.setItem("janseva_user", JSON.stringify(authOfficer));
        }
        setUser(authOfficer);
        setTimeout(() => {
          router.push(`/officer/${department.toLowerCase()}`);
        }, 800);
      } else {
        setError(res.message || "Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#f8faf9] text-slate-900 font-body">
      
      {/* LEFT COLUMN: AUTHORITY TELEMETRY & SECURITY SHOWCASE */}
      <div className="lg:w-1/2 bg-[#134431] text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        
        {/* Subtle Watermark Background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
          <Shield className="w-[600px] h-[600px] text-white" />
        </div>

        {/* Top Header */}
        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white font-headline font-black text-sm group-hover:scale-105 transition-transform">
                JS
              </div>
              <div>
                <span className="font-headline font-black text-xl text-white tracking-tight block">
                  Jan<span className="text-emerald-300">Seva</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-200 block -mt-1">
                  Authority Operations
                </span>
              </div>
            </Link>

            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-emerald-200 text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Official Protocol 2.0</span>
            </span>
          </div>

          {/* Hero Pitch */}
          <div className="space-y-3 pt-6 lg:pt-12 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Authorized Municipal Personnel Only</span>
            </div>
            <h1 className="font-headline font-black text-3xl sm:text-4xl lg:text-5xl text-white leading-tight tracking-tight">
              Centralized Municipal Command &amp; Triage Portal
            </h1>
            <p className="text-sm text-emerald-100/80 leading-relaxed font-medium">
              Real-time computer-vision grievance ingestion, rapid field squad dispatch, SLA breach surveillance, and cross-departmental operations management for municipal engineers and ward corporators.
            </p>
          </div>
        </div>

        {/* Operational Telemetry Highlights */}
        <div className="relative z-10 grid grid-cols-2 gap-4 py-8 max-w-lg">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>AI Triage Precision</span>
            </div>
            <p className="font-headline font-black text-2xl text-white">98.4%</p>
            <p className="text-[10px] text-emerald-200/60 font-medium">Automated category classification</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
              <Clock className="w-4 h-4" />
              <span>Guaranteed SLA</span>
            </div>
            <p className="font-headline font-black text-2xl text-white">&lt; 24 Hours</p>
            <p className="text-[10px] text-emerald-200/60 font-medium">Auto-escalation triggers</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
              <Users className="w-4 h-4" />
              <span>Field Response Units</span>
            </div>
            <p className="font-headline font-black text-2xl text-white">6 Squads</p>
            <p className="text-[10px] text-emerald-200/60 font-medium">Live vehicle telemetry &amp; dispatch</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-1">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
              <Lock className="w-4 h-4" />
              <span>Role Security</span>
            </div>
            <p className="font-headline font-black text-2xl text-white">Encrypted</p>
            <p className="text-[10px] text-emerald-200/60 font-medium">Department code access</p>
          </div>
        </div>

        {/* Footer Seal */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/60 font-medium">
          <span>Bhubaneswar Municipal Corporation (BMC)</span>
          <Link href="/" className="text-emerald-300 hover:underline font-bold">
            Citizen Portal →
          </Link>
        </div>

      </div>

      {/* RIGHT COLUMN: EXPANDED AUTHORITY AUTHENTICATION SUITE */}
      <div className="lg:w-1/2 p-6 sm:p-10 lg:p-14 flex items-center justify-center">
        <div className="w-full max-w-lg space-y-6">
          
          {/* Form Header */}
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="font-headline font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Authority Operations Access
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Sign in with your verified municipal credentials to manage active field queues.
            </p>
          </div>

          {/* Mode Switcher (Sign In vs Register) */}
          <div className="p-1 rounded-2xl bg-slate-100 border border-slate-200 flex items-center gap-1">
            <button
              type="button"
              onClick={() => { setMode("signin"); setStep(1); setError(null); setFieldErrors({}); }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-headline font-bold transition-all",
                mode === "signin"
                  ? "bg-[#134431] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Authority Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setStep(1); setError(null); setFieldErrors({}); }}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-xs font-headline font-bold transition-all",
                mode === "register"
                  ? "bg-[#134431] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              New Authority Registration
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ================= SIGN IN: STEP 1 ================= */}
          {mode === "signin" && step === 1 && (
            <form onSubmit={handleSignInStep1} className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Official Municipal Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="officer@bmc.gov.in"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#134431]/20 focus:border-[#134431]"
                  />
                </div>
                {fieldErrors.loginEmail && <p className="text-[10px] text-rose-600 font-bold ml-1">{fieldErrors.loginEmail}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#134431]/20 focus:border-[#134431]"
                  />
                </div>
                {fieldErrors.loginPassword && <p className="text-[10px] text-rose-600 font-bold ml-1">{fieldErrors.loginPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#134431] hover:bg-[#0c2e21] text-white font-headline font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                ) : (
                  <>
                    <span>Verify Authority Credentials</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= SIGN IN: STEP 2 (DEPARTMENT VERIFICATION) ================= */}
          {mode === "signin" && step === 2 && (
            <form onSubmit={handleSignInStep2} className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-[#edf7f1] border border-[#cbe7d7] space-y-1 text-center sm:text-left">
                <p className="text-xs font-bold text-[#134431]">Officer Authenticated: {signedInUser?.name || loginEmail}</p>
                <p className="text-[11px] text-slate-600 font-medium">Please select your operational department and provide your department access security key.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Department Division
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#134431]/20 focus:border-[#134431]"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.icon} {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Department Security Access Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Enter security key (e.g. BMC-2026)"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#134431]/20 focus:border-[#134431]"
                  />
                </div>
                {fieldErrors.accessCode && <p className="text-[10px] text-rose-600 font-bold ml-1">{fieldErrors.accessCode}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#134431] hover:bg-[#0c2e21] text-white font-headline font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                ) : (
                  <>
                    <span>Unlock Operations Console</span>
                    <ShieldCheck className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-bold pt-1"
              >
                ← Back to Credentials
              </button>
            </form>
          )}

          {/* ================= REGISTRATION: STEP 1 ================= */}
          {mode === "register" && step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Er. Ananya Sen"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#134431]"
                  />
                </div>
                {fieldErrors.fullName && <p className="text-[10px] text-rose-600 font-bold ml-1">{fieldErrors.fullName}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Official Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 94370 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#134431]"
                  />
                </div>
                {fieldErrors.phone && <p className="text-[10px] text-rose-600 font-bold ml-1">{fieldErrors.phone}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Official Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="officer@bmc.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#134431]"
                  />
                </div>
                {fieldErrors.email && <p className="text-[10px] text-rose-600 font-bold ml-1">{fieldErrors.email}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#134431] hover:bg-[#0c2e21] text-white font-headline font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Dispatch Email Verification OTP</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}

          {/* ================= REGISTRATION: STEP 2 (OTP) ================= */}
          {mode === "register" && step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fadeIn text-center">
              <div className="p-4 rounded-2xl bg-[#edf7f1] border border-[#cbe7d7] space-y-1">
                <p className="text-xs font-bold text-[#134431]">OTP Dispatched to {email}</p>
                <p className="text-[11px] text-slate-600">Please enter the 6-digit cryptographic verification code.</p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-3.5 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:border-[#134431]"
                />
                {fieldErrors.otp && <p className="text-[10px] text-rose-600 font-bold mt-1">{fieldErrors.otp}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#134431] hover:bg-[#0c2e21] text-white font-headline font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Verify OTP</span><Check className="w-4 h-4" /></>}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 hover:text-slate-800 font-bold"
              >
                ← Back to Details
              </button>
            </form>
          )}

          {/* ================= REGISTRATION: STEP 3 (DEPARTMENT & PASSWORD) ================= */}
          {mode === "register" && step === 3 && (
            <form onSubmit={handleRegister} className="space-y-4 animate-fadeIn">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Department Division</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#134431]"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.icon} {d.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Department Access Security Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="Enter official department code (e.g. BMC-2026)"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#134431]"
                  />
                </div>
                {fieldErrors.accessCode && <p className="text-[10px] text-rose-600 font-bold ml-1">{fieldErrors.accessCode}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Create Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#134431]"
                  />
                </div>
                {fieldErrors.password && <p className="text-[10px] text-rose-600 font-bold ml-1">{fieldErrors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#134431] hover:bg-[#0c2e21] text-white font-headline font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Provision Authority Account</span><ShieldCheck className="w-4 h-4" /></>}
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-bold"
              >
                ← Back to OTP
              </button>
            </form>
          )}

        </div>
      </div>

    </div>
  );
}
