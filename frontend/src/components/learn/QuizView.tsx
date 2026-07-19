"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Trophy, RotateCcw, Timer, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GamificationBar } from "./GamificationBar";
import { useGamification } from "@/hooks/useGamification";
import type { QuizQuestion, LearnerLevel } from "@/types/api";

interface QuizViewProps {
  questions: QuizQuestion[];
  level: LearnerLevel;
}

// ─── Confetti ────────────────────────────────────────────────────────────────
function Confetti({ show }: { show: boolean }) {
  if (!show) return null;
  const COLORS = ["#f59e0b", "#10b981", "#6366f1", "#ef4444", "#ec4899", "#3b82f6", "#f97316"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-10">
      {Array.from({ length: 24 }, (_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, x: "50%", y: "60%", scale: 0, rotate: 0 }}
          animate={{
            opacity: [1, 1, 0],
            x: `${30 + Math.random() * 40}%`,
            y: `${-10 + Math.random() * -80}%`,
            scale: [0, 1, 0.8],
            rotate: Math.random() * 540 - 270,
          }}
          transition={{ duration: 0.8 + Math.random() * 0.5, ease: "easeOut" }}
          className="absolute rounded-sm"
          style={{
            width: Math.random() > 0.5 ? 8 : 6,
            height: Math.random() > 0.5 ? 8 : 12,
            backgroundColor: COLORS[i % COLORS.length],
            top: "50%",
            left: `${20 + Math.random() * 60}%`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Mascot ──────────────────────────────────────────────────────────────────
function Mascot({ mood }: { mood: "idle" | "happy" | "sad" | "fire" }) {
  const faces = { idle: "🤖", happy: "🎉", sad: "😅", fire: "🔥" };
  return (
    <motion.div
      key={mood}
      initial={{ scale: 0.8, rotate: -10 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 12 }}
      className="text-3xl select-none"
    >
      {faces[mood]}
    </motion.div>
  );
}

// ─── Timer hook ──────────────────────────────────────────────────────────────
function useQuestionTimer(active: boolean, limit: number, onExpire: () => void) {
  const [timeLeft, setTimeLeft] = useState(limit);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!active) { setTimeLeft(limit); return; }
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!);
          onExpire();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current!);
  }, [active, limit]);

  useEffect(() => { setTimeLeft(limit); }, [limit]);

  return timeLeft;
}

// ─── Celebration screen ──────────────────────────────────────────────────────
function CelebrationScreen({
  score, total, isChild, isTeen, onRetry,
}: { score: number; total: number; isChild: boolean; isTeen: boolean; onRetry: () => void }) {
  const isPerfect = score === total;
  const pct = Math.round((score / total) * 100);

  const getMessage = () => {
    if (isPerfect) return isChild
      ? "AMAZING! You got everything right! Your brain is huge! 🌟🎊"
      : "Perfect score! Are you secretly a professor? 🏆";
    if (pct >= 80) return isChild
      ? "Wow, you did great! High five from the robot! 🤖✋"
      : "Excellent work! Your neurons are doing a happy dance 🕺";
    if (pct >= 60) return isChild
      ? "Good try! Even Einstein got things wrong sometimes! 💪"
      : "Solid effort! You're officially smarter than you were 10 minutes ago.";
    return isChild
      ? "Keep trying — every genius started somewhere! 🌈"
      : "Hey, Newton failed his exams too. Probably. Keep going 💪";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative overflow-hidden rounded-2xl border p-8 text-center shadow-lg ${
        isPerfect
          ? "bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 dark:from-yellow-950/30 dark:via-orange-950/20 dark:to-pink-950/30 border-yellow-300 dark:border-yellow-700"
          : "bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30"
      }`}
    >
      <Confetti show={isPerfect} />

      <motion.div
        animate={isPerfect ? { rotate: [0, -10, 10, -8, 8, 0], scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-6xl mb-4"
      >
        {isPerfect ? "🏆" : pct >= 80 ? "🌟" : pct >= 60 ? "👍" : "💪"}
      </motion.div>

      <h2 className={`font-bold mb-2 ${isChild ? "text-2xl" : "text-xl"}`}>
        {getMessage()}
      </h2>

      {/* Score circle */}
      <div className="flex justify-center my-4">
        <div className={`flex h-24 w-24 items-center justify-center rounded-full border-4 shadow-inner
          ${isPerfect ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30" : "border-primary bg-primary/5"}`}
        >
          <div>
            <p className="text-2xl font-extrabold leading-none">{score}/{total}</p>
            <p className="text-xs text-muted-foreground">{pct}%</p>
          </div>
        </div>
      </div>

      {/* Stars */}
      <div className="flex justify-center gap-1 mb-5">
        {[1, 2, 3].map((star) => (
          <motion.div
            key={star}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: pct >= star * 33 ? 1 : 0.4, rotate: 0 }}
            transition={{ delay: 0.3 + star * 0.15, type: "spring" }}
          >
            <Star
              className={`h-7 w-7 ${pct >= star * 33 ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"}`}
            />
          </motion.div>
        ))}
      </div>

      <Button onClick={onRetry} variant="outline" className="gap-2">
        <RotateCcw className="h-4 w-4" />
        Try Again
      </Button>
    </motion.div>
  );
}

