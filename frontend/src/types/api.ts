// ─── Request ────────────────────────────────────────────────────────────────

export interface LearningRequest {
  prompt: string;
}

// ─── Learner Analysis Agent Output ──────────────────────────────────────────

export type LearnerLevel = "child" | "teen" | "professional";

export interface LearnerProfile {
  level: LearnerLevel;
  reasoning: string;
}

// ─── Content Generation Agent Output ────────────────────────────────────────

export interface ContentSection {
  title: string;
  body: string;
  code_example?: string;
}

// ─── Quiz Generation Agent Output ───────────────────────────────────────────

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

// ─── UI Personalization Agent Output ────────────────────────────────────────

export interface UIPersonalization {
  tone: "playful" | "balanced" | "professional";
  color_scheme: string;
  font_size: "sm" | "base" | "lg";
}

// ─── Full Response ───────────────────────────────────────────────────────────

export interface LearningResponse {
  learner_profile: LearnerProfile;
  content: ContentSection[];
  quiz: QuizQuestion[];
  ui_personalization: UIPersonalization;
}
