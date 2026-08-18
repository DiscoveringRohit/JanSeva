"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { authService } from "@/lib/auth/auth-service";
import { Mail, CheckCircle2, ArrowRight, Loader2, AlertCircle, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "your email address";
  const tokenParam = searchParams.get("token");

  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkToken() {
      if (tokenParam) {
        setIsVerifying(true);
        setError(null);
        const res = await authService.verifyEmailToken(tokenParam);
        setIsVerifying(false);
        if (res.success) {
          setIsVerified(true);
        } else {
          setError(res.message || "Invalid or expired verification link.");
        }
      }
    }
    checkToken();
  }, [tokenParam]);

  const handleResend = async () => {
    if (!emailParam || emailParam === "your email address") {
      setError("Please enter your registered email address.");
      return;
    }

    setResending(true);
    setResendStatus(null);
    setError(null);

    const res = await authService.resendVerificationEmail(emailParam);
    setResending(false);

    if (res.success) {
      if (res.alreadyVerified) {
        setIsVerified(true);
        setResendStatus("Your account is already verified! You can sign in immediately.");
      } else {
        setResendStatus(res.message || `A new verification email has been dispatched to ${emailParam}. Please check your inbox.`);
      }
    } else {
      setError(res.message || "Failed to resend verification email. Please try again.");
    }
  };

  const handleOpenMailClient = () => {
    if (emailParam.includes("gmail.com")) {
      window.open("https://mail.google.com", "_blank");
    } else if (emailParam.includes("outlook.com") || emailParam.includes("hotmail.com")) {
      window.open("https://outlook.live.com", "_blank");
    } else if (emailParam.includes("yahoo.com")) {
      window.open("https://mail.yahoo.com", "_blank");
    } else {
      window.location.href = `mailto:${emailParam}`;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F4F6FB] text-[#172033] font-body">
      
      {/* Navigation Header */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between px-1">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#657089] hover:text-[#4B3BD5] transition-colors"
        >
          <span>← Back to Sign In</span>
        </Link>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F0EFFF] text-[#4B3BD5] border border-[#DFE5EF]">
          Email Verification
        </span>
      </div>

      {/* Main Verification Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-[#DFE5EF] space-y-6 text-center">
        
        {/* Animated Badge Icon */}
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-[#4B3BD5] text-white flex items-center justify-center shadow-md shadow-[#4B3BD5]/20">
            {isVerified ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-300" />
            ) : (
              <Mail className="w-6 h-6" />
            )}
          </div>
        </div>

        {/* Header Text */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5">
            <span className="font-headline font-black text-xl tracking-tight text-[#172033]">
              Jan<span className="text-[#4B3BD5]">Seva</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-[#F0EFFF] text-[#4B3BD5] border border-[#4B3BD5]/20">
              AI 2.0
            </span>
          </div>

          <h1 className="font-headline font-bold text-2xl text-[#172033]">
            {isVerified ? "Email Verified!" : "Verify your email"}
          </h1>
          
          <p className="text-xs text-[#657089] leading-relaxed max-w-xs mx-auto">
            {isVerified
              ? "Your email address has been verified. You can now sign in to report civic issues and track ward actions."
              : `We've sent an email with a verification link to ${emailParam}. Please open your inbox and click the verification button inside that email.`}
          </p>
        </div>

        {/* Active Verifying State */}
        {isVerifying && (
          <div className="p-3.5 rounded-2xl bg-indigo-50 text-[#4B3BD5] text-xs font-semibold flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Validating token with JanSeva server...</span>
          </div>
        )}

        {/* Status Message */}
        {resendStatus && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium text-left leading-relaxed animate-fadeIn">
            {resendStatus}
          </div>
        )}

        {/* Error Alert Box */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center justify-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {isVerified ? (
            <Link
              href="/login"
              className="w-full py-3 px-4 bg-[#4B3BD5] hover:bg-[#3F32BD] text-white font-bold text-xs rounded-xl shadow-md shadow-[#4B3BD5]/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>Sign In Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              {/* Open Email Client (Does NOT verify, opens inbox) */}
              <button
                type="button"
                onClick={handleOpenMailClient}
                className="w-full py-3 px-4 bg-[#4B3BD5] hover:bg-[#3F32BD] text-white font-bold text-xs rounded-xl shadow-md shadow-[#4B3BD5]/20 flex items-center justify-center gap-2 transition-all"
              >
                <Mail className="w-4 h-4" />
                <span>Open Email Inbox</span>
              </button>

              {/* Resend Verification Email (Dispatches real email) */}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full py-2.5 px-4 bg-white hover:bg-[#F7F9FC] border border-[#DFE5EF] rounded-xl text-xs font-bold text-[#172033] flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-60"
              >
                {resending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4B3BD5]" />
                    <span>Sending Verification Email...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-[#657089]" />
                    <span>Resend Verification Email</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>

        {/* Security Guidance */}
        <div className="pt-3 border-t border-[#DFE5EF] text-[11px] text-[#657089] space-y-1">
          <p>Links are valid for 24 hours. Check spam/promotions folder if missing.</p>
          <Link
            href="/login"
            className="inline-block font-bold text-[#4B3BD5] hover:underline pt-1"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
        <Loader2 className="w-6 h-6 animate-spin text-[#4B3BD5]" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
