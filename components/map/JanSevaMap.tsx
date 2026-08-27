"use client";

import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { useApp } from "@/lib/context/app-context";
import { CivicIssue } from "@/lib/data/mock-data";
import {
  MapPin,
  Navigation,
  ExternalLink,
  ThumbsUp,
  AlertTriangle,
  Flame,
  ShieldAlert,
  Clock,
} from "lucide-react";

// Standard Leaflet Icon with local public assets
export const standardMarkerIcon = new L.Icon({
  iconUrl: "/leaflet/marker-icon.png",
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom pulsating User Location Icon (Clean & high-definition)
export const userGpsMarkerIcon = new L.DivIcon({
  className: "custom-user-gps-marker",
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 34px; height: 34px;">
      <span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background-color: rgba(19, 68, 49, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
      <span style="position: relative; display: flex; align-items: center; justify-content: center; border-radius: 9999px; height: 22px; width: 22px; background: #134431; border: 2.5px solid #ffffff; box-shadow: 0 3px 8px rgba(0,0,0,0.35); color: white; font-size: 11px;">
        👤
      </span>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -17],
});

// Mini radar dot for compact/thumbnail maps
export const userMiniRadarIcon = new L.DivIcon({
  className: "custom-user-mini-marker",
  html: `
    <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px;">
      <span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background-color: rgba(16, 185, 129, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
      <span style="position: relative; display: inline-block; border-radius: 9999px; height: 14px; width: 14px; background-color: #10b981; border: 2.5px solid #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></span>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

// Custom Threat-Level Colored Markers with Visual Severity Pulse & Category Emoji
export const createThreatLevelIcon = (
  urgency: string = "Moderate",
  category: string = "Sanitation",
  status?: string,
  mini: boolean = false
) => {
  const normUrgency = (urgency || "Moderate").toLowerCase();
  const isResolved = status === "Resolved" || status === "Verified Resolved";

  const getThreatConfig = () => {
    if (isResolved) {
      return {
        bg: "#059669", // Emerald
        badgeBg: "#d1fae5",
        badgeText: "#065f46",
        label: "Resolved",
        iconBadge: "✓",
        pulse: false,
        ringColor: "#10b981",
      };
    }

    switch (normUrgency) {
      case "critical":
        return {
          bg: "#dc2626", // Red-600
          badgeBg: "#fee2e2",
          badgeText: "#991b1b",
          label: "Critical Threat",
          iconBadge: "⚡",
          pulse: true,
          ringColor: "#ef4444",
        };
      case "high":
        return {
          bg: "#ea580c", // Orange-600
          badgeBg: "#ffedd5",
          badgeText: "#9a3412",
          label: "High Threat",
          iconBadge: "⚠️",
          pulse: true,
          ringColor: "#f97316",
        };
      case "moderate":
        return {
          bg: "#2563eb", // Blue-600
          badgeBg: "#dbeafe",
          badgeText: "#1e40af",
          label: "Moderate Threat",
          iconBadge: "📍",
          pulse: false,
          ringColor: "#3b82f6",
        };
      case "low":
      default:
        return {
          bg: "#64748b", // Slate-500
          badgeBg: "#f1f5f9",
          badgeText: "#334155",
          label: "Low Threat",
          iconBadge: "ℹ️",
          pulse: false,
          ringColor: "#94a3b8",
        };
    }
  };

  const getCategoryEmoji = () => {
    switch (category?.toLowerCase()) {
      case "sanitation":
        return "🗑️";
      case "roads":
        return "🛣️";
      case "water":
        return "💧";
      case "electricity":
        return "⚡";
      case "waste":
        return "📦";
      case "traffic":
        return "🚦";
      case "parks":
        return "🌳";
      default:
        return "📍";
    }
  };

  const config = getThreatConfig();
  const catEmoji = getCategoryEmoji();

  if (mini) {
    return new L.DivIcon({
      className: "threat-marker-mini",
      html: `
        <div style="position: relative; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center;">
          ${config.pulse
          ? `<span style="position: absolute; width: 100%; height: 100%; border-radius: 9999px; background-color: ${config.ringColor}; opacity: 0.6; animation: ping 1.6s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
          : ""
        }
          <span style="width: 10px; height: 10px; background-color: ${config.bg}; border: 1.5px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.35);"></span>
        </div>
      `,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
  }

  return new L.DivIcon({
    className: "threat-marker-full",
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
        ${config.pulse
        ? `<span style="position: absolute; top: 0; left: 50%; transform: translateX(-50%); width: 38px; height: 38px; border-radius: 9999px; background-color: ${config.ringColor}; opacity: 0.45; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>`
        : ""
      }
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: ${config.bg}; border: 2.5px solid white; border-radius: 50%; box-shadow: 0 6px 14px rgba(0,0,0,0.3); font-size: 14px; cursor: pointer; transition: transform 0.2s ease;">
          ${catEmoji}
          <span style="position: absolute; top: -3px; right: -3px; width: 15px; height: 15px; background: white; border: 1.5px solid ${config.bg}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: bold; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
            ${config.iconBadge}
          </span>
        </div>
      </div>
    `,
    iconSize: [38, 42],
    iconAnchor: [19, 21],
    popupAnchor: [0, -22],
  });
};

export type MapIssue = {
  id: string;
  title: string;
  category: string;
  status: string;
  urgency: "Critical" | "High" | "Moderate" | "Low";
  latitude: number;
  longitude: number;
  description?: string;
  address?: string;
  upvotes?: number;
  imageUrl?: string;
  slaHours?: number;
};

// Default fallback issues around Bhubaneswar / Ranchi
const defaultIssuesData: MapIssue[] = [
  {
    id: "JS-101",
    title: "Severe Drainage Overflow & Bio-Hazard on Main Road",
    category: "Sanitation",
    status: "In Progress",
    urgency: "Critical",
    latitude: 20.2961,
    longitude: 85.8245,
    description: "High-risk contaminated wastewater flooding pedestrian walkway.",
    address: "4th Main Road, Behind Market, PIN 751030",
    upvotes: 42,
    slaHours: 12,
  },
  {
    id: "JS-102",
    title: "High Voltage Cable Sparking Near Public School",
    category: "Electricity",
    status: "Reported",
    urgency: "Critical",
    latitude: 20.2995,
    longitude: 85.829,
    description: "Live hanging wire exposed to monsoon rain causing sparks.",
    address: "80ft Road, School Junction, PIN 751030",
    upvotes: 56,
    slaHours: 6,
  },
  {
    id: "JS-103",
    title: "Hazardous Deep Pothole Crater at Metro Junction",
    category: "Roads",
    status: "In Progress",
    urgency: "High",
    latitude: 20.2915,
    longitude: 85.819,
    description: "Severe road cave-in causing frequent two-wheeler accidents.",
    address: "Khandagiri Crossing, PIN 751030",
    upvotes: 65,
    slaHours: 24,
  },
  {
    id: "JS-104",
    title: "Drinking Water Pipeline Burst & Road Flooding",
    category: "Water",
    status: "In Progress",
    urgency: "High",
    latitude: 20.288,
    longitude: 85.826,
    description: "Clean water supply line ruptured, wasting potable municipal water.",
    address: "Sector 2 Ring Road, PIN 751030",
    upvotes: 31,
    slaHours: 24,
  },
  {
    id: "JS-105",
    title: "Uncollected Community Waste Bin Overflow",
    category: "Waste",
    status: "Resolved",
    urgency: "Moderate",
    latitude: 20.302,
    longitude: 85.822,
    description: "Overflowing dump bin cleared by municipal squad.",
    address: "Sector 3 Park Lane, PIN 751030",
    upvotes: 19,
    slaHours: 48,
  },
  {
    id: "JS-106",
    title: "Broken Park Bench & Garden Fence Repair",
    category: "Parks",
    status: "Reported",
    urgency: "Low",
    latitude: 20.294,
    longitude: 85.832,
    description: "Minor maintenance requested for park visitors.",
    address: "Community Green Park, PIN 751030",
    upvotes: 8,
    slaHours: 72,
  },
];

// Sub-component to handle map clicks
function MapClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Sub-component to programmatically control viewport
function MapViewController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom || map.getZoom(), { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export interface JanSevaMapProps {
  center?: [number, number];
  zoom?: number;
  issues?: CivicIssue[] | MapIssue[];
  departmentFilter?: string;
  height?: string;
  showUserLocation?: boolean;
  interactive?: boolean;
  variant?: "full" | "mini";
  showControls?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  className?: string;
}

export default function JanSevaMap({
  center: initialCenter = [20.2961, 85.8245],
  zoom: initialZoom = 14,
  issues: propIssues,
  departmentFilter,
  height = "540px",
  showUserLocation = true,
  interactive = true,
  variant = "full",
  showControls = true,
  onLocationSelect,
  className = "",
}: JanSevaMapProps) {
  const isMini = variant === "mini";
  const appContext = useApp();
  const rawIssues = propIssues || appContext?.issues || [];

  const [mapCenter, setMapCenter] = useState<[number, number]>(initialCenter);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
    accuracy?: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Filters
  const [activeCategory, setActiveCategory] = useState<string>(
    departmentFilter || "All"
  );
  const [activeThreatFilter, setActiveThreatFilter] = useState<string>("All");

  // Normalize issues from context or props with accurate threat levels
  const normalizedIssues: MapIssue[] = React.useMemo(() => {
    if (rawIssues && rawIssues.length > 0) {
      return (rawIssues as any[]).map((i) => {
        const lat =
          i.latitude ||
          i.location?.lat ||
          (i.location?.latitude ?? 20.2961);
        const lng =
          i.longitude ||
          i.location?.lng ||
          (i.location?.longitude ?? 85.8245);
        return {
          id: i.id || "JS-001",
          title: i.title || "Civic Incident",
          category: i.category || "Sanitation",
          status: i.status || "In Progress",
          urgency: (i.urgency as any) || "Moderate",
          latitude: lat,
          longitude: lng,
          description: i.description,
          address: i.location?.address || i.address,
          upvotes: i.upvotes || 0,
          imageUrl: i.images?.reported || i.imageUrl,
          slaHours: i.aiAnalysis?.suggestedSlaHours || (i.urgency === "Critical" ? 12 : i.urgency === "High" ? 24 : 48),
        };
      });
    }
    return defaultIssuesData;
  }, [rawIssues]);

  // Filter issues by category AND threat level
  const filteredIssues = normalizedIssues.filter((issue) => {
    if (
      activeCategory !== "All" &&
      issue.category.toLowerCase() !== activeCategory.toLowerCase()
    ) {
      return false;
    }
    if (activeThreatFilter !== "All") {
      if (
        issue.urgency?.toLowerCase() !== activeThreatFilter.toLowerCase()
      ) {
        return false;
      }
    }
    return true;
  });

  // Count threat levels for badge counters
  const criticalCount = normalizedIssues.filter(
    (i) => i.urgency?.toLowerCase() === "critical" && i.status !== "Resolved"
  ).length;
  const highCount = normalizedIssues.filter(
    (i) => i.urgency?.toLowerCase() === "high" && i.status !== "Resolved"
  ).length;

  // Attempt to get user's real geolocation
  const locateUser = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported");
      return;
    }

    setIsLocating(true);
    setLocationStatus("Locating...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        setUserLocation(coords);
        setMapCenter([coords.lat, coords.lng]);
        setIsLocating(false);
        setLocationStatus(`Located (±${Math.round(pos.coords.accuracy)}m)`);
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus("Default location");
        console.warn("Geolocation warning:", err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  useEffect(() => {
    if (showUserLocation) {
      locateUser();
    }
  }, [showUserLocation]);

  const handleMapClick = (lat: number, lng: number) => {
    if (isMini) return;
    setSelectedLocation({ lat, lng });
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  };

  return (
    <div
      className={`relative w-full overflow-hidden bg-slate-100 flex flex-col select-none ${isMini
        ? "h-full rounded-xl border-0 shadow-none"
        : "rounded-2xl border border-slate-200 shadow-lg"
        } ${className}`}
      style={{ height: isMini ? "100%" : height }}
    >
      {/* Top Filter & Threat Level Bar (Only on Full mode) */}
      {!isMini && showControls && (
        <div className="absolute top-2.5 left-2.5 right-2.5 z-[400] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pointer-events-none max-w-[calc(100%-1.25rem)]">
          {/* Threat Level & Category Filters */}
          <div className="flex items-center gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200/90 pointer-events-auto max-w-full overflow-hidden">
            {/* Category / Threat Pill Toggles */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5 px-0.5 flex-1 min-w-0">
              {[
                { id: "All", label: "All Incidents" },
                { id: "Critical", label: `🔴 Critical (${criticalCount})` },
                { id: "High", label: `🟠 High (${highCount})` },
                { id: "Moderate", label: "🔵 Moderate" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveThreatFilter(t.id)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 whitespace-nowrap ${activeThreatFilter.toLowerCase() === t.id.toLowerCase()
                      ? "bg-[#134431] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="h-4 w-[1px] bg-slate-200 shrink-0 hidden sm:block" />

            {/* Quick Category filter select */}
            <div className="shrink-0">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="text-[11px] font-bold px-2 py-1 rounded-xl bg-slate-100 border-0 text-slate-700 focus:ring-1 focus:ring-[#134431] cursor-pointer max-w-[120px] sm:max-w-none truncate"
              >
                <option value="All">All Categories</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Roads">Roads</option>
                <option value="Water">Water</option>
                <option value="Electricity">Electricity</option>
                <option value="Waste">Waste</option>
                <option value="Traffic">Traffic</option>
                <option value="Parks">Parks</option>
              </select>
            </div>
          </div>

          {/* Right Status Badges */}
          <div className="flex items-center gap-1.5 pointer-events-auto shrink-0 self-end sm:self-auto">
            {locationStatus && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/90 backdrop-blur-md text-[10px] font-medium text-slate-700 shadow-sm border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{locationStatus}</span>
              </div>
            )}

            <div className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 text-[10px] sm:text-[11px] font-bold text-slate-800 flex items-center gap-1.5 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>{filteredIssues.length} Incidents Live</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Leaflet Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={isMini ? 13 : initialZoom}
        scrollWheelZoom={!isMini && interactive}
        dragging={!isMini && interactive}
        zoomControl={!isMini}
        attributionControl={!isMini}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapViewController center={mapCenter} zoom={isMini ? 13 : initialZoom} />

        {!isMini && interactive && <MapClickHandler onSelect={handleMapClick} />}

        {/* User Real GPS Location Marker */}
        {userLocation && (
          <>
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={isMini ? userMiniRadarIcon : userGpsMarkerIcon}
            >
              {!isMini && (
                <Popup>
                  <div className="p-1 space-y-1 text-slate-900">
                    <div className="flex items-center gap-1 text-emerald-800 font-bold text-xs">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Your Current Location</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Lat: {userLocation.lat.toFixed(6)}, Lng:{" "}
                      {userLocation.lng.toFixed(6)}
                    </p>
                    {userLocation.accuracy && (
                      <p className="text-[10px] text-slate-500">
                        Accuracy: ±{Math.round(userLocation.accuracy)} meters
                      </p>
                    )}
                  </div>
                </Popup>
              )}
            </Marker>

            {userLocation.accuracy && userLocation.accuracy < 1000 && (
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={
                  isMini
                    ? Math.min(userLocation.accuracy, 250)
                    : userLocation.accuracy
                }
                pathOptions={{
                  fillColor: "#10b981",
                  fillOpacity: isMini ? 0.2 : 0.12,
                  color: "#10b981",
                  weight: 1,
                }}
              />
            )}
          </>
        )}

        {/* Render Issue Markers with Threat Level */}
        {filteredIssues.map((issue) => (
          <React.Fragment key={issue.id}>
            {/* Visual Threat Radius Ring for Critical & High Issues */}
            {!isMini && issue.status !== "Resolved" && (
              <Circle
                center={[issue.latitude, issue.longitude]}
                radius={
                  issue.urgency === "Critical"
                    ? 180
                    : issue.urgency === "High"
                      ? 120
                      : 60
                }
                pathOptions={{
                  fillColor:
                    issue.urgency === "Critical"
                      ? "#ef4444"
                      : issue.urgency === "High"
                        ? "#f97316"
                        : "#3b82f6",
                  fillOpacity: issue.urgency === "Critical" ? 0.18 : 0.1,
                  color:
                    issue.urgency === "Critical"
                      ? "#dc2626"
                      : issue.urgency === "High"
                        ? "#ea580c"
                        : "#2563eb",
                  weight: issue.urgency === "Critical" ? 1.5 : 1,
                  dashArray: issue.urgency === "Critical" ? "4, 4" : undefined,
                }}
              />
            )}

            <Marker
              position={[issue.latitude, issue.longitude]}
              icon={createThreatLevelIcon(
                issue.urgency,
                issue.category,
                issue.status,
                isMini
              )}
            >
              {!isMini && (
                <Popup className="custom-issue-popup">
                  <div className="p-1 max-w-xs space-y-2 text-slate-900">
                    {issue.imageUrl && (
                      <img
                        src={issue.imageUrl}
                        alt={issue.title}
                        className="w-full h-24 object-cover rounded-lg mb-1"
                      />
                    )}
                    <div>
                      {/* Threat Level & Status Row */}
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 ${issue.urgency === "Critical"
                            ? "bg-rose-100 text-rose-800 border border-rose-200"
                            : issue.urgency === "High"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : issue.urgency === "Moderate"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-slate-100 text-slate-700"
                            }`}
                        >
                          {issue.urgency === "Critical" && (
                            <Flame className="w-3 h-3 text-rose-600 animate-pulse" />
                          )}
                          <span>{issue.urgency} Threat Level</span>
                        </span>

                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {issue.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 mt-1 leading-snug">
                        {issue.title}
                      </h4>
                      {issue.address && (
                        <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{issue.address}</span>
                        </p>
                      )}
                    </div>

                    {/* SLA & Upvotes Row */}
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#f06424] flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 fill-current" />
                          <span>{issue.upvotes}</span>
                        </span>

                        {issue.slaHours && (
                          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-0.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>{issue.slaHours}h SLA</span>
                          </span>
                        )}
                      </div>

                      <Link
                        href={`/issues/${issue.id}`}
                        className="px-2.5 py-1 rounded-md bg-[#134431] hover:bg-[#0c2e21] text-white text-[10px] font-bold flex items-center gap-1 transition-colors shrink-0"
                      >
                        <span>View Ticket</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              )}
            </Marker>
          </React.Fragment>
        ))}

        {/* Selected Clicked Location Pin */}
        {!isMini && selectedLocation && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={standardMarkerIcon}
          >
            <Popup>
              <div className="p-1 space-y-1 text-slate-900">
                <h4 className="font-bold text-xs text-slate-900">
                  Selected Location
                </h4>
                <p className="text-[11px] text-slate-600">
                  Lat: {selectedLocation.lat.toFixed(6)}
                  <br />
                  Lng: {selectedLocation.lng.toFixed(6)}
                </p>
                <Link
                  href={`/report?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}`}
                  className="inline-block mt-2 px-3 py-1.5 bg-[#f06424] hover:bg-[#d95214] text-white text-[11px] font-bold rounded-lg transition-colors text-center w-full"
                >
                  Report Issue Here
                </Link>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Bottom Left Threat Level Legend (Full mode) */}
      {!isMini && showControls && (
        <div className="absolute bottom-4 left-4 z-[400] hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 shadow-md text-[11px] font-bold">
          <span className="text-slate-400 uppercase text-[9px] tracking-wider">
            Threat Levels:
          </span>
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 text-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Critical
            </span>
            <span className="flex items-center gap-1 text-orange-700">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              High
            </span>
            <span className="flex items-center gap-1 text-blue-700">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Moderate
            </span>
            <span className="flex items-center gap-1 text-emerald-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Resolved
            </span>
          </div>
        </div>
      )}

      {/* Floating Action Controls (Full mode) */}
      {!isMini && showControls && (
        <div className="absolute bottom-4 right-4 z-[400] flex flex-col gap-2">
          <button
            type="button"
            onClick={locateUser}
            disabled={isLocating}
            title="Recenter to My GPS Location"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 hover:bg-[#134431] hover:text-white shadow-lg border border-slate-200 transition-all text-xs font-bold"
          >
            <Navigation
              className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">
              {isLocating ? "Locating..." : "My Location"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

// Named alias export for compatibility
export function CivicMapView({
  departmentFilter,
}: {
  departmentFilter?: string;
}) {
  return <JanSevaMap departmentFilter={departmentFilter} height="540px" />;
}