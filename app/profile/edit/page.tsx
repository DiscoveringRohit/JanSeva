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
  Save
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setUser } = useApp();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [ward, setWard] = useState(user.ward);
  const [wardNumber, setWardNumber] = useState(user.wardNumber);
  const [savedToast, setSavedToast] = useState(false);

  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [townHallAlerts, setTownHallAlerts] = useState(true);
  const [language, setLanguage] = useState("English");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user,
      name,
      email,
      phone,
      ward,
      wardNumber,
    });
    setSavedToast(true);
    setTimeout(() => {
      setSavedToast(false);
      router.push("/profile");
    }, 1200);
  };

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
          <img
            src={user.avatar}
            alt={name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-primary-200"
          />
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
                <option value={42}>Ward 42 • Shanti Nagar (BBMP East Zone)</option>
                <option value={41}>Ward 41 • Austin Town (BBMP East Zone)</option>
                <option value={76}>Ward 76 • Richmond Town (BBMP Central Zone)</option>
              </select>
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
