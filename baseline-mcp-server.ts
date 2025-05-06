// mcp-baseline-server.ts
import { McpServer } from "npm:@modelcontextprotocol/sdk@^1.9.0/server/mcp.js";
import { StdioServerTransport } from "npm:@modelcontextprotocol/sdk@^1.9.0/server/stdio.js";
import { z } from "npm:zod@^3.24.2";
import { getWebFeatureBaselineStatusAsMCPContent } from "./tools/getWebFeatureBaselineStatusAsMCPContent.ts";
import { getNegatedBrowserBaselineStatusAsMCPContent } from "./tools/getNegatedBrowserBaselineStatusAsMCPContent.ts";
import { BROWSERS, type Browsers } from "./types.ts";
import DenoJSON from "./deno.json" with { type: "json" };

// MCPサーバーの初期化
const server = new McpServer({
  name: "Baseline MCP Server",
  version: DenoJSON.version,
  capabilities: {
    resource: {},
    tools: {},
  },
});

// 特定の機能のBaselineステータスを取得
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

// 特定のブラウザを除外した機能を検索
server.tool(
  "get_negated_browser_baseline_status",
  "特定のブラウザを除外して、Web Platform Dashboardからfeatureの結果を取得します",
  {
    query: z.enum(BROWSERS).describe(
      "除外したいブラウザの名前（chrome, edge, firefox, safari）",
    ),
  },
  async ({ query }: { query: Browsers }) => {
    return await getNegatedBrowserBaselineStatusAsMCPContent(query);
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
