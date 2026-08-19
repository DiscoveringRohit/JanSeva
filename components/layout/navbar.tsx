"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-container-high bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left: Brand & Mobile Menu Toggle */}
        <div className="flex items-center gap-3 lg:gap-6">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-indigo-700 text-white shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-black text-xl tracking-tight text-on-surface">
                  Jan<span className="text-primary-600">Seva</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-md bg-indigo-50 text-primary-700 border border-primary-100">
                  AI 2.0
                </span>
              </div>
              <span className="text-[10px] font-medium text-on-surface-variant hidden sm:block -mt-1">
                Civic Social Network
              </span>
            </div>
          </Link>

          {/* Ward Location Tag */}
          <Link
            href="/ward"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container border border-surface-dim text-xs font-semibold text-on-surface-variant transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-primary-600" />
            <span>Ward {DEFAULT_LOCATION.wardNumber} • {DEFAULT_LOCATION.city}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </Link>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <form onSubmit={handleSearch} className="w-full relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search potholes, water leaks, ward issues, tickets..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-600 focus:bg-white text-on-surface placeholder:text-on-surface-variant/60 transition-all shadow-inner"
            />
          </form>
        </div>

        {/* Right: Actions, Notifications, Role Switcher, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Quick AI Assistant Trigger */}
          <button
            type="button"
            onClick={() => setIsAiDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-primary-50 to-indigo-100/70 border border-primary-200 text-primary-700 hover:from-primary-100 hover:to-indigo-200 text-xs font-semibold shadow-sm hover:scale-[1.02] transition-all"
            title="Open JanSeva AI Civic Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary-600 animate-pulseSlow" />
            <span className="hidden sm:inline">AI Assistant</span>
          </button>

          {/* Quick Report Button */}
          <Link
            href="/report"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-600/30 hover:scale-[1.02] transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Report Issue</span>
            <span className="sm:hidden">Report</span>
          </Link>

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
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-tertiary text-[10px] font-bold text-white shadow">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white p-3 shadow-xl border border-surface-container-high z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-surface-dim">
                  <div className="flex items-center gap-1.5 font-headline font-bold text-sm text-on-surface">
                    <Bell className="w-4 h-4 text-primary-600" />
                    <span>Notifications</span>
                  </div>
                  <Link
                    href="/notifications"
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-xs text-primary-600 hover:underline font-semibold"
                  >
                    View All
                  </Link>
                </div>

                <div className="divide-y divide-surface-container-low max-h-72 overflow-y-auto mt-2">
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
                        "p-2.5 rounded-xl cursor-pointer transition-colors hover:bg-surface-container-low",
                        !n.read ? "bg-primary-50/50" : ""
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-on-surface">{n.title}</span>
                        {!n.read && <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-1"></span>}
                      </div>
                      <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">
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
