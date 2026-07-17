"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, ChevronRight, BookOpen, X, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SessionRecord {
  id: string;
  prompt: string;
  created_at: string;
  learner_level: string;
}

interface SessionHistorySidebarProps {
  onSelectSession: (prompt: string) => void;
}

export function SessionHistorySidebar({ onSelectSession }: SessionHistorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/backend/api/v1/history/");
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions ?? []);
      }
    } catch {
      // silent fail — history is a convenience feature
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      {/* Trigger button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="gap-2 fixed bottom-6 right-6 z-40 shadow-lg rounded-full px-4"
      >
        <History className="h-4 w-4" />
        History
      </Button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="sidebar"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 z-50 h-full w-80 bg-background border-l shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Learning History</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Sessions list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {loading && (
                <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                  Loading history…
                </div>
              )}

              {!loading && sessions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                  <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground">No sessions yet. Start learning!</p>
                </div>
              )}

              {!loading && sessions.map((session, i) => (
                <motion.button
                  key={session.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    onSelectSession(session.prompt);
                    setIsOpen(false);
                  }}
                  className="w-full text-left rounded-xl border bg-card p-3 hover:bg-muted/60 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{session.prompt}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{formatDate(session.created_at)}</span>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary capitalize">
                      {session.learner_level}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Click any session to replay it
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
