"use client";

import dynamic from "next/dynamic";
import { Layers, MapPin, Flame } from "lucide-react";

const JanSevaMap = dynamic(
  () => import("@/components/map/JanSevaMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[550px] rounded-2xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center text-slate-500 font-bold text-sm animate-pulse space-y-2">
        <MapPin className="w-8 h-8 text-[#134431] animate-bounce" />
        <span>Loading Live Threat Map...</span>
      </div>
    ),
  }
);

export default function MapPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-4 animate-fadeIn pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline font-black text-xl sm:text-2xl text-slate-900">
              Civic Live Incident & Threat Level Map
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              Live GPS Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Explore live geo-tagged hazards, SLA threat levels (Critical, High, Moderate), and municipal maintenance tickets in real time.
          </p>
        </div>
      </div>

      <div className="w-full h-[60vh] min-h-[420px] sm:h-[540px] lg:h-[650px] rounded-2xl overflow-hidden shadow-lg border border-slate-200">
        <JanSevaMap height="100%" showUserLocation={true} interactive={true} className="h-full rounded-2xl border-0 shadow-none" />
      </div>
    </div>
  );
}