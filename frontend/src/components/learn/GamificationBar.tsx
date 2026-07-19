"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap } from "lucide-react";
import { BADGE_DEFS, XP_PER_LEVEL } from "@/hooks/useGamification";
import type { GamificationState } from "@/hooks/useGamification";

interface GamificationBarProps {
  state: GamificationState;
  xpGained: number;
  leveledUp: boolean;
  newBadge: string | null;
  onClearBadge: () => void;
  onClearLevelUp: () => void;
  isChild: boolean;
}

export function GamificationBar({
  state, xpGained, leveledUp, newBadge, onClearBadge, onClearLevelUp, isChild,
}: GamificationBarProps) {
  const xpInLevel = state.totalXP % XP_PER_LEVEL;
  const progress = (xpInLevel / XP_PER_LEVEL) * 100;

  return (
    <div className="relative">
      {/* Badge unlock popup */}
      <AnimatePresence>
        {newBadge && (
          <motion.div
            key="badge-popup"
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            onAnimationComplete={() => {
              setTimeout(onClearBadge, 2500);
            }}
            className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border bg-background shadow-xl px-4 py-2 whitespace-nowrap"
          >
            <span className="text-xl">{BADGE_DEFS[newBadge]?.emoji}</span>
            <div>
              <p className="text-xs font-bold text-primary">{BADGE_DEFS[newBadge]?.label}</p>
              <p className="text-xs text-muted-foreground">{BADGE_DEFS[newBadge]?.description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level-up popup */}
      <AnimatePresence>
        {leveledUp && (
          <motion.div
            key="level-up"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, rotate: [0, -5, 5, -3, 3, 0] }}
            exit={{ opacity: 0, scale: 0 }}
            onAnimationComplete={() => setTimeout(onClearLevelUp, 2000)}
            className="absolute -top-14 left-1/2 -translate-x-1/2 z-50 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-5 py-2 font-bold text-sm shadow-xl whitespace-nowrap"
          >
            🎉 LEVEL UP! You're now Level {state.level}!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main bar */}
      <div className={`rounded-xl border p-3 ${
        isChild
          ? "bg-gradient-to-r from-yellow-50 via-pink-50 to-violet-50 dark:from-yellow-950/30 dark:via-pink-950/20 dark:to-violet-950/30 border-yellow-200 dark:border-yellow-800"
          : "bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30"
      }`}>
        <div className="flex items-center justify-between gap-3">

          {/* Level badge */}
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm shadow-inner
            ${isChild
              ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
              : "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"}`}
          >
            {state.level}
          </div>

          {/* XP bar + stats */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Zap className={`h-3.5 w-3.5 ${isChild ? "text-yellow-500" : "text-primary"}`} />
                <span className="text-xs font-semibold">
                  {state.totalXP} XP
                </span>
                <AnimatePresence>
                  {xpGained > 0 && (
                    <motion.span
                      key={xpGained + state.totalXP}
                      initial={{ opacity: 1, y: 0, x: 0 }}
                      animate={{ opacity: 0, y: -16 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.9 }}
                      className="text-xs font-bold text-emerald-500"
                    >
                      +{xpGained}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <span className="text-xs text-muted-foreground">
                Level {state.level} → {state.level + 1}
              </span>
            </div>

            {/* XP progress bar */}
            <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${
                  isChild
                    ? "bg-gradient-to-r from-yellow-400 to-pink-500"
                    : "bg-gradient-to-r from-violet-500 to-indigo-500"
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Streak */}
          <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold
            ${state.streak >= 3
              ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
              : "bg-muted text-muted-foreground"}`}
          >
            <Flame className={`h-3.5 w-3.5 ${state.streak >= 3 ? "text-orange-500" : ""}`} />
            {state.streak}x
            {state.streak >= 3 && (
              <span className="text-orange-500 ml-0.5">
                {state.streak >= 5 ? "🔥" : "⚡"}
              </span>
            )}
          </div>

          {/* Badges */}
          {state.badges.length > 0 && (
            <div className="flex items-center gap-0.5">
              {state.badges.slice(-3).map((b) => (
                <motion.span
                  key={b}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  title={`${BADGE_DEFS[b]?.label}: ${BADGE_DEFS[b]?.description}`}
                  className="text-base cursor-default select-none"
                >
                  {BADGE_DEFS[b]?.emoji ?? "🏅"}
                </motion.span>
              ))}
              {state.badges.length > 3 && (
                <span className="text-xs text-muted-foreground ml-0.5">+{state.badges.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
