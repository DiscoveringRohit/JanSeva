"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";
import { 
  Menu, 
  Search, 
  Bell, 
  Megaphone, 
  ShieldCheck, 
  Building2,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";

export function OfficerNavbar({ onToggleMobileMenu }: { onToggleMobileMenu: () => void }) {
  const { user } = useApp();
  const params = useParams();
  
  const departmentSlug = (params.department as string) || "Municipal";
  const departmentName = departmentSlug.charAt(0).toUpperCase() + departmentSlug.slice(1);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm h-16 flex items-center px-4 sm:px-6 lg:px-8">
      
      {/* Left Section: Mobile Menu & Department Branding */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Department Badge */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-[#134431]/5 border border-[#134431]/10 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-[#134431]" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#134431] leading-tight">BMC {departmentName} Division</span>
            <span className="text-[10px] font-medium text-[#134431]/70 leading-tight">Authority Console • Ward 42</span>
          </div>
        </div>
      </div>

      {/* Center Section: Ops Search */}
      <div className="flex-1 flex justify-center max-w-xl px-4 hidden md:flex">
        <div className="relative w-full group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-600 transition-colors" />
          <input 
            type="text"
            placeholder={`Search ${departmentName} tickets (#JS-105), citizens, or locations...`}
            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-transparent focus:bg-white focus:border-slate-300 focus:ring-2 focus:ring-[#134431]/20 rounded-xl text-sm transition-all outline-none"
          />
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center justify-end gap-3 flex-1">
        
        {/* Emergency Broadcast */}
        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition-colors">
          <Megaphone className="w-4 h-4" />
          <span>Broadcast</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Officer Profile Pill */}
        <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 pr-2 rounded-full transition-colors border border-transparent hover:border-slate-200">
          <div className="w-8 h-8 rounded-full bg-[#134431] text-white flex items-center justify-center font-bold text-sm overflow-hidden ring-2 ring-white shadow-sm">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0) || "O"
            )}
          </div>
          <div className="hidden lg:flex flex-col">
            <span className="text-xs font-bold text-slate-700 leading-tight">{user?.name || "Officer"}</span>
            <span className="text-[10px] font-medium text-slate-500 leading-tight flex items-center gap-1">
              {user?.department || departmentName} Dept <ChevronDown className="w-3 h-3" />
            </span>
          </div>
        </div>

      </div>

    </header>
  );
}
