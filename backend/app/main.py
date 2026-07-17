from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.router import api_router

app = FastAPI(
    title="EduSwarm API",
    description="Multi-agent personalized learning backend powered by CrewAI.",
    version="0.1.0",
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ──────────────────────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")

# Health-check at root so the frontend rewrite proxy can verify the backend
@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "service": "eduswarm-backend"}
