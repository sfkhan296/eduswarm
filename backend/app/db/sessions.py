"""
Learning session persistence.

Saves and retrieves user learning sessions from the 'learning_sessions'
Supabase table. This is a stub — wire it into endpoints when ready.

Expected table schema:
  id           uuid  primary key default uuid_generate_v4()
  user_id      text  not null
  prompt       text  not null
  response     jsonb not null
  created_at   timestamptz default now()
"""

import logging
from app.db.supabase import get_supabase_client
from app.schemas.learning import LearningResponse

logger = logging.getLogger(__name__)

TABLE = "learning_sessions"


async def save_session(
    user_id: str,
    prompt: str,
    response: LearningResponse,
) -> str | None:
    """Persist a learning session. Returns the new row ID or None on failure."""
    try:
        client = get_supabase_client()
        data = (
            client.table(TABLE)
            .insert(
                {
                    "user_id": user_id,
                    "prompt": prompt,
                    "response": response.model_dump(),
                }
            )
            .execute()
        )
        row_id: str = data.data[0]["id"]
        logger.info("Saved session id=%s for user=%s", row_id, user_id)
        return row_id
    except Exception:
        logger.exception("Failed to save session for user=%s", user_id)
        return None


async def get_user_sessions(user_id: str) -> list[dict]:
    """Return all sessions for a given user, newest first."""
    try:
        client = get_supabase_client()
        data = (
            client.table(TABLE)
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )
        return data.data or []
    except Exception:
        logger.exception("Failed to fetch sessions for user=%s", user_id)
        return []
