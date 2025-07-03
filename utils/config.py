from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    AZURE_OPENAI_ENDPOINT: Optional[str] = None
    AZURE_OPENAI_API_KEY: Optional[str] = None
    OPENAI_API_VERSION: Optional[str] = None
    AZURE_CHAT_MODEL: Optional[str] = None
    AZURE_EMBEDDING_MODEL: Optional[str] = None

    TAVILY_API_KEY: Optional[str] = None

    LANGGRAPH_SERVER: Optional[str] = None
    CHECKPOINTER: Optional[str] = None


settings = Settings()
