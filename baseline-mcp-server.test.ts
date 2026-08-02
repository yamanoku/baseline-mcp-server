import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { assertEquals } from "@std/assert";
import { createMCPServer } from "./baseline-mcp-server.ts";

Deno.test("MCPサーバーがツールと入力スキーマを公開する", async () => {
  const server = createMCPServer();
  const client = new Client({
    name: "baseline-mcp-server-test",
    version: "1.0.0",
  });
  const [clientTransport, serverTransport] = InMemoryTransport
    .createLinkedPair();

  await server.connect(serverTransport);
  await client.connect(clientTransport);

  try {
    const { tools } = await client.listTools();

    assertEquals(
      tools.map(({ name }) => name),
      [
        "get_web_feature_baseline_status",
        "get_negated_browser_baseline_status",
      ],
    );
    assertEquals(tools[0].inputSchema, {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      properties: {
        query: {
          description: "調べたい機能の名前",
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["query"],
    });
    assertEquals(tools[1].inputSchema, {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      properties: {
        query: {
          description:
            "除外したいブラウザの名前（chrome, edge, firefox, safari）",
          type: "string",
          enum: ["chrome", "edge", "firefox", "safari"],
        },
      },
      required: ["query"],
    });
  } finally {
    await client.close();
    await server.close();
  }
});
