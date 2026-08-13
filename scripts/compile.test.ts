import { assertEquals } from "@std/assert";
import {
  ALLOW_NET,
  APP_NAME,
  COMPILE_TARGETS,
  compileArgs,
  ENTRYPOINT,
  findTarget,
  outputPath,
} from "./compile.ts";

Deno.test("Deno がサポートするクロスコンパイル対象をすべて列挙する", () => {
  assertEquals(
    COMPILE_TARGETS.map(({ target }) => target),
    [
      "x86_64-unknown-linux-gnu",
      "aarch64-unknown-linux-gnu",
      "x86_64-apple-darwin",
      "aarch64-apple-darwin",
      "x86_64-pc-windows-msvc",
      "aarch64-pc-windows-msvc",
    ],
  );
});

Deno.test("OSごとのディレクトリとアーキテクチャ名で出力する", () => {
  assertEquals(
    outputPath(COMPILE_TARGETS[0]),
    "linux/baseline-mcp-server-x86_64",
  );
  assertEquals(
    outputPath(COMPILE_TARGETS[1]),
    "linux/baseline-mcp-server-aarch64",
  );
  assertEquals(
    outputPath(COMPILE_TARGETS[2]),
    "macos/baseline-mcp-server-x86_64",
  );
  assertEquals(
    outputPath(COMPILE_TARGETS[3]),
    "macos/baseline-mcp-server-aarch64",
  );
  assertEquals(
    outputPath(COMPILE_TARGETS[4]),
    "windows/baseline-mcp-server-x86_64.exe",
  );
  assertEquals(
    outputPath(COMPILE_TARGETS[5]),
    "windows/baseline-mcp-server-aarch64.exe",
  );
});

Deno.test("コンパイル引数にパーミッションとエントリポイントを含める", () => {
  assertEquals(
    compileArgs({
      output: "dist/linux/baseline-mcp-server-x86_64",
      target: "x86_64-unknown-linux-gnu",
    }),
    [
      "compile",
      `--allow-net=${ALLOW_NET}`,
      "--app-name",
      APP_NAME,
      "--bundle",
      "--minify",
      "--output",
      "dist/linux/baseline-mcp-server-x86_64",
      "--target",
      "x86_64-unknown-linux-gnu",
      ENTRYPOINT,
    ],
  );
});

Deno.test("未対応ターゲットは findTarget が undefined を返す", () => {
  assertEquals(findTarget("x86_64-unknown-linux-gnu")?.os, "linux");
  assertEquals(findTarget("unknown-os"), undefined);
});
