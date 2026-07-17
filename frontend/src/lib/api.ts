import type { LearningRequest, LearningResponse } from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function submitLearningPrompt(
  prompt: string
): Promise<LearningResponse> {
  const body: LearningRequest = { prompt };

  const res = await fetch(`${API_BASE}/learn`, {
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
