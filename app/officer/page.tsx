"use client";

import React from "react";
import { OfficerKanban } from "@/components/officer/officer-kanban";
import { useApp } from "@/lib/context/app-context";
import { ShieldCheck, UserCheck, Sparkles, Building2 } from "lucide-react";

export default function OfficerPage() {
  const { user, switchRole } = useApp();

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline font-black text-2xl sm:text-3xl text-on-surface">
              Ward Operations Center & Officer Dispatch
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-800 border border-primary-200">
              Ward 42
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Municipal engineering console for SLA management, field squad dispatch, and resolution verification.
          </p>
        </div>

        {/* Quick Role Switcher for convenience */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-surface-container-high shadow-sm text-xs font-bold">
          <span className="text-on-surface-variant px-2">Active Role:</span>
          <button
            type="button"
            onClick={() => switchRole("officer")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              user.role === "officer" ? "bg-primary-600 text-white shadow-sm" : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            Officer View
          </button>
          <button
            type="button"
            onClick={() => switchRole("citizen")}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              user.role === "citizen" ? "bg-primary-600 text-white shadow-sm" : "text-on-surface hover:bg-surface-container-low"
            }`}
          >
            Citizen View
          </button>
        </div>
      </div>

      <OfficerKanban />
    </div>
  );
}
