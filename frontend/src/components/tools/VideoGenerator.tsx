"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Sparkles, Loader2, Download, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoGeneratorProps {
  topic: string;
  language: string;
}

const VOICE_TYPES = [
  { id: "male",   label: "👨 Male",   lang: "en-US", pitch: 0.85, rate: 0.95 },
  { id: "female", label: "👩 Female", lang: "en-US", pitch: 1.2,  rate: 0.9  },
  { id: "boy",    label: "👦 Boy",    lang: "en-US", pitch: 1.4,  rate: 1.05 },
  { id: "girl",   label: "👧 Girl",   lang: "en-US", pitch: 1.55, rate: 1.0  },
];

const DURATIONS = [1, 2, 3, 5, 10];

export function VideoGenerator({ topic, language }: VideoGeneratorProps) {
  const [topicInput, setTopicInput] = useState(topic);
  const [videoType, setVideoType] = useState<"animated" | "original">("animated");
  const [duration, setDuration] = useState(2);
  const [voiceType, setVoiceType] = useState("female");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const generate = async () => {
    setLoading(true);
    setScript("");
    try {
      const res = await fetch("/api/backend/api/v1/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Write a ${duration}-minute ${videoType === "animated" ? "animated educational video" : "live-action explainer video"} script about: "${topicInput}".

Format as a proper video script with:
- [SCENE X]: Visual description of what's shown on screen
- NARRATOR: What the voiceover says
- [TRANSITION]: Scene transition notes

Make it engaging, educational, and suitable for a ${duration}-minute video.
Voice style: ${voiceType} narrator.
Language: ${language}.

Write at least ${duration * 120} words of narration content.`,
          topic: topicInput,
          level: "professional",
          history: [],
        }),
      });
      const data = await res.json();
      setScript(data.reply);
    } catch {
      setScript("Script generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const previewVoice = () => {
    if (!script) return;
    const voice = VOICE_TYPES.find((v) => v.id === voiceType)!;
    const narratorLines = script
      .split("\n")
      .filter((l) => l.includes("NARRATOR:"))
      .map((l) => l.replace("NARRATOR:", "").trim())
      .join(" ");
    const preview = narratorLines || script.slice(0, 300);
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(preview);
    utterance.pitch = voice.pitch;
    utterance.rate = voice.rate;
    utterance.lang = language || voice.lang;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopPreview = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const downloadScript = () => {
    const blob = new Blob([script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topicInput.replace(/\s+/g, "_")}_video_script.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadVideo = async () => {
    if (!script.trim()) return;
    setVideoLoading(true);
    try {
      const res = await fetch("/api/backend/api/v1/video/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script,
          language,
          style: videoType,
          topic: topicInput,
        }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `eduswarm_video.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Video download failed:", err);
      alert("Video generation failed. Please try again.");
    } finally {
      setVideoLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Topic */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Topic</label>
        <input value={topicInput} onChange={(e) => setTopicInput(e.target.value)}
          placeholder="e.g. How photosynthesis works"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Video type */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Video Type</label>
        <div className="grid grid-cols-2 gap-2">
          {(["animated", "original"] as const).map((t) => (
            <button key={t} onClick={() => setVideoType(t)}
              className={`flex items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium capitalize transition-all
                ${videoType === t ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400" : "border-border bg-muted/30 hover:bg-muted"}`}
            >
              {t === "animated" ? "🎬 Animated" : "🎥 Original"}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Duration: {duration} minute{duration > 1 ? "s" : ""}
        </label>
        <div className="flex gap-2">
          {DURATIONS.map((d) => (
            <button key={d} onClick={() => setDuration(d)}
              className={`flex-1 rounded-lg border py-1.5 text-xs font-bold transition-all
                ${duration === d ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400" : "border-border bg-muted/30 hover:bg-muted"}`}
            >{d}m</button>
          ))}
        </div>
      </div>

      {/* Voice type */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Narrator Voice</label>
        <div className="grid grid-cols-2 gap-2">
          {VOICE_TYPES.map((v) => (
            <button key={v.id} onClick={() => setVoiceType(v.id)}
              className={`rounded-lg border py-2 text-xs font-medium transition-all
                ${voiceType === v.id ? "border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400" : "border-border bg-muted/30 hover:bg-muted"}`}
            >{v.label}</button>
          ))}
        </div>
      </div>

      <Button onClick={generate} disabled={loading || !topicInput.trim()} className="w-full gap-2">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Writing script…</> : <><Sparkles className="h-4 w-4" />Generate Video Script</>}
      </Button>

      <AnimatePresence>
        {script && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

            {/* Script preview */}
            <div className="rounded-xl border bg-muted/20 p-3 max-h-52 overflow-y-auto text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono">
              {script}
            </div>

            {/* Voice preview */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={isPlaying ? stopPreview : previewVoice} className="flex-1 gap-2">
                <Mic2 className="h-4 w-4" />
                {isPlaying ? "Stop Preview" : "Preview Voice"}
              </Button>
              <Button onClick={downloadScript} variant="outline" className="flex-1 gap-2">
                <Download className="h-4 w-4" /> Script .txt
              </Button>
            </div>

            {/* MP4 download */}
            <Button
              onClick={downloadVideo}
              disabled={videoLoading}
              className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white"
            >
              {videoLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Generating MP4… (this takes ~30s)</>
                : <><Video className="h-4 w-4" />Download MP4 Video</>}
            </Button>

            <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground text-center">
              🎬 {duration}-min {videoType} script · {VOICE_TYPES.find(v => v.id === voiceType)?.label} voice
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
