"""Configuration module.

Keep this file small and predictable so students can quickly see:
1) where environment variables are read
2) where defaults are set
3) which values control model/prompt behavior
"""

from pydantic import BaseModel
import os


class Settings(BaseModel):
    """Application settings loaded from environment variables.

    Extension point:
    - Change `model_name` to switch providers/models.
    - Change `system_prompt` to define assistant behavior.
    """

    model_name: str = os.getenv("MODEL_NAME", "openai:gpt-4o-mini")
    system_prompt: str = os.getenv(
        "SYSTEM_PROMPT",
        (
            "You are a helpful tutor. Explain concepts clearly, step by step, "
            "and ask follow-up questions when useful."
        ),
    )
    openai_api_key: str | None = os.getenv("OPENAI_API_KEY")


settings = Settings()
