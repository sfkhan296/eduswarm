"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Loader2, Play, Square, Download, Sparkles, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MP3GeneratorProps {
  topic: string;
  language: string;
}

const VOICE_STYLES = [
  { id: "teacher", label: "👩‍🏫 Teacher", rate: 0.85, pitch: 1.1 },
  { id: "storyteller", label: "📖 Storyteller", rate: 0.8, pitch: 0.95 },
  { id: "energetic", label: "⚡ Energetic", rate: 1.1, pitch: 1.2 },
  { id: "calm", label: "🧘 Calm", rate: 0.75, pitch: 0.9 },
];

export function MP3Generator({ topic, language }: MP3GeneratorProps) {
  const [topicInput, setTopicInput] = useState(topic);
  const [script, setScript] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("teacher");
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobEvent["data"][]>([]);

  const generateScript = async () => {
    setLoading(true);
    setScript("");
    setAudioBlob(null);
    setAudioUrl(null);
    try {
      const res = await fetch("/api/backend/api/v1/chat/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Write a 2-minute audio lesson script about: "${topicInput}".
- Write in a natural, conversational speaking style
- Include pauses indicated by [pause]
- No bullet points or markdown — only natural speech
- Start with a friendly greeting
- End with a summary and encouraging close
- Language: ${language}`,
          topic: topicInput,
          level: "professional",
          history: [],
        }),
      });
      const data = await res.json();
      setScript(data.reply.replace(/\[pause\]/gi, "..."));
    } catch {
      setScript("Script generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
  };

  const recordAndSpeak = async () => {
    if (!script) return;
    const style = VOICE_STYLES.find((v) => v.id === voiceStyle) ?? VOICE_STYLES[0];

    try {
      // Start recording microphone output — we'll capture system audio via loopback
      // Since direct system audio capture needs desktop permissions, we record the
      // mic while TTS plays, which works on most browsers
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setIsRecording(false);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      // Microphone not available — just play without recording
    }

    // Speak
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = style.rate;
    utterance.pitch = style.pitch;
    utterance.lang = language;
    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
    window.speechSynthesis.speak(utterance);
  };

  const downloadAudio = () => {
    if (!audioBlob) return;
    const a = document.createElement("a");
    a.href = audioUrl!;
    a.download = `${topicInput.replace(/\s+/g, "_")}_lesson.webm`;
    a.click();
  };

  const downloadScript = () => {
    const blob = new Blob([script], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topicInput.replace(/\s+/g, "_")}_script.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Topic</label>
        <input value={topicInput} onChange={(e) => setTopicInput(e.target.value)}
          placeholder="e.g. How does the internet work?"
          className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Voice style */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Voice Style</label>
        <div className="grid grid-cols-2 gap-2">
          {VOICE_STYLES.map((v) => (
            <button key={v.id} onClick={() => setVoiceStyle(v.id)}
              className={`rounded-lg border py-2 text-xs font-medium transition-all
                ${voiceStyle === v.id ? "border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400" : "border-border bg-muted/30 hover:bg-muted"}`}
            >{v.label}</button>
          ))}
        </div>
      </div>

      <Button onClick={generateScript} disabled={loading || !topicInput.trim()} className="w-full gap-2">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Writing script…</> : <><Sparkles className="h-4 w-4" />Generate Audio Script</>}
      </Button>

      <AnimatePresence>
        {script && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">

            {/* Script preview */}
            <div className="rounded-xl border bg-muted/20 p-3 max-h-40 overflow-y-auto">
              <p className="text-xs text-muted-foreground leading-relaxed">{script}</p>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              {!isPlaying ? (
                <Button onClick={recordAndSpeak} className="flex-1 gap-2 bg-pink-500 hover:bg-pink-600 text-white">
                  <Play className="h-4 w-4" />
                  {isRecording ? "Recording…" : "Play & Record"}
                </Button>
              ) : (
                <Button onClick={stopSpeaking} variant="outline" className="flex-1 gap-2 border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20">
                  <Square className="h-4 w-4" /> Stop
                </Button>
              )}
              <Button variant="outline" onClick={downloadScript} className="gap-2">
                <Download className="h-4 w-4" /> Script
              </Button>
            </div>

            {/* Audio playback */}
            {audioUrl && (
              <div className="space-y-2">
                <audio controls src={audioUrl} className="w-full rounded-lg" />
                <Button onClick={downloadAudio} className="w-full gap-2 bg-pink-500 hover:bg-pink-600 text-white">
                  <Download className="h-4 w-4" />
                  Download Audio (.webm)
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Tip: Use Audacity or online tools to convert .webm to .mp3
                </p>
              </div>
            )}

            {isRecording && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 px-3 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                <span className="text-xs text-red-600 dark:text-red-400 font-medium">Recording in progress…</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
