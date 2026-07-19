"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PromptInput } from "@/components/learn/PromptInput";
import { LearningSession } from "@/components/learn/LearningSession";
import { AgentStatusBar } from "@/components/learn/AgentStatusBar";
import { SessionHistorySidebar } from "@/components/layout/SessionHistorySidebar";
import { useLanguage } from "@/context/LanguageContext";
import type { LearningResponse } from "@/types/api";
import { AlertCircle } from "lucide-react";

export default function LearnPage() {
  const { lang, t } = useLanguage();
  const [response, setResponse] = useState<LearningResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");

  const handleSubmit = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setCurrentPrompt(prompt);

    // Persist topic so ToolsSidebar generators pre-fill it
    if (typeof window !== "undefined") localStorage.setItem("eduswarm_topic", prompt);

    try {
      const res = await fetch("/api/backend/api/v1/learn/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Pass the live context language — always in sync
        body: JSON.stringify({ prompt, language: lang }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.statusText}`);
      const data: LearningResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header — translated */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-bold tracking-tight">
          {t("learn_heading")}
        </h1>
        <p className="text-muted-foreground">
          {t("learn_subheading")}
        </p>
      </motion.div>

      {/* Prompt input */}
      <PromptInput
        onSubmit={handleSubmit}
        isLoading={isLoading}
        defaultValue={currentPrompt}
      />

      {/* Agent progress */}
      <AnimatePresence>
        {isLoading && <AgentStatusBar />}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {response && <LearningSession data={response} prompt={currentPrompt} />}
      </AnimatePresence>

      {/* Session history sidebar */}
      <SessionHistorySidebar onSelectSession={handleSubmit} />
    </div>
  );
}
