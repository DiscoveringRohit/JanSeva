"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { IssueCard } from "@/components/feed/issue-card";
import { CategoryPill } from "@/components/ui/category-pill";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  MapPin,
  Sparkles,
  ArrowUpDown,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

function ExploreContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const { issues } = useApp();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedUrgency, setSelectedUrgency] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"upvotes" | "recent" | "urgency">("upvotes");

  const categories = ["All", "Sanitation", "Roads", "Water", "Electricity", "Waste", "Traffic", "Parks"];

  const filteredIssues = issues
    .filter((issue) => {
      if (selectedCategory !== "All" && issue.category !== selectedCategory) return false;
      if (selectedUrgency !== "All" && issue.urgency !== selectedUrgency) return false;
      if (selectedStatus !== "All" && issue.status !== selectedStatus) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(q);
        const matchesDesc = issue.description.toLowerCase().includes(q);
        const matchesAddress = issue.location.address.toLowerCase().includes(q);
        const matchesId = issue.id.toLowerCase().includes(q);
        const matchesDept = issue.assignedDepartment.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAddress && !matchesId && !matchesDept) return false;
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
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Explore Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-black text-2xl sm:text-3xl text-on-surface">
            Explore Civic Grievances & Infrastructure
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Filter across all municipal departments, urgency levels, and neighborhoods.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white border border-surface-container-high shadow-sm">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "p-2 rounded-xl text-xs font-bold transition-all",
              viewMode === "grid" ? "bg-primary-600 text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"
            )}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={cn(
              "p-2 rounded-xl text-xs font-bold transition-all",
              viewMode === "list" ? "bg-primary-600 text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"
            )}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="rounded-3xl bg-white border border-surface-container-high p-5 shadow-soft space-y-4">
        
        {/* Search Input with quick clear */}
        <div className="relative">
          <Search className="w-4 h-4 text-primary-600 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by keyword, street name, pothole, Water, Electricity, ticket #..."
            className="w-full pl-11 pr-10 py-3 text-xs sm:text-sm rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <CategoryPill
              key={cat}
              category={cat}
              active={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            />
          ))}
        </div>

        {/* Multi-Select Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-surface-dim text-xs">
          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">
              Urgency Priority
            </label>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-dim font-medium text-on-surface focus:outline-none"
            >
              <option value="All">All Urgencies</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High</option>
              <option value="Moderate">Moderate</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">
              Resolution Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-dim font-medium text-on-surface focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="AI Verified">AI Verified</option>
              <option value="Assigned">Dispatched</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">
              Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-surface-dim font-medium text-on-surface focus:outline-none"
            >
              <option value="upvotes">Most Upvoted</option>
              <option value="recent">Recently Added</option>
              <option value="urgency">Highest Urgency</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedUrgency("All");
                setSelectedStatus("All");
                setSortBy("upvotes");
              }}
              className="w-full py-2 rounded-xl bg-surface-dim hover:bg-surface-container text-on-surface font-bold text-xs transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant px-1">
        <span>Showing {filteredIssues.length} matching civic reports</span>
        <span>Sorted by {sortBy === "upvotes" ? "Most Upvoted" : sortBy === "recent" ? "Newest" : "Urgency"}</span>
      </div>

      {/* Issues Grid / List */}
      {filteredIssues.length === 0 ? (
        <div className="rounded-3xl bg-white border border-surface-container-high p-12 text-center space-y-3">
          <p className="font-headline font-bold text-base text-on-surface">No issues match your criteria</p>
          <p className="text-xs text-on-surface-variant">Try modifying your keyword search or filter options.</p>
        </div>
      ) : (
        <div
          className={cn(
            "grid gap-6",
            viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          )}
        >
          {filteredIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      )}

    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-on-surface-variant">Loading Explore radar...</div>}>
      <ExploreContent />
    </Suspense>
  );
}
