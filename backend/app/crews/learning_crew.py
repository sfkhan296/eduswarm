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
import os
import re
import time
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

# ── Key-normalisation maps ────────────────────────────────────────────────────
# LLMs sometimes translate JSON key names when given a non-English language
# instruction. These maps remap any known translated variants back to the
# English field names that Pydantic expects.

_QUIZ_KEY_MAP: dict[str, str] = {
    # English (canonical)
    "question": "question", "options": "options",
    "correct_index": "correct_index", "explanation": "explanation",
    # Hindi
    "प्रश्न": "question", "विकल्प": "options",
    "सही_सूची": "correct_index", "व्याख्या": "explanation",
    "सही उत्तर": "correct_index",
    # Chinese (Traditional / Simplified)
    "問題": "question", "選項": "options",
    "正確索引": "correct_index", "解釋": "explanation",
    "问题": "question", "选项": "options",
    "正确索引": "correct_index", "解释": "explanation",
    # Arabic
    "السؤال": "question", "الخيارات": "options",
    "الفهرس_الصحيح": "correct_index", "التفسير": "explanation",
    # Spanish
    "pregunta": "question", "opciones": "options",
    "índice_correcto": "correct_index", "explicación": "explanation",
    # French
    "question_fr": "question", "options_fr": "options",
    "index_correct": "correct_index", "explication": "explanation",
    # German
    "frage": "question", "optionen": "options",
    "richtiger_index": "correct_index", "erklärung": "explanation",
    # Japanese
    "質問": "question", "選択肢": "options",
    "正解インデックス": "correct_index", "説明": "explanation",
    # Korean
    "질문": "question", "옵션": "options",
    "정답_인덱스": "correct_index", "설명": "explanation",
    # Russian
    "вопрос": "question", "варианты": "options",
    "правильный_индекс": "correct_index", "объяснение": "explanation",
    # Portuguese
    "questão": "question", "opções": "options",
    "índice_correto": "correct_index", "explicação": "explanation",
    # Italian
    "domanda": "question", "opzioni": "options",
    "indice_corretto": "correct_index", "spiegazione": "explanation",
}

_CONTENT_KEY_MAP: dict[str, str] = {
    "title": "title", "body": "body", "code_example": "code_example",
    # Hindi
    "शीर्षक": "title", "विवरण": "body", "कोड_उदाहरण": "code_example",
    # Chinese
    "標題": "title", "內容": "body", "代碼示例": "code_example",
    "标题": "title", "内容": "body", "代码示例": "code_example",
    # Arabic
    "العنوان": "title", "المحتوى": "body", "مثال_الكود": "code_example",
    # Spanish
    "título": "title", "cuerpo": "body", "ejemplo_código": "code_example",
    # French
    "titre": "title", "contenu": "body", "exemple_code": "code_example",
    # German
    "titel": "title", "inhalt": "body", "code_beispiel": "code_example",
    # Japanese
    "タイトル": "title", "本文": "body", "コード例": "code_example",
    # Korean
    "제목": "title", "본문": "body", "코드_예시": "code_example",
    # Russian
    "заголовок": "title", "содержание": "body", "пример_кода": "code_example",
    # Portuguese
    "título_pt": "title", "corpo": "body", "exemplo_código_pt": "code_example",
    # Italian
    "titolo": "title", "corpo_it": "body", "esempio_codice": "code_example",
}


def _unwrap_list(data: Any, *candidate_keys: str) -> list:
    """
    Ensure we always work with a plain list of dicts.

    LLMs sometimes wrap the array in a dict:
        {"sections": [...]}  or  {"questions": [...]}
    They may also return a dict with a single key whose value is the list.
    If `data` is already a list, return it unchanged.
    """
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        # Try known wrapper keys first
        for key in candidate_keys:
            if key in data and isinstance(data[key], list):
                return data[key]
        # Fallback: return the first list-valued item found
        for v in data.values():
            if isinstance(v, list):
                return v
    logger.warning("Could not unwrap list from: %s", str(data)[:200])
    return []


def _normalise_quiz(raw_list: Any) -> list[dict]:
    """Remap translated keys to canonical English field names, skip malformed entries."""
    raw_list = _unwrap_list(raw_list, "questions", "quiz", "items")
    result = []
    for item in raw_list:
        # Skip non-dict items (e.g. stray strings)
        if not isinstance(item, dict):
            logger.warning("Skipping non-dict quiz item: %s", type(item).__name__)
            continue
        normalised: dict = {}
        for k, v in item.items():
            canonical = _QUIZ_KEY_MAP.get(k) or _QUIZ_KEY_MAP.get(k.lower())
            normalised[canonical or k] = v
        # Only keep entries that have all required fields with valid values
        if (
            normalised.get("question")
            and isinstance(normalised.get("options"), list)
            and len(normalised.get("options", [])) >= 2
            and isinstance(normalised.get("correct_index"), int)
            and normalised.get("explanation")
        ):
            result.append(normalised)
        else:
            logger.warning("Skipping malformed quiz question: %s", list(normalised.keys()))
    return result


