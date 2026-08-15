"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";
import { IssueCard } from "@/components/feed/issue-card";
import { WardStatsWidget } from "@/components/feed/ward-stats-widget";
import { LeaderboardWidget } from "@/components/feed/leaderboard-widget";
import { ActivePollWidget } from "@/components/feed/active-poll-widget";
import { CategoryPill } from "@/components/ui/category-pill";
import {
  Sparkles,
  Search,
  Filter,
  PlusCircle,
  TrendingUp,
  MapPin,
  Camera,
  Layers,
  ArrowUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FeedPage() {
  const { issues, user } = useApp();

  const [activeTab, setActiveTab] = useState<"all" | "ward" | "critical" | "resolved" | "in_progress">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"upvotes" | "recent" | "urgency">("upvotes");

  const categories = ["All", "Sanitation", "Roads", "Water", "Electricity", "Waste", "Traffic", "Parks"];

  const filteredIssues = issues
    .filter((issue) => {
      // Tab filter
      if (activeTab === "ward" && issue.location.wardNumber !== 42) return false;
      if (activeTab === "critical" && issue.urgency !== "Critical") return false;
      if (activeTab === "resolved" && issue.status !== "Resolved") return false;
      if (activeTab === "in_progress" && issue.status !== "In Progress") return false;

      // Category filter
      if (selectedCategory !== "All" && issue.category !== selectedCategory) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(q);
        const matchesDesc = issue.description.toLowerCase().includes(q);
        const matchesAddress = issue.location.address.toLowerCase().includes(q);
        const matchesId = issue.id.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAddress && !matchesId) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "upvotes") return b.upvotes - a.upvotes;
      if (sortBy === "recent") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "urgency") {
        const order = { Critical: 4, High: 3, Moderate: 2, Low: 1 };
        return order[b.urgency] - order[a.urgency];
      }
      return 0;
    });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header & Quick Report Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline font-black text-2xl sm:text-3xl text-on-surface">
              Ward 42 Community Feed
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Pulse
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Real-time public incident reports, verified municipal repairs, and neighbor upvotes.
          </p>
        </div>

        <Link
          href="/report"
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-700 hover:brightness-110 text-white font-headline font-bold text-xs shadow-lg shadow-primary-600/30 hover:scale-102 active:scale-98 transition-all shrink-0"
        >
          <Camera className="w-4 h-4" />
          <span>AI Quick Snap Report</span>
        </Link>
      </div>

      {/* Quick Report Bar for Citizens */}
      <div className="rounded-3xl bg-white border border-surface-container-high p-4 shadow-soft flex items-center gap-3">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-100 shrink-0"
        />
        <Link
          href="/report"
          className="flex-1 px-4 py-2.5 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-dim text-xs text-on-surface-variant font-medium transition-colors flex items-center justify-between"
        >
          <span>What civic problem did you spot in Ward 42 today?</span>
          <span className="text-primary-600 font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Auto-Detect</span>
          </span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        
        {/* Main Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "all", label: "All Reports" },
            { id: "ward", label: "My Ward (Ward 42)" },
            { id: "critical", label: "🔥 Critical Urgency" },
            { id: "in_progress", label: "⚡ In Progress" },
            { id: "resolved", label: "✓ Resolved & Verified" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 select-none",
                activeTab === tab.id
                  ? "bg-primary-600 text-white shadow-md shadow-primary-600/25"
                  : "bg-white text-on-surface-variant hover:bg-surface-container border border-surface-dim hover:text-on-surface"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Pills & Sorting Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-surface-container-high shadow-sm">
          
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <CategoryPill
                key={cat}
                category={cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              />
            ))}
          </div>

          {/* Search & Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by keyword / ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-1 focus:ring-primary-500 text-on-surface"
              />
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-on-surface-variant shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-primary-600" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-surface-container-low text-on-surface text-xs font-semibold rounded-xl px-2 py-1.5 border border-surface-dim focus:outline-none"
              >
                <option value="upvotes">Most Upvoted</option>
                <option value="recent">Newest First</option>
                <option value="urgency">Urgency First</option>
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Main Grid: Feed Stream (Left 2 cols) + Widgets (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Feed Stream */}
        <div className="lg:col-span-2 space-y-6">
          {filteredIssues.length === 0 ? (
            <div className="rounded-3xl bg-white border border-surface-container-high p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center mx-auto font-bold">
                🔍
              </div>
              <h3 className="font-headline font-bold text-base text-on-surface">No Issues Match Your Filters</h3>
              <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                Try resetting your search query or selecting a different category tab.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("all");
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-primary-50 text-primary-700 font-bold text-xs hover:bg-primary-100"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))
          )}
        </div>

        {/* Right 1 Column: Sticky Civic Intelligence Widgets */}
        <div className="space-y-6">
          <WardStatsWidget />
          <ActivePollWidget />
          <LeaderboardWidget />
        </div>

      </div>

    </div>
  );
}
