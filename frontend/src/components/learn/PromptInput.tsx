"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Loader2,
  Mic,
  MicOff,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  SlidersHorizontal,
  Check,
} from "lucide-react";
import { useSTT } from "@/hooks/useSpeech";
import { useLanguage } from "@/context/LanguageContext";

export interface PromptSubmitOptions {
  documentText?: string;
  formatPreference?: "auto" | "bullets" | "paragraphs" | "step_by_step" | "qa";
  depthLevel?: "auto" | "overview" | "detailed" | "hands_on";
}

interface PromptInputProps {
  onSubmit: (prompt: string, options?: PromptSubmitOptions) => void;
  isLoading: boolean;
  defaultValue?: string;
}

const EXAMPLE_PROMPTS = [
  "Teach me Java from scratch.",
  "Explain machine learning to a 10-year-old.",
  "Help me understand React hooks as a professional.",
  "What is quantum computing?",
  "Explain DNA replication simply.",
  "Teach me calculus like I'm a golden retriever 🐕",
  "Explain the stock market without making me cry 📉",
];

const FORMAT_OPTIONS = [
  { id: "auto", label: "Auto Format", icon: "✨" },
  { id: "bullets", label: "Bullet Points", icon: "📌" },
  { id: "paragraphs", label: "Paragraphs", icon: "📄" },
  { id: "step_by_step", label: "Step-by-Step", icon: "🔢" },
  { id: "qa", label: "Q&A Format", icon: "❓" },
] as const;

const DEPTH_OPTIONS = [
  { id: "auto", label: "Auto Depth", icon: "🎯" },
  { id: "overview", label: "Quick Overview", icon: "💡" },
  { id: "detailed", label: "Detailed Deep-Dive", icon: "📖" },
  { id: "hands_on", label: "Hands-on Practical", icon: "🛠️" },
] as const;

interface AttachedFile {
  name: string;
  type: string;
  size: number;
  content: string;
}

