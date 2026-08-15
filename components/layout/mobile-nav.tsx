"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Compass, PlusCircle, Map, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Feed", href: "/feed", icon: LayoutGrid },
    { label: "Explore", href: "/explore", icon: Compass },
    { label: "Report", href: "/report", icon: PlusCircle, isCenter: true },
    { label: "Map", href: "/map", icon: Map },
    { label: "Profile", href: "/profile", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-surface-container-high px-4 py-2 flex items-center justify-around lg:hidden shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

        if (item.isCenter) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative -top-5 flex flex-col items-center group"
            >
              <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-600/40 group-active:scale-95 transition-transform ring-4 ring-white">
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-primary-600 mt-1">Report</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors",
              isActive ? "text-primary-600" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            <Icon className={cn("w-5 h-5", isActive ? "stroke-[2.5]" : "stroke-2")} />
            <span className={cn("text-[10px] font-medium", isActive ? "font-bold text-primary-600" : "")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
