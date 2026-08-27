"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserProfile } from "@/lib/data/mock-data";
import { ChevronDown, Flame, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

import { usePathname } from "next/navigation";

interface UserAvatarBadgeProps {
  user: UserProfile | null;
  onLogout?: () => void;
}

export function UserAvatarBadge({ user, onLogout }: UserAvatarBadgeProps) {
  const pathname = usePathname();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const isOfficerRoute = pathname.startsWith("/officer");

  if (!user) {
    if (isOfficerRoute) {
      return (
        <Link
          href="/officer-portal"
          className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-[#134431] hover:bg-[#0c2e21] shadow-sm transition-colors"
        >
          Authority Access
        </Link>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="px-3.5 py-1.5 rounded-full text-xs font-bold text-[#134431] bg-[#edf7f1] hover:bg-[#dff0e6] transition-colors">
          Login
        </Link>
        <Link href="/register" className="px-3.5 py-1.5 rounded-full text-xs font-bold text-white bg-[#134431] hover:bg-[#0c2e21] shadow-sm transition-colors">
          Register
        </Link>
      </div>
    );
  }

  const displayName = user.name || user.username || (user as any).full_name || (user as any).profile?.full_name || "User";
  const firstName = displayName.split(" ")[0];
  const civicXP = user.civicCitizenXP ?? (user as any).civic_citizen_xp ?? 10;
  const level = user.level ?? 1;
  const levelTitle = user.levelTitle || (user as any).level_title || "Active Citizen";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowRoleDropdown(!showRoleDropdown)}
        className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full bg-[#f8faf9] hover:bg-[#edf7f1] border border-slate-200/80 transition-all shadow-2xs group"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-emerald-500/20 shadow-2xs"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-headline font-black text-xs ring-2 ring-emerald-500/20 shadow-2xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="hidden lg:flex flex-col items-start text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-slate-900 leading-none">{firstName}</span>
            <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold bg-[#edf7f1] text-[#134431] border border-[#cbe7d7] capitalize">
              {user.role}
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-0.5 mt-0.5">
            <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
            {civicXP} XP
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
      </button>

      {showRoleDropdown && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-3.5 shadow-xl border border-slate-100 z-50 animate-fadeIn space-y-2">
          <div className="pb-2.5 border-b border-slate-100">
            <p className="text-xs font-bold text-slate-900">{displayName}</p>
            <p className="text-[11px] text-slate-500">{user.email}</p>
            <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-[#134431] bg-[#edf7f1] px-2.5 py-1 rounded-xl border border-[#cbe7d7]">
              <span>Level {level} {levelTitle}</span>
              <span className="text-emerald-700">{civicXP} XP</span>
            </div>
          </div>

          <div className="space-y-1">
            <Link
              href="/profile/edit"
              onClick={() => setShowRoleDropdown(false)}
              className="block px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-[#edf7f1] hover:text-[#134431] transition-colors"
            >
              Account Settings
            </Link>
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  setShowRoleDropdown(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
