"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { QuizQuestion } from "@/types/api";
import { useGamification } from "@/hooks/useGamification";
import { GamificationBar } from "./GamificationBar";

interface SpaceQuizProps {
  questions: QuizQuestion[];
  onGoToLesson: () => void;
}

// ─── Stars ────────────────────────────────────────────────────────────────────
const STARS = Array.from({ length: 80 }, (_, i) => ({
  id: i,
  x: (i * 13.7) % 100,
  y: (i * 7.3 + 5) % 100,
  size: (i % 3) * 0.8 + 0.6,
  dur: (i % 3) + 2,
  delay: (i % 5) * 0.6,
}));

function Stars() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {STARS.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ repeat: Infinity, duration: s.dur, delay: s.delay }}
        />
      ))}
    </div>
  );
}

// ─── Fire bolt (replaces laser) ───────────────────────────────────────────────
function FireBolt({ from, to, show, correct }: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  show: boolean;
  correct: boolean;
}) {
  if (!show) return null;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 1 }}
      animate={{ scaleX: 1, opacity: [1, 1, 0] }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute pointer-events-none origin-left z-20"
      style={{
        left: from.x,
        top: from.y - 4,
        width: length,
        height: 8,
        transform: `rotate(${angle}deg)`,
        background: correct
          ? "linear-gradient(90deg, #f97316, #fde047, #fff)"
          : "linear-gradient(90deg, #7c3aed, #c084fc, #fff)",
        borderRadius: 4,
        boxShadow: correct
          ? "0 0 12px #f97316, 0 0 24px #fde047"
          : "0 0 10px #7c3aed",
        filter: "blur(0.5px)",
      }}
    />
  );
}

// ─── Explosion ────────────────────────────────────────────────────────────────
function Explosion({ x, y }: { x: number; y: number }) {
  const COLORS = ["#f59e0b", "#ef4444", "#f97316", "#fde047", "#fb923c", "#fff"];
  return (
    <div className="absolute pointer-events-none z-30" style={{ left: x - 40, top: y - 40 }}>
      {Array.from({ length: 20 }, (_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 1, x: 40, y: 40, scale: 0 }}
          animate={{
            opacity: [1, 0],
            x: 40 + Math.cos((i / 20) * Math.PI * 2) * (35 + (i % 3) * 12),
            y: 40 + Math.sin((i / 20) * Math.PI * 2) * (35 + (i % 3) * 12),
            scale: [0, 1.8, 0],
          }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="absolute rounded-full"
          style={{
            width: 4 + (i % 4) * 2,
            height: 4 + (i % 4) * 2,
            backgroundColor: COLORS[i % COLORS.length],
            boxShadow: `0 0 6px ${COLORS[i % COLORS.length]}`,
          }}
        />
      ))}
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 4, opacity: 0 }}
        transition={{ duration: 0.45 }}
        className="absolute inset-0 rounded-full bg-orange-400/50"
      />
    </div>
  );
}

// ─── UFO enemy ────────────────────────────────────────────────────────────────
// UFOs are spread out horizontally with enough gap so text is fully visible.
// Layout: evenly spaced across the arena width, staggered vertically.
const UFO_COLORS = [
  { base: "#7c3aed", glow: "#a78bfa" },
  { base: "#0ea5e9", glow: "#7dd3fc" },
  { base: "#ec4899", glow: "#f9a8d4" },
  { base: "#10b981", glow: "#6ee7b7" },
  { base: "#f97316", glow: "#fdba74" },
];

