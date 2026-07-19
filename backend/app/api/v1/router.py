from fastapi import APIRouter
from app.api.v1.endpoints import learn, history, chat, tts, video, did_video

api_router = APIRouter()

api_router.include_router(learn.router,      prefix="/learn",     tags=["learn"])
api_router.include_router(history.router,    prefix="/history",   tags=["history"])
api_router.include_router(chat.router,       prefix="/chat",      tags=["chat"])
api_router.include_router(tts.router,        prefix="/tts",       tags=["tts"])
api_router.include_router(video.router,      prefix="/video",     tags=["video"])
api_router.include_router(did_video.router,  prefix="/did-video", tags=["did-video"])
