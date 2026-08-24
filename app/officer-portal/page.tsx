"use client";

import React, { useState } from "react";
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
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEPARTMENTS = ["Electricity", "Water", "Roads", "Sanitation", "Municipal"];

export default function OfficerPortalPage() {
  const router = useRouter();
  const { setUser } = useApp();

  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Details (Registration)
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  
  // Step 1: Details (Sign In)
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signedInUser, setSignedInUser] = useState<any>(null);

  // Step 2: OTP (Registration only)
  const [otp, setOtp] = useState("");

  // Step 3 (Registration) or Step 2 (Sign In): Access
  const [department, setDepartment] = useState("Electricity");
  const [accessCode, setAccessCode] = useState("");
  const [password, setPassword] = useState("");

  // Status & validation states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  React.useEffect(() => {
    const userStr = typeof window !== "undefined" ? localStorage.getItem("janseva_user") : null;
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u && (u.role === "officer" || u.role === "corporator")) {
          const dept = u.department || "municipal";
          router.push(`/officer/${dept.toLowerCase()}`);
        }
      } catch (e) {}
    }
  }, [router]);

  // =============== SIGN IN LOGIC ===============
  const validateSignIn = () => {
    const errors: Record<string, string> = {};
    if (!loginEmail.trim() || !loginEmail.includes("@")) errors.loginEmail = "Please enter a valid email";
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
          setError("Access Denied: This account is registered as a Citizen. Please use the Citizen Portal.");
        } else {
          setSignedInUser(res.user);
          if (res.user.department) {
            setDepartment(res.user.department);
          }
          setSuccessMessage("Credentials Verified");
          setTimeout(() => {
            setSuccessMessage(null);
            setStep(2);
          }, 800);
        }
      } else {
        setError(res.message || "Invalid credentials");
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!accessCode.trim()) {
      setFieldErrors({ accessCode: "Department access code is required" });
      return;
    }
    
    // Validate if the user is trying to log into a different department than they are registered for
    if (signedInUser && signedInUser.department && signedInUser.department.toLowerCase() !== department.toLowerCase()) {
      setError(`Access Denied: You are officially registered under the ${signedInUser.department} department. You cannot access ${department}.`);
      return;
    }
    
    setIsLoading(true);
    // Simulate department code verification
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage("Access Granted");
      if (signedInUser) setUser(signedInUser); // Update the global context!
      setTimeout(() => {
        router.push(`/officer/${department.toLowerCase()}`);
      }, 500);
    }, 800);
  };

  // =============== REGISTRATION LOGIC ===============
  const validateRegStep1 = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = "Please enter your full name";
    if (!phone.trim() || !/^[0-9+]{10,14}$/.test(phone.trim())) errors.phone = "Please enter a valid phone number";
    if (!email.trim() || !email.includes("@")) errors.email = "Please enter a valid email";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateRegStep1()) return;

    setIsLoading(true);
    try {
      const res = await authApi.sendOtp(email || phone, 'email');
      if (res.success) {
        setSuccessMessage("OTP sent successfully!");
        setTimeout(() => {
          setSuccessMessage(null);
          setStep(2);
        }, 1000);
      } else {
        setError(res.message || "Failed to send OTP");
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
      setFieldErrors({ otp: "Enter a valid OTP" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp(email, otp);
      if (res.success || (res.message && res.message.includes("success"))) {
        setSuccessMessage("OTP verified!");
        setTimeout(() => {
          setSuccessMessage(null);
          setStep(3);
        }, 1000);
      } else {
        setError(res.message || "Invalid OTP");
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
    if (!accessCode.trim()) errors.accessCode = "Department password is required";
    if (!password.trim() || password.length < 6) errors.password = "Create a password of at least 6 characters";
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.officerRegister({
        fullName,
        email,
        phone,
        department,
        password,
      });

      if (res.success && res.user) {
        setSuccessMessage("Account created successfully! Redirecting...");
        setUser(res.user);
        setTimeout(() => {
          router.push(`/officer/${department.toLowerCase()}`);
        }, 1500);
      } else {
        setError(res.message || "Registration failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error during registration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[40vh] bg-indigo-900 rounded-b-[40px] shadow-2xl -z-0"></div>
      <div className="absolute top-10 left-10 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full"></div>
      <div className="absolute top-20 right-20 w-96 h-96 bg-blue-500/10 blur-3xl rounded-full"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl z-10 p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/40">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-black font-headline text-center text-slate-900 mb-1">
          Authority Portal
        </h2>
        <p className="text-center text-xs text-slate-500 mb-6 font-medium">
          Authorized Municipal Personnel Only
        </p>

        {/* Toggle Mode */}
        {step === 1 && (
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                mode === "signin" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={cn(
                "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                mode === "register" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              New Authority
            </button>
          </div>
        )}

        {/* Error / Success Messages */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3 animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-semibold text-rose-700 leading-tight">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-sm font-bold text-emerald-700">{successMessage}</p>
          </div>
        )}

        {/* ===================== SIGN IN FLOW ===================== */}
        {mode === "signin" && step === 1 && (
          <form onSubmit={handleSignInStep1} className="space-y-4 animate-fadeIn">
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" placeholder="officer@bmc.gov.in" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                {fieldErrors.loginEmail && <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{fieldErrors.loginEmail}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" placeholder="••••••••" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                {fieldErrors.loginPassword && <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{fieldErrors.loginPassword}</p>}
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-headline font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {mode === "signin" && step === 2 && (
          <form onSubmit={handleSignInStep2} className="space-y-4 animate-fadeIn">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-bold text-lg">Department Verification</h3>
              <p className="text-xs text-slate-500 mt-1">Select your assignment and verify department code.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Department</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Department Access Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" placeholder="••••••••" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                {fieldErrors.accessCode && <p className="text-rose-500 text-xs mt-1 ml-1">{fieldErrors.accessCode}</p>}
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-headline font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Grant Access</span><CheckCircle2 className="w-4 h-4" /></>}
            </button>
            <div className="text-center">
              <button type="button" onClick={() => setStep(1)} className="text-[11px] text-slate-500 hover:text-slate-800 underline mt-2">Back</button>
            </div>
          </form>
        )}

        {/* ===================== REGISTER FLOW ===================== */}
        {mode === "register" && step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4 animate-fadeIn">
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Officer Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                {fieldErrors.fullName && <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{fieldErrors.fullName}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Official Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                {fieldErrors.phone && <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{fieldErrors.phone}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Official Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" placeholder="officer@bmc.gov.in" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                {fieldErrors.email && <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{fieldErrors.email}</p>}
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-headline font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Send OTP via Email</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {mode === "register" && step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-bold text-lg">Verify your identity</h3>
              <p className="text-xs text-slate-500 mt-1">We sent an OTP to {email}</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1 text-center">Enter 6-digit OTP</label>
              <input type="text" placeholder="• • • • • •" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full text-center tracking-[0.5em] font-mono text-xl py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" maxLength={6} />
              {fieldErrors.otp && <p className="text-[10px] text-red-500 mt-1 text-center font-medium">{fieldErrors.otp}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-headline font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Verify OTP</span><CheckCircle2 className="w-4 h-4" /></>}
            </button>
            <div className="text-center">
              <button type="button" onClick={() => setStep(1)} className="text-[11px] text-slate-500 hover:text-slate-800 underline mt-2">Back to Details</button>
            </div>
          </form>
        )}

        {mode === "register" && step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4 animate-fadeIn">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-bold text-lg">Department Access</h3>
              <p className="text-xs text-slate-500 mt-1">Select your department and enter your secure access code.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Department</label>
                <select value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none">
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Department Access Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" placeholder="••••••••" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                {fieldErrors.accessCode && <p className="text-rose-500 text-xs mt-1 ml-1">{fieldErrors.accessCode}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Create Account Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                {fieldErrors.password && <p className="text-rose-500 text-xs mt-1 ml-1">{fieldErrors.password}</p>}
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-headline font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Register & Authenticate</span><CheckCircle2 className="w-4 h-4" /></>}
            </button>
            <div className="text-center">
              <button type="button" onClick={() => setStep(2)} className="text-[11px] text-slate-500 hover:text-slate-800 underline mt-2">Back to OTP</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
