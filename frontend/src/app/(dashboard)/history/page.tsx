"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History, BookOpen, Clock, ArrowRight, Baby, GraduationCap, Briefcase } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SessionRecord {
  id: string;
  prompt: string;
  created_at: string;
  learner_level: string;
}

const LEVEL_ICONS: Record<string, { icon: typeof Baby; color: string }> = {
  child: { icon: Baby, color: "text-yellow-500" },
  teen: { icon: GraduationCap, color: "text-blue-500" },
  professional: { icon: Briefcase, color: "text-violet-500" },
};

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
          <p className="text-sm text-muted-foreground">All your past sessions</p>
        </div>
      </motion.div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
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
        {sessions.map((session, i) => {
          const levelConfig = LEVEL_ICONS[session.learner_level] ?? LEVEL_ICONS.professional;
          const Icon = levelConfig.icon;

          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center justify-between rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Icon className={`h-5 w-5 ${levelConfig.color}`} />
                </div>
                <div>
                  <p className="font-medium line-clamp-1">{session.prompt}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Clock className="h-3 w-3 text-muted-foreground" />
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
              <Button asChild variant="ghost" size="icon" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/learn?prompt=${encodeURIComponent(session.prompt)}`}>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
