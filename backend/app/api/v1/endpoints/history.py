import logging
from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.security import get_current_user
from app.db.sessions import get_user_sessions

logger = logging.getLogger(__name__)
router = APIRouter()


class SessionSummary(BaseModel):
    id: str
    prompt: str
    created_at: str
    learner_level: str


class HistoryResponse(BaseModel):
    sessions: list[SessionSummary]
    total: int


@router.get(
    "/",
    response_model=HistoryResponse,
    summary="Get the current user's learning session history",
)
async def get_history(
    current_user: dict = Depends(get_current_user),
) -> HistoryResponse:
    user_id: str = current_user.get("sub", "anonymous")
    rows = await get_user_sessions(user_id)

    sessions = []
    for row in rows:
        try:
            response_data = row.get("response", {})
            level = (
                response_data.get("learner_profile", {}).get("level", "unknown")
                if isinstance(response_data, dict)
                else "unknown"
            )
            sessions.append(
                SessionSummary(
                    id=str(row["id"]),
                    prompt=row["prompt"],
                    created_at=str(row["created_at"]),
                    learner_level=level,
                )
            )
        except Exception:
            continue

    return HistoryResponse(sessions=sessions, total=len(sessions))
