"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Trophy, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QuizQuestion, LearnerLevel } from "@/types/api";

interface QuizViewProps {
  questions: QuizQuestion[];
  level: LearnerLevel;
}

export function QuizView({ questions, level }: QuizViewProps) {
  const [selected, setSelected] = useState<Record<number, number>>({});
  const isChild = level === "child";

  const handleSelect = (qIndex: number, oIndex: number) => {
    if (selected[qIndex] !== undefined) return;
    setSelected((prev) => ({ ...prev, [qIndex]: oIndex }));
  };

  const score = Object.entries(selected).filter(
    ([qIdx, oIdx]) => questions[Number(qIdx)].correct_index === oIdx
  ).length;

  const allAnswered = Object.keys(selected).length === questions.length;

  const handleReset = () => setSelected({});

  return (
    <div className="space-y-5">
      {/* Score bar */}
      <AnimatePresence>
        {allAnswered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`flex items-center justify-between rounded-xl p-4 border ${
              score === questions.length
                ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
                : "bg-primary/5 border-primary/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <Trophy className={`h-6 w-6 ${score === questions.length ? "text-emerald-500" : "text-primary"}`} />
              <div>
                <p className="font-semibold">
                  {score}/{questions.length} correct
                </p>
                <p className="text-sm text-muted-foreground">
                  {score === questions.length
                    ? "Perfect score! 🎉"
                    : score >= questions.length / 2
                    ? "Good job! Keep it up."
                    : "Keep practicing!"}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Questions */}
      {questions.map((q, qIndex) => {
        const chosenIndex = selected[qIndex];
        const answered = chosenIndex !== undefined;
        const isCorrect = chosenIndex === q.correct_index;

        return (
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qIndex * 0.08 }}
            className="rounded-xl border bg-card p-5 shadow-sm"
          >
            {/* Question */}
            <div className="flex items-start gap-3 mb-4">
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold
                ${answered && isCorrect ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" :
                  answered && !isCorrect ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" :
                  "bg-primary/10 text-primary"}`}
              >
                {qIndex + 1}
              </span>
              <p className={`font-medium ${isChild ? "text-base" : "text-sm"}`}>{q.question}</p>
            </div>

            {/* Options */}
            <div className="space-y-2 ml-10">
              {q.options.map((option, oIndex) => {
                const isCorrectOption = oIndex === q.correct_index;
                const isChosenOption = chosenIndex === oIndex;

                let cls = "w-full text-left rounded-lg px-4 py-2.5 text-sm flex items-center justify-between gap-2 border transition-all ";
                if (!answered) {
                  cls += "bg-muted/30 hover:bg-primary/5 hover:border-primary/30 cursor-pointer";
                } else if (isChosenOption && isCorrectOption) {
                  cls += "bg-emerald-50 border-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-600 cursor-default";
                } else if (isChosenOption && !isCorrectOption) {
                  cls += "bg-red-50 border-red-400 dark:bg-red-950/40 dark:border-red-600 cursor-default";
                } else if (!isChosenOption && isCorrectOption) {
                  cls += "bg-emerald-50/50 border-emerald-300/60 dark:bg-emerald-950/20 cursor-default";
                } else {
                  cls += "opacity-50 cursor-default";
                }

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleSelect(qIndex, oIndex)}
                    disabled={answered}
                    className={cls}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-medium">
                        {String.fromCharCode(65 + oIndex)}
                      </span>
                      <span>{option}</span>
                    </div>
                    {answered && isCorrectOption && <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />}
                    {answered && isChosenOption && !isCorrectOption && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                  </button>
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
                  <p className={`text-xs rounded-lg px-3 py-2 ${
                    isCorrect
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    💡 {q.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
