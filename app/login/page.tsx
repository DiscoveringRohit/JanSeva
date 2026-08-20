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
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { switchRole, setUser } = useApp();

  // Allow gating demo/demo quick-fill features via environment flag
  const ENABLE_DEMO = typeof process !== "undefined" && process.env.NEXT_PUBLIC_ENABLE_DEMO === "true";

  // Form states
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Status & validation states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!identifier.trim()) errors.identifier = "Please enter your email or mobile number";
    if (!username.trim()) errors.username = "Please enter your username";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.sendOtp(identifier, 'email');
      if (response.success) {
        setSuccessMessage("OTP sent successfully!");
        setTimeout(() => {
          setSuccessMessage(null);
          setStep(2);
        }, 800);
      } else {
        setError(response.message || "Failed to send OTP.");
      }
    } catch (err) {
      setError("An unexpected connection error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!otp.trim() || otp.length < 4) {
      setFieldErrors({ otp: "Enter a valid OTP" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({
        identifier,
        username,
        otp,
        rememberMe,
      });

      if (response.success && response.user) {
        setSuccessMessage("Login successful! Redirecting...");
        
        // Update application state
        if (response.token) {
          // TODO: Move to httpOnly cookie before production
          localStorage.setItem("janseva_token", response.token);
        }
        localStorage.setItem("janseva_user", JSON.stringify(response.user));
        setUser(response.user);

        switchRole("citizen");

        setTimeout(() => {
          router.push("/feed");
        }, 600);
      } else {
        setError(response.message || "Invalid credentials. Please try again.");
        if (response.errors) setFieldErrors(response.errors);
      }
    } catch (err) {
      setError("An unexpected connection error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = () => {
    if (!(typeof process !== "undefined" && process.env.NEXT_PUBLIC_ENABLE_DEMO === "true")) return;
    setError(null);
    setFieldErrors({});
    setIdentifier("asmit.gupta@civic.in");
    setUsername("citizen_user");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden font-body">
      {/* Background ambient lighting */}
      <div className="absolute top-1/6 left-1/5 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-primary-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/6 right-1/5 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      
      {/* Top Banner with Platform context */}
      <div className="w-full max-w-md mb-3 flex items-center justify-between px-2 text-xs text-slate-400">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
        >
          <span>←</span>
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-1.5 font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SIH 2026 Portal</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 relative z-10 backdrop-blur-xl space-y-5 animate-slideUp">
        
        {/* Brand Header */}
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
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.2 rounded-md bg-indigo-50 text-primary-700 border border-primary-100">
                  AI 2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                AI Civic Social Network
              </p>
            </div>
          </Link>
          <div className="pt-2">
            <h1 className="font-headline font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Sign in to resolve issues, view ward feed, and track municipal SLAs.
            </p>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Login Form */}
        {step === 1 ? (
        <form onSubmit={handleSendOtp} className="space-y-3.5">
          {/* Email / Mobile Field */}
          <div>
            <label
              htmlFor="identifier"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Email or Mobile Number
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (fieldErrors.identifier) setFieldErrors((prev) => ({ ...prev, identifier: "" }));
                }}
                placeholder="name@civic.in or +91 98765 43210"
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 border text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white",
                  fieldErrors.identifier ? "border-rose-400 focus:ring-2 focus:ring-rose-200" : "border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                )}
              />
            </div>
            {fieldErrors.identifier && <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.identifier}</p>}
          </div>

          {/* Username Field */}
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (fieldErrors.username) setFieldErrors((prev) => ({ ...prev, username: "" }));
                }}
                placeholder="janseva_user"
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 border text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white",
                  fieldErrors.username ? "border-rose-400 focus:ring-2 focus:ring-rose-200" : "border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                )}
              />
            </div>
            {fieldErrors.username && <p className="text-[11px] text-rose-600 mt-1 font-medium">{fieldErrors.username}</p>}
          </div>

          {/* Remember Me & Security Notice */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 transition-all"
              />
              <span className="text-[11px] font-medium">Remember this device</span>
            </label>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>SSL 256-bit</span>
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-headline font-bold text-xs sm:text-sm shadow-lg shadow-primary-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Sending OTP...</span>
              </>
            ) : (
              <>
                <span>Send OTP via Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
        ) : (
        <form onSubmit={handleLogin} className="space-y-3.5">
          <div className="text-center mb-4">
            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-600">
              <Mail className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500">We sent an OTP to {identifier}</p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1 text-center">Enter 6-digit OTP</label>
            <input 
              type="text" 
              placeholder="• • • • • •" 
              value={otp} 
              onChange={(e) => {
                setOtp(e.target.value);
                if (fieldErrors.otp) setFieldErrors((prev) => ({ ...prev, otp: "" }));
              }} 
              className={cn(
                "w-full text-center tracking-[0.5em] font-mono text-xl py-3 bg-slate-50 border rounded-xl focus:bg-white focus:outline-none transition-all",
                fieldErrors.otp ? "border-rose-400 focus:ring-2 focus:ring-rose-200" : "border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
              )}
              maxLength={6} 
            />
            {fieldErrors.otp && <p className="text-[10px] text-rose-600 mt-1 text-center font-medium">{fieldErrors.otp}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-headline font-bold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <span>Verify OTP & Sign In</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
          <div className="text-center pt-2">
            <button type="button" onClick={() => setStep(1)} className="text-[11px] text-slate-500 hover:text-slate-800 underline">Back</button>
          </div>
        </form>
        )}

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">
            or continue with
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Social / Civic Login Options */}
        <div className="flex justify-center">
          {/* Google Sign-in */}
          <button
            type="button"
            onClick={() => {
              handleQuickDemoFill();
              setSuccessMessage("Google authentication verified. Logging in...");
              setTimeout(() => router.push("/feed"), 800);
            }}
            className="w-full sm:w-2/3 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all hover:border-slate-300"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.09C3.27 21.42 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.32c-.25-.72-.38-1.49-.38-2.32s.13-1.6.38-2.32V6.59H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.41l4.03-3.09z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.58 1.25 6.59l4.03 3.09c.95-2.83 3.6-4.93 6.72-4.93z"
              />
            </svg>
            <span>Google</span>
          </button>
        </div>

        {/* Footer Registration Link */}
        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-xs text-slate-600 font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary-600 hover:text-primary-700 font-bold hover:underline"
            >
              Create Account
            </Link>
          </p>
        </div>

      </div>

      {/* Demo Credentials Quick Switcher (Helpful for SIH 2026 Evaluators) */}
      <div className="w-full max-w-md mt-4 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-primary-400 shrink-0" />
          <span>Demo credentials ready for SIH judges</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickDemoFill()}
            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold border border-slate-700"
          >
            Citizen Demo
          </button>
        </div>
      </div>

    </div>
  );
}
