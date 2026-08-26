"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { FloatingAssistantBtn } from "@/components/assistant/floating-assistant-btn";
import { AiAssistantDrawer } from "@/components/assistant/ai-assistant-drawer";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If auth page, show minimal layout without sidebar
  const isAuthPage = 
    pathname === "/login" || 
    pathname === "/register" || 
    pathname === "/signup" || 
    pathname === "/officer-portal" ||
    pathname === "/forgot-password";

  if (isAuthPage) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface text-on-surface">
      {/* Top Navbar */}
      <Navbar onToggleMobileMenu={() => setMobileSidebarOpen(true)} />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12">
          {children}
        </main>
      </div>

      {/* Floating AI Assistant Trigger & Drawer */}
      <FloatingAssistantBtn />
      <AiAssistantDrawer />

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
