"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { TOP_LEADERBOARD } from "@/lib/data/mock-data";
import { Award, Flame, ChevronRight } from "lucide-react";
import { useApp } from "@/lib/context/app-context";

export function LeaderboardWidget() {
  const { user } = useApp();

  const leaderboard = useMemo(() => {
    let board: any[] = TOP_LEADERBOARD.slice(0, 3).map(h => ({ ...h }));
    
    if (user) {
      // Find where user belongs
      const userXP = user.civicCitizenXP ?? 10;
      let inserted = false;
      for (let i = 0; i < board.length; i++) {
        if (userXP > board[i].karma) {
          board.splice(i, 0, {
            rank: 0,
            name: user.name + " (You)",
            ward: user.ward || "My Ward",
            karma: userXP,
            badge: user.levelTitle || "Active Citizen",
            avatar: user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
            isUser: true,
          });
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        board.push({
          rank: 0,
          name: user.name + " (You)",
          ward: user.ward || "My Ward",
          karma: userXP,
          badge: user.levelTitle || "Active Citizen",
          avatar: user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
          isUser: true,
        });
      }
    }
    
    // Re-rank
    return board.map((item, index) => ({ ...item, rank: index + 1 }));
  }, [user]);

  const userRank = user ? leaderboard.find(l => (l as any).isUser)?.rank || "-" : "-";

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
