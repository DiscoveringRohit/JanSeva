"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
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
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock operational tickets
const INITIAL_TICKETS = [
  {
    id: "JS-105",
    title: "Major Drinking Water Pipeline Rupture & Road Flooding",
    category: "Water Supply",
    severity: "CRITICAL",
    status: "dispatched",
    location: "Opposite BMC Substation, Khandagiri Ward 63",
    coordinates: "20.2598° N, 85.7824° E",
    citizen: "Rahul Verma",
    citizenPhone: "+91 98765 43210",
    verifiedCitizen: true,
    upvotes: 42,
    timeAgo: "2 hours ago",
    slaDeadline: "3h 45m left",
    slaHoursLeft: 3.75,
    isOverdue: false,
    squad: "Unit 3 - South Zone Hydrotech Van",
    aiTriage: "High Pressure Main Conduit Burst",
    aiConfidence: "98.4%",
    recommendedAction: "Dispatch 6-inch mechanical pipe clamp + vacuum suction truck.",
    photo: "https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80",
    internalNotes: [
      { author: "AI Triage System", time: "10:15 AM", text: "Computer Vision auto-classified as critical pipeline rupture. Assigned SLA: 6 Hours." },
      { author: "Officer Ananya Sen", time: "10:30 AM", text: "Dispatched Hydrotech Squad Unit 3 with suction truck. ETA 25 mins." }
    ]
  },
  {
    id: "JS-102",
    title: "Deep Pothole & Damaged Manhole Lid on Main Bus Corridor",
    category: "Roads & PWD",
    severity: "HIGH",
    status: "active",
    location: "Sector 5 Market Road, Ward 34",
    coordinates: "20.2961° N, 85.8245° E",
    citizen: "Anita Dash",
    citizenPhone: "+91 98765 11223",
    verifiedCitizen: true,
    upvotes: 28,
    timeAgo: "5 hours ago",
    slaDeadline: "1h 15m left",
    slaHoursLeft: 1.25,
    isOverdue: false,
    squad: "Unit 2 - Road Rapid Patch Van",
    aiTriage: "Severe Asphalt Cavity & Structural Rim Hazard",
    aiConfidence: "96.2%",
    recommendedAction: "Apply cold-mix asphalt patch + cast iron frame replacement.",
    photo: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80",
    internalNotes: [
      { author: "Officer Ananya Sen", time: "08:45 AM", text: "Traffic police notified to divert heavy vehicles from lane 2." }
    ]
  },
  {
    id: "JS-098",
    title: "Monsoon Storm Drain Silt Clog causing Backflow",
    category: "Drainage",
    severity: "HIGH",
    status: "new",
    location: "Khandagiri Square, Ward 63",
    coordinates: "20.2605° N, 85.7890° E",
    citizen: "Suresh Mohapatra",
    citizenPhone: "+91 94370 55667",
    verifiedCitizen: true,
    upvotes: 35,
    timeAgo: "1 day ago",
    slaDeadline: "OVERDUE (by 2h)",
    slaHoursLeft: -2.0,
    isOverdue: true,
    squad: "Unassigned",
    aiTriage: "Culvert Blockage with Solid Debris",
    aiConfidence: "93.8%",
    recommendedAction: "Deploy excavator machine and desilting squad.",
    photo: "https://images.unsplash.com/photo-1611288870280-4a307c87c95e?w=800&auto=format&fit=crop&q=80",
    internalNotes: [
      { author: "System Escalation", time: "11:00 AM", text: "Auto-escalated to Zonal Executive Engineer due to SLA breach." }
    ]
  },
  {
    id: "JS-094",
    title: "Smart Streetlight Sensor Grid Blackout across 400m Stretch",
    category: "Electricity",
    severity: "MODERATE",
    status: "dispatched",
    location: "Patia Tech Corridor, Ward 12",
    coordinates: "20.3588° N, 85.8167° E",
    citizen: "Priya Pattnaik",
    citizenPhone: "+91 98610 99887",
    verifiedCitizen: true,
    upvotes: 19,
    timeAgo: "6 hours ago",
    slaDeadline: "10h left",
    slaHoursLeft: 10.0,
    isOverdue: false,
    squad: "Unit 5 - Solar & Grid Maintenance",
    aiTriage: "Substation Phase Drop / Optical Sensor Fault",
    aiConfidence: "95.0%",
    recommendedAction: "Check feeder box 4B and replace fuse cartridge.",
    photo: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80",
    internalNotes: [
      { author: "Officer Ananya Sen", time: "09:15 AM", text: "Sensor logs checked remotely. Power feed active up to pole #14." }
    ]
  },
  {
    id: "JS-089",
    title: "Overflowing Community Garbage Bin & Road Encroachment",
    category: "Sanitation",
    severity: "MODERATE",
    status: "resolved",
    location: "Saheed Nagar Block B, Ward 34",
    coordinates: "20.2988° N, 85.8350° E",
    citizen: "Dr. Soumya Mishra",
    citizenPhone: "+91 97780 12345",
    verifiedCitizen: true,
    upvotes: 54,
    timeAgo: "2 days ago",
    slaDeadline: "Resolved in 4h 12m",
    slaHoursLeft: 0,
    isOverdue: false,
    squad: "Unit 1 - Sanitation Compactor",
    aiTriage: "Solid Waste Overflow (> 1.5 Tons)",
    aiConfidence: "99.1%",
    recommendedAction: "Dispatch compactor truck + sanitize perimeter with lime.",
    photo: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80",
    internalNotes: [
      { author: "Unit 1 Leader", time: "Yesterday 4:30 PM", text: "Waste cleared and bin sanitized. Citizen verified resolution." }
    ]
  }
];

