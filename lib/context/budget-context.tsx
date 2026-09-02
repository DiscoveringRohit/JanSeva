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

interface BudgetContextProps {
  proposals: BudgetProposal[];
  userVotes: string[];
  addProposal: (proposal: Omit<BudgetProposal, "id" | "currentVotes" | "status" | "createdAt">) => void;
  voteProposal: (id: string) => void;
  updateProposalStatus: (id: string, status: ProposalStatus) => void;
  getWardBudgetSummary: (wardPin: string) => { totalBudget: number; spent: number; available: number };
}

const BudgetContext = createContext<BudgetContextProps | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [proposals, setProposals] = useState<BudgetProposal[]>([]);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedProposals = localStorage.getItem("janseva_budget_proposals");
      const storedVotes = localStorage.getItem("janseva_budget_votes");

      if (storedProposals) {
        setProposals(JSON.parse(storedProposals));
      } else {
        const seedData: BudgetProposal[] = [
          {
            id: "prop-1",
            title: "24x7 Pressurized Drinking Water Metering Installation",
            category: "Water Works",
            description: "Proposal to replace legacy gravity mains with automated smart digital telemetry water meters.",
            requiredBudget: 4850000,
            currentVotes: 1420,
            status: "Open for Voting",
            wardPin: "751024",
            createdBy: "Officer Bikram",
            createdAt: new Date().toISOString(),
          },
          {
            id: "prop-2",
            title: "Underground Stormwater Canal Enclosure",
            category: "Roads & Infrastructure",
            description: "Install pre-cast RCC culverts to box-in open roadside stormwater drains.",
            requiredBudget: 8200000,
            currentVotes: 2105,
            status: "Threshold Met",
            wardPin: "751024",
            createdBy: "Officer Santosh",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          }
        ];
        setProposals(seedData);
        localStorage.setItem("janseva_budget_proposals", JSON.stringify(seedData));
      }

      if (storedVotes) {
        setUserVotes(JSON.parse(storedVotes));
      }
    } catch (error) {
      console.error("Failed to load budget data from localStorage", error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("janseva_budget_proposals", JSON.stringify(proposals));
    }
  }, [proposals, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("janseva_budget_votes", JSON.stringify(userVotes));
    }
  }, [userVotes, isLoaded]);

  const addProposal = (newProposalData: Omit<BudgetProposal, "id" | "currentVotes" | "status" | "createdAt">) => {
    const newProposal: BudgetProposal = {
      ...newProposalData,
      id: "prop-" + Date.now(),
      currentVotes: 0,
      status: "Open for Voting",
      createdAt: new Date().toISOString(),
    };
    setProposals((prev) => [newProposal, ...prev]);
  };

  const voteProposal = (id: string) => {
    if (userVotes.includes(id)) return;

    setProposals((prev) =>
      prev.map((prop) =>
        prop.id === id ? { ...prop, currentVotes: prop.currentVotes + 1 } : prop
      )
    );
    setUserVotes((prev) => [...prev, id]);
  };

  const updateProposalStatus = (id: string, status: ProposalStatus) => {
    setProposals((prev) =>
      prev.map((prop) => (prop.id === id ? { ...prop, status } : prop))
    );
  };

  const getWardBudgetSummary = (wardPin: string) => {
    const TOTAL_BUDGET = 50000000;
    const wardProposals = proposals.filter((p) => p.wardPin === wardPin);
    
    const spent = wardProposals
      .filter((p) => p.status === "In Execution")
      .reduce((sum, p) => sum + p.requiredBudget, 0);
      
    const committed = wardProposals
      .filter((p) => p.status === "Threshold Met")
      .reduce((sum, p) => sum + p.requiredBudget, 0);

    const available = TOTAL_BUDGET - spent - committed;

    return { totalBudget: TOTAL_BUDGET, spent, available };
  };

  return (
    <BudgetContext.Provider
      value={{
        proposals,
        userVotes,
        addProposal,
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
