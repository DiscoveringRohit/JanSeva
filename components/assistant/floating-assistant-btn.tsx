"use client";

import React from "react";
import { useApp } from "@/lib/context/app-context";
import { Sparkles, Bot } from "lucide-react";

export function FloatingAssistantBtn() {
  const { isAiDrawerOpen, setIsAiDrawerOpen } = useApp();

  if (isAiDrawerOpen) return null;

  return (
    <button
      type="button"
      onClick={() => setIsAiDrawerOpen(true)}
      className="fixed bottom-20 right-5 lg:bottom-8 lg:right-8 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-700 text-white font-bold text-xs shadow-xl shadow-primary-600/35 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all group ring-4 ring-white/50"
      aria-label="Open JanSeva AI Copilot"
    >
      <div className="relative">
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
      </div>
      <span className="hidden sm:inline font-headline tracking-wide">JanSeva AI</span>
    </button>
  );
}
