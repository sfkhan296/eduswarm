import logging
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.security import get_current_user
from app.db.preferences import get_preferences, save_preferences

logger = logging.getLogger(__name__)
router = APIRouter()


class PreferencesPayload(BaseModel):
    language: str | None = None
    gamification: dict | None = None


@router.get("/", summary="Get user preferences")
async def fetch_preferences(current_user: dict = Depends(get_current_user)):
    user_id: str = current_user.get("sub", "anonymous")
    prefs = await get_preferences(user_id)
    return prefs


@router.post("/", summary="Save user preferences")
async def update_preferences(
    body: PreferencesPayload,
    current_user: dict = Depends(get_current_user),
):
    user_id: str = current_user.get("sub", "anonymous")
    await save_preferences(
        user_id=user_id,
        language=body.language,
        gamification=body.gamification,
    )
    return {"ok": True}
