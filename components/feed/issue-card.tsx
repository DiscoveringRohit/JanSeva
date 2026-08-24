"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CivicIssue } from "@/lib/data/mock-data";
import { upvoteIssue, downvoteIssue } from "@/lib/api/issues";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  MapPin,
  Bot,
  Clock,
  MoreVertical,
  Trash2,
  ArrowRight,
  Check
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { useApp } from "@/lib/context/app-context";

interface IssueCardProps {
  issue: CivicIssue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const { deleteIssue, user } = useApp();
  const [copied, setCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const isOwner = user && (user.username === issue.reporter.username || user.name === issue.reporter.name || user.email === issue.reporter.name);

  const [localUpvotes, setLocalUpvotes] = useState(issue.upvotes);
  const [localIsUpvoted, setLocalIsUpvoted] = useState(issue.isUpvoted);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/issues/${issue.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const wasUpvoted = localIsUpvoted;
    setLocalIsUpvoted(!wasUpvoted);
    setLocalUpvotes(prev => wasUpvoted ? prev - 1 : prev + 1);

    if (wasUpvoted) {
      await downvoteIssue(issue.id);
    } else {
      await upvoteIssue(issue.id);
    }
  };

  // Helper for urgency badge styling
  const renderUrgencyBadge = (urgency: string) => {
    const u = urgency?.toUpperCase() || "HIGH";
    if (u === "CRITICAL") {
      return (
        <span className="border border-rose-500 text-rose-600 bg-rose-50/40 text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          CRITICAL
        </span>
      );
    }
    if (u === "HIGH") {
      return (
        <span className="border border-[#b58117] text-[#976807] bg-amber-50/40 text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          HIGH
        </span>
      );
    }
    if (u === "MODERATE") {
      return (
        <span className="border border-blue-400 text-blue-700 bg-blue-50/40 text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          MODERATE
        </span>
      );
    }
    return (
      <span className="border border-slate-300 text-slate-600 bg-slate-50/40 text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
        LOW
      </span>
    );
  };

  // Helper for status badge
  const renderStatusBadge = (status: string) => {
    return (
      <span className="border border-slate-300 text-slate-700 bg-white text-[11px] font-medium px-2.5 py-0.5 rounded-md inline-flex items-center gap-1 shadow-2xs">
        <Clock className="w-3 h-3 text-slate-500" />
        <span>{status || "Reported"}</span>
      </span>
    );
  };

  return (
    <article className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col justify-between">
      <div>
        
        {/* Top Header: Avatar + Handle + Timestamp + Location & Badges + 3-dots */}
        <div className="flex items-start justify-between gap-2 mb-3">
          
          {/* Author Info */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
              <img
                src={issue.reporter.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"}
                alt={issue.reporter.username || issue.reporter.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                  @{issue.reporter.username || issue.reporter.name}
                </span>
                {/* Green verified check badge */}
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">
                  ✓
                </span>
                <span className="text-xs text-slate-400 font-normal">
                  - {formatDate(issue.createdAt)}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-xs">{issue.location.address}</span>
              </div>
            </div>
          </div>

          {/* Right Section: 3 dots + Status & Urgency Badges */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            {/* 3-dots Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-1 overflow-hidden animate-fadeIn">
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this issue?")) {
                          deleteIssue(issue.id);
                        }
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                  <button
                    onClick={handleShare}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>
              )}
            </div>

            {/* Badges Row */}
            <div className="flex items-center gap-1.5">
              {renderStatusBadge(issue.status)}
              {renderUrgencyBadge(issue.urgency)}
            </div>
          </div>

        </div>

        {/* Title & Description */}
        <div className="mt-2 mb-3">
          <Link href={`/issues/${issue.id}`} className="block group-hover:text-emerald-800 transition-colors">
            <h3 className="font-headline font-bold text-lg sm:text-xl text-slate-900 leading-snug mb-1">
              {issue.title}
            </h3>
          </Link>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Image Showcase with Category/Ticket Overlay */}
        <div className="relative rounded-2xl overflow-hidden mb-3 aspect-[16/10] sm:h-64 w-full bg-slate-100 border border-slate-100">
          <img
            src={issue.images.reported || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80"}
            alt={issue.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
          />

          {/* Dark Overlay Pill (Category - Ticket #ID) */}
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-md bg-black/85 backdrop-blur-sm text-white text-xs font-bold shadow-md tracking-wide">
            {issue.category} - Ticket #{issue.id}
          </div>
        </div>

        {/* AI Triage Card (Blue/Teal Tinted Box) */}
        <div className="rounded-2xl p-3.5 sm:p-4 bg-[#f4f9f8] border border-[#d6ebe2] mb-3 space-y-2">
          
          {/* Top Row: AI Triage Label + Confidence */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-[#0f5b49]">
              <Bot className="w-4 h-4 text-[#0f5b49]" />
              <span>
                AI Triage: {issue.aiAnalysis?.detectedObject ? issue.aiAnalysis.detectedObject : "Pending Classification"}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200 text-slate-500 bg-white shadow-2xs">
              {issue.aiAnalysis?.confidence ? `${issue.aiAnalysis.confidence}%` : "N/A"}
            </span>
          </div>

          {/* Middle Row: AI Summary / Dispatch Status */}
          <p className="text-xs text-slate-600 leading-relaxed">
            {issue.aiAnalysis?.summary || "Pending review by dispatch."}
          </p>

          {/* Bottom Row: Routed To + SLA */}
          <div className="flex items-center justify-between text-xs text-slate-600 border-t border-[#e2efe9] pt-2 mt-1">
            <span>
              Routed to: <strong className="text-[#0f5b49] font-bold">{issue.assignedDepartment || "Municipal Dispatch"}</strong>
            </span>
            <span className="font-semibold text-slate-500">
              SLA: ~{issue.aiAnalysis?.suggestedSlaHours ? `${issue.aiAnalysis.suggestedSlaHours}h` : "24h"}
            </span>
          </div>

        </div>

      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
        
        {/* Left Actions: Upvote, Comment, Share */}
        <div className="flex items-center gap-4">
          
          {/* Upvote */}
          <button
            type="button"
            onClick={handleUpvote}
            className={cn(
              "flex items-center gap-1.5 font-bold text-slate-700 hover:text-emerald-800 transition-colors select-none",
              localIsUpvoted && "text-emerald-800"
            )}
          >
            <ThumbsUp className={cn("w-4 h-4", localIsUpvoted ? "fill-emerald-800 text-emerald-800" : "text-slate-600")} />
            <span>{localUpvotes}</span>
          </button>

          {/* Comments Link */}
          <Link
            href={`/issues/${issue.id}#comments`}
            className="flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-slate-600" />
            <span>{issue.commentsCount || 0}</span>
          </Link>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="text-slate-600 hover:text-slate-900 transition-colors"
            title="Share issue"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

        </div>

        {/* Right Action: Track Live -> */}
        <Link
          href={`/issues/${issue.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#0f5b49] hover:text-[#093d31] transition-colors group/link"
        >
          <span>Track Live</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
        </Link>

      </div>
    </article>
  );
}
