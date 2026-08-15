"use client";

import React from "react";
import { CivicMapView } from "@/components/map/civic-map-view";

export default function MapPage() {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h1 className="font-headline font-black text-2xl sm:text-3xl text-on-surface">
            Ward 42 Civic Live Map & Heatmap
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Explore live geo-tagged hazards, road repairs, sewage lines, and municipal infrastructure assets.
          </p>
        </div>
      </div>

      <CivicMapView />
    </div>
  );
}