// ─── Main QuizView ────────────────────────────────────────────────────────────
export function QuizView({ questions, level }: QuizViewProps) {
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [mascotMood, setMascotMood] = useState<"idle" | "happy" | "sad" | "fire">("idle");
  const [showCelebration, setShowCelebration] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [currentTimerQ, setCurrentTimerQ] = useState(0);
  const [timedOut, setTimedOut] = useState<Set<number>>(new Set());
  const [answerTimes, setAnswerTimes] = useState<Record<number, number>>({});
  const questionStartRef = useRef<number>(Date.now());

  const isChild = level === "child";
  const isTeen = level === "teen";
  const hasTimer = isTeen; // Teens get a 15-second timer
  const TIMER_LIMIT = 15;

  const {
    state, addXP, resetAll,
    newBadge, clearNewBadge,
    xpGained, clearXPGained,
    leveledUp, clearLevelUp,
  } = useGamification();

  // Start timer for current unanswered question (teens only)
  useEffect(() => {
    if (!hasTimer) return;
    const firstUnanswered = questions.findIndex((_, i) => selected[i] === undefined);
    if (firstUnanswered !== -1) {
      setCurrentTimerQ(firstUnanswered);
      setTimerActive(true);
      questionStartRef.current = Date.now();
    } else {
      setTimerActive(false);
    }
  }, [selected, hasTimer]);

  const handleTimeout = () => {
    setTimedOut((prev) => new Set([...prev, currentTimerQ]));
    setSelected((prev) => ({ ...prev, [currentTimerQ]: -1 })); // -1 = timed out
    setMascotMood("sad");
    setTimeout(() => setMascotMood("idle"), 1500);
    addXP(0, false);
  };

  const timeLeft = useQuestionTimer(
    timerActive && !showCelebration,
    TIMER_LIMIT,
    handleTimeout,
  );

  const handleSelect = (qIndex: number, oIndex: number) => {
    if (selected[qIndex] !== undefined) return;
    if (timedOut.has(qIndex)) return;

    setTimerActive(false);
    const elapsed = (Date.now() - questionStartRef.current) / 1000;
    setAnswerTimes((prev) => ({ ...prev, [qIndex]: elapsed }));

    const isCorrect = oIndex === questions[qIndex].correct_index;
    const isFast = elapsed < 5;

    setSelected((prev) => {
      const next = { ...prev, [qIndex]: oIndex };

      // Check if all answered after this
      const allDone = questions.every((_, i) => next[i] !== undefined);
      const correctCount = Object.entries(next).filter(
        ([qi, oi]) => Number(oi) === questions[Number(qi)].correct_index
      ).length;
      const isPerfect = allDone && correctCount === questions.length;

      if (isCorrect) {
        const newStreak = state.streak + 1;
        const mood = newStreak >= 5 ? "fire" : "happy";
        setMascotMood(mood);
        setTimeout(() => setMascotMood("idle"), 1500);
        addXP(20, true, isFast, isPerfect);
      } else {
        setMascotMood("sad");
        setTimeout(() => setMascotMood("idle"), 1500);
        addXP(0, false);
      }

      if (allDone) {
        setTimeout(() => setShowCelebration(true), 400);
      }

      return next;
    });
  };

  const score = Object.entries(selected).filter(
    ([qIdx, oIdx]) => Number(oIdx) === questions[Number(qIdx)].correct_index
  ).length;

  const allAnswered = Object.keys(selected).length === questions.length;

  const handleReset = () => {
    setSelected({});
    setShowCelebration(false);
    setTimedOut(new Set());
    setAnswerTimes({});
    setMascotMood("idle");
    resetAll();
  };

  // Current unanswered question for timer display
  const activeQ = questions.findIndex((_, i) => selected[i] === undefined);

  return (
    <div className="space-y-4">
      {/* Gamification bar */}
      <GamificationBar
        state={state}
        xpGained={xpGained}
        leveledUp={leveledUp}
        newBadge={newBadge}
        onClearBadge={clearNewBadge}
        onClearLevelUp={clearLevelUp}
        isChild={isChild}
      />

      {/* Mascot + timer row */}
      <div className="flex items-center justify-between rounded-xl border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <Mascot mood={mascotMood} />
          <div>
            <p className="text-sm font-medium">
              {mascotMood === "happy" && (isChild ? "Nailed it! You're a genius! 🌟" : "Correct! Look at you go! 🎯")}
              {mascotMood === "sad" && (isChild ? "Oops! The right answer is sneaky! 👀" : "Not this time — but you're still cool 😎")}
              {mascotMood === "fire" && "YOU'RE ON FIRE! Someone call the firefighters! 🔥🚒"}
              {mascotMood === "idle" && (isChild ? "Ready? Show me what you've got! 💪" : "Think carefully… or just vibe with it 🤙")}
            </p>
            <p className="text-xs text-muted-foreground">
              {score} correct · {Object.keys(selected).length}/{questions.length} answered
            </p>
          </div>
        </div>

        {/* Timer (teens only) */}
        {hasTimer && !allAnswered && activeQ !== -1 && (
          <motion.div
            animate={timeLeft <= 5 ? { scale: [1, 1.1, 1] } : {}}
            transition={{ repeat: timeLeft <= 5 ? Infinity : 0, duration: 0.5 }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold border
              ${timeLeft <= 5
                ? "bg-red-50 border-red-300 text-red-600 dark:bg-red-950/30 dark:border-red-700"
                : timeLeft <= 10
                ? "bg-orange-50 border-orange-200 text-orange-600 dark:bg-orange-950/20"
                : "bg-muted text-muted-foreground"}`}
          >
            <Timer className="h-4 w-4" />
            {timeLeft}s
          </motion.div>
        )}
      </div>

      {/* Celebration screen */}
      <AnimatePresence>
        {showCelebration && (
          <CelebrationScreen
            score={score}
            total={questions.length}
            isChild={isChild}
            isTeen={isTeen}
            onRetry={handleReset}
          />
        )}
      </AnimatePresence>

      {/* Questions */}
      {!showCelebration && questions.map((q, qIndex) => {
        const chosenIndex = selected[qIndex];
        const answered = chosenIndex !== undefined;
        const isCorrect = Number(chosenIndex) === q.correct_index;
        const isTimedOut = timedOut.has(qIndex);
        const elapsed = answerTimes[qIndex];
        const wasFast = elapsed !== undefined && elapsed < 5;
        const isActive = activeQ === qIndex;

        return (
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qIndex * 0.07 }}
            className={`relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all
              ${isActive && hasTimer && !answered ? "ring-2 ring-primary/30" : ""}
              ${isChild && answered && isCorrect ? "border-yellow-300 dark:border-yellow-700 border-2" : ""}
            `}
          >
            <Confetti show={answered && isCorrect && (isChild || isTeen)} />

            <div className="p-5">
              {/* Question header */}
              <div className="flex items-start gap-3 mb-4">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold
                  ${answered && isCorrect ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    : answered && !isCorrect ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                    : "bg-primary/10 text-primary"}`}
                >
                  {qIndex + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${isChild ? "text-base" : "text-sm"}`}>{q.question}</p>

                  {/* Reward tags */}
                  {answered && isCorrect && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 mt-1.5 flex-wrap"
                    >
                      <span className="flex items-center gap-1 text-xs font-bold text-yellow-600 dark:text-yellow-400">
                        <Zap className="h-3.5 w-3.5" /> +20 XP
                      </span>
                      {wasFast && (
                        <span className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                          ⚡ Speed Bonus +5 XP
                        </span>
                      )}
                      {state.streak >= 3 && (
                        <span className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400">
                          🔥 {state.streak}x Combo!
                        </span>
                      )}
                    </motion.div>
                  )}

                  {isTimedOut && (
                    <p className="text-xs text-red-500 mt-1">⏰ Time ran out! (It happens to the best of us)</p>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2 ml-10">
                {q.options.map((option, oIndex) => {
                  const isCorrectOption = oIndex === q.correct_index;
                  const isChosen = Number(chosenIndex) === oIndex;

                  let cls = "w-full text-left rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-2 border-2 transition-all font-medium ";

                  if (!answered) {
                    cls += isChild
                      ? "border-border bg-muted/30 hover:border-primary hover:bg-primary/5 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                      : "border-border bg-muted/30 hover:border-primary/40 hover:bg-primary/5 cursor-pointer";
                  } else if (isChosen && isCorrectOption) {
                    cls += "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 cursor-default";
                  } else if (isChosen && !isCorrectOption) {
                    cls += "border-red-400 bg-red-50 dark:bg-red-950/40 cursor-default";
                  } else if (!isChosen && isCorrectOption) {
                    cls += "border-emerald-300/60 bg-emerald-50/40 dark:bg-emerald-950/20 cursor-default";
                  } else {
                    cls += "opacity-40 cursor-default border-border";
                  }

                  return (
                    <motion.button
                      key={oIndex}
                      onClick={() => handleSelect(qIndex, oIndex)}
                      disabled={answered}
                      whileHover={!answered ? { scale: isChild ? 1.02 : 1.01 } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                      className={cls}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors
                          ${answered && isCorrectOption ? "border-emerald-400 bg-emerald-100 text-emerald-700" :
                            answered && isChosen ? "border-red-400 bg-red-100 text-red-700" :
                            "border-current"}`}
                        >
                          {String.fromCharCode(65 + oIndex)}
                        </span>
                        <span className={isChild ? "text-base" : ""}>{option}</span>
                      </div>
                      {answered && isCorrectOption && <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />}
                      {answered && isChosen && !isCorrectOption && <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Explanation */}
              <AnimatePresence>
                {answered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 ml-10 overflow-hidden"
                  >
                    <div className={`rounded-xl px-3 py-2 text-sm ${
                      isCorrect
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      <span className="font-semibold">
                        {isCorrect ? (isChild ? "✅ Correct! You're a rockstar! " : "✓ Nailed it! ") : (isTimedOut ? "⏰ Time's up! No sweat — " : "❌ Not quite! Here's the tea: ")}
                      </span>
                      {q.explanation}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
