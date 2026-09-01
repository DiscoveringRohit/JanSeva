"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Award, Flame, ChevronRight, Sparkles } from "lucide-react";
import { useApp } from "@/lib/context/app-context";

export function LeaderboardWidget() {
  const { user } = useApp();
  const [liveLeaderboard, setLiveLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${API_URL}/api/leaderboard/`);
        if (res.ok) {
          const data = await res.json();
          setLiveLeaderboard(data);
        }
      } catch (err) {
        console.error("Failed to load live leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [user?.civicCitizenXP]);

  const leaderboard = useMemo(() => {
    let board: any[] = liveLeaderboard.map((item) => ({
      ...item,
      isUser: Boolean(user && (user.username === item.username || user.id === item.id)),
    }));

    // If current logged-in user is not yet in the list or needs position sync
    if (user) {
      const existingUserIdx = board.findIndex((item) => item.isUser);
      const userXP = Number(user.civicCitizenXP ?? 100);
      const userEntry = {
        id: user.id,
        username: user.username,
        rank: 0,
        name: `${user.name} (You)`,
        ward: user.ward || (user.pincode ? `PIN ${user.pincode}` : "My Ward"),
        karma: userXP,
        badge: user.levelTitle || (user.role === "officer" ? "Ward Officer" : "Active Citizen"),
        avatar: user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`,
        isUser: true,
      };

      if (existingUserIdx >= 0) {
        board[existingUserIdx] = { ...userEntry, karma: userXP };
      } else {
        board.push(userEntry);
      }
    }

    // Sort by XP descending and re-rank
    board.sort((a, b) => (b.karma || 0) - (a.karma || 0));
    return board.slice(0, 5).map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [liveLeaderboard, user, user?.civicCitizenXP]);

  const userRank = user ? leaderboard.find((l) => l.isUser)?.rank || "-" : "-";

  return (
    <div className="rounded-3xl bg-white border border-surface-container-high/80 p-5 shadow-soft space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-headline font-bold text-sm text-on-surface">Top Civic Heroes</h4>
            <p className="text-[11px] text-on-surface-variant font-medium">Weekly Civic Citizen XP Leaderboard</p>
          </div>
        </div>
        <Link href="/profile" className="text-xs font-bold text-primary-600 hover:underline">
          My Rank #{userRank}
        </Link>
      </div>

      <div className="space-y-2.5">
        {leaderboard.map((hero) => (
          <div
            key={hero.rank}
            className={`flex items-center justify-between p-2 rounded-2xl transition-colors ${(hero as any).isUser ? 'bg-primary-50 border border-primary-200' : 'bg-surface-container-low/70 hover:bg-surface-container'}`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  hero.rank === 1
                    ? "bg-amber-400 text-amber-950 shadow-sm"
                    : hero.rank === 2
                    ? "bg-slate-300 text-slate-900"
                    : hero.rank === 3
                    ? "bg-amber-700/60 text-white"
                    : "bg-surface-dim text-on-surface-variant"
                }`}
              >
                {hero.rank}
              </span>
              <img
                src={hero.avatar}
                alt={hero.name}
                className={`w-8 h-8 rounded-full object-cover ring-1 ${(hero as any).isUser ? 'ring-primary-500' : 'ring-white'}`}
              />
              <div className="min-w-0">
                <p className={`text-xs font-bold truncate ${(hero as any).isUser ? 'text-primary-900' : 'text-on-surface'}`}>{hero.name}</p>
                <p className={`text-[10px] ${(hero as any).isUser ? 'text-primary-700' : 'text-on-surface-variant'}`}>{hero.badge}</p>
              </div>
            </div>

            <div className={`flex items-center gap-1 font-bold text-xs shrink-0 px-2 py-0.5 rounded-full ${(hero as any).isUser ? 'bg-primary-100 text-primary-700' : 'bg-emerald-50 text-emerald-700'}`}>
              <Flame className={`w-3 h-3 ${(hero as any).isUser ? 'fill-primary-600' : 'fill-emerald-600'}`} />
              <span>{hero.karma}</span>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/profile"
        className="pt-2 flex items-center justify-between text-xs font-bold text-primary-600 hover:underline border-t border-surface-dim"
      >
        <span>Earn XP & Badges</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
