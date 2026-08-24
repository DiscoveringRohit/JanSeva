"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";
import { IssueCard } from "@/components/feed/issue-card";
import {
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  MapPin,
  Bot,
  Building2,
  Users,
  Award,
  CheckCircle2,
  PhoneCall,
  Activity,
  Flame
} from "lucide-react";

export default function LandingPage() {
  const { issues, wardData } = useApp();

  return (
    <div className="space-y-16 animate-fadeIn">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary-900 via-primary-800 to-indigo-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-primary-700/50">
        
        {/* Background Glows */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: "8s" }} />
            <span>JanSeva 2.0 • AI-Powered Civic Social Architecture</span>
          </div>

          <h1 className="font-headline font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-white">
            Transform Your City with <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-indigo-200 bg-clip-text text-transparent">AI-Powered Civic Action</span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-white/80 leading-relaxed max-w-2xl font-body">
            JanSeva turns bureaucratic grievance filing into a high-signal social network. Capture photos with computer vision, track resolution SLAs live on the map, and vote with neighbors to verify municipal repairs.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/report"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-primary-900 font-headline font-bold text-xs sm:text-sm shadow-xl hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-primary-600" />
              <span>AI Quick Snap Report</span>
            </Link>

            <Link
              href="/feed"
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-primary-700/60 hover:bg-primary-700 border border-white/20 text-white font-headline font-bold text-xs sm:text-sm backdrop-blur-md transition-all hover:scale-102"
            >
              <span>Explore Ward Feed</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/officer"
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-black/40 hover:bg-black/60 border border-white/10 text-white/90 font-headline font-semibold text-xs transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Officer Ops Center</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/15">
            <div>
              <p className="font-headline font-extrabold text-2xl sm:text-3xl text-white">14,280+</p>
              <p className="text-[11px] text-white/70 font-medium">Issues Resolved</p>
            </div>
            <div>
              <p className="font-headline font-extrabold text-2xl sm:text-3xl text-emerald-400">92.4%</p>
              <p className="text-[11px] text-white/70 font-medium">Ward SLA Compliance</p>
            </div>
            <div>
              <p className="font-headline font-extrabold text-2xl sm:text-3xl text-cyan-300">18.4 hrs</p>
              <p className="text-[11px] text-white/70 font-medium">Avg. Fix Time</p>
            </div>
            <div>
              <p className="font-headline font-extrabold text-2xl sm:text-3xl text-amber-300">48 Wards</p>
              <p className="text-[11px] text-white/70 font-medium">Connected Across City</p>
            </div>
          </div>

        </div>
      </section>

      {/* THREE PILLARS SHOWCASE */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs uppercase font-extrabold text-primary-700 tracking-widest">
            Engineering Civic Excellence
          </span>
          <h2 className="font-headline font-black text-2xl sm:text-3xl text-on-surface">
            How JanSeva Reinvents Public Governance
          </h2>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Built for modern citizens who demand transparency, speed, and real-time civic accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <div className="rounded-3xl bg-white border border-surface-container-high p-6 shadow-soft hover:shadow-cardHover transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-primary-600 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-lg text-on-surface">
              Neural AI Computer Vision
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Upload a snapshot of a pothole or sewage leak. JanSeva’s neural model auto-classifies severity, tags the exact municipal department, and initiates SLA clock within 3 seconds.
            </p>
            <div className="pt-2 text-xs font-bold text-primary-600 flex items-center gap-1">
              <span>98.6% Precision Rate</span>
              <span>✓</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="rounded-3xl bg-white border border-surface-container-high p-6 shadow-soft hover:shadow-cardHover transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-lg text-on-surface">
              Ward 360° Transparency
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Track your local corporator’s budget allocation, ongoing road repairs, water supply timings, and vote on neighborhood pedestrian green zone proposals.
            </p>
            <div className="pt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
              <span>Live Municipal Budget Ledger</span>
              <span>✓</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="rounded-3xl bg-white border border-surface-container-high p-6 shadow-soft hover:shadow-cardHover transition-all space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-headline font-bold text-lg text-on-surface">
              Civic Citizen XP & Verification
            </h3>
            <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              Earn XP for reporting verified hazards and participating in satisfaction polls. A ticket is only marked completed when neighborhood citizens confirm the fix.
            </p>
            <div className="pt-2 text-xs font-bold text-purple-700 flex items-center gap-1">
              <span>Democratic Citizen Audit</span>
              <span>✓</span>
            </div>
          </div>

        </div>
      </section>

      {/* LIVE FEED PREVIEW SECTION */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase font-extrabold text-primary-700 tracking-wider">
              Live Community Radar
            </span>
            <h2 className="font-headline font-black text-2xl sm:text-3xl text-on-surface">
              Recent Issues in Ward 42 (Shanti Nagar)
            </h2>
          </div>
          <Link
            href="/feed"
            className="flex items-center gap-1 text-xs font-bold text-primary-600 hover:text-primary-800 hover:underline"
          >
            <span>View All Live Reports ({issues.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {issues.slice(0, 4).map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </section>

      {/* MUNICIPAL CALL TO ACTION FOOTER */}
      <section className="rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-primary-950 text-white p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-emerald-700/40">
        <div className="space-y-2 max-w-xl text-center md:text-left">
          <h3 className="font-headline font-extrabold text-2xl sm:text-3xl text-white">
            Ready to Empower Your Neighborhood?
          </h3>
          <p className="text-xs sm:text-sm text-white/80">
            Join 12,000+ active citizens in Ward 42 making our streets safer, cleaner, and better maintained.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/report"
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-headline font-bold text-xs shadow-lg transition-all"
          >
            Submit an Issue Now
          </Link>
          <Link
            href="/ward"
            className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-headline font-semibold text-xs backdrop-blur transition-all"
          >
            View Ward 42 Dashboard
          </Link>
        </div>
      </section>

    </div>
  );
}
