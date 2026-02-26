"use client";

import { ConversationSummary } from "../lib/types";

type Props = {
  conversations: ConversationSummary[];
  activeId?: string;
  onNew: () => void;
  onSelect: (id: string) => void;
};

export function ChatSidebar({ conversations, activeId, onNew, onSelect }: Props) {
  return (
    <aside className="sidebar">
      <button onClick={onNew}>+ New conversation</button>
      <ul>
        {conversations.map((conversation) => (
          <li key={conversation.id}>
            <button
              className={conversation.id === activeId ? "active" : ""}
              onClick={() => onSelect(conversation.id)}
            >
              {conversation.title}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
