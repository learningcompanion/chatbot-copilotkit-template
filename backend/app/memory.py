"""Conversation memory abstractions.

This simple in-memory implementation is intentionally tiny so students can replace
it with Redis/SQLite/Postgres while keeping the same interface.
"""

from collections import defaultdict
from dataclasses import dataclass, field


@dataclass
class Message:
    role: str
    content: str


@dataclass
class InMemoryConversationStore:
    """Stores conversation history by conversation_id.

    Extension point:
    - Replace this with persistent storage.
    - Add metadata (timestamps, tool results, user id).
    """

    _store: dict[str, list[Message]] = field(default_factory=lambda: defaultdict(list))

    def get(self, conversation_id: str) -> list[Message]:
        return self._store[conversation_id]

    def append(self, conversation_id: str, role: str, content: str) -> None:
        self._store[conversation_id].append(Message(role=role, content=content))
