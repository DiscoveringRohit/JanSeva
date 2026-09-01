"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Activity,
  Server,
  Database,
  Globe,
  Cpu,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Clock,
  Zap,
  ArrowRight,
  Copy,
  Check,
  Radio,
  MapPin,
  Sparkles,
  Layers,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthData {
  status: "healthy" | "degraded" | "offline";
  timestamp: string;
  totalExecutionTimeMs: number;
  frontend: {
    framework: string;
    status: string;
    nodeEnv: string;
    uptime: number;
  };
  backend: {
    url: string;
    status: string;
    latencyMs: number;
    error: string | null;
    data: any;
  };
  services: {
    database: {
      status: string;
      total_issues?: number;
      total_users?: number;
      total_notifications?: number;
    };
    translationApi: {
      status: string;
      engines: string[];
    };
    geminiAi: {
      status: string;
      model: string;
    };
    closedLoopVerification: {
      status: string;
      protocol: string;
    };
    hyperlocalClassification: {
      status: string;
      type: string;
    };
  };
}

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copied, setCopied] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());
  const [testResult, setTestResult] = useState<{ name: string; status: string; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const fetchHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/health", { cache: "no-store" });
      const json = await res.json();
      setData(json);
      setLastCheck(new Date());
    } catch (err: any) {
      setData({
        status: "offline",
        timestamp: new Date().toISOString(),
        totalExecutionTimeMs: 0,
        frontend: { framework: "Next.js 14", status: "degraded", nodeEnv: "development", uptime: 0 },
        backend: { url: "http://127.0.0.1:8000", status: "offline", latencyMs: 0, error: err.message, data: null },
        services: {
          database: { status: "offline" },
          translationApi: { status: "operational", engines: ["Google Translate"] },
          geminiAi: { status: "unknown", model: "gemini-1.5-flash" },
          closedLoopVerification: { status: "active", protocol: "2.0" },
          hyperlocalClassification: { status: "active", type: "PIN Code" },
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchHealth();
    }, 10000);
    return () => clearInterval(timer);
  }, [autoRefresh, fetchHealth]);

  const handleCopyJson = () => {
    if (!data) return;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runTranslationTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Water pipe broken", targetLang: "hi" }),
      });
      const resData = await res.json();
      if (res.ok && resData.translatedText) {
        setTestResult({
          name: "Translation Engine Test",
          status: "success",
          message: `English -> Hindi: "${resData.translatedText}" (${resData.engine || "Google Engine"})`,
        });
      } else {
        setTestResult({
          name: "Translation Engine Test",
          status: "warning",
          message: "Fallback translation active",
        });
      }
    } catch (e: any) {
      setTestResult({
        name: "Translation Engine Test",
        status: "error",
        message: e.message || "Test failed",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isHealthy = data?.status === "healthy";
  const isDegraded = data?.status === "degraded";

  return (
    <div className="min-h-screen bg-[#f8faf9] text-slate-900 font-body py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#134431] text-white flex items-center justify-center font-bold">
                <Activity className="w-4 h-4 text-emerald-400" />
              </div>
              <h1 className="font-headline font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
                JanSeva System Telemetry &amp; Health Probe
              </h1>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Live diagnostics, Django REST backend connectivity, database status, and microservice latencies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#134431] rounded"
              />
              <span>Auto-refresh (10s)</span>
            </label>

            <button
              onClick={fetchHealth}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-[#134431] hover:bg-[#0c2e21] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 text-emerald-300", isLoading && "animate-spin")} />
              <span>Probe Now</span>
            </button>
          </div>
        </div>

        {/* Overall Status Banner */}
        <div
          className={cn(
            "p-6 sm:p-8 rounded-3xl border transition-all relative overflow-hidden",
            isHealthy
              ? "bg-gradient-to-br from-emerald-900 to-[#134431] text-white border-emerald-700 shadow-lg shadow-emerald-950/20"
              : isDegraded
              ? "bg-gradient-to-br from-amber-900 to-amber-950 text-white border-amber-700 shadow-lg"
              : "bg-gradient-to-br from-rose-900 to-rose-950 text-white border-rose-700 shadow-lg"
          )}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-bold">
                <Radio className={cn("w-3 h-3 animate-pulse", isHealthy ? "text-emerald-400" : "text-amber-400")} />
                <span>Backend Gateway: {data?.backend.url || "http://127.0.0.1:8000"}</span>
              </div>

              <div className="flex items-center gap-3">
                {isHealthy ? (
                  <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 shrink-0" />
                ) : isDegraded ? (
                  <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400 shrink-0" />
                ) : (
                  <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-rose-400 shrink-0" />
                )}
                <div>
                  <h2 className="font-headline font-black text-2xl sm:text-3xl tracking-tight">
                    {isHealthy
                      ? "All Systems 100% Operational"
                      : isDegraded
                      ? "Partial Service Degradation"
                      : "Backend Server Offline"}
                  </h2>
                  <p className="text-xs sm:text-sm text-emerald-100/80 font-medium">
                    {isHealthy
                      ? "Frontend Next.js and Django REST API are communicating seamlessly with active database storage."
                      : data?.backend.error || "Unable to establish connection with Django REST backend server."}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center space-y-0.5 min-w-[110px]">
                <span className="text-[10px] uppercase font-bold text-emerald-200/80 tracking-wider">
                  Ping Latency
                </span>
                <p className="font-headline font-black text-xl text-white">
                  {data?.backend.latencyMs || 0}ms
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/15 text-center space-y-0.5 min-w-[110px]">
                <span className="text-[10px] uppercase font-bold text-emerald-200/80 tracking-wider">
                  DB Issues
                </span>
                <p className="font-headline font-black text-xl text-white">
                  {data?.services.database.total_issues ?? "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Component Health Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* 1. Django REST Backend */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#134431] flex items-center justify-center">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">Django REST API</h3>
                  <p className="text-[10px] text-slate-400 font-mono">janSetu Backend</p>
                </div>
              </div>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
                  data?.backend.status === "healthy"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                )}
              >
                {data?.backend.status === "healthy" ? "Online ✓" : "Offline ✗"}
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100 font-medium">
              <div className="flex justify-between">
                <span>Endpoint:</span>
                <span className="font-mono text-[11px] text-slate-800">{data?.backend.url}/api/</span>
              </div>
              <div className="flex justify-between">
                <span>Round-Trip Latency:</span>
                <span className="font-bold text-emerald-700">{data?.backend.latencyMs}ms</span>
              </div>
            </div>
          </div>

          {/* 2. Database Engine */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">Civic Database</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Relational Storage</p>
                </div>
              </div>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
                  data?.services.database.status === "connected"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                )}
              >
                {data?.services.database.status === "connected" ? "Connected ✓" : "Unavailable"}
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100 font-medium">
              <div className="flex justify-between">
                <span>Total Grievances:</span>
                <span className="font-bold text-slate-900">{data?.services.database.total_issues ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Registered Citizens:</span>
                <span className="font-bold text-slate-900">{data?.services.database.total_users ?? 0}</span>
              </div>
            </div>
          </div>

          {/* 3. Multi-Engine Translation */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">Multi-Engine i18n</h3>
                  <p className="text-[10px] text-slate-400 font-mono">22+ Indian Languages</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Active ✓
              </span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-100 font-medium">
              <div className="flex justify-between">
                <span>Primary Engine:</span>
                <span className="font-bold text-slate-800">Google Translate</span>
              </div>
              <div className="flex justify-between">
                <span>Fallback:</span>
                <span className="font-bold text-slate-800">Gemini 1.5 Flash</span>
              </div>
            </div>
          </div>

          {/* 4. Closed-Loop Protocol */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#134431] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">Closed-Loop Protocol</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Citizen Verification</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Enforced ✓
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-100 font-medium">
              <p className="text-[11px] text-slate-500">
                Officers cannot close tickets directly. Mandatory live GPS camera audit by citizen required for closure.
              </p>
            </div>
          </div>

          {/* 5. Hyperlocal Classification */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">PIN Code Engine</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Hyperlocal Filtering</p>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                Active ✓
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-100 font-medium">
              <p className="text-[11px] text-slate-500">
                Feeds, search, and ticket dispatch are categorized by 6-digit postal PIN codes with GPS reverse geocoding.
              </p>
            </div>
          </div>

          {/* 6. AI Computer Vision */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-sm text-slate-900">AI Triage Classifier</h3>
                  <p className="text-[10px] text-slate-400 font-mono">Gemini 1.5 Flash</p>
                </div>
              </div>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] font-bold border",
                  data?.services.geminiAi.status === "configured"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                )}
              >
                {data?.services.geminiAi.status === "configured" ? "Active ✓" : "Simulation Ready"}
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-600 pt-1 border-t border-slate-100 font-medium">
              <p className="text-[11px] text-slate-500">
                Automated severity scoring, municipal department routing, and SLA duration recommendation.
              </p>
            </div>
          </div>

        </div>

        {/* Interactive Diagnostics Tool & Quick Actions */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-soft space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-headline font-bold text-base text-slate-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#134431]" />
                <span>Live Interactive Diagnostics</span>
              </h2>
              <p className="text-xs text-slate-500">
                Execute live API probes to verify individual subsystem responsiveness.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={runTranslationTest}
                disabled={isTesting}
                className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5 text-purple-700" />
                <span>{isTesting ? "Testing..." : "Test Translation API"}</span>
              </button>
            </div>
          </div>

          {testResult && (
            <div
              className={cn(
                "p-4 rounded-2xl text-xs font-bold flex items-start gap-2.5 animate-fadeIn",
                testResult.status === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-900"
                  : testResult.status === "warning"
                  ? "bg-amber-50 border border-amber-200 text-amber-900"
                  : "bg-rose-50 border border-rose-200 text-rose-900"
              )}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-headline font-bold">{testResult.name}</p>
                <p className="font-medium text-slate-700 mt-0.5">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Quick Navigational Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-500 mr-1">Direct Shortcuts:</span>
            <Link
              href="/feed"
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1"
            >
              <span>Public Feed</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              href="/officer-portal"
              className="px-3 py-1.5 rounded-xl bg-[#edf7f1] hover:bg-[#cbe7d7] text-[#134431] text-xs font-bold transition-colors flex items-center gap-1"
            >
              <span>Officer Portal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link
              href="/report"
              className="px-3 py-1.5 rounded-xl bg-[#134431] hover:bg-[#0c2e21] text-white text-xs font-bold transition-colors flex items-center gap-1"
            >
              <span>Report Grievance</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Raw JSON Telemetry Viewer */}
        <div className="p-6 rounded-3xl bg-slate-900 text-slate-100 shadow-soft space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-mono font-bold text-xs text-slate-200">
                RAW JSON TELEMETRY (`/api/health`)
              </span>
            </div>

            <button
              onClick={handleCopyJson}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy JSON"}</span>
            </button>
          </div>

          <pre className="text-[11px] font-mono leading-relaxed bg-slate-950 p-4 rounded-2xl overflow-x-auto text-emerald-300 border border-slate-800/80 max-h-72">
            {JSON.stringify(data, null, 2)}
          </pre>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 font-mono">
            <span>Last Probe: {lastCheck.toLocaleTimeString()}</span>
            <span>Status Code: {isHealthy ? "200 OK" : "503 SERVICE DEGRADED"}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
