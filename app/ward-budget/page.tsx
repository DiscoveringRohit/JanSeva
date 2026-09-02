"use client";

import React, { useState } from "react";
import { useBudget } from "@/lib/context/budget-context";
import { usePolls } from "@/lib/context/poll-context";
import { useApp } from "@/lib/context/app-context";
import { 
  Award, 
  Wallet, 
  TrendingUp, 
  ThumbsUp, 
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  AlertCircle,
  Vote
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WardBudgetPage() {
  const { proposals, userVotes, voteProposal, getWardBudgetSummary } = useBudget();
  const { polls, userVotes: userPollVotes, votePoll } = usePolls();
  const { user } = useApp();
  const [activeFilter, setActiveFilter] = useState<"All" | "Open for Voting" | "Threshold Met" | "In Execution">("All");

  const wardPin = user?.pincode?.trim() || "751024";
  const { totalBudget, spent, available } = getWardBudgetSummary(wardPin);

  const wardProposals = proposals.filter((p) => p.wardPin === wardPin && (activeFilter === "All" || p.status === activeFilter));
  
  // Basic substring check since officer types "Ward 63, Khandagiri" and pin is "751024"
  // For safety, let's just show all active polls or filter loosely.
  // In a real app we'd map ward PIN to ward string.
  const wardPolls = polls;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto no-scrollbar space-y-6 lg:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#134431] flex items-center justify-center shadow-lg shadow-emerald-950/20">
            <Award className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#191c1e] tracking-tight">Ward Budget & Polls</h1>
            <p className="text-slate-500 font-medium flex items-center gap-1.5 text-sm sm:text-base">
              <MapPin className="w-4 h-4" /> PIN: {wardPin}
            </p>
          </div>
        </div>
        <p className="text-slate-600 max-w-2xl mt-1">
          Participate in democratic decision-making. Vote on civic infrastructure proposals to allocate your ward's annual development budget directly.
        </p>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Building2 className="w-16 h-16 text-[#134431]" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Ward Budget</p>
          <p className="text-3xl font-black text-[#134431]">{formatCurrency(totalBudget)}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg w-fit">
            <AlertCircle className="w-3.5 h-3.5 text-[#134431]" />
            Annual Allocation
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-16 h-16 text-emerald-600" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Available Pool</p>
          <p className="text-3xl font-black text-emerald-600">{formatCurrency(available)}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Ready for Allocation
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-rose-600" />
          </div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Committed / Spent</p>
          <p className="text-3xl font-black text-rose-600">{formatCurrency(spent)}</p>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
            <div 
              className="bg-rose-500 h-1.5 rounded-full" 
              style={{ width: `${(spent / totalBudget) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {["All", "Open for Voting", "Threshold Met", "In Execution"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter as any)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold transition-all",
              activeFilter === filter 
                ? "bg-[#134431] text-white shadow-md shadow-emerald-950/20" 
                : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Proposals Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 pb-24">
        {wardProposals.length === 0 ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white border border-slate-200/60 rounded-3xl border-dashed">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Proposals Found</h3>
            <p className="text-slate-500 max-w-md mt-1">There are currently no proposals matching your filter for this ward.</p>
          </div>
        ) : (
          wardProposals.map((proposal) => {
            const hasVoted = userVotes.includes(proposal.id);
            const isVotingOpen = proposal.status === "Open for Voting";
            const targetVotes = 2000;
            const progress = Math.min((proposal.currentVotes / targetVotes) * 100, 100);

            return (
              <div key={proposal.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/60 shadow-sm flex flex-col h-full hover:border-emerald-200 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#134431]/10 text-[#134431]">
                      {proposal.category}
                    </span>
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1",
                      proposal.status === "Open for Voting" && "bg-blue-50 text-blue-700",
                      proposal.status === "Threshold Met" && "bg-emerald-50 text-emerald-700",
                      proposal.status === "In Execution" && "bg-amber-50 text-amber-700"
                    )}>
                      {proposal.status === "Open for Voting" && <Clock className="w-3.5 h-3.5" />}
                      {proposal.status === "Threshold Met" && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {proposal.status === "In Execution" && <TrendingUp className="w-3.5 h-3.5" />}
                      {proposal.status}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Required Budget</p>
                    <p className="text-lg sm:text-xl font-black text-[#134431]">{formatCurrency(proposal.requiredBudget)}</p>
                  </div>
                </div>

                <h3 className="text-xl font-black text-[#191c1e] mb-2">{proposal.title}</h3>
                <p className="text-slate-600 text-sm mb-6 flex-1">{proposal.description}</p>

                <div className="mt-auto space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm font-semibold mb-1.5">
                      <span className="text-slate-700">{proposal.currentVotes.toLocaleString()} Votes</span>
                      <span className="text-slate-500">Target: {targetVotes.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div 
                        className={cn(
                          "h-2.5 rounded-full transition-all duration-1000",
                          progress >= 100 ? "bg-emerald-500" : "bg-[#134431]"
                        )}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => voteProposal(proposal.id)}
                    disabled={hasVoted || !isVotingOpen}
                    className={cn(
                      "w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                      hasVoted
                        ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200 cursor-not-allowed"
                        : !isVotingOpen
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-[#134431] text-white hover:bg-emerald-950 shadow-lg shadow-emerald-950/20"
                    )}
                  >
                    {hasVoted ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Voted Successfully
                      </>
                    ) : !isVotingOpen ? (
                      "Voting Closed"
                    ) : (
                      <>
                        <ThumbsUp className="w-5 h-5" />
                        Vote to Allocate
                      </>
                    )}
                  </button>
                  <p className="text-[11px] font-medium text-slate-400 text-center uppercase tracking-wider">
                    Proposed by {proposal.createdBy}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CITIZEN CONSENSUS POLLS (YES/NO BALLOTS) */}
      <div className="pt-8 border-t border-slate-200">
        <div className="flex flex-col gap-2 mb-6">
          <h2 className="text-xl sm:text-2xl font-black text-[#191c1e] tracking-tight">Active Community Referendums</h2>
          <p className="text-slate-600 max-w-2xl text-sm sm:text-base">
            Vote Yes or No on civic planning initiatives. Your consensus directly influences contractor tenders.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 pb-24">
          {wardPolls.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white border border-slate-200/60 rounded-3xl border-dashed">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <Vote className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Active Ballots</h3>
              <p className="text-slate-500 max-w-md mt-1">There are currently no Yes/No referendums active for your ward.</p>
            </div>
          ) : (
            wardPolls.map((poll) => {
              const userVote = userPollVotes.find(v => v.pollId === poll.id)?.vote;
              const totalVotes = poll.yesVotes + poll.noVotes;
              const yesPercent = totalVotes > 0 ? Math.round((poll.yesVotes / totalVotes) * 100) : 0;
              const noPercent = totalVotes > 0 ? 100 - yesPercent : 0;

              return (
                <div key={poll.id} className="bg-white rounded-3xl p-5 border border-slate-200/60 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-200 transition-colors">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#edf7f1] text-[#134431] border border-[#cbe7d7] truncate max-w-[120px]">
                        {poll.department} | {poll.ward}
                      </span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0",
                        poll.status === "Active Ballot" ? "bg-blue-100 text-blue-800" : "bg-amber-100 text-amber-800"
                      )}>
                        {poll.status}
                      </span>
                    </div>

                    <h3 className="font-headline font-bold text-base text-slate-900 leading-snug">
                      {poll.title}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {poll.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-3 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-emerald-700 flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5" /> In Favor ({yesPercent}%)
                        </span>
                        <span className="text-slate-500">{totalVotes.toLocaleString()} votes</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${yesPercent}%` }}></div>
                        <div className="h-full bg-rose-400 transition-all duration-500" style={{ width: `${noPercent}%` }}></div>
                      </div>
                    </div>

                    {/* Voting Actions */}
                    <div className="flex items-center gap-3">
                      <button
                        disabled={!!userVote || poll.status !== "Active Ballot"}
                        onClick={() => votePoll(poll.id, "yes")}
                        className={cn(
                          "flex-1 py-2 rounded-xl font-bold text-xs transition-all flex justify-center items-center gap-1",
                          userVote === "yes" ? "bg-emerald-600 text-white shadow-md shadow-emerald-900/20" : 
                          userVote === "no" ? "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed" :
                          poll.status !== "Active Ballot" ? "bg-slate-100 text-slate-400 cursor-not-allowed" :
                          "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        )}
                      >
                        {userVote === "yes" ? <CheckCircle2 className="w-4 h-4" /> : <ThumbsUp className="w-4 h-4" />}
                        Yes
                      </button>

                      <button
                        disabled={!!userVote || poll.status !== "Active Ballot"}
                        onClick={() => votePoll(poll.id, "no")}
                        className={cn(
                          "flex-1 py-2 rounded-xl font-bold text-xs transition-all flex justify-center items-center gap-1",
                          userVote === "no" ? "bg-rose-600 text-white shadow-md shadow-rose-900/20" : 
                          userVote === "yes" ? "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed" :
                          poll.status !== "Active Ballot" ? "bg-slate-100 text-slate-400 cursor-not-allowed" :
                          "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                        )}
                      >
                        {userVote === "no" && <CheckCircle2 className="w-4 h-4" />}
                        No
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                      <span>Est: <strong className="text-slate-900">{poll.budgetEstimate || "N/A"}</strong></span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {poll.daysLeft > 0 ? `${poll.daysLeft} days left` : "Closed"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