function UFOEnemy({
  text, index, total, arenaWidth,
  onClick, disabled, isWrong, isHit,
}: {
  text: string;
  index: number;
  total: number;
  arenaWidth: number;
  onClick: (ref: HTMLButtonElement | null) => void;
  disabled: boolean;
  isWrong: boolean;
  isHit: boolean;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const col = UFO_COLORS[index % UFO_COLORS.length];

  // Spread evenly: left padding 12%, right padding 12%, divide remainder
  const leftPad = 0.12;
  const rightPad = 0.12;
  const usable = 1 - leftPad - rightPad;
  const xFrac = total === 1
    ? 0.5
    : leftPad + (index / (total - 1)) * usable;
  const xPx = xFrac * arenaWidth - 54; // 54 = half UFO width

  // Stagger rows: even index slightly higher, odd slightly lower
  const baseY = index % 2 === 0 ? 130 : 160;
  const floatY = [baseY, baseY - 10, baseY + 6, baseY - 6, baseY];
  const floatDelay = index * 0.25;

  return (
    <motion.div
      className="absolute z-10"
      style={{ left: xPx, top: 0 }}
      initial={{ y: baseY, opacity: 0, scale: 0 }}
      animate={
        isHit
          ? { scale: 0, opacity: 0, y: baseY - 60 }
          : { y: floatY, opacity: 1, scale: 1 }
      }
      transition={
        isHit
          ? { duration: 0.3 }
          : {
              opacity: { duration: 0.3, delay: index * 0.1 },
              scale: { duration: 0.35, delay: index * 0.1, type: "spring", stiffness: 260 },
              y: { duration: 2.8, repeat: Infinity, ease: "easeInOut", delay: floatDelay },
            }
      }
    >
      <motion.button
        ref={btnRef}
        onClick={() => onClick(btnRef.current)}
        disabled={disabled || isHit}
        animate={isWrong ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
        transition={isWrong ? { duration: 0.45 } : {}}
        className="relative flex flex-col items-center gap-0.5 cursor-pointer disabled:cursor-default group"
        style={{ width: 108 }}
      >
        {/* UFO dome */}
        <div
          className="relative w-14 h-7 rounded-t-full flex items-center justify-center"
          style={{
            background: `radial-gradient(ellipse at 40% 40%, ${col.glow}, ${col.base})`,
            boxShadow: isWrong
              ? "0 0 14px rgba(239,68,68,0.8)"
              : `0 0 12px ${col.glow}60`,
            border: isWrong ? "2px solid #ef4444" : "2px solid rgba(255,255,255,0.3)",
          }}
        >
          {/* dome shine */}
          <div className="absolute top-1 left-2 w-4 h-2 rounded-full bg-white/30 blur-sm pointer-events-none" />
          {/* pilot window */}
          <div className="w-4 h-4 rounded-full bg-cyan-200/80 border border-white/50 flex items-center justify-center text-[8px]">
            👾
          </div>
        </div>

        {/* UFO saucer body */}
        <div
          className="relative flex items-center justify-center"
          style={{
            width: 108,
            height: 30,
            background: `linear-gradient(180deg, ${col.glow}cc, ${col.base}ee)`,
            borderRadius: "50%",
            boxShadow: isWrong
              ? "0 4px 16px rgba(239,68,68,0.7)"
              : `0 4px 20px ${col.base}80, 0 0 30px ${col.glow}30`,
            border: isWrong ? "2px solid #ef4444" : "1.5px solid rgba(255,255,255,0.25)",
          }}
        >
          {/* lights strip */}
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-evenly px-2">
            {[0,1,2,3,4].map((l) => (
              <motion.div
                key={l}
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: l % 2 === 0 ? "#fde047" : "#f97316" }}
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.8, delay: l * 0.15 }}
              />
            ))}
          </div>
          {/* answer text */}
          <span
            className="relative z-10 text-white font-bold text-center leading-tight px-2"
            style={{ fontSize: text.length > 20 ? 9 : text.length > 12 ? 10 : 11 }}
          >
            {text}
          </span>
        </div>

        {/* Tractor beam glow under saucer */}
        <motion.div
          className="w-8 rounded-b-full opacity-40"
          style={{
            height: 10,
            background: `linear-gradient(180deg, ${col.glow}, transparent)`,
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.5, delay: floatDelay }}
        />
      </motion.button>
    </motion.div>
  );
}

// ─── Rocket Ship ──────────────────────────────────────────────────────────────
function RocketShip({ isShooting }: { isShooting: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        animate={isShooting ? { y: [0, 6, 0], scale: [1, 0.95, 1] } : { y: [0, -5, 0] }}
        transition={
          isShooting
            ? { duration: 0.15 }
            : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }
        }
        className="text-5xl select-none"
        style={{ filter: "drop-shadow(0 0 8px rgba(249,115,22,0.6))" }}
      >
        🚀
      </motion.div>
      {/* Flame exhaust */}
      <motion.div
        className="flex gap-0.5 -mt-1"
        animate={{ scaleY: isShooting ? [1, 2.5, 0.5, 1.5] : [0.6, 1, 0.7] }}
        transition={{ duration: isShooting ? 0.2 : 0.6, repeat: Infinity }}
      >
        {["#f97316","#fde047","#ef4444"].map((c, i) => (
          <motion.div
            key={i}
            className="rounded-full"
            style={{
              width: 6 - i,
              height: 14 + i * 3,
              background: `linear-gradient(180deg, ${c}, transparent)`,
              opacity: 0.9,
            }}
            animate={{ scaleY: [1, 1.4, 0.7, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 0.25, delay: i * 0.08 }}
          />
        ))}
      </motion.div>
    </div>
  );
}

