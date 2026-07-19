"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Download, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeGeneratorProps {
  topic: string;
  language: string;
}

const LANG_EXTENSIONS: Record<string, string> = {
  python: "py", javascript: "js", typescript: "ts", java: "java",
  cpp: "cpp", "c++": "cpp", c: "c", go: "go", rust: "rs",
  swift: "swift", kotlin: "kt", ruby: "rb", php: "php",
  html: "html", css: "css", sql: "sql", bash: "sh", r: "r",
  matlab: "m", dart: "dart", scala: "scala", haskell: "hs",
};

const DETECT_LANG_PATTERN = /```(\w+)/i;

function detectLanguage(code: string): { lang: string; ext: string } {
  const match = code.match(DETECT_LANG_PATTERN);
  if (match) {
    const l = match[1].toLowerCase();
    return { lang: l, ext: LANG_EXTENSIONS[l] ?? "txt" };
  }
  if (code.includes("def ") && code.includes(":")) return { lang: "python", ext: "py" };
  if (code.includes("function") || code.includes("const ") || code.includes("=>")) return { lang: "javascript", ext: "js" };
  if (code.includes("public class") || code.includes("System.out")) return { lang: "java", ext: "java" };
  if (code.includes("#include")) return { lang: "cpp", ext: "cpp" };
  if (code.includes("<!DOCTYPE") || code.includes("<html")) return { lang: "html", ext: "html" };
  if (code.includes("SELECT") || code.includes("CREATE TABLE")) return { lang: "sql", ext: "sql" };
  return { lang: "code", ext: "txt" };
}

function stripMarkdown(raw: string): string {
  return raw
    .replace(/```\w*\n?/g, "")
    .replace(/```/g, "")
    .trim();
}

export function CodeGenerator({ topic, language }: CodeGeneratorProps) {
  const [topicInput, setTopicInput] = useState(topic);
  const [complexity, setComplexity] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [code, setCode] = useState("");
  const [detectedLang, setDetectedLang] = useState({ lang: "code", ext: "txt" });
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    setCode("");
    try {
      const res = await fetch("/api/backend/api/v1/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Write a ${complexity} level code example for: "${topicInput}".
Rules:
- Return ONLY the code, no explanation text outside the code block
- Add brief inline comments explaining each important line
- Use the most appropriate programming language for this topic
- Wrap in a proper code block with the language name
- Make it complete and runnable`,
          topic: topicInput,
          level: complexity === "beginner" ? "child" : complexity === "intermediate" ? "teen" : "professional",
          history: [],
        }),
      });
      const data = await res.json();
      const raw = data.reply as string;
      const clean = stripMarkdown(raw);
      const detected = detectLanguage(raw);
      setCode(clean);
      setDetectedLang(detected);
    } catch {
      setCode("// Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    const filename = `${topicInput.replace(/\s+/g, "_")}.${detectedLang.ext}`;
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Topic */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">What to code</label>
        <input value={topicInput} onChange={(e) => setTopicInput(e.target.value)}
          placeholder="e.g. Bubble sort algorithm"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Complexity */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Complexity</label>
        <div className="grid grid-cols-3 gap-2">
          {(["beginner", "intermediate", "advanced"] as const).map((c) => (
            <button key={c} onClick={() => setComplexity(c)}
              className={`rounded-lg border py-2 text-xs font-medium capitalize transition-all
                ${complexity === c ? "border-primary bg-primary/10 text-primary" : "border-border bg-muted/30 hover:bg-muted"}`}
            >{c}</button>
          ))}
        </div>
      </div>

      <Button onClick={generate} disabled={loading || !topicInput.trim()} className="w-full gap-2">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Generating code…</> : <><Code2 className="h-4 w-4" />Generate Code</>}
      </Button>

      <AnimatePresence>
        {code && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            {/* Lang badge */}
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold text-emerald-500 uppercase">
                {detectedLang.lang} · .{detectedLang.ext}
              </span>
              <button onClick={copy} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <><Check className="h-3.5 w-3.5 text-emerald-500" />Copied!</> : <><Copy className="h-3.5 w-3.5" />Copy</>}
              </button>
            </div>

            {/* Code block */}
            <pre className="rounded-xl bg-zinc-950 border border-zinc-800 p-4 text-xs text-zinc-100 overflow-x-auto overflow-y-auto max-h-80 leading-relaxed">
              <code>{code}</code>
            </pre>

            <Button onClick={download} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <Download className="h-4 w-4" />
              Download {topicInput.replace(/\s+/g, "_")}.{detectedLang.ext}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
