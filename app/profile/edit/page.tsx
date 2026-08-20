"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
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
  Camera
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser } = useApp();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [gender, setGender] = useState(user?.gender || "Prefer not to say");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [ward, setWard] = useState(user?.ward || "");
  const [wardNumber, setWardNumber] = useState(user?.wardNumber || "");
  const [savedToast, setSavedToast] = useState(false);

  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [townHallAlerts, setTownHallAlerts] = useState(true);
  const [language, setLanguage] = useState("English");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUser({
      ...user,
      name,
      email,
      phone,
      gender,
      avatar,
      ward,
      wardNumber: Number(wardNumber) || 0,
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
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
          <p className="text-xs text-on-surface-variant mt-0.5">
            Manage your verified citizen credentials, registered ward, and alert channels.
          </p>
        </div>

        {/* Avatar Section */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface-container-low border border-surface-dim">
          <div className="relative group cursor-pointer">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-primary-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-headline font-bold text-2xl ring-2 ring-primary-200">
                {name ? name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-5 h-5" />
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result) {
                        setAvatar(ev.target.result as string);
                      }
                    };
                    reader.readAsDataURL(e.target.files[0]);
                  }
                }} 
              />
            </label>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface">{name}</p>
            <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Aadhaar Verified Resident</span>
            </p>
            <span className="text-[10px] text-on-surface-variant">Karma Level {user.level} ({user.karmaXP} XP)</span>
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Full Legal Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-primary-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
              />
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
              <label className="block text-xs font-bold text-on-surface mb-1">Mobile Phone (WhatsApp)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-primary-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Registered Municipal Ward</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-primary-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={wardNumber}
                  onChange={(e) => {
                    const num = Number(e.target.value);
                    setWardNumber(num);
                    if (num === 42) setWard("Shanti Nagar");
                    else if (num === 41) setWard("Austin Town");
                    else setWard("Richmond Town");
                  }}
                  className="w-full pl-10 pr-4 py-2.5 text-xs font-bold rounded-2xl bg-surface-container-low border border-surface-dim text-on-surface focus:outline-none"
                >
                  <option value={42}>Ward 63 • Unit 9 (BMC South Zone)</option>
                  <option value={41}>Ward 62 • Unit 8 (BMC South Zone)</option>
                  <option value={76}>Ward 64 • Unit 4 (BMC Central Zone)</option>
                </select>
              </div>
            </div>

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

          {/* Preferences */}
          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-dim space-y-3">
            <h4 className="text-xs font-bold uppercase text-on-surface-variant tracking-wider">
              Notification Channels
            </h4>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-on-surface">SMS SLA Progression Alerts</span>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="rounded accent-primary-600 w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-on-surface">WhatsApp Officer Updates</span>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="rounded accent-primary-600 w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-on-surface">Ward Town Hall Emergency Notices</span>
              <input
                type="checkbox"
                checked={townHallAlerts}
                onChange={(e) => setTownHallAlerts(e.target.checked)}
                className="rounded accent-primary-600 w-4 h-4"
              />
            </div>
          </div>
        </div>

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
            className="px-6 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white font-headline font-bold text-xs shadow-md shadow-primary-600/30 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

    </div>
  );
}
