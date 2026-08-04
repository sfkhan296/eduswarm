import type { LearningRequest, LearningResponse } from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function submitLearningPrompt(
  prompt: string,
  options?: {
    language?: string;
    documentText?: string;
    formatPreference?: "auto" | "bullets" | "paragraphs" | "step_by_step" | "qa";
    depthLevel?: "auto" | "overview" | "detailed" | "hands_on";
  }
): Promise<LearningResponse> {
  const body: LearningRequest = {
    prompt,
    language: options?.language,
    document_text: options?.documentText,
    format_preference: options?.formatPreference,
    depth_level: options?.depthLevel,
  };

  const res = await fetch(`${API_BASE}/api/v1/learn/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `HTTP ${res.status}`);
  }

  return res.json() as Promise<LearningResponse>;
}

export async function generateConceptImage(
  prompt: string,
  style: string = "illustration"
): Promise<{ image_url: string; prompt_used: string }> {
  const res = await fetch(`${API_BASE}/api/v1/image/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, style }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(detail || `HTTP ${res.status}`);
  }

  return res.json();
}
