# PydanticAI + CopilotKit Chatbot Template
# init: set up backend (uv sync, .env) and frontend (npm install)
# run: start backend on :8000 and frontend on :3000

.PHONY: init run run-backend run-frontend

init:
	cd backend && uv sync
	cp .env.example backend/.env
	@echo "Edit backend/.env with your model API key and model name"
	cd frontend && npm install

run:
	(cd backend && uv run uvicorn app.main:app --reload --port 8000) & \
	(cd frontend && npm run dev); \
	kill $$(jobs -p) 2>/dev/null || true

run-backend:
	cd backend && uv run uvicorn app.main:app --reload --port 8000

run-frontend:
	cd frontend && npm run dev
