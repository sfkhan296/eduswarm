"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const EXAMPLE_PROMPTS = [
  "Teach me Java from scratch.",
  "Explain machine learning to a 10-year-old.",
  "Help me understand React hooks as a professional developer.",
];

export function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="space-y-3"
    >
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. Teach me Java."
        className="min-h-[100px] resize-none text-base"
        disabled={isLoading}
      />

      {/* Example prompts */}
      <div className="flex flex-wrap gap-2">
        {EXAMPLE_PROMPTS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setValue(p)}
            className="rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      <Button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        {isLoading ? "Generating…" : "Start Learning"}
      </Button>
    </motion.form>
  );
}
