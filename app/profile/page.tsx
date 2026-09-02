"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { useBudget } from "@/lib/context/budget-context";

const JanSevaMap = dynamic(() => import("@/components/map/JanSevaMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-500 text-xs font-bold animate-pulse">
      Loading Live Map...
    </div>
  ),
});
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
  Edit3,
  Bot,
  Send,
  Mic,
  Maximize2,
  Minimize2,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Check,
  Star,
  Users,
  Compass,
  Building2,
  X,
  Layers,
  Heart,
  LogOut
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { user, issues, chatMessages, sendChatMessage, logout } = useApp();
  const { userVotes, proposals } = useBudget();

  // Interactive state
  const [mapExpanded, setMapExpanded] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [postFilter, setPostFilter] = useState<"all" | "in_progress" | "resolved" | "critical">("all");
  const [chatInput, setChatInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiResponding, setIsAiResponding] = useState(false);

  const handleSendChat = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || chatInput).trim();
    if (!textToSend || isAiResponding) return;

    setChatInput("");
    setIsAiResponding(true);
    await sendChatMessage(textToSend);
    setIsAiResponding(false);
  };

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAiResponding]);

  const postsScrollRef = useRef<HTMLDivElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="p-4 rounded-full bg-slate-100">
          <ShieldCheck className="w-10 h-10 text-slate-400" />
        </div>
        <div>
          <h2 className="font-headline font-black text-2xl text-slate-800">Profile Unavailable</h2>
          <p className="text-sm text-slate-500 mt-1">Please log in to access your civic citizen dashboard.</p>
        </div>
        <Link
          href="/login"
          className="px-6 py-2.5 bg-[#134431] hover:bg-[#0c2e21] text-white font-bold text-xs rounded-2xl mt-4 shadow-md transition-colors"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // Filter user's posts
  const myReports = issues.filter(
    (i) => (i.reporter.username && i.reporter.username === user.username) || i.reporter.name === user.name
  );
  const upvotedIssues = issues.filter((i) => i.isUpvoted);

  const filteredReports = myReports.filter((issue) => {
    if (postFilter === "in_progress" && issue.status !== "In Progress") return false;
    if (postFilter === "resolved" && issue.status !== "Resolved" && issue.status !== "Verified Resolved") return false;
    if (postFilter === "critical" && issue.urgency !== "Critical") return false;
    return true;
  });

  const dynamicIssuesReported = myReports.length;
  const dynamicIssuesResolved = myReports.filter((i) => i.status === "Resolved" || i.status === "Verified Resolved").length;
  const dynamicUpvotes = upvotedIssues.length;
  const dynamicImpactScore = Math.min(
    100,
    Math.max(user.stats?.civicImpactScore || 10, Math.round(dynamicIssuesReported * 8 + dynamicIssuesResolved * 15 + dynamicUpvotes * 3))
  );

  // All available municipal badges list with unlock rules
  const allAvailableBadges = [
    {
      id: "ward-pioneer",
      name: "Ward Pioneer",
      icon: "🏆",
      description: "First to report and verify 3 local civic issues in your ward.",
      criteria: "Submit 3 verified incident reports",
      isUnlocked: true,
      unlockedAt: "Aug 2026",
      category: "Reporting",
      reward: "+150 XP"
    },
    {
      id: "verified-resident",
      name: "Verified Resident",
      icon: "🛡️",
      description: "Identity verified with municipal ward resident registry.",
      criteria: "Complete residential OTP/identity verification",
      isUnlocked: true,
      unlockedAt: "Aug 2026",
      category: "Trust",
      reward: "+200 XP"
    },
    {
      id: "sla-tracker",
      name: "SLA Tracker Pro",
      icon: "⚡",
      description: "Tracked and upvoted 10+ tickets reaching resolved SLA.",
      criteria: "Participate in 10 active SLA resolution milestones",
      isUnlocked: true,
      unlockedAt: "Aug 2026",
      category: "Engagement",
      reward: "+100 XP"
    },
    {
      id: "water-vanguard",
      name: "Water Conservation Vanguard",
      icon: "💧",
      description: "Successfully report and verify 5 water supply/drainage repairs.",
      criteria: "Resolve 5 water pipeline or storm drain tickets",
      isUnlocked: false,
      progress: "3 / 5 completed",
      category: "Domain",
      reward: "+300 XP"
    },
    {
      id: "road-guardian",
      name: "Road Safety Guardian",
      icon: "🛣️",
      description: "Flag 5 hazardous potholes or traffic obstacles resolved by PWD.",
      criteria: "Submit 5 road surface reports verified by field team",
      isUnlocked: false,
      progress: "2 / 5 completed",
      category: "Domain",
      reward: "+250 XP"
    },
    {
      id: "civic-champion",
      name: "Civic Champion",
      icon: "🌟",
      description: "Reach 1,500+ XP and rank in the top 5% of your municipal zone.",
      criteria: "Achieve Level 4 Citizen status (1500+ XP)",
      isUnlocked: (user.civicCitizenXP || 0) >= 1500,
      unlockedAt: (user.civicCitizenXP || 0) >= 1500 ? "Active" : undefined,
      progress: `${user.civicCitizenXP || 0} / 1500 XP`,
      category: "Honor",
      reward: "+500 XP & Gold Badge"
    },
    {
      id: "green-hero",
      name: "Green Canopy Hero",
      icon: "🌳",
      description: "Contribute to park maintenance and arbor protection.",
      criteria: "Report 3 park/green zone upkeep tasks",
      isUnlocked: (dynamicIssuesReported || 0) >= 3,
      unlockedAt: (dynamicIssuesReported || 0) >= 3 ? "Active" : undefined,
      progress: `${Math.min(3, dynamicIssuesReported || 0)} / 3 completed`,
      category: "Environment",
      reward: "+200 XP"
    },
    {
      id: "quick-snap",
      name: "AI Quick-Snap Master",
      icon: "📸",
      description: "Submit 5 AI-detected reports with 95%+ triage accuracy.",
      criteria: "5 successful camera snap submissions",
      isUnlocked: (dynamicIssuesReported || 0) >= 5,
      unlockedAt: (dynamicIssuesReported || 0) >= 5 ? "Active" : undefined,
      progress: `${Math.min(5, dynamicIssuesReported || 0)} / 5 completed`,
      category: "AI Technology",
      reward: "+350 XP"
    }
  ];

  const scrollPosts = (direction: "left" | "right") => {
    if (postsScrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      postsScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fadeIn pb-16">

      {/* 1. TOP SUB-NAV PILL BAR (FitPlan style from Image 1) */}
      <div className="rounded-3xl bg-white border border-slate-100 p-3 sm:p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">

        {/* Left Title / Branding */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#134431] flex items-center justify-center text-white font-bold text-xs">
            JS
          </div>
          <div>
            <h1 className="font-headline font-black text-base text-slate-900 leading-tight">
              Civic Dashboard
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">JanSeva Resident Portal</p>
          </div>
        </div>

        {/* Center Pill Navigation Bar */}
        <div className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 rounded-full bg-[#f8faf9] border border-slate-200/70 overflow-x-auto no-scrollbar max-w-full text-xs font-bold text-slate-700">
          <button
            onClick={() => { }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#134431] text-white shadow-xs"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Profile Home</span>
          </button>

          <button
            onClick={() => router.push("/feed")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-200/60 transition-colors whitespace-nowrap"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>Timeline</span>
          </button>

          <button
            onClick={() => router.push("/map")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-200/60 transition-colors whitespace-nowrap"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Activity</span>
          </button>

          <button
            onClick={() => {
              const el = document.getElementById("ai-chatbot-section");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-200/60 transition-colors whitespace-nowrap"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Messages</span>
          </button>

          <Link
            href="/profile/edit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-200/60 transition-colors whitespace-nowrap"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>Settings</span>
          </Link>

          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors whitespace-nowrap cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>

        {/* Right Search & Avatar Preview */}
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-full bg-[#f8faf9] border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#134431]"
            />
          </div>

          <Link
            href="/notifications"
            className="w-8 h-8 rounded-full bg-[#f8faf9] border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1 right-1"></span>
          </Link>

          <Link href="/profile/edit" className="relative shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name || user.username || "User"}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/40"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/40">
                {(user.name || user.username || "C").charAt(0).toUpperCase()}
              </div>
            )}
          </Link>
        </div>

      </div>

      {/* CITIZEN IDENTITY CARD (Displays Name, Username, Role, Location, Contact & Edit Link) */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
        <div className="flex items-center gap-4 min-w-0">
          <div className="relative shrink-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-emerald-100 ring-4 ring-emerald-500/20 shadow-md flex items-center justify-center">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name || user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-headline font-black text-2xl text-emerald-800">
                  {(user.name || user.username || "C").charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold border-2 border-white shadow-xs" title="Verified Citizen">
              ✓
            </span>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-headline font-black text-xl sm:text-2xl text-slate-900 leading-tight">
                {user.name}
              </h2>
              <span className="font-mono text-xs font-bold text-slate-600 bg-[#f1f5f3] px-2.5 py-0.5 rounded-full border border-slate-200">
                @{user.username || "citizen"}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 font-medium">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 text-[11px]">
                {user.role === "officer" ? (user.levelTitle || "Ward Officer") : (user.role === "corporator" ? "Corporator" : "Active Citizen")}
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>{user.city ? `${user.city}, PIN ${user.pincode}` : `PIN ${user.pincode || "751030"}`}</span>
              </span>
              {user.email && (
                <span className="text-slate-400 text-[11px] truncate max-w-[200px]">• {user.email}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Link
            href="/profile/edit"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#134431] hover:bg-[#0c2e21] text-white text-xs font-bold shadow-md shadow-emerald-950/15 hover:scale-102 active:scale-98 transition-all shrink-0 cursor-pointer"
          >
            <Edit3 className="w-4 h-4 text-emerald-300" />
            <span>Edit Profile</span>
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* LEFT COLUMN (Cols 1-7: Location Landscape & Horizontal Posts) */}
        <div className="lg:col-span-7 space-y-6">

          {/* SECTION 2A: SCENIC LANDSCAPE BANNER WITH FLOATING LOCATION MAP (Image 2) */}
          <div className="relative rounded-3xl overflow-hidden shadow-md min-h-[350px] sm:min-h-0 sm:h-80 w-full group bg-slate-900">

            {/* Background High-Res Scenic Scenery of the User's Area */}
            <img
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80"
              alt="Neighborhood Landscape"
              className="w-full h-full object-cover transform group-hover:scale-103 transition-transform duration-700 opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>

            {/* Top-Right Floating Badges */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-md text-slate-800 text-[10px] font-bold">
                <div className="flex -space-x-1.5">
                  <img className="w-4 h-4 rounded-full ring-1 ring-white object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                  <img className="w-4 h-4 rounded-full ring-1 ring-white object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
                </div>
                <span>+4.8K Citizens</span>
              </div>

              <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-700 shadow-md">
                <Bell className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Floating Location Name & Collapsible Map Card (Exact "Traveling to Switzerland" Equivalent) */}
            <div className="absolute top-4 left-4 z-20 max-w-[260px] sm:max-w-[290px]">
              <div className="rounded-2xl bg-white/95 backdrop-blur-md p-3.5 shadow-xl border border-white/80 space-y-2.5">

                {/* Location Title & Time */}
                <div className="space-y-0.5">
                  <h3 className="font-headline font-black text-sm text-slate-900 leading-tight">
                    PIN {user.pincode || "751030"} • {user.pincode === "751030" ? "Khandagiri" : (user.city || "Bhubaneswar")}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>{new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} • ⏱ Live SLA Active</span>
                  </p>
                </div>

                {/* Interactive Mini Map Thumbnail with Expand Icon */}
                <div className="relative rounded-xl overflow-hidden h-28 sm:h-32 bg-slate-100 border border-slate-200/80 shadow-xs group/map">
                  <JanSevaMap
                    height="100%"
                    zoom={13}
                    showUserLocation={true}
                    interactive={false}
                    variant="mini"
                    className="h-full rounded-none border-0 shadow-none"
                  />

                  {/* Clickable Overlay to Maximize */}
                  <div
                    onClick={() => setMapExpanded(true)}
                    className="absolute inset-0 bg-transparent hover:bg-black/10 transition-colors cursor-pointer z-10"
                    title="Click to expand live map"
                  />

                  {/* Expand / Maximize Button */}
                  <button
                    type="button"
                    onClick={() => setMapExpanded(true)}
                    title="Maximize Map"
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center shadow-md transition-transform hover:scale-110 cursor-pointer z-20"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            </div>

            {/* Bottom Caption Overlay */}
            <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-white text-xs">
              <span className="font-bold drop-shadow-md">
                Bhubaneswar Municipal Corporation (BMC)
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600/90 font-black text-[10px]">
                Zone 3 Verified
              </span>
            </div>

          </div>

          {/* SECTION 2B: HORIZONTAL SWIPEABLE REPORTS CAROUSEL (Image 4 - "Upcoming Schedule" Style) */}
          <div className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-sm space-y-4">

            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-headline font-black text-lg sm:text-xl text-slate-900">
                  My Civic Reports & Contributions
                </h3>
                <p className="text-xs text-slate-500">
                  Swipe horizontally to explore your logged community issues and live progress.
                </p>
              </div>

              {/* Status Filters + Arrows */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-[#f8faf9] p-1 rounded-xl border border-slate-200/80 text-[11px] font-bold">
                  {[
                    { id: "all", label: "All" },
                    { id: "in_progress", label: "⚡ Active" },
                    { id: "resolved", label: "✓ Fixed" },
                  ].map((filter) => (
                    <button
                      key={filter.id}
                      onClick={() => setPostFilter(filter.id as any)}
                      className={cn(
                        "px-2.5 py-1 rounded-lg transition-all",
                        postFilter === filter.id
                          ? "bg-[#134431] text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Left / Right Carousel Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => scrollPosts("left")}
                    className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollPosts("right")}
                    className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal Scrollable Row */}
            <div
              ref={postsScrollRef}
              className="flex gap-4 overflow-x-auto snap-x no-scrollbar pb-2 pt-1"
            >
              {filteredReports.length === 0 ? (
                <div className="w-full p-8 rounded-2xl bg-[#f8faf9] border border-dashed border-slate-200 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-600">No reports found matching this filter</p>
                  <Link
                    href="/report"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#f06424] hover:underline"
                  >
                    <span>Snap a photo to report an issue →</span>
                  </Link>
                </div>
              ) : (
                filteredReports.map((issue) => (
                  <div
                    key={issue.id}
                    onClick={() => router.push(`/issues/${issue.id}`)}
                    className="w-64 sm:w-72 shrink-0 snap-start rounded-2xl bg-white border border-slate-100 p-3 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative rounded-xl h-36 w-full overflow-hidden bg-slate-100 mb-2.5">
                        <img
                          src={issue.images.reported || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80"}
                          alt={issue.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold">
                          {issue.status}
                        </div>
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/90 text-slate-800 text-[10px] font-bold">
                          {issue.category}
                        </div>
                      </div>

                      {/* Content */}
                      <h4 className="font-headline font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-emerald-800 transition-colors">
                        {issue.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                        {issue.description}
                      </p>
                    </div>

                    {/* Bottom Row */}
                    <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">
                        {formatDate(issue.createdAt)}
                      </span>
                      <div className="flex items-center gap-1 text-[#f06424] font-bold">
                        <ThumbsUp className="w-3 h-3 fill-current" />
                        <span>{issue.upvotes} Upvotes</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN (Cols 8-12: Chatbot + Stats + Badge Explorer - Image 3) */}
        <div className="lg:col-span-5 space-y-6">

          {/* SECTION 3A: GREETING & INTERACTIVE CHATBOT CARD (Image 3) */}
          <div id="ai-chatbot-section" className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-sm space-y-4">

            {/* Header Greeting */}
            <div>
              <h2 className="font-headline font-black text-2xl text-slate-900 leading-tight">
                Have a Good day, <br />
                <span className="text-[#134431]">{(user.name || user.username || "Citizen").split(' ')[0]} 👋</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Fuel your neighborhood impact with transparent ward updates and SLA tracking.
              </p>
            </div>

            {/* Quick Action Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {[
                {
                  label: "📍 Ward SLA",
                  prompt: "What is the average SLA resolution time for my ward?",
                },
                {
                  label: "⚡ My Tickets",
                  prompt: "Show the latest status of my reported issues.",
                },
                {
                  label: "🏆 XP & Badges",
                  prompt: "What is my current Civic XP score and what badges do I have?",
                },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChat(undefined, chip.prompt)}
                  disabled={isAiResponding}
                  className="px-3 py-1 rounded-full bg-[#edf7f1] hover:bg-emerald-100 text-[#134431] text-[11px] font-bold transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Interactive Chat Messages Stream */}
            <div className="rounded-2xl bg-[#f8faf9] border border-slate-100 p-3 h-52 sm:h-60 overflow-y-auto space-y-2.5 text-xs">
              {/* Dynamic chat message history */}
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-2 max-w-[90%]",
                    msg.sender === "user"
                      ? "ml-auto flex-row-reverse"
                      : "mr-auto"
                  )}
                >
                  {msg.sender === "user" ? (
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {(user.name || user.username || "C").charAt(0).toUpperCase()}
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#134431] text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "p-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs whitespace-pre-line",
                      msg.sender === "user"
                        ? "bg-[#134431] text-white rounded-br-none"
                        : "bg-white border border-slate-100 text-slate-700 rounded-bl-none"
                    )}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Gemini Thinking / Typing Indicator */}
              {isAiResponding && (
                <div className="flex items-start gap-2 mr-auto max-w-[90%] animate-fadeIn">
                  <div className="w-6 h-6 rounded-full bg-[#134431] text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                  <div className="p-2.5 rounded-2xl bg-white border border-slate-100 text-slate-500 rounded-bl-none flex items-center gap-1.5 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse delay-75" />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse delay-150" />
                    <span className="ml-1 text-[11px] text-slate-400 font-normal">
                      JanSeva AI thinking...
                    </span>
                  </div>
                </div>
              )}

              <div ref={chatScrollRef} />
            </div>

            {/* Chat Input Box */}
            <form
              onSubmit={(e) => handleSendChat(e)}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask JanSeva AI about your tickets, SLA, or XP..."
                disabled={isAiResponding}
                className="w-full pl-4 pr-12 py-2.5 text-xs rounded-full bg-[#f8faf9] border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#134431] text-slate-800 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isAiResponding}
                className="absolute right-1.5 w-8 h-8 rounded-full bg-[#f06424] hover:bg-[#d95214] disabled:opacity-40 text-white flex items-center justify-center shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* SECTION 3B: STATS & BADGE EXPLORER (Image 3) */}
          <div className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-sm space-y-5">

            {/* 4-Stat Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#f8faf9] border border-slate-100 text-center">
                <p className="font-headline font-black text-2xl text-[#134431]">
                  {dynamicIssuesReported}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  Reports Logged
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f8faf9] border border-slate-100 text-center">
                <p className="font-headline font-black text-2xl text-emerald-700">
                  {dynamicIssuesResolved}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  Repairs Verified
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f8faf9] border border-slate-100 text-center">
                <p className="font-headline font-black text-2xl text-[#f06424]">
                  {user.civicCitizenXP}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  Citizen XP
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#f8faf9] border border-slate-100 text-center">
                <p className="font-headline font-black text-2xl text-purple-700">
                  Lvl {user.level}
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  {user.levelTitle || "Active"}
                </p>
              </div>
            </div>

            {/* Badges Section & Explorer Trigger */}
            <div className="pt-2 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-headline font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>Civic Badges & Honors</span>
                </h4>

                <button
                  type="button"
                  onClick={() => setShowBadgeModal(true)}
                  className="text-xs font-bold text-[#f06424] hover:underline"
                >
                  Explore Badges →
                </button>
              </div>

              {/* Current Active Badge Display */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50/60 to-emerald-50/60 border border-amber-200/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    🏆
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-slate-900">Area Pioneer</h5>
                    <p className="text-[10px] text-slate-500">Verified community reporter • PIN {user.pincode || "751030"}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Unlocked
                </span>
              </div>
            </div>

          </div>

          {/* SECTION 3C: ACTIVE BUDGET VOTES */}
          <div className="rounded-3xl bg-white border border-slate-100 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-black text-lg text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#134431]" />
                My Active Budget Votes
              </h3>
              <Link href="/ward-budget" className="text-xs font-bold text-[#f06424] hover:underline">
                View Ward Budget →
              </Link>
            </div>
            
            <div className="space-y-3">
              {userVotes.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                  <p className="text-xs font-medium text-slate-500">You haven't voted on any budget proposals yet.</p>
                </div>
              ) : (
                userVotes.slice(0, 3).map(voteId => {
                  const proposal = proposals.find(p => p.id === voteId);
                  if (!proposal) return null;
                  return (
                    <div key={proposal.id} className="p-3 rounded-2xl bg-[#f8faf9] border border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">{proposal.title}</h4>
                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">{proposal.status}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-lg">
                          Voted ✓
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

      {/* 3. MAP MAXIMIZED MODAL */}
      {mapExpanded && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-scaleUp">

            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-[#f8faf9]">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#134431]" />
                <div>
                  <h3 className="font-headline font-black text-base text-slate-900">
                    PIN {user.pincode || "751030"} • {user.city || "Bhubaneswar"} Live Municipal Map
                  </h3>
                  <p className="text-xs text-slate-500">
                    Real-time incident pins, maintenance routes, and municipal boundaries.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setMapExpanded(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Interactive Map View Frame */}
            <div className="relative h-[55vh] sm:h-[480px] w-full bg-slate-100 flex items-center justify-center overflow-hidden">
              <JanSevaMap
                height="100%"
                zoom={14}
                showUserLocation={true}
                interactive={true}
                className="h-full rounded-none border-0 shadow-none"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#f8faf9] border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Lat: 20.2961° N, Lng: 85.8245° E • Real-time Geo Coordinates
              </span>
              <button
                onClick={() => setMapExpanded(false)}
                className="px-6 py-2 rounded-xl bg-[#134431] text-white text-xs font-bold hover:bg-[#0c2e21]"
              >
                Close Map
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. BADGE EXPLORER / CIVIC HALL OF FAME MODAL */}
      {showBadgeModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-scaleUp max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-50/70 via-white to-emerald-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-sm">
                  🏆
                </div>
                <div>
                  <h3 className="font-headline font-black text-lg text-slate-900">
                    Civic Honors & Badge Explorer
                  </h3>
                  <p className="text-xs text-slate-500">
                    Earn municipal recognition, unlock civic XP, and boost your ward credibility.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowBadgeModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Badges List */}
            <div className="p-5 overflow-y-auto space-y-3.5">
              {allAvailableBadges.map((badge) => (
                <div
                  key={badge.id}
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex items-start gap-4",
                    badge.isUnlocked
                      ? "bg-gradient-to-r from-amber-50/40 via-white to-emerald-50/30 border-amber-200/80 shadow-xs"
                      : "bg-[#f8faf9] border-slate-200/80 opacity-80"
                  )}
                >
                  <div className="text-3xl shrink-0 p-2 rounded-xl bg-white border border-slate-100 shadow-2xs">
                    {badge.icon}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-headline font-bold text-sm text-slate-900 flex items-center gap-2">
                        <span>{badge.name}</span>
                        <span className="text-[10px] font-semibold text-slate-400">({badge.category})</span>
                      </h4>
                      {badge.isUnlocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1">
                          <Check className="w-3 h-3" /> Unlocked
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                          In Progress
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600">
                      {badge.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                      <span className="text-slate-500 font-medium">
                        Target: <strong>{badge.criteria}</strong>
                      </span>
                      <span className="text-[#f06424] font-bold">
                        Reward: {badge.reward}
                      </span>
                    </div>

                    {!badge.isUnlocked && badge.progress && (
                      <div className="text-[10px] text-slate-400 font-semibold pt-0.5">
                        Current Progress: {badge.progress}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#f8faf9] border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setShowBadgeModal(false)}
                className="px-6 py-2 rounded-xl bg-[#134431] text-white text-xs font-bold hover:bg-[#0c2e21]"
              >
                Close Explorer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
