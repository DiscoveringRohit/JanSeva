"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";
import { CivicIssue } from "@/lib/data/mock-data";
import { StatusBadge, UrgencyBadge } from "@/components/ui/status-badge";
import {
  MapPin,
  Sparkles,
  Layers,
  Filter,
  Plus,
  Minus,
  Maximize2,
  Navigation,
  ThumbsUp,
  ArrowRight,
  X,
  AlertTriangle,
  CheckCircle2,
  Activity
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export function CivicMapView({ departmentFilter }: { departmentFilter?: string }) {
  const { issues: allIssues, toggleUpvote } = useApp();
  
  const issues = departmentFilter
    ? allIssues.filter(i => i.category.toLowerCase() === departmentFilter.toLowerCase())
    : allIssues;
  const [selectedIssue, setSelectedIssue] = useState<CivicIssue | null>(issues[0]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeStatus, setActiveStatus] = useState<string>("All");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(14);

  const filteredIssues = issues.filter((issue) => {
    if (activeCategory !== "All" && issue.category !== activeCategory) return false;
    if (activeStatus !== "All" && issue.status !== activeStatus) return false;
    return true;
  });

  // Calculate relative pixel coordinates on the map container
  const getMapPosition = (lat: number, lng: number, index: number) => {
    // Map bounding box around Shanti Nagar (center 12.960, 77.595)
    const basePositions = [
      { top: "38%", left: "42%" },
      { top: "25%", left: "68%" },
      { top: "65%", left: "32%" },
      { top: "18%", left: "28%" },
      { top: "52%", left: "55%" },
      { top: "78%", left: "48%" },
      { top: "32%", left: "82%" },
      { top: "72%", left: "74%" },
    ];
    return basePositions[index % basePositions.length];
  };

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full rounded-3xl overflow-hidden border border-surface-container-high bg-slate-900 shadow-2xl flex flex-col">
      
      {/* Top Map Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-surface-dim pointer-events-auto overflow-x-auto max-w-full">
          {["All", "Sanitation", "Roads", "Water", "Electricity", "Waste"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0",
                activeCategory === cat
                  ? "bg-primary-600 text-white shadow-sm"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Layer Toggles & Stats */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-2xl backdrop-blur-md text-xs font-bold shadow-lg border transition-all",
              showHeatmap
                ? "bg-rose-500 text-white border-rose-600 ring-2 ring-rose-300"
                : "bg-white/95 text-on-surface border-surface-dim hover:bg-surface-container"
            )}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{showHeatmap ? "Heatmap Active" : "Civic Heatmap"}</span>
          </button>

          <div className="px-3 py-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-surface-dim text-xs font-bold text-on-surface hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>{filteredIssues.length} Incidents Live</span>
          </div>
        </div>
      </div>

      {/* Interactive Map Visual Surface */}
      <div className="relative flex-1 w-full bg-[#0f172a] overflow-hidden select-none cursor-grab active:cursor-grabbing">
        
        {/* Styled Street Grid SVG Background */}
        <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#334155" strokeWidth="1.5" />
            </pattern>
            <pattern id="subgrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#subgrid)" />
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Main Road Lines */}
          <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#475569" strokeWidth="6" />
          <line x1="45%" y1="0" x2="45%" y2="100%" stroke="#475569" strokeWidth="6" />
          <line x1="20%" y1="0" x2="80%" y2="100%" stroke="#3b82f6" strokeWidth="3" strokeDasharray="6,6" />
        </svg>

        {/* Heatmap Layer Simulation */}
        {showHeatmap && (
          <div className="absolute inset-0 pointer-events-none transition-opacity duration-500">
            <div className="absolute top-[35%] left-[40%] w-64 h-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/25 blur-3xl" />
            <div className="absolute top-[65%] left-[30%] w-56 h-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/25 blur-3xl" />
            <div className="absolute top-[22%] left-[65%] w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
          </div>
        )}

        {/* Map Landmark Labels */}
        <div className="absolute top-[36%] left-[10%] text-slate-400 font-bold text-xs tracking-widest uppercase pointer-events-none">
          Double Road / Lalbagh North
        </div>
        <div className="absolute top-[12%] left-[48%] text-slate-400 font-bold text-xs tracking-widest uppercase pointer-events-none">
          80ft Road • Shanti Nagar Metro Corridor
        </div>
        <div className="absolute top-[75%] left-[38%] text-slate-400 font-bold text-xs tracking-widest uppercase pointer-events-none">
          Sector 3 Residential Sector
        </div>

        {/* Render Map Issue Pins */}
        {filteredIssues.map((issue, idx) => {
          const pos = getMapPosition(issue.location.lat, issue.location.lng, idx);
          const isSelected = selectedIssue?.id === issue.id;

          const getPinColor = () => {
            if (issue.status === "Resolved") return "bg-emerald-500 border-emerald-300 text-white";
            if (issue.urgency === "Critical") return "bg-rose-600 border-rose-300 text-white animate-pulse";
            if (issue.status === "In Progress") return "bg-indigo-600 border-indigo-300 text-white";
            return "bg-amber-500 border-amber-300 text-white";
          };

          return (
            <button
              key={issue.id}
              type="button"
              onClick={() => setSelectedIssue(issue)}
              style={{ top: pos.top, left: pos.left }}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300 cursor-pointer group focus:outline-none",
                isSelected ? "scale-125 z-30" : "hover:scale-115"
              )}
            >
              {/* Radar pulse for critical pins */}
              {issue.urgency === "Critical" && (
                <span className="absolute -inset-2 rounded-full bg-rose-500 opacity-40 animate-ping" />
              )}

              <div
                className={cn(
                  "relative flex items-center justify-center p-2 rounded-2xl border-2 shadow-2xl transition-all",
                  getPinColor(),
                  isSelected ? "ring-4 ring-white shadow-glow" : ""
                )}
              >
                <MapPin className="w-5 h-5" />
              </div>

              {/* Pin Callout Tooltip */}
              <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/80 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-white/10">
                #{issue.id} • {issue.category}
              </div>
            </button>
          );
        })}

        {/* Map UI Control Buttons */}
        <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(z + 1, 18))}
            className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md text-on-surface shadow-lg hover:bg-white transition-all font-bold"
            title="Zoom In"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(z - 1, 10))}
            className="p-2.5 rounded-xl bg-white/95 backdrop-blur-md text-on-surface shadow-lg hover:bg-white transition-all font-bold"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setSelectedIssue(issues[0])}
            className="p-2.5 rounded-xl bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-all font-bold"
            title="Recenter Map"
          >
            <Navigation className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Selected Issue Drawer Overlay */}
      {selectedIssue && (
        <div className="p-4 sm:p-5 bg-white border-t border-surface-container-high z-30 animate-slideUp">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={selectedIssue.images.reported}
                alt={selectedIssue.title}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 ring-2 ring-primary-100"
              />
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary-700">#{selectedIssue.id}</span>
                  <StatusBadge status={selectedIssue.status} size="sm" />
                  <UrgencyBadge urgency={selectedIssue.urgency} />
                </div>
                <h4 className="font-headline font-bold text-sm sm:text-base text-on-surface truncate max-w-md">
                  {selectedIssue.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                  <span className="truncate max-w-xs">{selectedIssue.location.address}</span>
                  <span>•</span>
                  <span>{selectedIssue.assignedDepartment}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => toggleUpvote(selectedIssue.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all",
                  selectedIssue.isUpvoted
                    ? "bg-primary-600 text-white shadow-md shadow-primary-600/30"
                    : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                )}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{selectedIssue.upvotes} Upvotes</span>
              </button>

              <Link
                href={`/issues/${selectedIssue.id}`}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-700 text-white text-xs font-bold shadow-lg hover:brightness-110 transition-all shrink-0"
              >
                <span>Track Live SLA</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
