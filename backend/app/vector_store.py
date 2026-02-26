"""Vector store extension point.

This file demonstrates where retrieval-augmented generation (RAG) can be inserted.
The default class does nothing beyond returning placeholder context.
"""


class InMemoryVectorStore:
    """Placeholder vector store for teaching purposes.

    Replace with a real retriever implementation and return top-k snippets.
    """

    def retrieve(self, query: str, top_k: int = 3) -> list[str]:
        # This is intentionally static so students can see where retrieval results
        # are injected into the prompt.
        return [
            "(placeholder context) Add your vector DB retrieval here.",
            f"(query observed) {query}",
        ][:top_k]
