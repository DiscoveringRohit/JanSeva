"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CivicIssue } from "@/lib/data/mock-data";
import { useApp } from "@/lib/context/app-context";
import { StatusBadge, UrgencyBadge } from "@/components/ui/status-badge";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Eye,
  Check
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

interface IssueCardProps {
  issue: CivicIssue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const { toggleUpvote } = useApp();
  const [copied, setCopied] = useState(false);
  const [showResolvedPhoto, setShowResolvedPhoto] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/issues/${issue.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpvote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleUpvote(issue.id);
  };

  return (
    <article className="rounded-3xl bg-white border border-surface-container-high/80 p-5 sm:p-6 shadow-soft hover:shadow-cardHover transition-all duration-300 group flex flex-col justify-between">
      <div>
        {/* Card Header: Author, Location, Date, Status */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <img
              src={issue.reporter.avatar}
              alt={issue.reporter.name}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-100"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-bold text-on-surface font-headline">
                  {issue.reporter.name}
                </span>
                {issue.reporter.isVerified && (
                  <span title="Verified Resident of Ward 42">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
                  </span>
                )}
                <span className="text-[10px] text-on-surface-variant font-medium">
                  • {formatDate(issue.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-on-surface-variant mt-0.5">
                <MapPin className="w-3 h-3 text-primary-600 shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{issue.location.address}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <StatusBadge status={issue.status} size="sm" />
            <UrgencyBadge urgency={issue.urgency} />
          </div>
        </div>

        {/* Title & Description */}
        <Link href={`/issues/${issue.id}`} className="block group-hover:text-primary-700 transition-colors">
          <h3 className="font-headline font-bold text-base sm:text-lg text-on-surface leading-snug mb-1.5">
            {issue.title}
          </h3>
        </Link>
        <p className="text-xs sm:text-sm text-on-surface-variant line-clamp-2 leading-relaxed mb-4">
          {issue.description}
        </p>

        {/* Media / Images */}
        <div className="relative rounded-2xl overflow-hidden bg-surface-container mb-4 aspect-[16/9] border border-surface-dim">
          <img
            src={showResolvedPhoto && issue.images.resolved ? issue.images.resolved : issue.images.reported}
            alt={issue.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          />

          {/* If Resolved, Before/After toggle */}
          {issue.images.resolved && (
            <div className="absolute top-3 right-3 flex items-center bg-black/70 backdrop-blur-md rounded-full p-1 text-white text-[10px] font-bold shadow-lg">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowResolvedPhoto(false);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-full transition-colors",
                  !showResolvedPhoto ? "bg-white text-black" : "text-white/80 hover:text-white"
                )}
              >
                Reported
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setShowResolvedPhoto(true);
                }}
                className={cn(
                  "px-2.5 py-1 rounded-full transition-colors",
                  showResolvedPhoto ? "bg-emerald-500 text-white" : "text-white/80 hover:text-white"
                )}
              >
                Resolved ✓
              </button>
            </div>
          )}

          {/* Category overlay pill */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1.5">
            <span>{issue.category}</span>
            <span>•</span>
            <span>Ticket #{issue.id}</span>
          </div>
        </div>

        {/* Glassmorphic AI Insights Box */}
        <div className="rounded-2xl p-3 bg-gradient-to-r from-primary-50/70 via-indigo-50/50 to-teal-50/60 border border-primary-100/80 mb-4 shadow-sm">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <div className="flex items-center gap-1.5 font-bold text-primary-900">
              <Sparkles className="w-3.5 h-3.5 text-primary-600" />
                          <span>AI Triage: {issue.aiAnalysis?.detectedObject ?? "Unknown"}</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary-100 text-primary-800">
                          {issue.aiAnalysis?.confidence ? `${issue.aiAnalysis.confidence}% Conf.` : "N/A"}
            </span>
          </div>
          <p className="text-[11px] text-on-surface-variant line-clamp-1">
                        {issue.aiAnalysis?.summary ?? "No AI summary available."}
          </p>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-on-surface-variant font-semibold border-t border-primary-100/50 pt-1.5">
            <span>Routed to: <strong className="text-primary-800">{issue.assignedDepartment}</strong></span>
                        <span>SLA: ~{issue.aiAnalysis?.suggestedSlaHours ?? "N/A"}h</span>
          </div>
        </div>
      </div>

      {/* Card Footer: Upvote, Comments, Verification, Share */}
      <div className="flex items-center justify-between pt-3 border-t border-surface-container-high text-xs">
        <div className="flex items-center gap-2">
          {/* Upvote Button */}
          <button
            type="button"
            onClick={handleUpvote}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold transition-all select-none",
              issue.isUpvoted
                ? "bg-primary-600 text-white shadow-md shadow-primary-600/30 scale-105"
                : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            )}
          >
            <ThumbsUp className={cn("w-3.5 h-3.5", issue.isUpvoted ? "fill-white" : "")} />
            <span>{issue.upvotes}</span>
          </button>

          {/* Comments Link */}
          <Link
            href={`/issues/${issue.id}#comments`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-semibold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{issue.commentsCount}</span>
          </Link>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors relative"
            title="Copy share link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Deep Dive Action */}
        <Link
          href={`/issues/${issue.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors group/link"
        >
          <span>Track Live</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
