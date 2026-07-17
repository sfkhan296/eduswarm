"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PromptInput } from "@/components/learn/PromptInput";
import { LearningSession } from "@/components/learn/LearningSession";
import { AgentStatusBar } from "@/components/learn/AgentStatusBar";
import type { LearningResponse } from "@/types/api";

export default function LearnPage() {
  const [response, setResponse] = useState<LearningResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/backend/api/v1/learn/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error(`Request failed: ${res.statusText}`);
      }

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
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold tracking-tight mb-1">
          What do you want to learn?
        </h1>
        <p className="text-muted-foreground">
          Enter a topic and our AI agents will build a personalized lesson just
          for you.
        </p>
      </motion.div>

      <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />

      {isLoading && <AgentStatusBar />}

      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      <AnimatePresence>
        {response && <LearningSession data={response} />}
      </AnimatePresence>
    </div>
  );
}
