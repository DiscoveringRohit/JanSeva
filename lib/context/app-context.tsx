"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

declare const process: {
  env: {
    NEXT_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};

import {
  CivicIssue,
  INITIAL_ISSUES,
  UserProfile,

  NotificationItem,
  INITIAL_NOTIFICATIONS,
  WardInfo,
  WARD_42_DATA,
} from "@/lib/data/mock-data";
import { DEFAULT_LOCATION, DEFAULT_USER_FALLBACK } from "@/lib/data/default-location";

import {
  authService,
  fetchWithAuth,
} from "@/lib/auth/auth-service-cookie3";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  quickActions?: {
    label: string;
    action: string;
  }[];
  suggestedIssueId?: string;
}

interface AppContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  switchRole: (
    role: "citizen" | "officer" | "corporator"
  ) => void;

  issues: CivicIssue[];
  toggleUpvote: (issueId: string) => void;
  addIssue: (issue: Partial<CivicIssue>) => CivicIssue;

  updateIssueStatus: (
    issueId: string,
    status: CivicIssue["status"],
    note?: string
  ) => void;

  voteVerification: (
    issueId: string,
    vote: "yes" | "no"
  ) => void;

  addComment: (issueId: string, text: string) => void;

  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotifsCount: number;

  wardData: WardInfo;
  votePoll: (optionId: string) => void;
  userPollVote: string | null;

  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;

  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;

  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(
  undefined
);

// Bridge for pure API functions in lib/api/issues.ts to mutate context fallbacks
export const MockContextBridge: {
  getIssues: () => CivicIssue[];
  toggleUpvote: (issueId: string) => void;
  addComment: (issueId: string, text: string) => void;
} = {
  getIssues: () => [],
  toggleUpvote: () => {},
  addComment: () => {},
};

