// baseline-mcp-server.ts
import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";
import {
  getNegatedBrowserBaselineStatusAsMCPContent,
  getWebFeatureBaselineStatusAsMCPContent,
} from "./tools/index.ts";
import { BROWSERS } from "./types.ts";
import DenoJSON from "./deno.json" with { type: "json" };

export function createMCPServer(): McpServer {
  const server = new McpServer({
    name: "Baseline MCP Server",
    version: DenoJSON.version,
  });

  // 特定の機能のBaselineステータスを取得
  server.registerTool(
    "get_web_feature_baseline_status",
    {
      description:
        "クエリを指定し、Web Platform Dashboardからfeatureの結果を取得します",
      inputSchema: z.object({
        query: z.array(z.string()).describe("調べたい機能の名前"),
      }),
    },
    async ({ query }) => {
      return await getWebFeatureBaselineStatusAsMCPContent(query);
    },
  );

  // 特定のブラウザを除外した機能を検索
  server.registerTool(
    "get_negated_browser_baseline_status",
    {
      description:
        "特定のブラウザを除外して、Web Platform Dashboardからfeatureの結果を取得します",
      inputSchema: z.object({
        query: z.enum(BROWSERS).describe(
          "除外したいブラウザの名前（chrome, edge, firefox, safari）",
        ),
      }),
    },
    async ({ query }) => {
      return await getNegatedBrowserBaselineStatusAsMCPContent(query);
    },
  );

  return server;
}

if (import.meta.main) {
  serveStdio(createMCPServer);
  console.error("Baseline MCP Server running on stdio");
}