// Mock Field Squads
const SQUADS_ROSTER = [
  { id: "sq-1", name: "Unit 1 - Rapid Response Hydro Van", leader: "Er. Bikram Rout", phone: "+91 94371 00112", status: "Available", activeTickets: 0, vehicle: "Tata Ace OD-02-B-1092", zone: "Ward 63, Khandagiri" },
  { id: "sq-2", name: "Unit 2 - Road Cold-Mix Paving Van", leader: "Er. Santosh Jena", phone: "+91 94371 00113", status: "In Field", activeTickets: 1, vehicle: "Mahindra Bolero OD-02-C-4491", zone: "Ward 34, Saheed Nagar" },
  { id: "sq-3", name: "Unit 3 - Heavy Suction & Conduit Van", leader: "Er. Rajesh Mahapatra", phone: "+91 94371 00114", status: "In Field", activeTickets: 2, vehicle: "Ashok Leyland Vacuum OD-02-F-8821", zone: "South Zone Main Lines" },
  { id: "sq-4", name: "Unit 4 - Sewerage Canal Desilter", leader: "Er. Tanmay Das", phone: "+91 94371 00115", status: "Available", activeTickets: 0, vehicle: "JCB Excavator OD-02-E-3301", zone: "Ward 12, Patia" },
  { id: "sq-5", name: "Unit 5 - Smart Grid & Sensor Crew", leader: "Er. Deepak Swain", phone: "+91 94371 00116", status: "In Field", activeTickets: 1, vehicle: "Eicher Hydraulic OD-02-K-9012", zone: "Tech Corridor" },
  { id: "sq-6", name: "Unit 6 - Emergency Night Triage Van", leader: "Er. Manoj Pradhan", phone: "+91 94371 00117", status: "Off Shift", activeTickets: 0, vehicle: "Force Emergency OD-02-M-1122", zone: "Central BMC Depot" },
];

