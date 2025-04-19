// mcp-baseline-server.ts
import { McpServer } from "npm:@modelcontextprotocol/sdk@^1.9.0/server/mcp.js";
import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk@^1.9.0/server/stdio.js";
import { z } from "npm:zod@^3.24.2";
import { getWebFeatureBaselineStatusAsMCPContent } from "./tools/getWebFeatureBaselineStatusAsMCPContent.ts";

// MCPサーバーの初期化
const server = new McpServer({
  name: "Baseline MCP Server",
  version: "0.3.0",
  capabilities: {
    resource: {},
    tools: {},
  },
});

// MCPサーバーのツールを定義
server.tool(
  "get_web_feature_baseline_status",
  "クエリを指定し、Web Platform Dashboardからfeatureの結果を取得します",
  {
    query: z.string().describe("調べたい機能の名前"),
  },
  async ({ query }: { query: string }) => {
    return await getWebFeatureBaselineStatusAsMCPContent(query);
  },
);

// 起動
async function setMCPServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Baseline MCP Server running on stdio");
}

setMCPServer().catch((error) => {
  console.error("Fatal error in setMCPServer():", error);
  Deno.exit(1);
});
