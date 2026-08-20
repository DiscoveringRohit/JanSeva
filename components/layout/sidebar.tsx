"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import {
  Flame,
  LayoutGrid,
  Compass,
  Map,
  Building2,
  PlusCircle,
  ShieldCheck,
  Bot,
  Bell,
  User,
  ExternalLink,
  PhoneCall,
  Activity,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, unreadNotifsCount, wardData, issues } = useApp();

  const activeOfficerTickets = issues.filter((i) => i.status === "In Progress" || i.status === "Assigned").length;

  const navItems = [
    { label: "Community Feed", href: "/feed", icon: LayoutGrid },
    { label: "Explore Issues", href: "/explore", icon: Compass },
    { label: "Civic Live Map", href: "/map", icon: Map },
    { label: "My Ward 360°", href: "/ward", icon: Building2 },
    { label: "AI Smart Report", href: "/report", icon: PlusCircle, highlight: true },
    { label: "AI Civic Assistant", href: "/assistant", icon: Bot },
    {
      label: "Notifications",
      href: "/notifications",
      icon: Bell,
      badge: unreadNotifsCount > 0 ? `${unreadNotifsCount}` : undefined,
    },
    { label: "My Profile & Karma", href: "/profile", icon: User },
    { label: "Platform Overview", href: "/", icon: ExternalLink },
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
          "fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-surface-container-high flex flex-col justify-between p-4 transition-transform duration-300 ease-in-out lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:z-30",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col gap-6 overflow-y-auto pr-1">
          {/* Mobile Header in Drawer */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-surface-dim">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold">
                JS
              </div>
              <span className="font-headline font-black text-lg text-on-surface">JanSeva</span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container-low"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group select-none",
                    isActive
                      ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                      : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
                    item.highlight && !isActive ? "bg-gradient-to-r from-primary-50 to-indigo-50/60 text-primary-700 font-bold border border-primary-100" : ""
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-transform group-hover:scale-110",
                        isActive ? "text-white" : item.highlight ? "text-primary-600" : "text-on-surface-variant"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-bold",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-indigo-100 text-primary-800"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Ward 42 Health Pulse Box */}
          <div className="rounded-2xl p-3.5 bg-gradient-to-br from-surface-container-low via-indigo-50/40 to-emerald-50/40 border border-surface-dim/80 shadow-soft">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary-600" />
                <span className="text-xs font-bold text-on-surface font-headline">Ward 42 Pulse</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                {wardData.healthScore}/100
              </span>
            </div>

            <div className="space-y-1.5 text-[11px]">
              <div>
                <div className="flex justify-between text-on-surface-variant text-[10px] font-semibold mb-0.5">
                  <span>Cleanliness Index</span>
                  <span className="text-emerald-700 font-bold">{wardData.metrics.cleanliness}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-dim rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${wardData.metrics.cleanliness}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-on-surface-variant text-[10px] font-semibold mb-0.5">
                  <span>Roads & Drainage</span>
                  <span className="text-primary-700 font-bold">{wardData.metrics.roads}%</span>
                </div>
                <div className="w-full h-1.5 bg-surface-dim rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600 rounded-full" style={{ width: `${wardData.metrics.roads}%` }}></div>
                </div>
              </div>
            </div>

            <Link
              href="/ward"
              onClick={onCloseMobile}
              className="mt-2.5 block text-center text-[10px] font-bold text-primary-600 hover:underline"
            >
              View Full Ward Analytics →
            </Link>
          </div>
        </div>

        {/* Footer: User Karma XP & Quick Helpline */}
        <div className="pt-3 border-t border-surface-container-high space-y-2">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-surface-container-low text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-[10px] text-on-surface-variant font-medium">Civic Karma</p>
                <p className="font-bold text-on-surface">{user ? `${user.karmaXP} XP` : "0 XP"}</p>
              </div>
            </div>
            {user ? (
              <Link
                href="/profile"
                onClick={onCloseMobile}
                className="text-[10px] font-bold text-primary-600 hover:underline"
              >
                Level {user.level}
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={onCloseMobile}
                className="text-[10px] font-bold text-primary-600 hover:underline"
              >
                Login to earn XP
              </Link>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] text-on-surface-variant px-1 font-medium">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-rose-500" />
              Municipal Helpline:
            </span>
            <span className="font-bold text-on-surface">1533 / 1912</span>
          </div>
        </div>
      </aside>
    </>
  );
}
