"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { OfficerKanban } from "@/components/officer/officer-kanban";
import { CivicMapView } from "@/components/map/civic-map-view";
import { useApp } from "@/lib/context/app-context";
import { ShieldCheck, UserCheck, Sparkles, Building2 } from "lucide-react";

export default function DepartmentOfficerPage() {
  const { user } = useApp();
  const router = useRouter();
  const params = useParams();
  const departmentSlug = params.department as string;
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Capitalize department name for display
  const departmentName = departmentSlug
    ? departmentSlug.charAt(0).toUpperCase() + departmentSlug.slice(1)
    : "Municipal";

  if (!isClient) return null;

  const isWrongDepartment = user && user.role === "officer" && user.department && user.department.toLowerCase() !== departmentSlug.toLowerCase();

  if (!user || user.role !== "officer" || isWrongDepartment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <div className="p-4 rounded-full bg-slate-100">
          <ShieldCheck className="w-10 h-10 text-slate-400" />
        </div>
        <div>
          <h2 className="font-headline font-bold text-xl text-slate-800">
            {isWrongDepartment ? "Department Access Restricted" : "Access Restricted"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isWrongDepartment 
              ? `You do not have access to the ${departmentName} operations console.` 
              : "Authorized municipal personnel only."}
          </p>
        </div>
        <button 
          onClick={() => router.push(isWrongDepartment && user?.department ? `/officer/${user.department.toLowerCase()}` : "/officer-portal")}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl mt-4"
        >
          {isWrongDepartment ? `Go to ${user?.department} Dashboard` : "Login to Officer Portal"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline font-black text-2xl sm:text-3xl text-on-surface">
              {departmentName} Department Operations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary-50 text-primary-800 border border-primary-200">
              Ward 42
            </span>
          </div>
          <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Municipal engineering console for SLA management, field squad dispatch, and resolution verification.
          </p>
        </div>
      </div>

      {/* Map View */}
      <div className="w-full mt-6">
        <h2 className="text-xl font-bold font-headline mb-4">Live Incident Map</h2>
        <CivicMapView departmentFilter={departmentName} />
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold font-headline mb-4">Operations Board</h2>
        <OfficerKanban departmentFilter={departmentName} />
      </div>
    </div>
  );
}
