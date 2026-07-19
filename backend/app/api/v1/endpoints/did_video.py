"""
D-ID Talking Avatar Video Endpoint

Flow:
  1. Receive script + voice/avatar preferences
  2. POST to D-ID /talks to create a talk (async job)
  3. Poll GET /talks/{id} until status == "done" or "error"
  4. Return the result_url (MP4) so the frontend can download it directly

D-ID free tier: ~14 credits ≈ 5 minutes of video.
API docs: https://docs.d-id.com/reference/createtalk
"""

import asyncio
import logging

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

DID_BASE = "https://api.d-id.com"

# ── Default presenter avatars ─────────────────────────────────────────────────
# Using D-ID's own public bucket images — guaranteed to work on free tier
AVATARS = {
    "female": "https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg",
    "male":   "https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg",
    "boy":    "https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg",
    "girl":   "https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg",
}

# D-ID voice IDs (Microsoft Azure TTS voices — available on free tier)
VOICES = {
    "female": {"voice_id": "en-US-JennyNeural"},
    "male":   {"voice_id": "en-US-GuyNeural"},
    "boy":    {"voice_id": "en-US-JasonNeural"},
    "girl":   {"voice_id": "en-US-AriaNeural"},
}

# D-ID voice IDs (Microsoft Azure TTS voices — available on free tier)
VOICES = {
    "female": {"voice_id": "en-US-JennyNeural"},
    "male":   {"voice_id": "en-US-GuyNeural"},
    "boy":    {"voice_id": "en-US-JasonNeural"},
    "girl":   {"voice_id": "en-US-AriaNeural"},
}

# Language → D-ID provider language code
LANG_MAP = {
    "en": "en-US", "hi": "hi-IN", "es": "es-ES", "fr": "fr-FR",
    "ar": "ar-AE", "de": "de-DE", "zh": "zh-CN", "ja": "ja-JP",
    "pt": "pt-BR", "ru": "ru-RU", "ko": "ko-KR", "it": "it-IT",
}


def _extract_narrator(script: str, max_chars: int = 3000) -> str:
    """
    Extract only narrator / dialogue lines from the script.
    D-ID works best with clean spoken text — no stage directions.
    """
    import re
    lines = []
    for line in script.splitlines():
        line = line.strip()
        # Keep narrator lines
        if re.match(r"(?:NARRATOR|Narrator|Voice|Dialogue)[:\s]", line):
            text = re.sub(r"^(?:NARRATOR|Narrator|Voice|Dialogue)[:\s]+", "", line).strip()
            if text:
                lines.append(text)
        # Keep dialogue lines (quoted or plain)
        elif line and not re.match(
            r"^\[|\bScene\b|\bSetting\b|\bAction\b|\bStyle\b|\bCharacters\b|\bDuration\b|\bVisual\b|\bTransition\b",
            line, re.IGNORECASE
        ):
            # Skip very short metadata lines
            if len(line) > 20:
                lines.append(line)

    spoken = " ".join(lines).strip()
    if not spoken:
        spoken = script.strip()

    # D-ID has a ~3000 char limit per talk; trim gracefully
    if len(spoken) > max_chars:
        spoken = spoken[:max_chars].rsplit(" ", 1)[0] + "…"

    return spoken


# ── Schemas ───────────────────────────────────────────────────────────────────

class DIDVideoRequest(BaseModel):
    script:   str  = Field(..., min_length=10, description="Full video/animation script")
    language: str  = Field(default="en",      description="ISO 639-1 language code")
    voice:    str  = Field(default="female",   description="female | male | boy | girl")
    topic:    str  = Field(default="lesson",   description="Used in response metadata")


class DIDVideoResponse(BaseModel):
    video_url:  str
    talk_id:    str
    duration_s: float | None = None


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=DIDVideoResponse,
    summary="Generate a D-ID talking avatar video from a script",
)
async def generate_did_video(
    body: DIDVideoRequest,
    current_user: dict = Depends(get_current_user),
) -> DIDVideoResponse:
    user_id = current_user.get("sub", "anonymous")

    if not settings.did_api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="D-ID API key is not configured.",
        )

    lang_code  = body.language.lower().split("-")[0]
    did_lang   = LANG_MAP.get(lang_code, "en-US")
    voice_key  = body.voice if body.voice in VOICES else "female"
    avatar_url = AVATARS[voice_key]
    voice_cfg  = VOICES[voice_key]

    spoken_text = _extract_narrator(body.script)
    logger.info(
        "D-ID request user=%s voice=%s lang=%s chars=%d",
        user_id, voice_key, did_lang, len(spoken_text),
    )

    headers = {
        "Authorization": f"Basic {settings.did_api_key}",
        "Content-Type":  "application/json",
        "Accept":        "application/json",
    }

    talk_payload = {
        "source_url": avatar_url,
        "script": {
            "type":     "text",
            "input":    spoken_text,
            "provider": {
                "type":     "microsoft",
                "voice_id": voice_cfg["voice_id"],
            },
        },
        "config": {
            "fluent":    True,
            "pad_audio": 0.0,
        },
    }

    async with httpx.AsyncClient(timeout=30) as client:
        # ── Step 1: Create the talk ───────────────────────────────────────────
        try:
            create_resp = await client.post(
                f"{DID_BASE}/talks",
                headers=headers,
                json=talk_payload,
            )
        except httpx.RequestError as exc:
            logger.exception("D-ID create request failed for user=%s", user_id)
            raise HTTPException(status_code=502, detail=f"D-ID API unreachable: {exc}") from exc

        if create_resp.status_code not in (200, 201):
            logger.error(
                "D-ID create failed status=%d body=%s",
                create_resp.status_code, create_resp.text[:400],
            )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"D-ID rejected the request: {create_resp.text[:300]}",
            )

        talk_id = create_resp.json().get("id")
        if not talk_id:
            raise HTTPException(status_code=502, detail="D-ID did not return a talk ID.")

        logger.info("D-ID talk created id=%s user=%s", talk_id, user_id)

        # ── Step 2: Poll until done ───────────────────────────────────────────
        poll_url   = f"{DID_BASE}/talks/{talk_id}"
        max_polls  = 60          # 60 × 5s = 5 minutes max
        poll_delay = 5           # seconds between polls

        for attempt in range(max_polls):
            await asyncio.sleep(poll_delay)

            try:
                poll_resp = await client.get(poll_url, headers=headers)
            except httpx.RequestError as exc:
                logger.warning("D-ID poll error attempt=%d: %s", attempt, exc)
                continue

            if poll_resp.status_code != 200:
                logger.warning("D-ID poll non-200 status=%d", poll_resp.status_code)
                continue

            data   = poll_resp.json()
            pstatus = data.get("status")
            logger.debug("D-ID poll attempt=%d status=%s", attempt, pstatus)

            if pstatus == "done":
                result_url = data.get("result_url")
                if not result_url:
                    raise HTTPException(status_code=502, detail="D-ID returned done but no result_url.")
                duration = data.get("duration")
                logger.info("D-ID talk done id=%s url=%s", talk_id, result_url)
                return DIDVideoResponse(
                    video_url=result_url,
                    talk_id=talk_id,
                    duration_s=duration,
                )

            if pstatus == "error":
                err = data.get("error", {})
                logger.error("D-ID talk error id=%s error=%s", talk_id, err)
                raise HTTPException(
                    status_code=status.HTTP_502_BAD_GATEWAY,
                    detail=f"D-ID video generation failed: {err.get('description', 'unknown error')}",
                )

        # Timed out
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail=f"D-ID video generation timed out after {max_polls * poll_delay}s. Talk ID: {talk_id}",
        )
