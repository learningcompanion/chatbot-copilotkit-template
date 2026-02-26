"""FastAPI entrypoint with a streaming chat endpoint.

This endpoint emits Server-Sent Events (SSE). The frontend reads each event and updates
chat UI in real time.
"""

from __future__ import annotations

import json
from typing import AsyncIterator
from uuid import uuid4

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from pydantic_ai import Agent

from .config import settings
from .memory import InMemoryConversationStore
from .mcp import discover_mcp_tools
from .tools import built_in_tools
from .vector_store import InMemoryVectorStore

app = FastAPI(title="PydanticAI + CopilotKit Template Backend")

# Allow local frontend development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

memory_store = InMemoryConversationStore()
vector_store = InMemoryVectorStore()


class ChatRequest(BaseModel):
    conversation_id: str | None = None
    user_message: str = Field(..., min_length=1)
    selected_tools: list[str] = Field(default_factory=list)


def build_agent(system_prompt: str | None = None) -> Agent:
    """Build the agent.

    Extension points:
    - Swap model via settings.model_name.
    - Customize the system prompt.
    - Register MCP tools as callable functions.
    """

    return Agent(settings.model_name, system_prompt=system_prompt or settings.system_prompt)


def sse(event: str, data: dict) -> str:
    """Format one SSE message."""

    return f"event: {event}\ndata: {json.dumps(data)}\n\n"


@app.get("/mcp-tools")
def list_mcp_tools() -> dict:
    """UI uses this list to let users enable/disable MCP tools per conversation."""

    return {"tools": [tool.__dict__ for tool in discover_mcp_tools()]}


@app.post("/chat/stream")
async def chat_stream(req: ChatRequest) -> StreamingResponse:
    conversation_id = req.conversation_id or str(uuid4())

    async def event_generator() -> AsyncIterator[str]:
        # Notify frontend of the conversation id early.
        yield sse("conversation", {"conversation_id": conversation_id})

        # Retrieval augmentation extension point.
        retrieved = vector_store.retrieve(req.user_message, top_k=3)
        retrieval_context = "\n".join(f"- {x}" for x in retrieved)

        # Build a contextual prompt from user input + retrieved knowledge.
        prompt = (
            "User message:\n"
            f"{req.user_message}\n\n"
            "Retrieved context:\n"
            f"{retrieval_context}"
        )

        # Persist user message.
        memory_store.append(conversation_id, "user", req.user_message)

        # Announce tool availability (for transparency in the UI).
        available_local_tools = list(built_in_tools().keys())
        yield sse(
            "tool_catalog",
            {
                "available_local_tools": available_local_tools,
                "selected_tools": req.selected_tools,
            },
        )

        agent = build_agent()
        assistant_text = ""

        # Streaming shape may vary by provider/model. This pattern is a starting point.
        try:
            async with agent.run_stream(prompt) as run_result:
                async for text_delta in run_result.stream_text(delta=True):
                    assistant_text += text_delta
                    yield sse("text_delta", {"delta": text_delta})

                # Optional reasoning stream placeholder.
                # If your provider exposes reasoning tokens, map them here.
                # yield sse("thinking_delta", {"delta": "..."})

        except Exception as exc:  # noqa: BLE001
            yield sse("error", {"message": str(exc)})
            return

        # Save assistant response after stream completes.
        memory_store.append(conversation_id, "assistant", assistant_text)

        # Emit final event with a small summary useful for debugging.
        yield sse(
            "done",
            {
                "conversation_id": conversation_id,
                "assistant_chars": len(assistant_text),
                "history_size": len(memory_store.get(conversation_id)),
            },
        )

    return StreamingResponse(event_generator(), media_type="text/event-stream")
