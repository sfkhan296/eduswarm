"""
Follow-up Chat Endpoint

Accepts a follow-up message after a lesson and returns a contextual reply
using the same LLM (Groq/LLaMA) without running the full agent crew.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from litellm import completion

from app.core.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    topic: str
    level: str
    language: str = "en"          # ISO 639-1 code chosen by the user
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str


SYSTEM_PROMPT = """You are EduSwarm's AI tutor. A student just finished a lesson on a topic
and is asking follow-up questions. Be helpful, concise, and adapt your language to the
learner's level. Keep answers focused and educational. Do not use markdown headers — use
plain conversational text."""


@router.post(
    "/",
    response_model=ChatResponse,
    summary="Send a follow-up message after a lesson",
)
async def chat(
    body: ChatRequest,
    current_user: dict = Depends(get_current_user),
) -> ChatResponse:
    user_id: str = current_user.get("sub", "anonymous")
    logger.info("Chat request from user=%s topic=%r lang=%s", user_id, body.topic, body.language)

    level_instruction = {
        "child": "Explain as simply as possible, using fun analogies a child would understand.",
        "teen": "Use clear language suitable for a teenager, with some technical depth.",
        "professional": "Be technically precise and assume a professional background.",
    }.get(body.level, "Be clear and helpful.")

    # Hard language instruction — placed last so the model can't ignore it
    lang_instruction = (
        f"\n\nCRITICAL: You MUST respond ENTIRELY in the language with ISO code '{body.language}'. "
        f"Every single word of your reply must be in that language. Do not switch to English."
    ) if body.language != "en" else ""

    system = (
        f"{SYSTEM_PROMPT}\n\n"
        f"Learner level: {body.level}. {level_instruction}\n"
        f"Topic: {body.topic}"
        f"{lang_instruction}"
    )

    messages = [{"role": "system", "content": system}]

    for msg in body.history[-6:]:
        if msg.role in ("user", "assistant"):
            messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": body.message})

    try:
        response = completion(
            model="groq/llama-3.1-8b-instant",
            messages=messages,
            max_tokens=512,
            temperature=0.7,
            timeout=60,          # prevent indefinite hang
            request_timeout=60,
        )
        reply = response.choices[0].message.content or "I'm not sure about that. Try rephrasing your question."
        return ChatResponse(reply=reply)
    except Exception as exc:
        logger.exception("Chat failed for user=%s", user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Chat is temporarily unavailable.",
        ) from exc
