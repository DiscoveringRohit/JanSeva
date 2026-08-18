"use client";

import React, { useState } from "react";
import Link from "next/link";
import { authService } from "@/lib/auth/auth-service";
import { Sparkles, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [identifier, setIdentifier] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatusMessage(null);

    if (!identifier.trim()) {
      setError("Please enter your registered email or mobile number.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authService.requestPasswordReset(identifier.trim());
      if (res.success) {
        setIsSuccess(true);
        setStatusMessage(res.message);
      } else {
        setError(res.message || "Failed to process reset request.");
      }
    } catch (err) {
      setError("Unable to process password reset request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F4F6FB] text-[#172033] font-body">
      
      {/* Top Header */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between px-1">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#657089] hover:text-[#4B3BD5] transition-colors"
        >
          <span>← Back to Sign In</span>
        </Link>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F0EFFF] text-[#4B3BD5] border border-[#DFE5EF]">
          Password Reset
        </span>
      </div>

      {/* Main Password Reset Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-[#DFE5EF] space-y-6">
        
        {/* Logo & Header */}
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
            <h1 className="font-headline font-bold text-2xl text-[#172033]">
              Reset your password
            </h1>
            <p className="text-xs text-[#657089] font-normal mt-1">
              Enter your email and we&apos;ll send you a password reset link.
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {isSuccess && statusMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Reset Link Sent!</span>
            </div>
            <p className="text-[#657089]">{statusMessage}</p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Reset Form */}
        {!isSuccess && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#172033]">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657089]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your registered email"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F7F9FC] border border-[#DFE5EF] rounded-xl text-xs text-[#172033] placeholder-[#657089] focus:outline-none focus:ring-2 focus:ring-[#4B3BD5]/30 focus:border-[#4B3BD5] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#4B3BD5] hover:bg-[#3F32BD] text-white font-bold text-xs rounded-xl shadow-md shadow-[#4B3BD5]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="text-center pt-2 border-t border-[#DFE5EF]">
          <p className="text-xs text-[#657089]">
            Remember your password?{" "}
            <Link
              href="/login"
              className="font-bold text-[#4B3BD5] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
