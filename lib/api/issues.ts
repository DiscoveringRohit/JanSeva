import { MockContextBridge } from "@/lib/context/app-context";
import { CivicIssue } from "@/lib/data/mock-data";

// Helper to get API URL safely
const getApiUrl = () => {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "http://127.0.0.1:8000";
};

const getAuthHeaders = (extraHeaders: Record<string, string> = {}) => {
  const headers: Record<string, string> = { ...extraHeaders };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("janseva_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

export async function submitIssue(payload: any) {
  try {
    const response = await fetch(`${getApiUrl()}/api/issues/`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) throw new Error("Fallback to mock");
    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    console.warn("Using mock auth fallback: submitIssue");
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      success: true,
      data: {
        id: "TKT-" + Math.floor(Math.random() * 1000000),
        ...payload,
        createdAt: new Date().toISOString(),
      },
    };
  }
}

export async function getFeed(wardId?: number, pincode?: string): Promise<CivicIssue[]> {
  try {
    let url = `${getApiUrl()}/api/issues/`;
    const params = new URLSearchParams();
    if (wardId) params.append("ward", wardId.toString());
    if (pincode) params.append("pincode", pincode);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Fallback to mock");
    const data = await response.json();
    return Array.isArray(data) ? data : (data?.results && Array.isArray(data.results) ? data.results : []);
  } catch (e) {
    // Mock Fallback
    const issues = MockContextBridge.getIssues();
    if (pincode) {
      return issues.filter((i) => (i.location?.pincode || (i as any).pin_code) === pincode);
    }
    if (wardId) {
      return issues.filter((i) => i.location?.wardNumber === wardId);
    }
    return issues;
  }
}

export async function getIssueById(id: string): Promise<CivicIssue | undefined> {
  try {
    const response = await fetch(`${getApiUrl()}/api/issues/${id}/`, {
      headers: getAuthHeaders(),
      cache: "no-store"
    });
    if (!response.ok) throw new Error("Fallback to mock");
    const data = await response.json();
    return data;
  } catch (e) {
    // Mock Fallback
    return MockContextBridge.getIssues().find((i) => i.id === id);
  }
}

export async function upvoteIssue(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${getApiUrl()}/api/issues/${id}/upvote/`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Fallback to mock");
    return true;
  } catch (e) {
    // Mock Fallback
    MockContextBridge.toggleUpvote(id);
    return true;
  }
}

export async function downvoteIssue(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${getApiUrl()}/api/issues/${id}/upvote/`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Fallback to mock");
    return true;
  } catch (e) {
    // Mock Fallback: toggleUpvote acts as an untoggle for us
    MockContextBridge.toggleUpvote(id);
    return true;
  }
}

export async function getComments(issueId: string): Promise<any[]> {
  try {
    const response = await fetch(`${getApiUrl()}/api/issues/${issueId}/comments/`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Failed to fetch comments");
    return await response.json();
  } catch (e) {
    console.warn(`Could not load comments from backend for issue ${issueId}:`, e);
    return [];
  }
}

export async function addComment(issueId: string, text: string): Promise<{ success: boolean; data?: any }> {
  try {
    const response = await fetch(`${getApiUrl()}/api/issues/${issueId}/comments/`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error("Failed to post comment");
    const data = await response.json();
    return { success: true, data };
  } catch (e) {
    console.warn("Using local fallback for addComment:", e);
    MockContextBridge.addComment(issueId, text);
    return {
      success: true,
      data: {
        id: Date.now(),
        text,
        timestamp: new Date().toISOString(),
      },
    };
  }
}

export async function deleteComment(commentId: number | string): Promise<boolean> {
  try {
    const response = await fetch(`${getApiUrl()}/api/comments/${commentId}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete comment");
    return true;
  } catch (e) {
    console.warn(`Could not delete comment ${commentId}:`, e);
    return false;
  }
}

export async function getWardStats(wardId: number): Promise<any> {
  try {
    const response = await fetch(`${getApiUrl()}/api/wards/${wardId}/stats/`);
    if (!response.ok) throw new Error("Fallback to mock");
    return await response.json();
  } catch (e) {
    // Mock Fallback
    const issues = MockContextBridge.getIssues();
    const wardIssues = issues.filter((i) => i.location.wardNumber === wardId);
    
    const total = wardIssues.length;
    const resolved = wardIssues.filter(i => i.status === "Resolved").length;
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 87;

    return {
      activeIssues: wardIssues.filter(i => ["Open", "AI Verified", "Assigned", "In Progress"].includes(i.status)).length,
      resolvedThisMonth: resolved,
      resolutionRate,
      avgResolutionTime: "48 hours",
      topCategory: "Sanitation"
    };
  }
}

export async function mergeDuplicateIssues(
  primaryId: string,
  duplicateId: string,
  reason?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(`${getApiUrl()}/api/issues/merge/`, {
      method: "POST",
      headers: getAuthHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        primary_id: primaryId,
        duplicate_id: duplicateId,
        reason: reason || "Spatial AI & Visual similarity match confirmed duplicate.",
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to merge issues on backend");
    }

    const data = await response.json();
    return { success: true, data };
  } catch (e: any) {
    console.warn("Using mock context fallback for mergeDuplicateIssues:", e.message);
    if (MockContextBridge.mergeIssues) {
      MockContextBridge.mergeIssues(primaryId, duplicateId, reason);
    }
    return {
      success: true,
      data: {
        status: "success",
        message: `Issue #${duplicateId} merged into #${primaryId} (mock mode).`,
      },
    };
  }
}

