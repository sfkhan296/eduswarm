from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from functools import lru_cache
from pathlib import Path
import os

# Always resolve .env relative to this file, not the process CWD
# config.py lives at: backend/app/core/config.py
# .env lives at:      backend/.env
# parents[0] = backend/app/core
# parents[1] = backend/app
# parents[2] = backend   ← correct
_ENV_FILE = Path(__file__).resolve().parents[2] / ".env"

# Pre-load with python-dotenv so os.environ is populated for any library
# that reads it directly (litellm, crewai, etc.) — this runs in every process.
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=_ENV_FILE, override=False)
except ImportError:
    pass


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Groq (free LLM provider)
    groq_api_key: str

    # Supabase
    supabase_url: str
    supabase_key: str

    # Clerk
    clerk_secret_key: str = ""
    clerk_publishable_key: str = ""
    clerk_jwt_issuer: str = ""

    # D-ID
    did_api_key: str = ""

    # App
    app_env: str = "development"
    log_level: str = "INFO"
    allowed_origins: str = "http://localhost:3000"

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_origins(cls, v: str) -> str:
        # Accept either a plain string or JSON array — just return as-is
        return v

    @property
    def allowed_origins_list(self) -> list[str]:
        """Returns allowed_origins as a list, splitting on commas if needed."""
        return [o.strip() for o in self.allowed_origins.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

# Inject into os.environ so litellm / CrewAI agents can find them
# (pydantic-settings loads values into Python objects but does NOT set os.environ)
os.environ.setdefault("GROQ_API_KEY", settings.groq_api_key)

# Disable CrewAI telemetry — prevents noisy DNS errors when network is restricted
os.environ.setdefault("CREWAI_DISABLE_TELEMETRY", "true")
os.environ.setdefault("OTEL_SDK_DISABLED", "true")
