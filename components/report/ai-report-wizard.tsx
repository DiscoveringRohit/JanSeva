"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import confetti from "canvas-confetti";
import {
  Camera,
  UploadCloud,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Building,
  Shield,
  Clock,
  Scan,
  RefreshCw,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_PRESETS = [
  {
    name: "Ruptured Sewage Drain",
    category: "Sanitation" as const,
    urgency: "Critical" as const,
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80",
    detected: "Severe Sewage Pipeline Rupture & Bio-Hazard Stagnation",
    confidence: 97.8,
    dept: "BWSSB Sanitary Engineering Division",
    sla: 12,
    address: "4th Main Road, Behind City Market, Shanti Nagar, Ward 42",
    title: "Overflowing Sewage Pipeline Flooding Pedestrian Walkway",
    desc: "Main sewer line cracked causing foul wastewater to flood the street, blocking access to neighborhood shops and posing health risks.",
  },
  {
    name: "Dangerous Road Pothole",
    category: "Roads" as const,
    urgency: "High" as const,
    image: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80",
    detected: "Deep Structural Asphalt Depression (1.4m diameter)",
    confidence: 98.4,
    dept: "BBMP Road Infrastructure & Rapid Patch Unit",
    sla: 24,
    address: "80 Feet Road, Near Metro Pillar 142, Shanti Nagar, Ward 42",
    title: "Dangerous Deep Crater on Fast Lane of 80ft Road",
    desc: "Large pothole emerged after recent monsoon rain. Risk of two-wheeler skids. Requires immediate cold mix asphalt repair.",
  },
  {
    name: "Commercial Garbage Spot",
    category: "Waste" as const,
    urgency: "High" as const,
    image: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80",
    detected: "Commercial Unsegregated Solid Waste Black Spot",
    confidence: 96.2,
    dept: "BBMP Solid Waste Management (SWM)",
    sla: 8,
    address: "Main Gate, Shanti Nagar Community Park, Sector 2",
    title: "Commercial Waste Dump Obstructing Park Entrance",
    desc: "Piles of plastic and organic eatery waste dumped at park entrance. Stray animals spreading debris.",
  },
  {
    name: "Broken Streetlight Cluster",
    category: "Electricity" as const,
    urgency: "Moderate" as const,
    image: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=80",
    detected: "Defective Streetlight Luminaire Series / MCB Trip",
    confidence: 94.9,
    dept: "BESCOM Ward 42 Lighting Maintenance Cell",
    sla: 24,
    address: "8th Cross, Sector 3, Shanti Nagar, Ward 42",
    title: "Multiple Streetlights Off Along 8th Cross Residential Belt",
    desc: "Complete dark stretch over 250 meters. Safety hazard for pedestrians and late night commuters.",
  },
];

export function AiReportWizard() {
  const router = useRouter();
  const { addIssue, user } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedImage, setSelectedImage] = useState(SAMPLE_PRESETS[0].image);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(true);

  // Form State
  const [title, setTitle] = useState(SAMPLE_PRESETS[0].title);
  const [description, setDescription] = useState(SAMPLE_PRESETS[0].desc);
  const [category, setCategory] = useState<any>(SAMPLE_PRESETS[0].category);
  const [urgency, setUrgency] = useState<any>(SAMPLE_PRESETS[0].urgency);
  const [address, setAddress] = useState(SAMPLE_PRESETS[0].address);
  const [landmark, setLandmark] = useState("Near City Market Gate 2");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [notifySms, setNotifySms] = useState(true);

  // AI analysis state
  const [aiData, setAiData] = useState({
    detectedObject: SAMPLE_PRESETS[0].detected,
    confidence: SAMPLE_PRESETS[0].confidence,
    estimatedSeverity: "Critical Bio-Hazard",
    predictedDepartment: SAMPLE_PRESETS[0].dept,
    suggestedSlaHours: SAMPLE_PRESETS[0].sla,
    summary: "AI Computer Vision validated critical physical infrastructure failure.",
  });

  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  const handleSelectPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    setSelectedImage(preset.image);
    setTitle(preset.title);
    setDescription(preset.desc);
    setCategory(preset.category);
    setUrgency(preset.urgency);
    setAddress(preset.address);
    setIsScanning(true);
    setScanComplete(false);

    // Simulate AI Vision scanning
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
      setAiData({
        detectedObject: preset.detected,
        confidence: preset.confidence,
        estimatedSeverity: `${preset.urgency} Priority Civic Issue`,
        predictedDepartment: preset.dept,
        suggestedSlaHours: preset.sla,
        summary: `Computer vision verified 98%+ pattern match for ${preset.name}.`,
      });
    }, 1200);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedImage(url);
      setIsScanning(true);
      setScanComplete(false);

      setTimeout(() => {
        setIsScanning(false);
        setScanComplete(true);
        setTitle("Civic Infrastructure Hazard Detected");
        setDescription("Identified physical road/utility issue requiring municipal repair.");
        setCategory("Roads");
        setUrgency("High");
        setAiData({
          detectedObject: "Civic Road Damage / Obstruction",
          confidence: 96.5,
          estimatedSeverity: "High Priority",
          predictedDepartment: "BBMP Road Infrastructure & Rapid Response",
          suggestedSlaHours: 24,
          summary: "Custom user evidence validated through JanSeva neural vision pipeline.",
        });
      }, 1500);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const created = addIssue({
      title,
      description,
      category,
      urgency,
      location: {
        address: `${address} (${landmark})`,
        ward: "Shanti Nagar",
        wardNumber: 42,
        lat: 12.9611 + (Math.random() - 0.5) * 0.005,
        lng: 77.5975 + (Math.random() - 0.5) * 0.005,
      },
      images: {
        reported: selectedImage,
      },
      aiAnalysis: aiData,
      assignedDepartment: aiData.predictedDepartment,
    });

    setCreatedTicketId(created.id);
    setStep(4);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {}
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      
      {/* Wizard Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI-Powered Fast Triage System</span>
        </div>
        <h1 className="font-headline font-extrabold text-2xl sm:text-3xl text-on-surface">
          Report a Civic Grievance
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant max-w-lg mx-auto mt-1">
          Upload a photo. JanSeva’s computer vision auto-detects the problem, pinpoints GPS, and dispatches directly to the municipal team.
        </p>

        {/* Stepper Dots */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-6">
          {[
            { num: 1, label: "Evidence & AI Scan" },
            { num: 2, label: "Location & Ward" },
            { num: 3, label: "Review & Triage" },
            { num: 4, label: "Dispatched" },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all",
                  step === s.num
                    ? "bg-primary-600 text-white shadow-md shadow-primary-600/30 scale-110"
                    : step > s.num
                    ? "bg-emerald-500 text-white"
                    : "bg-surface-container text-on-surface-variant"
                )}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className="hidden md:inline text-xs font-semibold text-on-surface-variant">
                {s.label}
              </span>
              {s.num < 4 && <div className="hidden sm:block w-8 h-0.5 bg-surface-dim" />}
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Evidence Capture & Computer Vision */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left: Preview Canvas & Scan Animation */}
            <div className="rounded-3xl bg-white border border-surface-container-high p-5 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface font-headline">Captured Image</span>
                <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <Scan className="w-3 h-3" />
                  HD Geo-Tagged
                </span>
              </div>

              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border border-surface-dim flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Evidence"
                  className="w-full h-full object-cover"
                />

                {/* Simulated Laser Scan Beam */}
                {isScanning && (
                  <div className="absolute inset-0 bg-primary-500/10 pointer-events-none flex flex-col justify-between">
                    <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce" />
                    <div className="p-3 bg-black/75 backdrop-blur text-white text-center text-xs font-bold">
                      <Sparkles className="w-4 h-4 text-cyan-400 inline mr-1 animate-spin" />
                      Analyzing Neural Vision Features...
                    </div>
                  </div>
                )}

                {/* AI Detected Tag overlay */}
                {scanComplete && !isScanning && (
                  <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs flex items-center justify-between border border-white/20">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold">{aiData.detectedObject}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-extrabold text-[10px]">
                      {aiData.confidence}% Confidence
                    </span>
                  </div>
                )}
              </div>

              {/* Upload or Choose Presets */}
              <div className="flex gap-2">
                <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-dim text-xs font-bold text-on-surface transition-all">
                  <UploadCloud className="w-4 h-4 text-primary-600" />
                  <span>Upload from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Right: Quick Preset Scenarios & AI Live Readout */}
            <div className="space-y-4">
              <div className="rounded-3xl bg-white border border-surface-container-high p-5 shadow-soft space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant font-headline">
                  Try Sample Civic Scenarios
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAMPLE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={cn(
                        "text-left p-2.5 rounded-2xl border transition-all flex items-center gap-2.5",
                        selectedImage === preset.image
                          ? "border-primary-600 bg-primary-50/60 shadow-sm"
                          : "border-surface-dim bg-surface-container-low hover:bg-surface-container"
                      )}
                    >
                      <img
                        src={preset.image}
                        alt={preset.name}
                        className="w-10 h-10 rounded-xl object-cover ring-1 ring-black/10"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-on-surface truncate">{preset.name}</p>
                        <p className="text-[10px] text-primary-700 font-semibold">{preset.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* AI Realtime Output Card */}
              <div className="rounded-3xl bg-gradient-to-br from-indigo-900 via-primary-900 to-slate-900 text-white p-5 shadow-xl space-y-3 border border-indigo-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-cyan-400" />
                    <span className="font-headline font-bold text-sm">JanSeva Vision Engine</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-400/30">
                    Live Telemetry
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-white/70">Identified Hazard:</span>
                    <span className="font-bold text-white text-right truncate max-w-[200px]">{aiData.detectedObject}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-white/70">Severity Score:</span>
                    <span className="font-bold text-rose-300">{aiData.estimatedSeverity}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/10">
                    <span className="text-white/70">Target Dept:</span>
                    <span className="font-bold text-emerald-300 text-right truncate max-w-[200px]">{aiData.predictedDepartment}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-white/70">Suggested SLA:</span>
                    <span className="font-bold text-amber-300">~{aiData.suggestedSlaHours} Hours</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isScanning}
                  className="w-full mt-2 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-primary-500 text-white font-headline font-bold text-xs shadow-lg hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
                >
                  <span>Confirm Evidence & Set Location</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* STEP 2: Location & Geolocation */}
      {step === 2 && (
        <div className="rounded-3xl bg-white border border-surface-container-high p-6 shadow-soft space-y-6 animate-fadeIn">
          <div>
            <h3 className="font-headline font-bold text-lg text-on-surface">Confirm Location & Ward</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              JanSeva automatically fetched your GPS location. Adjust if necessary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Street Address
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-primary-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9.5 pr-4 py-2.5 text-xs rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Nearby Landmark / Cross / Pillar No.
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Opposite BESCOM Substation / Gate #2"
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-700" />
                  <div>
                    <p className="text-xs font-bold text-emerald-950">Ward 42 • Shanti Nagar</p>
                    <p className="text-[10px] text-emerald-800">BBMP East Zone • Bengaluru</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-extrabold">
                  Verified Boundary
                </span>
              </div>
            </div>

            {/* Map Mini Canvas */}
            <div className="rounded-2xl overflow-hidden border border-surface-dim relative bg-slate-100 flex items-center justify-center aspect-[4/3]">
              <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
              <div className="relative text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary-600/20 flex items-center justify-center mx-auto mb-2 ring-8 ring-primary-600/10">
                  <MapPin className="w-6 h-6 text-primary-600 animate-bounce" />
                </div>
                <p className="text-xs font-bold text-on-surface">{address}</p>
                <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                  Lat: 12.9611° N • Lng: 77.5975° E
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-dim">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-2xl border border-surface-dim text-xs font-bold text-on-surface hover:bg-surface-container flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-600/30 flex items-center gap-1.5"
            >
              <span>Continue to Review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Review, Category & Dispatch */}
      {step === 3 && (
        <form onSubmit={handleFinalSubmit} className="rounded-3xl bg-white border border-surface-container-high p-6 shadow-soft space-y-6 animate-fadeIn">
          <div>
            <h3 className="font-headline font-bold text-lg text-on-surface">Review & Submit Report</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Review the details generated by AI before final dispatch to the municipal queue.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Description & Impact
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-2xl bg-surface-container-low border border-surface-dim text-on-surface"
                >
                  <option value="Sanitation">Sanitation & Drainage</option>
                  <option value="Roads">Roads & Potholes</option>
                  <option value="Water">Water Supply</option>
                  <option value="Electricity">Electricity & Lighting</option>
                  <option value="Waste">Waste Management</option>
                  <option value="Traffic">Traffic & Signals</option>
                  <option value="Parks">Parks & Horticulture</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Urgency Priority</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-2xl bg-surface-container-low border border-surface-dim text-on-surface"
                >
                  <option value="Critical">Critical (Immediate SLA)</option>
                  <option value="High">High (24h SLA)</option>
                  <option value="Moderate">Moderate (48h SLA)</option>
                  <option value="Low">Low (Standard SLA)</option>
                </select>
              </div>
            </div>

            {/* Reporter Options */}
            <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-dim space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-on-surface">Submit as Verified Citizen</p>
                  <p className="text-[10px] text-on-surface-variant">
                    Logged in as <strong>{user.name}</strong> • Earn +50 Civic Karma XP
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!isAnonymous}
                    onChange={(e) => setIsAnonymous(!e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-surface-dim">
                <div>
                  <p className="text-xs font-bold text-on-surface">SMS & WhatsApp Alerts</p>
                  <p className="text-[10px] text-on-surface-variant">
                    Receive live updates when an officer is assigned and problem is fixed
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifySms}
                    onChange={(e) => setNotifySms(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-dim">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-2xl border border-surface-dim text-xs font-bold text-on-surface hover:bg-surface-container flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              type="submit"
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-700 text-white font-headline font-bold text-xs shadow-lg shadow-primary-600/30 hover:scale-102 active:scale-98 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Submit to Municipal Dispatch</span>
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: Success & Tracking Modal */}
      {step === 4 && (
        <div className="rounded-3xl bg-white border border-surface-container-high p-8 shadow-2xl text-center space-y-6 max-w-lg mx-auto animate-slideUp">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              Dispatched to Municipal Queue
            </span>
            <h3 className="font-headline font-extrabold text-2xl text-on-surface mt-2">
              Ticket #{createdTicketId} Created!
            </h3>
            <p className="text-xs text-on-surface-variant mt-1">
              Your issue has been logged, verified by AI, and assigned to <strong>{aiData.predictedDepartment}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-dim text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-on-surface-variant font-medium">Tracking Code:</span>
              <span className="font-bold text-primary-700 font-mono">#{createdTicketId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant font-medium">Estimated Resolution:</span>
              <span className="font-bold text-emerald-700">~{aiData.suggestedSlaHours} Hours</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant font-medium">Karma Reward:</span>
              <span className="font-bold text-primary-600">+50 XP Awarded</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={() => router.push(`/issues/${createdTicketId}`)}
              className="flex-1 py-3 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-600/30 transition-all"
            >
              Track Live Progression →
            </button>
            <button
              type="button"
              onClick={() => router.push("/feed")}
              className="py-3 px-4 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-surface-dim text-xs font-bold text-on-surface transition-colors"
            >
              Back to Feed
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
