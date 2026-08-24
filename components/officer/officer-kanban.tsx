"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/context/app-context";
import { CivicIssue } from "@/lib/data/mock-data";
import { StatusBadge, UrgencyBadge } from "@/components/ui/status-badge";
import {
  ShieldCheck,
  Wrench,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  Upload,
  UserCheck,
  MapPin,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Filter,
  Check
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export function OfficerKanban({ departmentFilter }: { departmentFilter?: string }) {
  const { issues: allIssues, updateIssueStatus, user } = useApp();
  
  const issues = departmentFilter
    ? allIssues.filter(i => i.category.toLowerCase() === departmentFilter.toLowerCase())
    : allIssues;
  const [selectedTicket, setSelectedTicket] = useState<CivicIssue | null>(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState("");
  const [targetStatus, setTargetStatus] = useState<CivicIssue["status"]>("In Progress");
  const [showModal, setShowModal] = useState(false);

  const columns: { title: string; status: CivicIssue["status"]; count: number }[] = [
    { title: "New AI Triage", status: "AI Verified", count: issues.filter((i) => i.status === "AI Verified").length },
    { title: "Dispatched Squad", status: "Assigned", count: issues.filter((i) => i.status === "Assigned").length },
    { title: "Field Work Active", status: "In Progress", count: issues.filter((i) => i.status === "In Progress").length },
    { title: "Pending Verification", status: "Pending Citizen Verification", count: issues.filter((i) => i.status === "Pending Citizen Verification").length },
    { title: "Verified Resolved", status: "Verified Resolved", count: issues.filter((i) => i.status === "Verified Resolved").length },
  ];

  const handleOpenAction = (issue: CivicIssue, defaultNextStatus: CivicIssue["status"]) => {
    setSelectedTicket(issue);
    setTargetStatus(defaultNextStatus);
    setStatusUpdateNote(
      defaultNextStatus === "In Progress"
        ? "Assigned rapid response field squad. Excavation & repair equipment active on site."
        : defaultNextStatus === "Pending Citizen Verification"
        ? "Work completed by municipal squad. Requesting citizen verification."
        : "Dispatched to department specialist."
    );
    setShowModal(true);
  };

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTicket) {
      updateIssueStatus(selectedTicket.id, targetStatus, statusUpdateNote);
      setShowModal(false);
      setSelectedTicket(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Officer KPI Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white border border-surface-container-high p-5 shadow-soft">
          <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant mb-1">
            <span>Total Active Tickets</span>
            <span className="p-1.5 rounded-xl bg-primary-50 text-primary-600">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-on-surface font-headline">{issues.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>98.5% Triage Precision</span>
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-surface-container-high p-5 shadow-soft">
          <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant mb-1">
            <span>SLA Compliance Rate</span>
            <span className="p-1.5 rounded-xl bg-emerald-50 text-emerald-600">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-emerald-700 font-headline">94.2%</p>
          <p className="text-[11px] text-on-surface-variant font-medium mt-1">
            Target SLA: &lt; 24 Hours
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-surface-container-high p-5 shadow-soft">
          <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant mb-1">
            <span>Avg. Resolution Time</span>
            <span className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Wrench className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-primary-700 font-headline">18.4 hrs</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            ↓ 4.2 hrs faster than city avg
          </p>
        </div>

        <div className="rounded-3xl bg-white border border-surface-container-high p-5 shadow-soft">
          <div className="flex items-center justify-between text-xs font-bold text-on-surface-variant mb-1">
            <span>High Urgency Incidents</span>
            <span className="p-1.5 rounded-xl bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <p className="text-2xl font-black text-rose-600 font-headline">
            {issues.filter((i) => i.urgency === "Critical" && i.status !== "Pending Citizen Verification" && i.status !== "Verified Resolved").length}
          </p>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">
            Priority Rapid Deployment
          </p>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {columns.map((col) => {
          const colIssues = issues.filter((i) => i.status === col.status);

          return (
            <div
              key={col.status}
              className="rounded-3xl bg-surface-container-low/80 border border-surface-container-high p-4 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-surface-dim">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-600"></span>
                  <h3 className="font-headline font-bold text-xs text-on-surface uppercase tracking-wider">
                    {col.title}
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-white text-on-surface font-bold text-xs shadow-sm border border-surface-dim">
                  {col.count}
                </span>
              </div>

              {/* Tickets List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colIssues.length === 0 ? (
                  <div className="p-8 text-center text-xs text-on-surface-variant/60 font-medium">
                    No tickets in this stage
                  </div>
                ) : (
                  colIssues.map((issue) => (
                    <div
                      key={issue.id}
                      className="p-4 rounded-2xl bg-white border border-surface-container-high shadow-soft hover:shadow-cardHover transition-all space-y-3 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-primary-700">
                          #{issue.id}
                        </span>
                        <UrgencyBadge urgency={issue.urgency} />
                      </div>

                      <Link href={`/issues/${issue.id}`} className="block">
                        <h4 className="font-headline font-bold text-xs text-on-surface line-clamp-2 hover:text-primary-600 transition-colors">
                          {issue.title}
                        </h4>
                      </Link>

                      <div className="flex items-center gap-1 text-[11px] text-on-surface-variant">
                        <MapPin className="w-3 h-3 text-primary-600 shrink-0" />
                        <span className="truncate">{issue.location.address}</span>
                      </div>

                      {/* AI Snippet */}
                      <div className="p-2 rounded-xl bg-surface-container-low text-[10px] text-on-surface-variant font-medium flex items-center justify-between">
                        <span>{issue.assignedDepartment || "Unassigned"}</span>
                        <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1 opacity-70" />
                            <span className="font-bold text-primary-800">~{issue.aiAnalysis?.suggestedSlaHours || 48}h SLA</span>
                        </div>
                      </div>

                      {/* Action Transition Buttons */}
                      <div className="pt-2 border-t border-surface-dim flex items-center justify-between gap-2">
                        {col.status === "AI Verified" && (
                          <button
                            type="button"
                            onClick={() => handleOpenAction(issue, "Assigned")}
                            className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow transition-all flex items-center justify-center gap-1"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Dispatch Squad</span>
                          </button>
                        )}

                        {col.status === "Assigned" && (
                          <button
                            type="button"
                            onClick={() => handleOpenAction(issue, "In Progress")}
                            className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow transition-all flex items-center justify-center gap-1"
                          >
                            <Wrench className="w-3 h-3" />
                            <span>Start Work</span>
                          </button>
                        )}

                        {col.status === "In Progress" && (
                          <button
                            type="button"
                            onClick={() => handleOpenAction(issue, "Pending Citizen Verification")}
                            className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow transition-all flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Mark Resolved</span>
                          </button>
                        )}

                        {col.status === "Pending Citizen Verification" && (
                          <div className="w-full py-1.5 rounded-xl bg-amber-50 text-amber-800 text-[10px] font-bold text-center border border-amber-200 shadow-sm animate-pulse">
                            Awaiting Citizen Verification ({issue.verificationVotes?.yes || 0} ✓)
                          </div>
                        )}

                        {col.status === "Verified Resolved" && (
                          <div className="w-full py-1 rounded-xl bg-emerald-50 text-emerald-800 text-[10px] font-bold text-center border border-emerald-200">
                            Closed & Verified ✓
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Update & Photo Modal */}
      {showModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-surface-container-high space-y-5 animate-slideUp">
            
            <div className="flex items-center justify-between pb-3 border-b border-surface-dim">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-700">
                  Officer Action Portal
                </span>
                <h3 className="font-headline font-bold text-base text-on-surface">
                  Transition Ticket #{selectedTicket.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-low"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">Target Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as CivicIssue["status"])}
                  className="w-full px-3.5 py-2.5 text-xs font-bold rounded-2xl bg-surface-container-low border border-surface-dim text-on-surface"
                >
                  <option value="Assigned">Dispatched & Assigned</option>
                  <option value="In Progress">In Progress (Field Work)</option>
                  <option value="Pending Citizen Verification">Mark Resolved (Requires Citizen Verification)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Official Officer Note for Public Record
                </label>
                <textarea
                  rows={3}
                  value={statusUpdateNote}
                  onChange={(e) => setStatusUpdateNote(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-surface-container-low border border-surface-dim text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {targetStatus === "Pending Citizen Verification" && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <p className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Resolution Evidence Photo</span>
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    A post-repair photo will be attached to enable citizen satisfaction verification voting.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-surface-dim">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-2xl border border-surface-dim text-xs font-bold text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-md shadow-primary-600/30 transition-all"
                >
                  Confirm & Broadcast Update
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
