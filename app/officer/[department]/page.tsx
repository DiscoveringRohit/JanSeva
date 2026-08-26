"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { CivicIssue, NotificationItem } from "@/lib/data/mock-data";
import {
  ShieldCheck,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Building2,
  BarChart3,
  TrendingUp,
  FileSearch,
  Layers,
  Calendar,
  Vote,
  Megaphone,
  FileSpreadsheet,
  ArrowRight,
  Filter,
  Search,
  Sparkles,
  Phone,
  Mail,
  UserCheck,
  Send,
  Download,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Plus,
  RefreshCw,
  Radio,
  Eye,
  AlertCircle,
  TrendingDown,
  ShieldAlert,
  Flame,
  Droplet,
  Construction,
  Zap,
  Trash2,
  Award,
  Camera,
  CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock Field Squads Roster
const SQUADS_ROSTER = [
  { id: "sq-1", name: "Unit 1 - Rapid Response Hydro Van", leader: "Er. Bikram Rout", phone: "+91 94371 00112", status: "Available", activeTickets: 0, vehicle: "Tata Ace OD-02-B-1092", zone: "Ward 63, Khandagiri" },
  { id: "sq-2", name: "Unit 2 - Road Cold-Mix Paving Van", leader: "Er. Santosh Jena", phone: "+91 94371 00113", status: "In Field", activeTickets: 1, vehicle: "Mahindra Bolero OD-02-C-4491", zone: "Ward 34, Saheed Nagar" },
  { id: "sq-3", name: "Unit 3 - Heavy Suction & Conduit Van", leader: "Er. Rajesh Mahapatra", phone: "+91 94371 00114", status: "In Field", activeTickets: 2, vehicle: "Ashok Leyland Vacuum OD-02-F-8821", zone: "South Zone Main Lines" },
  { id: "sq-4", name: "Unit 4 - Sewerage Canal Desilter", leader: "Er. Tanmay Das", phone: "+91 94371 00115", status: "Available", activeTickets: 0, vehicle: "JCB Excavator OD-02-E-3301", zone: "Ward 12, Patia" },
  { id: "sq-5", name: "Unit 5 - Smart Grid & Sensor Crew", leader: "Er. Deepak Swain", phone: "+91 94371 00116", status: "In Field", activeTickets: 1, vehicle: "Eicher Hydraulic OD-02-K-9012", zone: "Tech Corridor" },
  { id: "sq-6", name: "Unit 6 - Emergency Night Triage Van", leader: "Er. Manoj Pradhan", phone: "+91 94371 00117", status: "Off Shift", activeTickets: 0, vehicle: "Force Emergency OD-02-M-1122", zone: "Central BMC Depot" },
];

// Helper to filter issues strictly by department
function matchesDepartment(issue: CivicIssue, deptSlug: string): boolean {
  const dept = (deptSlug || "water").toLowerCase();
  if (dept === "municipal" || dept === "all") return true;

  const cat = (issue.category || "").toLowerCase();
  const assigned = (issue.assignedDepartment || "").toLowerCase();
  const title = (issue.title || "").toLowerCase();

  if (dept === "water") {
    return (
      cat.includes("water") ||
      cat.includes("drain") ||
      cat.includes("sewer") ||
      cat.includes("pipe") ||
      assigned.includes("water") ||
      assigned.includes("drain") ||
      title.includes("water") ||
      title.includes("pipe") ||
      title.includes("drain")
    );
  }

  if (dept === "roads") {
    return (
      cat.includes("road") ||
      cat.includes("pothole") ||
      cat.includes("footpath") ||
      cat.includes("traffic") ||
      assigned.includes("road") ||
      assigned.includes("pwd") ||
      title.includes("road") ||
      title.includes("pothole") ||
      title.includes("asphalt")
    );
  }

  if (dept === "electricity") {
    return (
      cat.includes("electri") ||
      cat.includes("light") ||
      cat.includes("power") ||
      cat.includes("grid") ||
      assigned.includes("electri") ||
      assigned.includes("power") ||
      title.includes("light") ||
      title.includes("wire") ||
      title.includes("blackout")
    );
  }

  if (dept === "sanitation") {
    return (
      cat.includes("sanitat") ||
      cat.includes("waste") ||
      cat.includes("garbage") ||
      cat.includes("dump") ||
      assigned.includes("sanitat") ||
      assigned.includes("waste") ||
      title.includes("garbage") ||
      title.includes("waste") ||
      title.includes("dumpster")
    );
  }

  return true;
}

export default function DepartmentOfficerPage() {
  const { user, issues, updateIssueStatus, notifications, setNotifications } = useApp();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const departmentSlug = (params.department as string) || "water";
  const currentTab = searchParams.get("tab") || "workbench";

  const departmentName = departmentSlug
    ? departmentSlug.charAt(0).toUpperCase() + departmentSlug.slice(1)
    : "Water";

  // Filter issues strictly for this department
  const deptIssues = useMemo(() => {
    return issues.filter((issue) => matchesDepartment(issue, departmentSlug));
  }, [issues, departmentSlug]);

  const [selectedIssueId, setSelectedIssueId] = useState<string>("");
  const [ticketFilter, setTicketFilter] = useState<"all" | "active" | "critical" | "overdue" | "resolved">("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [newNote, setNewNote] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [selectedSquad, setSelectedSquad] = useState("Unit 1 - Rapid Response Hydro Van");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  // Default selected issue
  useEffect(() => {
    if (deptIssues.length > 0 && (!selectedIssueId || !deptIssues.some(i => i.id === selectedIssueId))) {
      setSelectedIssueId(deptIssues[0].id);
    }
  }, [deptIssues, selectedIssueId]);

  const selectedIssue = useMemo(() => {
    return deptIssues.find((i) => i.id === selectedIssueId) || deptIssues[0];
  }, [deptIssues, selectedIssueId]);

  // Filtered tickets stream
  const filteredTickets = useMemo(() => {
    return deptIssues.filter((t) => {
      if (ticketFilter === "active" && (t.status === "Resolved" || t.status === "Verified")) return false;
      if (ticketFilter === "critical" && t.urgency !== "Emergency" && t.urgency !== "High") return false;
      if (ticketFilter === "overdue" && t.status !== "In Progress") return false;
      if (ticketFilter === "resolved" && t.status !== "Resolved" && t.status !== "Verified") return false;
      if (searchKeyword.trim()) {
        const q = searchKeyword.toLowerCase();
        const matchTitle = (t.title || "").toLowerCase().includes(q);
        const matchId = (t.id || "").toLowerCase().includes(q);
        const matchLoc = (typeof t.location === "object" ? t.location.address : t.location || "").toLowerCase().includes(q);
        const matchCitizen = (t.reporter?.name || "").toLowerCase().includes(q);
        if (!matchTitle && !matchId && !matchLoc && !matchCitizen) return false;
      }
      return true;
    });
  }, [deptIssues, ticketFilter, searchKeyword]);

  // ================= DYNAMIC KPI METRICS =================
  const activeTicketsCount = deptIssues.filter((i) => i.status !== "Resolved" && i.status !== "Verified").length;
  const resolvedCount = deptIssues.filter((i) => i.status === "Resolved" || i.status === "Verified").length;
  const criticalCount = deptIssues.filter((i) => i.urgency === "Emergency" || i.urgency === "High").length;
  
  // Real dynamic SLA compliance calculation
  const slaComplianceRate = deptIssues.length > 0 
    ? Math.min(100, Math.round(((resolvedCount + 0.8 * (activeTicketsCount)) / Math.max(1, deptIssues.length)) * 100))
    : 94;

  // Real dynamic category breakdown
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    deptIssues.forEach((i) => {
      const cat = i.category || "General Incident";
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const total = Math.max(1, deptIssues.length);
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / total) * 100)
    })).sort((a, b) => b.count - a.count);
  }, [deptIssues]);

  // Handle Note Submission
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !selectedIssue) return;
    updateIssueStatus(
      selectedIssue.id,
      selectedIssue.status,
      `[Officer Remark by ${user?.name || "Official"}]: ${newNote.trim()}`
    );
    setNewNote("");
  };

  // 5-Stage Civic Lifecycle Transition Handler
  const handleStatusChange = (newStatus: CivicIssue["status"]) => {
    if (!selectedIssue) return;
    setStatusDropdownOpen(false);
    
    let note = `Officer ${user?.name || "Municipal Authority"} updated status to ${newStatus}.`;
    if (newStatus === "Pending Verification") {
      note = `Field repairs completed by assigned crew. Awaiting citizen in-app photo verification.`;
    } else if (newStatus === "Resolved") {
      note = `Issue verified as 100% resolved and closed in municipal ledger.`;
    }

    updateIssueStatus(selectedIssue.id, newStatus, note);
  };

  // Dispatch Squad Handler
  const handleDispatchSquad = () => {
    if (!selectedIssue) return;
    updateIssueStatus(
      selectedIssue.id,
      "Dispatched",
      `Dispatched municipal crew: ${selectedSquad}. Unit mobilized to location.`
    );
  };

  // Official Municipal Broadcast to Citizens
  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementText.trim()) return;

    const newNotif: NotificationItem = {
      id: `broadcast-${Date.now()}`,
      title: `📢 BMC ${departmentName.toUpperCase()} NOTICE: ${announcementTitle.trim()}`,
      message: announcementText.trim(),
      type: "officer",
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: "/feed",
    };

    setNotifications((prev) => [newNotif, ...prev]);
    setBroadcastSent(true);

    setTimeout(() => {
      setBroadcastSent(false);
      setAnnouncementTitle("");
      setAnnouncementText("");
    }, 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 font-body">
      
      {/* 1. TOP OPERATIONAL BREADCRUMB & CONSOLE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-white border border-slate-100 shadow-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>Operations Console</span>
            <span>/</span>
            <span className="font-bold text-[#134431]">BMC {departmentName.toUpperCase()} Division</span>
            <span>/</span>
            <span className="text-emerald-700 font-bold">Ward 63 Operations Desk</span>
          </div>
          <h1 className="font-headline font-black text-2xl sm:text-3xl text-slate-900 tracking-tight flex items-center gap-3">
            <span>{departmentName} Operations Command</span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#134431] text-xs font-bold border border-emerald-200">
              {deptIssues.length} Department Tickets
            </span>
          </h1>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#edf7f1] border border-[#cbe7d7] text-xs font-bold text-[#134431]">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Telemetry: 100% Live</span>
          </div>

          <button
            onClick={() => router.push(`/officer/${departmentSlug}?tab=reports`)}
            className="px-4 py-2 rounded-2xl bg-[#134431] hover:bg-[#0c2e21] text-white font-headline font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit</span>
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC TEAMHUB RADIAL DONUT GAUGES (LIVE TELEMETRY) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: SLA Compliance Donut */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-soft flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">SLA Compliance</p>
            <p className="font-headline font-black text-3xl text-slate-900">{slaComplianceRate}%</p>
            <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Target: &lt; 24h SLA</span>
            </p>
          </div>
          {/* Circular Gauge Graphic */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-500"
                strokeDasharray={`${slaComplianceRate}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-headline font-black text-xs text-slate-900">{slaComplianceRate}%</span>
          </div>
        </div>

        {/* Metric 2: Active Workload Donut */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-soft flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Queue</p>
            <p className="font-headline font-black text-3xl text-slate-900">{activeTicketsCount} Tickets</p>
            <p className="text-[11px] font-semibold text-[#134431]">
              {resolvedCount} Resolved in Ward
            </p>
          </div>
          {/* Circular Gauge Graphic */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-[#134431]"
                strokeDasharray={`${Math.min(100, activeTicketsCount * 15)}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-headline font-black text-xs text-slate-900">{activeTicketsCount}</span>
          </div>
        </div>

        {/* Metric 3: Avg Resolution MTTR */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-soft flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Turnaround MTTR</p>
            <p className="font-headline font-black text-3xl text-emerald-800">18.4 hrs</p>
            <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>4.2 hrs faster than city avg</span>
            </p>
          </div>
          {/* Circular Gauge Graphic */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-emerald-600"
                strokeDasharray="78, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-headline font-black text-xs text-slate-900">78%</span>
          </div>
        </div>

        {/* Metric 4: Critical Urgency & Breaches */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-soft flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Critical Incidents</p>
            <p className="font-headline font-black text-3xl text-rose-600">{criticalCount} Priority</p>
            <p className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              <span>Rapid Deployment Ready</span>
            </p>
          </div>
          {/* Circular Gauge Graphic */}
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-rose-500"
                strokeDasharray={`${Math.min(100, criticalCount * 25)}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-headline font-black text-xs text-rose-600">{criticalCount}</span>
          </div>
        </div>

      </div>

      {/* 3. PERFORMANCE TREND GRAPH & DYNAMIC CATEGORY BARS */}
      {currentTab === "workbench" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Performance Trend Graph (7 Cols) */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline font-bold text-base text-slate-900">
                  30-Day Operational Velocity & Turnaround Trend
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complaint Intake vs Completed Field Resolutions in {departmentName}
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-[#edf7f1] px-3 py-1 rounded-full border border-[#cbe7d7]">
                +14.8% Resolution Efficiency
              </span>
            </div>

            {/* Interactive SVG Area Curve Chart */}
            <div className="h-44 w-full relative pt-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="mintGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Grid lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />

                {/* Shaded Area */}
                <polygon
                  fill="url(#mintGrad)"
                  points="0,95 50,80 100,85 150,60 200,65 250,45 300,50 350,30 400,35 450,20 500,15 500,120 0,120"
                />

                {/* Resolutions Polyline (Green) */}
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  points="0,95 50,80 100,85 150,60 200,65 250,45 300,50 350,30 400,35 450,20 500,15"
                />

                {/* Complaint Intake Polyline (Slate dashed) */}
                <polyline
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  points="0,105 50,90 100,95 150,80 200,85 250,65 300,70 350,55 400,50 450,40 500,35"
                />
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                <span>Aug 1</span>
                <span>Aug 7</span>
                <span>Aug 14</span>
                <span>Aug 21</span>
                <span>Today (Live {deptIssues.length} Tickets)</span>
              </div>
            </div>
          </div>

          {/* Dynamic Category Breakdown Bars (4 Cols) */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-4">
            <h3 className="font-headline font-bold text-base text-slate-900">
              Department Incidents by Type
            </h3>

            <div className="space-y-3 pt-1">
              {categoryCounts.slice(0, 4).map((cat, idx) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span className="truncate">{cat.name}</span>
                    <span className="text-[#134431] shrink-0 ml-2">{cat.percentage}% ({cat.count})</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        idx === 0 ? "bg-[#134431]" : idx === 1 ? "bg-emerald-500" : idx === 2 ? "bg-amber-500" : "bg-teal-500"
                      )}
                      style={{ width: `${Math.max(8, cat.percentage)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 4. WORKBENCH TAB: SPLIT-VIEW MASTER-DETAIL WORKSPACE */}
      {currentTab === "workbench" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (40% width): Filterable Ticket Stream */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Filter Pills & Search */}
            <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by ticket #, ward, citizen..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:bg-white focus:border-[#134431] transition-all"
                />
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-bold">
                {[
                  { id: "all", label: `All (${deptIssues.length})` },
                  { id: "active", label: `⚡ Active (${activeTicketsCount})` },
                  { id: "critical", label: `🔥 Critical (${criticalCount})` },
                  { id: "overdue", label: "⏱ Overdue" },
                  { id: "resolved", label: `✓ Fixed (${resolvedCount})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setTicketFilter(tab.id as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-full transition-all whitespace-nowrap text-[11px]",
                      ticketFilter === tab.id
                        ? "bg-[#134431] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Ticket Cards List */}
            <div className="space-y-3 max-h-[640px] overflow-y-auto no-scrollbar pr-1">
              {filteredTickets.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-3xl border border-slate-100 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="font-headline font-bold text-sm text-slate-800">No tickets matching this filter</p>
                  <p className="text-xs text-slate-500">All {departmentName} issues in this view are up to date.</p>
                </div>
              ) : (
                filteredTickets.map((ticket) => {
                  const isSelected = selectedIssue?.id === ticket.id;
                  const isCritical = ticket.urgency === "Emergency" || ticket.urgency === "High";

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedIssueId(ticket.id)}
                      className={cn(
                        "p-4 rounded-3xl border transition-all cursor-pointer group space-y-2.5",
                        isSelected
                          ? "bg-[#edf7f1] border-[#134431] shadow-md ring-1 ring-[#134431]"
                          : "bg-white border-slate-100 hover:border-emerald-300 shadow-soft"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-headline font-black text-xs text-[#134431] bg-white px-2.5 py-0.5 rounded-full border border-[#cbe7d7]">
                            #{ticket.id}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                              isCritical
                                ? "bg-rose-100 text-rose-700"
                                : "bg-slate-100 text-slate-700"
                            )}
                          >
                            {ticket.urgency || "MODERATE"}
                          </span>
                        </div>

                        <span
                          className={cn(
                            "text-[10px] font-bold px-2.5 py-0.5 rounded-full",
                            ticket.status === "Resolved" || ticket.status === "Verified"
                              ? "bg-emerald-100 text-emerald-800"
                              : ticket.status === "Pending Verification"
                              ? "bg-purple-100 text-purple-800"
                              : ticket.status === "Dispatched"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-amber-100 text-amber-800"
                          )}
                        >
                          {ticket.status}
                        </span>
                      </div>

                      <h4 className="font-headline font-bold text-sm text-slate-900 leading-snug group-hover:text-[#134431] transition-colors">
                        {ticket.title}
                      </h4>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100/80">
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <MapPin className="w-3 h-3 text-[#134431] shrink-0" />
                          <span className="truncate">{typeof ticket.location === "object" ? ticket.location.address : ticket.location}</span>
                        </span>

                        <span className="font-semibold text-slate-700 text-[10px] bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                          {ticket.category}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column (60% width): Live Ticket Inspector & 5-Stage Lifecycle Hub */}
          {selectedIssue ? (
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-6">
              
              {/* Inspector Top Bar with 5-Stage Lifecycle Status Dropdown */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-headline font-black text-lg text-slate-900">
                      Ticket #{selectedIssue.id}
                    </span>
                    <span
                      className={cn(
                        "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                        selectedIssue.status === "Resolved" || selectedIssue.status === "Verified"
                          ? "bg-emerald-100 text-emerald-800"
                          : selectedIssue.status === "Pending Verification"
                          ? "bg-purple-100 text-purple-800"
                          : selectedIssue.status === "Dispatched"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-amber-100 text-amber-800"
                      )}
                    >
                      {selectedIssue.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Reported by {selectedIssue.reporter?.name || "Verified Citizen"} • {selectedIssue.createdAt ? new Date(selectedIssue.createdAt).toLocaleDateString() : "Active"}
                  </p>
                </div>

                {/* 5-Stage Lifecycle Status Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                    className="px-4 py-2 rounded-2xl bg-[#134431] hover:bg-[#0c2e21] text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    <span>Update Lifecycle Status</span>
                    <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", statusDropdownOpen && "rotate-90")} />
                  </button>

                  {statusDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 animate-fadeIn space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                        Select Operational Stage
                      </p>

                      <button
                        onClick={() => handleStatusChange("AI Verified")}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors",
                          selectedIssue.status === "AI Verified" ? "bg-amber-50 text-amber-900 font-black" : "text-slate-700"
                        )}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>1. 🤖 New AI Triage (Verified)</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange("Dispatched")}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors",
                          selectedIssue.status === "Dispatched" ? "bg-indigo-50 text-indigo-900 font-black" : "text-slate-700"
                        )}
                      >
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span>2. 🚛 Squad Dispatched</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange("In Progress")}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-slate-100 transition-colors",
                          selectedIssue.status === "In Progress" ? "bg-blue-50 text-blue-900 font-black" : "text-slate-700"
                        )}
                      >
                        <Construction className="w-3.5 h-3.5 text-blue-600" />
                        <span>3. ⚡ Field Work Active</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange("Pending Verification")}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-purple-50 transition-colors",
                          selectedIssue.status === "Pending Verification" ? "bg-purple-50 text-purple-900 font-black" : "text-slate-700"
                        )}
                      >
                        <Camera className="w-3.5 h-3.5 text-purple-600" />
                        <span>4. 📸 Resolved (Pending Citizen Verification)</span>
                      </button>

                      <button
                        onClick={() => handleStatusChange("Resolved")}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-emerald-50 transition-colors",
                          selectedIssue.status === "Resolved" ? "bg-emerald-50 text-emerald-900 font-black" : "text-slate-700"
                        )}
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>5. ✅ Citizen Verified Resolved</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Location Box */}
              <div className="space-y-2">
                <h2 className="font-headline font-bold text-lg text-slate-900 leading-snug">
                  {selectedIssue.title}
                </h2>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#134431]" />
                    <span>{typeof selectedIssue.location === "object" ? selectedIssue.location.address : selectedIssue.location}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {typeof selectedIssue.location === "object" ? `${selectedIssue.location.lat?.toFixed(4)}° N, ${selectedIssue.location.lng?.toFixed(4)}° E` : "Geo-Verified ✓"}
                  </span>
                </div>
              </div>

              {/* AI Computer Vision Triage Card */}
              <div className="p-4 rounded-2xl bg-[#edf7f1] border border-[#cbe7d7] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#134431]">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>AI Computer Vision Triage Audit</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 text-[#134431] font-bold text-[10px]">
                    {selectedIssue.aiAnalysis?.confidence || 98.4}% Confidence
                  </span>
                </div>
                <p className="font-headline font-bold text-sm text-slate-900">
                  {selectedIssue.aiAnalysis?.detectedObject || selectedIssue.title}
                </p>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  💡 <span className="font-bold">Recommended Protocol:</span> {selectedIssue.aiAnalysis?.summary || "Dispatch standard field unit with replacement materials."}
                </p>
              </div>

              {/* Photo Evidence & Complainant Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Evidence Photo */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    Field Photo Evidence
                  </label>
                  <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-100 border border-slate-200 group">
                    <img
                      src={selectedIssue.images?.reported || "https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80"}
                      alt={selectedIssue.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white font-mono text-[10px] font-bold backdrop-blur-xs">
                      IN-APP GEO STAMP
                    </div>
                  </div>
                </div>

                {/* Citizen & Squad Dispatcher */}
                <div className="space-y-4">
                  
                  {/* Complainant Box */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Complainant Context
                    </label>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-headline font-bold text-sm text-slate-900">
                          {selectedIssue.reporter?.name || "Verified Citizen"}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">
                          @{selectedIssue.reporter?.username || "citizen"}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                        <UserCheck className="w-3 h-3" />
                        <span>Aadhaar Verified ✓</span>
                      </span>
                    </div>
                  </div>

                  {/* Squad Dispatcher Selector */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Assign Municipal Response Squad
                    </label>
                    <div className="space-y-2">
                      <select
                        value={selectedSquad}
                        onChange={(e) => setSelectedSquad(e.target.value)}
                        className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none"
                      >
                        {SQUADS_ROSTER.map((sq) => (
                          <option key={sq.id} value={sq.name}>
                            {sq.name} ({sq.status})
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleDispatchSquad}
                        className="w-full py-2 rounded-xl bg-[#134431] hover:bg-[#0c2e21] text-white font-headline font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Assign Squad & Dispatch</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>

              {/* Internal Field Notes Timeline */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="font-headline font-bold text-sm text-slate-900">
                  Internal Operational Remarks & Timeline ({selectedIssue.timeline?.length || 0})
                </h4>

                <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar pr-1">
                  {selectedIssue.timeline?.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                        <span className="text-[#134431] font-bold">{item.actor || "System"}</span>
                        <span>{item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recent"}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed font-medium">
                        {item.note}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Add Note Input Form */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add internal operational remark..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:bg-white focus:border-[#134431]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#134431] hover:bg-[#0c2e21] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </form>
              </div>

            </div>
          ) : null}

        </div>
      )}

      {/* 5. DEDICATED TAB: ESCALATIONS & SLA BREACHES */}
      {currentTab === "escalations" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-headline font-black text-xl text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>SLA Breaches & Priority Escalations</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tickets exceeding guaranteed resolution benchmarks requiring immediate executive intervention.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-xs border border-rose-200">
              {deptIssues.filter(i => i.urgency === "Emergency").length} Critical Breaches
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Issue Description</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {deptIssues.filter(i => i.urgency === "Emergency" || i.urgency === "High").map((t) => (
                  <tr key={t.id} className="hover:bg-rose-50/40 transition-colors">
                    <td className="py-3 px-4 font-headline font-black text-[#134431]">#{t.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{t.title}</td>
                    <td className="py-3 px-4">{typeof t.location === "object" ? t.location.address : t.location}</td>
                    <td className="py-3 px-4 text-rose-600 font-bold">{t.urgency}</td>
                    <td className="py-3 px-4 font-bold">{t.status}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          updateIssueStatus(t.id, "In Progress", "Executive emergency supervisor intervention dispatched.");
                          alert(`Emergency supervisor alert dispatched for Ticket #${t.id}`);
                        }}
                        className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-xs transition-all"
                      >
                        Emergency Re-route
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. DEDICATED TAB: SLA CALENDAR (DYNAMIC WITH REAL DATES) */}
      {currentTab === "calendar" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-headline font-black text-xl text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-700" />
                <span>SLA Deadlines & Maintenance Schedule</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Color-coded calendar dynamically showing active ticket deadlines and scheduled ward drives.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="flex items-center gap-1 text-rose-600"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Emergency</span>
              <span className="flex items-center gap-1 text-amber-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Active SLA</span>
              <span className="flex items-center gap-1 text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Resolved</span>
            </div>
          </div>

          {/* Calendar Grid (TeamHub style) */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="font-bold text-slate-400 uppercase py-1 text-[11px]">
                {day}
              </div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
              const hasTicket = deptIssues[date % deptIssues.length];
              const isToday = date === 27;

              return (
                <div
                  key={date}
                  className={cn(
                    "p-3 rounded-2xl border text-left min-h-[76px] transition-all relative",
                    isToday
                      ? "bg-[#edf7f1] border-emerald-500 font-bold"
                      : "bg-slate-50/60 border-slate-100 hover:bg-white hover:shadow-xs"
                  )}
                >
                  <span className="font-headline font-bold text-xs text-slate-800">{date}</span>
                  {isToday && hasTicket && (
                    <div className="mt-1 space-y-1">
                      <div className="p-1 rounded bg-rose-100 text-rose-800 text-[9px] font-bold truncate">
                        #{hasTicket.id} ({hasTicket.category})
                      </div>
                    </div>
                  )}
                  {date === 28 && (
                    <div className="mt-1 space-y-1">
                      <div className="p-1 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold truncate">
                        Ward Maintenance Drive
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. DEDICATED TAB: OFFICIAL COMMUNITY ANNOUNCEMENTS COMPOSER (REAL BRIDGE) */}
      {currentTab === "announcements" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-6 max-w-3xl mx-auto">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="font-headline font-black text-xl text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-emerald-700" />
              <span>Official Community Broadcast Composer</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Publish verified municipal alerts directly into the citizen-facing Ward Feed and real-time notification stream.
            </p>
          </div>

          <form onSubmit={handlePublishAnnouncement} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Announcement Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cauvery Line Phase IV Valve Overhaul — Water Supply Notice"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:bg-white focus:border-[#134431]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Broadcast Content & Citizen Instructions
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe affected wards, expected restoration timeline, and emergency tanker helpline..."
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-[#134431] resize-none"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-[#134431] hover:bg-[#0c2e21] text-white font-headline font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              {broadcastSent ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Broadcast Dispatched to All Ward Citizens!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Official Advisory →</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* 8. DEDICATED TAB: AUDIT REPORTS & EXPORT */}
      {currentTab === "reports" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-headline font-black text-xl text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                <span>Executive Municipal Audit & Compliance Sheets</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Download verified performance logs, SLA compliance records, and contractor expenditures for administrative reviews.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-headline font-bold text-sm text-slate-900">Weekly SLA Compliance Report</h4>
              <p className="text-xs text-slate-500 font-medium">{deptIssues.length} Department Tickets • {resolvedCount} Resolved</p>
              <button
                onClick={() => alert(`Downloading ${departmentName}_SLA_Audit_Ward63.pdf`)}
                className="w-full py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-headline font-bold text-sm text-slate-900">Monthly Contractor & Squad Ledger</h4>
              <p className="text-xs text-slate-500 font-medium">BMC {departmentName} Division • Active Crew Logs</p>
              <button
                onClick={() => alert(`Downloading ${departmentName}_Squad_Expenditure.csv`)}
                className="w-full py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-headline font-bold text-sm text-slate-900">Ward Quality of Life Telemetry</h4>
              <p className="text-xs text-slate-500 font-medium">Bhubaneswar South Zone • Ward 63 Command</p>
              <button
                onClick={() => alert(`Downloading Ward_Telemetry_${departmentName}_Q3.pdf`)}
                className="w-full py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
