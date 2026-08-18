"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { authService } from "@/lib/auth/auth-service";
import { UserRole } from "@/lib/auth/auth-types";
import {
  Sparkles,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  Mail,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { setUser, switchRole } = useApp();

  // Form states
  const [role, setRole] = useState<UserRole>("citizen");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & validation states
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [pendingOfficer, setPendingOfficer] = useState(false);

  const validateForm = () => {
    if (!identifier.trim()) {
      setError(
        role === "officer"
          ? "Please enter your official email address."
          : "Please enter your email or mobile number."
      );
      return false;
    }
    if (!password) {
      setError("Please enter your password.");
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setUnverifiedEmail(null);
    setPendingOfficer(false);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await authService.login({
        identifier: identifier.trim(),
        password,
        role,
      });

      if (response.success && response.user) {
        setUser(response.user);

        if (role === "officer") {
          switchRole("officer");
          router.push("/officer");
        } else {
          switchRole("citizen");
          router.push("/feed");
        }
      } else {
        if (response.requiresVerification) {
          setUnverifiedEmail(identifier.trim());
          setError(
            response.message || "Please verify your email before signing in."
          );
        } else if (response.pendingApproval) {
          setPendingOfficer(true);
          setError(
            response.message ||
              "Your officer account is pending verification and approval."
          );
        } else {
          setError(response.message || "Invalid credentials.");
        }
      }
    } catch (err) {
      setError("Unable to connect to JanSeva. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      // Simulate/Trigger Google OAuth flow with a verified Google Identity
      const sampleEmail = identifier.includes("@")
        ? identifier.trim()
        : "asmit.gupta@civic.in";

      const response = await authService.loginWithGoogle({
        email: sampleEmail,
        name: "Asmit Gupta",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        role: "citizen",
      });

      if (response.success && response.user) {
        setUser(response.user);
        switchRole("citizen");

        if (response.needsProfileCompletion) {
          router.push(
            `/complete-profile?email=${encodeURIComponent(response.user.email)}`
          );
        } else {
          router.push("/feed");
        }
      } else {
        setError(response.message || "Google sign-in was unsuccessful.");
      }
    } catch (err) {
      setError("Google sign-in was unsuccessful. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F4F6FB] text-[#172033] font-body">
      
      {/* Top Brand Navigation */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between px-1">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#657089] hover:text-[#4B3BD5] transition-colors"
        >
          <span>← Back to JanSeva Home</span>
        </Link>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F0EFFF] text-[#4B3BD5] border border-[#DFE5EF]">
          Civic Portal 2.0
        </span>
      </div>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-[#DFE5EF] space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#4B3BD5] text-white flex items-center justify-center shadow-md shadow-[#4B3BD5]/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-black text-2xl tracking-tight text-[#172033] leading-none">
                  Jan<span className="text-[#4B3BD5]">Seva</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-[#F0EFFF] text-[#4B3BD5] border border-[#4B3BD5]/20">
                  AI 2.0
                </span>
              </div>
              <p className="text-[10px] text-[#657089] font-medium">
                AI Civic Social Network
              </p>
            </div>
          </Link>

          <div className="pt-2">
            <h1 className="font-headline font-bold text-2xl text-[#172033] tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-[#657089] font-normal mt-1">
              Sign in to report issues, follow your ward, and track civic action.
            </p>
          </div>
        </div>

        {/* Account Type Tabs */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-[#172033]">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F7F9FC] border border-[#DFE5EF] rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setRole("citizen");
                setError(null);
              }}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all",
                role === "citizen"
                  ? "bg-white text-[#4B3BD5] shadow-sm border border-[#DFE5EF]"
                  : "text-[#657089] hover:text-[#172033]"
              )}
            >
              <User className="w-4 h-4 text-[#4B3BD5]" />
              <span>Resident Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole("officer");
                setError(null);
              }}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all",
                role === "officer"
                  ? "bg-white text-[#4B3BD5] shadow-sm border border-[#DFE5EF]"
                  : "text-[#657089] hover:text-[#172033]"
              )}
            >
              <ShieldCheck className="w-4 h-4 text-[#4B3BD5]" />
              <span>Ward Officer / Staff</span>
            </button>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{error}</p>
              {unverifiedEmail && (
                <Link
                  href={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                  className="inline-block font-bold underline text-red-800 hover:text-red-900 mt-1"
                >
                  Verify your email now →
                </Link>
              )}
              {pendingOfficer && (
                <p className="text-[11px] text-red-600">
                  Officer accounts require municipal authorization before accessing the console.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Identifier Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#172033]">
              {role === "officer" ? "Official Email" : "Email or Mobile Number"}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657089]">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type={role === "officer" ? "email" : "text"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  role === "officer"
                    ? "Enter your official email"
                    : "Enter your email or mobile number"
                }
                className="w-full pl-10 pr-4 py-2.5 bg-[#F7F9FC] border border-[#DFE5EF] rounded-xl text-xs text-[#172033] placeholder-[#657089] focus:outline-none focus:ring-2 focus:ring-[#4B3BD5]/30 focus:border-[#4B3BD5] transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#172033]">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-semibold text-[#4B3BD5] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657089]">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2.5 bg-[#F7F9FC] border border-[#DFE5EF] rounded-xl text-xs text-[#172033] placeholder-[#657089] focus:outline-none focus:ring-2 focus:ring-[#4B3BD5]/30 focus:border-[#4B3BD5] transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#657089] hover:text-[#172033]"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#4B3BD5] hover:bg-[#3F32BD] text-white font-bold text-xs rounded-xl shadow-md shadow-[#4B3BD5]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Citizen Google Sign-In Option */}
        {role === "citizen" && (
          <div className="space-y-4 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#DFE5EF] w-full"></div>
              <span className="bg-white px-3 text-[11px] font-medium text-[#657089] absolute">
                or continue with
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-[#F7F9FC] border border-[#DFE5EF] rounded-xl text-xs font-semibold text-[#172033] flex items-center justify-center gap-2.5 transition-all shadow-sm disabled:opacity-60"
            >
              {googleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#4B3BD5]" />
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-[#DFE5EF]">
          <p className="text-xs text-[#657089]">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-bold text-[#4B3BD5] hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