// ─── Game Over Screen ─────────────────────────────────────────────────────────
function GameOverScreen({ score, total, state, onRestart }: {
  score: number; total: number;
  state: ReturnType<typeof useGamification>["state"];
  onRestart: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative rounded-2xl overflow-hidden bg-[#0a0a1a] text-white p-8 text-center min-h-[400px] flex flex-col items-center justify-center gap-4"
    >
      <Stars />
      <motion.div
        animate={{ rotate: [0,-10,10,-5,5,0], scale:[1,1.2,1] }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-7xl"
      >
        {pct===100?"🏆":pct>=70?"🌟":"🚀"}
      </motion.div>
      <h2 className="text-2xl font-extrabold">
        {pct===100?"PERFECT MISSION! You ARE the rocket 🚀":pct>=70?"MISSION COMPLETE! Houston is proud 🛸":"MISSION DONE! Space is hard, okay 🌌"}
      </h2>
      <p className="text-white/70">
        {pct===100
          ? "You destroyed every single UFO. They've fled the galaxy."
          : pct>=70
          ? `You destroyed ${score}/${total} UFOs. The rest escaped… for now.`
          : `You destroyed ${score}/${total} UFOs. They'll be back. So will you!`}
      </p>
      <div className="flex gap-3">
        {[1,2,3].map((s) => (
          <motion.span key={s} initial={{scale:0,rotate:-30}}
            animate={{scale:pct>=s*33?1:0.4,rotate:0}}
            transition={{delay:0.3+s*0.15,type:"spring"}}
            className="text-4xl"
          >{pct>=s*33?"⭐":"☆"}</motion.span>
        ))}
      </div>
      <div className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm space-y-1">
        <p>Total XP: <span className="font-bold text-yellow-400">{state.totalXP}</span></p>
        <p>Level: <span className="font-bold text-violet-300">{state.level}</span></p>
      </div>
      <button onClick={onRestart}
        className="rounded-full bg-gradient-to-r from-violet-500 to-indigo-600 px-8 py-3 font-bold text-white shadow-lg hover:scale-105 active:scale-95 transition-transform"
      >🔄 Play Again</button>
    </motion.div>
  );
}

// ─── Main SpaceQuiz ───────────────────────────────────────────────────────────
export function SpaceQuiz({ questions, onGoToLesson }: SpaceQuizProps) {
  const [qIndex, setQIndex] = useState(0);
  const [wrongOptions, setWrongOptions] = useState<Set<number>>(new Set());
  const [hitOption, setHitOption] = useState<number | null>(null);
  const [isShooting, setIsShooting] = useState(false);
  const [fireBolt, setFireBolt] = useState<{
    from: { x: number; y: number };
    to: { x: number; y: number };
    correct: boolean;
  } | null>(null);
  const [explosion, setExplosion] = useState<{ x: number; y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [reward, setReward] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [attempts, setAttempts] = useState<Record<number, number>>({});
  const [arenaWidth, setArenaWidth] = useState(400);
  const arenaRef = useRef<HTMLDivElement>(null);
  const shipRef = useRef<HTMLDivElement>(null);

  const q = questions[qIndex];
  const isLastQuestion = qIndex === questions.length - 1;

  const {
    state, addXP, resetAll,
    newBadge, clearNewBadge,
    xpGained, clearXPGained,
    leveledUp, clearLevelUp,
  } = useGamification();

  // Measure arena width for UFO positioning
  const measuredRef = (el: HTMLDivElement | null) => {
    (arenaRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
    if (el) setArenaWidth(el.offsetWidth);
  };

  const REWARDS = [
    "🌟 Amazing Shot!",
    "💥 Direct Hit!",
    "🏆 Bullseye!",
    "🎯 Perfect Aim!",
    "⚡ Fire!",
    "🤯 Big Brain Energy!",
    "🎉 The UFOs fear you!",
    "🚀 To infinity and beyond!",
    "😤 Too easy for you!",
    "👾 Another one bites the dust!",
  ];

  const handleShoot = (optionIndex: number, btnEl: HTMLButtonElement | null) => {
    if (wrongOptions.has(optionIndex) || hitOption !== null) return;

    const isCorrect = optionIndex === q.correct_index;
    const currentAttempts = (attempts[qIndex] ?? 0) + 1;

    // Fire bolt coordinates
    if (arenaRef.current && btnEl) {
      const arenaRect = arenaRef.current.getBoundingClientRect();
      const btnRect = btnEl.getBoundingClientRect();
      const shipRect = shipRef.current?.getBoundingClientRect();
      const fromX = (shipRect ? shipRect.left + shipRect.width / 2 : arenaRect.left + arenaRect.width / 2) - arenaRect.left;
      const fromY = (shipRect ? shipRect.top : arenaRect.bottom - 80) - arenaRect.top;
      const toX = btnRect.left + btnRect.width / 2 - arenaRect.left;
      const toY = btnRect.top + btnRect.height / 2 - arenaRect.top;
      setFireBolt({ from: { x: fromX, y: fromY }, to: { x: toX, y: toY }, correct: isCorrect });
      setTimeout(() => setFireBolt(null), 350);
      if (isCorrect) {
        setExplosion({ x: toX, y: toY });
        setTimeout(() => setExplosion(null), 650);
      }
    }

    setIsShooting(true);
    setTimeout(() => setIsShooting(false), 200);

    if (isCorrect) {
      const xpEarned = currentAttempts === 1 ? 20 : currentAttempts === 2 ? 10 : 5;
      addXP(xpEarned, true, false, false);
      setHitOption(optionIndex);
      setHint(null);
      setReward(REWARDS[Math.floor(Math.random() * REWARDS.length)]);
      setScore((s) => s + 1);
      setTimeout(() => {
        setReward(null);
        if (isLastQuestion) {
          setGameOver(true);
        } else {
          setQIndex((i) => i + 1);
          setWrongOptions(new Set());
          setHitOption(null);
          setAttempts((prev) => ({ ...prev }));
        }
      }, 1800);
    } else {
      setAttempts((prev) => ({ ...prev, [qIndex]: currentAttempts }));
      setWrongOptions((prev) => new Set([...prev, optionIndex]));
      addXP(0, false);

      // After 1 wrong answer: show hint then redirect to lesson
      if (currentAttempts >= 1) {
        setHint(q.explanation);
        setTimeout(() => {
          setHint(null);
          onGoToLesson();
        }, 3000);
      }
    }
  };

  const handleRestart = () => {
    setQIndex(0);
    setWrongOptions(new Set());
    setHitOption(null);
    setIsShooting(false);
    setFireBolt(null);
    setExplosion(null);
    setScore(0);
    setHint(null);
    setReward(null);
    setGameOver(false);
    setAttempts({});
    resetAll();
  };

  if (gameOver) {
    return <GameOverScreen score={score} total={questions.length} state={state} onRestart={handleRestart} />;
  }

  return (
    <div className="space-y-3">
      {/* Gamification bar */}
      <GamificationBar
        state={state}
        xpGained={xpGained}
        leveledUp={leveledUp}
        newBadge={newBadge}
        onClearBadge={clearNewBadge}
        onClearLevelUp={clearLevelUp}
        isChild
      />

      {/* Progress bar */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          UFO {qIndex + 1}/{questions.length}
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-yellow-400"
            animate={{ width: `${(qIndex / questions.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <span>🎯 {score} destroyed</span>
      </div>

      {/* Space arena */}
      <div
        ref={measuredRef}
        className="relative rounded-2xl overflow-hidden bg-[#060614] select-none"
        style={{ height: 440 }}
      >
        <Stars />

        {/* Fire bolt */}
        {fireBolt && (
          <FireBolt
            from={fireBolt.from}
            to={fireBolt.to}
            show
            correct={fireBolt.correct}
          />
        )}

        {/* Explosion */}
        {explosion && <Explosion x={explosion.x} y={explosion.y} />}

        {/* Question */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm px-4 py-2.5 text-center"
          >
            <p className="text-white font-semibold text-sm leading-snug">{q.question}</p>
          </motion.div>
        </div>

        {/* UFO enemies */}
        <AnimatePresence>
          {q.options.map((option, i) => (
            <UFOEnemy
              key={`${qIndex}-${i}`}
              text={option}
              index={i}
              total={q.options.length}
              arenaWidth={arenaWidth}
              onClick={(el) => handleShoot(i, el)}
              disabled={hitOption !== null}
              isWrong={wrongOptions.has(i)}
              isHit={hitOption === i}
            />
          ))}
        </AnimatePresence>

        {/* Reward popup */}
        <AnimatePresence>
          {reward && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1.1, y: -20 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-6 py-3 text-white font-extrabold text-lg shadow-2xl whitespace-nowrap"
            >
              {reward}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint + redirect warning */}
        <AnimatePresence>
          {hint && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-20 left-4 right-4 z-20 rounded-xl border border-yellow-400/50 bg-yellow-900/80 backdrop-blur-sm px-4 py-3"
            >
              <p className="text-yellow-200 text-xs font-semibold text-center mb-1">
                💡 Hint: {hint}
              </p>
              <p className="text-yellow-400/80 text-xs text-center">
                ↩ Sending you back to the lesson in 3s… (don't worry, the UFOs will wait 🛸)
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rocket ship */}
        <div ref={shipRef} className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
          <RocketShip isShooting={isShooting} />
        </div>

        {/* Instruction */}
        {wrongOptions.size === 0 && hitOption === null && (
          <p className="absolute bottom-1 left-0 right-0 text-center text-xs text-white/25 pointer-events-none">
            🔥 Shoot the correct UFO! (Wrong answers will judge you 👀)
          </p>
        )}
      </div>
    </div>
  );
}
