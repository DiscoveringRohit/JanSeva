"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface ConsensusPoll {
  id: string;
  title: string;
  department: string;
  ward: string;
  description: string;
  yesVotes: number;
  noVotes: number;
  status: "Active Ballot" | "Approved" | "Rejected";
  daysLeft: number;
  budgetEstimate: string;
}

interface PollContextType {
  polls: ConsensusPoll[];
  userVotes: { pollId: string; vote: "yes" | "no" }[];
  addPoll: (poll: ConsensusPoll) => void;
  votePoll: (pollId: string, voteType: "yes" | "no") => void;
  updatePollStatus: (pollId: string, status: "Active Ballot" | "Approved" | "Rejected") => void;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export function PollProvider({ children }: { children: React.ReactNode }) {
  const [polls, setPolls] = useState<ConsensusPoll[]>([]);
  const [userVotes, setUserVotes] = useState<{ pollId: string; vote: "yes" | "no" }[]>([]);

  useEffect(() => {
    const savedPolls = localStorage.getItem("janseva_consensus_polls");
    const savedVotes = localStorage.getItem("janseva_consensus_user_votes");
    if (savedPolls) {
      setPolls(JSON.parse(savedPolls));
    } else {
      // Default initial mock data
      const initial = [
        {
          id: "poll-1",
          title: "24x7 Pressurized Drinking Water Metering Installation",
          department: "Water",
          ward: "751024",
          description: "Proposal to replace legacy gravity mains with automated smart digital telemetry water meters.",
          yesVotes: 1420,
          noVotes: 190,
          status: "Active Ballot",
          daysLeft: 4,
          budgetEstimate: "? 48.5 Lakhs"
        } as ConsensusPoll
      ];
      setPolls(initial);
      localStorage.setItem("janseva_consensus_polls", JSON.stringify(initial));
    }

    if (savedVotes) {
      setUserVotes(JSON.parse(savedVotes));
    }
  }, []);

  const savePolls = (newPolls: ConsensusPoll[]) => {
    setPolls(newPolls);
    localStorage.setItem("janseva_consensus_polls", JSON.stringify(newPolls));
  };

  const saveUserVotes = (newVotes: { pollId: string; vote: "yes" | "no" }[]) => {
    setUserVotes(newVotes);
    localStorage.setItem("janseva_consensus_user_votes", JSON.stringify(newVotes));
  };

  const addPoll = (poll: ConsensusPoll) => {
    savePolls([poll, ...polls]);
  };

  const votePoll = (pollId: string, voteType: "yes" | "no") => {
    const existingVote = userVotes.find((v) => v.pollId === pollId);
    if (existingVote) return; // already voted

    const updatedPolls = polls.map((p) => {
      if (p.id === pollId) {
        return {
          ...p,
          yesVotes: voteType === "yes" ? p.yesVotes + 1 : p.yesVotes,
          noVotes: voteType === "no" ? p.noVotes + 1 : p.noVotes,
        };
      }
      return p;
    });

    savePolls(updatedPolls);
    saveUserVotes([...userVotes, { pollId, vote: voteType }]);
  };

  const updatePollStatus = (pollId: string, status: "Active Ballot" | "Approved" | "Rejected") => {
    const updated = polls.map((p) => (p.id === pollId ? { ...p, status } : p));
    savePolls(updated);
  };

  return (
    <PollContext.Provider value={{ polls, userVotes, addPoll, votePoll, updatePollStatus }}>
      {children}
    </PollContext.Provider>
  );
}

export function usePolls() {
  const context = useContext(PollContext);
  if (context === undefined) {
    throw new Error("usePolls must be used within a PollProvider");
  }
  return context;
}