export function PromptInput({ onSubmit, isLoading, defaultValue = "" }: PromptInputProps) {
  const { t } = useLanguage();
  const [value, setValue] = useState(defaultValue);
  const [interimText, setInterimText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [formatPref, setFormatPref] = useState<PromptSubmitOptions["formatPreference"]>("auto");
  const [depthPref, setDepthPref] = useState<PromptSubmitOptions["depthLevel"]>("auto");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (defaultValue) setValue(defaultValue);
  }, [defaultValue]);

  const handleSpeechResult = useCallback((interim: string) => {
    setInterimText(interim);
  }, []);

  const handleSpeechFinal = useCallback(
    (final: string) => {
      setInterimText("");
      const trimmed = final.trim();
      setValue(trimmed);
      setTimeout(() => {
        if (trimmed) {
          onSubmit(trimmed, {
            documentText: attachedFiles.map((f) => f.content).join("\n\n"),
            formatPreference: formatPref,
            depthLevel: depthPref,
          });
        }
      }, 600);
    },
    [onSubmit, attachedFiles, formatPref, depthPref]
  );

  const { listening, supported, startListening, stopListening } = useSTT(handleSpeechResult, handleSpeechFinal);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Use the proxy path so it works on both local and Vercel
    const EXTRACT_URL = "/api/backend/api/v1/extract/";

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let extractedContent = "";

      try {
        if (
          file.type.startsWith("text/") ||
          file.name.endsWith(".txt") ||
          file.name.endsWith(".md") ||
          file.name.endsWith(".json")
        ) {
          // Plain text — read directly in browser, no backend needed
          extractedContent = await file.text();
          setAttachedFiles((prev) => [
            ...prev,
            {
              name: file.name,
              type: file.type,
              size: file.size,
              content: `--- Document Content: ${file.name} ---\n${extractedContent}`,
            },
          ]);
          continue;
        }

        // All other files (.docx, .pdf, images) — send to backend extract endpoint
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch(EXTRACT_URL, {
            method: "POST",
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            extractedContent = data.text;
          } else {
            const err = await res.json().catch(() => ({ detail: "Unknown error" }));
            console.error("Extract failed:", err);
            // Don't attach failed extractions — show user an alert instead
            alert(`Could not read ${file.name}: ${err.detail}`);
            continue;
          }
        } catch (fetchErr) {
          console.error("Extract fetch error:", fetchErr);
          alert(`Could not connect to backend to read ${file.name}. Make sure the backend is running.`);
          continue;
        }

        const label = file.type.startsWith("image/") ? "Image Content" : "Document Content";
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            content: `--- ${label}: ${file.name} ---\n${extractedContent}`,
          },
        ]);

      } catch (err) {
        console.error("Error processing file:", err);
        setAttachedFiles((prev) => [
          ...prev,
          {
            name: file.name,
            type: file.type,
            size: file.size,
            content: `[Error reading ${file.name}. Please paste the content directly.]`,
          },
        ]);
      }
    }

    // Reset input so same file can be re-uploaded
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      const combinedDocText = attachedFiles.map((f) => f.content).join("\n\n");
      onSubmit(value.trim(), {
        documentText: combinedDocText || undefined,
        formatPreference: formatPref,
        depthLevel: depthPref,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        const combinedDocText = attachedFiles.map((f) => f.content).join("\n\n");
        onSubmit(value.trim(), {
          documentText: combinedDocText || undefined,
          formatPreference: formatPref,
          depthLevel: depthPref,
        });
      }
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
      className="space-y-4"
    >
      <div className="relative rounded-2xl border-2 bg-card p-3 shadow-sm transition-colors focus-within:border-primary/50">
        <Textarea
          value={displayValue}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={listening ? "Listening… speak your question" : t("learn_placeholder")}
          className={`min-h-[110px] w-full resize-none border-none bg-transparent p-1 text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 ${
            listening ? "placeholder:text-red-400" : ""
          }`}
          disabled={isLoading}
          readOnly={listening}
        />

        {/* Attached Files Badges */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            {attachedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary border border-primary/20"
              >
                {file.type.startsWith("image/") ? (
                  <ImageIcon className="h-3.5 w-3.5" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                <span className="truncate max-w-[140px]">{file.name}</span>
                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="hover:text-destructive transition-colors ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action bar inside textarea box */}
        <div className="flex items-center justify-between pt-2 mt-1 border-t border-muted/50">
          <div className="flex items-center gap-2">
            {/* File Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept=".pdf,.docx,.txt,.md,.png,.jpg,.jpeg"
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="gap-1.5 text-xs text-muted-foreground hover:text-primary rounded-lg"
              title="Upload PDF, Image, or Document"
            >
              <Paperclip className="h-3.5 w-3.5" />
              <span>Attach File</span>
            </Button>

            {/* Advanced Preferences Toggle */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`gap-1.5 text-xs rounded-lg transition-colors ${
                showAdvanced || formatPref !== "auto" || depthPref !== "auto"
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-primary"
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Options</span>
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {supported && (
              <button
                type="button"
                onClick={toggleMic}
                disabled={isLoading}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                  listening
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/40 animate-pulse"
                    : "bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground"
                }`}
                title={listening ? "Stop listening" : "Speak your prompt"}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}

            <p className="text-xs text-muted-foreground/60 select-none hidden sm:block">⌘+Enter</p>
          </div>
        </div>
      </div>

      {/* Advanced Formatting & Specificity Options Panel */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border bg-muted/30 p-4 space-y-4 text-xs"
          >
            {/* Format Selection */}
            <div className="space-y-1.5">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                Answer Format (Points / Paragraphs)
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {FORMAT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormatPref(opt.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                      formatPref === opt.id
                        ? "border-primary bg-primary text-primary-foreground font-medium shadow-sm"
                        : "bg-background hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                    {formatPref === opt.id && <Check className="h-3 w-3 ml-1" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Depth Selection */}
            <div className="space-y-1.5 border-t pt-3">
              <span className="font-semibold uppercase tracking-wider text-muted-foreground">
                Topic Specificity & Depth
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {DEPTH_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setDepthPref(opt.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
                      depthPref === opt.id
                        ? "border-primary bg-primary text-primary-foreground font-medium shadow-sm"
                        : "bg-background hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                    {depthPref === opt.id && <Check className="h-3 w-3 ml-1" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Example Prompts */}
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

      {/* Submit Button */}
      <div className="flex items-center gap-3">
        <Button
          type="submit"
          disabled={isLoading || (!value.trim() && attachedFiles.length === 0) || listening}
          size="lg"
          className="gap-2 shadow-md shadow-primary/20 rounded-xl"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("learn_generating")}
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              {t("learn_btn")}
            </>
          )}
        </Button>
      </div>
    </motion.form>
  );
}
