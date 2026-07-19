"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, BookOpen, ListChecks, Palette } from "lucide-react";

const AGENTS = [
  { name: "Learner Analysis", icon: Brain, color: "text-violet-500", bg: "bg-violet-500/10" },
  { name: "Content Generation", icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "Quiz Generation", icon: ListChecks, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { name: "UI Personalization", icon: Palette, color: "text-orange-500", bg: "bg-orange-500/10" },
];

const LOADING_QUIPS = [
  "Brewing your brain fuel… ☕",
  "Teaching the AIs to teach you… meta, right? 🤖",
  "Consulting the robot council… 🤝",
  "Summoning knowledge from the void… ✨",
  "Asking very smart robots very hard questions… 🧠",
  "Your lesson is being assembled by tiny digital elves… 🧝",
  "Hold tight — this is the fun part (for us)… 🎉",
  "Turning caffeine into curriculum… ⚡",
  "Almost there! (The robots are being dramatic) 🎭",
  "Loading… please enjoy this moment of zen 🧘",
];

function useRotatingQuip() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % LOADING_QUIPS.length), 3000);
    return () => clearInterval(id);
  }, []);
  return LOADING_QUIPS[index];
}

export function AgentStatusBar() {
  const quip = useRotatingQuip();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="rounded-xl border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="h-2 w-2 rounded-full bg-primary"
        />
        <AnimatePresence mode="wait">
          <motion.p
            key={quip}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.35 }}
            className="text-sm font-medium text-muted-foreground"
          >
            {quip}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {AGENTS.map(({ name, icon: Icon, color, bg }, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.12 }}
            className="flex items-center gap-2.5 rounded-lg border bg-background p-3 shadow-sm"
          >
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${bg}`}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2 + i * 0.3, ease: "linear" }}
              >
                <Icon className={`h-4 w-4 ${color}`} />
              </motion.div>
            </div>
            <span className="text-xs font-medium leading-tight">{name}</span>
          </motion.div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 20, ease: "linear" }}
        />
      </div>
    </motion.div>
  );
}
