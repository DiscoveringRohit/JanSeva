"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { authApi } from "@/lib/api/auth";
import {
  Sun,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Mail,
  User,
  Phone,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { INDIAN_STATES, CITIES_BY_STATE } from "@/lib/data/india-locations";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useApp();

  // Flow State
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Details
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [gender, setGender] = useState("");
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
      if (res.success) {
        setSuccessMessage("OTP sent to your email!");
        setTimeout(() => {
          setSuccessMessage(null);
          setStep(2);
        }, 800);
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
      if (res.success) {
        setSuccessMessage("OTP verified!");
        setUsername(email ? email.split('@')[0] : phone);
        setTimeout(() => {
          setSuccessMessage(null);
          setStep(3);
        }, 800);
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
        gender,
        state: selectedState,
        city,
        pincode,
        username,
        password,
        role: "citizen",
        agreedToTerms,
      });

      if (res.success && res.user && res.token) {
        setSuccessMessage("Account created successfully!");
        
        localStorage.setItem("janseva_token", res.token);
        localStorage.setItem("janseva_user", JSON.stringify(res.user));
        setUser(res.user);

        setTimeout(() => {
          router.push("/feed");
        }, 800);
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
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-slate-950 font-body overflow-hidden py-10">
      
      {/* 1. Fullscreen Foggy Forest Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/foggy-forest.jpg')`,
        }}
      />

      {/* Subtle Ambient Vignette Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* 2. Glassmorphic Registration Card - Wider, compact & ultra-transparent */}
      <div className="relative z-10 w-full max-w-[580px] rounded-[2rem] bg-slate-950/30 backdrop-blur-xl border border-white/20 p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-4 text-white animate-fadeIn">
        
        {/* Top Centered Glowing Emblem */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-full border border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto text-white shadow-inner">
            <Sun className="w-5 h-5 text-white/90 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h1 className="font-headline font-black text-2xl sm:text-3xl text-white tracking-tight">
              {step === 1 && "Create your account"}
              {step === 2 && "Verify your email"}
              {step === 3 && "Secure credentials"}
            </h1>
            <p className="text-xs text-white/70 max-w-sm mx-auto leading-relaxed font-normal">
              {step === 1 && "Join thousands of active citizens making real municipal impact"}
              {step === 2 && `Enter the 6-digit code sent to ${email}`}
              {step === 3 && "Choose your citizen username and secure password"}
            </p>
          </div>

          {/* Step indicator dots */}
          <div className="flex items-center justify-center gap-2 pt-0.5">
            <div className={cn("h-1.5 rounded-full transition-all", step >= 1 ? "bg-white w-6" : "bg-white/30 w-2")} />
            <div className={cn("h-1.5 rounded-full transition-all", step >= 2 ? "bg-white w-6" : "bg-white/30 w-2")} />
            <div className={cn("h-1.5 rounded-full transition-all", step >= 3 ? "bg-white w-6" : "bg-white/30 w-2")} />
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/25 border border-rose-400/40 text-rose-100 text-xs flex items-center gap-2 animate-fadeIn text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 rounded-xl bg-emerald-500/25 border border-emerald-400/40 text-emerald-100 text-xs flex items-center gap-2 animate-fadeIn text-left">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-300" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: Details */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-3 text-left">
            
            {/* Full Name & Phone Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-white/75 ml-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Rahul Kumar"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: "" }));
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder:text-white/40 text-xs focus:outline-none focus:bg-white/[0.15] focus:border-white/50 transition-all",
                    fieldErrors.fullName ? "border-rose-400/80 ring-1 ring-rose-400" : ""
                  )}
                />
                {fieldErrors.fullName && <p className="text-[10px] text-rose-300 ml-1 font-medium">{fieldErrors.fullName}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-white/75 ml-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: "" }));
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder:text-white/40 text-xs focus:outline-none focus:bg-white/[0.15] focus:border-white/50 transition-all",
                    fieldErrors.phone ? "border-rose-400/80 ring-1 ring-rose-400" : ""
                  )}
                />
                {fieldErrors.phone && <p className="text-[10px] text-rose-300 ml-1 font-medium">{fieldErrors.phone}</p>}
              </div>
            </div>

            {/* Email & Gender Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-white/75 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: "" }));
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder:text-white/40 text-xs focus:outline-none focus:bg-white/[0.15] focus:border-white/50 transition-all",
                    fieldErrors.email ? "border-rose-400/80 ring-1 ring-rose-400" : ""
                  )}
                />
                {fieldErrors.email && <p className="text-[10px] text-rose-300 ml-1 font-medium">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-white/75 ml-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs focus:outline-none focus:border-white/50"
                >
                  <option value="" className="bg-slate-900 text-white">Select Gender</option>
                  <option value="Male" className="bg-slate-900 text-white">Male</option>
                  <option value="Female" className="bg-slate-900 text-white">Female</option>
                  <option value="Other" className="bg-slate-900 text-white">Other</option>
                </select>
              </div>
            </div>

            {/* State, City, Pincode in 3 columns */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-white/75 ml-1">
                  State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => { setSelectedState(e.target.value); setCity(""); }}
                  className="w-full px-2 sm:px-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs focus:outline-none focus:border-white/50"
                >
                  <option value="" className="bg-slate-900 text-white">State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-white/75 ml-1">
                  City
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  disabled={!selectedState}
                  className="w-full px-2 sm:px-3 py-2.5 rounded-xl bg-slate-900/90 border border-white/20 text-white text-xs focus:outline-none focus:border-white/50 disabled:opacity-40"
                >
                  <option value="" className="bg-slate-900 text-white">City</option>
                  {selectedState && CITIES_BY_STATE[selectedState]?.map(c => <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-white/75 ml-1">
                  Pincode
                </label>
                <input
                  type="text"
                  placeholder="751001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder:text-white/40 text-xs focus:outline-none focus:bg-white/[0.15] focus:border-white/50 transition-all"
                />
              </div>
            </div>

            {/* Terms agreement */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-white/75 hover:text-white transition-colors">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-white/10 border-white/30 text-emerald-500 focus:ring-0 focus:outline-none cursor-pointer"
                />
                <span className="text-[11px]">
                  I agree to the <span className="text-white font-bold underline">Terms & Privacy Policy</span>
                </span>
              </label>
              {fieldErrors.agreedToTerms && (
                <p className="text-[10px] text-rose-300 ml-1 font-medium mt-0.5">{fieldErrors.agreedToTerms}</p>
              )}
            </div>

            {/* Solid White Pill Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-headline font-bold text-xs sm:text-sm shadow-xl shadow-black/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <span>Send OTP via Email</span>
                  <ArrowRight className="w-4 h-4 text-slate-900" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-left">
            <div className="space-y-2">
              <label className="block text-center text-[11px] font-medium text-white/75">
                Enter 6-Digit Email OTP
              </label>
              <input
                type="text"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 rounded-xl bg-white/[0.08] border border-white/20 text-white focus:outline-none focus:bg-white/[0.15] focus:border-white/50 transition-all"
                maxLength={6}
              />
              {fieldErrors.otp && (
                <p className="text-[10px] text-rose-300 text-center font-medium">{fieldErrors.otp}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-headline font-bold text-xs sm:text-sm shadow-xl shadow-black/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify OTP & Continue</span>
              )}
            </button>

            <div className="text-center pt-0.5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-white/70 hover:text-white underline cursor-pointer"
              >
                ← Back to Details
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Credentials */}
        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-3 text-left">
            
            {/* Username */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-white/75 ml-1">
                Citizen Username
              </label>
              <input
                type="text"
                placeholder="janseva_citizen"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) setFieldErrors(prev => ({ ...prev, username: "" }));
                }}
                className={cn(
                  "w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder:text-white/40 text-xs focus:outline-none focus:bg-white/[0.15] focus:border-white/50 transition-all",
                  fieldErrors.username ? "border-rose-400/80 ring-1 ring-rose-400" : ""
                )}
              />
              {fieldErrors.username && (
                <p className="text-[10px] text-rose-300 ml-1 font-medium">{fieldErrors.username}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-[11px] font-medium text-white/75 ml-1">
                Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: "" }));
                  }}
                  className={cn(
                    "w-full pl-4 pr-11 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder:text-white/40 text-xs focus:outline-none focus:bg-white/[0.15] focus:border-white/50 transition-all",
                    fieldErrors.password ? "border-rose-400/80 ring-1 ring-rose-400" : ""
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[10px] text-rose-300 ml-1 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            {/* Solid White Pill Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-full bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-headline font-bold text-xs sm:text-sm shadow-xl shadow-black/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Complete Registration</span>
              )}
            </button>
          </form>
        )}

        {/* Footer Link */}
        <div className="pt-1 text-center text-xs text-white/70">
          <span>Already have an account? </span>
          <Link
            href="/login"
            className="text-white font-bold hover:underline ml-1"
          >
            Log In
          </Link>
        </div>

      </div>

    </div>
  );
}
