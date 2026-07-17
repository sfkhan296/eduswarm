"""
EduSwarm Learning Crew

Orchestrates the four agents in sequence:
  1. Learner Analysis   → determines learner level
  2. Content Generation → builds lesson sections
  3. Quiz Generation    → creates quiz questions
  4. UI Personalization → picks visual settings

Each agent's JSON output is parsed and fed as context to the next.
The final result is assembled into a LearningResponse.
"""

import asyncio
import json
import logging
import re
from typing import Any

from crewai import Crew, Process

from app.agents.learner_analysis_agent import build_learner_analysis_agent
from app.agents.content_generation_agent import build_content_generation_agent
from app.agents.quiz_generation_agent import build_quiz_generation_agent
from app.agents.ui_personalization_agent import build_ui_personalization_agent

from app.tasks.learner_analysis_task import build_learner_analysis_task
from app.tasks.content_generation_task import build_content_generation_task
from app.tasks.quiz_generation_task import build_quiz_generation_task
from app.tasks.ui_personalization_task import build_ui_personalization_task

from app.schemas.learning import (
    LearnerProfile,
    ContentSection,
    QuizQuestion,
    UIPersonalization,
    LearningResponse,
)

logger = logging.getLogger(__name__)


def _extract_json(raw: str) -> Any:
    """
    Robustly extract JSON from an LLM response that may contain
    surrounding text, markdown fences, escape issues, or extra whitespace.
    """
    # Strip markdown code fences
    cleaned = re.sub(r"```(?:json)?\s*", "", raw).strip().rstrip("`").strip()

    # Fix invalid escape sequences like \• \* \- that LLMs sometimes emit
    cleaned = re.sub(r'\\([^"\\/bfnrtu])', r'\1', cleaned)

    # Try direct parse first
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Try extracting just the JSON object or array using regex
    for pattern in [r'(\[.*\])', r'(\{.*\})']:
        match = re.search(pattern, cleaned, re.DOTALL)
        if match:
            candidate = match.group(1)
            # Fix escapes again on the extracted portion
            candidate = re.sub(r'\\([^"\\/bfnrtu])', r'\1', candidate)
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                continue

    # Last resort: use json_repair if available
    try:
        import json_repair  # type: ignore
        return json_repair.loads(cleaned)
    except Exception:
        pass

    raise ValueError(f"Could not parse JSON from agent output:\n{raw[:500]}")


def _kickoff_raw(crew: Crew) -> str:
    """Run a crew and return the raw string output."""
    result = crew.kickoff()
    # CrewOutput has a .raw attribute in crewai >= 0.51
    return result.raw if hasattr(result, "raw") else str(result)


async def run_learning_crew(prompt: str, user_id: str) -> LearningResponse:
    """
    Run the full EduSwarm crew pipeline and return a validated LearningResponse.
    The crew runs synchronously inside an executor to avoid blocking the event loop.
    """

    def _run_sync() -> LearningResponse:
        # ── Build agents ────────────────────────────────────────────────────
        learner_agent = build_learner_analysis_agent()
        content_agent = build_content_generation_agent()
        quiz_agent = build_quiz_generation_agent()
        ui_agent = build_ui_personalization_agent()

        # ── Step 1: Learner Analysis ─────────────────────────────────────────
        analysis_crew = Crew(
            agents=[learner_agent],
            tasks=[build_learner_analysis_task(learner_agent, prompt)],
            process=Process.sequential,
            verbose=False,
        )
        profile_data = _extract_json(_kickoff_raw(analysis_crew))
        learner_profile = LearnerProfile(**profile_data)
        level = learner_profile.level
        logger.info("Learner classified as '%s' for user=%s", level, user_id)

        # ── Step 2: Content Generation ───────────────────────────────────────
        content_crew = Crew(
            agents=[content_agent],
            tasks=[build_content_generation_task(content_agent, prompt, level)],
            process=Process.sequential,
            verbose=False,
        )
        content_data = _extract_json(_kickoff_raw(content_crew))
        content_sections = [ContentSection(**s) for s in content_data]

        # ── Step 3: Quiz Generation ──────────────────────────────────────────
        quiz_crew = Crew(
            agents=[quiz_agent],
            tasks=[build_quiz_generation_task(quiz_agent, prompt, level)],
            process=Process.sequential,
            verbose=False,
        )
        quiz_data = _extract_json(_kickoff_raw(quiz_crew))
        quiz_questions = [QuizQuestion(**q) for q in quiz_data]

        # ── Step 4: UI Personalization ───────────────────────────────────────
        ui_crew = Crew(
            agents=[ui_agent],
            tasks=[build_ui_personalization_task(ui_agent, level, prompt)],
            process=Process.sequential,
            verbose=False,
        )
        ui_data = _extract_json(_kickoff_raw(ui_crew))
        ui_personalization = UIPersonalization(**ui_data)

        return LearningResponse(
            learner_profile=learner_profile,
            content=content_sections,
            quiz=quiz_questions,
            ui_personalization=ui_personalization,
        )

    # Run the blocking CrewAI calls in a thread pool so FastAPI stays responsive
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _run_sync)