def _normalise_content(raw_list: Any) -> list[dict]:
    """Remap translated keys to canonical English field names, skip malformed entries."""
    raw_list = _unwrap_list(raw_list, "sections", "content", "lessons", "items")
    result = []
    for item in raw_list:
        # Skip non-dict items (e.g. stray strings)
        if not isinstance(item, dict):
            logger.warning("Skipping non-dict content item: %s", type(item).__name__)
            continue
        normalised: dict = {}
        for k, v in item.items():
            canonical = _CONTENT_KEY_MAP.get(k) or _CONTENT_KEY_MAP.get(k.lower())
            normalised[canonical or k] = v
        # Only keep entries that have the required fields
        if normalised.get("title") and normalised.get("body"):
            result.append(normalised)
        else:
            logger.warning("Skipping malformed content section: %s", list(normalised.keys()))
    return result


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


def _kickoff_raw(crew: Crew, max_retries: int = 3) -> str:
    """Run a crew and return the raw string output, retrying on rate limit errors."""
    for attempt in range(max_retries):
        try:
            result = crew.kickoff()
            return result.raw if hasattr(result, "raw") else str(result)
        except Exception as e:
            err_str = str(e)
            is_rate_limit = "rate_limit_exceeded" in err_str or "429" in err_str or "RateLimitError" in type(e).__name__
            if is_rate_limit and attempt < max_retries - 1:
                # Parse the suggested wait time from the error message
                match = re.search(r"try again in (\d+\.?\d*)s", err_str)
                wait = float(match.group(1)) + 1.0 if match else (2 ** attempt) * 5.0
                logger.warning(
                    "Rate limit hit, waiting %.1fs before retry (attempt %d/%d)",
                    wait, attempt + 1, max_retries,
                )
                time.sleep(wait)
            else:
                raise


async def run_learning_crew(prompt: str, user_id: str, language: str = "en") -> LearningResponse:
    """
    Run the full EduSwarm crew pipeline and return a validated LearningResponse.
    The crew runs synchronously inside an executor to avoid blocking the event loop.
    """

    def _run_sync() -> LearningResponse:
        # ── Ensure API key is set in this thread's environment ───────────────
        # The reload worker is a subprocess that may not inherit os.environ
        # changes made in the parent process, so we set it explicitly here.
        from app.core.config import settings as _settings
        os.environ["GROQ_API_KEY"] = _settings.groq_api_key

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
        # User-selected language always takes priority over auto-detected
        effective_language = language if language != "en" else (learner_profile.detected_language or "en")
        logger.info("Learner classified as '%s', effective_language='%s' for user=%s", level, effective_language, user_id)

        # ── Step 2: Content Generation ───────────────────────────────────────
        content_crew = Crew(
            agents=[content_agent],
            tasks=[build_content_generation_task(content_agent, prompt, level, effective_language)],
            process=Process.sequential,
            verbose=False,
        )
        content_data = _extract_json(_kickoff_raw(content_crew))
        content_sections = [ContentSection(**s) for s in _normalise_content(content_data)]
        if not content_sections:
            raise ValueError("Content generation produced no valid sections.")

        # ── Step 3: Quiz Generation ──────────────────────────────────────────
        quiz_crew = Crew(
            agents=[quiz_agent],
            tasks=[build_quiz_generation_task(quiz_agent, prompt, level, effective_language)],
            process=Process.sequential,
            verbose=False,
        )
        quiz_data = _extract_json(_kickoff_raw(quiz_crew))
        quiz_questions = [QuizQuestion(**q) for q in _normalise_quiz(quiz_data)]
        if not quiz_questions:
            raise ValueError("Quiz generation produced no valid questions.")

        # ── Step 4: UI Personalization ───────────────────────────────────────
        ui_crew = Crew(
            agents=[ui_agent],
            tasks=[build_ui_personalization_task(ui_agent, level, prompt, effective_language)],
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
            detected_language=effective_language,
        )

    # Run the blocking CrewAI calls in a thread pool so FastAPI stays responsive
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _run_sync)
