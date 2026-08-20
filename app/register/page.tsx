"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { authApi } from "@/lib/api/auth";
import { UserRole } from "@/lib/auth/auth-types";
import {
  Sparkles,
  Shield,
  UserCheck,
  Lock,
  Mail,
  User,
  MapPin,
  Building,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  KeyRound,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

// Hardcoded for demo/hackathon (matching backend expected names)
const STATES = ["Odisha"];
const CITIES = { "Odisha": ["Bhubaneswar"] };
const WARDS = { "Bhubaneswar": ["Ward 63"] };
const PINCODES = { "Ward 63": ["751030"] };

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useApp();

  const ENABLE_DEMO = typeof process !== "undefined" && process.env.NEXT_PUBLIC_ENABLE_DEMO === "true";

  // Flow State
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Details
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedState, setSelectedState] = useState("Odisha");
  const [city, setCity] = useState("Bhubaneswar");
  const [ward, setWard] = useState("Ward 63");
  const [pincode, setPincode] = useState("751030");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Step 2: OTP
  const [otp, setOtp] = useState("");

  // Step 3: Credentials
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & validation states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleQuickDemoFill = () => {
    if (!ENABLE_DEMO) return;
    setFullName("Priya Sharma");
    setPhone("9876543210");
    setEmail("priya@example.com");
    setAgreedToTerms(true);
  };

  const validateStep1 = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = "Please enter your full name";
    if (!phone.trim() || !/^[0-9+]{10,14}$/.test(phone.trim())) errors.phone = "Please enter a valid phone number";
    if (!email.trim() || !email.includes("@")) errors.email = "Please enter a valid email";
    if (!agreedToTerms) errors.agreedToTerms = "You must agree to the Terms";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateStep1()) return;

    setIsLoading(true);
    try {
      const res = await authApi.sendOtp(email, 'email');
      if (res.success || res.message) {
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
        setUsername(phone); // default username suggestion
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
    if (!username.trim()) {
      setFieldErrors({ username: "Username is required" });
      return;
    }
    if (!password || password.length < 6) {
      setFieldErrors({ password: "Password must be at least 6 characters" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.register({
        fullName,
        phone,
        email,
        state: selectedState,
        city,
        ward,
        pincode,
        username,
        password,
        role: "citizen",
        agreedToTerms,
      });

      if (res.success && res.user && res.token) {
        setSuccessMessage("Account created successfully!");
        
        // TODO: Move to httpOnly cookie before production
        localStorage.setItem("janseva_token", res.token);
        localStorage.setItem("janseva_user", JSON.stringify(res.user));
        setUser(res.user);

        setTimeout(() => {
          router.push("/feed");
        }, 1000);
      } else {
        setError(res.message || "Registration failed");
        if (res.errors) setFieldErrors(res.errors);
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden font-body py-10">
      <div className="absolute top-1/6 left-1/5 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-primary-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/6 right-1/5 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg mb-3 flex items-center justify-between px-2 text-xs text-slate-400">
        <Link href="/login" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
          <span>←</span>
          <span>Back to Sign In</span>
        </Link>
        <div className="flex items-center gap-1.5 font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Join JanSeva Civic Network</span>
        </div>
      </div>

      <div className="w-full max-w-lg bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 relative z-10 backdrop-blur-xl space-y-5 animate-slideUp">
        
        <div className="text-center space-y-1.5">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-primary-600/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-black text-2xl tracking-tight text-slate-900 leading-none">
                  Jan<span className="text-primary-600">Seva</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">BMC & Smart Cities Portal</p>
            </div>
          </Link>
          <div className="pt-2">
            <h1 className="font-headline font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
              Create your account (Step {step} of 3)
            </h1>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl flex items-start gap-2 border border-red-100 animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-xl flex items-center gap-2 border border-emerald-100 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* STEP 1: Details */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1">
              <span>Account Information</span>
              <span className="text-[10px] text-primary-600 font-semibold cursor-pointer hover:underline" onClick={handleQuickDemoFill}>
                Fill sample info
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Rahul Kumar" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                </div>
                {fieldErrors.fullName && <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{fieldErrors.fullName}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" placeholder="9876543210" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                </div>
                {fieldErrors.phone && <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{fieldErrors.phone}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" placeholder="rahul@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                </div>
                {fieldErrors.email && <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{fieldErrors.email}</p>}
              </div>

              {/* Cascading Location */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">State</label>
                  <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 outline-none">
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">City</label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 outline-none">
                    {CITIES[selectedState as keyof typeof CITIES]?.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Ward</label>
                  <select value={ward} onChange={(e) => setWard(e.target.value)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 outline-none">
                    {WARDS[city as keyof typeof WARDS]?.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Pincode</label>
                  <select value={pincode} onChange={(e) => setPincode(e.target.value)} className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 outline-none">
                    {PINCODES[ward as keyof typeof PINCODES]?.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <label className="flex items-start gap-2.5 p-1 mt-2 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="peer sr-only" />
                  <div className="w-4 h-4 rounded-[4px] border-2 border-slate-300 peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-colors" />
                  <CheckCircle2 className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                </div>
                <span className="text-[11px] text-slate-500 leading-tight">
                  I agree to the <span className="text-primary-600 font-bold group-hover:underline">Terms of Service</span> and <span className="text-primary-600 font-bold group-hover:underline">Privacy Policy</span>
                </span>
              </label>
              {fieldErrors.agreedToTerms && <p className="text-[10px] text-red-500 ml-7 font-medium">{fieldErrors.agreedToTerms}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-headline font-bold text-sm shadow-lg shadow-primary-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Send OTP via Email</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3 text-emerald-600">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-bold text-lg">Verify your email</h3>
              <p className="text-xs text-slate-500 mt-1">We sent an OTP to {email}</p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1 text-center">Enter 6-digit OTP</label>
              <input type="text" placeholder="• • • • • •" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full text-center tracking-[0.5em] font-mono text-xl py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" maxLength={6} />
              {fieldErrors.otp && <p className="text-[10px] text-red-500 mt-1 text-center font-medium">{fieldErrors.otp}</p>}
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-headline font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Verify OTP</span><CheckCircle2 className="w-4 h-4" /></>}
            </button>
            <div className="text-center">
              <button type="button" onClick={() => setStep(1)} className="text-[11px] text-slate-500 hover:text-slate-800 underline mt-2">Back to Details</button>
            </div>
          </form>
        )}

        {/* STEP 3: Credentials */}
        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-bold text-lg">Create Credentials</h3>
              <p className="text-xs text-slate-500 mt-1">Almost done! Create a username and password.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="janseva_user" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                </div>
                {fieldErrors.username && <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{fieldErrors.username}</p>}
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{fieldErrors.password}</p>}
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-headline font-bold text-sm shadow-lg shadow-primary-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Create Account</span><CheckCircle2 className="w-4 h-4" /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
