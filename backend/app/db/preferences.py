"""
User preferences persistence (language, gamification state).
"""

import logging
from app.db.supabase import get_supabase_client

logger = logging.getLogger(__name__)
TABLE = "user_preferences"

DEFAULT_GAMIFICATION = {
    "totalXP": 0,
    "level": 1,
    "streak": 0,
    "maxStreak": 0,
    "badges": [],
    "totalCorrect": 0,
    "totalAnswered": 0,
}


async def get_preferences(user_id: str) -> dict:
    """Return preferences for a user, creating defaults if not found."""
    try:
        client = get_supabase_client()
        data = (
            client.table(TABLE)
            .select("*")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        return data.data or {}
    except Exception:
        # Row not found — return defaults
        return {
            "user_id": user_id,
            "language": "en",
            "gamification": DEFAULT_GAMIFICATION,
        }


async def save_preferences(user_id: str, language: str | None = None, gamification: dict | None = None) -> bool:
    """Upsert preferences for a user."""
    try:
        client = get_supabase_client()
        payload: dict = {"user_id": user_id, "updated_at": "now()"}
        if language is not None:
            payload["language"] = language
        if gamification is not None:
            payload["gamification"] = gamification

        client.table(TABLE).upsert(payload, on_conflict="user_id").execute()
        return True
    except Exception:
        logger.exception("Failed to save preferences for user=%s", user_id)
        return False
