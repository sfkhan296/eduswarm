"use client";

import { SignUp } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const taglines = [
  "Your journey starts here.",
  "AI agents built around you.",
  "Smarter learning, every session.",
  "Join a swarm of curious minds.",
  "Personalized from day one.",
];

function BrandPanel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % taglines.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className="hidden lg:flex flex-col justify-center items-start gap-6 px-12 max-w-lg"
      initial={{ opacity: 0, x: -32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
    >
      {/* Logo mark */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">E</span>
        </div>
        <span className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          EduSwarm
        </span>
      </div>

      {/* Static subtitle */}
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
        Create your free account and unlock a personalized AI learning
        experience — quizzes, lessons, and tutors that evolve with you.
      </p>

      {/* Cycling tagline */}
      <div className="h-10 overflow-hidden relative w-full">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            className="absolute text-xl font-semibold text-violet-600 dark:text-violet-400"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {taglines[index]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2 mt-2">
        {["Adaptive Quizzes", "AI Tutors", "Voice Lessons", "Smart History"].map(
          (feature) => (
            <span
              key={feature}
              className="rounded-full bg-violet-100 dark:bg-violet-900/40 px-3 py-1 text-xs font-medium text-violet-700 dark:text-violet-300"
            >
              {feature}
            </span>
          )
        )}
      </div>
    </motion.div>
  );
}

export default function SignUpPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 to-indigo-100 dark:from-gray-950 dark:to-gray-900">
      {/* Decorative blobs */}
      <motion.div
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-700/20"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl dark:bg-violet-700/20"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
      />

      {/* Two-column layout */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 px-6 py-12 lg:py-0">
        <BrandPanel />

        {/* Divider — desktop only */}
        <div className="hidden lg:block h-80 w-px bg-gray-300/60 dark:bg-gray-700/60" />

        {/* Sign-up card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
        >
          {/* Mobile branding */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              EduSwarm
            </span>
          </div>
          <SignUp />
        </motion.div>
      </div>
    </div>
  );
}
