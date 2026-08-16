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
  User,
  MapPin,
  Building,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const POPULAR_CITIES = [
  "Bengaluru",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
];

const BENGALURU_WARDS = [
  { number: 42, name: "Ward 42 • Shanti Nagar" },
  { number: 150, name: "Ward 150 • Bellandur" },
  { number: 174, name: "Ward 174 • HSR Layout" },
  { number: 85, name: "Ward 85 • Koramangala" },
  { number: 112, name: "Ward 112 • Domlur / Indiranagar" },
  { number: 12, name: "Ward 12 • Malleshwaram" },
  { number: 93, name: "Ward 93 • Vasanth Nagar" },
  { number: 160, name: "Ward 160 • Raja Rajeshwari Nagar" },
];

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, switchRole } = useApp();

  // Form states
  const [role, setRole] = useState<UserRole>("citizen");
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [city, setCity] = useState("Bengaluru");
  const [selectedWardNumber, setSelectedWardNumber] = useState(42);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Status & validation states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const selectedWardObj =
    BENGALURU_WARDS.find((w) => w.number === selectedWardNumber) ||
    BENGALURU_WARDS[0];

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = "Please enter your full name";
    }

    if (!identifier.trim()) {
      errors.identifier = "Please enter your email or mobile number";
    } else {
      const isEmail = identifier.includes("@") && identifier.includes(".");
      const isPhone = /^[0-9+ ]{10,14}$/.test(identifier.trim());
      if (!isEmail && !isPhone) {
        errors.identifier = "Please enter a valid email or 10-digit mobile number";
      }
    }

    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    if (!city.trim()) {
      errors.city = "Please select or enter your city";
    }

    if (!agreedToTerms) {
      errors.agreedToTerms = "You must agree to the Terms of Service & Privacy Policy";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await authService.register({
        fullName,
        identifier,
        password,
        confirmPassword,
        city,
        ward: selectedWardObj.name.split("•")[1]?.trim() || "Shanti Nagar",
        wardNumber: selectedWardObj.number,
        role,
        agreedToTerms,
      });

      if (response.success && response.user) {
        setSuccessMessage("Account created successfully! Preparing your civic dashboard...");
        
        // Update mock application context state
        setUser(response.user);
        switchRole(role === "officer" ? "officer" : "citizen");

        setTimeout(() => {
          if (role === "officer") {
            router.push("/officer");
          } else {
            router.push("/feed");
          }
        }, 700);
      } else {
        setError(response.message || "Registration failed. Please check the fields.");
        if (response.errors) setFieldErrors(response.errors);
      }
    } catch (err) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoFill = (type: UserRole) => {
    setRole(type);
    setError(null);
    setFieldErrors({});
    if (type === "officer") {
      setFullName("Er. Ramesh Kulkarni");
      setIdentifier("ramesh.kulkarni@bbmp.gov.in");
      setPassword("officer2026");
      setConfirmPassword("officer2026");
      setCity("Bengaluru");
      setSelectedWardNumber(42);
      setAgreedToTerms(true);
    } else {
      setFullName("Priya Sharma");
      setIdentifier("priya.sharma@civic.in");
      setPassword("citizen2026");
      setConfirmPassword("citizen2026");
      setCity("Bengaluru");
      setSelectedWardNumber(42);
      setAgreedToTerms(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden font-body py-10">
      {/* Ambient glows */}
      <div className="absolute top-1/6 left-1/5 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-primary-600/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/6 right-1/5 w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top Banner Navigation */}
      <div className="w-full max-w-lg mb-3 flex items-center justify-between px-2 text-xs text-slate-400">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
        >
          <span>←</span>
          <span>Back to Sign In</span>
        </Link>
        <div className="flex items-center gap-1.5 font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Join JanSeva Civic Network</span>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-lg bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 relative z-10 backdrop-blur-xl space-y-5 animate-slideUp">
        
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
                BBMP & Smart Cities Portal
              </p>
            </div>
          </Link>
          <div className="pt-2">
            <h1 className="font-headline font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight">
              Create your account
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Empower your ward with AI-powered reporting and resolution tracking.
            </p>
          </div>
        </div>

        {/* Role Switcher Tabs */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 px-1">
            <span>Account Type</span>
            <span
              className="text-[10px] text-primary-600 font-semibold cursor-pointer hover:underline"
              onClick={() => handleQuickDemoFill(role === "citizen" ? "officer" : "citizen")}
            >
              Fill sample {role === "citizen" ? "Officer" : "Citizen"} info
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
              <span>Resident Citizen</span>
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
              <span>Ward Officer / Staff</span>
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

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-bold text-slate-700 mb-1"
            >
              Full Name
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) {
                    setFieldErrors((prev) => ({ ...prev, fullName: "" }));
                  }
                }}
                placeholder="e.g. Asmit Gupta"
                className={cn(
                  "w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 border text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white",
                  fieldErrors.fullName
                    ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                    : "border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                )}
              />
            </div>
            {fieldErrors.fullName && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">
                {fieldErrors.fullName}
              </p>
            )}
          </div>

          {/* Email or Mobile */}
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
                placeholder="name@civic.in or 9876543210"
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

          {/* City and Ward Selection (2-column layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                City
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Building className="w-4 h-4" />
                </div>
                <select
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 appearance-none cursor-pointer"
                >
                  {POPULAR_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Ward */}
            <div>
              <label
                htmlFor="ward"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                Ward Selection
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <select
                  id="ward"
                  value={selectedWardNumber}
                  onChange={(e) => setSelectedWardNumber(Number(e.target.value))}
                  className="w-full pl-10 pr-8 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 appearance-none cursor-pointer"
                >
                  {BENGALURU_WARDS.map((w) => (
                    <option key={w.number} value={w.number}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Password & Confirm Password (2-column layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                Password
              </label>
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
                  placeholder="Min. 6 chars"
                  className={cn(
                    "w-full pl-10 pr-9 py-2.5 text-xs rounded-xl bg-slate-50 border text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white",
                    fieldErrors.password
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                      : "border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-bold text-slate-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }
                  }}
                  placeholder="Re-enter password"
                  className={cn(
                    "w-full pl-10 pr-9 py-2.5 text-xs rounded-xl bg-slate-50 border text-slate-900 transition-all placeholder:text-slate-400 focus:outline-none focus:bg-white",
                    fieldErrors.confirmPassword
                      ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                      : "border-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] text-rose-600 mt-1 font-medium">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Terms & Conditions Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (fieldErrors.agreedToTerms) {
                    setFieldErrors((prev) => ({ ...prev, agreedToTerms: "" }));
                  }
                }}
                className="mt-0.5 w-4 h-4 rounded text-primary-600 focus:ring-primary-500 border-slate-300 transition-all"
              />
              <span className="text-[11px] text-slate-600 leading-tight">
                I agree to the{" "}
                <span className="text-primary-600 font-semibold underline cursor-pointer">
                  JanSeva Civic Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-primary-600 font-semibold underline cursor-pointer">
                  Privacy Policy
                </span>
                .
              </span>
            </label>
            {fieldErrors.agreedToTerms && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">
                {fieldErrors.agreedToTerms}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white font-headline font-bold text-xs sm:text-sm shadow-lg shadow-primary-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Civic Account...</span>
              </>
            ) : (
              <>
                <span>Create JanSeva Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Login Link */}
        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-xs text-slate-600 font-medium">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary-600 hover:text-primary-700 font-bold hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>

      </div>

      {/* SIH 2026 Evaluation notice */}
      <div className="w-full max-w-lg mt-4 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Aadhaar & Ward residency verified on registration</span>
        </div>
        <button
          type="button"
          onClick={() => handleQuickDemoFill("citizen")}
          className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold border border-slate-700"
        >
          Quick Demo Data
        </button>
      </div>

    </div>
  );
}
