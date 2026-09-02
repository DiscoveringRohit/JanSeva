"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Layers, 
  Calendar, 
  Users, 
  GitMerge, 
  BarChart3, 
  Megaphone, 
  FileText, 
  ShieldCheck,
  LogOut,
  X
} from "lucide-react";
import { useApp } from "@/lib/context/app-context";
import { authService } from "@/lib/auth/auth-service-cookie3";

interface OfficerSidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function OfficerSidebar({ mobileOpen, onCloseMobile }: OfficerSidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useApp();
  
  const handleSignOut = async () => {
    await logout();
    if (typeof window !== "undefined") {
      window.location.href = "/officer-portal";
    }
  };

  const navItems = [
    { name: "Command Hub", href: `/officer/${user?.department?.toLowerCase() || 'municipal'}`, icon: LayoutDashboard },
    { name: "Ticket Triage", href: "#", icon: Layers },
    { name: "SLA Calendar", href: "#", icon: Calendar },
    { name: "Squad Dispatch", href: "#", icon: Users },
    { name: "Duplicate Review", href: "#", icon: GitMerge },
    { name: "Analytics & Trends", href: "#", icon: BarChart3 },
    { name: "Public Broadcasts", href: "#", icon: Megaphone },
    { name: "Compliance Reports", href: "#", icon: FileText },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden backdrop-blur-sm"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={cn(
          "fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block flex flex-col shadow-lg lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
          
          <div className="lg:hidden flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
            <span className="font-headline font-bold text-[#134431]">Ops Console</span>
            <button onClick={onCloseMobile} className="p-1.5 bg-slate-100 rounded-full text-slate-500">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 py-2 mb-1">
            Core Operations
          </div>
          
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.name === "Command Hub" && pathname.startsWith("/officer/"));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => onCloseMobile()}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-[#134431] text-white shadow-sm"
                    : "text-slate-600 hover:bg-[#edf7f1] hover:text-[#134431]"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-300" : "text-slate-400 group-hover:text-[#134431]")} />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-1">
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-[#edf7f1] hover:text-[#134431] transition-all group"
          >
            <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-[#134431]" />
            Authority Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all group"
          >
            <LogOut className="w-5 h-5 text-rose-400 group-hover:text-rose-500" />
            Sign Out Securely
          </button>
        </div>
      </aside>
    </>
  );
}
