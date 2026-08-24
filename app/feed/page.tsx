"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";
import { getFeed } from "@/lib/api/issues";
import { CivicIssue } from "@/lib/data/mock-data";
import { IssueCard } from "@/components/feed/issue-card";
import { WeatherWidget } from "@/components/feed/weather-widget";
import { LeaderboardWidget } from "@/components/feed/leaderboard-widget";
import { CategoryPill } from "@/components/ui/category-pill";
import { Award, Camera, MapPin, Search, Filter, TrendingUp, AlertCircle, CheckCircle2, ChevronRight, X, Clock, Settings, LogOut, Sparkles, Layers, ArrowUpDown } from "lucide-react";
import { GUEST_USER } from "@/lib/data/default-location";
import { cn } from "@/lib/utils";

export default function FeedPage() {
  const { user } = useApp();

  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    getFeed().then((data) => {
      setIssues(data);
      setIsLoading(false);
    });
  }, []);

  const [activeTab, setActiveTab] = useState<"all" | "ward" | "critical" | "resolved" | "in_progress">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"upvotes" | "recent" | "urgency">("recent");

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
          <div className="flex items-center gap-2.5">
            <h1 className="font-headline font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              {user?.pincode === "751030" ? "Khandagiri Area Feed" : (user?.pincode ? `Area ${user.pincode} Feed` : "Community Feed")}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#edf7f1] text-[#134431] border border-[#cbe7d7] flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live Pulse
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time public incident reports, verified municipal repairs, and neighbor upvotes.
          </p>
        </div>

        <Link
          href={user ? "/report" : "/login"}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#134431] hover:bg-[#0c2e21] text-white font-headline font-bold text-xs shadow-md shadow-emerald-950/20 hover:scale-102 active:scale-98 transition-all shrink-0"
        >
          <Camera className="w-4 h-4 text-emerald-300" />
          <span>AI Quick Snap Report</span>
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3">
        
        {/* Main Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "all", label: "All Reports" },
            { id: "ward", label: `📍 My Area (${user?.pincode ? user.pincode : "Local"})` },
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
                  ? "bg-[#134431] text-white shadow-md shadow-emerald-950/15"
                  : "bg-white text-slate-700 hover:bg-[#edf7f1] hover:text-[#134431] border border-slate-200/80 shadow-2xs"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Category Pills & Sorting Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-3xl border border-slate-200/80 shadow-sm">
          
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
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by keyword / ID..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[#f8faf9] border border-slate-200/80 focus:outline-none focus:ring-1 focus:ring-[#134431] text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 shrink-0 bg-[#f8faf9] px-2.5 py-1 rounded-xl border border-slate-200/80">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#134431]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none cursor-pointer"
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
          {isLoading ? (
            <div className="rounded-3xl bg-white border border-surface-container-high p-12 text-center">
              <div className="w-8 h-8 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-semibold text-on-surface-variant">Loading community feed...</p>
            </div>
          ) : filteredIssues.length === 0 ? (
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
          <WeatherWidget />
          <LeaderboardWidget />
        </div>

      </div>

    </div>
  );
}
