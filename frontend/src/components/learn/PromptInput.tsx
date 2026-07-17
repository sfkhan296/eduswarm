"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  defaultValue?: string;
}

const EXAMPLE_PROMPTS = [
  "Teach me Java from scratch.",
  "Explain machine learning to a 10-year-old.",
  "Help me understand React hooks as a professional.",
  "What is quantum computing?",
  "Explain DNA replication simply.",
];

export function PromptInput({ onSubmit, isLoading, defaultValue = "" }: PromptInputProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (defaultValue) setValue(defaultValue);
  }, [defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (value.trim() && !isLoading) onSubmit(value.trim());
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-3"
    >
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Teach me Java from scratch."
          className="min-h-[120px] resize-none text-base pr-4 rounded-xl border-2 focus:border-primary/50 transition-colors"
          disabled={isLoading}
        />
        <p className="absolute bottom-2 right-3 text-xs text-muted-foreground/60 select-none">
          ⌘+Enter to send
        </p>
      </div>

      {/* Example prompts */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setValue(p)}
            disabled={isLoading}
            className="rounded-full border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>

      <Button
        type="submit"
        disabled={isLoading || !value.trim()}
        size="lg"
        className="gap-2 shadow-md shadow-primary/20"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Start Learning
          </>
        )}
      </Button>
    </motion.form>
  );
}
