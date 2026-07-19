"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, BookOpen, Clock, ChevronDown, ChevronUp, Baby, GraduationCap, Briefcase, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LearningSession } from "@/components/learn/LearningSession";
import type { LearningResponse } from "@/types/api";

interface SessionRecord {
  id: string;
  prompt: string;
  created_at: string;
  learner_level: string;
}

const LEVEL_ICONS: Record<string, { icon: typeof Baby; color: string; bg: string }> = {
  child:        { icon: Baby,           color: "text-yellow-500", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  teen:         { icon: GraduationCap,  color: "text-blue-500",   bg: "bg-blue-100 dark:bg-blue-900/30"   },
  professional: { icon: Briefcase,      color: "text-violet-500", bg: "bg-violet-100 dark:bg-violet-900/30" },
};

function SessionRow({ session, index }: { session: SessionRecord; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<LearningResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const levelConfig = LEVEL_ICONS[session.learner_level] ?? LEVEL_ICONS.professional;
  const Icon = levelConfig.icon;

  const handleExpand = async () => {
    if (!expanded && !detail) {
      setLoading(true);
      try {
        const res = await fetch(`/api/backend/api/v1/history/${session.id}`);
        if (res.ok) {
          const data = await res.json();
          setDetail(data.response as LearningResponse);
        }
      } catch {}
      finally { setLoading(false); }
    }
    setExpanded((v) => !v);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-xl border bg-card shadow-sm overflow-hidden"
    >
      {/* Row header */}
      <button
        onClick={handleExpand}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${levelConfig.bg}`}>
            <Icon className={`h-5 w-5 ${levelConfig.color}`} />
          </div>
          <div className="min-w-0">
            <p className="font-medium truncate">{session.prompt}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground">
                {new Date(session.created_at).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className={`text-xs font-medium capitalize ${levelConfig.color}`}>
                {session.learner_level}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-3">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {expanded
            ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
            : <ChevronDown className="h-4 w-4 text-muted-foreground" />
          }
        </div>
      </button>

      {/* Expanded lesson */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t p-4 bg-muted/20">
              {loading && (
                <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
                  Loading lesson…
                </div>
              )}
              {!loading && detail && (
                <LearningSession data={detail} prompt={session.prompt} />
              )}
              {!loading && !detail && (
                <p className="text-sm text-muted-foreground text-center py-6">
                  Could not load lesson details.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/backend/api/v1/history/")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <History className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Learning History</h1>
          <p className="text-sm text-muted-foreground">
            Click any session to view the full lesson
          </p>
        </div>
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your history…
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-xl border bg-card py-20 gap-4 text-center"
        >
          <BookOpen className="h-12 w-12 text-muted-foreground/30" />
          <p className="font-medium">No sessions yet</p>
          <p className="text-sm text-muted-foreground">Start learning to build your history</p>
          <Button asChild className="mt-2">
            <Link href="/learn">Start Learning</Link>
          </Button>
        </motion.div>
      )}

      <div className="space-y-3">
        {sessions.map((session, i) => (
          <SessionRow key={session.id} session={session} index={i} />
        ))}
      </div>
    </div>
  );
}
