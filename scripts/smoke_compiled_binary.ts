/**
 * コンパイル済みバイナリが stdio 上で MCP として応答することを確認する。
 */
const binaryPath = Deno.args[0];
if (!binaryPath) {
  console.error("Usage: smoke_compiled_binary.ts <binary-path>");
  Deno.exit(1);
}

const child = new Deno.Command(binaryPath, {
  stdin: "piped",
  stdout: "piped",
  stderr: "piped",
}).spawn();

const encoder = new TextEncoder();
const writer = child.stdin.getWriter();

async function send(message: unknown): Promise<void> {
  await writer.write(encoder.encode(`${JSON.stringify(message)}\n`));
}

await send({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "compile-smoke", version: "0.0.0" },
  },
});
await send({
  jsonrpc: "2.0",
  method: "notifications/initialized",
});
await send({
  jsonrpc: "2.0",
  id: 2,
  method: "tools/list",
  params: {},
});

const decoder = new TextDecoder();
const lines: string[] = [];
let buffer = "";
const reader = child.stdout.getReader();
const timeoutId = setTimeout(() => {
  try {
    child.kill("SIGTERM");
  } catch {
    // すでに終了している場合がある
  }
}, 10_000);

try {
  while (lines.length < 2) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    for (const line of parts) {
      if (line.trim()) {
        lines.push(line);
      }
    }
  }
} finally {
  clearTimeout(timeoutId);
  await writer.close().catch(() => {});
  try {
    child.kill("SIGTERM");
  } catch {
    // すでに終了している場合がある
  }
}

const stderr = await child.stderr.text();
await child.status;

if (!stderr.includes("Baseline MCP Server running on stdio")) {
  console.error("stderr に起動メッセージがありません:");
  console.error(stderr);
  Deno.exit(1);
}

if (lines.length < 2) {
  console.error("stdout の JSON-RPC 応答が不足しています:");
  console.error(lines.join("\n"));
  Deno.exit(1);
}

const initialize = JSON.parse(lines[0]);
if (initialize.result?.serverInfo?.name !== "Baseline MCP Server") {
  console.error("initialize 応答が不正です:");
  console.error(lines[0]);
  Deno.exit(1);
}

const toolsList = JSON.parse(lines[1]);
const toolNames = toolsList.result?.tools?.map(
  (tool: { name: string }) => tool.name,
);
if (
  JSON.stringify(toolNames) !== JSON.stringify([
    "get_web_feature_baseline_status",
    "get_negated_browser_baseline_status",
  ])
) {
  console.error("tools/list 応答が不正です:");
  console.error(lines[1]);
  Deno.exit(1);
}

console.log("compiled binary smoke test passed");
