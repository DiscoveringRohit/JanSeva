"use client";

import React, { useState } from "react";
import { OfficialAnnouncement, NotificationItem } from "@/lib/data/mock-data";
import {
  Megaphone,
  AlertTriangle,
  ShieldCheck,
  X,
  MapPin,
  Clock,
  Building2,
  Share2,
  Check,
  PhoneCall,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

interface AnnouncementCardModalProps {
  announcement: OfficialAnnouncement | NotificationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDismissForever?: (id: string | number) => void;
  onAcknowledge?: (id: string | number) => void;
}

export function AnnouncementCardModal({
  announcement,
  isOpen,
  onClose,
  onDismissForever,
  onAcknowledge,
}: AnnouncementCardModalProps) {
  const [copied, setCopied] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen || !announcement) return null;

  const title = announcement.title;
  const message = announcement.message;
  const timestamp = (announcement as any).createdAt || (announcement as any).timestamp || new Date().toISOString();
  const department = (announcement as any).department || "Municipal Corporation";
  const urgency = (announcement as any).urgency || "Advisory";
  const author = (announcement as any).authorName || "Department Authority";
  const category = (announcement as any).category || "General Advisory";
  const targetPins = (announcement as any).pincodes || ((announcement as any).pincode ? [(announcement as any).pincode] : []);

  const isEmergency = urgency === "Emergency" || urgency === "High";

  const handleShare = () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${title}\n\n${message}\n\nTarget PINs: ${targetPins.join(", ") || "All Wards"}\nRead more: ${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleClose = () => {
    if (dontShowAgain && onDismissForever && announcement.id) {
      onDismissForever(announcement.id);
    }
    onClose();
  };

  const handleAcknowledgeAndClose = () => {
    if (onAcknowledge && announcement.id) {
      onAcknowledge(announcement.id);
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div 
        className={cn(
          "relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border overflow-hidden transition-all transform animate-in fade-in zoom-in-95 duration-200",
          isEmergency ? "border-rose-300 ring-4 ring-rose-500/10" : "border-emerald-200 ring-4 ring-emerald-500/10"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className={cn(
          "p-6 text-white relative overflow-hidden",
          isEmergency
            ? "bg-gradient-to-br from-rose-600 via-rose-700 to-amber-800"
            : "bg-gradient-to-br from-[#134431] via-[#0c2e21] to-emerald-950"
        )}>
          {/* Subtle Decorative Circle */}
          <div className="absolute -right-8 -bottom-8 w-36 h-36 rounded-full bg-white/10 blur-xl pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 shadow-md",
                isEmergency ? "bg-white text-rose-700 animate-pulse" : "bg-emerald-100/20 text-emerald-300 border border-emerald-400/30"
              )}>
                {isEmergency ? <AlertTriangle className="w-6 h-6" /> : <Megaphone className="w-6 h-6" />}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                    isEmergency ? "bg-rose-900/80 text-rose-100 border border-rose-400/40" : "bg-emerald-400/20 text-emerald-200 border border-emerald-400/30"
                  )}>
                    {isEmergency ? "🚨 Emergency Broadcast" : "📢 Official Municipal Advisory"}
                  </span>
                  
                  <span className="text-[11px] text-white/80 font-medium">
                    {category}
                  </span>
                </div>

                <h2 className="font-headline font-black text-lg text-white mt-1 leading-snug">
                  {department}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Close Advisory"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Target Geography Badges */}
          <div className="flex items-center justify-between gap-2 flex-wrap pb-3 border-b border-slate-100">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Target Scope:
              </span>
              {targetPins.length > 0 ? (
                targetPins.map((pin: string) => (
                  <span
                    key={pin}
                    className="px-2.5 py-1 rounded-xl text-xs font-extrabold bg-[#edf7f1] text-[#134431] border border-[#cbe7d7] shadow-2xs"
                  >
                    PIN {pin}
                  </span>
                ))
              ) : (
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700">
                  All City Wards
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDate(timestamp)}</span>
            </div>
          </div>

          {/* Title & Message */}
          <div className="space-y-2">
            <h3 className="font-headline font-black text-lg text-slate-900 leading-snug">
              {title}
            </h3>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-line">
              {message}
            </div>
          </div>

          {/* Official Authority Assurance Note */}
          <div className="p-3.5 rounded-2xl bg-[#f4fbf7] border border-[#cbe7d7] flex items-start gap-3 text-xs text-[#134431]">
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Verified Municipal Broadcast</p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Dispatched by <strong>{author}</strong>. For emergency water tankers or grid rescue, contact the 24x7 BMC Control Room at <strong>1916</strong>.
              </p>
            </div>
          </div>

          {/* Don't show again toggle */}
          <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 border-slate-300"
              />
              <span>Don't pop up this advisory again</span>
            </label>

            <button
              type="button"
              onClick={handleShare}
              className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "Link Copied!" : "Share Advisory"}</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleAcknowledgeAndClose}
            className="flex-1 py-3 px-4 rounded-2xl bg-[#134431] hover:bg-[#0c2e21] text-white font-headline font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 text-emerald-300" />
            <span>Acknowledge &amp; Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
