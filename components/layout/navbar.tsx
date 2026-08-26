"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { DEFAULT_LOCATION } from "@/lib/data/default-location";
import {
  Search,
  PlusCircle,
  Bell,
  Sparkles,
  MapPin,
  Shield,
  UserCheck,
  Check,
  ChevronDown,
  Menu,
  X,
  ExternalLink,
  Flame
} from "lucide-react";
import { authService } from "@/lib/auth/auth-service-cookie3";
import { UserAvatarBadge } from "@/components/layout/user-avatar-badge";

import { cn } from "@/lib/utils";

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export function Navbar({ onToggleMobileMenu }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    setUser,
    switchRole,
    notifications,
    unreadNotifsCount,
    markNotificationRead,
    setIsAiDrawerOpen,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
    }
    
    if (showNotifDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifDropdown]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isOfficer = Boolean(
    user?.role === "officer" || 
    user?.role === "corporator" || 
    pathname.startsWith("/officer")
  );
  const officerDept = user?.department ? user.department.toLowerCase() : "water";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-container-high bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-3 lg:gap-6">
          <Link href={isOfficer ? `/officer/${officerDept}` : "/"} className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#134431] text-white shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-emerald-300" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-black text-xl tracking-tight text-slate-900">
                  Jan<span className="text-[#134431]">Seva</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[#edf7f1] text-[#134431] border border-[#cbe7d7]">
                  {isOfficer ? "OPS 2.0" : "AI 2.0"}
                </span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 hidden sm:block -mt-0.5">
                {isOfficer ? "Municipal Authority Command" : "Civic Social Network"}
              </span>
            </div>
          </Link>

          {/* Department or Ward Location Tag */}
          {isOfficer ? (
            <div className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#edf7f1] border border-[#cbe7d7] text-xs font-bold text-[#134431] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse"></span>
              <span>BMC {officerDept.toUpperCase()} DIVISION</span>
            </div>
          ) : (
            <Link
              href="/ward"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f8faf9] hover:bg-[#edf7f1] border border-slate-200/80 text-xs font-bold text-slate-700 hover:text-[#134431] transition-colors shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5 text-[#134431]" />
              <span>{user?.pincode === "751030" ? "Ward 63 • Khandagiri" : (user?.pincode ? `Area ${user.pincode} • ${(user as any).city || "Local"}` : `Ward ${DEFAULT_LOCATION.wardNumber} • ${DEFAULT_LOCATION.city}`)}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
            </Link>
          )}
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="w-full relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isOfficer ? "Search Ticket #, Complainant, Ward, or Location..." : "Search potholes, water leaks, ward issues, tickets..."}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-[#f8faf9] border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-[#134431]/20 focus:border-[#134431] focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
            />
          </form>
        </div>

        {/* Right: Actions, Notifications, Role Switcher, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick AI Assistant Trigger */}
          <button
            type="button"
            onClick={() => setIsAiDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#edf7f1] border border-[#cbe7d7] text-[#134431] hover:bg-[#e1f2e8] text-xs font-bold shadow-2xs hover:scale-[1.02] transition-all select-none"
            title={isOfficer ? "Open AI Ops Dispatch Assistant" : "Open JanSeva AI Civic Assistant"}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulseSlow" />
            <span className="hidden sm:inline">{isOfficer ? "AI Ops Copilot" : "AI Assistant"}</span>
          </button>

          {/* Report Issue (Citizen) or Active Shift (Officer) */}
          {isOfficer ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#134431] text-emerald-300 text-xs font-bold shadow-md shadow-emerald-950/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Active Shift</span>
            </div>
          ) : (
            <Link
              href="/report"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#134431] hover:bg-[#0c2e21] text-white text-xs font-bold shadow-md shadow-emerald-950/20 hover:scale-[1.02] active:scale-98 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report Issue</span>
              <span className="sm:hidden">Report</span>
            </Link>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              type="button"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#f06424] text-[10px] font-black text-white shadow-sm">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-3 shadow-xl border border-slate-100 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-headline font-bold text-sm text-slate-900">
                    <Bell className="w-4 h-4 text-[#134431]" />
                    <span>Notifications</span>
                  </div>
                  <Link
                    href="/notifications"
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-xs text-[#134431] hover:underline font-bold"
                  >
                    View All
                  </Link>
                </div>

                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto mt-2">
                  {notifications.slice(0, 4).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationRead(n.id);
                        if (n.actionUrl) {
                          setShowNotifDropdown(false);
                          router.push(n.actionUrl);
                        }
                      }}
                      className={cn(
                        "p-2.5 rounded-xl cursor-pointer transition-colors hover:bg-[#f8faf9]",
                        !n.read ? "bg-[#edf7f1]/60" : ""
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">{n.title}</span>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-[#134431] shrink-0 mt-1"></span>}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {n.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Role Switcher & Profile Dropdown */}
          <UserAvatarBadge 
            user={user} 
            onLogout={async () => {
              await authService.logout();
              setUser(null);
              router.push('/login');
            }} 
          />
        </div>

      </div>
    </header>
  );
}
