"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, Sparkles, Loader2, Download, Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateConceptImage } from "@/lib/api";

interface ImageGeneratorProps {
  topic: string;
  initialPrompt?: string;
}

const STYLES = [
  { id: "illustration", label: "Illustration", emoji: "🎨", description: "Clean, colorful graphic art" },
  { id: "diagram", label: "Diagram / Chart", emoji: "📊", description: "Structured visual breakdown" },
  { id: "realistic", label: "Photorealistic", emoji: "📸", description: "Lifelike high detail visualization" },
  { id: "3d", label: "3D Render", emoji: "🧊", description: "Modern isometric 3D model style" },
];

export function ImageGenerator({ topic, initialPrompt }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState(initialPrompt || topic);
  const [selectedStyle, setSelectedStyle] = useState("illustration");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await generateConceptImage(prompt.trim(), selectedStyle);
      setImageUrl(res.image_url);
    } catch (err: any) {
      setError(err?.message || "Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = () => {
    if (!imageUrl) return;
    navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
          <ImageIcon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">AI Visual Concept Generator</h3>
          <p className="text-sm text-muted-foreground">
            Generate custom educational diagrams, illustrations, and concept art for this lesson.
          </p>
        </div>
      </div>

      {/* Style selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Visual Style
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {STYLES.map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setSelectedStyle(st.id)}
              className={`flex flex-col items-start p-3 rounded-xl border transition-all text-left ${
                selectedStyle === st.id
                  ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20"
                  : "bg-muted/40 hover:bg-muted/80 text-muted-foreground"
              }`}
            >
              <span className="text-lg">{st.emoji}</span>
              <span className="text-xs font-medium mt-1">{st.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt box */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Concept Description
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to visualize..."
            className="flex-1 rounded-xl border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/40"
          />
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Image Preview */}
      <AnimatePresence mode="wait">
        {imageUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-4 pt-2"
          >
            <div className="relative overflow-hidden rounded-2xl border bg-black/5 dark:bg-white/5 aspect-video flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={prompt}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground truncate max-w-[250px]">
                Style: {selectedStyle} • Generated concept
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyUrl} className="gap-1.5 rounded-lg text-xs">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied Link" : "Copy Link"}
                </Button>
                <a href={imageUrl} target="_blank" rel="noopener noreferrer" download="eduswarm_concept.jpg">
                  <Button variant="default" size="sm" className="gap-1.5 rounded-lg text-xs bg-purple-600 hover:bg-purple-700">
                    <Download className="h-3.5 w-3.5" />
                    Open / Download
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
