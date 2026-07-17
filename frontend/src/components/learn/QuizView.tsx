"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import type { QuizQuestion } from "@/types/api";

interface QuizViewProps {
  questions: QuizQuestion[];
}

export function QuizView({ questions }: QuizViewProps) {
  const [selected, setSelected] = useState<Record<number, number>>({});

  const handleSelect = (qIndex: number, oIndex: number) => {
    if (selected[qIndex] !== undefined) return; // lock answer
    setSelected((prev) => ({ ...prev, [qIndex]: oIndex }));
  };

  return (
    <div className="space-y-6">
      {questions.map((q, qIndex) => {
        const chosenIndex = selected[qIndex];
        const answered = chosenIndex !== undefined;

        return (
          <motion.div
            key={qIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: qIndex * 0.1 }}
            className="rounded-lg border bg-card p-5 shadow-sm"
          >
            <p className="font-medium mb-3">
              {qIndex + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((option, oIndex) => {
                const isCorrect = oIndex === q.correct_index;
                const isChosen = chosenIndex === oIndex;

                let variant =
                  "border bg-muted/30 hover:bg-muted transition-colors";
                if (answered && isChosen && isCorrect)
                  variant = "border border-green-500 bg-green-50 dark:bg-green-950";
                if (answered && isChosen && !isCorrect)
                  variant = "border border-red-500 bg-red-50 dark:bg-red-950";
                if (answered && !isChosen && isCorrect)
                  variant = "border border-green-500/50 bg-green-50/50 dark:bg-green-950/50";

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleSelect(qIndex, oIndex)}
                    disabled={answered}
                    className={`w-full text-left rounded-md px-4 py-2 text-sm flex items-center justify-between ${variant}`}
                  >
                    <span>{option}</span>
                    {answered && isCorrect && (
                      <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                    )}
                    {answered && isChosen && !isCorrect && (
                      <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
            <AnimatePresence>
              {answered && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 text-xs text-muted-foreground"
                >
                  {q.explanation}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
