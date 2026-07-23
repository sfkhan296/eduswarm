"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";

export interface GamificationState {
  totalXP: number;
  level: number;
  streak: number;
  maxStreak: number;
  badges: string[];
  totalCorrect: number;
  totalAnswered: number;
}

export const XP_PER_LEVEL = 100;
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const STORAGE_KEY = "eduswarm_gamification_v2";

export const BADGE_DEFS: Record<string, { emoji: string; label: string; description: string }> = {
  first_answer:   { emoji: "🎯", label: "First Shot",     description: "Answered your first question!" },
  three_streak:   { emoji: "🔥", label: "On Fire",        description: "3 correct in a row!" },
  five_streak:    { emoji: "⚡", label: "Lightning",      description: "5 correct in a row!" },
  ten_streak:     { emoji: "🌟", label: "Unstoppable",    description: "10 correct in a row!" },
  perfect_quiz:   { emoji: "🏆", label: "Perfect Score",  description: "Got every question right!" },
  level_2:        { emoji: "🥈", label: "Level 2",        description: "Reached Level 2!" },
  level_3:        { emoji: "🥇", label: "Level 3",        description: "Reached Level 3!" },
  level_5:        { emoji: "💎", label: "Diamond",        description: "Reached Level 5!" },
  fifty_xp:       { emoji: "⭐", label: "Star Learner",   description: "Earned 50 XP!" },
  hundred_xp:     { emoji: "💯", label: "Century",        description: "Earned 100 XP!" },
  speed_demon:    { emoji: "🚀", label: "Speed Demon",    description: "Answered in under 5 seconds!" },
};

const DEFAULT_STATE: GamificationState = {
  totalXP: 0,
  level: 1,
  streak: 0,
  maxStreak: 0,
  badges: [],
  totalCorrect: 0,
  totalAnswered: 0,
};

export function useGamification() {
  const [state, setState] = useState<GamificationState>(DEFAULT_STATE);
  const [newBadge, setNewBadge] = useState<string | null>(null);
  const [xpGained, setXpGained] = useState(0);
  const [leveledUp, setLeveledUp] = useState(false);
  const { getToken, isSignedIn } = useAuth();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from Supabase on sign-in, fallback to localStorage
  useEffect(() => {
    if (!isSignedIn) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setState(JSON.parse(saved));
      } catch {}
      return;
    }

    (async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_BASE}/api/v1/preferences/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.gamification) {
            setState(data.gamification as GamificationState);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.gamification));
          }
        }
      } catch {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) setState(JSON.parse(saved));
        } catch {}
      }
    })();
  }, [isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced save to Supabase — waits 2s after last update to batch writes
  const persistToSupabase = useCallback(async (next: GamificationState) => {
    if (!isSignedIn) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const token = await getToken();
        await fetch(`${API_BASE}/api/v1/preferences/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ gamification: next }),
        });
      } catch {
        // Silent fail — localStorage is already updated
      }
    }, 2000);
  }, [isSignedIn, getToken]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useCallback((next: GamificationState) => {
    setState(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
    persistToSupabase(next);
  }, [persistToSupabase]);

  const addXP = (xp: number, isCorrect: boolean, isFast = false, isPerfect = false) => {
    setState((prev) => {
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const multiplier = newStreak >= 5 ? 2 : newStreak >= 3 ? 1.5 : 1;
      const bonusXP = Math.round(xp * multiplier) + (isFast ? 5 : 0);
      const newTotal = prev.totalXP + (isCorrect ? bonusXP : 0);
      const newLevel = Math.floor(newTotal / XP_PER_LEVEL) + 1;
      const newMaxStreak = Math.max(prev.maxStreak, newStreak);
      const newCorrect = prev.totalCorrect + (isCorrect ? 1 : 0);
      const newAnswered = prev.totalAnswered + 1;

      const newBadges = [...prev.badges];
      let earnedBadge: string | null = null;

      const tryBadge = (id: string) => {
        if (!newBadges.includes(id)) {
          newBadges.push(id);
          earnedBadge = id;
        }
      };

      if (newAnswered === 1) tryBadge("first_answer");
      if (newStreak >= 3) tryBadge("three_streak");
      if (newStreak >= 5) tryBadge("five_streak");
      if (newStreak >= 10) tryBadge("ten_streak");
      if (isPerfect) tryBadge("perfect_quiz");
      if (newTotal >= 50 && !prev.badges.includes("fifty_xp")) tryBadge("fifty_xp");
      if (newTotal >= 100 && !prev.badges.includes("hundred_xp")) tryBadge("hundred_xp");
      if (isFast) tryBadge("speed_demon");
      if (newLevel >= 2 && prev.level < 2) tryBadge("level_2");
      if (newLevel >= 3 && prev.level < 3) tryBadge("level_3");
      if (newLevel >= 5 && prev.level < 5) tryBadge("level_5");

      if (earnedBadge) setNewBadge(earnedBadge);
      if (newLevel > prev.level) setLeveledUp(true);
      setXpGained(isCorrect ? bonusXP : 0);

      const next: GamificationState = {
        totalXP: newTotal,
        level: newLevel,
        streak: newStreak,
        maxStreak: newMaxStreak,
        badges: newBadges,
        totalCorrect: newCorrect,
        totalAnswered: newAnswered,
      };

      // Persist in background
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      persistToSupabase(next);

      return next;
    });
  };

  const clearNewBadge = () => setNewBadge(null);
  const clearLevelUp = () => setLeveledUp(false);
  const clearXPGained = () => setXpGained(0);

  const resetAll = () => {
    save(DEFAULT_STATE);
    setNewBadge(null);
    setLeveledUp(false);
    setXpGained(0);
  };

  const xpInCurrentLevel = state.totalXP % XP_PER_LEVEL;
  const xpProgress = (xpInCurrentLevel / XP_PER_LEVEL) * 100;

  return {
    state,
    addXP,
    resetAll,
    newBadge,
    clearNewBadge,
    xpGained,
    clearXPGained,
    leveledUp,
    clearLevelUp,
    xpProgress,
    BADGE_DEFS,
  };
}
