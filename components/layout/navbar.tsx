"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { authService } from "@/lib/auth/auth-service-cookie3";
import { UserAvatarBadge } from "./user-avatar-badge";
import {
  Sparkles,
  Search,
  Bell,
  PlusCircle,
  Menu,
  Globe,
  ChevronDown,
  Check,
  MapPin,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  onToggleMobileMenu?: () => void;
}

export function Navbar({ onToggleMobileMenu }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    setUser,
    notifications,
    markNotificationRead,
    unreadNotifsCount,
    setIsAiDrawerOpen,
    language,
    setLanguage,
    allLanguages,
    t,
  } = useApp();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifDropdown(false);
      }
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLangDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifDropdown, showLangDropdown]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const currentLangObj = allLanguages.find((l) => l.code === language) || {
    code: "en",
    name: "English",
  };

  const isOfficer = Boolean(
    user?.role === "officer" ||
    user?.role === "corporator" ||
    pathname.startsWith("/officer")
  );
  const officerDept = user?.department ? user.department.toLowerCase() : "water";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-container-high bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Left: Hamburger (Mobile) + Brand */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-6">
          {/* Mobile Sidebar Hamburger Button */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-[#edf7f1] hover:text-[#134431] transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>

          <Link href={isOfficer ? `/officer/${officerDept}` : "/"} className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#134431] text-white shadow-md shadow-emerald-950/20 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-black text-lg sm:text-xl tracking-tight text-slate-900">
                  Jan<span className="text-[#134431]">Seva</span>
                </span>
                {isOfficer && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-[#edf7f1] text-[#134431] border border-[#cbe7d7]">
                    OPS
                  </span>
                )}
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
              <span>
                {user?.pincode
                  ? `PIN ${user.pincode} • ${user.pincode === "751030" ? "Khandagiri" : (user.city || "Bhubaneswar")}`
                  : `PIN 751030 • Khandagiri`}
              </span>
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
              placeholder={isOfficer ? "Search Ticket #, Complainant, Ward, or Location..." : t("searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-[#f8faf9] border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-[#134431]/20 focus:border-[#134431] focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all shadow-2xs"
            />
          </form>
        </div>

        {/* Right: Language Selector, Actions, Notifications, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multi-Language Selector Dropdown (22+ Indian Languages) */}
          <div className="relative" ref={langDropdownRef}>
            <button
              type="button"
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#f8faf9] hover:bg-[#edf7f1] border border-slate-200 text-slate-700 hover:text-[#134431] text-xs font-bold transition-all shadow-2xs min-h-[36px]"
              title="Select Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#134431]" />
              <span className="hidden sm:inline">{currentLangObj.name}</span>
              <span className="sm:hidden font-mono uppercase text-[10px]">
                {currentLangObj.code}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showLangDropdown && (
              <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-xs sm:w-72 rounded-2xl bg-white p-3 shadow-2xl border border-slate-100 z-50 animate-fadeIn max-h-80 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
                  <span className="text-xs font-bold text-slate-900 font-headline flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[#134431]" />
                    <span>Select Language / भाषा चुनें</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400">
                    22+ Languages
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1">
                  {allLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLangDropdown(false);
                      }}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition-colors",
                        language === lang.code
                          ? "bg-[#134431] text-white font-bold"
                          : "text-slate-700 hover:bg-[#edf7f1] hover:text-[#134431]"
                      )}
                    >
                      <span className="truncate">{lang.name}</span>
                      {language === lang.code && (
                        <Check className="w-3 h-3 text-white shrink-0 ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick AI Assistant Trigger (Desktop/Tablet only; Mobile has floating button & bottom nav) */}
          <button
            type="button"
            onClick={() => setIsAiDrawerOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#edf7f1] border border-[#cbe7d7] text-[#134431] hover:bg-[#e1f2e8] text-xs font-bold shadow-2xs hover:scale-[1.02] transition-all select-none min-h-[36px]"
            title={isOfficer ? "Open AI Ops Dispatch Assistant" : "Open JanSeva AI Civic Assistant"}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulseSlow" />
            <span>{isOfficer ? "AI Ops Copilot" : t("assistant")}</span>
          </button>

          {/* Report Issue (Citizen) or Active Shift (Officer) */}
          {isOfficer ? (
            <div className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#134431] text-emerald-300 text-xs font-bold shadow-md shadow-emerald-950/20 min-h-[36px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Active Shift</span>
            </div>
          ) : (
            <Link
              href="/report"
              className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#134431] hover:bg-[#0c2e21] text-white text-xs font-bold shadow-md shadow-emerald-950/20 hover:scale-[1.02] active:scale-98 transition-all min-h-[36px]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t("report")}</span>
            </Link>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              type="button"
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
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
              <div className="absolute right-0 mt-2 w-[calc(100vw-24px)] max-w-xs sm:w-96 rounded-2xl bg-white p-3 shadow-xl border border-slate-100 z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 font-headline font-bold text-sm text-slate-900">
                    <Bell className="w-4 h-4 text-[#134431]" />
                    <span>{t("notifications")}</span>
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
                        <span className="text-xs font-bold text-slate-900">
                          {n.title}
                        </span>
                        {!n.read && (
                          <span className="w-2 h-2 rounded-full bg-[#134431] shrink-0 mt-1"></span>
                        )}
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
              router.push("/login");
            }}
          />
        </div>
      </div>
    </header>
  );
}
