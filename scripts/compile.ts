/**
 * Baseline MCP Server を `deno compile` でスタンドアロンバイナリにする。
 *
 * 実行時パーミッションはコンパイル時に埋め込む必要がある。
 * @see https://docs.deno.com/runtime/reference/cli/compile/
 */
export const APP_NAME = "baseline-mcp-server";
export const ENTRYPOINT = "baseline-mcp-server.ts";
export const DIST_DIR = "dist";
export const ALLOW_NET = "api.webstatus.dev";

/** @see https://docs.deno.com/runtime/reference/cli/compile/#supported-targets */
export const COMPILE_TARGETS = [
  { target: "x86_64-unknown-linux-gnu", ext: "" },
  { target: "aarch64-unknown-linux-gnu", ext: "" },
  { target: "x86_64-apple-darwin", ext: "" },
  { target: "aarch64-apple-darwin", ext: "" },
  { target: "x86_64-pc-windows-msvc", ext: ".exe" },
  { target: "aarch64-pc-windows-msvc", ext: ".exe" },
] as const;

export type CompileTarget = typeof COMPILE_TARGETS[number];

export function outputFileName(
  target: string,
  ext: string,
): string {
  return `${APP_NAME}-${target}${ext}`;
}

export function hostOutputFileName(): string {
  const ext = Deno.build.os === "windows" ? ".exe" : "";
  return `${APP_NAME}${ext}`;
}

export function compileArgs(options: {
  output: string;
  target?: string;
}): string[] {
  const args = [
    "compile",
    `--allow-net=${ALLOW_NET}`,
    "--app-name",
    APP_NAME,
    "--bundle",
    "--minify",
    "--output",
    options.output,
  ];
  if (options.target) {
    args.push("--target", options.target);
  }
  args.push(ENTRYPOINT);
  return args;
}

export function findTarget(
  target: string,
): CompileTarget | undefined {
  return COMPILE_TARGETS.find((item) => item.target === target);
}

async function runCompile(args: string[]): Promise<void> {
  const command = new Deno.Command(Deno.execPath(), {
    args,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  const { code } = await command.output();
  if (code !== 0) {
    Deno.exit(code);
  }
}

async function writeChecksums(fileNames: string[]): Promise<void> {
  const lines: string[] = [];
  for (const fileName of [...fileNames].sort()) {
    const bytes = await Deno.readFile(`${DIST_DIR}/${fileName}`);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const hex = [...new Uint8Array(digest)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
    lines.push(`${hex}  ${fileName}`);
  }
  await Deno.writeTextFile(
    `${DIST_DIR}/SHA256SUMS`,
    `${lines.join("\n")}\n`,
  );
}

async function compileHost(): Promise<void> {
  const output = `${DIST_DIR}/${hostOutputFileName()}`;
  await runCompile(compileArgs({ output }));
}

async function compileTarget(item: CompileTarget): Promise<string> {
  const fileName = outputFileName(item.target, item.ext);
  await runCompile(compileArgs({
    output: `${DIST_DIR}/${fileName}`,
    target: item.target,
  }));
  return fileName;
}

async function compileAll(): Promise<void> {
  const fileNames: string[] = [];
  for (const item of COMPILE_TARGETS) {
    fileNames.push(await compileTarget(item));
  }
  await writeChecksums(fileNames);
}

async function main(): Promise<void> {
  await Deno.mkdir(DIST_DIR, { recursive: true });

  if (Deno.args.includes("--all")) {
    await compileAll();
    return;
  }

  const targetFlagIndex = Deno.args.indexOf("--target");
  if (targetFlagIndex !== -1) {
    const target = Deno.args[targetFlagIndex + 1];
    if (!target) {
      console.error("error: --target にはコンパイル対象を指定してください");
      Deno.exit(1);
    }
    const item = findTarget(target);
    if (!item) {
      const supported = COMPILE_TARGETS.map(({ target }) => target).join(
        ", ",
      );
      console.error(`error: 未対応のターゲットです: ${target}`);
      console.error(`supported: ${supported}`);
      Deno.exit(1);
    }
    await compileTarget(item);
    return;
  }

  await compileHost();
}

if (import.meta.main) {
  await main();
}
