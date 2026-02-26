"use client";

import { Message } from "../lib/types";

type Props = {
  message: Message;
};

export function MessageBubble({ message }: Props) {
  return (
    <div className={`bubble ${message.role}`}>
      <strong>{message.role === "user" ? "You" : "Assistant"}</strong>
      {message.thinking ? <pre className="thinking">🧠 {message.thinking}</pre> : null}
      <pre>{message.content}</pre>
    </div>
  );
}
