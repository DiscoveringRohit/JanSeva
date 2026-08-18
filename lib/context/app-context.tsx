"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  CURRENT_USER,
  NotificationItem,
  INITIAL_NOTIFICATIONS,
  WardInfo,
  WARD_42_DATA,
} from "@/lib/data/mock-data";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  quickActions?: { label: string; action: string }[];
  suggestedIssueId?: string;
}

interface AppContextType {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  switchRole: (role: "citizen" | "officer" | "corporator") => void;
  issues: CivicIssue[];
  toggleUpvote: (issueId: string) => void;
  addIssue: (issue: Partial<CivicIssue>) => CivicIssue;
  updateIssueStatus: (issueId: string, status: CivicIssue["status"], note?: string) => void;
  voteVerification: (issueId: string, vote: "yes" | "no") => void;
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
  logout: () => void;
  isAiDrawerOpen: boolean;
  setIsAiDrawerOpen: (open: boolean) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(CURRENT_USER);
  const [issues, setIssues] = useState<CivicIssue[]>(INITIAL_ISSUES);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [wardData, setWardData] = useState<WardInfo>(WARD_42_DATA);
  const [userPollVote, setUserPollVote] = useState<string | null>(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "assistant",
      text: "Namaste Asmit! I am your JanSeva AI Civic Assistant. How can I assist you in Ward 42 (Shanti Nagar) today?",
      timestamp: new Date().toISOString(),
      quickActions: [
        { label: "📸 Report a New Problem", action: "report" },
        { label: "🔍 Check Status of #JS-101", action: "track_js101" },
        { label: "🏛️ Who is my Corporator?", action: "corporator_info" },
        { label: "💧 Water Supply Schedule", action: "water_timing" },
      ],
    },
  ]);

  const fetchIssues = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const token = typeof window !== "undefined" ? localStorage.getItem("janseva_token") : null;
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    try {
      const res = await fetch(`${API_URL}/api/issues/`, { headers });
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      }
    } catch (e) {
      console.error("Failed to fetch issues from backend, using fallback.", e);
    }
  };

  const fetchNotifications = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const token = typeof window !== "undefined" ? localStorage.getItem("janseva_token") : null;
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error("Failed to fetch notifications from backend.", e);
    }
  };

  const fetchUserProfile = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const token = typeof window !== "undefined" ? localStorage.getItem("janseva_token") : null;
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        const userProfile = await res.json();
        const formattedUser: UserProfile = {
          id: userProfile.id.toString(),
          name: userProfile.username,
          email: userProfile.email,
          phone: userProfile.phone_number || "",
          avatar: userProfile.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
          ward: userProfile.ward || "Shanti Nagar",
          wardNumber: userProfile.ward_number || 42,
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
        localStorage.setItem("janseva_user", JSON.stringify(formattedUser));
      }
    } catch (e) {
      console.error("Failed to fetch user profile.", e);
    }
  };

  // Load from localStorage on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const savedIssues = localStorage.getItem("janseva_issues");
        if (savedIssues) setIssues(JSON.parse(savedIssues));

        const savedUser = localStorage.getItem("janseva_user");
        if (savedUser) setUser(JSON.parse(savedUser));

        const savedNotifs = localStorage.getItem("janseva_notifs");
        if (savedNotifs) setNotifications(JSON.parse(savedNotifs));

        const savedPoll = localStorage.getItem("janseva_poll_vote");
        if (savedPoll) setUserPollVote(savedPoll);
      } catch (e) {
        console.error("Failed to load local storage state", e);
      }

      await fetchIssues();
      const token = localStorage.getItem("janseva_token");
      if (token) {
        await fetchUserProfile();
        await fetchNotifications();
      }
    };
    initData();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("janseva_issues", JSON.stringify(issues));
    } catch (e) {
      console.error(e);
    }
  }, [issues]);

  useEffect(() => {
    try {
      localStorage.setItem("janseva_user", JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem("janseva_notifs", JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }, [notifications]);

  const switchRole = (role: "citizen" | "officer" | "corporator") => {
    if (role === "citizen") {
      setUser({
        ...CURRENT_USER,
        role: "citizen",
        name: "Asmit Gupta",
        levelTitle: "Civic Champion",
      });
    } else if (role === "officer") {
      setUser({
        id: "JS-OFF-4412",
        name: "Er. Ramesh Kulkarni",
        email: "ramesh.kulkarni@bbmp.gov.in",
        phone: "+91 94808 12345",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        ward: "Shanti Nagar",
        wardNumber: 42,
        role: "officer",
        karmaXP: 3820,
        level: 8,
        levelTitle: "Senior Ward Officer",
        verifiedCitizen: true,
        aadhaarLinked: true,
        stats: {
          issuesReported: 0,
          issuesResolved: 142,
          upvotesGiven: 420,
          verificationVotes: 198,
          civicImpactScore: 98,
        },
        badges: CURRENT_USER.badges,
      });
    } else if (role === "corporator") {
      setUser({
        id: "JS-CORP-042",
        name: "Smt. Rajeshwari N.",
        email: "corporator.ward42@bbmp.gov.in",
        phone: "+91 80 2297 5500",
        avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
        ward: "Shanti Nagar",
        wardNumber: 42,
        role: "corporator",
        karmaXP: 5600,
        level: 10,
        levelTitle: "Ward 42 Corporator",
        verifiedCitizen: true,
        aadhaarLinked: true,
        stats: {
          issuesReported: 5,
          issuesResolved: 298,
          upvotesGiven: 650,
          verificationVotes: 320,
          civicImpactScore: 99,
        },
        badges: CURRENT_USER.badges,
      });
    }
  };

  const toggleUpvote = async (issueId: string) => {
    setIssues((prev: CivicIssue[]) =>
      prev.map((issue: CivicIssue) => {
        if (issue.id === issueId) {
          const isUpvoted = !issue.isUpvoted;
          const newUpvotes = isUpvoted ? issue.upvotes + 1 : issue.upvotes - 1;
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
    setUser((prev: UserProfile) => ({
      ...prev,
      karmaXP: prev.karmaXP + 5,
      stats: {
        ...prev.stats,
        upvotesGiven: prev.stats.upvotesGiven + 1,
      },
    }));

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const token = typeof window !== "undefined" ? localStorage.getItem("janseva_token") : null;
    if (token) {
      try {
        await fetch(`${API_URL}/api/issues/${issueId}/upvote/`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        fetchUserProfile();
        fetchIssues();
      } catch (e) {
        console.error("Failed to upvote on backend", e);
      }
    }
  };

  const addIssue = (newIssueData: Partial<CivicIssue>): CivicIssue => {
    const id = `JS-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    const createdIssue: CivicIssue = {
      id,
      title: newIssueData.title || "Civic Grievance Report",
      description: newIssueData.description || "Reported via JanSeva AI Quick Assistant.",
      category: newIssueData.category || "Sanitation",
      status: "AI Verified",
      urgency: newIssueData.urgency || "High",
      location: newIssueData.location || {
        address: "Ward 42, Shanti Nagar, Bengaluru",
        ward: "Shanti Nagar",
        wardNumber: 42,
        lat: 12.962 + (Math.random() - 0.5) * 0.01,
        lng: 77.596 + (Math.random() - 0.5) * 0.01,
      },
      reporter: {
        name: user.name,
        avatar: user.avatar,
        isVerified: user.verifiedCitizen,
        karma: user.karmaXP,
      },
      images: {
        reported: newIssueData.images?.reported || "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80",
      },
      aiAnalysis: newIssueData.aiAnalysis || {
        detectedObject: "Verified Infrastructure Hazard",
        confidence: 97.5,
        estimatedSeverity: "High Priority Civic Issue",
        predictedDepartment: "BBMP Ward 42 Maintenance",
        suggestedSlaHours: 24,
        summary: "AI verified valid physical hazard from geo-tagged image.",
      },
      assignedDepartment: newIssueData.assignedDepartment || "BBMP Ward 42 Rapid Response",
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
          note: "Computer vision classified severity & auto-routed to municipal dispatch queue.",
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

    setIssues((prev: CivicIssue[]) => [createdIssue, ...prev]);

    // Give user Karma XP & update stats optimistically
    setUser((prev: UserProfile) => ({
      ...prev,
      karmaXP: prev.karmaXP + 50,
      stats: {
        ...prev.stats,
        issuesReported: prev.stats.issuesReported + 1,
      },
    }));

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
    setNotifications((prev: NotificationItem[]) => [newNotif, ...prev]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const token = typeof window !== "undefined" ? localStorage.getItem("janseva_token") : null;
    if (token) {
      fetch(`${API_URL}/api/issues/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: createdIssue.title,
          description: createdIssue.description,
          category: createdIssue.category,
          urgency: createdIssue.urgency,
          location: createdIssue.location,
          images: createdIssue.images,
          ai_analysis: createdIssue.aiAnalysis,
          assigned_department: createdIssue.assignedDepartment
        })
      }).then(async (res) => {
        if (res.ok) {
          const dbIssue = await res.json();
          // replace optimistic model with real DB object
          setIssues((prev: CivicIssue[]) => prev.map((item: CivicIssue) => item.id === id ? dbIssue : item));
          fetchUserProfile();
          fetchNotifications();
          fetchIssues();
        }
      }).catch((e) => console.error("Failed to save issue to backend", e));
    }

    return createdIssue;
  };

  const updateIssueStatus = async (issueId: string, status: CivicIssue["status"], note?: string) => {
    const now = new Date().toISOString();
    setIssues((prev: CivicIssue[]) =>
      prev.map((issue: CivicIssue) => {
        if (issue.id === issueId) {
          const updatedTimeline = [
            ...issue.timeline,
            {
              stage: status,
              timestamp: now,
              note: note || `Status updated to ${status} by ${user.name}.`,
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
              ...(status === "Resolved" && !issue.images.resolved
                ? { resolved: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80" }
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
      message: note || `Officer ${user.name} transitioned ticket to ${status}.`,
      type: "officer",
      timestamp: now,
      read: false,
      issueId,
      actionUrl: `/issues/${issueId}`,
    };
    setNotifications((prev: NotificationItem[]) => [notif, ...prev]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const token = typeof window !== "undefined" ? localStorage.getItem("janseva_token") : null;
    if (token) {
      try {
        await fetch(`${API_URL}/api/issues/${issueId}/status/`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status, note })
        });
        fetchIssues();
      } catch (e) {
        console.error("Failed to update status on backend", e);
      }
    }
  };

  const voteVerification = async (issueId: string, vote: "yes" | "no") => {
    setIssues((prev: CivicIssue[]) =>
      prev.map((issue: CivicIssue) => {
        if (issue.id === issueId) {
          const currentVotes = { ...issue.verificationVotes };
          if (currentVotes.userVoted === vote) return issue;

          if (currentVotes.userVoted === "yes") currentVotes.yes -= 1;
          if (currentVotes.userVoted === "no") currentVotes.no -= 1;

          if (vote === "yes") currentVotes.yes += 1;
          if (vote === "no") currentVotes.no += 1;

          currentVotes.userVoted = vote;

          return {
            ...issue,
            verificationVotes: currentVotes,
          };
        }
        return issue;
      })
    );

    setUser((prev: UserProfile) => ({
      ...prev,
      karmaXP: prev.karmaXP + 15,
      stats: {
        ...prev.stats,
        verificationVotes: prev.stats.verificationVotes + 1,
      },
    }));

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const token = typeof window !== "undefined" ? localStorage.getItem("janseva_token") : null;
    if (token) {
      try {
        await fetch(`${API_URL}/api/issues/${issueId}/verify/`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ vote })
        });
        fetchUserProfile();
        fetchIssues();
      } catch (e) {
        console.error("Failed to submit verification vote", e);
      }
    }
  };

  const addComment = async (issueId: string, text: string) => {
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

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const token = typeof window !== "undefined" ? localStorage.getItem("janseva_token") : null;
    if (token) {
      try {
        await fetch(`${API_URL}/api/issues/${issueId}/comments/`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ text })
        });
        fetchIssues();
      } catch (e) {
        console.error("Failed to add comment on backend", e);
      }
    }
  };

  const markNotificationRead = async (id: string) => {
    setNotifications((prev: NotificationItem[]) =>
      prev.map((n: NotificationItem) => (n.id === id ? { ...n, read: true } : n))
    );

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const token = typeof window !== "undefined" ? localStorage.getItem("janseva_token") : null;
    const dbId = id.includes("-") ? id.split("-")[1] : id;
    if (token && dbId && !isNaN(Number(dbId))) {
      try {
        await fetch(`${API_URL}/api/notifications/${dbId}/read/`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      } catch (e) {
        console.error("Failed to mark notification as read", e);
      }
    }
  };

  const markAllNotificationsRead = async () => {
    setNotifications((prev: NotificationItem[]) => prev.map((n: NotificationItem) => ({ ...n, read: true })));

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const token = typeof window !== "undefined" ? localStorage.getItem("janseva_token") : null;
    if (token) {
      try {
        await fetch(`${API_URL}/api/notifications/read-all/`, {
          method: "PATCH",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
      } catch (e) {
        console.error("Failed to mark all notifications as read", e);
      }
    }
  };

  const votePoll = (optionId: string) => {
    if (userPollVote === optionId) return;

    setWardData((prev: WardInfo) => {
      const updatedOptions = prev.activePoll.options.map((opt: any) => {
        if (opt.id === optionId) return { ...opt, votes: opt.votes + 1 };
        if (opt.id === userPollVote) return { ...opt, votes: Math.max(0, opt.votes - 1) };
        return opt;
      });

      return {
        ...prev,
        activePoll: {
          ...prev.activePoll,
          totalVotes: userPollVote ? prev.activePoll.totalVotes : prev.activePoll.totalVotes + 1,
          options: updatedOptions,
        },
      };
    });

    setUserPollVote(optionId);
    try {
      localStorage.setItem("janseva_poll_vote", optionId);
    } catch (e) {}

    setUser((prev: UserProfile) => ({
      ...prev,
      karmaXP: prev.karmaXP + 20,
    }));
  };

  const sendChatMessage = (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev: ChatMessage[]) => [...prev, userMsg]);

    // Simulated Smart AI Civic Response
    setTimeout(() => {
      let botResponse = "";
      let quickActions: { label: string; action: string }[] | undefined = undefined;
      let suggestedIssueId: string | undefined = undefined;

      const lower = text.toLowerCase();
      if (lower.includes("report") || lower.includes("pothole") || lower.includes("garbage") || lower.includes("waste") || lower.includes("leak")) {
        botResponse = "I can help you file this immediately with AI Computer Vision. Click below to launch the smart reporting wizard with auto-GPS detection and department routing.";
        quickActions = [{ label: "📸 Open AI Reporting Wizard", action: "open_report" }];
      } else if (lower.includes("js-101") || lower.includes("101") || lower.includes("drainage")) {
        botResponse = "Issue **#JS-101 (4th Main Sewage Overflow)** is currently **In Progress**. Senior Inspector Ramesh Kulkarni and a desilting suction crew are on-site. Current resolution ETA: ~2.5 hours. 94% of neighbors verified the progress.";
        suggestedIssueId = "JS-101";
        quickActions = [{ label: "🔍 View Live Progression Tracker", action: "open_issue_js101" }];
      } else if (lower.includes("corporator") || lower.includes("rajeshwari") || lower.includes("representative")) {
        botResponse = "Ward 42 (Shanti Nagar) Corporator is **Smt. Rajeshwari N.**\n• Office: Ward 42 Municipal Office, 80ft Road\n• Helpline: +91 80 2297 5500\n• Next Public Town Hall: Sunday, Aug 23 at 10:00 AM";
        quickActions = [{ label: "🏛️ Visit My Ward Portal", action: "open_ward" }];
      } else if (lower.includes("water") || lower.includes("supply") || lower.includes("tanker")) {
        botResponse = "Drinking water in Ward 42 is supplied via Cauvery Phase IV on **Monday, Wednesday, Friday from 6:00 AM to 9:30 AM**. Emergency municipal water tankers can be booked directly through JanSeva.";
        quickActions = [{ label: "💧 Book Emergency Tanker", action: "book_tanker" }];
      } else {
        botResponse = `Understood! I've analyzed your query regarding "${text}". In Ward 42, JanSeva resolves 92% of civic inquiries automatically within 18 hours. Would you like me to connect you with the Ward helpdesk or open a complaint ticket?`;
        quickActions = [
          { label: "📸 Report Civic Issue", action: "open_report" },
          { label: "🗺️ Explore Ward Map", action: "open_map" },
        ];
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "assistant",
        text: botResponse,
        timestamp: new Date().toISOString(),
        quickActions,
        suggestedIssueId,
      };

      setChatMessages((prev: ChatMessage[]) => [...prev, botMsg]);
    }, 600);
  };

  const unreadNotifsCount = notifications.filter((n: NotificationItem) => !n.read).length;

  const logout = () => {
    localStorage.removeItem("janseva_user");
    setUser({
      ...CURRENT_USER,
      id: "JS-GUEST",
      name: "Guest User",
      email: "",
      phone: "",
      role: "citizen",
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        switchRole,
        logout,
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
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
