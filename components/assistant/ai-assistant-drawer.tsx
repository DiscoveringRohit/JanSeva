"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/context/app-context";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  Bot,
  User,
  ExternalLink,
  MapPin,
  FileCheck,
  CheckCircle2,
  RefreshCw,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AiAssistantDrawer() {
  const router = useRouter();
  const {
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    chatMessages,
    sendChatMessage,
    language,
    setLanguage,
    allLanguages,
    t,
  } = useApp();

  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAiDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isAiDrawerOpen]);

  if (!isAiDrawerOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendChatMessage(input.trim());
      setInput("");
    }
  };

  const handleVoiceToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate speech-to-text input after 2 seconds
      setTimeout(() => {
        setIsRecording(false);
        sendChatMessage("What is the status of the drainage issue #JS-101 in Shanti Nagar?");
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === "report" || action === "open_report") {
      setIsAiDrawerOpen(false);
      router.push("/report");
    } else if (action === "track_js101" || action === "open_issue_js101") {
      setIsAiDrawerOpen(false);
      router.push("/issues/JS-101");
    } else if (action === "corporator_info" || action === "open_ward") {
      setIsAiDrawerOpen(false);
      router.push("/ward");
    } else if (action === "open_map") {
      setIsAiDrawerOpen(false);
      router.push("/map");
    } else {
      sendChatMessage(action);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="w-full sm:w-[460px] h-full bg-white flex flex-col justify-between shadow-2xl border-l border-surface-container-high animate-slideUp">

        {/* Header */}
        <div className="p-4 border-b border-surface-container-high bg-gradient-to-r from-primary-700 via-primary-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center ring-2 ring-white/30">
              <Sparkles className="w-5 h-5 text-white animate-pulseSlow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-headline font-bold text-base leading-none">JanSeva AI Copilot</h3>
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-emerald-400 text-emerald-950 rounded uppercase">
                  Active
                </span>
              </div>
              <p className="text-[11px] text-white/80 mt-0.5">
                PIN 751030 • Multilingual Civic Intelligence
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-white/20 text-white text-[11px] font-bold rounded-lg px-2 py-1 border border-white/20 focus:outline-none cursor-pointer"
            >
              {allLanguages.map((lang) => (
                <option
                  key={lang.code}
                  value={lang.code}
                  className="text-slate-900 bg-white"
                >
                  {lang.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setIsAiDrawerOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/20 text-white/90 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface/50">

          {/* Welcome Banner */}
          <div className="rounded-2xl p-3 bg-gradient-to-r from-primary-50 to-indigo-50 border border-primary-200 text-xs space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-primary-900">
              <Bot className="w-4 h-4 text-primary-600" />
              <span>Civic Copilot Capabilities</span>
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Trained on BMC, Traffic, and Water ward manuals, citizen charters, and live IoT telemetry.
            </p>
          </div>

          {chatMessages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={cn("flex gap-2.5 max-w-[90%]", isUser ? "ml-auto flex-row-reverse" : "mr-auto")}
              >
                <div
                  className={cn(
                    "w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                    isUser
                      ? "bg-primary-600 text-white font-bold text-xs"
                      : "bg-gradient-to-tr from-primary-600 to-indigo-700 text-white"
                  )}
                >
                  {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                </div>

                <div className="space-y-2">
                  <div
                    className={cn(
                      "p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm",
                      isUser
                        ? "bg-primary-600 text-white rounded-tr-none font-medium"
                        : "bg-white text-on-surface border border-surface-container-high rounded-tl-none"
                    )}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>

                  {/* Quick action buttons attached to bot response */}
                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.quickActions.map((qa, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleQuickAction(qa.action)}
                          className="text-[11px] font-bold px-3 py-1.5 rounded-full bg-white border border-primary-200 text-primary-700 hover:bg-primary-50 hover:border-primary-300 shadow-sm transition-all flex items-center gap-1"
                        >
                          <span>{qa.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isRecording && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
              <span>
                Listening to voice in{" "}
                {allLanguages.find((l) => l.code === language)?.name || "selected language"}
                ... Speak your civic grievance...
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="p-2 border-t border-surface-dim bg-white overflow-x-auto flex gap-1.5 no-scrollbar">
          <button
            type="button"
            onClick={() => sendChatMessage("Report a streetlight failure in Khandagiri")}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-surface-dim shrink-0"
          >
            💡 Report streetlight
          </button>
          <button
            type="button"
            onClick={() => sendChatMessage("What is the status of my recent civic complaints?")}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-surface-dim shrink-0"
          >
            🔍 Status of my complaints
          </button>
          <button
            type="button"
            onClick={() => sendChatMessage("When is the next Khandagiri committee meeting?")}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-surface-dim shrink-0"
          >
            📅 Community town hall
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-surface-container-high bg-white flex items-center gap-2">
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={cn(
              "p-2.5 rounded-2xl border transition-all shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center",
              isRecording
                ? "bg-rose-500 text-white border-rose-600 animate-bounce"
                : "bg-surface-container-low hover:bg-surface-container text-on-surface-variant border-surface-dim"
            )}
            title={isRecording ? "Stop recording" : "Voice Input (Multilingual)"}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask in ${allLanguages.find((l) => l.code === language)?.name || "your language"} or describe a problem...`}
            className="flex-1 px-3.5 py-2.5 text-xs rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-600 focus:bg-white text-on-surface min-w-0"
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="p-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white font-bold transition-all shadow-md shadow-primary-600/30 shrink-0 min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
