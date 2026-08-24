"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Camera, CheckCircle2, MapPin, ShieldCheck, Loader2 } from "lucide-react";
import { useApp } from "@/lib/context/app-context";
import { CivicIssue } from "@/lib/data/mock-data";

export default function VerifyIssuePage() {
  const { id } = useParams();
  const router = useRouter();
  const { issues, user, updateIssueStatus } = useApp();
  
  const [issue, setIssue] = useState<CivicIssue | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [geoLoc, setGeoLoc] = useState<string | null>(null);

  useEffect(() => {
    if (id && issues) {
      const found = issues.find(i => i.id === id);
      if (found) setIssue(found);
    }
  }, [id, issues]);

  if (!issue) return <div className="p-8 text-center text-sm font-bold animate-pulse">Loading Verification Module...</div>;

  const handleCapture = () => {
    // Simulate camera capture & geotagging
    setPhoto("https://images.unsplash.com/photo-1574786198875-49f58cac0880?w=800&auto=format&fit=crop&q=80");
    setGeoLoc(`${issue.location.lat.toFixed(4)}, ${issue.location.lng.toFixed(4)}`);
  };

  const handleConfirm = () => {
    if (!photo) return;
    setIsVerifying(true);
    
    setTimeout(() => {
      // Update status to Verified Resolved
      updateIssueStatus(issue.id, "Verified Resolved", `Citizen ${user?.name || "User"} verified on-ground resolution with geotagged photo.`);
      router.push(`/issues/${issue.id}`);
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-8 space-y-6 animate-fadeIn">
      <div className="text-center space-y-2 mb-8">
        <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black font-headline text-on-surface">Citizen Resolution Audit</h1>
        <p className="text-sm text-on-surface-variant max-w-md mx-auto">
          Please confirm that you want to verify the problem <strong className="text-primary-600">"{issue.title}"</strong> that has been marked solved by the authorities of the <strong className="text-on-surface">{issue.assignedDepartment}</strong>.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-surface-container-high shadow-soft space-y-6">
        <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl flex gap-3 text-sm font-medium border border-emerald-100">
          <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          <p>
            You must be at the location (<strong className="font-bold">{issue.location.address}</strong>) to verify this resolution. 
            Capture a live geotagged photo as evidence.
          </p>
        </div>

        {/* Camera / Photo Preview */}
        {!photo ? (
          <button 
            onClick={handleCapture}
            className="w-full h-48 rounded-2xl border-2 border-dashed border-primary-200 bg-primary-50 text-primary-600 flex flex-col items-center justify-center gap-2 hover:bg-primary-100 transition-colors"
          >
            <Camera className="w-8 h-8" />
            <span className="font-bold text-sm">Tap to Open Camera</span>
            <span className="text-xs opacity-80">Geotagging enabled</span>
          </button>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-surface-dim">
            <img src={photo} alt="Verification" className="w-full h-48 object-cover" />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 p-3">
              <p className="text-xs font-mono text-emerald-300 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                VERIFIED GPS: {geoLoc}
              </p>
            </div>
            <button 
              onClick={() => setPhoto(null)}
              className="absolute top-3 right-3 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full transition-colors"
            >
              Retake
            </button>
          </div>
        )}

        <button
          onClick={handleConfirm}
          disabled={!photo || isVerifying}
          className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</>
          ) : (
            <><CheckCircle2 className="w-4 h-4" /> Confirm & Verify Resolution</>
          )}
        </button>
      </div>
    </div>
  );
}
