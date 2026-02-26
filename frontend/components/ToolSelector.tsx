"use client";

import { useEffect, useState } from "react";
import { fetchMcpTools } from "../lib/api";

type Props = {
  selected: string[];
  onChange: (next: string[]) => void;
};

export function ToolSelector({ selected, onChange }: Props) {
  const [tools, setTools] = useState<Array<{ name: string; description: string }>>([]);

  useEffect(() => {
    fetchMcpTools().then(setTools).catch(() => setTools([]));
  }, []);

  const toggleTool = (name: string) => {
    if (selected.includes(name)) {
      onChange(selected.filter((tool) => tool !== name));
    } else {
      onChange([...selected, name]);
    }
  };

  return (
    <div className="tool-selector">
      <h3>MCP Tools</h3>
      <p>Select which MCP tools the next message may use.</p>
      {tools.map((tool) => (
        <label key={tool.name} className="tool-row">
          <input
            type="checkbox"
            checked={selected.includes(tool.name)}
            onChange={() => toggleTool(tool.name)}
          />
          <span>
            <strong>{tool.name}</strong>
            <small>{tool.description}</small>
          </span>
        </label>
      ))}
    </div>
  );
}
