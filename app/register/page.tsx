"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { authService } from "@/lib/auth/auth-service";
import { UserRole } from "@/lib/auth/auth-types";
import { WardOption } from "@/lib/data/cities-wards";
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
  MapPin,
  Building2,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser, switchRole } = useApp();

  // Form states
  const [role, setRole] = useState<UserRole>("citizen");
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Dynamic City & Ward states
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("Bengaluru");
  const [wards, setWards] = useState<WardOption[]>([]);
  const [selectedWard, setSelectedWard] = useState<WardOption | null>(null);
  const [department, setDepartment] = useState("Public Works Department");
  const [loadingWards, setLoadingWards] = useState(false);

  // Status & validation states
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [officerPending, setOfficerPending] = useState(false);

  // Load cities on mount
  useEffect(() => {
    async function loadCities() {
      const cityList = await authService.getCities();
      setCities(cityList);
      if (cityList.length > 0 && !selectedCity) {
        setSelectedCity(cityList[0]);
      }
    }
    loadCities();
  }, [selectedCity]);

  // Load wards dynamically when selectedCity changes
  useEffect(() => {
    async function loadWardsForCity() {
      if (!selectedCity) return;
      setLoadingWards(true);
      const wardList = await authService.getWards(selectedCity);
      setWards(wardList);
      if (wardList.length > 0) {
        setSelectedWard(wardList[0]);
      } else {
        setSelectedWard(null);
      }
      setLoadingWards(false);
    }
    loadWardsForCity();
  }, [selectedCity]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = "Please enter your full name";
    }

    if (role === "officer") {
      if (!officialEmail.trim() || !officialEmail.includes("@")) {
        errors.officialEmail = "Please enter a valid official municipal email";
      }
      if (!mobileNumber.trim()) {
        errors.mobileNumber = "Please enter your official contact number";
      }
    } else {
      if (!identifier.trim()) {
        errors.identifier = "Please enter your email or mobile number";
      }
    }

    if (!selectedCity) {
      errors.city = "Please select your city";
    }

    if (!selectedWard && role === "citizen") {
      errors.ward = "Please select your ward";
    }

    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOfficerPending(false);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await authService.register({
        fullName: fullName.trim(),
        identifier: role === "officer" ? mobileNumber.trim() : identifier.trim(),
        officialEmail: role === "officer" ? officialEmail.trim() : undefined,
        department: role === "officer" ? department : undefined,
        password,
        confirmPassword,
        city: selectedCity,
        ward: selectedWard ? selectedWard.name : "Central Ward",
        wardNumber: selectedWard ? selectedWard.number : 1,
        role,
      });

      if (response.success) {
        if (role === "officer") {
          setOfficerPending(true);
        } else if (response.requiresVerification) {
          router.push(
            `/verify-email?email=${encodeURIComponent(
              identifier.includes("@")
                ? identifier.trim()
                : `${fullName.toLowerCase().replace(/\s+/g, ".")}@civic.in`
            )}`
          );
        } else if (response.user) {
          setUser(response.user);
          switchRole("citizen");
          router.push("/feed");
        }
      } else {
        setError(response.message || "Registration failed. Please try again.");
        if (response.errors) setFieldErrors(response.errors);
      }
    } catch (err) {
      setError("Unable to connect to JanSeva authentication server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const response = await authService.loginWithGoogle({
        email: identifier.includes("@") ? identifier.trim() : "asmit.gupta@civic.in",
        name: fullName.trim() || "Asmit Gupta",
        role: "citizen",
      });

      if (response.success && response.user) {
        setUser(response.user);
        switchRole("citizen");

        if (response.needsProfileCompletion || !response.user.city) {
          router.push(
            `/complete-profile?email=${encodeURIComponent(response.user.email)}`
          );
        } else {
          router.push("/feed");
        }
      } else {
        setError(response.message || "Google registration was unsuccessful.");
      }
    } catch (err) {
      setError("Google registration was unsuccessful. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F4F6FB] text-[#172033] font-body py-10">
      
      {/* Navigation Banner */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between px-1">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#657089] hover:text-[#4B3BD5] transition-colors"
        >
          <span>← Back to Sign In</span>
        </Link>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F0EFFF] text-[#4B3BD5] border border-[#DFE5EF]">
          Join JanSeva Network
        </span>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-card border border-[#DFE5EF] space-y-6">
        
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

          <div className="pt-1">
            <h1 className="font-headline font-bold text-2xl text-[#172033] tracking-tight">
              Create your account
            </h1>
            <p className="text-xs text-[#657089] font-normal mt-1">
              Join your community and help make your city better.
            </p>
          </div>
        </div>

        {/* Account Type Selection (Selectable Cards) */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-[#172033]">
            Account Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Resident Citizen Card */}
            <button
              type="button"
              onClick={() => {
                setRole("citizen");
                setError(null);
                setFieldErrors({});
              }}
              className={cn(
                "p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2",
                role === "citizen"
                  ? "bg-[#F0EFFF]/60 border-[#4B3BD5] shadow-sm ring-1 ring-[#4B3BD5]"
                  : "bg-[#F7F9FC] border-[#DFE5EF] hover:border-[#657089]"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#DFE5EF] flex items-center justify-center text-[#4B3BD5]">
                  <User className="w-4 h-4" />
                </div>
                {role === "citizen" && (
                  <span className="w-2 h-2 rounded-full bg-[#4B3BD5]"></span>
                )}
              </div>
              <div>
                <p className="font-bold text-xs text-[#172033]">Resident Citizen</p>
                <p className="text-[11px] text-[#657089] leading-tight mt-0.5">
                  Report issues, follow your ward, and participate in your community.
                </p>
              </div>
            </button>

            {/* Ward Officer Card */}
            <button
              type="button"
              onClick={() => {
                setRole("officer");
                setError(null);
                setFieldErrors({});
              }}
              className={cn(
                "p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2",
                role === "officer"
                  ? "bg-[#F0EFFF]/60 border-[#4B3BD5] shadow-sm ring-1 ring-[#4B3BD5]"
                  : "bg-[#F7F9FC] border-[#DFE5EF] hover:border-[#657089]"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#DFE5EF] flex items-center justify-center text-[#4B3BD5]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                {role === "officer" && (
                  <span className="w-2 h-2 rounded-full bg-[#4B3BD5]"></span>
                )}
              </div>
              <div>
                <p className="font-bold text-xs text-[#172033]">Ward Officer / Staff</p>
                <p className="text-[11px] text-[#657089] leading-tight mt-0.5">
                  Manage civic issues and coordinate ward-level action.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Officer Pending Approval Banner */}
        {officerPending && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2 animate-fadeIn">
            <div className="flex items-center gap-2 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Officer Registration Submitted!</span>
            </div>
            <p className="text-xs text-amber-800">
              Your officer account is pending verification and approval by municipal authority.
              Once verified, you can sign in using your official email.
            </p>
            <div className="pt-1">
              <Link
                href="/login"
                className="inline-block text-xs font-bold text-[#4B3BD5] underline"
              >
                Return to Login →
              </Link>
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Content */}
        {!officerPending && (
          <form onSubmit={handleRegister} className="space-y-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#172033]">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657089]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Asmit Gupta"
                  className={cn(
                    "w-full pl-10 pr-4 py-2.5 bg-[#F7F9FC] border rounded-xl text-xs text-[#172033] placeholder-[#657089] focus:outline-none focus:ring-2 focus:ring-[#4B3BD5]/30 focus:border-[#4B3BD5] transition-all",
                    fieldErrors.fullName ? "border-red-400 bg-red-50/30" : "border-[#DFE5EF]"
                  )}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-[11px] text-red-500">{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Citizen Identifier (Email or Mobile) vs Officer Official Credentials */}
            {role === "citizen" ? (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#172033]">
                  Email or Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657089]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@civic.in or 9876543210"
                    className={cn(
                      "w-full pl-10 pr-4 py-2.5 bg-[#F7F9FC] border rounded-xl text-xs text-[#172033] placeholder-[#657089] focus:outline-none focus:ring-2 focus:ring-[#4B3BD5]/30 focus:border-[#4B3BD5] transition-all",
                      fieldErrors.identifier ? "border-red-400 bg-red-50/30" : "border-[#DFE5EF]"
                    )}
                  />
                </div>
                {fieldErrors.identifier && (
                  <p className="text-[11px] text-red-500">{fieldErrors.identifier}</p>
                )}
              </div>
            ) : (
              <>
                {/* Official Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#172033]">
                    Official Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657089]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={officialEmail}
                      onChange={(e) => setOfficialEmail(e.target.value)}
                      placeholder="name@municipality.gov.in"
                      className={cn(
                        "w-full pl-10 pr-4 py-2.5 bg-[#F7F9FC] border rounded-xl text-xs text-[#172033] placeholder-[#657089] focus:outline-none focus:ring-2 focus:ring-[#4B3BD5]/30 focus:border-[#4B3BD5] transition-all",
                        fieldErrors.officialEmail ? "border-red-400 bg-red-50/30" : "border-[#DFE5EF]"
                      )}
                    />
                  </div>
                  {fieldErrors.officialEmail && (
                    <p className="text-[11px] text-red-500">{fieldErrors.officialEmail}</p>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#172033]">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657089]">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="Enter official contact number"
                      className={cn(
                        "w-full pl-10 pr-4 py-2.5 bg-[#F7F9FC] border rounded-xl text-xs text-[#172033] placeholder-[#657089] focus:outline-none focus:ring-2 focus:ring-[#4B3BD5]/30 focus:border-[#4B3BD5] transition-all",
                        fieldErrors.mobileNumber ? "border-red-400 bg-red-50/30" : "border-[#DFE5EF]"
                      )}
                    />
                  </div>
                  {fieldErrors.mobileNumber && (
                    <p className="text-[11px] text-red-500">{fieldErrors.mobileNumber}</p>
                  )}
                </div>
              </>
            )}

            {/* City & Ward Dropdowns Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* City Searchable Dropdown */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#172033]">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#657089]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full pl-9 pr-8 py-2.5 bg-[#F7F9FC] border border-[#DFE5EF] rounded-xl text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#4B3BD5]/30 focus:border-[#4B3BD5] transition-all appearance-none cursor-pointer"
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#657089]">
                    ▼
                  </div>
                </div>
              </div>

              {/* Ward Selection Dropdown (Dependent on City) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#172033]">
                  {role === "officer" ? "Ward / Department" : "Ward Selection"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#657089]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  {loadingWards ? (
                    <div className="w-full pl-9 pr-4 py-2.5 bg-[#F7F9FC] border border-[#DFE5EF] rounded-xl text-xs text-[#657089] flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4B3BD5]" />
                      <span>Loading wards...</span>
                    </div>
                  ) : (
                    <select
                      value={selectedWard?.name || ""}
                      onChange={(e) => {
                        const found = wards.find((w) => w.name === e.target.value);
                        if (found) setSelectedWard(found);
                      }}
                      className="w-full pl-9 pr-8 py-2.5 bg-[#F7F9FC] border border-[#DFE5EF] rounded-xl text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#4B3BD5]/30 focus:border-[#4B3BD5] transition-all appearance-none cursor-pointer"
                    >
                      {wards.length > 0 ? (
                        wards.map((w) => (
                          <option key={w.number} value={w.name}>
                            {w.name}
                          </option>
                        ))
                      ) : (
                        <option value="">Select your ward</option>
                      )}
                    </select>
                  )}
                  {!loadingWards && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#657089]">
                      ▼
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Department selection for Officer */}
            {role === "officer" && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#172033]">
                  Department Assignment
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F7F9FC] border border-[#DFE5EF] rounded-xl text-xs text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#4B3BD5]/30 focus:border-[#4B3BD5] transition-all appearance-none cursor-pointer"
                >
                  <option value="Public Works Department">Public Works Department (Roads & Infra)</option>
                  <option value="Solid Waste Management">Solid Waste Management & Sanitation</option>
                  <option value="Water Supply & Drainage">Water Supply & Drainage Board</option>
                  <option value="Electrical & Streetlighting">Electrical & Streetlighting Cell</option>
                  <option value="Parks & Horticulture">Parks & Horticulture Division</option>
                </select>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#172033]">
                  Password <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-[#657089]">Min. 6 chars</span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657089]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 chars"
                  className={cn(
                    "w-full pl-10 pr-10 py-2.5 bg-[#F7F9FC] border rounded-xl text-xs text-[#172033] placeholder-[#657089] focus:outline-none focus:ring-2 focus:ring-[#4B3BD5]/30 focus:border-[#4B3BD5] transition-all",
                    fieldErrors.password ? "border-red-400 bg-red-50/30" : "border-[#DFE5EF]"
                  )}
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
              {fieldErrors.password && (
                <p className="text-[11px] text-red-500">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#172033]">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#657089]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className={cn(
                    "w-full pl-10 pr-10 py-2.5 bg-[#F7F9FC] border rounded-xl text-xs text-[#172033] placeholder-[#657089] focus:outline-none focus:ring-2 focus:ring-[#4B3BD5]/30 focus:border-[#4B3BD5] transition-all",
                    fieldErrors.confirmPassword ? "border-red-400 bg-red-50/30" : "border-[#DFE5EF]"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#657089] hover:text-[#172033]"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] text-red-500">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#4B3BD5] hover:bg-[#3F32BD] text-white font-bold text-xs rounded-xl shadow-md shadow-[#4B3BD5]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>
                    {role === "officer"
                      ? "Submit Officer Application →"
                      : "Create Account →"}
                  </span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Citizen Google Sign-Up */}
        {role === "citizen" && !officerPending && (
          <div className="space-y-4 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#DFE5EF] w-full"></div>
              <span className="bg-white px-3 text-[11px] font-medium text-[#657089] absolute">
                or continue with
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
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

        {/* Footer */}
        <div className="text-center pt-2 border-t border-[#DFE5EF]">
          <p className="text-xs text-[#657089]">
            Already have an account?{" "}
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
