import json
from typing import Annotated, Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "sqlite:///./codetrail.db"
    jwt_secret: str = "dev-secret-change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:5173"]

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: Any) -> Any:
        # Accept a JSON list or a comma-separated string; browsers send origins without a trailing slash.
        if isinstance(value, str):
            value = value.strip()
            value = json.loads(value) if value.startswith("[") else value.split(",")
        if isinstance(value, list):
            return [origin.strip().rstrip("/") for origin in value if origin.strip()]
        return value


settings = Settings()
