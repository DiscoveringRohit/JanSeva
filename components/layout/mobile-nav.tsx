"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import {
  LayoutGrid,
  Compass,
  Map,
  User,
  Bot,
  AlertTriangle,
  Users,
  Calendar,
  Vote,
  Layers,
  Radio
} from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useApp();

  const isOfficer = Boolean(
    user?.role === "officer" || 
    user?.role === "corporator" || 
    pathname.startsWith("/officer")
  );

  const officerDept = user?.department ? user.department.toLowerCase() : "water";
  const currentTab = searchParams ? searchParams.get("tab") : null;
  const activeOfficerTab = currentTab || "workbench";

  // Citizen Navigation
  const citizenNavItems = [
    { label: "Feed", href: "/feed", icon: LayoutGrid },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "AI Report", href: "/report", icon: Bot, isCenter: true },
    { label: "Map", href: "/map", icon: Map },
    { label: "Profile", href: "/profile", icon: User },
  ];

  // Authority Operations Navigation
  const officerNavItems = [
    { label: "Workbench", href: `/officer/${officerDept}`, tab: "workbench", icon: LayoutGrid },
    { label: "Breaches", href: `/officer/${officerDept}?tab=escalations`, tab: "escalations", icon: AlertTriangle, badge: "2" },
    { label: "Squads", href: `/officer/${officerDept}?tab=squads`, tab: "squads", icon: Users, isCenter: true },
    { label: "Polls", href: `/officer/${officerDept}?tab=polls`, tab: "polls", icon: Vote },
    { label: "Calendar", href: `/officer/${officerDept}?tab=calendar`, tab: "calendar", icon: Calendar },
  ];

  const activeItems = isOfficer ? officerNavItems : citizenNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 flex items-center justify-around lg:hidden shadow-xl">
      {activeItems.map((item: any) => {
        const Icon = item.icon;
        const isActive = isOfficer
          ? (item.tab ? item.tab === activeOfficerTab : activeOfficerTab === "workbench")
          : (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));

        if (item.isCenter) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative -top-4 flex flex-col items-center group select-none"
            >
              <div className="relative w-12 h-12 rounded-full bg-[#134431] text-white flex items-center justify-center shadow-xl shadow-emerald-950/30 group-active:scale-95 transition-all ring-4 ring-white">
                <Icon className="w-6 h-6 text-emerald-300 transition-transform group-hover:scale-110" />
                {isOfficer && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </div>
              <span className={cn(
                "text-[10px] font-bold mt-1 transition-colors",
                isActive ? "text-[#134431]" : "text-slate-600"
              )}>
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all select-none min-w-[56px]",
              isActive
                ? "bg-[#134431] text-white shadow-md shadow-emerald-950/20"
                : "text-slate-500 hover:text-[#134431] hover:bg-[#edf7f1]"
            )}
          >
            <Icon className={cn("w-5 h-5 transition-transform", isActive ? "stroke-[2.5] text-white" : "stroke-2")} />
            <span className={cn(
              "text-[10px] tracking-tight",
              isActive ? "font-black text-white" : "font-semibold text-slate-500"
            )}>
              {item.label}
            </span>
            {item.badge && !isActive && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
