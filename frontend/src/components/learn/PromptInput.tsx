"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, Mic, MicOff } from "lucide-react";
import { useSTT } from "@/hooks/useSpeech";

import { useLanguage } from "@/context/LanguageContext";

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
  "Why does my code never work on the first try? 😭",
  "Teach me calculus like I'm a golden retriever 🐕",
  "What even IS the mitochondria?",
  "Explain the stock market without making me cry 📉",
  "Make photosynthesis sound as cool as it actually is 🌱",
];

export function PromptInput({ onSubmit, isLoading, defaultValue = "" }: PromptInputProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState(defaultValue);
  const [interimText, setInterimText] = useState("");

  useEffect(() => {
    if (defaultValue) setValue(defaultValue);
  }, [defaultValue]);

  // When speech is final, set it in the box and auto-submit
  const handleSpeechResult = useCallback((interim: string) => {
    setInterimText(interim);
  }, []);

  const handleSpeechFinal = useCallback((final: string) => {
    setInterimText("");
    const trimmed = final.trim();
    setValue(trimmed);
    // Auto-submit after a short delay so user sees the text
    setTimeout(() => {
      if (trimmed) onSubmit(trimmed);
    }, 600);
  }, [onSubmit]);

  const { listening, supported, startListening, stopListening } = useSTT(
    handleSpeechResult,
    handleSpeechFinal
  );

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

  const toggleMic = () => {
    if (listening) {
      stopListening();
    } else {
      setValue("");
      startListening();
    }
  };

  const displayValue = listening && interimText ? interimText : value;

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
          value={displayValue}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={listening ? "Listening… speak your question" : t("learn_placeholder")}
          className={`min-h-[120px] resize-none text-base pr-12 rounded-xl border-2 transition-colors
            ${listening
              ? "border-red-400 dark:border-red-600 bg-red-50/30 dark:bg-red-950/10 placeholder:text-red-400"
              : "focus:border-primary/50"}`}
          disabled={isLoading}
          readOnly={listening}
        />

        {/* Mic button inside textarea */}
        {supported && (
          <button
            type="button"
            onClick={toggleMic}
            disabled={isLoading}
            className={`absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full transition-all
              ${listening
                ? "bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse"
                : "bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground"}`}
            title={listening ? "Stop listening" : "Speak your prompt"}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        )}

        <p className="absolute bottom-2 right-3 text-xs text-muted-foreground/60 select-none">
          {listening ? "" : "⌘+Enter to send"}
        </p>
      </div>

      {/* Listening indicator */}
      <AnimatePresence>
        {listening && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-2 text-sm text-red-500"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            Listening… speak clearly, then pause
          </motion.div>
        )}
      </AnimatePresence>

      {/* Example prompts */}
      {!listening && (
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
      )}

      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isLoading || !value.trim() || listening}
          size="lg"
          className="gap-2 shadow-md shadow-primary/20"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("learn_generating")}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {t("learn_start_btn")}
            </>
          )}
        </Button>

        {supported && (
          <p className="text-xs text-muted-foreground">
            or <button type="button" onClick={toggleMic} className="text-primary underline underline-offset-2">
              {listening ? "stop mic" : "use mic"}
            </button>
          </p>
        )}
      </div>
    </motion.form>
  );
}
