import { fetchWithAuth } from "@/lib/auth/auth-service-cookie3";
import { ConsensusPoll } from "@/lib/context/poll-context";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function fetchPollsFromBackend(ward?: string, department?: string): Promise<ConsensusPoll[]> {
  try {
    const params = new URLSearchParams();
    if (ward && ward.toLowerCase() !== "all") params.set("ward", ward);
    if (department && department.toLowerCase() !== "all") params.set("department", department);

    const res = await fetch(`${API}/api/polls/?${params.toString()}`);
    if (!res.ok) {
      console.warn("fetchPollsFromBackend returned status", res.status);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching polls from backend:", error);
    return [];
  }
}

export async function createPollInBackend(poll: ConsensusPoll): Promise<ConsensusPoll | null> {
  try {
    const res = await fetchWithAuth(`${API}/api/polls/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(poll),
    });

    if (!res.ok) {
      // If unauthorized, attempt unauthenticated POST
      const fallbackRes = await fetch(`${API}/api/polls/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(poll),
      });
      if (fallbackRes.ok) {
        return await fallbackRes.json();
      }
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Error creating poll in backend:", error);
    return null;
  }
}

export async function votePollInBackend(pollId: string, voteType: "yes" | "no", userId?: string): Promise<ConsensusPoll | null> {
  try {
    const res = await fetchWithAuth(`${API}/api/polls/${pollId}/vote/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote: voteType, userId }),
    });

    if (!res.ok) {
      const fallbackRes = await fetch(`${API}/api/polls/${pollId}/vote/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote: voteType, userId }),
      });
      if (fallbackRes.ok) {
        const data = await fallbackRes.json();
        return data.poll || null;
      }
      return null;
    }

    const data = await res.json();
    return data.poll || null;
  } catch (error) {
    console.error("Error voting on poll in backend:", error);
    return null;
  }
}

export async function updatePollStatusInBackend(pollId: string, status: "Active Ballot" | "Approved" | "Rejected"): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`${API}/api/polls/${pollId}/status/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const fallbackRes = await fetch(`${API}/api/polls/${pollId}/status/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      return fallbackRes.ok;
    }
    return true;
  } catch (error) {
    console.error("Error updating poll status in backend:", error);
    return false;
  }
}

export async function deletePollInBackend(pollId: string): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`${API}/api/polls/${pollId}/`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const fallbackRes = await fetch(`${API}/api/polls/${pollId}/`, {
        method: "DELETE",
      });
      return fallbackRes.ok;
    }
    return true;
  } catch (error) {
    console.error("Error deleting poll in backend:", error);
    return false;
  }
}
