"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";
import { Building2, Shield, Phone, Mail, Award, CheckCircle2, TrendingUp } from "lucide-react";

export function WardStatsWidget() {
  const { wardData, issues } = useApp();

  const total = issues.length;
  const resolved = issues.filter((i) => i.status === "Resolved").length;
  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 87;

  return (
    <div className="rounded-3xl bg-white border border-surface-container-high/80 p-5 shadow-soft space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-sm text-on-surface">Ward 42 • {wardData.name}</h4>
            <p className="text-[11px] text-on-surface-variant font-medium">Bengaluru City Corporation</p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          Rank #3
        </span>
      </div>

      {/* Ward Corporator Card */}
      <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-dim flex items-center gap-3">
        <img
          src={wardData.corporator.avatar}
          alt={wardData.corporator.name}
          className="w-11 h-11 rounded-full object-cover ring-2 ring-primary-500/20"
        />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-wider font-bold text-primary-700">Ward Corporator</p>
          <p className="text-xs font-bold text-on-surface truncate">{wardData.corporator.name}</p>
          <p className="text-[10px] text-on-surface-variant">{wardData.corporator.party}</p>
        </div>
      </div>

      {/* Ward Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2.5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
          <p className="text-base font-extrabold text-primary-700 font-headline">{resolutionRate}%</p>
          <p className="text-[10px] font-medium text-on-surface-variant">Resolution Rate</p>
        </div>
        <div className="p-2.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
          <p className="text-base font-extrabold text-emerald-700 font-headline">{wardData.stats.avgResolutionHours}h</p>
          <p className="text-[10px] font-medium text-on-surface-variant">Avg. Fix Time</p>
        </div>
      </div>

      {/* Quick Action Links */}
      <div className="pt-2 border-t border-surface-dim space-y-1.5 text-xs">
        <Link
          href="/ward"
          className="flex items-center justify-between text-primary-600 font-bold hover:underline py-1"
        >
          <span>View Ward 42 Budget & Projects</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