// Mock Duplicate Clusters
const DUPLICATE_PAIRS = [
  {
    id: "dup-1",
    matchScore: 96,
    category: "Water Supply Pipeline Burst",
    location: "Khandagiri Substation Road",
    ticketA: { id: "JS-105", citizen: "Rahul Verma", time: "10:15 AM", upvotes: 42, photo: "https://images.unsplash.com/photo-1584467735815-f778f274e296?w=400&auto=format&fit=crop&q=80" },
    ticketB: { id: "JS-107", citizen: "Manish Panda", time: "10:48 AM", upvotes: 14, photo: "https://images.unsplash.com/photo-1584467735815-f778f274e296?w=400&auto=format&fit=crop&q=80" }
  },
  {
    id: "dup-2",
    matchScore: 92,
    category: "Pothole on Sector 5 Main Road",
    location: "Near Sector 5 Bus Stop",
    ticketA: { id: "JS-102", citizen: "Anita Dash", time: "08:30 AM", upvotes: 28, photo: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&auto=format&fit=crop&q=80" },
    ticketB: { id: "JS-109", citizen: "Debashis Ray", time: "09:12 AM", upvotes: 11, photo: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&auto=format&fit=crop&q=80" }
  }
];

// Mock Citizen Consensus Polls
const WARD_POLLS = [
  {
    id: "poll-1",
    title: "24x7 Pressurized Smart Water Metering Proposal for Ward 63",
    description: "Proposed digital ultrasonic flow meters with automatic leak detection alerts for Khandagiri residents.",
    votesYes: 482,
    votesNo: 68,
    totalVotes: 550,
    status: "Active Public Voting",
    daysRemaining: 4,
    category: "Water Supply"
  },
  {
    id: "poll-2",
    title: "Installation of Solar LED Pedestrian High-Masts near School Zones",
    description: "Deployment of 12 solar-backed smart illumination poles with emergency SOS call buttons.",
    votesYes: 612,
    votesNo: 24,
    totalVotes: 636,
    status: "Approved by Citizen Consensus",
    daysRemaining: 0,
    category: "Electricity"
  }
];

export default function DepartmentOfficerPage() {
  const { user } = useApp();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const departmentSlug = params.department as string;
  const currentTab = searchParams.get("tab") || "workbench";

  const [tickets, setTickets] = useState(INITIAL_TICKETS);
  const [selectedTicket, setSelectedTicket] = useState(INITIAL_TICKETS[0]);
  const [ticketFilter, setTicketFilter] = useState<"all" | "active" | "critical" | "overdue" | "resolved">("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [newNote, setNewNote] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [selectedSquadForDispatch, setSelectedSquadForDispatch] = useState("Unit 3 - South Zone Hydrotech Van");

  const departmentName = departmentSlug
    ? departmentSlug.charAt(0).toUpperCase() + departmentSlug.slice(1)
    : "Water";

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (ticketFilter === "active" && t.status !== "active" && t.status !== "dispatched") return false;
    if (ticketFilter === "critical" && t.severity !== "CRITICAL") return false;
    if (ticketFilter === "overdue" && !t.isOverdue) return false;
    if (ticketFilter === "resolved" && t.status !== "resolved") return false;
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchId = t.id.toLowerCase().includes(q);
      const matchLoc = t.location.toLowerCase().includes(q);
      const matchCitizen = t.citizen.toLowerCase().includes(q);
      if (!matchTitle && !matchId && !matchLoc && !matchCitizen) return false;
    }
    return true;
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const noteObj = {
      author: user?.name || "Officer Ananya Sen",
      time: "Just now",
      text: newNote.trim()
    };
    setSelectedTicket((prev) => ({
      ...prev,
      internalNotes: [...prev.internalNotes, noteObj]
    }));
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedTicket.id ? { ...t, internalNotes: [...t.internalNotes, noteObj] } : t))
    );
    setNewNote("");
  };

  const handleUpdateStatus = (newStatus: string) => {
    setSelectedTicket((prev) => ({ ...prev, status: newStatus as any }));
    setTickets((prev) =>
      prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: newStatus as any } : t))
    );
  };

  const handleDispatchSquad = () => {
    setSelectedTicket((prev) => ({ ...prev, status: "dispatched" as any, squad: selectedSquadForDispatch }));
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id ? { ...t, status: "dispatched" as any, squad: selectedSquadForDispatch } : t
      )
    );
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle.trim() || !announcementText.trim()) return;
    setBroadcastSent(true);
    setTimeout(() => {
      setBroadcastSent(false);
      setAnnouncementTitle("");
      setAnnouncementText("");
    }, 3000);
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
              Live Hub
            </span>
          </h1>
        </div>

        {/* Right Status Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#edf7f1] border border-[#cbe7d7] text-xs font-bold text-[#134431]">
            <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Telemetry: 100% Operational</span>
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

      {/* 2. TEAMHUB RADIAL DONUT GAUGES & OPERATIONAL METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: SLA Compliance Donut */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-soft flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">SLA Compliance</p>
            <p className="font-headline font-black text-3xl text-slate-900">94.2%</p>
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
                strokeDasharray="94.2, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-headline font-black text-xs text-slate-900">94%</span>
          </div>
        </div>

        {/* Metric 2: Active Workload Donut */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-soft flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Queue</p>
            <p className="font-headline font-black text-3xl text-slate-900">8 Tickets</p>
            <p className="text-[11px] font-semibold text-[#134431]">
              5 Dispatched • 3 In Triage
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
                strokeDasharray="65, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-headline font-black text-xs text-slate-900">65%</span>
          </div>
        </div>

        {/* Metric 3: Avg Resolution MTTR */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-soft flex items-center justify-between hover:shadow-md transition-all">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Resolution Time</p>
            <p className="font-headline font-black text-3xl text-emerald-800">18.4 hrs</p>
            <p className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>4.2 hrs faster this week</span>
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
            <p className="font-headline font-black text-3xl text-rose-600">2 Priority</p>
            <p className="text-[11px] font-semibold text-rose-700 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              <span>1 SLA Escalation Active</span>
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
                strokeDasharray="25, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-headline font-black text-xs text-rose-600">2</span>
          </div>
        </div>

      </div>

      {/* 3. PERFORMANCE TREND LINE CHART & CATEGORY BREAKDOWN BARS */}
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
                  Complaint Intake vs Completed Field Resolutions
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
                <span>Today (Peak 98.4%)</span>
              </div>
            </div>
          </div>

          {/* Category Distribution Bar (4 Cols) */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-4">
            <h3 className="font-headline font-bold text-base text-slate-900">
              Department Incidents by Type
            </h3>

            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Pipeline Bursts & Leaks</span>
                  <span className="text-[#134431]">48%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#134431] rounded-full" style={{ width: "48%" }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Drain Desilting & Sluice</span>
                  <span className="text-emerald-600">26%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "26%" }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Manhole & Sewer Lid Repairs</span>
                  <span className="text-amber-600">18%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "18%" }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Water Pressure Telemetry</span>
                  <span className="text-teal-600">8%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: "8%" }}></div>
                </div>
              </div>
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
                  { id: "all", label: `All (${tickets.length})` },
                  { id: "active", label: "⚡ Active" },
                  { id: "critical", label: "🔥 Critical" },
                  { id: "overdue", label: "⏱ Overdue" },
                  { id: "resolved", label: "✓ Fixed" }
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
              {filteredTickets.map((ticket) => {
                const isSelected = selectedTicket.id === ticket.id;

                return (
                  <div
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
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
                            ticket.severity === "CRITICAL"
                              ? "bg-rose-100 text-rose-700"
                              : ticket.severity === "HIGH"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 text-slate-700"
                          )}
                        >
                          {ticket.severity}
                        </span>
                      </div>

                      <span
                        className={cn(
                          "text-[10px] font-bold px-2.5 py-0.5 rounded-full",
                          ticket.isOverdue
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {ticket.slaDeadline}
                      </span>
                    </div>

                    <h4 className="font-headline font-bold text-sm text-slate-900 leading-snug group-hover:text-[#134431] transition-colors">
                      {ticket.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100/80">
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-[#134431] shrink-0" />
                        <span className="truncate">{ticket.location}</span>
                      </span>

                      <span className="font-semibold text-slate-700 text-[10px] bg-white/80 px-2 py-0.5 rounded-md border border-slate-200">
                        {ticket.squad}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (60% width): Live Ticket Inspector & Triage Hub */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-6">
            
            {/* Inspector Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-headline font-black text-lg text-slate-900">
                    Ticket #{selectedTicket.id}
                  </span>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase",
                      selectedTicket.status === "resolved"
                        ? "bg-emerald-100 text-emerald-800"
                        : selectedTicket.status === "dispatched"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {selectedTicket.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Reported by {selectedTicket.citizen} • {selectedTicket.timeAgo}
                </p>
              </div>

              {/* Status Update Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleUpdateStatus("active")}
                  className="px-3.5 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                >
                  ⚡ Active
                </button>
                <button
                  onClick={() => handleUpdateStatus("resolved")}
                  className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              </div>
            </div>

            {/* Title & Location Box */}
            <div className="space-y-2">
              <h2 className="font-headline font-bold text-lg text-slate-900 leading-snug">
                {selectedTicket.title}
              </h2>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#134431]" />
                  <span>{selectedTicket.location}</span>
                </div>
                <span className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                  {selectedTicket.coordinates}
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
                  {selectedTicket.aiConfidence} Confidence
                </span>
              </div>
              <p className="font-headline font-bold text-sm text-slate-900">
                {selectedTicket.aiTriage}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                💡 <span className="font-bold">Recommended Protocol:</span> {selectedTicket.recommendedAction}
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
                    src={selectedTicket.photo}
                    alt={selectedTicket.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white font-mono text-[10px] font-bold backdrop-blur-xs">
                    GPS STAMP: {selectedTicket.coordinates}
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
                        {selectedTicket.citizen}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {selectedTicket.citizenPhone}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 border border-emerald-200">
                      <UserCheck className="w-3 h-3" />
                      <span>Verified ✓</span>
                    </span>
                  </div>
                </div>

                {/* Squad Dispatcher Selector */}
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Assigned Field Squad
                  </label>
                  <div className="space-y-2">
                    <select
                      value={selectedSquadForDispatch}
                      onChange={(e) => setSelectedSquadForDispatch(e.target.value)}
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
                      <span>Update Dispatch Squad</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

            {/* Internal Field Notes Timeline */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="font-headline font-bold text-sm text-slate-900">
                Internal Operational Remarks & Squad Log ({selectedTicket.internalNotes.length})
              </h4>

              <div className="space-y-2 max-h-36 overflow-y-auto no-scrollbar pr-1">
                {selectedTicket.internalNotes.map((note, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span className="text-[#134431]">{note.author}</span>
                      <span>{note.time}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed font-medium">
                      {note.text}
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
              1 Active SLA Breach
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">Ticket</th>
                  <th className="py-3 px-4">Issue Description</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Overdue Duration</th>
                  <th className="py-3 px-4">Assigned Squad</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr className="hover:bg-rose-50/40 transition-colors">
                  <td className="py-3 px-4 font-headline font-black text-[#134431]">#JS-098</td>
                  <td className="py-3 px-4 font-bold text-slate-900">Monsoon Storm Drain Silt Clog causing Backflow</td>
                  <td className="py-3 px-4">Khandagiri Square, Ward 63</td>
                  <td className="py-3 px-4 text-rose-600 font-bold">⏱ 2 hours 15 mins Overdue</td>
                  <td className="py-3 px-4 text-amber-700 font-bold">Unassigned</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => alert("Supervisor Alert & Emergency Re-route Dispatched!")}
                      className="px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] shadow-xs transition-all"
                    >
                      Emergency Dispatch
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. DEDICATED TAB: AI DUPLICATE REVIEW QUEUE */}
      {currentTab === "duplicates" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-headline font-black text-xl text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-600" />
                <span>AI Computer Vision Duplicate Review Queue</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Merge identical complaints from multiple citizens to avoid redundant squad deployments.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200">
              {DUPLICATE_PAIRS.length} Pairs Awaiting Review
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DUPLICATE_PAIRS.map((dup) => (
              <div key={dup.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-sm text-slate-900">{dup.category}</span>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-[#134431] font-black text-xs border border-emerald-200">
                    {dup.matchScore}% Image Match
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5 p-2 rounded-2xl bg-white border border-slate-200/80">
                    <img src={dup.ticketA.photo} alt="A" className="w-full aspect-[4/3] object-cover rounded-xl" />
                    <p className="font-headline font-black text-xs text-[#134431]">#{dup.ticketA.id} (Parent)</p>
                    <p className="text-[10px] text-slate-500">{dup.ticketA.citizen} • {dup.ticketA.upvotes} upvotes</p>
                  </div>

                  <div className="space-y-1.5 p-2 rounded-2xl bg-white border border-slate-200/80">
                    <img src={dup.ticketB.photo} alt="B" className="w-full aspect-[4/3] object-cover rounded-xl" />
                    <p className="font-headline font-black text-xs text-amber-700">#{dup.ticketB.id} (Candidate)</p>
                    <p className="text-[10px] text-slate-500">{dup.ticketB.citizen} • {dup.ticketB.upvotes} upvotes</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <button
                    onClick={() => alert(`Merged #${dup.ticketB.id} into #${dup.ticketA.id}. Total upvotes merged: ${dup.ticketA.upvotes + dup.ticketB.upvotes}`)}
                    className="px-4 py-2 rounded-full bg-[#134431] hover:bg-[#0c2e21] text-white font-bold text-xs shadow-xs transition-all"
                  >
                    Merge as Duplicate ✓
                  </button>
                  <button
                    onClick={() => alert(`Kept #${dup.ticketB.id} as a distinct separate ticket.`)}
                    className="px-4 py-2 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-all"
                  >
                    Keep Distinct ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. DEDICATED TAB: FIELD SQUAD & CREW DISPATCH */}
      {currentTab === "squads" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-headline font-black text-xl text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#134431]" />
                <span>Field Squads & Equipment Roster</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active municipal response vehicles, assigned engineers, and operational capacity.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-[#134431] font-bold text-xs border border-emerald-200">
              5 of 6 Squads Deployed
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SQUADS_ROSTER.map((sq) => (
              <div key={sq.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-headline font-bold text-sm text-slate-900">{sq.name}</span>
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                      sq.status === "Available"
                        ? "bg-emerald-100 text-emerald-800"
                        : sq.status === "In Field"
                        ? "bg-indigo-100 text-indigo-800"
                        : "bg-slate-200 text-slate-700"
                    )}
                  >
                    {sq.status}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 font-medium">
                  <p>👤 <span className="font-bold text-slate-800">Leader:</span> {sq.leader}</p>
                  <p>📞 <span className="font-bold text-slate-800">Phone:</span> {sq.phone}</p>
                  <p>🚛 <span className="font-bold text-slate-800">Vehicle:</span> {sq.vehicle}</p>
                  <p>📍 <span className="font-bold text-slate-800">Zone:</span> {sq.zone}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Active Load: {sq.activeTickets} Tickets</span>
                  <button
                    onClick={() => alert(`Calling ${sq.leader} at ${sq.phone}...`)}
                    className="px-3 py-1 rounded-full bg-[#134431] text-white text-[11px] font-bold"
                  >
                    Call Unit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. DEDICATED TAB: SLA CALENDAR */}
      {currentTab === "calendar" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-headline font-black text-xl text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-700" />
                <span>SLA Deadlines & Maintenance Schedule</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Color-coded calendar showing ticket due dates and planned ward infrastructure drives.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span className="flex items-center gap-1 text-rose-600"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Critical SLA</span>
              <span className="flex items-center gap-1 text-amber-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate</span>
              <span className="flex items-center gap-1 text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Maintenance</span>
            </div>
          </div>

          {/* Calendar Grid (TeamHub style) */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="font-bold text-slate-400 uppercase py-1 text-[11px]">
                {day}
              </div>
            ))}
            {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => (
              <div
                key={date}
                className={cn(
                  "p-3 rounded-2xl border text-left min-h-[72px] transition-all relative",
                  date === 24
                    ? "bg-[#edf7f1] border-emerald-500 font-bold"
                    : "bg-slate-50/60 border-slate-100 hover:bg-white hover:shadow-xs"
                )}
              >
                <span className="font-headline font-bold text-xs text-slate-800">{date}</span>
                {date === 24 && (
                  <div className="mt-1 space-y-1">
                    <div className="p-1 rounded bg-rose-100 text-rose-800 text-[9px] font-bold truncate">
                      #JS-105 (3h SLA)
                    </div>
                  </div>
                )}
                {date === 25 && (
                  <div className="mt-1 space-y-1">
                    <div className="p-1 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold truncate">
                      Drain Desilting
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 9. DEDICATED TAB: CITIZEN CONSENSUS POLLS */}
      {currentTab === "polls" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-headline font-black text-xl text-slate-900 flex items-center gap-2">
                <Vote className="w-5 h-5 text-[#134431]" />
                <span>Citizen Consensus Telemetry & Ward Polls</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time democratic ballots from verified residents guiding department capital expenditure.
              </p>
            </div>
            <button
              onClick={() => alert("Create New Ward Citizen Poll modal")}
              className="px-4 py-2 rounded-full bg-[#134431] text-white text-xs font-bold shadow-xs hover:bg-[#0c2e21] transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Launch New Poll</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {WARD_POLLS.map((poll) => {
              const yesPercent = Math.round((poll.votesYes / poll.totalVotes) * 100);

              return (
                <div key={poll.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#134431] font-bold text-[10px] border border-emerald-200">
                      {poll.category}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">
                      {poll.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-headline font-bold text-base text-slate-900 leading-snug">
                      {poll.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                      {poll.description}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-emerald-700">{yesPercent}% In Favor ({poll.votesYes} Votes)</span>
                      <span className="text-slate-400">{100 - yesPercent}% Against</span>
                    </div>
                    <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                      <div className="h-full bg-[#134431]" style={{ width: `${yesPercent}%` }}></div>
                      <div className="h-full bg-rose-400" style={{ width: `${100 - yesPercent}%` }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 10. DEDICATED TAB: OFFICIAL COMMUNITY ANNOUNCEMENTS COMPOSER */}
      {currentTab === "announcements" && (
        <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-soft space-y-6 max-w-3xl mx-auto">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="font-headline font-black text-xl text-slate-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-emerald-700" />
              <span>Official Community Broadcast Composer</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Publish verified municipal alerts directly into the citizen-facing Ward Feed and notification stream.
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
                  <span>Broadcast Published to Citizen Feed!</span>
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

      {/* 11. DEDICATED TAB: AUDIT REPORTS & EXPORT */}
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
              <p className="text-xs text-slate-500 font-medium">Aug 18 - Aug 25 • 42 Resolved Tickets</p>
              <button
                onClick={() => alert("Downloading Weekly_SLA_Audit_Ward63.pdf")}
                className="w-full py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-headline font-bold text-sm text-slate-900">Monthly Contractor & Squad Ledger</h4>
              <p className="text-xs text-slate-500 font-medium">July 2026 • ₹8.90 Cr Utilized</p>
              <button
                onClick={() => alert("Downloading Monthly_Squad_Expenditure.csv")}
                className="w-full py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100 flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV</span>
              </button>
            </div>

            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-headline font-bold text-sm text-slate-900">Ward Quality of Life Telemetry</h4>
              <p className="text-xs text-slate-500 font-medium">Bhubaneswar South Zone • Rank #3</p>
              <button
                onClick={() => alert("Downloading Ward_Telemetry_Q3.pdf")}
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
