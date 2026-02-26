# PydanticAI + CopilotKit Chatbot Template

This repository is a **student-friendly starter template** for building a custom chatbot with:

- **PydanticAI** for orchestration, model access, tools, and structured agent behavior.
- **FastAPI** for backend streaming endpoints.
- **CopilotKit + React/Next.js** for the chat UI shell.

The template is intentionally simple and heavily commented so you can use it as a learning base.

## Project layout

```text
.
├── backend
│   ├── app
│   │   ├── config.py            # Environment + extension toggles
│   │   ├── memory.py            # Conversation memory extension points
│   │   ├── mcp.py               # MCP tool loading extension points
│   │   ├── tools.py             # Agent tools + tool-call event helpers
│   │   ├── vector_store.py      # Vector store integration extension points
│   │   └── main.py              # FastAPI app + SSE streaming endpoint
│   └── pyproject.toml           # Managed by uv
├── frontend
│   ├── app
│   │   ├── page.tsx             # Main UI (sidebar + chat + tool selection)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components
│   │   ├── ChatSidebar.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ToolSelector.tsx
│   ├── lib
│   │   ├── api.ts               # SSE client
│   │   └── types.ts
│   └── package.json
└── .env.example
```

## Quick start

### 1) Backend (uv)

```bash
cd backend
uv sync
cp ../.env.example .env
# Edit .env with your model API key and model name
uv run uvicorn app.main:app --reload --port 8000
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:3000>.

---

## Extension points included

### 1. Adapt system prompt and model
- `backend/app/config.py`: set model + prompt defaults.
- `backend/app/main.py`: `build_agent(...)` reads these values and constructs `Agent`.

### 2. Add a vector store
- `backend/app/vector_store.py`: replace `InMemoryVectorStore` with your DB (pgvector, Qdrant, Pinecone, etc.).
- `backend/app/main.py`: retrieval hook before agent call.

### 3. Add MCP tools
- `backend/app/mcp.py`: plug in an MCP client + dynamic tool registration.
- UI sends selected tools with each request so students can test tool permissions.

### 4. Add conversational memory
- `backend/app/memory.py`: swap in Redis/SQLite/Postgres-backed history.
- `backend/app/main.py`: loads/saves history by `conversation_id`.

---

## Notes on “thinking tokens”

Some providers expose reasoning / thinking traces, some do not. This template supports an event type named `thinking_delta`; if your model/provider exposes reasoning deltas, map them there in the backend stream loop.

## Why this setup is useful for students

- Clear separation of backend vs frontend concerns.
- Event-based stream payloads are explicit and easy to inspect.
- Every major extension point is isolated in a dedicated module.
- Comments explain both *what* and *why* in beginner-friendly language.
