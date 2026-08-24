"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { authService } from "@/lib/auth/auth-service-cookie3";
import {
  LayoutGrid,
  Compass,
  Map,
  Building2,
  Bot,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
  Award,
  Sparkles,
  ExternalLink,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, unreadNotifsCount } = useApp();
  const isProfilePage = pathname === "/profile";

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.warn("Logout error", e);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("janseva_token");
      localStorage.removeItem("janseva_user");
    }
    setUser(null as any);
    router.push("/login");
  };

  const navItems = [
    { label: "Feed", href: "/feed", icon: LayoutGrid },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Live Map", href: "/map", icon: Map },
    { label: "My Ward 360°", href: "/ward", icon: Building2 },
    { label: "AI Assistant", href: "/assistant", icon: Bot, highlight: true },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: unreadNotifsCount > 0 ? `${unreadNotifsCount}` : undefined,
    },
    { label: "My Profile", href: "/profile", icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden animate-fadeIn"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-100 flex flex-col justify-between p-5 transition-all duration-300 ease-in-out lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:z-30 overflow-y-auto no-scrollbar",
          isProfilePage ? "w-72 sm:w-80 lg:w-20 lg:p-3" : "w-72 sm:w-80",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="space-y-6">
          
          {/* Mobile Header in Drawer */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#134431] flex items-center justify-center text-white font-bold text-xs">
                JS
              </div>
              <span className="font-headline font-black text-base text-slate-900">JanSeva</span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 text-sm"
            >
              ✕
            </button>
          </div>

          {/* 1. TOP PROFILE SECTION */}
          <div className={cn("space-y-4 pt-1", isProfilePage && "lg:space-y-2 lg:pt-0")}>
            
            {/* Centered Avatar */}
            <div className="flex flex-col items-center text-center">
              <Link href="/profile" onClick={onCloseMobile} className="relative group block">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className={cn(
                      "rounded-full object-cover ring-4 ring-emerald-500/20 border-2 border-white shadow-md group-hover:scale-105 transition-transform",
                      isProfilePage ? "w-20 h-20 lg:w-11 lg:h-11" : "w-20 h-20"
                    )}
                  />
                ) : (
                  <div className={cn(
                    "rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-headline font-black ring-4 ring-emerald-500/20 border-2 border-white shadow-md group-hover:scale-105 transition-transform",
                    isProfilePage ? "w-20 h-20 lg:w-11 lg:h-11 text-base" : "w-20 h-20 text-2xl"
                  )}>
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div className={cn(
                  "absolute bottom-0 right-0 rounded-full bg-emerald-600 text-white flex items-center justify-center border-2 border-white shadow-xs",
                  isProfilePage ? "w-6 h-6 lg:w-4 lg:h-4" : "w-6 h-6"
                )}>
                  <ShieldCheck className={cn("w-3.5 h-3.5", isProfilePage && "lg:w-2.5 lg:h-2.5")} />
                </div>
              </Link>

              {/* Name & Handle (hidden in icon-only mode on desktop) */}
              <div className={cn("mt-2.5", isProfilePage && "lg:hidden")}>
                <Link
                  href="/profile"
                  onClick={onCloseMobile}
                  className="font-headline font-black text-base text-slate-900 hover:text-emerald-800 transition-colors block leading-tight"
                >
                  {user?.name || "Civic Resident"}
                </Link>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  @{user?.username || (user?.name ? user.name.toLowerCase().replace(/\s+/g, "_") : "citizen")}
                </p>
              </div>
            </div>

            {/* 3-Column Stats Bar (hidden in icon-only mode on desktop) */}
            <div className={cn("flex items-center justify-around py-3 px-2 rounded-2xl bg-[#f8faf9] border border-slate-100 text-center", isProfilePage && "lg:hidden")}>
              <div className="flex-1">
                <p className="font-headline font-black text-sm text-slate-900">
                  {user?.stats?.issuesReported ?? 4}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  Posts
                </p>
              </div>

              <div className="w-px h-6 bg-slate-200"></div>

              <div className="flex-1">
                <p className="font-headline font-black text-sm text-slate-900">
                  {user?.stats?.upvotesGiven ?? 28}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  Upvotes
                </p>
              </div>

              <div className="w-px h-6 bg-slate-200"></div>

              <div className="flex-1">
                <p className="font-headline font-black text-sm text-emerald-700">
                  {user?.civicCitizenXP ?? 100}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                  XP
                </p>
              </div>
            </div>

            {/* Bio / Civic Role Details (hidden in icon-only mode on desktop) */}
            <div className={cn("px-1 text-center sm:text-left space-y-0.5", isProfilePage && "lg:hidden")}>
              <p className="font-bold text-xs text-slate-800">
                {user?.name || "Civic Citizen"}
              </p>
              <p className="text-[11px] text-slate-500 leading-snug">
                {user?.role === "officer" ? "Department Authority" : user?.levelTitle || "Active Citizen"} | Ward {user?.wardNumber || 63} • {user?.city || "Bhubaneswar"}
              </p>
            </div>

          </div>

          {/* 2. VERTICAL NAVIGATION MENU */}
          <nav className="space-y-1.5 pt-2 border-t border-slate-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  title={item.label}
                  className={cn(
                    "flex items-center rounded-2xl text-xs font-bold transition-all group select-none",
                    isProfilePage ? "px-4 py-2.5 lg:px-0 lg:py-3 lg:justify-center" : "justify-between px-4 py-2.5",
                    isActive
                      ? "bg-[#134431] text-white shadow-md shadow-emerald-950/20"
                      : "text-slate-700 hover:bg-[#edf7f1] hover:text-[#134431]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-transform group-hover:scale-110",
                        isActive ? "text-white" : "text-slate-500 group-hover:text-[#134431]"
                      )}
                    />
                    <span className={cn(isProfilePage && "lg:hidden")}>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        isProfilePage && "lg:hidden",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-emerald-100 text-emerald-800"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

        </div>

        {/* 3. BOTTOM LOGOUT BUTTON */}
        <div className="pt-4 border-t border-slate-100 mt-6">
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className={cn(
                "w-full flex items-center rounded-2xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors group",
                isProfilePage ? "px-4 py-2.5 lg:px-0 lg:py-2.5 lg:justify-center" : "gap-3 px-4 py-2.5"
              )}
            >
              <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
              <span className={cn(isProfilePage && "lg:hidden")}>Logout</span>
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onCloseMobile}
              className={cn(
                "w-full flex items-center justify-center rounded-2xl text-xs font-bold bg-[#134431] text-white hover:bg-[#0c2e21] shadow-md transition-colors",
                isProfilePage ? "px-4 py-2.5 lg:px-0 lg:py-2.5" : "px-4 py-2.5"
              )}
            >
              <span className={cn(isProfilePage && "lg:hidden")}>Sign In</span>
            </Link>
          )}
        </div>

      </aside>
    </>
  );
}

