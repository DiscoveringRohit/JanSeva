import { MockContextBridge } from "@/lib/context/app-context";
import { CivicIssue } from "@/lib/data/mock-data";

// Helper to get API URL safely
const getApiUrl = () => {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "http://127.0.0.1:8000";
};

export async function submitIssue(payload: any) {
  try {
    const response = await fetch(`${getApiUrl()}/api/issues/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Need auth token here if backend requires it, assuming it's handled by cookies or we need to pass it
      },
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

export async function getFeed(wardId?: number): Promise<CivicIssue[]> {
  try {
    const response = await fetch(`${getApiUrl()}/api/issues/${wardId ? `?ward=${wardId}` : ""}`);
    if (!response.ok) throw new Error("Fallback to mock");
    const data = await response.json();
    return data;
  } catch (e) {
    // Mock Fallback
    const issues = MockContextBridge.getIssues();
    if (wardId) {
      return issues.filter((i) => i.location.wardNumber === wardId);
    }
    return issues;
  }
}

export async function getIssueById(id: string): Promise<CivicIssue | undefined> {
  try {
    const response = await fetch(`${getApiUrl()}/api/issues/${id}/`);
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
    const response = await fetch(`${getApiUrl()}/api/issues/${id}/downvote/`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Fallback to mock");
    return true;
  } catch (e) {
    // Mock Fallback: toggleUpvote acts as an untoggle for us
    MockContextBridge.toggleUpvote(id);
    return true;
  }
}

export async function addComment(issueId: string, text: string): Promise<boolean> {
  try {
    const response = await fetch(`${getApiUrl()}/api/issues/${issueId}/comments/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error("Fallback to mock");
    return true;
  } catch (e) {
    // Mock Fallback
    MockContextBridge.addComment(issueId, text);
    return true;
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
