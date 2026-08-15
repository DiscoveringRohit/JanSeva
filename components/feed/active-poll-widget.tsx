"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/context/app-context";
import { Vote, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ActivePollWidget() {
  const { wardData, votePoll, userPollVote } = useApp();
  const poll = wardData.activePoll;

  return (
    <div className="rounded-3xl bg-white border border-surface-container-high/80 p-5 shadow-soft space-y-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Vote className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-primary-700 tracking-wider">
              Ward 42 Democratic Pulse
            </span>
            <h4 className="font-headline font-bold text-xs text-on-surface">Weekly Citizen Poll</h4>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant">
          {poll.totalVotes} Votes
        </span>
      </div>

      <p className="text-xs font-semibold text-on-surface leading-snug">
        {poll.question}
      </p>

      <div className="space-y-2">
        {poll.options.map((opt) => {
          const isSelected = userPollVote === opt.id;
          const percentage = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => votePoll(opt.id)}
              className={cn(
                "w-full text-left p-2.5 rounded-2xl border transition-all relative overflow-hidden group select-none",
                isSelected
                  ? "border-primary-500 bg-primary-50/70 shadow-sm"
                  : "border-surface-dim bg-surface-container-low/70 hover:bg-surface-container hover:border-surface-variant"
              )}
            >
              {/* Progress background fill */}
              <div
                className={cn(
                  "absolute inset-y-0 left-0 transition-all duration-500 rounded-2xl",
                  isSelected ? "bg-primary-200/50" : "bg-surface-dim/60"
                )}
                style={{ width: `${percentage}%` }}
              />

              <div className="relative z-10 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                      isSelected ? "border-primary-600 bg-primary-600 text-white" : "border-surface-variant bg-white"
                    )}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                  <span className={cn("text-xs font-medium text-on-surface leading-tight", isSelected ? "font-bold text-primary-900" : "")}>
                    {opt.text}
                  </span>
                </div>
                <span className="text-xs font-bold text-on-surface-variant shrink-0">
                  {percentage}%
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-on-surface-variant font-medium pt-1">
        <span className="flex items-center gap-1 text-emerald-700 font-bold">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          +20 Karma XP on vote
        </span>
        <span>Poll closes in 2 days</span>
      </div>
    </div>
  );
}
