"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type ProposalStatus = "Open for Voting" | "Threshold Met" | "In Execution";

export interface BudgetProposal {
  id: string;
  title: string;
  category: string;
  description: string;
  requiredBudget: number;
  currentVotes: number;
  status: ProposalStatus;
  wardPin: string;
  createdBy: string;
  createdAt: string;
}

export function parseBudgetNumber(val: string | number): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const str = String(val).replace(/,/g, "").trim();
  
  // Check for Lakhs (e.g. "48.5 Lakhs", "₹ 48.5 Lakhs", "48.5L")
  const lakhMatch = str.match(/([\d.]+)\s*(?:lakh|lac|l)/i);
  if (lakhMatch) {
    const num = parseFloat(lakhMatch[1]);
    return isNaN(num) ? 0 : Math.round(num * 100000);
  }
  
  // Check for Crores (e.g. "1.5 Cr", "₹ 1.5 Crores")
  const crMatch = str.match(/([\d.]+)\s*(?:crore|cr)/i);
  if (crMatch) {
    const num = parseFloat(crMatch[1]);
    return isNaN(num) ? 0 : Math.round(num * 10000000);
  }
  
  // Standard numeric digits
  const numMatch = str.replace(/[^\d.]/g, "");
  const num = parseFloat(numMatch);
  return isNaN(num) ? 0 : Math.round(num);
}

export function matchesWardOrPin(itemWard?: string, filterWardOrPin?: string): boolean {
  if (!filterWardOrPin || filterWardOrPin.toLowerCase() === "all") return true;
  if (!itemWard) return true;
  
  const itemClean = itemWard.toLowerCase().trim();
  const filterClean = filterWardOrPin.toLowerCase().trim();
  
  if (itemClean === filterClean || itemClean.includes(filterClean) || filterClean.includes(itemClean) || itemClean === "all" || filterClean === "all") {
    return true;
  }
  
  // Extract 6-digit PIN numbers
  const pin1 = itemClean.match(/\b\d{6}\b/)?.[0];
  const pin2 = filterClean.match(/\b\d{6}\b/)?.[0];
  if (pin1 && pin2 && pin1 === pin2) return true;
  
  // Extract Ward numbers
  const ward1 = itemClean.match(/ward\s*(\d+)/i)?.[1];
  const ward2 = filterClean.match(/ward\s*(\d+)/i)?.[1];
  if (ward1 && ward2 && ward1 === ward2) return true;

  return false;
}

interface AddProposalInput {
  id?: string;
  title: string;
  category: string;
  description: string;
  requiredBudget: number | string;
  wardPin: string;
  createdBy: string;
  currentVotes?: number;
  status?: ProposalStatus;
}

interface BudgetContextProps {
  proposals: BudgetProposal[];
  userVotes: string[];
  addProposal: (proposal: AddProposalInput) => void;
  deleteProposal: (id: string) => void;
  voteProposal: (id: string) => void;
  updateProposalStatus: (id: string, status: ProposalStatus) => void;
  getWardBudgetSummary: (wardPin?: string) => { totalBudget: number; spent: number; available: number; committed: number };
}

const BudgetContext = createContext<BudgetContextProps | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [proposals, setProposals] = useState<BudgetProposal[]>([]);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedProposals = typeof window !== "undefined" ? localStorage.getItem("janseva_budget_proposals") : null;
      const storedVotes = typeof window !== "undefined" ? localStorage.getItem("janseva_budget_votes") : null;

      if (storedProposals) {
        const parsed = JSON.parse(storedProposals);
        setProposals(Array.isArray(parsed) ? parsed : []);
      } else {
        setProposals([]);
      }

      if (storedVotes) {
        try {
          setUserVotes(JSON.parse(storedVotes));
        } catch {
          setUserVotes([]);
        }
      }
    } catch (error) {
      console.error("Failed to load budget data from localStorage", error);
      setProposals([]);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "janseva_budget_proposals" && e.newValue) {
        try {
          setProposals(JSON.parse(e.newValue));
        } catch {}
      }
      if (e.key === "janseva_budget_votes" && e.newValue) {
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

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("janseva_budget_proposals", JSON.stringify(proposals));
    }
  }, [proposals, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("janseva_budget_votes", JSON.stringify(userVotes));
    }
  }, [userVotes, isLoaded]);

  const addProposal = (newProposalData: AddProposalInput) => {
    const numericBudget = parseBudgetNumber(newProposalData.requiredBudget);
    const newProposal: BudgetProposal = {
      title: newProposalData.title,
      category: newProposalData.category,
      description: newProposalData.description,
      wardPin: newProposalData.wardPin,
      createdBy: newProposalData.createdBy,
      requiredBudget: numericBudget > 0 ? numericBudget : 2500000,
      id: newProposalData.id || "prop-" + Date.now(),
      currentVotes: newProposalData.currentVotes ?? 0,
      status: newProposalData.status || "Open for Voting",
      createdAt: new Date().toISOString(),
    };
    setProposals((prev) => {
      const updated = [newProposal, ...prev.filter((p) => p.id !== newProposal.id)];
      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_budget_proposals", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const deleteProposal = (id: string) => {
    setProposals((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_budget_proposals", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const voteProposal = (id: string) => {
    setUserVotes((prevVotes) => {
      if (prevVotes.includes(id)) return prevVotes;
      const updatedVotes = [...prevVotes, id];
      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_budget_votes", JSON.stringify(updatedVotes));
      }
      return updatedVotes;
    });

    setProposals((prev) => {
      const updated = prev.map((prop) => {
        if (prop.id === id) {
          const newVotes = prop.currentVotes + 1;
          const newStatus = newVotes >= 2000 && prop.status === "Open for Voting" ? "Threshold Met" : prop.status;
          return { ...prop, currentVotes: newVotes, status: newStatus };
        }
        return prop;
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_budget_proposals", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const updateProposalStatus = (id: string, status: ProposalStatus) => {
    setProposals((prev) => {
      const updated = prev.map((prop) => (prop.id === id ? { ...prop, status } : prop));
      if (typeof window !== "undefined") {
        localStorage.setItem("janseva_budget_proposals", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const getWardBudgetSummary = (wardPin?: string) => {
    let matchingProposals = proposals;
    if (wardPin && wardPin.trim() && wardPin.toLowerCase() !== "all") {
      const filtered = proposals.filter((p) => matchesWardOrPin(p.wardPin, wardPin));
      if (filtered.length > 0) {
        matchingProposals = filtered;
      }
    }
    
    const spent = matchingProposals
      .filter((p) => p.status === "In Execution")
      .reduce((sum, p) => sum + parseBudgetNumber(p.requiredBudget), 0);
      
    const committed = matchingProposals
      .filter((p) => p.status === "Threshold Met")
      .reduce((sum, p) => sum + parseBudgetNumber(p.requiredBudget), 0);

    const totalRequired = matchingProposals
      .reduce((sum, p) => sum + parseBudgetNumber(p.requiredBudget), 0);

    // Dynamically calculate total budget allocation based on active initiatives
    const totalBudget = matchingProposals.length > 0 
      ? Math.max(totalRequired, spent + committed + (totalRequired > 0 ? totalRequired * 0.2 : 0)) 
      : 0;

    const available = Math.max(0, totalBudget - spent - committed);

    return { totalBudget, spent, available, committed };
  };

  return (
    <BudgetContext.Provider
      value={{
        proposals,
        userVotes,
        addProposal,
        deleteProposal,
        voteProposal,
        updateProposalStatus,
        getWardBudgetSummary,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error("useBudget must be used within a BudgetProvider");
  }
  return context;
}
