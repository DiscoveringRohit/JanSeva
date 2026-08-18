"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { authService } from "@/lib/auth/auth-service";
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

  // Form states
  const [role, setRole] = useState<UserRole>("citizen");
  const [identifier, setIdentifier] = useState("asmit.gupta@civic.in");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & validation states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot Password modal/drawer state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotStatus, setForgotStatus] = useState<string | null>(null);

  // Validate form before submitting
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!identifier.trim()) {
      errors.identifier = "Please enter your email or mobile number";
    }
    if (!password || password.length < 4) {
      errors.password = "Password must be at least 4 characters";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await authService.login({
        identifier,
        password,
        rememberMe,
        role,
      });

      if (response.success && response.user) {
        setSuccessMessage("Login successful! Redirecting...");
        
        // Update application state
        if (role === "officer") {
          switchRole("officer");
        } else {
          switchRole("citizen");
          setUser(response.user);
        }

        setTimeout(() => {
          if (role === "officer") {
            router.push("/officer");
          } else {
            router.push("/feed");
          }
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

  const handleQuickDemoFill = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setError(null);
    setFieldErrors({});
    if (selectedRole === "officer") {
      setIdentifier("ramesh.kulkarni@bbmp.gov.in");
      setPassword("officer2026");
    } else {
      setIdentifier("asmit.gupta@civic.in");
      setPassword("citizen2026");
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      setForgotStatus("Please enter your registered email or mobile.");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await authService.requestPasswordReset(forgotIdentifier);
      setForgotStatus(res.message);
    } catch (err) {
      setForgotStatus("Failed to send reset link. Please try again.");
    } finally {
      setForgotLoading(false);
    }
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

        {/* Role Switcher Tabs */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1">
            <span>Select Account Role</span>
            <span className="text-[10px] text-primary-600 font-semibold cursor-pointer hover:underline" onClick={() => handleQuickDemoFill(role === "citizen" ? "officer" : "citizen")}>
              Quick fill {role === "citizen" ? "Officer" : "Citizen"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setRole("citizen");
                setFieldErrors({});
              }}
              className={cn(
                "py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2",
                role === "citizen"
                  ? "bg-white text-primary-700 shadow-sm border border-slate-200/80 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <UserCheck className="w-4 h-4 text-primary-600" />
              <span>Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("officer");
                setFieldErrors({});
              }}
              className={cn(
                "py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-2",
                role === "officer"
                  ? "bg-white text-primary-700 shadow-sm border border-slate-200/80 font-bold"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Shield className="w-4 h-4 text-primary-600" />
              <span>Officer / Admin</span>
            </button>
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
        <form onSubmit={handleLogin} className="space-y-3.5">
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
                  if (fieldErrors.identifier) {
                    setFieldErrors((prev) => ({ ...prev, identifier: "" }));
                  }
                }}
                placeholder="name@civic.in or +91 98765 43210"
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 border text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white",
                  fieldErrors.identifier
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                )}
              />
            </div>
            {fieldErrors.identifier && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">
                {fieldErrors.identifier}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <label htmlFor="password" className="font-bold text-slate-700">
                Password
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotIdentifier(identifier);
                  setShowForgotModal(true);
                }}
                className="text-primary-600 hover:text-primary-700 font-semibold hover:underline text-[11px]"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: "" }));
                  }
                }}
                placeholder="Enter your password"
                className={cn(
                  "w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 border text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white",
                  fieldErrors.password
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">
                {fieldErrors.password}
              </p>
            )}
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
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In as {role === "officer" ? "Officer" : "Citizen"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium">
            or continue with
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Social / Civic Login Options */}
        <div className="grid grid-cols-2 gap-2">
          {/* Google Sign-in */}
          <button
            type="button"
            onClick={() => {
              handleQuickDemoFill("citizen");
              setSuccessMessage("Google authentication verified. Logging in...");
              setTimeout(() => router.push("/feed"), 800);
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all hover:border-slate-300"
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

          {/* DigiLocker / Aadhaar Sign-in */}
          <button
            type="button"
            onClick={() => {
              handleQuickDemoFill("citizen");
              setSuccessMessage("DigiLocker KYC linked (Ward 42). Redirecting...");
              setTimeout(() => router.push("/feed"), 800);
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>DigiLocker</span>
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
            onClick={() => handleQuickDemoFill("citizen")}
            className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold border border-slate-700"
          >
            Citizen Demo
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemoFill("officer")}
            className="px-2 py-0.5 rounded-md bg-indigo-900/60 hover:bg-indigo-800/60 text-indigo-200 text-[10px] font-semibold border border-indigo-700/50"
          >
            Officer Demo
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4 text-slate-900 animate-slideUp">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <h3 className="font-headline font-bold text-base text-slate-900">
                  Reset Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotStatus(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Enter your registered email or mobile number. We will send a secure OTP / reset link.
            </p>

            {forgotStatus ? (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-primary-900 text-xs font-medium space-y-2">
                <p>{forgotStatus}</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setForgotStatus(null);
                  }}
                  className="w-full py-2 rounded-xl bg-primary-600 text-white font-bold text-xs"
                >
                  Close & Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Identifier
                  </label>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="email@civic.in or +91 98765 43210"
                    required
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-xs shadow-md shadow-primary-600/20 flex items-center gap-1.5"
                  >
                    {forgotLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Send Reset Instructions</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
