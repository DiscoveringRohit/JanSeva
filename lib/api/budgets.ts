import { fetchWithAuth } from "@/lib/auth/auth-service-cookie3";
import { BudgetProposal, ProposalStatus } from "@/lib/context/budget-context";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchBudgetProposalsFromBackend(wardPin?: string, category?: string): Promise<BudgetProposal[]> {
  try {
    const params = new URLSearchParams();
    if (wardPin && wardPin.toLowerCase() !== "all") params.set("wardPin", wardPin);
    if (category && category.toLowerCase() !== "all") params.set("category", category);

    const res = await fetch(`${API}/api/budgets/?${params.toString()}`);
    if (!res.ok) {
      console.warn("fetchBudgetProposalsFromBackend returned status", res.status);
      return [];
    }
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      description: item.description,
      requiredBudget: typeof item.requiredBudget === "number" ? item.requiredBudget : parseFloat(item.requiredBudget || item.required_budget || "0"),
      currentVotes: item.currentVotes ?? item.current_votes ?? 0,
      status: item.status || "Open for Voting",
      wardPin: item.wardPin || item.ward_pin || "751024",
      createdBy: item.createdBy || item.createdByName || "Citizen Initiator",
      createdAt: item.createdAt || item.created_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching budget proposals from backend:", error);
    return [];
  }
}

export async function createBudgetProposalInBackend(proposal: Partial<BudgetProposal>): Promise<BudgetProposal | null> {
  try {
    const payload = {
      id: proposal.id,
      title: proposal.title,
      category: proposal.category,
      description: proposal.description,
      requiredBudget: proposal.requiredBudget,
      required_budget: proposal.requiredBudget,
      wardPin: proposal.wardPin,
      ward_pin: proposal.wardPin,
      status: proposal.status || "Open for Voting",
      createdBy: proposal.createdBy,
    };

    const res = await fetchWithAuth(`${API}/api/budgets/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const fallbackRes = await fetch(`${API}/api/budgets/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (fallbackRes.ok) {
        const item = await fallbackRes.json();
        return {
          id: item.id,
          title: item.title,
          category: item.category,
          description: item.description,
          requiredBudget: typeof item.requiredBudget === "number" ? item.requiredBudget : parseFloat(item.requiredBudget || item.required_budget || "0"),
          currentVotes: item.currentVotes ?? item.current_votes ?? 0,
          status: item.status || "Open for Voting",
          wardPin: item.wardPin || item.ward_pin || "751024",
          createdBy: item.createdBy || item.createdByName || "Citizen Initiator",
          createdAt: item.createdAt || item.created_at || new Date().toISOString(),
        };
      }
      return null;
    }

    const item = await res.json();
    return {
      id: item.id,
      title: item.title,
      category: item.category,
      description: item.description,
      requiredBudget: typeof item.requiredBudget === "number" ? item.requiredBudget : parseFloat(item.requiredBudget || item.required_budget || "0"),
      currentVotes: item.currentVotes ?? item.current_votes ?? 0,
      status: item.status || "Open for Voting",
      wardPin: item.wardPin || item.ward_pin || "751024",
      createdBy: item.createdBy || item.createdByName || "Citizen Initiator",
      createdAt: item.createdAt || item.created_at || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error creating budget proposal in backend:", error);
    return null;
  }
}

export async function voteBudgetProposalInBackend(proposalId: string, userId?: string): Promise<BudgetProposal | null> {
  try {
    const res = await fetchWithAuth(`${API}/api/budgets/${proposalId}/vote/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (!res.ok) {
      const fallbackRes = await fetch(`${API}/api/budgets/${proposalId}/vote/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        const item = data.proposal;
        if (item) {
          return {
            id: item.id,
            title: item.title,
            category: item.category,
            description: item.description,
            requiredBudget: typeof item.requiredBudget === "number" ? item.requiredBudget : parseFloat(item.requiredBudget || item.required_budget || "0"),
            currentVotes: item.currentVotes ?? item.current_votes ?? 0,
            status: item.status || "Open for Voting",
            wardPin: item.wardPin || item.ward_pin || "751024",
            createdBy: item.createdBy || item.createdByName || "Citizen Initiator",
            createdAt: item.createdAt || item.created_at || new Date().toISOString(),
          };
        }
      }
      return null;
    }

    const data = await res.json();
    const item = data.proposal;
    if (item) {
      return {
        id: item.id,
        title: item.title,
        category: item.category,
        description: item.description,
        requiredBudget: typeof item.requiredBudget === "number" ? item.requiredBudget : parseFloat(item.requiredBudget || item.required_budget || "0"),
        currentVotes: item.currentVotes ?? item.current_votes ?? 0,
        status: item.status || "Open for Voting",
        wardPin: item.wardPin || item.ward_pin || "751024",
        createdBy: item.createdBy || item.createdByName || "Citizen Initiator",
        createdAt: item.createdAt || item.created_at || new Date().toISOString(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error voting on budget proposal in backend:", error);
    return null;
  }
}

export async function updateBudgetProposalStatusInBackend(proposalId: string, status: ProposalStatus): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`${API}/api/budgets/${proposalId}/status/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const fallbackRes = await fetch(`${API}/api/budgets/${proposalId}/status/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return fallbackRes.ok;
    }
    return true;
  } catch (error) {
    console.error("Error updating budget proposal status in backend:", error);
    return false;
  }
}

export async function deleteBudgetProposalInBackend(proposalId: string): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`${API}/api/budgets/${proposalId}/`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const fallbackRes = await fetch(`${API}/api/budgets/${proposalId}/`, {
        method: "DELETE",
      });
      return fallbackRes.ok;
    }
    return true;
  } catch (error) {
    console.error("Error deleting budget proposal in backend:", error);
    return false;
  }
}
