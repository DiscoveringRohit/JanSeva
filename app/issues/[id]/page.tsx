"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { getIssueById, upvoteIssue, addComment as addCommentApi, getComments, deleteComment as deleteCommentApi } from "@/lib/api/issues";
import { CivicIssue } from "@/lib/data/mock-data";
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
  Flame,
  MoreVertical,
  Edit,
  Trash2,
  Layers,
  Plus,
  Camera,
  X,
  UserCheck,
  ShieldAlert,
  Construction
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { useAutoTranslate } from "@/lib/services/translation-service";

export default function IssueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { voteVerification, user, setUser, deleteIssue, issues, mergeIssues, language, updateIssueStatus } = useApp();

  const [issue, setIssue] = useState<CivicIssue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);

  const { translated: translatedTitle } = useAutoTranslate(issue?.title || "", language);
  const { translated: translatedDesc } = useAutoTranslate(issue?.description || "", language);
  const [candidateDuplicateId, setCandidateDuplicateId] = useState("");
  const [mergeReason, setMergeReason] = useState("");
  const [mergeLoading, setMergeLoading] = useState(false);
  const [mergeToast, setMergeToast] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [isPostingComment, setIsPostingComment] = useState(false);

  const fetchComments = React.useCallback(async () => {
    if (!id) return;
    const res = await getComments(id);
    setComments(res || []);
  }, [id]);

  React.useEffect(() => {
    // 1. Check live issues stream from AppContext first
    if (issues && issues.length > 0) {
      const found = issues.find((i) => i.id === id);
      if (found) {
        setIssue(found);
        setIsLoading(false);
      }
    }

    // 2. Fetch from backend/API as well
    const fetchIssue = () => {
      getIssueById(id).then((data) => {
        if (data) {
          setIssue(data);
          setIsLoading(false);
        }
      });
    };

    fetchIssue();
    fetchComments();

    // Poll for real-time cross-tab sync when tab is active
    const pollInterval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchIssue();
        fetchComments();
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [id, issues, fetchComments]);

  const [commentText, setCommentText] = useState("");
  const [copied, setCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activePhotoTab, setActivePhotoTab] = useState<"reported" | "resolved">("reported");

  const isOwner = user && (user.username === issue?.reporter.username || user.name === issue?.reporter.name);

  // Local optimistic state for upvoting
  const [localUpvotes, setLocalUpvotes] = useState(0);
  const [localIsUpvoted, setLocalIsUpvoted] = useState(false);

  React.useEffect(() => {
    if (issue) {
      setLocalUpvotes(issue.upvotes);
      setLocalIsUpvoted(issue.isUpvoted || false);
    }
  }, [issue]);

  const handleToggleUpvote = async () => {
    if (!issue) return;
    const wasUpvoted = localIsUpvoted;
    setLocalIsUpvoted(!wasUpvoted);
    setLocalUpvotes(prev => wasUpvoted ? Math.max(0, prev - 1) : prev + 1);

    await upvoteIssue(issue.id);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !issue) return;

    const textToPost = commentText.trim();
    setCommentText("");
    setIsPostingComment(true);

    const res = await addCommentApi(issue.id, textToPost);
    if (res.success) {
      await fetchComments();
      setIssue(prev => prev ? { ...prev, commentsCount: (prev.commentsCount || 0) + 1 } : prev);
      if (setUser) {
        setUser((prev: any) => prev ? ({
          ...prev,
          civicCitizenXP: (prev.civicCitizenXP || 0) + 10,
        }) : prev);
      }
    }
    setIsPostingComment(false);
  };

  const handleDeleteComment = async (commentId: number | string) => {
    if (typeof window !== "undefined" && !window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }
    const success = await deleteCommentApi(commentId);
    if (success) {
      setComments(prev => prev.filter(c => c.id !== commentId));
      setIssue(prev => prev ? { ...prev, commentsCount: Math.max(0, (prev.commentsCount || 1) - 1) } : prev);
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    const shareData = {
      title: issue?.title || "JanSeva Civic Report",
      text: `Civic issue reported: ${issue?.title} at ${issue?.location?.address || "Ward 42"}. Check status on JanSeva.`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if ((err as any)?.name !== "AbortError") {
          console.warn("Native share fallback to clipboard:", err);
        } else {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (clipErr) {
      console.error("Clipboard copy error:", clipErr);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">Issue not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-primary-600 underline">Go Back</button>
      </div>
    );
  }

  const stages = ["Reported", "AI Verified", "Assigned", "In Progress", "Resolved"];
  let currentStageIndex = stages.indexOf(issue.status);
  if (issue.status === "Pending Citizen Verification" || issue.status === "Verified Resolved") {
    currentStageIndex = 4; // Resolved stage
  }

  const handleExecuteMerge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateDuplicateId || !issue) return;
    if (candidateDuplicateId === issue.id) {
      alert("Cannot merge an issue with itself.");
      return;
    }

    setMergeLoading(true);
    try {
      const res = await mergeIssues(
        issue.id,
        candidateDuplicateId,
        mergeReason.trim() || `Merged by Officer ${user?.name || "Official"} on issue detail inspector.`
      );

      setMergeModalOpen(false);
      setCandidateDuplicateId("");
      setMergeReason("");
      setMergeToast(res.message || `Successfully merged duplicate report into Ticket #${issue.id}!`);
      setTimeout(() => setMergeToast(null), 6000);
    } catch (err) {
      console.error("Failed to merge duplicate:", err);
    } finally {
      setMergeLoading(false);
    }
  };

  const isOfficerOrStaff = Boolean(user && (user.role === "officer" || user.role === "corporator"));
  const mergedDuplicateEvents = (issue?.timeline || []).filter(t => t.stage === "Duplicate Merged");

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">

      {/* Merge Success Toast */}
      {mergeToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between shadow-soft animate-slideDown">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-headline font-bold text-xs sm:text-sm">{mergeToast}</p>
              <p className="text-[11px] text-emerald-700">All community upvotes, comments, and audit timeline logs consolidated.</p>
            </div>
          </div>
          <button
            onClick={() => setMergeToast(null)}
            className="p-1.5 rounded-lg hover:bg-emerald-100 text-emerald-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
          {isOfficerOrStaff && (
            <button
              type="button"
              onClick={() => setMergeModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#134431] hover:bg-[#0c2e21] text-white text-xs font-bold transition-all shadow-sm"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Merge Duplicate</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white border border-surface-dim hover:bg-surface-container text-xs font-bold text-on-surface transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? "Link Copied!" : "Share Issue"}</span>
          </button>

          {isOwner && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="flex items-center p-1.5 rounded-2xl bg-white border border-surface-dim hover:bg-surface-container text-on-surface-variant transition-all shadow-sm"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-surface-container z-10 py-1 overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-on-surface hover:bg-surface-container flex items-center gap-2"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (confirm("Are you sure you want to delete this issue?")) {
                        deleteIssue(issue.id);
                        router.push("/feed");
                      }
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-error hover:bg-error/10 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
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
            {((issue.timesReported && issue.timesReported > 1) || ((issue as any).times_reported && (issue as any).times_reported > 1) || mergedDuplicateEvents.length > 0) && (
              <span className="px-2.5 py-1 rounded-xl bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-purple-700" />
                <span>⚡ Reported {issue.timesReported || (issue as any).times_reported || (mergedDuplicateEvents.length + 1)} Times by Community</span>
              </span>
            )}
            {mergedDuplicateEvents.length > 0 && !issue.timesReported && (
              <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1">
                <Layers className="w-3 h-3 text-amber-700" />
                <span>Consolidated ({mergedDuplicateEvents.length} Merged)</span>
              </span>
            )}
          </div>

          <h1 className="font-headline font-black text-2xl sm:text-3xl text-on-surface leading-tight flex items-center justify-between gap-3">
            <span>{translatedTitle || issue.title}</span>
            {language !== "en" && translatedTitle !== issue.title && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
                🌐 Translated
              </span>
            )}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary-600" />
              <span className="font-semibold text-on-surface">{issue.location.address}</span>
            </div>
            <span>•</span>
            <div className="font-bold px-2.5 py-0.5 rounded-lg bg-[#edf7f1] text-[#134431] border border-[#cbe7d7] text-xs">
              PIN {(issue as any).pin_code || (issue as any).pincode || issue.location?.pincode || (issue.location?.address?.match(/\b\d{6}\b/) ? issue.location.address.match(/\b\d{6}\b/)![0] : "")}
            </div>
            <span>•</span>
            <div>Reported {formatDate(issue.createdAt)}</div>
          </div>
        </div>

        {/* Highlight Banner if Duplicate Reports Were Merged into this ticket */}
        {mergedDuplicateEvents.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-headline font-bold text-xs">
              <Layers className="w-4 h-4 text-amber-700" />
              <span>Multi-Citizen Consolidation Audit Log</span>
            </div>
            <div className="space-y-1.5">
              {mergedDuplicateEvents.map((evt, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white/90 border border-amber-200/70 text-xs text-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span>{evt.note}</span>
                  <span className="text-[10px] text-amber-800 font-bold whitespace-nowrap">{formatDate(evt.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
                      "text-[9px] sm:text-[10px] font-bold truncate",
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
            {translatedDesc || issue.description}
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
              onClick={handleToggleUpvote}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-sm",
                localIsUpvoted
                  ? "bg-primary-600 text-white shadow-md shadow-primary-600/30 scale-105"
                  : "bg-surface-container-low text-on-surface hover:bg-surface-container"
              )}
            >
              <ThumbsUp className={cn("w-4 h-4", localIsUpvoted ? "fill-white" : "")} />
              <span>{localUpvotes} Community Upvotes</span>
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
              <p className="text-xs font-bold text-on-surface">@{issue.reporter.username || issue.reporter.name}</p>
              <p className="text-[10px] text-emerald-700 font-semibold">
                {(user && (issue.reporter.username === user.username || issue.reporter.name === user.name)) ? user.civicCitizenXP : issue.reporter.karma} Civic Citizen XP
              </p>
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
            {issue.aiAnalysis?.confidence || 0}% Confidence
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 font-medium">Identified Hazard</p>
            <p className="font-bold text-white mt-1">{issue.aiAnalysis?.detectedObject || "Unknown"}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 font-medium">Assigned Department</p>
            <p className="font-bold text-emerald-300 mt-1">{issue.assignedDepartment || "Unassigned"}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 font-medium">Priority Level</p>
            <p className="font-bold text-rose-400 mt-1">{issue.aiAnalysis?.estimatedSeverity || issue.urgency}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-white/60 font-medium">SLA Resolution Goal</p>
            <p className="font-bold text-amber-300 mt-1">
              Under {issue.aiAnalysis?.suggestedSlaHours || 48} Hours
            </p>
          </div>
        </div>

        <div className="mt-4 p-3.5 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-white/80 leading-relaxed text-sm">
            {issue.aiAnalysis?.summary || "No AI summary available."}
          </p>
        </div>
      </div>

      {/* MUNICIPAL OFFICER DIRECT CONTROL PANEL */}
      {isOfficerOrStaff && (
        <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-7 shadow-soft space-y-4 border border-slate-800 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-sm text-white">Officer Tactical Command</h3>
                <p className="text-[11px] text-slate-400">Directly transition ticket lifecycle and trigger citizen verification queues.</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 self-start sm:self-auto">
              Current Stage: {issue.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <button
              type="button"
              onClick={async () => {
                await updateIssueStatus(issue.id, "In Progress", `[Officer Action by ${user?.name || "Official"}]: Field squad mobilized on site. Heavy repair work active.`);
                setMergeToast("⚡ Status updated to 'In Progress'. Field squad active.");
                setTimeout(() => setMergeToast(null), 4000);
              }}
              className={cn(
                "p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer",
                issue.status === "In Progress"
                  ? "bg-blue-600/30 text-blue-200 border-blue-500"
                  : "bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700 hover:border-slate-600"
              )}
            >
              <Construction className="w-4 h-4 text-blue-400" />
              <span>1. Set In Progress</span>
            </button>

            <button
              type="button"
              onClick={async () => {
                await updateIssueStatus(issue.id, "Pending Citizen Verification", `[Closed-Loop Protocol]: Municipal crew completed repairs. Queued for citizen live camera audit.`);
                setMergeToast("🔒 Work marked complete! Queued for Citizen Verification.");
                setTimeout(() => setMergeToast(null), 4000);
              }}
              className={cn(
                "p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer sm:col-span-2",
                issue.status === "Pending Citizen Verification"
                  ? "bg-purple-600/30 text-purple-200 border-purple-500"
                  : "bg-[#134431] hover:bg-[#0c2e21] text-emerald-100 border-emerald-600 shadow-md shadow-emerald-950/40"
              )}
            >
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>2. Mark Work Done (Queue Citizen Audit)</span>
            </button>
          </div>
        </div>
      )}

      {/* CITIZEN SATISFACTION & CLOSED-LOOP VERIFICATION AUDIT BOX */}
      {(issue.status === "Pending Citizen Verification" || issue.status === "In Progress" || issue.status === "Resolved" || issue.status === "Verified Resolved") && (
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0",
                issue.status === "Verified Resolved"
                  ? "bg-emerald-100 text-emerald-700"
                  : issue.status === "Pending Citizen Verification"
                  ? "bg-purple-100 text-purple-700 animate-pulse"
                  : "bg-blue-100 text-blue-700"
              )}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-headline font-bold text-base text-slate-900">
                    {issue.status === "Verified Resolved"
                      ? "✓ Closed-Loop Resolution Certified"
                      : issue.status === "Pending Citizen Verification"
                      ? "🔒 Closed-Loop Citizen Audit Required"
                      : "⚡ Field Squad Active — Citizen Audit Open"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#edf7f1] text-[#134431] border border-[#cbe7d7]">
                    100% Transparent
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {issue.status === "Verified Resolved"
                    ? "Citizen on-ground live camera inspection verified this repair. Ticket permanently closed in municipal ledger."
                    : issue.status === "Pending Citizen Verification"
                    ? "Municipal squad reported field work complete. Ticket remains OPEN until a resident conducts a live camera on-ground geo-audit."
                    : "Repairs actively underway by municipal authorities. Any local citizen can inspect the site on-ground with live camera."}
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-emerald-800 bg-[#edf7f1] px-3.5 py-1.5 rounded-xl border border-[#cbe7d7] shrink-0 self-start sm:self-auto">
              +25 Civic Citizen XP
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-700 flex items-center gap-1">
                <span>✓ On-Ground Approvals: {issue.verificationVotes?.yes || 0}</span>
              </span>
              <span className="text-rose-700">
                ✕ Flagged Incomplete: {issue.verificationVotes?.no || 0}
              </span>
            </div>

            {/* Progress split bar */}
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all duration-500"
                style={{
                  width: `${((issue.verificationVotes?.yes || 0) + (issue.verificationVotes?.no || 0)) > 0
                      ? Math.round(
                        ((issue.verificationVotes?.yes || 0) /
                          ((issue.verificationVotes?.yes || 0) + (issue.verificationVotes?.no || 0))) *
                        100
                      )
                      : issue.status === "Verified Resolved" ? 100 : 50
                    }%`,
                }}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-500"
                style={{
                  width: `${((issue.verificationVotes?.yes || 0) + (issue.verificationVotes?.no || 0)) > 0
                      ? Math.round(
                        ((issue.verificationVotes?.no || 0) /
                          ((issue.verificationVotes?.yes || 0) + (issue.verificationVotes?.no || 0))) *
                        100
                      )
                      : 0
                    }%`,
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push(`/verify/${issue.id}`)}
                className="flex-1 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 bg-[#134431] hover:bg-[#0c2e21] text-white shadow-md shadow-emerald-950/20 cursor-pointer"
              >
                <Camera className="w-4 h-4 text-emerald-300" />
                <span>📸 Open Live Camera to Audit &amp; Verify (+25 XP)</span>
              </button>

              <button
                type="button"
                onClick={() => voteVerification(issue.id, "no")}
                className="py-3 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 bg-white text-rose-700 border border-rose-300 hover:bg-rose-50 cursor-pointer"
              >
                <span>✕ Report Incomplete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 100% PUBLIC TRANSPARENT STATUS TIMELINE & ACTION AUDIT LOG */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-headline font-bold text-base text-slate-900">
              100% Public Action Timeline
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Immutable end-to-end municipal ledger from report to citizen closure.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#edf7f1] text-[#134431] border border-[#cbe7d7]">
            Public Ledger ✓
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {issue.timeline.map((event, idx) => {
            const isVerifiedResolved = event.stage === "Verified Resolved" || event.stage.toLowerCase().includes("verified");
            const isPendingVerification = event.stage === "Pending Citizen Verification" || event.stage.toLowerCase().includes("pending");

            return (
              <div key={idx} className="relative space-y-1.5 bg-[#f8faf9] p-3.5 rounded-2xl border border-slate-200/80">
                <div className={cn(
                  "absolute -left-7.5 top-3 w-4 h-4 rounded-full ring-4 ring-white",
                  isVerifiedResolved ? "bg-emerald-600" : isPendingVerification ? "bg-purple-600" : "bg-[#134431]"
                )} />
                
                <div className="flex items-center justify-between text-xs flex-wrap gap-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "font-bold px-2 py-0.5 rounded-md text-[11px]",
                      isVerifiedResolved ? "bg-emerald-100 text-emerald-900 border border-emerald-300 font-black" : isPendingVerification ? "bg-purple-100 text-purple-900 border border-purple-300" : "bg-slate-200 text-slate-800"
                    )}>
                      {event.stage}
                    </span>
                    <span className="font-semibold text-slate-700 text-xs">{event.actor}</span>
                  </div>
                  <span className="text-slate-400 font-medium text-[11px]">{formatDate(event.timestamp)}</span>
                </div>
                
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{event.note}</p>
              </div>
            );
          })}
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
            src={user?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100"}
            alt={user?.name || "Guest"}
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
          {comments.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No community comments yet. Be the first neighbor to post an update!
            </div>
          ) : (
            comments.map((c) => {
              const authorName = c.author_name || c.author || "Citizen";
              const authorUsername = c.author_username || "";
              const authorAvatar = c.author_avatar || c.avatar || "";
              const isOfficer = Boolean(c.is_officer || c.isOfficer || c.author_role === "officer");
              const isCommentOwner = Boolean(
                user &&
                (user.username === authorUsername ||
                  user.name === authorName ||
                  user.role === "officer" ||
                  user.id === c.author)
              );

              return (
                <div key={c.id} className="pt-4 flex gap-3 group">
                  {authorAvatar ? (
                    <img
                      src={authorAvatar}
                      alt={authorName}
                      className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center shrink-0 ring-1 ring-slate-200">
                      {authorName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-on-surface">{authorName}</span>
                        {authorUsername && (
                          <span className="font-mono text-[10px] text-slate-500 font-medium">
                            @{authorUsername}
                          </span>
                        )}
                        {isOfficer && (
                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px] border border-indigo-200">
                            Official Officer
                          </span>
                        )}
                        <span className="text-[10px] text-on-surface-variant font-medium">
                          • {formatDate(c.timestamp || c.created_at)}
                        </span>
                      </div>

                      {isCommentOwner && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(c.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-80 group-hover:opacity-100"
                          title="Delete your comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
                      {c.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MERGE DUPLICATE MODAL FOR OFFICERS */}
      {mergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-headline font-black text-lg text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#134431]" />
                  <span>Merge Duplicate into Ticket #{issue.id}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a candidate duplicate ticket submitted by another citizen to consolidate under this primary report.
                </p>
              </div>
              <button
                onClick={() => setMergeModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteMerge} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Candidate Duplicate Ticket
                </label>
                <select
                  value={candidateDuplicateId}
                  onChange={(e) => setCandidateDuplicateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#134431]/20 focus:border-[#134431]"
                  required
                >
                  <option value="">-- Choose Candidate Duplicate --</option>
                  {issues
                    .filter((i) => i.id !== issue.id && i.status !== "Resolved" && i.status !== "Verified Resolved")
                    .map((i) => (
                      <option key={`dup-cand-${i.id}`} value={i.id}>
                        #{i.id} - {i.title.slice(0, 40)}... (Reported by: {i.reporter?.name || "Citizen"}, {i.upvotes} Upvotes)
                      </option>
                    ))}
                </select>
              </div>

              {candidateDuplicateId && (
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                  {(() => {
                    const cand = issues.find((i) => i.id === candidateDuplicateId);
                    if (!cand) return null;
                    return (
                      <div className="space-y-1 text-xs">
                        <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Candidate Summary</span>
                        <p className="font-headline font-bold text-slate-900">{cand.title}</p>
                        <p className="text-slate-600">Location: {cand.location.address}</p>
                        <p className="text-slate-600">Citizen: <strong>{cand.reporter.name}</strong> • {cand.upvotes} Upvotes</p>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Consolidation Remark / Reason
                </label>
                <input
                  type="text"
                  value={mergeReason}
                  onChange={(e) => setMergeReason(e.target.value)}
                  placeholder="e.g. Duplicate report for identical hazard at same coordinate."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#134431]/20 focus:border-[#134431]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMergeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mergeLoading || !candidateDuplicateId}
                  className="px-5 py-2.5 rounded-xl bg-[#134431] hover:bg-[#0c2e21] text-white font-headline font-bold text-xs shadow-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{mergeLoading ? "Merging..." : "Confirm & Merge"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
