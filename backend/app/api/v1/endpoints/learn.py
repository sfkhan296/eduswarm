import logging
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.schemas.learning import LearningRequest, LearningResponse
from app.crews.learning_crew import run_learning_crew
from app.db.sessions import save_session

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post(
    "/",
    response_model=LearningResponse,
    summary="Submit a learning prompt and receive personalized content",
)
async def learn(
    body: LearningRequest,
    current_user: dict = Depends(get_current_user),
) -> LearningResponse:
    """
    Accepts a natural-language learning prompt, runs the EduSwarm agent crew,
    returns structured personalized learning content, and persists the session
    to Supabase.
    """
    user_id: str = current_user.get("sub", "anonymous")
    logger.info("Learning request from user=%s prompt=%r", user_id, body.prompt)

    try:
        result = await run_learning_crew(prompt=body.prompt, user_id=user_id)
    except Exception as exc:
        logger.exception("Agent crew failed for user=%s", user_id)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="The learning agents encountered an error. Please try again.",
        ) from exc

    # Persist the session — non-blocking, failure here won't break the response
    session_id = await save_session(
        user_id=user_id,
        prompt=body.prompt,
        response=result,
    )
    if session_id:
        logger.info("Session saved id=%s user=%s", session_id, user_id)

    return result
