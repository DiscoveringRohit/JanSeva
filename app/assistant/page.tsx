"use client";

import React, { useState, useRef, useEffect } from "react";
import { useApp } from "@/lib/context/app-context";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  MapPin,
  CheckCircle2,
  Phone,
  FileText,
  Building2,
  Clock,
  Compass,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AssistantPage() {
  const router = useRouter();
  const { chatMessages, sendChatMessage } = useApp();
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLang, setSelectedLang] = useState("English");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendChatMessage(input.trim());
      setInput("");
    }
  };

const handleVoiceSim = async () => {
  if (isRecording) {
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks: BlobPart[] = [];

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop());

      const audioBlob = new Blob(audioChunks, {
        type: "audio/webm",
      });

      setIsRecording(false);

      const chatbotUrl =
        process.env.NEXT_PUBLIC_CHATBOT_URL ||
        "https://civic-issue-chatbot.onrender.com";

      const formData = new FormData();

      formData.append(
        "audio",
        audioBlob,
        "voice-message.webm"
      );

      try {
        const response = await fetch(
          `${chatbotUrl}/chat/voice`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Voice request failed"
          );
        }

        if (data.transcription) {
          setChatMessages((prev: ChatMessage[]) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              sender: "user",
              text: data.transcription,
              timestamp: new Date().toISOString(),
            },
          ]);
        }

        if (data.answer) {
          setChatMessages((prev: ChatMessage[]) => [
            ...prev,
            {
              id: `msg-${Date.now() + 1}`,
              sender: "assistant",
              text: data.answer,
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (error) {
        console.error("Voice chatbot error:", error);
        setChatMessages((prev: ChatMessage[]) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: "assistant",
            text: "Sorry, I couldn't process your voice message.",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };

    setIsRecording(true);
    mediaRecorder.start();

    setTimeout(() => {
      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    }, 5000);

  } catch (error) {
    console.error("Microphone error:", error);
    setIsRecording(false);
    alert("Unable to access your microphone.");
  }
};
  const quickPrompts = [
    "📸 How do I report a broken road with AI?",
    "🔍 Status of sewage issue #JS-101",
    "💧 Ward 42 Drinking Water Schedule",
    "What is Janseva?",
    "⚡ BESCOM Streetlight power outage helpline",
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-primary-600/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline font-black text-2xl text-on-surface">
                JanSeva AI Copilot
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Online • Ward 42
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Multilingual civic assistant with live BBMP, BESCOM & BWSSB intelligence.
            </p>
          </div>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-surface-container-high shadow-sm text-xs">
          <span className="text-on-surface-variant font-bold">Language:</span>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="bg-transparent font-bold text-primary-700 focus:outline-none cursor-pointer"
          >
            <option value="English">English</option>
            <option value="Hindi">हिन्दी (Hindi)</option>
            <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
            <option value="Marathi">मराठी (Marathi)</option>
            <option value="Tamil">தமிழ் (Tamil)</option>
          </select>
        </div>
      </div>

      {/* Main Chat Window */}
      <div className="rounded-3xl bg-white border border-surface-container-high shadow-soft flex flex-col h-[560px] overflow-hidden">
        
        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-surface/40">
          
          {chatMessages.map((msg) => {
            const isUser = msg.sender === "user";

            return (
              <div
                key={msg.id}
                className={cn("flex gap-3 max-w-[85%]", isUser ? "ml-auto flex-row-reverse" : "mr-auto")}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm",
                    isUser
                      ? "bg-primary-600 text-white font-bold text-xs"
                      : "bg-gradient-to-tr from-primary-600 to-indigo-700 text-white"
                  )}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>

                <div className="space-y-2">
                  <div
                    className={cn(
                      "p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm",
                      isUser
                        ? "bg-primary-600 text-white rounded-tr-none font-medium"
                        : "bg-white text-on-surface border border-surface-container-high rounded-tl-none"
                    )}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>
                  </div>

                  {/* Actions attached to response */}
                  {msg.quickActions && msg.quickActions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {msg.quickActions.map((qa, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (qa.action.includes("report")) router.push("/report");
                            else if (qa.action.includes("101")) router.push("/issues/JS-101");
                            else if (qa.action.includes("ward")) router.push("/ward");
                            else if (qa.action.includes("map")) router.push("/map");
                            else sendChatMessage(qa.action);
                          }}
                          className="px-3 py-1.5 rounded-full bg-white border border-primary-200 text-primary-700 hover:bg-primary-50 text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                        >
                          <span>{qa.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isRecording && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-3 animate-pulse">
              <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping"></span>
              <span>Recording microphone input in {selectedLang}... Speak now.</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips */}
        <div className="p-2.5 border-t border-surface-dim bg-white overflow-x-auto flex gap-2 no-scrollbar">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => sendChatMessage(prompt)}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface border border-surface-dim shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-3.5 border-t border-surface-container-high bg-white flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleVoiceSim}
            className={cn(
              "p-3 rounded-2xl border transition-all",
              isRecording
                ? "bg-rose-500 text-white border-rose-600 animate-bounce"
                : "bg-surface-container-low hover:bg-surface-container text-on-surface-variant border-surface-dim"
            )}
            title={isRecording ? "Stop voice recording" : "Multilingual Voice Input"}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask in ${selectedLang} (e.g. status of complaint, corporator info, waste rules)...`}
            className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-2xl bg-surface-container-low border border-surface-dim focus:outline-none focus:ring-2 focus:ring-primary-500 text-on-surface"
          />

          <button
            type="submit"
            disabled={!input.trim()}
            className="p-3 rounded-2xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white font-bold transition-all shadow-md shadow-primary-600/30"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

      </div>
    </div>
  );
}
