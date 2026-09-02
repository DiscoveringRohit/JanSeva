"use client";

import React, { useState } from "react";
import { useBudget, parseBudgetNumber, matchesWardOrPin } from "@/lib/context/budget-context";
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
  Vote,
  Plus,
  Sparkles,
  Layers,
  Filter,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function WardBudgetPage() {
  const { proposals, userVotes, voteProposal, addProposal, getWardBudgetSummary } = useBudget();
  const { polls, userVotes: userPollVotes, votePoll, addPoll } = usePolls();
  const { user } = useApp();

  const [selectedWardPin, setSelectedWardPin] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<"All" | "Open for Voting" | "Threshold Met" | "In Execution">("All");
  const [isCitizenProposalModalOpen, setIsCitizenProposalModalOpen] = useState(false);
  const [newProposalForm, setNewProposalForm] = useState({
    title: "",
    category: "Roads & Infrastructure",
    description: "",
    requiredBudget: "",
    wardPin: user?.pincode || ""
  });

  // Dynamically compute list of known ward PINs from user profile, active proposals and active polls
  const availablePinCodes = React.useMemo(() => {
    const pinSet = new Set<string>();
    if (user?.pincode && user.pincode.trim()) {
      pinSet.add(user.pincode.trim());
    }
    proposals.forEach((p) => {
      if (p.wardPin && p.wardPin.trim() && p.wardPin.toLowerCase() !== "all") {
        pinSet.add(p.wardPin.trim());
      }
    });
    polls.forEach((p) => {
      if (p.ward && p.ward.trim()) {
        const match = p.ward.match(/\b\d{6}\b/);
        if (match) {
          pinSet.add(match[0]);
        } else {
          pinSet.add(p.ward.trim());
        }
      }
    });
    const list = Array.from(pinSet).map((pin) => ({
      pin,
      label: `Ward / PIN ${pin}`
    }));
    return [{ pin: "all", label: "All Wards (Metro-Wide)" }, ...list];
  }, [user, proposals, polls]);

  const activeWardPin = selectedWardPin !== "all" ? selectedWardPin : (user?.pincode?.trim() || "All Wards");
  const { totalBudget, spent, available, committed } = getWardBudgetSummary(selectedWardPin !== "all" ? selectedWardPin : undefined);

  // Flexible proposals filtering using matchesWardOrPin
  const wardProposals = proposals.filter((p) => {
    const matchesStatus = activeFilter === "All" || p.status === activeFilter;
    if (!matchesStatus) return false;
    return matchesWardOrPin(p.wardPin, selectedWardPin);
  });

  // Flexible referendums filtering using matchesWardOrPin
  const wardPolls = polls.filter((p) => {
    return matchesWardOrPin(p.ward, selectedWardPin);
  });

  const formatCurrency = (amount: number) => {
    const validAmount = isNaN(amount) ? 0 : amount;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(validAmount);
  };

  const handleVoteProposal = (id: string) => {
    voteProposal(id);
    votePoll(id, "yes");
  };

  const handleVotePoll = (id: string, voteType: "yes" | "no") => {
    votePoll(id, voteType);
    if (voteType === "yes") {
      voteProposal(id);
    }
  };

  const spentPercent = totalBudget > 0 ? Math.min(100, Math.round(((spent + committed) / totalBudget) * 100)) : 0;

  return (
    <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 overflow-y-auto no-scrollbar space-y-6 lg:space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#134431] flex items-center justify-center shadow-lg shadow-emerald-950/20">
              <Award className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#191c1e] tracking-tight">Participatory Ward Budget &amp; Referendums</h1>
              <p className="text-slate-500 font-medium flex items-center gap-1.5 text-xs sm:text-sm">
                <MapPin className="w-4 h-4 text-emerald-700" /> 
                <span>Ward Zone: <strong>{selectedWardPin === "all" ? "All Municipal Wards" : `PIN ${selectedWardPin}`}</strong></span>
              </p>
            </div>
          </div>
          <p className="text-slate-600 max-w-2xl text-xs sm:text-sm mt-0.5">
            Participate in democratic municipal decision-making. Vote on civic infrastructure proposals to allocate your ward's annual development budget directly.
          </p>
        </div>

        <button
          onClick={() => {
            setNewProposalForm({
              title: "",
              category: "Roads & Infrastructure",
              description: "",
              requiredBudget: "",
              wardPin: user?.pincode || ""
            });
            setIsCitizenProposalModalOpen(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-[#134431] hover:bg-[#0c2e21] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 self-start shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-emerald-300" />
          <span>Submit Ward Initiative</span>
        </button>
      </div>

      {/* Ward PIN Filter Selector */}
      {availablePinCodes.length > 1 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/70 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-emerald-700" />
              <span>Select Hyperlocal Ward / PIN Code:</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Showing projects for selected jurisdiction</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availablePinCodes.map((item) => (
              <button
                key={item.pin}
                onClick={() => setSelectedWardPin(item.pin)}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                  selectedWardPin === item.pin
                    ? "bg-[#134431] text-white shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                )}
              >
                {selectedWardPin === item.pin && <Check className="w-3.5 h-3.5 text-emerald-300" />}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Building2 className="w-16 h-16 text-[#134431]" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Ward Budget</p>
          <p className="text-2xl sm:text-3xl font-black text-[#134431]">{formatCurrency(totalBudget)}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg w-fit">
            <AlertCircle className="w-3.5 h-3.5 text-[#134431]" />
            <span>Annual Fiscal Allocation</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Wallet className="w-16 h-16 text-emerald-600" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Available Pool</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{formatCurrency(available)}</p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Ready for Allocation</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-rose-600" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Committed &amp; In Execution</p>
          <p className="text-2xl sm:text-3xl font-black text-rose-600">{formatCurrency(spent + committed)}</p>
          <div className="mt-3.5 w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
            <div 
              className="bg-rose-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${spentPercent}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1.5">{spentPercent}% of total ward funds committed</p>
        </div>
      </div>

      {/* SECTION 1: PARTICIPATORY BUDGET PROPOSALS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#191c1e] tracking-tight">
              Participatory Budget Proposals
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm">
              Community proposals with vote progress. Proposals reaching 2,000 votes advance to municipal execution.
            </p>
          </div>

          {/* Status Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "Open for Voting", "Threshold Met", "In Execution"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter as any)}
                className={cn(
                  "px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer",
                  activeFilter === filter 
                    ? "bg-[#134431] text-white shadow-xs" 
                    : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Proposals Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {wardProposals.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white border border-slate-200/60 rounded-3xl border-dashed">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <Award className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Proposals Found</h3>
              <p className="text-slate-500 text-xs max-w-md mt-1">There are currently no proposals matching your filter for this ward.</p>
              <button
                onClick={() => setIsCitizenProposalModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl bg-[#134431] text-white text-xs font-bold shadow-xs hover:bg-[#0c2e21] transition-all"
              >
                + Submit the First Initiative
              </button>
            </div>
          ) : (
            wardProposals.map((proposal) => {
              const hasVoted = userVotes.includes(proposal.id);
              const isVotingOpen = proposal.status === "Open for Voting";
              const targetVotes = 2000;
              const progress = Math.min((proposal.currentVotes / targetVotes) * 100, 100);

              return (
                <div key={proposal.id} className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/70 shadow-sm flex flex-col h-full hover:border-emerald-200 transition-colors">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#134431]/10 text-[#134431]">
                        {proposal.category}
                      </span>
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1",
                        proposal.status === "Open for Voting" && "bg-blue-50 text-blue-700",
                        proposal.status === "Threshold Met" && "bg-emerald-50 text-emerald-700",
                        proposal.status === "In Execution" && "bg-amber-50 text-amber-700"
                      )}>
                        {proposal.status === "Open for Voting" && <Clock className="w-3.5 h-3.5" />}
                        {proposal.status === "Threshold Met" && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {proposal.status === "In Execution" && <TrendingUp className="w-3.5 h-3.5" />}
                        <span>{proposal.status}</span>
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required Budget</p>
                      <p className="text-base sm:text-lg font-black text-[#134431]">{formatCurrency(proposal.requiredBudget)}</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-[#191c1e] mb-1.5 leading-snug">{proposal.title}</h3>
                  <p className="text-slate-600 text-xs mb-5 flex-1 leading-relaxed">{proposal.description}</p>

                  <div className="mt-auto space-y-3 pt-3 border-t border-slate-100">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1.5">
                        <span className="text-slate-700">{proposal.currentVotes.toLocaleString()} Votes</span>
                        <span className="text-slate-500">Threshold: {targetVotes.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div 
                          className={cn(
                            "h-2 rounded-full transition-all duration-700",
                            progress >= 100 ? "bg-emerald-500" : "bg-[#134431]"
                          )}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleVoteProposal(proposal.id)}
                      disabled={hasVoted || !isVotingOpen}
                      className={cn(
                        "w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer",
                        hasVoted
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-not-allowed"
                          : !isVotingOpen
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-[#134431] text-white hover:bg-emerald-950 shadow-md shadow-emerald-950/20"
                      )}
                    >
                      {hasVoted ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Voted Successfully (+20 XP)</span>
                        </>
                      ) : !isVotingOpen ? (
                        <span>Voting Closed ({proposal.status})</span>
                      ) : (
                        <>
                          <ThumbsUp className="w-4 h-4" />
                          <span>Vote to Allocate Ward Budget</span>
                        </>
                      )}
                    </button>
                    <p className="text-[10px] font-medium text-slate-400 text-center uppercase tracking-wider">
                      Proposed by {proposal.createdBy} • Ward PIN {proposal.wardPin}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* SECTION 2: CITIZEN CONSENSUS REFERENDUMS */}
      <div className="pt-6 border-t border-slate-200 space-y-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl sm:text-2xl font-black text-[#191c1e] tracking-tight flex items-center gap-2">
            <Vote className="w-6 h-6 text-emerald-700" />
            <span>Active Community Referendums &amp; Consensus Ballots</span>
          </h2>
          <p className="text-slate-600 max-w-2xl text-xs sm:text-sm">
            Democratic voting on major civic infrastructure proposals. Your consensus directly guides municipal tender approvals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 pb-20">
          {wardPolls.length === 0 ? (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center bg-white border border-slate-200/60 rounded-3xl border-dashed">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <Vote className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Active Ballots</h3>
              <p className="text-slate-500 text-xs max-w-md mt-1">There are currently no Yes/No referendums active for this ward.</p>
            </div>
          ) : (
            wardPolls.map((poll) => {
              const userVote = userPollVotes.find(v => v.pollId === poll.id)?.vote;
              const totalVotes = poll.yesVotes + poll.noVotes;
              const yesPercent = totalVotes > 0 ? Math.round((poll.yesVotes / totalVotes) * 100) : 0;
              const noPercent = totalVotes > 0 ? 100 - yesPercent : 0;

              return (
                <div key={poll.id} className="bg-white rounded-3xl p-5 border border-slate-200/70 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-200 transition-colors">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#edf7f1] text-[#134431] border border-[#cbe7d7] truncate max-w-[140px]">
                        {poll.department} • {poll.ward}
                      </span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0",
                        poll.status === "Approved" ? "bg-emerald-100 text-emerald-800" :
                        poll.status === "Rejected" ? "bg-rose-100 text-rose-800" :
                        "bg-blue-100 text-blue-800"
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

                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-emerald-700 flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5" /> In Favor ({yesPercent}%)
                        </span>
                        <span className="text-slate-500">{totalVotes.toLocaleString()} votes</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${yesPercent}%` }}></div>
                        <div className="h-full bg-rose-400 transition-all duration-500" style={{ width: `${noPercent}%` }}></div>
                      </div>
                    </div>

                    {/* Voting Actions */}
                    <div className="flex items-center gap-2.5">
                      <button
                        disabled={!!userVote || poll.status !== "Active Ballot"}
                        onClick={() => handleVotePoll(poll.id, "yes")}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex justify-center items-center gap-1.5 cursor-pointer",
                          userVote === "yes" ? "bg-emerald-600 text-white shadow-sm" : 
                          userVote === "no" ? "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed" :
                          poll.status !== "Active Ballot" ? "bg-slate-100 text-slate-400 cursor-not-allowed" :
                          "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                        )}
                      >
                        {userVote === "yes" ? <CheckCircle2 className="w-4 h-4 text-white" /> : <ThumbsUp className="w-4 h-4" />}
                        <span>Vote YES</span>
                      </button>

                      <button
                        disabled={!!userVote || poll.status !== "Active Ballot"}
                        onClick={() => handleVotePoll(poll.id, "no")}
                        className={cn(
                          "flex-1 py-2.5 rounded-xl font-bold text-xs transition-all flex justify-center items-center gap-1.5 cursor-pointer",
                          userVote === "no" ? "bg-rose-600 text-white shadow-sm" : 
                          userVote === "yes" ? "bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed" :
                          poll.status !== "Active Ballot" ? "bg-slate-100 text-slate-400 cursor-not-allowed" :
                          "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                        )}
                      >
                        {userVote === "no" && <CheckCircle2 className="w-4 h-4 text-white" />}
                        <span>Vote NO</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold pt-1">
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

      {/* CREATE CITIZEN PROPOSAL MODAL */}
      {isCitizenProposalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline font-black text-xl text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-700" />
                <span>Submit Ward Budget Initiative</span>
              </h3>
              <button
                onClick={() => setIsCitizenProposalModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Propose a civic improvement project for your neighborhood. Gather community votes to qualify for municipal funding allocation.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newProposalForm.title || !newProposalForm.description) return;
                const sharedId = `initiative-${Date.now()}`;
                const numericBudget = parseBudgetNumber(newProposalForm.requiredBudget) || 2500000;
                
                // Add to budget proposals
                addProposal({
                  id: sharedId,
                  title: newProposalForm.title,
                  category: newProposalForm.category,
                  description: newProposalForm.description,
                  requiredBudget: numericBudget,
                  wardPin: newProposalForm.wardPin || user?.pincode || "751024",
                  createdBy: user?.name || "Citizen Initiator",
                  currentVotes: 1,
                  status: "Open for Voting"
                });

                // Simultaneously mirror to community referendums
                addPoll({
                  id: sharedId,
                  title: newProposalForm.title,
                  department: newProposalForm.category,
                  ward: newProposalForm.wardPin || user?.pincode || "751024",
                  description: newProposalForm.description,
                  yesVotes: 1,
                  noVotes: 0,
                  status: "Active Ballot",
                  daysLeft: 14,
                  budgetEstimate: formatCurrency(numericBudget)
                });

                setIsCitizenProposalModalOpen(false);
                setNewProposalForm({
                  title: "",
                  category: "Roads & Infrastructure",
                  description: "",
                  requiredBudget: "",
                  wardPin: user?.pincode || ""
                });
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Initiative Title *</label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Neighborhood Park Solar Lighting & Bench Installation"
                  value={newProposalForm.title}
                  onChange={(e) => setNewProposalForm({ ...newProposalForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#134431]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={newProposalForm.category}
                    onChange={(e) => setNewProposalForm({ ...newProposalForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#134431]"
                  >
                    <option value="Water Works">Water Works</option>
                    <option value="Roads & Infrastructure">Roads &amp; Infrastructure</option>
                    <option value="Electricity & Lighting">Electricity &amp; Lighting</option>
                    <option value="Sanitation & Waste">Sanitation &amp; Waste</option>
                    <option value="Green Spaces & Parks">Green Spaces &amp; Parks</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Target Ward PIN</label>
                  <input
                    required
                    type="text"
                    value={newProposalForm.wardPin}
                    onChange={(e) => setNewProposalForm({ ...newProposalForm, wardPin: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#134431]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Estimated Budget</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. ₹ 25.0 Lakhs or 2500000"
                  value={newProposalForm.requiredBudget}
                  onChange={(e) => setNewProposalForm({ ...newProposalForm, requiredBudget: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#134431]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description &amp; Community Need *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain why this project is critical for your ward and how it benefits residents..."
                  value={newProposalForm.description}
                  onChange={(e) => setNewProposalForm({ ...newProposalForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#134431] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCitizenProposalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 border border-slate-200 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#134431] hover:bg-[#0c2e21] text-white font-bold shadow-md"
                >
                  Publish Initiative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
