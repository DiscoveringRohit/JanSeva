import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, AlertTriangle, Sparkles, Wrench, ShieldCheck } from "lucide-react";

interface StatusBadgeProps {
  status: "Reported" | "AI Verified" | "Assigned" | "In Progress" | "Resolved";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({ status, className, size = "md" }: StatusBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2.5 py-0.5 gap-1",
    md: "text-xs font-semibold px-3 py-1 gap-1.5",
    lg: "text-sm font-semibold px-3.5 py-1.5 gap-2",
  };

  switch (status) {
    case "Resolved":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-medium tracking-wide shadow-sm",
            sizeClasses[size],
            className
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Resolved
        </span>
      );
    case "In Progress":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-medium tracking-wide shadow-sm",
            sizeClasses[size],
            className
          )}
        >
          <Wrench className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ animationDuration: "6s" }} />
          In Progress
        </span>
      );
    case "AI Verified":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-gradient-to-r from-indigo-50 via-purple-50 to-teal-50 text-indigo-900 border border-indigo-300/80 font-semibold tracking-wide shadow-sm",
            sizeClasses[size],
            className
          )}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          AI Verified
        </span>
      );
    case "Assigned":
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-200/80 font-medium tracking-wide shadow-sm",
            sizeClasses[size],
            className
          )}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          Dispatched
        </span>
      );
    case "Reported":
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium tracking-wide",
            sizeClasses[size],
            className
          )}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
          Reported
        </span>
      );
  }
}

export function UrgencyBadge({ urgency, className }: { urgency: "Critical" | "High" | "Moderate" | "Low"; className?: string }) {
  switch (urgency) {
    case "Critical":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-rose-100/90 text-rose-800 border border-rose-300 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider animate-pulseSlow",
            className
          )}
        >
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          Critical
        </span>
      );
    case "High":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
            className
          )}
        >
          High
        </span>
      );
    case "Moderate":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider",
            className
          )}
        >
          Moderate
        </span>
      );
    case "Low":
    default:
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider",
            className
          )}
        >
          Low
        </span>
      );
  }
}
