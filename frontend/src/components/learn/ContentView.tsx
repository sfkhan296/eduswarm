"use client";

import { motion } from "framer-motion";
import { Code2, Play, Square, Volume2 } from "lucide-react";
import { useTTS } from "@/hooks/useSpeech";
import type { ContentSection, UIPersonalization, LearnerLevel } from "@/types/api";

interface ContentViewProps {
  content: ContentSection[];
  uiTheme: UIPersonalization;
  level: LearnerLevel;
}

export function ContentView({ content, uiTheme, level }: ContentViewProps) {
  const isChild = level === "child";
  const { speak, stop, speaking } = useTTS();

  // Apply UI personalization from AI agent
  const fontSize =
    uiTheme.font_size === "lg" ? "text-lg"
    : uiTheme.font_size === "sm" ? "text-xs"
    : uiTheme.font_size === "xl" ? "text-xl"
    : "text-sm";

  const accentColor = uiTheme.color_scheme || "#6366f1";
  const isPlayful = uiTheme.tone === "playful";
  const isProfessional = uiTheme.tone === "professional";

  // Read the full lesson aloud
  const readAll = () => {
    if (speaking) { stop(); return; }
    const fullText = content
      .map((s) => `${s.title}. ${s.body}`)
      .join(". ");
    speak(fullText, isChild ? 0.9 : 1, isChild ? 1.1 : 1);
  };

  // Read a single section
  const readSection = (section: ContentSection) => {
    speak(`${section.title}. ${section.body}`, isChild ? 0.9 : 1, isChild ? 1.1 : 1);
  };

  return (
    <div className="space-y-5">
      {/* Read all button */}
      <div className="flex items-center justify-between">
        {/* Tone badge */}
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium border
            ${isPlayful ? "bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
            : isProfessional ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
            : "bg-muted text-muted-foreground border-border"}`}
        >
          {isPlayful ? "🎮 Playful Mode" : isProfessional ? "💼 Professional Mode" : "📚 Balanced Mode"}
        </span>

        <button
          onClick={readAll}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all
            ${speaking
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-muted/50 text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5"}`}
        >
          {speaking ? (
            <><Square className="h-3 w-3 fill-current" /> Stop Reading</>
          ) : (
            <><Volume2 className="h-3.5 w-3.5" /> Read Lesson Aloud</>
          )}
        </button>
      </div>

      {content.map((section, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className={`rounded-xl border bg-card p-5 shadow-sm
            ${isPlayful ? "border-yellow-200 dark:border-yellow-900/50"
            : isProfessional ? "border-blue-200 dark:border-blue-900/50"
            : "border-border"}`}
          style={{ borderLeftColor: accentColor, borderLeftWidth: "3px" }}
        >
          {/* Section header */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: accentColor }}
              >
                {i + 1}
              </span>
              <h2 className={`font-semibold truncate ${isChild || isPlayful ? "text-xl" : isProfessional ? "text-base" : "text-base"}`}>
                {section.title}
              </h2>
            </div>

            {/* Per-section play button */}
            <button
              onClick={() => readSection(section)}
              title="Listen to this section"
              className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
            >
              <Play className="h-3 w-3 fill-current" />
            </button>
          </div>

          {/* Body */}
          <p className={`text-muted-foreground leading-relaxed ${fontSize}`}>
            {section.body}
          </p>

          {/* Code example */}
          {section.code_example && (
            <div className="mt-4">
              <div className="flex items-center gap-1.5 mb-2 text-xs text-muted-foreground">
                <Code2 className="h-3.5 w-3.5" />
                <span>Code Example</span>
              </div>
              <pre className="rounded-lg bg-zinc-950 dark:bg-zinc-900 text-zinc-100 p-4 text-sm overflow-x-auto border border-zinc-800">
                <code>{typeof section.code_example === "string"
                  ? section.code_example
                  : (section.code_example as { code?: string })?.code ?? ""
                }</code>
              </pre>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}