export function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] =
    useState<UserProfile | null>(null);

  const [issues, setIssues] =
    useState<CivicIssue[]>(INITIAL_ISSUES);

  const [notifications, setNotifications] =
    useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const [wardData, setWardData] =
    useState<WardInfo>(WARD_42_DATA);

  const [userPollVote, setUserPollVote] =
    useState<string | null>(null);

  const [isAiDrawerOpen, setIsAiDrawerOpen] =
    useState(false);

  const [activeFilter, setActiveFilter] =
    useState("all");

  const [chatMessages, setChatMessages] =
    useState<ChatMessage[]>([
      {
        id: "msg-1",
        sender: "assistant",
        text: `Namaste! I am your JanSeva AI Civic Assistant. How can I assist you in ${DEFAULT_LOCATION.ward} today?`,
        timestamp: new Date().toISOString(),
        quickActions: [
          {
            label: "📸 Report a New Problem",
            action: "report",
          },
          {
            label: "🔍 Check Status of #JS-101",
            action: "track_js101",
          },
          {
            label: "🏛️ Who is my Corporator?",
            action: "corporator_info",
          },
          {
            label: "💧 Water Supply Schedule",
            action: "water_timing",
          },
        ],
      },
    ]);

  // Sync state to MockContextBridge so that non-React API files can access it during mock fallbacks
  useEffect(() => {
    MockContextBridge.getIssues = () => issues;
    // We will assign the other methods below when they are defined in scope
  }, [issues]);

  // Install global fetch interceptor for API calls
  // to attach Authorization and perform cookie-based refresh.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch.bind(window);

    const API_ROOT =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    window.fetch = async (
      input: URL | RequestInfo,
      init: RequestInit = {}
    ): Promise<Response> => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url.startsWith(API_ROOT)) {
        return fetchWithAuth(input, init);
      }

      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const fetchIssues = async () => {
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("janseva_token")
        : null;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const res = await fetchWithAuth(
        `${API_URL}/api/issues/`
      );

      if (res.ok) {
        const data = await res.json();
        
        setIssues((prevIssues) => {
          // If the backend returns data, we still want to keep any local mock issues 
          // (like those submitted during the demo) that haven't been synced to the backend yet.
          const backendIds = new Set(data.map((i: any) => i.id));
          const localOnlyIssues = prevIssues.filter(i => !backendIds.has(i.id));
          
          return [...data, ...localOnlyIssues];
        });
      }
    } catch (e) {
      console.error(
        "Failed to fetch issues from backend, using fallback.",
        e
      );
    }
  };

  const fetchNotifications = async () => {
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("janseva_token")
        : null;

    if (!token) return;

    try {
      const res = await fetch(
        `${API_URL}/api/notifications/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const data = await res.json();
        
        setNotifications((prevNotifs) => {
          const backendIds = new Set(data.map((n: any) => n.id));
          const localOnlyNotifs = prevNotifs.filter(n => !backendIds.has(n.id));
          return [...data, ...localOnlyNotifs];
        });
      }
    } catch (e) {
      console.error(
        "Failed to fetch notifications from backend.",
        e
      );
    }
  };

  const fetchUserProfile = async () => {
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("janseva_token")
        : null;

    if (!token) return;

    try {
      const res = await fetch(
        `${API_URL}/api/auth/profile/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        const userProfile = await res.json();

        const formattedUser: UserProfile = {
          id: userProfile.id.toString(),
          name: userProfile.name || userProfile.username,
          username: userProfile.username,
          email: userProfile.email,
          phone: userProfile.phone_number || "",
          avatar: userProfile.avatar || DEFAULT_USER_FALLBACK.avatar,
          ward: userProfile.ward || DEFAULT_USER_FALLBACK.ward,
          wardNumber: userProfile.ward_number || DEFAULT_USER_FALLBACK.wardNumber,
          role: userProfile.role,
          karmaXP: userProfile.karma_xp,
          level: userProfile.level,
          levelTitle: userProfile.level_title,
          verifiedCitizen: userProfile.verified_citizen,
          aadhaarLinked: userProfile.aadhaar_linked,
          stats: userProfile.stats || {
            issuesReported: 0,
            issuesResolved: 0,
            upvotesGiven: 0,
            verificationVotes: 0,
            civicImpactScore: 10,
          },
          badges: userProfile.badges || [],
        };

        setUser(formattedUser);

        localStorage.setItem(
          "janseva_user",
          JSON.stringify(formattedUser)
        );
      }
    } catch (e) {
      console.error(
        "Failed to fetch user profile.",
        e
      );
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const savedIssues = localStorage.getItem("janseva_issues");
        if (savedIssues) {
          setIssues(JSON.parse(savedIssues));
        }

        const savedUser = localStorage.getItem("janseva_user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }

        const savedNotifs = localStorage.getItem("janseva_notifs");
        if (savedNotifs) {
          setNotifications(JSON.parse(savedNotifs));
        }

        const savedPoll = localStorage.getItem("janseva_poll_vote");
        if (savedPoll) {
          setUserPollVote(savedPoll);
        }

        // Attempt to restore session using HttpOnly refresh cookie
        try {
          await authService.tryRestoreSession();
        } catch (sessionError) {
          console.warn("Could not restore backend session, continuing with local state", sessionError);
        }
      } catch (e) {
        console.error(
          "Failed to load local storage state",
          e
        );
      }

      await fetchIssues();

      const restoredAfter =
        await authService.tryRestoreSession();

      if (restoredAfter) {
        await fetchUserProfile();
        await fetchNotifications();
      }
    };

    initData();
  }, []);

  // Save issues to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        "janseva_issues",
        JSON.stringify(issues)
      );
    } catch (e) {
      console.error(e);
    }
  }, [issues]);

  // Save authenticated user to localStorage
  useEffect(() => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("janseva_token")
          : null;

      if (token && user) {
        localStorage.setItem(
          "janseva_user",
          JSON.stringify(user)
        );
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  // Save notifications
  useEffect(() => {
    try {
      localStorage.setItem(
        "janseva_notifs",
        JSON.stringify(notifications)
      );
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  const switchRole = (
    role: "citizen" | "officer" | "corporator"
  ) => {
    if (!user) return;
    
    if (role === "citizen") {
      setUser({
        ...user,
        role: "citizen",
      });
    } else if (role === "officer") {
      setUser({
        ...user,
        role: "officer",
        levelTitle: "Senior Ward Officer",
      });
    } else if (role === "corporator") {
      setUser({
        ...user,
        role: "corporator",
        levelTitle: "Ward 42 Corporator",
      });
    }
  };

  const toggleUpvote = async (issueId: string) => {
    setIssues((prev: CivicIssue[]) =>
      prev.map((issue: CivicIssue) => {
        if (issue.id === issueId) {
          const isUpvoted = !issue.isUpvoted;
          const newUpvotes = isUpvoted
            ? issue.upvotes + 1
            : issue.upvotes - 1;

          return {
            ...issue,
            upvotes: newUpvotes,
            isUpvoted,
          };
        }

        return issue;
      })
    );

    // Give user Karma XP optimistically
    setUser((prev: UserProfile | null) => prev ? ({
      ...prev,
      karmaXP: prev.karmaXP + 5,
      stats: {
        ...prev.stats,
        upvotesGiven: prev.stats.upvotesGiven + 1,
      },
    }) : prev);

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("janseva_token")
        : null;

    if (token) {
      try {
        await fetch(
          `${API_URL}/api/issues/${issueId}/upvote/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        fetchUserProfile();
        fetchIssues();
      } catch (e) {
        console.error(
          "Failed to upvote on backend",
          e
        );
      }
    }
  };

  const addIssue = (
    newIssueData: Partial<CivicIssue>
  ): CivicIssue => {
    if (!user) throw new Error("User not authenticated");
    const id = newIssueData.id || `JS-${Math.floor(
      100 + Math.random() * 900
    )}`;

    const now = new Date().toISOString();

    const createdIssue: CivicIssue = {
      id,
      title:
        newIssueData.title ||
        "Civic Grievance Report",
      description:
        newIssueData.description ||
        "Reported via JanSeva AI Quick Assistant.",
      category:
        newIssueData.category || "Sanitation",
      status: "AI Verified",
      urgency:
        newIssueData.urgency || "High",
      location: newIssueData.location || {
        address: `${DEFAULT_LOCATION.ward}, ${DEFAULT_LOCATION.city}, ${DEFAULT_LOCATION.state}`,
        ward: DEFAULT_LOCATION.ward,
        wardNumber: DEFAULT_LOCATION.wardNumber,
        lat: 20.270 + (Math.random() - 0.5) * 0.01,
        lng: 85.760 + (Math.random() - 0.5) * 0.01,
      },
      reporter: {
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        isVerified: user.verifiedCitizen,
        karma: user.karmaXP,
      },
      images: {
        reported:
          newIssueData.images?.reported ||
          "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80",
      },
      aiAnalysis:
        newIssueData.aiAnalysis || {
          detectedObject: "Verified Infrastructure Hazard",
          confidence: 97.5,
          estimatedSeverity: "High Priority Civic Issue",
          predictedDepartment: `${DEFAULT_LOCATION.municipalBody} ${DEFAULT_LOCATION.ward} Maintenance`,
          suggestedSlaHours: 24,
          summary: "AI verified valid physical hazard from geo-tagged image.",
        },
      assignedDepartment:
        newIssueData.assignedDepartment ||
        `${DEFAULT_LOCATION.municipalBody} ${DEFAULT_LOCATION.ward} Rapid Response`,
      timeline: [
        {
          stage: "Reported",
          timestamp: now,
          note: `Report submitted by ${user.name} with AI Computer Vision validation.`,
          actor: user.name,
        },
        {
          stage: "AI Verified",
          timestamp: now,
          note:
            "Computer vision classified severity & auto-routed to municipal dispatch queue.",
          actor: "JanSeva AI Engine",
        },
      ],
      upvotes: 1,
      isUpvoted: true,
      commentsCount: 0,
      verificationVotes: {
        yes: 0,
        no: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    setIssues((prev: CivicIssue[]) => [
      createdIssue,
      ...prev,
    ]);

    // Give user Karma XP & update stats optimistically
    setUser((prev: UserProfile | null) => prev ? ({
      ...prev,
      karmaXP: prev.karmaXP + 50,
      stats: {
        ...prev.stats,
        issuesReported:
          prev.stats.issuesReported + 1,
      },
    }) : prev);

    // Add notification optimistically
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Report #${id} Submitted Successfully 🎉`,
      message: `Your issue "${createdIssue.title}" has been AI verified and queued for municipal action.`,
      type: "status",
      timestamp: now,
      read: false,
      issueId: id,
      actionUrl: `/issues/${id}`,
    };

    setNotifications((prev: NotificationItem[]) => [
      newNotif,
      ...prev,
    ]);

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("janseva_token")
        : null;

    if (token) {
      fetch(`${API_URL}/api/issues/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: createdIssue.title,
          description: createdIssue.description,
          category: createdIssue.category,
          urgency: createdIssue.urgency,
          location: createdIssue.location,
          images: createdIssue.images,
          ai_analysis: createdIssue.aiAnalysis,
          assigned_department:
            createdIssue.assignedDepartment,
        }),
      })
        .then(async (res) => {
          if (res.ok) {
            const dbIssue = await res.json();

            // Replace optimistic model with real DB object
            setIssues((prev: CivicIssue[]) =>
              prev.map((item: CivicIssue) =>
                item.id === id ? dbIssue : item
              )
            );

            fetchUserProfile();
            fetchNotifications();
            fetchIssues();
          }
        })
        .catch((e) =>
          console.error(
            "Failed to save issue to backend",
            e
          )
        );
    }

    return createdIssue;
  };

  const updateIssueStatus = async (
    issueId: string,
    status: CivicIssue["status"],
    note?: string
  ) => {
    if (!user) return;
    const now = new Date().toISOString();

    setIssues((prev: CivicIssue[]) =>
      prev.map((issue: CivicIssue) => {
        if (issue.id === issueId) {
          const updatedTimeline = [
            ...issue.timeline,
            {
              stage: status,
              timestamp: now,
              note:
                note ||
                `Status updated to ${status} by ${user.name}.`,
              actor: user.name,
            },
          ];

          return {
            ...issue,
            status,
            updatedAt: now,
            timeline: updatedTimeline,
            images: {
              ...issue.images,
              ...(status === "Resolved" &&
              !issue.images.resolved
                ? {
                    resolved:
                      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80",
                  }
                : {}),
            },
          };
        }

        return issue;
      })
    );

    // Notification to citizens optimistically
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Ticket #${issueId} Status: ${status}`,
      message:
        note ||
        `Officer ${user.name} transitioned ticket to ${status}.`,
      type: "officer",
      timestamp: now,
      read: false,
      issueId,
      actionUrl: `/issues/${issueId}`,
    };

    setNotifications((prev: NotificationItem[]) => [
      notif,
      ...prev,
    ]);

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("janseva_token")
        : null;

    if (token) {
      try {
        await fetch(
          `${API_URL}/api/issues/${issueId}/status/`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status,
              note,
            }),
          }
        );

        fetchIssues();
      } catch (e) {
        console.error(
          "Failed to update status on backend",
          e
        );
      }
    }
  };

  const voteVerification = async (
    issueId: string,
    vote: "yes" | "no"
  ) => {
    setIssues((prev: CivicIssue[]) =>
      prev.map((issue: CivicIssue) => {
        if (issue.id === issueId) {
          const currentVotes = {
            ...issue.verificationVotes,
          };

          if (currentVotes.userVoted === vote) {
            return issue;
          }

          if (currentVotes.userVoted === "yes") {
            currentVotes.yes -= 1;
          }

          if (currentVotes.userVoted === "no") {
            currentVotes.no -= 1;
          }

          if (vote === "yes") {
            currentVotes.yes += 1;
          }

          if (vote === "no") {
            currentVotes.no += 1;
          }

          currentVotes.userVoted = vote;

          return {
            ...issue,
            verificationVotes: currentVotes,
          };
        }

        return issue;
      })
    );

    setUser((prev: UserProfile | null) => prev ? ({
      ...prev,
      karmaXP: prev.karmaXP + 15,
      stats: {
        ...prev.stats,
        verificationVotes:
          prev.stats.verificationVotes + 1,
      },
    }) : prev);

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("janseva_token")
        : null;

    if (token) {
      try {
        await fetch(
          `${API_URL}/api/issues/${issueId}/verify/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              vote,
            }),
          }
        );

        fetchUserProfile();
        fetchIssues();
      } catch (e) {
        console.error(
          "Failed to submit verification vote",
          e
        );
      }
    }
  };

  const addComment = async (
    issueId: string,
    text: string
  ) => {
    setIssues((prev: CivicIssue[]) =>
      prev.map((issue: CivicIssue) => {
        if (issue.id === issueId) {
          return {
            ...issue,
            commentsCount: issue.commentsCount + 1,
          };
        }

        return issue;
      })
    );

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("janseva_token")
        : null;

    if (token) {
      try {
        await fetch(
          `${API_URL}/api/issues/${issueId}/comments/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text,
            }),
          }
        );

        fetchIssues();
      } catch (e) {
        console.error(
          "Failed to add comment on backend",
          e
        );
      }
    }
  };

  const markNotificationRead = async (
    id: string
  ) => {
    setNotifications((prev: NotificationItem[]) =>
      prev.map((n: NotificationItem) =>
        n.id === id
          ? {
              ...n,
              read: true,
            }
          : n
      )
    );

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("janseva_token")
        : null;

    const dbId = id.includes("-")
      ? id.split("-")[1]
      : id;

    if (
      token &&
      dbId &&
      !isNaN(Number(dbId))
    ) {
      try {
        await fetch(
          `${API_URL}/api/notifications/${dbId}/read/`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (e) {
        console.error(
          "Failed to mark notification as read",
          e
        );
      }
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications(
      (prev: NotificationItem[]) =>
        prev.map((n: NotificationItem) => ({
          ...n,
          read: true,
        }))
    );

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:8000";

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("janseva_token")
        : null;

    if (token) {
      try {
        await fetch(
          `${API_URL}/api/notifications/read-all/`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (e) {
        console.error(
          "Failed to mark all notifications as read",
          e
        );
      }
    }
  };

  const votePoll = (optionId: string) => {
    if (userPollVote === optionId) return;

    setWardData((prev: WardInfo) => {
      const updatedOptions =
        prev.activePoll.options.map((opt: any) => {
          if (opt.id === optionId) {
            return {
              ...opt,
              votes: opt.votes + 1,
            };
          }

          if (opt.id === userPollVote) {
            return {
              ...opt,
              votes: Math.max(0, opt.votes - 1),
            };
          }

          return opt;
        });

      return {
        ...prev,
        activePoll: {
          ...prev.activePoll,
          totalVotes: userPollVote
            ? prev.activePoll.totalVotes
            : prev.activePoll.totalVotes + 1,
          options: updatedOptions,
        },
      };
    });

    setUserPollVote(optionId);

    try {
      localStorage.setItem(
        "janseva_poll_vote",
        optionId
      );
    } catch (e) {}

    setUser((prev: UserProfile | null) => prev ? ({
      ...prev,
      karmaXP: prev.karmaXP + 20,
    }) : prev);
  };

 const sendChatMessage = async (text: string) => {
  const userMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    sender: "user",
    text,
    timestamp: new Date().toISOString(),
  };

  setChatMessages((prev: ChatMessage[]) => [
    ...prev,
    userMsg,
  ]);

  try {
    const response = await fetch(
      "https://civic-issue-chatbot.onrender.com/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Chatbot request failed: ${response.status}`);
    }

    const data = await response.json();

    const botMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: "assistant",
      text: data.response,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev: ChatMessage[]) => [
      ...prev,
      botMsg,
    ]);
  } catch (error) {
    console.error("Chatbot error:", error);

    const errorMsg: ChatMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: "assistant",
      text: "Sorry, I couldn't connect to the JanSeva chatbot right now. Please try again.",
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev: ChatMessage[]) => [
      ...prev,
      errorMsg,
    ]);
  }
};

  const unreadNotifsCount =
    notifications.filter(
      (n: NotificationItem) => !n.read
    ).length;

  // Sync to MockContextBridge
  useEffect(() => {
    MockContextBridge.getIssues = () => issues;
    MockContextBridge.toggleUpvote = toggleUpvote;
    MockContextBridge.addComment = addComment;
  }, [issues, toggleUpvote, addComment]);

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        switchRole,
        issues,
        toggleUpvote,
        addIssue,
        updateIssueStatus,
        voteVerification,
        addComment,
        notifications,
        markNotificationRead,
        markAllNotificationsRead,
        unreadNotifsCount,
        wardData,
        votePoll,
        userPollVote,
        chatMessages,
        sendChatMessage,
        isAiDrawerOpen,
        setIsAiDrawerOpen,
        activeFilter,
        setActiveFilter,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error(
      "useApp must be used within an AppProvider"
    );
  }

  return context;
}