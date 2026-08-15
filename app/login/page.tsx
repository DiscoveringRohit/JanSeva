"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import {
  Sparkles,
  Shield,
  UserCheck,
  Building2,
  ArrowRight,
  CheckCircle2,
  Phone,
  Lock,
  Mail,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { switchRole, user } = useApp();

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [selectedRole, setSelectedRole] = useState<"citizen" | "officer" | "corporator">("citizen");
  const [phoneOrEmail, setPhoneOrEmail] = useState("9876543210");
  const [otp, setOtp] = useState("4482");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    switchRole(selectedRole);

    setTimeout(() => {
      setIsLoading(false);
      if (selectedRole === "officer") router.push("/officer");
      else if (selectedRole === "corporator") router.push("/ward");
      else router.push("/feed");
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-950 via-slate-900 to-primary-950 text-white relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 text-on-surface rounded-4xl p-6 sm:p-8 shadow-2xl border border-white/20 relative z-10 backdrop-blur-xl space-y-6 animate-slideUp">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-primary-600/30 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-headline font-black text-2xl tracking-tight text-on-surface">
              Jan<span className="text-primary-600">Seva</span>
            </span>
          </Link>
          <p className="text-xs text-on-surface-variant font-medium">
            AI Civic Social Network • BBMP & Citizen Portal
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="space-y-1.5">
          <label className="block text-[10px] uppercase font-bold text-on-surface-variant tracking-wider text-center">
            Select Your Civic Role
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-surface-container-low border border-surface-dim text-xs font-bold">
            <button
              type="button"
              onClick={() => setSelectedRole("citizen")}
              className={cn(
                "py-2 rounded-xl transition-all flex flex-col items-center gap-1",
                selectedRole === "citizen"
                  ? "bg-primary-600 text-white shadow-md"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Citizen</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("officer")}
              className={cn(
                "py-2 rounded-xl transition-all flex flex-col items-center gap-1",
                selectedRole === "officer"
                  ? "bg-primary-600 text-white shadow-md"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Officer</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole("corporator")}
              className={cn(
                "py-2 rounded-xl transition-all flex flex-col items-center gap-1",
                selectedRole === "corporator"
                  ? "bg-primary-600 text-white shadow-md"
                  : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Council</span>
            </button>
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">
              Mobile Number or Civic ID
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-primary-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                placeholder="+91 98765 43210"
                required
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <label className="text-on-surface">One-Time Password (OTP)</label>
              <span className="text-primary-600 font-semibold cursor-pointer">Resend OTP</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-primary-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
              />
            </div>
          </div>

          {/* Aadhaar / Digilocker verification banner */}
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <p className="font-bold text-emerald-950">DigiLocker Verified</p>
                <p className="text-[10px] text-emerald-800">Direct link to Ward 42 residency</p>
              </div>
            </div>
            <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100 px-2 py-0.5 rounded-md">
              Linked ✓
            </span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-headline font-bold text-xs sm:text-sm shadow-lg shadow-primary-600/30 hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <span>Enter JanSeva Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-surface-dim">
          <Link
            href="/"
            className="text-xs font-bold text-primary-600 hover:underline"
          >
            ← Back to Platform Overview
          </Link>
        </div>

      </div>
    </div>
  );
}
