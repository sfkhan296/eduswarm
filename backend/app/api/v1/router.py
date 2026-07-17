from fastapi import APIRouter
from app.api.v1.endpoints import learn, history

api_router = APIRouter()

api_router.include_router(learn.router, prefix="/learn", tags=["learn"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
