"""MCP integration extension points.

MCP (Model Context Protocol) can expose external tools to the agent.
This module currently provides stubs so students can add a real MCP client.
"""

from dataclasses import dataclass


@dataclass
class MCPTool:
    name: str
    description: str


def discover_mcp_tools() -> list[MCPTool]:
    """Return tools available from MCP servers.

    Extension point:
    - Connect to your MCP registry/server(s).
    - Return discovered tools with names/descriptions.
    """

    return [
        MCPTool(name="mcp.search_docs", description="Search class/course documents"),
        MCPTool(name="mcp.lookup_code", description="Look up code examples"),
    ]
