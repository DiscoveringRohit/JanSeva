"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";
import { ActivePollWidget } from "@/components/feed/active-poll-widget";
import {
  Building2,
  Shield,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  TrendingUp,
  Activity,
  Calendar,
  DollarSign,
  Briefcase,
  AlertCircle,
  Users,
  Sparkles,
  ArrowRight,
  Vote
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WardPage() {
  const { wardData, issues } = useApp();
  const [activeTab, setActiveTab] = useState<"overview" | "budget" | "projects" | "announcements">("overview");

  const projects = [
    {
      id: "p1",
      title: "Stormwater Drainage Conduit Overhaul (4th to 9th Cross)",
      dept: "BBMP Stormwater Drain (SWD)",
      budgetCr: 2.4,
      progress: 68,
      status: "On Schedule",
      deadline: "October 2026",
      contractor: "KMV Infrastructure Ltd",
    },
    {
      id: "p2",
      title: "Shanti Nagar Community Park Play Zone & Solar LED Retrofit",
      dept: "BBMP Parks & Renewable Cell",
      budgetCr: 0.65,
      progress: 92,
      status: "Near Completion",
      deadline: "August 2026",
      contractor: "GreenCity Urban Developers",
    },
    {
      id: "p3",
      title: "Cauvery Phase IV Potable Water Line Replacement",
      dept: "BWSSB Water Division",
      budgetCr: 3.8,
      progress: 45,
      status: "Active Work",
      deadline: "December 2026",
      contractor: "Southern Hydrotech Engineers",
    },
    {
      id: "p4",
      title: "80ft Corridor Asphalt Cold-Mix Resurfacing",
      dept: "BBMP Major Roads",
      budgetCr: 1.8,
      progress: 30,
      status: "Monsoon Paused",
      deadline: "November 2026",
      contractor: "Apex Highway Solutions",
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      
      {/* WARD HERO BANNER */}
      <div className="rounded-3xl bg-gradient-to-r from-primary-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-10 shadow-xl border border-primary-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                BBMP East Zone
              </span>
              <span className="text-xs text-white/70 font-semibold">City Ward #42</span>
            </div>

            <h1 className="font-headline font-black text-3xl sm:text-4xl text-white">
              Ward 42 • {wardData.name}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-body">
              Autonomous citizen governance portal for Shanti Nagar. Monitor corporator performance, verified municipal budget expenditure, and democratic neighborhood ballots.
            </p>
          </div>

          {/* Corporator Card */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center gap-4 shrink-0 shadow-lg">
            <img
              src={wardData.corporator.avatar}
              alt={wardData.corporator.name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-400"
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider">
                Elected Corporator
              </span>
              <p className="font-headline font-bold text-sm text-white">{wardData.corporator.name}</p>
              <p className="text-[11px] text-white/70">{wardData.corporator.party}</p>
              <div className="flex items-center gap-2 mt-1 text-[10px] text-emerald-300 font-semibold">
                <Phone className="w-3 h-3" />
                <span>{wardData.corporator.phone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* WARD HEALTH SCORE 360 */}
      <div className="rounded-3xl bg-white border border-surface-container-high p-6 sm:p-8 shadow-soft space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase font-bold text-primary-700 tracking-wider">
              Quality of Life Telemetry
            </span>
            <h2 className="font-headline font-black text-xl sm:text-2xl text-on-surface">
              Ward Health & Performance Index
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-on-surface-variant font-medium">Overall Score</p>
              <p className="text-2xl font-black text-emerald-700 font-headline">{wardData.healthScore} / 100</p>
            </div>
            <span className="px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              Rank #3 in City
            </span>
          </div>
        </div>

        {/* 4 Pillars Progress Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-dim space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-on-surface">
              <span>Cleanliness & SWM</span>
              <span className="text-emerald-700 font-extrabold">{wardData.metrics.cleanliness}%</span>
            </div>
            <div className="w-full h-2 bg-surface-dim rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${wardData.metrics.cleanliness}%` }}></div>
            </div>
            <p className="text-[10px] text-on-surface-variant">Daily Door-to-Door Waste Collection</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-dim space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-on-surface">
              <span>Roads & Drainage</span>
              <span className="text-primary-700 font-extrabold">{wardData.metrics.roads}%</span>
            </div>
            <div className="w-full h-2 bg-surface-dim rounded-full overflow-hidden">
              <div className="h-full bg-primary-600 rounded-full" style={{ width: `${wardData.metrics.roads}%` }}></div>
            </div>
            <p className="text-[10px] text-on-surface-variant">Pothole Patching & Drain Desilting</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-dim space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-on-surface">
              <span>Water Supply</span>
              <span className="text-cyan-700 font-extrabold">{wardData.metrics.water}%</span>
            </div>
            <div className="w-full h-2 bg-surface-dim rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${wardData.metrics.water}%` }}></div>
            </div>
            <p className="text-[10px] text-on-surface-variant">Cauvery Water Pressure & Purity</p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-dim space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-on-surface">
              <span>Lighting & Safety</span>
              <span className="text-amber-700 font-extrabold">{wardData.metrics.lighting}%</span>
            </div>
            <div className="w-full h-2 bg-surface-dim rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${wardData.metrics.lighting}%` }}></div>
            </div>
            <p className="text-[10px] text-on-surface-variant">Smart Streetlight Sensor Grid</p>
          </div>

        </div>
      </div>

      {/* TABS FOR BUDGET, PROJECTS, ANNOUNCEMENTS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-surface-dim pb-2 overflow-x-auto no-scrollbar">
          {[
            { id: "overview", label: "Overview & Projects" },
            { id: "budget", label: "Municipal Budget Transparency" },
            { id: "announcements", label: "Town Hall & Notices" },
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

        {/* OVERVIEW / PROJECTS VIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Active Infrastructure Projects */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Active Ward 42 Infrastructure Projects ({projects.length})
              </h3>

              <div className="space-y-3">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-5 rounded-3xl bg-white border border-surface-container-high shadow-soft space-y-3 hover:shadow-cardHover transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
                          {proj.dept}
                        </span>
                        <h4 className="font-headline font-bold text-sm sm:text-base text-on-surface mt-1">
                          {proj.title}
                        </h4>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 shrink-0">
                        ₹{proj.budgetCr} Cr
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-on-surface">
                        <span>Completion Progress</span>
                        <span className="text-primary-700 font-extrabold">{proj.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-dim rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary-600 to-emerald-500 rounded-full" style={{ width: `${proj.progress}%` }}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-on-surface-variant pt-2 border-t border-surface-dim">
                      <span>Contractor: <strong>{proj.contractor}</strong></span>
                      <span>Target: <strong className="text-on-surface">{proj.deadline}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 1 Col: Ward Active Poll & Helplines */}
            <div className="space-y-6">
              <ActivePollWidget />

              <div className="rounded-3xl bg-white border border-surface-container-high p-5 shadow-soft space-y-3">
                <h4 className="font-headline font-bold text-sm text-on-surface">Emergency Ward Directory</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between p-2 rounded-xl bg-surface-container-low">
                    <span className="font-medium text-on-surface-variant">BBMP Control Room:</span>
                    <strong className="text-primary-700">1533 / 080-22660000</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-surface-container-low">
                    <span className="font-medium text-on-surface-variant">BESCOM Electricity:</span>
                    <strong className="text-amber-700">1912</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-surface-container-low">
                    <span className="font-medium text-on-surface-variant">BWSSB Water Leakage:</span>
                    <strong className="text-cyan-700">1916</strong>
                  </div>
                  <div className="flex justify-between p-2 rounded-xl bg-surface-container-low">
                    <span className="font-medium text-on-surface-variant">Shanti Nagar Police:</span>
                    <strong className="text-rose-700">112 / 080-22942222</strong>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* BUDGET VIEW */}
        {activeTab === "budget" && (
          <div className="rounded-3xl bg-white border border-surface-container-high p-6 sm:p-8 shadow-soft space-y-6 animate-fadeIn">
            <div>
              <h3 className="font-headline font-bold text-lg text-on-surface">
                Ward 42 Fiscal Budget & Expenditure Ledger (FY 2026-27)
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Full democratic financial transparency. Every rupee allocated and spent is publicly audited.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
                <p className="text-xs font-bold text-primary-800">Total Sanctioned Budget</p>
                <p className="text-2xl font-black text-primary-900 font-headline mt-1">₹12.50 Cr</p>
                <p className="text-[10px] text-primary-700 mt-1">Allocated by City Council</p>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100">
                <p className="text-xs font-bold text-emerald-800">Utilized on Works</p>
                <p className="text-2xl font-black text-emerald-900 font-headline mt-1">₹8.90 Cr</p>
                <p className="text-[10px] text-emerald-700 mt-1">71.2% Execution Rate</p>
              </div>

              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100">
                <p className="text-xs font-bold text-amber-800">Remaining Balance</p>
                <p className="text-2xl font-black text-amber-900 font-headline mt-1">₹3.60 Cr</p>
                <p className="text-[10px] text-amber-700 mt-1">Earmarked for Monsoon Works</p>
              </div>
            </div>
          </div>
        )}

        {/* ANNOUNCEMENTS VIEW */}
        {activeTab === "announcements" && (
          <div className="space-y-4 animate-fadeIn">
            {wardData.announcements.map((ann) => (
              <div key={ann.id} className="p-6 rounded-3xl bg-white border border-surface-container-high shadow-soft space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-primary-50 text-primary-800 text-[10px] font-bold border border-primary-100">
                    {ann.category}
                  </span>
                  <span className="text-xs text-on-surface-variant font-medium">{ann.date}</span>
                </div>
                <h4 className="font-headline font-bold text-base text-on-surface">{ann.title}</h4>
                <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}
