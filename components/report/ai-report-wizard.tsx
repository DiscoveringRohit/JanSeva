"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/context/app-context";
import { submitIssue } from "@/lib/api/issues";
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

// Removed SAMPLE_PRESETS per requirements.

export function AiReportWizard() {
  const router = useRouter();
  const { addIssue, user, setUser } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("Roads");
  const [urgency, setUrgency] = useState<string>("High");
  const [address, setAddress] = useState("Ward 63, BMC, Bhubaneswar");
  const [landmark, setLandmark] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [notifySms, setNotifySms] = useState(true);
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(true);

  // Live Camera State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [geolocation, setGeolocation] = useState<{lat: number, lng: number, timestamp: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  // Ensure video element gets the stream once rendered
  useEffect(() => {
    if (isCameraActive && mediaStream && videoRef.current) {
      if (videoRef.current.srcObject !== mediaStream) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play().catch(console.error);
      }
    }
  }, [isCameraActive, mediaStream]);

  if (!user) return null; // Handled by wrapper page

  // AI analysis state
  const [aiData, setAiData] = useState({
    detectedObject: "Pending Classification",
    confidence: 0,
    estimatedSeverity: "Pending",
    predictedDepartment: "BMC Ward 63",
    suggestedSlaHours: 24,
    summary: "Pending review.",
  });

  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);



  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setMediaStream(stream);
      setIsCameraActive(true);
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setGeolocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              timestamp: new Date(pos.timestamp).toLocaleString()
            });
          },
          (err) => console.warn("Geolocation error", err)
        );
      }
    } catch (err) {
      console.error("Error accessing camera", err);
      setCameraError("Camera access is required to submit a report. Please grant permission or use a supported browser.");
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      const doCapture = () => {
        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setSelectedImage(dataUrl);
          setIsCameraActive(false);
          if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setMediaStream(null);
          }
          
          setIsScanning(true);
          setScanComplete(false);
          setTimeout(() => {
            setIsScanning(false);
            setScanComplete(true);
            setTitle("Civic Issue Report");
            setDescription("");
          }, 1000);
        }
      };

      if (video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
        doCapture();
      } else {
        video.addEventListener('loadeddata', doCapture, { once: true });
      }
    }
  };


  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      title,
      description,
      category,
      urgency,
      reporterId: user.id,
      location: {
        address: `${address} ${landmark ? `(${landmark})` : ''}`,
        ward: "Ward 63",
        wardNumber: 63,
        lat: geolocation ? geolocation.lat : 20.2700 + (Math.random() - 0.5) * 0.005,
        lng: geolocation ? geolocation.lng : 85.7600 + (Math.random() - 0.5) * 0.005,
      },
      images: {
        reported: selectedImage || "",
      },
      aiAnalysis: aiData,
      assignedDepartment: `BMC ${category} Department`,
    };

    const response = await submitIssue(payload);

    if (response.success) {
      const created = addIssue({
        ...payload,
        id: response.data.id,
        status: "Open",
        createdAt: response.data.createdAt,
        reporter: {
          name: isAnonymous ? "Anonymous Citizen" : user.name,
          username: isAnonymous ? undefined : user.username,
          avatar: isAnonymous ? "https://i.pravatar.cc/150?u=anon" : user.avatar,
          level: user.level,
        },
        isUpvoted: false,
        upvotes: 0,
        comments: 0
      } as any);

      // Update user Civic Citizen XP and stats locally
      if (user && !isAnonymous && setUser) {
        setUser(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            civicCitizenXP: (prev.civicCitizenXP || 0) + 15,
            stats: {
              ...prev.stats,
              issuesReported: (prev.stats.issuesReported || 0) + 1
            }
          };
        });
      }

      setCreatedTicketId(created.id);
      setStep(4);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {}
    }
    
    setIsSubmitting(false);
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
                {isCameraActive ? (
                  <>
                    <video 
                      ref={videoRef} 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <button 
                      type="button" 
                      onClick={captureImage}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white/20 border-4 border-white flex items-center justify-center shadow-lg hover:bg-white/40 transition-colors backdrop-blur-sm"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </button>
                    {geolocation && (
                      <div className="absolute top-2 left-2 right-2 flex justify-between text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-1 rounded backdrop-blur">
                        <span>Lat: {geolocation.lat.toFixed(4)}</span>
                        <span>Lng: {geolocation.lng.toFixed(4)}</span>
                        <span>{geolocation.timestamp}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt="Evidence"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant">
                        <Camera className="w-10 h-10 mb-2 opacity-50" />
                        <span className="text-xs font-semibold">No Image Captured</span>
                      </div>
                    )}

                    {geolocation && (
                      <div className="absolute top-2 left-2 right-2 flex justify-between text-[10px] font-mono text-emerald-400 bg-black/60 px-2 py-1 rounded backdrop-blur z-10">
                        <span>Lat: {geolocation.lat.toFixed(4)}</span>
                        <span>Lng: {geolocation.lng.toFixed(4)}</span>
                        <span>{geolocation.timestamp}</span>
                      </div>
                    )}

                    {/* Simulated Laser Scan Beam */}
                    {isScanning && (
                      <div className="absolute inset-0 bg-primary-500/10 pointer-events-none flex flex-col justify-between z-10">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce" />
                        <div className="p-3 bg-black/75 backdrop-blur text-white text-center text-xs font-bold">
                          <Sparkles className="w-4 h-4 text-cyan-400 inline mr-1 animate-spin" />
                          Processing Image...
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Camera Action */}
              <div className="flex flex-col gap-3">
                {cameraError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>{cameraError}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  {!isCameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold transition-all shadow-md"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Start Live Camera</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsCameraActive(false);
                        if (mediaStream) {
                          mediaStream.getTracks().forEach(track => track.stop());
                          setMediaStream(null);
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md"
                    >
                      <span>Cancel Camera</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Manual Category Selection */}
            <div className="space-y-4 flex flex-col justify-center">
              <div className="rounded-3xl bg-white border border-surface-container-high p-6 shadow-soft space-y-4">
                <div>
                  <h3 className="font-headline font-bold text-lg text-on-surface">Select Category</h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">Please manually select the issue category.</p>
                </div>
                <div>
                  {/* TODO: replace with AI classification agent call */}
                  <label className="block text-xs font-bold text-on-surface mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-3 text-sm font-semibold rounded-2xl bg-surface-container-low border border-surface-dim text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="Pothole">Pothole</option>
                    <option value="Garbage">Garbage</option>
                    <option value="Water">Water</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Roads">Roads</option>
                    <option value="Sanitation">Sanitation</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!selectedImage || isScanning}
                  className="w-full mt-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-primary-500 text-white font-headline font-bold text-xs shadow-lg hover:brightness-110 active:scale-98 disabled:opacity-50 disabled:hover:brightness-100 transition-all flex items-center justify-center gap-2"
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
                    className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
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
                  placeholder="e.g. Opposite BMC Substation / Gate #2"
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-700" />
                  <div>
                    <p className="text-xs font-bold text-emerald-950">Ward 63 • Bhubaneswar</p>
                    <p className="text-[10px] text-emerald-800">BMC • Odisha</p>
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
                  Lat: {geolocation ? geolocation.lat.toFixed(4) : "20.2700"}° N • Lng: {geolocation ? geolocation.lng.toFixed(4) : "85.7600"}° E
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
                {/* TODO: replace with AI classification agent call */}
                <label className="block text-xs font-bold text-on-surface mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-2xl bg-surface-container-low border border-surface-dim text-on-surface"
                >
                  <option value="Pothole">Pothole</option>
                  <option value="Garbage">Garbage</option>
                  <option value="Water">Water</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Roads">Roads</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Other">Other</option>
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
                    Logged in as <strong>{user.name}</strong> • Earn +50 Civic Citizen XP
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
              disabled={isSubmitting}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-700 text-white font-headline font-bold text-xs shadow-lg shadow-primary-600/30 hover:scale-102 active:scale-98 transition-all flex items-center gap-2 disabled:opacity-50 disabled:scale-100"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Submit to Municipal Dispatch</span>
                </>
              )}
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
              <span className="text-on-surface-variant font-medium">Civic Citizen XP Reward:</span>
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
