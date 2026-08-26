"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import {
  Bell,
  CheckCircle2,
  ThumbsUp,
  ShieldCheck,
  Award,
  Building2,
  Clock,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadNotifsCount,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<"all" | "officer" | "upvote" | "ward" | "badge">("all");

  const filtered = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    return n.type === activeFilter;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "officer":
      case "status":
        return <ShieldCheck className="w-5 h-5 text-indigo-600" />;
      case "upvote":
        return <ThumbsUp className="w-5 h-5 text-rose-600" />;
      case "badge":
        return <Award className="w-5 h-5 text-amber-600" />;
      case "ward":
        return <Building2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-primary-600" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline font-black text-2xl sm:text-3xl text-on-surface">
              Notifications & Alerts
            </h1>
            {unreadNotifsCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 font-bold text-xs">
                {unreadNotifsCount} New
              </span>
            )}
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Real-time status updates on your filed reports, neighbor votes, and municipal alerts.
          </p>
        </div>

        {unreadNotifsCount > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="px-4 py-2 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-dim text-xs font-bold text-primary-700 transition-colors"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: "all", label: "All Alerts" },
          { id: "officer", label: "Officer Updates" },
          { id: "upvote", label: "Neighbor Upvotes" },
          { id: "badge", label: "Badges & XP" },
          { id: "ward", label: "Ward Notices" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id as any)}
            className={cn(
              "px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all shrink-0 select-none",
              activeFilter === tab.id
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white text-on-surface-variant hover:bg-surface-container border border-surface-dim"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-3xl bg-white border border-surface-container-high p-12 text-center space-y-2">
            <Bell className="w-8 h-8 text-on-surface-variant/40 mx-auto" />
            <p className="font-headline font-bold text-sm text-on-surface">No alerts in this category</p>
            <p className="text-xs text-on-surface-variant">You're all caught up with neighborhood updates!</p>
          </div>
        ) : (
          filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationRead(n.id);
                if (n.actionUrl) router.push(n.actionUrl);
              }}
              className={cn(
                "p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer flex items-start gap-4 group",
                !n.read
                  ? "bg-white border-primary-200 shadow-md shadow-primary-500/5 hover:border-primary-400"
                  : "bg-white/80 border-surface-container-high hover:bg-white shadow-soft"
              )}
            >
              <div className="p-3 rounded-2xl bg-surface-container-low border border-surface-dim shrink-0 group-hover:scale-105 transition-transform">
                {getIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={cn("text-xs sm:text-sm text-on-surface font-headline", !n.read ? "font-bold text-primary-900" : "font-semibold")}>
                    {n.title}
                  </h4>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      {formatDate(n.timestamp)}
                    </span>
                    {!n.read && (
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-600 shadow-sm" />
                    )}
                  </div>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {n.message}
                </p>

                {n.actionUrl && (
                  <div className="pt-2 flex items-center gap-1 text-[11px] font-bold text-primary-600 group-hover:text-primary-800">
                    <span>View Details</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
