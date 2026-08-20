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
  Building
} from "lucide-react";
import { cn } from "@/lib/utils";

const DEPARTMENTS = ["Electricity", "Water", "Roads", "Sanitation", "Municipal"];

export default function OfficerPortalPage() {
  const router = useRouter();
  const { setUser } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Details
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Step 2: OTP
  const [otp, setOtp] = useState("");

  // Step 3: Access
  const [department, setDepartment] = useState("Electricity");
  const [accessCode, setAccessCode] = useState("");

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
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateStep1()) return;

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
      const res = await authApi.verifyOtp(phone, otp);
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
    if (!accessCode.trim()) {
      setFieldErrors({ accessCode: "Access code is required" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.officerRegister({
        fullName,
        phone,
        email,
        department,
        accessCode
      });

      if (res.success && res.user && res.token) {
        setSuccessMessage("Authentication successful!");
        
        // TODO: Move to httpOnly cookie before production
        localStorage.setItem("janseva_token", res.token);
        localStorage.setItem("janseva_user", JSON.stringify(res.user));
        setUser(res.user);

        setTimeout(() => {
          router.push(`/officer/${department.toLowerCase()}`);
        }, 1000);
      } else {
        setError(res.message || "Authentication failed. Check your access code.");
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
      <div className="w-full max-w-lg bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 relative z-10 backdrop-blur-xl space-y-5 animate-slideUp">
        
        <div className="text-center space-y-1.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30">
            <Shield className="w-5 h-5" />
          </div>
          <div className="pt-2">
            <h1 className="font-headline font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
              Officer Portal (Step {step} of 3)
            </h1>
            <p className="text-xs text-slate-500 mt-1">Authorized municipal personnel only.</p>
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
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Send OTP via SMS</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {/* STEP 2: OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-headline font-bold text-lg">Verify your identity</h3>
              <p className="text-xs text-slate-500 mt-1">We sent an OTP to {phone}</p>
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

        {/* STEP 3: Department & Access Code */}
        {step === 3 && (
          <form onSubmit={handleRegister} className="space-y-4">
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
                <label className="text-[11px] font-bold text-slate-700 ml-1 block mb-1">Access Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="password" placeholder="••••••••" value={accessCode} onChange={(e) => setAccessCode(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all" />
                </div>
                {fieldErrors.accessCode && <p className="text-[10px] text-red-500 mt-1 ml-1 font-medium">{fieldErrors.accessCode}</p>}
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-headline font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Authenticate</span><CheckCircle2 className="w-4 h-4" /></>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
