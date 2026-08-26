"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { LayoutGrid, Compass, Map, User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();
  const { t } = useApp();

  const navItems = [
    { label: t("home"), href: "/feed", icon: LayoutGrid },
    { label: t("explore"), href: "/explore", icon: Compass },
    { label: t("report"), href: "/report", icon: Bot, isCenter: true },
    { label: t("map"), href: "/map", icon: Map },
    { label: t("profile"), href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] flex items-center justify-around lg:hidden shadow-xl select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

        if (item.isCenter) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative -top-4 flex flex-col items-center group select-none"
            >
              <div className="relative w-12 h-12 rounded-full bg-[#134431] text-white flex items-center justify-center shadow-xl shadow-emerald-950/30 group-active:scale-95 transition-all ring-4 ring-white">
                <Bot className="w-6 h-6 text-emerald-300 transition-transform group-hover:scale-110" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-white"></span>
              </div>
              <span className={cn(
                "text-[10px] font-bold mt-1 transition-colors",
                isActive ? "text-[#134431]" : "text-slate-600"
              )}>
                AI Report
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-0.5 py-1.5 px-3 rounded-2xl transition-all select-none min-w-[56px]",
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
          </Link>
        );
      })}
    </nav>
  );
}
