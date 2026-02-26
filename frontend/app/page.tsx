"use client";

import { CopilotKit, useCopilotAction } from "@copilotkit/react-core";
import { useEffect, useMemo, useState } from "react";
import { ChatSidebar } from "../components/ChatSidebar";
import { MessageBubble } from "../components/MessageBubble";
import { ToolSelector } from "../components/ToolSelector";
import { streamChat } from "../lib/api";
import { ConversationSummary, Message } from "../lib/types";

type ConversationState = {
  id: string;
  title: string;
  messages: Message[];
  toolCalls: Array<{ name: string; args: unknown }>;
};

function ChatTemplatePage() {
  const [conversations, setConversations] = useState<ConversationState[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [draft, setDraft] = useState("");
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  // Example CopilotKit action: tool choice can also be changed by the assistant.
  useCopilotAction({
    name: "select_mcp_tool",
    description: "Select one MCP tool in the UI",
    parameters: [{ name: "toolName", type: "string", required: true }],
    handler: ({ toolName }) => {
      setSelectedTools((current) =>
        current.includes(toolName) ? current : [...current, toolName],
      );
      return `Selected MCP tool: ${toolName}`;
    },
  });

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeId),
    [conversations, activeId],
  );

  useEffect(() => {
    const raw = localStorage.getItem("chat-sidebar-conversations");
    if (!raw) return;
    const parsed = JSON.parse(raw) as ConversationSummary[];
    setConversations(
      parsed.map((p) => ({ id: p.id, title: p.title, messages: [], toolCalls: [] })),
    );
    if (parsed[0]) setActiveId(parsed[0].id);
  }, []);

  useEffect(() => {
    const summaries: ConversationSummary[] = conversations.map((conversation) => ({
      id: conversation.id,
      title: conversation.title,
    }));
    localStorage.setItem("chat-sidebar-conversations", JSON.stringify(summaries));
  }, [conversations]);

  const ensureConversation = () => {
    if (activeConversation) return activeConversation;
    const id = crypto.randomUUID();
    const created: ConversationState = {
      id,
      title: "New chat",
      messages: [],
      toolCalls: [],
    };
    setConversations((prev) => [created, ...prev]);
    setActiveId(id);
    return created;
  };

  const updateConversation = (
    id: string,
    update: (conversation: ConversationState) => ConversationState,
  ) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? update(c) : c)));
  };

  const onSend = async () => {
    if (!draft.trim() || isStreaming) return;
    setIsStreaming(true);

    const current = ensureConversation();
    const userText = draft;
    setDraft("");

    updateConversation(current.id, (c) => ({
      ...c,
      title: c.title === "New chat" ? userText.slice(0, 40) : c.title,
      messages: [...c.messages, { role: "user", content: userText }],
    }));

    updateConversation(current.id, (c) => ({
      ...c,
      messages: [...c.messages, { role: "assistant", content: "", thinking: "" }],
    }));

    try {
      await streamChat({
        conversationId: current.id,
        userMessage: userText,
        selectedTools,
        onEvent: (event) => {
          if (event.type === "text_delta") {
            updateConversation(current.id, (c) => {
              const messages = [...c.messages];
              const last = messages[messages.length - 1];
              if (last?.role === "assistant") {
                last.content += event.delta;
              }
              return { ...c, messages };
            });
          }

          if (event.type === "thinking_delta") {
            updateConversation(current.id, (c) => {
              const messages = [...c.messages];
              const last = messages[messages.length - 1];
              if (last?.role === "assistant") {
                last.thinking = `${last.thinking ?? ""}${event.delta}`;
              }
              return { ...c, messages };
            });
          }

          if (event.type === "tool_call") {
            updateConversation(current.id, (c) => ({
              ...c,
              toolCalls: [...c.toolCalls, { name: event.name, args: event.args }],
            }));
          }
        },
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="app-shell">
      <ChatSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={() => {
          const id = crypto.randomUUID();
          setConversations((prev) => [
            { id, title: "New chat", messages: [], toolCalls: [] },
            ...prev,
          ]);
          setActiveId(id);
        }}
      />

      <main className="chat-main">
        <ToolSelector selected={selectedTools} onChange={setSelectedTools} />

        <section className="messages">
          {(activeConversation?.messages ?? []).map((message, idx) => (
            <MessageBubble key={idx} message={message} />
          ))}
        </section>

        <section className="tool-calls">
          <h3>Tool Calls</h3>
          {(activeConversation?.toolCalls ?? []).map((call, idx) => (
            <pre key={idx}>{JSON.stringify(call, null, 2)}</pre>
          ))}
        </section>

        <footer className="composer">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask anything..."
          />
          <button onClick={onSend} disabled={isStreaming}>
            {isStreaming ? "Streaming..." : "Send"}
          </button>
        </footer>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <ChatTemplatePage />
    </CopilotKit>
  );
}
