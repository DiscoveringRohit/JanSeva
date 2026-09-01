import { fetchWithAuth } from "@/lib/auth/auth-service-cookie3";
import { OfficialAnnouncement } from "@/lib/data/mock-data";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export async function getAnnouncements(pincode?: string, department?: string): Promise<OfficialAnnouncement[]> {
  try {
    const params = new URLSearchParams();
    if (pincode) params.set("pincode", pincode);
    if (department && department.toLowerCase() !== "all" && department.toLowerCase() !== "municipal") {
      params.set("department", department);
    }

    const res = await fetchWithAuth(`${API}/api/announcements/?${params.toString()}`);
    if (!res.ok) {
      console.warn("getAnnouncements returned status", res.status);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return [];
  }
}

export async function createAnnouncement(payload: {
  title: string;
  message: string;
  department: string;
  pincodes: string[];
  urgency?: "Emergency" | "High" | "Advisory" | "Normal";
  category?: string;
  author_name?: string;
  author_role?: string;
  action_url?: string;
}): Promise<{ success: boolean; announcement?: OfficialAnnouncement; message?: string; reachCount?: number }> {
  try {
    const res = await fetchWithAuth(`${API}/api/announcements/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, message: err.error || "Failed to publish announcement" };
    }

    const data = await res.json();
    return {
      success: true,
      announcement: data.announcement,
      message: data.message,
      reachCount: data.reach_count,
    };
  } catch (error: any) {
    console.error("Error creating announcement:", error);
    return { success: false, message: error.message || "Network error" };
  }
}

export async function deleteAnnouncement(id: string | number): Promise<boolean> {
  try {
    const res = await fetchWithAuth(`${API}/api/announcements/${id}/`, {
      method: "DELETE",
    });
    return res.ok;
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return false;
  }
}
