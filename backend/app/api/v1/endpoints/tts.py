"""
Text-to-Speech endpoint

Accepts text + language code, returns a real .mp3 binary using gTTS.
gTTS uses Google's TTS service — no API key required, just internet access.
"""

import io
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from gtts import gTTS, lang as gtts_lang

from app.core.security import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

# gTTS supported language codes (subset — covers all EduSwarm languages)
SUPPORTED_LANGS = {
    "en", "hi", "es", "fr", "ar", "de",
    "zh", "ja", "pt", "ru", "ko", "it",
}

# gTTS uses "zh-CN" for Chinese, "pt" for Portuguese etc.
# Map our ISO codes to gTTS-compatible codes where they differ
LANG_MAP: dict[str, str] = {
    "zh": "zh-CN",
    "pt": "pt",      # already correct
}


class TTSRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    language: str = Field(default="en", description="ISO 639-1 language code")
    slow: bool = Field(default=False, description="Speak slower (better for learners)")


@router.post(
    "/",
    summary="Convert text to MP3 audio",
    response_class=StreamingResponse,
)
async def text_to_speech(
    body: TTSRequest,
    current_user: dict = Depends(get_current_user),
) -> StreamingResponse:
    user_id = current_user.get("sub", "anonymous")
    lang_code = body.language.lower().split("-")[0]  # normalise "zh-CN" → "zh"

    # Resolve to gTTS-compatible code
    gtts_code = LANG_MAP.get(lang_code, lang_code)

    # Validate — fall back to English if unsupported
    available = gtts_lang.tts_langs()
    if gtts_code not in available:
        logger.warning(
            "TTS lang '%s' not supported by gTTS for user=%s, falling back to 'en'",
            gtts_code, user_id,
        )
        gtts_code = "en"

    logger.info("TTS request user=%s lang=%s chars=%d", user_id, gtts_code, len(body.text))

    try:
        tts = gTTS(text=body.text, lang=gtts_code, slow=body.slow)
        buf = io.BytesIO()
        tts.write_to_fp(buf)
        buf.seek(0)
    except Exception as exc:
        logger.exception("gTTS failed for user=%s", user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Audio generation failed. Please try again.",
        ) from exc

    return StreamingResponse(
        buf,
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": 'attachment; filename="lesson.mp3"',
            "Cache-Control": "no-store",
        },
    )
