"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";
import { IssueCard } from "@/components/feed/issue-card";
import {
  ShieldCheck,
  Award,
  Flame,
  CheckCircle2,
  ThumbsUp,
  MapPin,
  Calendar,
  Settings,
  Sparkles,
  ExternalLink,
  Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user, issues } = useApp();
  const [activeTab, setActiveTab] = useState<"reports" | "upvotes" | "badges">("reports");

  const myReports = issues.filter((i) => i.reporter.name === user.name);
  const upvotedIssues = issues.filter((i) => i.isUpvoted);

  const nextLevelXP = (user.level + 1) * 500;
  const currentLevelBase = user.level * 500;
  const progressPercent = Math.min(
    100,
    Math.round(((user.karmaXP - 1000) / 500) * 100)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn pb-12">
      
      {/* Profile Banner & Info */}
      <div className="rounded-3xl bg-white border border-surface-container-high p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-primary-100 shadow-md"
              />
              <span className="absolute bottom-0 right-0 p-1 bg-primary-600 text-white rounded-full ring-2 ring-white">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline font-black text-2xl text-on-surface">
                  {user.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-800 border border-primary-200">
                  Level {user.level} {user.levelTitle}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-primary-600" />
                <span>Ward {user.wardNumber} ({user.ward}), Bengaluru</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">Verified Citizen ID #{user.id}</span>
              </p>
            </div>
          </div>

          <Link
            href="/profile/edit"
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-dim text-xs font-bold text-on-surface transition-all"
          >
            <Edit3 className="w-3.5 h-3.5 text-primary-600" />
            <span>Edit Profile & Preferences</span>
          </Link>
        </div>

        {/* Civic Karma XP Progression Bar */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 via-primary-900 to-slate-900 text-white space-y-2.5 shadow-lg border border-indigo-700/40">
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-emerald-400 fill-emerald-400" />
              <span className="font-headline">Civic Karma Progress</span>
            </div>
            <span className="text-emerald-300 font-mono text-sm">
              {user.karmaXP} / 2,000 XP
            </span>
          </div>

          <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_10px_#34d399]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[10px] text-white/70">
            <span>Level 4: Civic Champion</span>
            <span>Next: Level 5 Civic Legend (+550 XP to unlock)</span>
          </div>
        </div>

        {/* Impact Statistics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-dim">
            <p className="text-2xl font-black text-primary-700 font-headline">{user.stats.issuesReported}</p>
            <p className="text-[11px] text-on-surface-variant font-medium">Reports Logged</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-dim">
            <p className="text-2xl font-black text-emerald-700 font-headline">{user.stats.issuesResolved}</p>
            <p className="text-[11px] text-on-surface-variant font-medium">Repairs Verified</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-dim">
            <p className="text-2xl font-black text-indigo-700 font-headline">{user.stats.upvotesGiven}</p>
            <p className="text-[11px] text-on-surface-variant font-medium">Community Upvotes</p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-dim">
            <p className="text-2xl font-black text-purple-700 font-headline">{user.stats.civicImpactScore}%</p>
            <p className="text-[11px] text-on-surface-variant font-medium">Impact Rating</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-surface-dim pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: "reports", label: `My Reports (${myReports.length})` },
            { id: "upvotes", label: `Upvoted Issues (${upvotedIssues.length})` },
            { id: "badges", label: `Badges & Honors (${user.badges.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0",
                activeTab === tab.id
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* My Reports */}
        {activeTab === "reports" && (
          <div className="space-y-6 animate-fadeIn">
            {myReports.length === 0 ? (
              <div className="p-12 text-center text-xs text-on-surface-variant rounded-3xl bg-white border border-surface-container-high">
                No reports submitted yet. Snap a photo in Ward 42 to get started!
              </div>
            ) : (
              myReports.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))
            )}
          </div>
        )}

        {/* Upvoted Issues */}
        {activeTab === "upvotes" && (
          <div className="space-y-6 animate-fadeIn">
            {upvotedIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}

        {/* Badges Showcase */}
        {activeTab === "badges" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
            {user.badges.map((badge) => (
              <div
                key={badge.id}
                className="p-5 rounded-3xl bg-white border border-surface-container-high shadow-soft flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold shrink-0">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-headline font-bold text-sm text-on-surface">{badge.name}</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">{badge.description}</p>
                  <span className="text-[10px] font-semibold text-emerald-700 mt-1 block">
                    Unlocked on {badge.unlockedAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
