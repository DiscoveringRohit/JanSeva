"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { authService } from "@/lib/auth/auth-service";
import { WardOption } from "@/lib/data/cities-wards";
import { Sparkles, Building2, MapPin, ArrowRight, Loader2, AlertCircle } from "lucide-react";

function CompleteProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const { user, setUser, switchRole } = useApp();

  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState(user.city || "Bengaluru");
  const [wards, setWards] = useState<WardOption[]>([]);
  const [selectedWard, setSelectedWard] = useState<WardOption | null>(null);
  const [loadingWards, setLoadingWards] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCities() {
      const cityList = await authService.getCities();
      setCities(cityList);
    }
    loadCities();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedCity) {
      setError("Please select your city.");
      return;
    }

    if (!selectedWard) {
      setError("Please select your ward.");
      return;
    }

    setIsLoading(true);

    try {
      const emailToUse = emailParam || user.email || "asmit.gupta@civic.in";
      const res = await authService.completeProfile({
        email: emailToUse,
        userId: user.id,
        city: selectedCity,
        ward: selectedWard.name,
        wardNumber: selectedWard.number,
      });

      if (res.success && res.user) {
        setUser(res.user);
        switchRole("citizen");
        router.push("/feed");
      } else {
        // Even if fallback, update context state and push to feed
        setUser((prev) => ({
          ...prev,
          city: selectedCity,
          ward: selectedWard.name,
          wardNumber: selectedWard.number,
        }));
        switchRole("citizen");
        router.push("/feed");
      }
    } catch (err) {
      setError("Unable to save profile settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-[#F4F6FB] text-[#172033] font-body">
      
      {/* Top Navigation */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between px-1">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#657089] hover:text-[#4B3BD5] transition-colors"
        >
          <span>← Back to Login</span>
        </Link>
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F0EFFF] text-[#4B3BD5] border border-[#DFE5EF]">
          Profile Setup
        </span>
      </div>

      {/* Main Card */}
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
            <h1 className="font-headline font-bold text-2xl text-[#172033]">
              Complete your profile
            </h1>
            <p className="text-xs text-[#657089] font-normal mt-1">
              Select your City and Ward to personalize your community feed and local updates.
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Completion Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* City Selection */}
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

          {/* Ward Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#172033]">
              Ward Selection <span className="text-red-500">*</span>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#4B3BD5] hover:bg-[#3F32BD] text-white font-bold text-xs rounded-xl shadow-md shadow-[#4B3BD5]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <span>Complete Setup</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F4F6FB]">
        <Loader2 className="w-6 h-6 animate-spin text-[#4B3BD5]" />
      </div>
    }>
      <CompleteProfileContent />
    </Suspense>
  );
}
