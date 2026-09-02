"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  fetchPollsFromBackend,
  createPollInBackend,
  votePollInBackend,
  updatePollStatusInBackend,
  deletePollInBackend,
} from "@/lib/api/polls";

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
  deletePoll: (pollId: string) => void;
  votePoll: (pollId: string, voteType: "yes" | "no") => void;
  updatePollStatus: (pollId: string, status: "Active Ballot" | "Approved" | "Rejected") => void;
  refreshPolls: () => Promise<void>;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export function PollProvider({ children }: { children: React.ReactNode }) {
  const [polls, setPolls] = useState<ConsensusPoll[]>([]);
  const [userVotes, setUserVotes] = useState<{ pollId: string; vote: "yes" | "no" }[]>([]);

  const refreshPolls = async () => {
    try {
      const backendPolls = await fetchPollsFromBackend();
      if (backendPolls && backendPolls.length > 0) {
        setPolls(backendPolls);
        if (typeof window !== "undefined") {
          localStorage.setItem("janseva_consensus_polls", JSON.stringify(backendPolls));
        }
      }
    } catch (e) {
      console.error("Failed to refresh polls from backend:", e);
    }
  };

  useEffect(() => {
    try {
      // 1. Instant hydration from localStorage cache
      const savedPolls = typeof window !== "undefined" ? localStorage.getItem("janseva_consensus_polls") : null;
      const savedVotes = typeof window !== "undefined" ? localStorage.getItem("janseva_consensus_user_votes") : null;
      if (savedPolls) {
        const parsed = JSON.parse(savedPolls);
        setPolls(Array.isArray(parsed) ? parsed : []);
      }
      if (savedVotes) {
        const parsedVotes = JSON.parse(savedVotes);
        setUserVotes(Array.isArray(parsedVotes) ? parsedVotes : []);
      }

      // 2. Fetch fresh ground-truth from backend Django database
      refreshPolls();
    } catch {
      setPolls([]);
      setUserVotes([]);
    }
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "janseva_consensus_polls" && e.newValue) {
        try {
          setPolls(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === "janseva_consensus_user_votes" && e.newValue) {
        try {
          setUserVotes(JSON.parse(e.newValue));
        } catch {}
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handleStorage);
      return () => window.removeEventListener("storage", handleStorage);
    }
  }, []);

  const addPoll = (poll: ConsensusPoll) => {
    // Optimistic local update
    setPolls((prev) => {
      const updated = [poll, ...prev.filter((p) => p.id !== poll.id)];
      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_consensus_polls", JSON.stringify(updated));
      }
      return updated;
    });

    // Persistent backend database mutation
    createPollInBackend(poll).then((saved) => {
      if (saved) {
        setPolls((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
      }
    });
  };

  const deletePoll = (pollId: string) => {
    // Optimistic local update
    setPolls((prev) => {
      const updated = prev.filter((p) => p.id !== pollId);
      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_consensus_polls", JSON.stringify(updated));
      }
      return updated;
    });

    // Persistent backend database deletion
    deletePollInBackend(pollId);
  };

  const votePoll = (pollId: string, voteType: "yes" | "no") => {
    setUserVotes((prevVotes) => {
      if (prevVotes.some((v) => v.pollId === pollId)) return prevVotes;
      const updatedVotes = [...prevVotes, { pollId, vote: voteType }];
      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_consensus_user_votes", JSON.stringify(updatedVotes));
      }
      return updatedVotes;
    });

    // Optimistic local update
    setPolls((prevPolls) => {
      const updated = prevPolls.map((p) => {
        if (p.id === pollId) {
          return {
            ...p,
            yesVotes: voteType === "yes" ? p.yesVotes + 1 : p.yesVotes,
            noVotes: voteType === "no" ? p.noVotes + 1 : p.noVotes,
          };
        }
        return p;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_consensus_polls", JSON.stringify(updated));
      }
      return updated;
    });

    // Persistent backend database vote
    votePollInBackend(pollId, voteType).then((updatedPoll) => {
      if (updatedPoll) {
        setPolls((prev) => prev.map((p) => (p.id === updatedPoll.id ? updatedPoll : p)));
      }
    });
  };

  const updatePollStatus = (pollId: string, status: "Active Ballot" | "Approved" | "Rejected") => {
    // Optimistic local update
    setPolls((prev) => {
      const updated = prev.map((p) => (p.id === pollId ? { ...p, status } : p));
      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_consensus_polls", JSON.stringify(updated));
      }
      return updated;
    });

    // Persistent backend database status update
    updatePollStatusInBackend(pollId, status);
  };

  return (
    <PollContext.Provider value={{ polls, userVotes, addPoll, deletePoll, votePoll, updatePollStatus, refreshPolls }}>
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

