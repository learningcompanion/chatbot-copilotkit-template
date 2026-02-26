"""Tool definitions and tool-call event helpers."""

from typing import Callable


def built_in_tools() -> dict[str, Callable[[str], str]]:
    """Local Python tools that can be called by name.

    In a real project, each tool might validate arguments with Pydantic models.
    """

    def explain_term(term: str) -> str:
        return f"Definition helper: '{term}' is a concept you can expand in class notes."

    def suggest_exercise(topic: str) -> str:
        return f"Try writing a short practice exercise about: {topic}."

    return {
        "explain_term": explain_term,
        "suggest_exercise": suggest_exercise,
    }
