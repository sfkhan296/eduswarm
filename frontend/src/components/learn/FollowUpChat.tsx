"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, MessageSquare, ChevronDown, Mic, MicOff, Volume2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTTS, useSTT } from "@/hooks/useSpeech";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FollowUpChatProps {
  topic: string;
  level: string;
  language?: string;
}

export function FollowUpChat({ topic, level, language = "en" }: FollowUpChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Great lesson! 🎉 I'm your study buddy for "${topic}" — no judgment zone here. Ask me anything, no matter how "silly" it sounds. Curiosity is the whole point! Type or hit the mic 🎤`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pendingSpeakRef = useRef<string | null>(null);
  const { speak, stop, speaking } = useTTS();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Speak pending reply after messages state updates
  useEffect(() => {
    if (pendingSpeakRef.current) {
      const text = pendingSpeakRef.current;
      pendingSpeakRef.current = null;
      setSpeakingMsgIndex(messages.length - 1);
      speak(text);
    }
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || loading) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/backend/api/v1/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          topic,
          level,
          language,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error("Chat request failed");
      const data = await res.json();
      const reply = data.reply as string;

      // Store reply to speak after state updates
      pendingSpeakRef.current = reply;
      setMessages((prev) => [...prev, { role: "assistant" as const, content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't process that. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // STT handlers
  const handleSpeechResult = useCallback((interim: string) => {
    setInput(interim);
  }, []);

  const handleSpeechFinal = useCallback((final: string) => {
    const trimmed = final.trim();
    setInput(trimmed);
    setTimeout(() => handleSend(trimmed), 400);
  }, [messages, loading]);

  const { listening, supported, startListening, stopListening } = useSTT(
    handleSpeechResult,
    handleSpeechFinal,
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleReadMessage = (index: number, content: string) => {
    if (speaking && speakingMsgIndex === index) {
      stop();
      setSpeakingMsgIndex(null);
    } else {
      setSpeakingMsgIndex(index);
      speak(content);
    }
  };

  const SUGGESTIONS = [
    "Can you give me a real-world example? 🌍",
    "Explain this like I'm five 👶",
    "What's a common mistake people make here?",
    "Why should I even care about this? 😅",
    "Give me a fun fact related to this 🤓",
    "How do I remember this easily?",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border bg-card shadow-sm overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm">Follow-up Chat</p>
            <p className="text-xs text-muted-foreground">Type or speak your question</p>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${collapsed ? "" : "rotate-180"}`}
        />
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t"
          >
            {/* Messages */}
            <div className="h-72 overflow-y-auto p-4 space-y-3 bg-muted/10">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i }}
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                    ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border"}`}
                  >
                    {msg.role === "user"
                      ? <User className="h-3.5 w-3.5" />
                      : <Bot className="h-3.5 w-3.5 text-primary" />
                    }
                  </div>

                  {/* Bubble + TTS button */}
                  <div className={`group flex flex-col gap-1 max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`rounded-xl px-3 py-2 text-sm leading-relaxed
                      ${msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-background border rounded-tl-sm"}`}
                    >
                      {msg.content}
                    </div>

                    {/* Read button for assistant messages */}
                    {msg.role === "assistant" && (
                      <button
                        onClick={() => toggleReadMessage(i, msg.content)}
                        className={`flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity
                          ${speaking && speakingMsgIndex === i ? "text-primary opacity-100" : "text-muted-foreground"}`}
                      >
                        {speaking && speakingMsgIndex === i
                          ? <><Square className="h-3 w-3 fill-current" /> Stop</>
                          : <><Volume2 className="h-3 w-3" /> Listen</>
                        }
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted border">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="rounded-xl rounded-tl-sm bg-background border px-3 py-2">
                    <div className="flex gap-1 items-center h-4">
                      {[0, 1, 2].map((dot) => (
                        <motion.div
                          key={dot}
                          className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ repeat: Infinity, duration: 1, delay: dot * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestion chips */}
            {messages.length <= 2 && (
              <div className="flex flex-wrap gap-2 px-4 pt-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="rounded-full border bg-muted/50 px-3 py-1 text-xs hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Listening indicator */}
            <AnimatePresence>
              {listening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-4 pt-2 text-xs text-red-500"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                  </span>
                  Listening… speak clearly then pause
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input row */}
            <div className="flex items-center gap-2 p-4 pt-3">
              {/* Mic button */}
              {supported && (
                <button
                  type="button"
                  onClick={() => listening ? stopListening() : startListening()}
                  disabled={loading}
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-all
                    ${listening
                      ? "bg-red-500 border-red-500 text-white animate-pulse"
                      : "bg-muted text-muted-foreground hover:text-primary hover:border-primary/40"}`}
                  title={listening ? "Stop mic" : "Speak your question"}
                >
                  {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
              )}

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={listening ? "Listening…" : "Ask a follow-up question…"}
                disabled={loading}
                readOnly={listening}
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 transition"
              />
              <Button
                size="icon"
                onClick={() => handleSend()}
                disabled={loading || !input.trim() || listening}
                className="shrink-0"
              >
                {loading
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Send className="h-4 w-4" />
                }
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
