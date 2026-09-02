"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { authApi, normalizeUser } from "@/lib/api/auth";
import { setAccessToken } from "@/lib/auth/auth-service-cookie3";
import { GoogleLogin } from "@react-oauth/google";
import {
  Sun,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { switchRole, setUser } = useApp();

  // Form states
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & validation states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDemoCitizenLogin = (preset: "citizen" | "active_citizen") => {
    setIsLoading(true);
    setError(null);
    const demoUser = normalizeUser({
      id: preset === "citizen" ? "USR-9482" : "USR-1088",
      name: preset === "citizen" ? "Aarav Sharma" : "Priya Patnaik",
      username: preset === "citizen" ? "aarav_citizen" : "priya_civic",
      email: preset === "citizen" ? "aarav.sharma@example.com" : "priya.patnaik@example.com",
      phone: "+91 98765 43210",
      role: "citizen",
      ward: "ITER College Road",
      wardNumber: 63,
      pincode: "751024",
      civicCitizenXP: preset === "citizen" ? 340 : 1250,
      level: preset === "citizen" ? 2 : 4,
      levelTitle: preset === "citizen" ? "Engaged Resident" : "Ward Vanguard",
      verifiedCitizen: true,
    });

    const demoToken = "demo_jwt_token_" + Date.now();
    if (typeof window !== "undefined") {
      localStorage.setItem("janseva_token", demoToken);
      localStorage.setItem("janseva_user", JSON.stringify(demoUser));
    }
    setAccessToken(demoToken);
    setUser(demoUser);
    switchRole("citizen");
    setSuccessMessage(`Signed in as ${demoUser.name}`);
    setTimeout(() => {
      router.push("/feed");
    }, 400);
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = credentialResponse.credential;
      if (!token) {
        setError("Google did not return an authorization credential.");
        setIsLoading(false);
        return;
      }

      const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${API}/api/auth/google/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token })
      });

      const data = await res.json();

      if (res.ok && data) {
        if (typeof window !== "undefined") {
          if (data.access) {
            localStorage.setItem("janseva_token", data.access);
            setAccessToken(data.access);
          }
          if (data.user) {
            const normalized = normalizeUser(data.user);
            localStorage.setItem("janseva_user", JSON.stringify(normalized));
            setUser(normalized);
            switchRole(normalized.role || "citizen");
          }
        }
        setSuccessMessage("Google Sign-In successful! Redirecting...");
        setTimeout(() => {
          router.push("/feed");
        }, 600);
      } else {
        setError(data.error || data.details || "Google authentication failed.");
      }
    } catch (e: any) {
      console.error("Google sign in error:", e);
      setError(e.message || "An unexpected error occurred during Google Sign In.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!identifier.trim()) errors.identifier = "Please enter your email, username, or phone";
    if (!password) errors.password = "Please enter your password";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({
        username: identifier,
        password,
      });

      if (response.success && response.user) {
        setSuccessMessage("Login successful! Redirecting...");

        if (response.token) {
          localStorage.setItem("janseva_token", response.token);
          setAccessToken(response.token);
        }
        localStorage.setItem("janseva_user", JSON.stringify(response.user));
        setUser(response.user);

        switchRole(response.user.role || "citizen");

        setTimeout(() => {
          router.push("/feed");
        }, 500);
      } else {
        setError(response.message || "Invalid credentials. Please try again or use Quick Demo Sign In.");
        if (response.errors) setFieldErrors(response.errors);
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected connection error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 bg-slate-950 font-body overflow-hidden">

      {/* 1. Fullscreen Foggy Forest Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/foggy-forest.jpg')`,
        }}
      />

      {/* Subtle Ambient Vignette Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* 2. Glassmorphic Login Card - Wider, more compact & ultra-transparent */}
      <div className="relative z-10 w-full max-w-[560px] rounded-[2rem] bg-slate-950/30 backdrop-blur-xl border border-white/20 p-6 sm:p-8 shadow-2xl shadow-black/60 space-y-4 text-white animate-fadeIn">

        {/* Top Centered Glowing Sun Emblem */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-full border border-white/30 bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto text-white shadow-inner">
            <Sun className="w-5 h-5 text-white/90 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h1 className="font-headline font-black text-2xl sm:text-3xl text-white tracking-tight">
              Welcome back!
            </h1>
            <p className="text-xs text-white/70 max-w-sm mx-auto leading-relaxed font-normal">
              Sign in to access your guided civic resolutions, daily practices, and personal journey
            </p>
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

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3 text-left">

          {/* Email / Username Field */}
          <div className="space-y-1">
            <label
              htmlFor="identifier"
              className="block text-[11px] font-medium text-white/75 ml-1"
            >
              Email
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (fieldErrors.identifier) setFieldErrors((prev) => ({ ...prev, identifier: "" }));
              }}
              placeholder="Enter your email"
              className={cn(
                "w-full px-4 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder:text-white/40 text-xs sm:text-sm focus:outline-none focus:bg-white/[0.15] focus:border-white/50 transition-all",
                fieldErrors.identifier ? "border-rose-400/80 ring-1 ring-rose-400" : ""
              )}
            />
            {fieldErrors.identifier && (
              <p className="text-[10px] text-rose-300 ml-1 font-medium">{fieldErrors.identifier}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label
              htmlFor="password"
              className="block text-[11px] font-medium text-white/75 ml-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
                }}
                placeholder="••••••"
                className={cn(
                  "w-full pl-4 pr-11 py-2.5 rounded-xl bg-white/[0.08] border border-white/20 text-white placeholder:text-white/40 text-xs sm:text-sm focus:outline-none focus:bg-white/[0.15] focus:border-white/50 transition-all",
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-0.5 px-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-white/75 hover:text-white transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded bg-white/10 border-white/30 text-emerald-500 focus:ring-0 focus:outline-none cursor-pointer"
              />
              <span className="text-[11px]">Remember me</span>
            </label>

            <Link
              href="/forgot-password"
              className="text-[11px] text-white/75 hover:text-white hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Solid White Pill Log In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-headline font-bold text-xs sm:text-sm shadow-xl shadow-black/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-1 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-900" />
                <span>Logging In...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center py-0.5">
          <div className="flex-grow border-t border-white/15"></div>
          <span className="flex-shrink mx-3 text-[11px] text-white/50 font-medium">
            Or
          </span>
          <div className="flex-grow border-t border-white/15"></div>
        </div>

        {/* Google Sign In Button (Exact match to reference image) */}
        <div className="flex justify-center pt-0.5">
          <div className="relative w-full">
            <div className="w-full py-2.5 sm:py-3 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/20 hover:border-white/30 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer select-none">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Sign In with Google</span>
            </div>

            {/* Transparent overlay triggering native Google OAuth */}
            <div className="absolute inset-0 opacity-0 overflow-hidden cursor-pointer [&>div]:w-full [&>div]:h-full [&>div>iframe]:w-full [&>div>iframe]:h-full [&>div>iframe]:scale-150">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("Google Sign In failed. Please try again.")}
                useOneTap={false}
                shape="pill"
                width="400"
              />
            </div>
          </div>
        </div>

        {/* 1-Click Quick Demo Sign In for Evaluators & Instant Access */}
        <div className="pt-2">
          <div className="p-3 rounded-2xl bg-white/[0.06] border border-white/15 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white/90 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>1-Click Instant Demo Login</span>
              </span>
              <span className="text-[10px] text-white/50">For quick testing</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDemoCitizenLogin("citizen")}
                className="py-2 px-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-200 hover:text-white text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Aarav (Citizen)</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoCitizenLogin("active_citizen")}
                className="py-2 px-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 hover:text-white text-[11px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Priya (Lv.4 XP)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Link & Officer Portal Access */}
        <div className="pt-1 text-center text-xs text-white/70 space-y-2.5">
          <div>
            <span>Don&apos;t have an account? </span>
            <Link
              href="/register"
              className="text-white font-bold hover:underline ml-1"
            >
              Sign Up
            </Link>
          </div>

          <div className="pt-2 border-t border-white/10">
            <Link
              href="/officer-portal"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 hover:text-emerald-200 text-xs font-bold transition-all"
            >
              <span>🏛️ Municipal Officer / Authority Sign In →</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
