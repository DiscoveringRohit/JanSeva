"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserProfile } from "@/lib/data/mock-data";
import { ChevronDown, Flame, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarBadgeProps {
  user: UserProfile | null;
  onLogout?: () => void;
}

export function UserAvatarBadge({ user, onLogout }: UserAvatarBadgeProps) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/login" className="px-4 py-1.5 rounded-xl text-xs font-bold text-primary-700 bg-primary-50 hover:bg-primary-100 transition-colors">
          Login
        </Link>
        <Link href="/register" className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-sm transition-colors">
          Register
        </Link>
      </div>
    );
  }

  const displayName = user.name || user.username || (user as any).full_name || (user as any).profile?.full_name || "User";
  const firstName = displayName.split(" ")[0];
  const karmaXP = user.karmaXP ?? (user as any).karma_xp ?? 10;
  const level = user.level ?? 1;
  const levelTitle = user.levelTitle || (user as any).level_title || "Active Citizen";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowRoleDropdown(!showRoleDropdown)}
        className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container border border-surface-dim transition-all"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover ring-2 ring-primary-500/20"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-headline font-bold text-xs ring-2 ring-primary-500/20">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="hidden lg:flex flex-col items-start text-left">
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-on-surface leading-none">{firstName}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-primary-100 text-primary-800 capitalize">
              {user.role}
            </span>
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-0.5">
            <Flame className="w-2.5 h-2.5" />
            {karmaXP} XP
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant" />
      </button>

      {showRoleDropdown && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-3 shadow-xl border border-surface-container-high z-50 animate-fadeIn">
          <div className="pb-2 border-b border-surface-dim">
            <p className="text-xs font-bold text-on-surface">{displayName}</p>
            <p className="text-[11px] text-on-surface-variant">{user.email}</p>
            <div className="mt-1 flex items-center justify-between text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              <span>Level {level} {levelTitle}</span>
              <span>{karmaXP} XP</span>
            </div>
          </div>

          <div className="pt-2 border-t border-surface-dim space-y-1">
            <Link
              href="/profile"
              onClick={() => setShowRoleDropdown(false)}
              className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container-low"
            >
              View My Profile
            </Link>
            <Link
              href="/profile/edit"
              onClick={() => setShowRoleDropdown(false)}
              className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-on-surface hover:bg-surface-container-low"
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
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
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
