"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
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
  Vote,
  Droplet,
  Construction,
  Zap,
  Trees,
  Star,
  Clock,
  Heart,
  Send,
  Check,
  ShieldCheck,
  Award,
  Compass,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WardPage() {
  const router = useRouter();
  const { wardData, user, issues } = useApp();
  const [scrollOffsetY, setScrollOffsetY] = useState(0);

  // Parallax scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrollOffsetY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Visual Audit Hotspot Gallery (Dynamic from Live Issues)
  const auditGallery = React.useMemo(() => {
    if (!issues || issues.length === 0) return [];
    return issues.slice(0, 5).map((issue, idx) => ({
      id: issue.id || `g${idx + 1}`,
      title: issue.title,
      tag: `${issue.category} ${issue.status}`,
      status: issue.status === "Verified Resolved" ? "Verified ✓" : issue.status,
      image: issue.images?.resolved || issue.images?.reported || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
    }));
  }, [issues]);

  // Citizen Testimonials
  const citizenReviews = [
    {
      quote: "The chronic drainage block near 5th cross was cleared in 12 hours after 40 residents upvoted on JanSeva. Remarkable transparency from our corporator!",
      author: "Dr. Soumya Mishra",
      role: "Khandagiri Resident & Physician",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    },
    {
      quote: "Finally a platform where our corporator directly updates daily progress with before-and-after photos of road asphalt paving.",
      author: "Amitav Ray",
      role: "Khandagiri Resident Association",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
    },
    {
      quote: "AI auto-routing directly to BMC Water Works saved our street from severe monsoon water logging. Best civic tool we have ever used.",
      author: "Priya Pattnaik",
      role: "Local Business Owner",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
    }
  ];

  return (
    <div className="overflow-x-hidden space-y-0 animate-fadeIn pb-20 -mx-4 sm:-mx-6 lg:-mx-8">

      {/* 1. CINEMATIC PARALLAX HERO SECTION (Image 1 Style) */}
      <section className="relative min-h-[580px] sm:min-h-[640px] flex items-center justify-center overflow-hidden bg-slate-950 text-white px-6 sm:px-12 py-16">

        {/* Parallax Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center pointer-events-none opacity-45 scale-105 transition-transform duration-75 ease-out"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&auto=format&fit=crop&q=80')`,
            transform: `translateY(${scrollOffsetY * 0.25}px)`
          }}
        />

        {/* Ambient Overlay Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/30" />
        <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">

          {/* Top Label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-emerald-300 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span className="tracking-widest uppercase text-[11px]">
              KHANDAGIRI ZONE • PIN 751030 • BHUBANESWAR
            </span>
          </div>

          {/* Big Editorial Headline */}
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-200/80 font-bold">
              Measuring Impact. Preserving Transparency.
            </p>
            <h1 className="font-headline font-black text-4xl sm:text-6xl lg:text-7xl tracking-tight leading-tight text-white">
              Immersive Civic 360°
            </h1>
            <p className="font-serif italic text-2xl sm:text-4xl text-emerald-300 drop-shadow-md">
              Through Community Eyes
            </p>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Explore live neighborhood telemetry, public municipal budget allocations, SLA resolution benchmarks, and verified community stewardship in Khandagiri (PIN 751030).
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                document.getElementById("corporator-about-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-3.5 rounded-full bg-[#f06424] hover:bg-[#d95214] text-white font-headline font-bold text-xs shadow-xl shadow-orange-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Explore Ward Metrics</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/map"
              className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-headline font-bold text-xs backdrop-blur-md border border-white/20 transition-all hover:scale-105 active:scale-95"
            >
              Open Live 360° Map
            </Link>
          </div>

        </div>

      </section>

      {/* 2. LAYERED PARCHMENT ABOUT SECTION (Meet Your Corporator - Image 2 Style) */}
      <section id="corporator-about-section" className="relative bg-[#fcfaf7] text-slate-900 px-6 sm:px-12 py-16 sm:py-20 border-y border-[#eadfcb] shadow-inner overflow-hidden">

        {/* Faint Stamp Watermark */}
        <div className="absolute top-12 right-12 w-48 h-48 rounded-full border-4 border-dashed border-[#d8c7a8]/50 flex items-center justify-center pointer-events-none rotate-12 opacity-60">
          <div className="text-center text-[#9b835e] font-serif uppercase tracking-widest text-[10px] font-bold">
            Municipal Citizen Council<br />
            ★ PIN 751030 ★<br />
            Verified Seal
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">

          {/* Left Narrative Letter */}
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs uppercase font-bold tracking-widest text-[#134431] flex items-center gap-1.5">
              <span>About Khandagiri Leadership</span>
              <span>—</span>
            </span>

            <h2 className="font-headline font-black text-2xl sm:text-4xl text-slate-900 leading-tight">
              Hi, I'm Smt. Rajeshwari N. <br />
              <span className="font-serif italic font-normal text-[#134431]">
                A public servant dedicated to a cleaner, safer community.
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Civic governance is more than roads and pipes—it is how we connect as neighbors. From resolving chronic monsoon water logging to modernizing our street lighting into a sensor-driven solar LED grid, our council ensures every single citizen ticket is publicly auditable with guaranteed SLA timers.
            </p>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              With JanSeva AI, our field engineers and corporator office review real-time resident upvotes daily, fast-tracking critical repairs and maintaining total financial transparency.
            </p>

            {/* Signature & CTA */}
            <div className="pt-3 flex flex-wrap items-center justify-between gap-4 border-t border-[#eadfcb]">
              <div>
                <p className="font-serif italic text-xl sm:text-2xl text-[#134431] font-bold">
                  Smt. Rajeshwari N.
                </p>
                <p className="text-[11px] text-slate-500 font-medium">
                  Elected Corporator • Khandagiri (PIN 751030), BMC Bhubaneswar
                </p>
              </div>

              <button
                onClick={() => {
                  document.getElementById("ward-contact-section")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="px-6 py-3 rounded-full bg-[#134431] hover:bg-[#0c2e21] text-white font-headline font-bold text-xs shadow-md transition-all hover:scale-105 active:scale-95"
              >
                Contact Corporator →
              </button>
            </div>
          </div>

          {/* Right Taped Polaroid Photo Frame */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative bg-white p-4 pb-6 rounded-2xl shadow-2xl border border-slate-200 rotate-1 hover:rotate-0 transition-transform duration-300 max-w-sm w-full">

              {/* Tape Effect on Top */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-7 bg-amber-100/80 backdrop-blur-xs border border-amber-200/60 shadow-xs -rotate-2 rounded-xs"></div>

              {/* Photo */}
              <div className="rounded-xl overflow-hidden aspect-[4/5] w-full bg-slate-100 mb-3 shadow-inner">
                <img
                  src={wardData.corporator.avatar || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80"}
                  alt={wardData.corporator.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Polaroid Caption */}
              <div className="text-center space-y-1">
                <p className="font-serif italic text-base font-bold text-slate-800">
                  {wardData.corporator.name}
                </p>
                <p className="text-[11px] font-semibold text-[#134431]">
                  Ward Citizen Council • Office Open 9 AM - 6 PM
                </p>
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* 3. DARK FOREST GREEN SERVICES SECTION (Civic Infrastructure Telemetry - Image 3 Style) */}
      <section className="bg-[#134431] text-white px-6 sm:px-12 py-16 sm:py-20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto space-y-12 relative z-10">

          {/* Section Header */}
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-emerald-300">
              WHAT WE TRACK & DELIVER
            </span>
            <h2 className="font-headline font-black text-2xl sm:text-4xl text-white">
              Thoughtful Governance for Meaningful Impact
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80">
              Live telemetry monitoring across key municipal sectors with automated escalation SLAs.
            </p>
          </div>

          {/* 4 Infrastructure Pillar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Pillar 1: Water */}
            <div className="rounded-3xl p-6 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                <Droplet className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-emerald-200">
                  <span>Health Index</span>
                  <span className="text-cyan-300 font-mono text-sm">{wardData.metrics.water}%</span>
                </div>
                <h3 className="font-headline font-bold text-lg text-white">
                  Water & Drainage
                </h3>
                <p className="text-xs text-emerald-100/70 leading-relaxed">
                  Cauvery line pressure monitoring, potable purity checks, and desilted stormwater storm canals.
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-cyan-200 font-semibold">
                <span>Avg SLA: ~12h</span>
                <span>Active Work ✓</span>
              </div>
            </div>

            {/* Pillar 2: Roads */}
            <div className="rounded-3xl p-6 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                <Construction className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-emerald-200">
                  <span>Health Index</span>
                  <span className="text-amber-300 font-mono text-sm">{wardData.metrics.roads}%</span>
                </div>
                <h3 className="font-headline font-bold text-lg text-white">
                  Roads & Pavement
                </h3>
                <p className="text-xs text-emerald-100/70 leading-relaxed">
                  Pothole patching, cold-mix asphalt overlay, and pedestrian footpath paving across main junctions.
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-200 font-semibold">
                <span>Avg SLA: ~24h</span>
                <span>Active Work ✓</span>
              </div>
            </div>

            {/* Pillar 3: Lighting */}
            <div className="rounded-3xl p-6 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-emerald-200">
                  <span>Health Index</span>
                  <span className="text-emerald-300 font-mono text-sm">{wardData.metrics.lighting}%</span>
                </div>
                <h3 className="font-headline font-bold text-lg text-white">
                  Smart Electricity
                </h3>
                <p className="text-xs text-emerald-100/70 leading-relaxed">
                  Solar sensor streetlight grid, automated blackout detection, and rapid transformer maintenance.
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-200 font-semibold">
                <span>Avg SLA: ~6h</span>
                <span>100% Grid ✓</span>
              </div>
            </div>

            {/* Pillar 4: Parks */}
            <div className="rounded-3xl p-6 bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all duration-300 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform">
                <Trees className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs font-bold text-emerald-200">
                  <span>Health Index</span>
                  <span className="text-teal-300 font-mono text-sm">{wardData.metrics.cleanliness}%</span>
                </div>
                <h3 className="font-headline font-bold text-lg text-white">
                  Cleanliness & Green
                </h3>
                <p className="text-xs text-emerald-100/70 leading-relaxed">
                  Door-to-door segregated waste clearing, community park landscaping, and urban arbor canopy.
                </p>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-teal-200 font-semibold">
                <span>Daily 6 AM</span>
                <span>Clean Air ✓</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. VISUAL AUDIT & LIVE HOTSPOTS (5-Column Photo Showcase - Image 4 Style) */}
      <section className="bg-white text-slate-900 px-6 sm:px-12 py-16 sm:py-20 space-y-8">

        {/* Section Header */}
        <div className="text-center space-y-1 max-w-xl mx-auto">
          <span className="text-xs uppercase font-bold tracking-widest text-[#134431]">
            MUNICIPAL AUDIT GALLERY
          </span>
          <h2 className="font-headline font-black text-2xl sm:text-4xl text-slate-900">
            A Glimpse into Our Ward Progress
          </h2>
          <p className="text-xs text-slate-500">
            Live before-and-after photographic records submitted by field officers and verified by citizens.
          </p>
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {auditGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => router.push("/map")}
              className="rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[4/3] sm:aspect-[3/4] w-full overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/90 text-slate-900 text-[10px] font-bold shadow-xs">
                  {item.status}
                </div>
                <div className="absolute bottom-2 left-2 right-2 text-white">
                  <p className="font-headline font-bold text-xs leading-tight drop-shadow-md">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-emerald-300 font-medium">
                    {item.tag}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View Full Map Button */}
        <div className="text-center pt-4">
          <Link
            href="/map"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[#134431] hover:bg-[#0c2e21] text-white font-headline font-bold text-xs shadow-md transition-all hover:scale-105"
          >
            <span>View Full Ward Map & Live Hotspots</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </section>

      {/* 5. DARK WOOD / LEATHER COUNTER STRIP (Stats Banner - Image 5 Style) */}
      <section className="bg-[#1b140e] text-[#f2e5d5] px-6 sm:px-12 py-10 border-y border-[#3a2c1f] shadow-2xl">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-6 text-center">

          <div className="space-y-1">
            <p className="font-headline font-black text-3xl sm:text-4xl text-[#e8b574]">67</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#a89078]">Connected Wards</p>
          </div>

          <div className="space-y-1">
            <p className="font-headline font-black text-3xl sm:text-4xl text-[#e8b574]">850+</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#a89078]">Repairs Completed</p>
          </div>

          <div className="space-y-1">
            <p className="font-headline font-black text-3xl sm:text-4xl text-[#e8b574]">94.2%</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#a89078]">SLA Compliance</p>
          </div>

          <div className="space-y-1">
            <p className="font-headline font-black text-3xl sm:text-4xl text-[#e8b574]">18.4h</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#a89078]">Avg Fix Turnaround</p>
          </div>

          <div className="space-y-1 col-span-2 md:col-span-1">
            <p className="font-headline font-black text-3xl sm:text-4xl text-[#e8b574]">4,800+</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#a89078]">Active Residents</p>
          </div>

        </div>
      </section>

      {/* 6. KIND WORDS: VERIFIED CITIZEN REVIEWS (Image 6 Style) */}
      <section className="bg-[#fcfaf7] text-slate-900 px-6 sm:px-12 py-16 sm:py-20 relative overflow-hidden">

        {/* Postage Stamp Watermark */}
        <div className="absolute bottom-6 right-8 w-40 h-40 rounded-full border-4 border-dashed border-[#d8c7a8]/40 pointer-events-none rotate-45 flex items-center justify-center opacity-50">
          <span className="text-[#a48c66] text-[9px] font-mono uppercase text-center font-bold">
            CITIZEN VOICE<br />★ BMC ★
          </span>
        </div>

        <div className="max-w-6xl mx-auto space-y-10 relative z-10">

          <div className="text-center space-y-1 max-w-xl mx-auto">
            <span className="text-xs uppercase font-bold tracking-widest text-[#134431]">
              COMMUNITY IMPACT STORIES
            </span>
            <h2 className="font-headline font-black text-2xl sm:text-4xl text-slate-900">
              Stories From Citizens We've Served
            </h2>
            <p className="text-xs text-slate-500">
              Real testimonials from verified residents in Khandagiri (PIN 751030).
            </p>
          </div>

          {/* 3 Testimonials Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {citizenReviews.map((rev, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-[#eadfcb] shadow-sm hover:shadow-md transition-shadow space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-amber-500 font-serif text-3xl leading-none block">“</span>
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                    {rev.quote}
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <img
                    src={rev.avatar}
                    alt={rev.author}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20"
                  />
                  <div>
                    <h4 className="font-headline font-bold text-xs text-slate-900">
                      {rev.author}
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      {rev.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 7. WARD EDITORIAL SIGN-OFF QUOTE SECTION */}
      <section className="bg-[#134431] text-white px-6 sm:px-12 py-16 sm:py-24 shadow-2xl relative overflow-hidden text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:20px_20px]"></div>

        <div className="max-w-3xl mx-auto space-y-4 relative z-10">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-300">
            CITIZEN PLEDGE & GOVERNANCE
          </span>
          <h2 className="font-headline font-black text-2xl sm:text-4xl text-white leading-tight">
            Have a Ward Issue in Mind? <br />
            <span className="font-serif italic font-normal text-emerald-300">
              Let's resolve it together.
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-xl mx-auto font-medium">
            "For the neighborhood we cherish, the transparent municipal standards we deserve, and the resilient civic future we build together."
          </p>
        </div>
      </section>

    </div>
  );
}
