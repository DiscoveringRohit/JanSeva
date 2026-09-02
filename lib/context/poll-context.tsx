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
  deletePoll: (pollId: string) => void;
  votePoll: (pollId: string, voteType: "yes" | "no") => void;
  updatePollStatus: (pollId: string, status: "Active Ballot" | "Approved" | "Rejected") => void;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export function PollProvider({ children }: { children: React.ReactNode }) {
  const [polls, setPolls] = useState<ConsensusPoll[]>([]);
  const [userVotes, setUserVotes] = useState<{ pollId: string; vote: "yes" | "no" }[]>([]);

  useEffect(() => {
    try {
      const savedPolls = typeof window !== "undefined" ? localStorage.getItem("janseva_consensus_polls") : null;
      const savedVotes = typeof window !== "undefined" ? localStorage.getItem("janseva_consensus_user_votes") : null;
      if (savedPolls) {
        const parsed = JSON.parse(savedPolls);
        setPolls(Array.isArray(parsed) ? parsed : []);
      } else {
        setPolls([]);
      }
      if (savedVotes) {
        const parsedVotes = JSON.parse(savedVotes);
        setUserVotes(Array.isArray(parsedVotes) ? parsedVotes : []);
      } else {
        setUserVotes([]);
      }

      // Sync with server API ballots if available
      fetch("/api/ballots")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && Array.isArray(data.ballots) && data.ballots.length > 0) {
            setPolls((prev) => {
              const combinedMap = new Map<string, ConsensusPoll>();
              prev.forEach((p) => combinedMap.set(p.id, p));
              data.ballots.forEach((b: ConsensusPoll) => {
                if (!combinedMap.has(b.id)) {
                  combinedMap.set(b.id, b);
                }
              });
              const combined = Array.from(combinedMap.values());
              if (typeof window !== "undefined") {
                localStorage.setItem("janseva_consensus_polls", JSON.stringify(combined));
              }
              return combined;
            });
          }
        })
        .catch(() => {});
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
    setPolls((prev) => {
      const updated = [poll, ...prev.filter((p) => p.id !== poll.id)];
      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_consensus_polls", JSON.stringify(updated));
      }
      return updated;
    });

    // Mirror to server API
    fetch("/api/ballots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(poll),
    }).catch(() => {});
  };

  const deletePoll = (pollId: string) => {
    setPolls((prev) => {
      const updated = prev.filter((p) => p.id !== pollId);
      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_consensus_polls", JSON.stringify(updated));
      }
      return updated;
    });
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
  };

  const updatePollStatus = (pollId: string, status: "Active Ballot" | "Approved" | "Rejected") => {
    setPolls((prev) => {
      const updated = prev.map((p) => (p.id === pollId ? { ...p, status } : p));
      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_consensus_polls", JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <PollContext.Provider value={{ polls, userVotes, addPoll, deletePoll, votePoll, updatePollStatus }}>
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
