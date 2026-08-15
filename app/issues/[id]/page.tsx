"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { StatusBadge, UrgencyBadge } from "@/components/ui/status-badge";
import {
  ArrowLeft,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Wrench,
  ThumbsUp,
  Share2,
  Check,
  Send,
  Building,
  User,
  AlertTriangle,
  Flame
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { issues, toggleUpvote, voteVerification, user, addComment } = useApp();

  const issue = issues.find((i) => i.id === id) || issues[0];
  const [commentText, setCommentText] = useState("");
  const [copied, setCopied] = useState(false);
  const [activePhotoTab, setActivePhotoTab] = useState<"reported" | "resolved">("reported");

  // Sample discussion comments
  const [comments, setComments] = useState([
    {
      id: "c1",
      author: "Pooja Hegde",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      role: "Ward 42 Resident",
      text: "Thanks for reporting this! The smell was terrible yesterday evening. Glad to see the BWSSB team on site now.",
      timestamp: "2026-08-15T10:30:00Z",
      likes: 14,
    },
    {
      id: "c2",
      author: "Er. Ramesh Kulkarni",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
      role: "Senior Sanitary Inspector (Officer)",
      isOfficer: true,
      text: "Our suction tanker and desilting crew are currently cleaning the conduit blockage. Main pipeline will be sealed within the next 2 hours.",
      timestamp: "2026-08-15T11:20:00Z",
      likes: 38,
    },
  ]);

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      const newC = {
        id: `c-${Date.now()}`,
        author: user.name,
        avatar: user.avatar,
        role: user.role === "officer" ? "Senior Ward Officer" : "Ward 42 Citizen",
        isOfficer: user.role === "officer",
        text: commentText.trim(),
        timestamp: new Date().toISOString(),
        likes: 1,
      };
      setComments([...comments, newC]);
      addComment(issue.id, commentText.trim());
      setCommentText("");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const stages = ["Reported", "AI Verified", "Assigned", "In Progress", "Resolved"];
  const currentStageIndex = stages.indexOf(issue.status);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white border border-surface-dim hover:bg-surface-container text-xs font-bold text-on-surface transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white border border-surface-dim hover:bg-surface-container text-xs font-bold text-on-surface transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? "Link Copied!" : "Share Issue"}</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="rounded-3xl bg-white border border-surface-container-high p-6 sm:p-8 shadow-soft space-y-6">
        
        {/* Title, Badges, Category */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-bold text-primary-700 bg-primary-50 px-2.5 py-1 rounded-xl border border-primary-200">
              Ticket #{issue.id}
            </span>
            <StatusBadge status={issue.status} size="md" />
            <UrgencyBadge urgency={issue.urgency} />
            <span className="px-2.5 py-1 rounded-xl bg-surface-container-low text-on-surface-variant text-xs font-semibold">
              Category: {issue.category}
            </span>
          </div>

          <h1 className="font-headline font-black text-2xl sm:text-3xl text-on-surface leading-tight">
            {issue.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span className="font-semibold text-on-surface">{issue.location.address}</span>
            </div>
            <span>•</span>
            <div>Ward {issue.location.wardNumber} ({issue.location.ward})</div>
            <span>•</span>
            <div>Reported {formatDate(issue.createdAt)}</div>
          </div>
        </div>

        {/* 5-STAGE PROGRESSION STEPPER */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-surface-container-low via-indigo-50/30 to-emerald-50/30 border border-surface-dim space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-on-surface">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary-600" />
              <span>Live Progression & SLA SLA Tracker</span>
            </span>
            <span className="text-emerald-700 font-extrabold font-headline">
              Stage {currentStageIndex + 1} of 5 ({issue.status})
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-2">
            {stages.map((stageName, index) => {
              const isPast = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;

              return (
                <div key={stageName} className="space-y-1.5 text-center">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-500",
                      isPast
                        ? "bg-emerald-500"
                        : isCurrent
                        ? "bg-primary-600 animate-pulse"
                        : "bg-surface-dim"
                    )}
                  />
                  <p
                    className={cn(
                      "text-[10px] font-bold truncate",
                      isCurrent
                        ? "text-primary-700 font-extrabold"
                        : isPast
                        ? "text-emerald-800 font-semibold"
                        : "text-on-surface-variant/60"
                    )}
                  >
                    {stageName}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase font-bold text-on-surface-variant tracking-wider">
            Issue Overview
          </h3>
          <p className="text-sm sm:text-base text-on-surface leading-relaxed">
            {issue.description}
          </p>
        </div>

        {/* Media & Comparison Gallery */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase font-bold text-on-surface-variant tracking-wider">
              Visual Evidence & Repair Proof
            </h3>
            {issue.images.resolved && (
              <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActivePhotoTab("reported")}
                  className={cn(
                    "px-3 py-1 rounded-lg transition-colors",
                    activePhotoTab === "reported" ? "bg-white text-on-surface shadow-sm" : "text-on-surface-variant"
                  )}
                >
                  Before
                </button>
                <button
                  type="button"
                  onClick={() => setActivePhotoTab("resolved")}
                  className={cn(
                    "px-3 py-1 rounded-lg transition-colors",
                    activePhotoTab === "resolved" ? "bg-emerald-500 text-white shadow-sm" : "text-on-surface-variant"
                  )}
                >
                  After (Resolved) ✓
                </button>
              </div>
            )}
          </div>

          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-slate-900 border border-surface-dim shadow-inner">
            <img
              src={activePhotoTab === "resolved" && issue.images.resolved ? issue.images.resolved : issue.images.reported}
              alt={issue.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activePhotoTab === "resolved" ? "Post-Repair Inspection Photo" : "Citizen Evidence Photo"}</span>
            </div>
          </div>
        </div>

        {/* Upvote & Action Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-surface-dim">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => toggleUpvote(issue.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-sm",
                issue.isUpvoted
                  ? "bg-primary-600 text-white shadow-md shadow-primary-600/30 scale-105"
                  : "bg-surface-container-low text-on-surface hover:bg-surface-container"
              )}
            >
              <ThumbsUp className={cn("w-4 h-4", issue.isUpvoted ? "fill-white" : "")} />
              <span>{issue.upvotes} Community Upvotes</span>
            </button>

            <span className="text-xs text-on-surface-variant font-medium">
              Priority Ranking: #1 in Ward 42
            </span>
          </div>

          {/* Reporter Profile Snippet */}
          <div className="flex items-center gap-2.5 p-2 rounded-2xl bg-surface-container-low border border-surface-dim">
            <img
              src={issue.reporter.avatar}
              alt={issue.reporter.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="text-left">
              <p className="text-xs font-bold text-on-surface">{issue.reporter.name}</p>
              <p className="text-[10px] text-emerald-700 font-semibold">{issue.reporter.karma} Karma XP</p>
            </div>
          </div>
        </div>

      </div>

      {/* AI COMPUTER VISION DIAGNOSTIC REPORT */}
      <div className="rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-primary-950 text-white p-6 sm:p-8 shadow-2xl border border-indigo-700/50 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-headline font-extrabold text-base sm:text-lg">
                JanSeva Neural Vision Diagnostic
              </h3>
              <p className="text-xs text-white/70">
                Automated triage and dispatch log
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-bold">
            {issue.aiAnalysis.confidence}% Confidence
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 font-medium">Identified Hazard</p>
            <p className="font-bold text-white mt-1">{issue.aiAnalysis.detectedObject}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 font-medium">Assigned Department</p>
            <p className="font-bold text-emerald-300 mt-1">{issue.assignedDepartment}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 font-medium">Assigned Officer</p>
            <p className="font-bold text-cyan-300 mt-1">{issue.assignedOfficer?.name || "Ward Dispatch Squad"}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 font-medium">SLA Resolution Target</p>
            <p className="font-bold text-amber-300 mt-1">~{issue.aiAnalysis.suggestedSlaHours} Hours Max</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/90 leading-relaxed">
          <strong className="text-cyan-300">AI Summary: </strong>
          {issue.aiAnalysis.summary}
        </div>
      </div>

      {/* CITIZEN SATISFACTION & VERIFICATION AUDIT BOX */}
      <div className="rounded-3xl bg-white border border-surface-container-high p-6 sm:p-8 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">
                Citizen Resolution Audit & Verification
              </h3>
              <p className="text-xs text-on-surface-variant">
                Did the municipal squad fix this problem completely? Vote to certify.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            +15 Karma XP
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-dim space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-emerald-700">
              ✓ Yes, Problem Resolved ({issue.verificationVotes.yes} votes)
            </span>
            <span className="text-rose-700">
              ✕ No, Still Pending ({issue.verificationVotes.no} votes)
            </span>
          </div>

          {/* Progress split bar */}
          <div className="w-full h-3 rounded-full bg-surface-dim overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{
                width: `${
                  issue.verificationVotes.yes + issue.verificationVotes.no > 0
                    ? Math.round(
                        (issue.verificationVotes.yes /
                          (issue.verificationVotes.yes + issue.verificationVotes.no)) *
                          100
                      )
                    : 50
                }%`,
              }}
            />
            <div
              className="bg-rose-500 h-full transition-all duration-500"
              style={{
                width: `${
                  issue.verificationVotes.yes + issue.verificationVotes.no > 0
                    ? Math.round(
                        (issue.verificationVotes.no /
                          (issue.verificationVotes.yes + issue.verificationVotes.no)) *
                          100
                      )
                    : 50
                }%`,
              }}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => voteVerification(issue.id, "yes")}
              className={cn(
                "flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5",
                issue.verificationVotes.userVoted === "yes"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50"
              )}
            >
              <Check className="w-4 h-4" />
              <span>Verify Resolved</span>
            </button>

            <button
              type="button"
              onClick={() => voteVerification(issue.id, "no")}
              className={cn(
                "flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5",
                issue.verificationVotes.userVoted === "no"
                  ? "bg-rose-600 text-white shadow-md shadow-rose-600/30"
                  : "bg-white text-rose-700 border border-rose-300 hover:bg-rose-50"
              )}
            >
              <span>✕ Report Incomplete</span>
            </button>
          </div>
        </div>
      </div>

      {/* OFFICIAL TIMELINE & ACTION LOG */}
      <div className="rounded-3xl bg-white border border-surface-container-high p-6 sm:p-8 shadow-soft space-y-6">
        <h3 className="font-headline font-bold text-base text-on-surface">
          Official Action Timeline
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-dim">
          {issue.timeline.map((event, idx) => (
            <div key={idx} className="relative space-y-1">
              <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-primary-600 ring-4 ring-white" />
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-on-surface">{event.stage}</span>
                <span className="text-on-surface-variant font-medium">{formatDate(event.timestamp)}</span>
              </div>
              <p className="text-xs text-on-surface-variant">{event.note}</p>
              <p className="text-[10px] text-primary-700 font-bold">Action by: {event.actor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* DISCUSSION & COMMENTS FORUM */}
      <div id="comments" className="rounded-3xl bg-white border border-surface-container-high p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-base text-on-surface">
            Community & Officer Discussion ({comments.length})
          </h3>
          <span className="text-xs text-on-surface-variant">Ward 42 Public Channel</span>
        </div>

        {/* New Comment Input */}
        <form onSubmit={handlePostComment} className="flex gap-2.5">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-primary-100"
          />
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add your neighbor update or question..."
              className="flex-1 px-4 py-2.5 text-xs rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
              className="px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white font-bold text-xs shadow-md shadow-primary-600/30 transition-all flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post</span>
            </button>
          </div>
        </form>

        {/* Comments Stream */}
        <div className="space-y-4 pt-2 divide-y divide-surface-dim">
          {comments.map((c) => (
            <div key={c.id} className="pt-4 flex gap-3">
              <img
                src={c.avatar}
                alt={c.author}
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-on-surface">{c.author}</span>
                    {c.isOfficer && (
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200">
                        Official Officer
                      </span>
                    )}
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      • {formatDate(c.timestamp)}
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-on-surface leading-relaxed">
                  {c.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
