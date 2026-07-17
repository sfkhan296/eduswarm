from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from functools import lru_cache


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
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
