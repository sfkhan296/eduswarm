"use client";

import { motion } from "framer-motion";
import { Brain, BookOpen, ListChecks, Palette } from "lucide-react";

const AGENTS = [
  { name: "Learner Analysis", icon: Brain },
  { name: "Content Generation", icon: BookOpen },
  { name: "Quiz Generation", icon: ListChecks },
  { name: "UI Personalization", icon: Palette },
];

export function AgentStatusBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-lg border bg-muted/50 p-4"
    >
      <p className="text-xs text-muted-foreground mb-3 font-medium uppercase tracking-wider">
        Agents working…
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {AGENTS.map(({ name, icon: Icon }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-center gap-2 rounded-md bg-background p-2 shadow-sm"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <Icon className="h-4 w-4 text-primary" />
            </motion.div>
            <span className="text-xs font-medium">{name}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
