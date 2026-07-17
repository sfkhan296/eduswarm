from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, Field


# ─── Request ────────────────────────────────────────────────────────────────

class LearningRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=3,
        max_length=500,
        examples=["Teach me Java.", "Explain machine learning to a 10-year-old."],
    )


# ─── Learner Analysis Agent ──────────────────────────────────────────────────

LearnerLevel = Literal["child", "teen", "professional"]


class LearnerProfile(BaseModel):
    level: LearnerLevel
    reasoning: str = Field(description="Why the agent classified the learner this way.")


# ─── Content Generation Agent ────────────────────────────────────────────────

class ContentSection(BaseModel):
    title: str
    body: str
    code_example: Optional[str] = None


# ─── Quiz Generation Agent ───────────────────────────────────────────────────

class QuizQuestion(BaseModel):
    question: str
    options: list[str] = Field(min_length=2, max_length=5)
    correct_index: int = Field(ge=0)
    explanation: str


# ─── UI Personalization Agent ────────────────────────────────────────────────

class UIPersonalization(BaseModel):
    tone: Literal["playful", "balanced", "professional"]
    color_scheme: str = Field(description="A CSS-friendly color name or hex value.")
    font_size: Literal["sm", "base", "lg"]


# ─── Full Response ───────────────────────────────────────────────────────────

class LearningResponse(BaseModel):
    learner_profile: LearnerProfile
    content: list[ContentSection]
    quiz: list[QuizQuestion]
    ui_personalization: UIPersonalization
