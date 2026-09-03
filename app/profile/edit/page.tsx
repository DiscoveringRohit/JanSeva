"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { authApi } from "@/lib/api/auth";
import {
  User,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Bell,
  Globe,
  ArrowLeft,
  Check,
  Save,
  Camera,
  Loader2,
  AtSign
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { compressAvatar } from "@/lib/utils/image";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser } = useApp();

  const [name, setName] = useState(user?.name || "");
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [gender, setGender] = useState(user?.gender || "Prefer not to say");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [city, setCity] = useState(user?.city || "");
  const [pincode, setPincode] = useState(user?.pincode || "");
  const [savedToast, setSavedToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const cleanUsername = username.trim().toLowerCase();
    if (cleanUsername && !/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
      setError("Username must be 3-30 characters long and contain only letters, numbers, and underscores.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const res = await authApi.updateProfile({
      username: cleanUsername,
      email,
      phone_number: phone,
      gender,
      city,
      pin_code: pincode,
      avatar,
      full_name: name,
      first_name: name.split(' ')[0],
      last_name: name.split(' ').slice(1).join(' ')
    });

    setIsSaving(false);

    if (res.success && res.user) {
      setUser(res.user);
      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_user", JSON.stringify(res.user));
      }
      setSavedToast(true);
      setTimeout(() => {
        setSavedToast(false);
        router.push("/profile");
      }, 800);
    } else {
      setError(res.message || "Failed to save profile");
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="p-4 rounded-full bg-slate-100">
          <ShieldCheck className="w-10 h-10 text-slate-400" />
        </div>
        <div>
          <h2 className="font-headline font-bold text-xl text-slate-800">Access Denied</h2>
          <p className="text-sm text-slate-500 mt-1">Please login to edit your profile.</p>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-2.5 bg-primary-600 text-white font-bold text-sm rounded-xl mt-4"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-12">

      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white border border-surface-dim hover:bg-surface-container text-xs font-bold text-on-surface transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </button>

        {savedToast && (
          <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200 animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Profile Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl bg-white border border-surface-container-high p-6 sm:p-8 shadow-soft space-y-6">
        <div>
          <h1 className="font-headline font-black text-2xl text-on-surface">
            Edit Profile & Civic Preferences
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Update your public citizen identity, verified location, and communication details.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Profile Avatar & ID Banner */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low border border-surface-dim">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-100 ring-2 ring-primary-500/20 shadow-sm flex items-center justify-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-headline font-black text-xl text-primary-700">
                  {name.charAt(0).toUpperCase() || "C"}
                </span>
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 p-1.5 rounded-full bg-primary-600 text-white shadow-md cursor-pointer hover:bg-primary-700 transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const compressed = await compressAvatar(file);
                      if (compressed) {
                        setAvatar(compressed);
                      }
                    } catch (err) {
                      console.error("Avatar compression failed:", err);
                    }
                  }
                }}
              />
            </label>
          </div>

          <div>
            <p className="text-xs font-bold text-on-surface">{name}</p>
            <p className="text-[11px] font-mono text-slate-500 font-semibold">@{username || "username"}</p>
            <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Resident</span>
            </p>
            <span className="text-[10px] text-on-surface-variant">Civic Level {user.level} ({user.civicCitizenXP} XP)</span>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-primary-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Your full name"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Username</label>
              <div className="relative">
                <AtSign className="w-4 h-4 text-primary-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  required
                  placeholder="username (e.g. sujal_patra)"
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-mono font-bold rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-primary-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Mobile Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-primary-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">City</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-primary-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-bold rounded-2xl bg-surface-container-low border border-surface-dim text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Bhubaneswar"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Pincode</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-primary-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-bold rounded-2xl bg-surface-container-low border border-surface-dim text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. 751001"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Gender</label>
              <div className="relative">
                <User className="w-4 h-4 text-primary-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-bold rounded-2xl bg-surface-container-low border border-surface-dim text-on-surface focus:outline-none"
                >
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-medium">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-dim">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-2xl border border-surface-dim text-xs font-bold text-on-surface hover:bg-surface-container"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving || savedToast}
            className={cn(
              "px-6 py-2.5 rounded-2xl font-headline font-bold text-xs shadow-md transition-all flex items-center gap-1.5",
              savedToast
                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30"
                : "bg-primary-600 hover:bg-primary-700 text-white shadow-primary-600/30",
              (isSaving || savedToast) && "opacity-80 cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : savedToast ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>
              {isSaving ? "Saving..." : savedToast ? "Saved!" : "Save Preferences"}
            </span>
          </button>
        </div>
      </form>

    </div>
  );
}
