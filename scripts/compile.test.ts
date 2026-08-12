import { assertEquals } from "@std/assert";
import {
  ALLOW_NET,
  APP_NAME,
  COMPILE_TARGETS,
  compileArgs,
  ENTRYPOINT,
  findTarget,
  outputFileName,
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

Deno.test("Windows 向け出力ファイル名に .exe を付ける", () => {
  assertEquals(
    outputFileName("x86_64-pc-windows-msvc", ".exe"),
    `${APP_NAME}-x86_64-pc-windows-msvc.exe`,
  );
  assertEquals(
    outputFileName("x86_64-unknown-linux-gnu", ""),
    `${APP_NAME}-x86_64-unknown-linux-gnu`,
  );
});

Deno.test("コンパイル引数にパーミッションとエントリポイントを含める", () => {
  assertEquals(
    compileArgs({
      output: "dist/baseline-mcp-server",
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
      "dist/baseline-mcp-server",
      "--target",
      "x86_64-unknown-linux-gnu",
      ENTRYPOINT,
    ],
  );
});

Deno.test("未対応ターゲットは findTarget が undefined を返す", () => {
  assertEquals(findTarget("x86_64-unknown-linux-gnu")?.ext, "");
  assertEquals(findTarget("unknown-os"), undefined);
});
