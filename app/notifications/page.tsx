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
  ArrowRight,
  Megaphone,
  MapPin,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { AnnouncementCardModal } from "@/components/announcements/announcement-card-modal";
import { NotificationItem } from "@/lib/data/mock-data";

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    unreadNotifsCount,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<"all" | "officer" | "upvote" | "ward" | "badge">("all");
  const [selectedAnnouncementForModal, setSelectedAnnouncementForModal] = useState<NotificationItem | null>(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  const filtered = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "officer") return n.type === "officer" || n.type === "announcement";
    return n.type === activeFilter;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "officer":
      case "announcement":
        return <Megaphone className="w-5 h-5 text-emerald-700" />;
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
            Real-time status updates on your filed reports, neighbor votes, and official municipal advisories.
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
          { id: "officer", label: "📢 Official Advisories" },
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
          filtered.map((n) => {
            const isOfficer = n.type === "officer" || n.type === "announcement";
            const targetPins = n.pincodes && n.pincodes.length > 0 ? n.pincodes : (n.pincode ? [n.pincode] : []);

            return (
              <div
                key={n.id}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (isOfficer) {
                    setSelectedAnnouncementForModal(n);
                    setIsAnnouncementModalOpen(true);
                  } else if (n.actionUrl) {
                    router.push(n.actionUrl);
                  }
                }}
                className={cn(
                  "p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer flex items-start gap-4 group",
                  !n.read
                    ? isOfficer
                      ? "bg-[#f4fbf7] border-emerald-300 shadow-md shadow-emerald-950/5 hover:border-emerald-500"
                      : "bg-white border-primary-200 shadow-md shadow-primary-500/5 hover:border-primary-400"
                    : "bg-white/80 border-surface-container-high hover:bg-white shadow-soft"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl border shrink-0 group-hover:scale-105 transition-transform",
                  isOfficer ? "bg-emerald-100/70 border-emerald-200" : "bg-surface-container-low border-surface-dim"
                )}>
                  {getIcon(n.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isOfficer && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#134431] border border-emerald-300">
                          Official Advisory
                        </span>
                      )}

                      {targetPins.length > 0 && (
                        <div className="flex items-center gap-1">
                          {targetPins.map((pin) => (
                            <span key={pin} className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#134431] text-emerald-100 flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 text-emerald-300" />
                              <span>PIN {pin}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      <h4 className={cn("text-xs sm:text-sm text-on-surface font-headline", !n.read ? "font-bold text-primary-900" : "font-semibold")}>
                        {n.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-on-surface-variant font-medium">
                        {formatDate(n.timestamp)}
                      </span>
                      {!n.read && (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shadow-sm" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                    {n.message}
                  </p>

                  <div className="pt-1.5 flex items-center gap-1 text-[11px] font-bold text-emerald-700 group-hover:text-emerald-900">
                    <span>{isOfficer ? "Inspect Full Advisory Card →" : "View Details →"}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive Official Announcement Modal Card */}
      <AnnouncementCardModal
        announcement={selectedAnnouncementForModal}
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
      />

    </div>
  );
}
