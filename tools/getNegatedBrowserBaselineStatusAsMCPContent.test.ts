import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { getNegatedBrowserBaselineStatusAsMCPContent } from "./getNegatedBrowserBaselineStatusAsMCPContent.ts";
import type { Browsers } from "../types.ts";

Deno.test({
  name: "getNegatedBrowserBaselineStatusAsMCPContent - Valid Browser Query",
  fn: async () => {
    const query = "chrome";
    const result = await getNegatedBrowserBaselineStatusAsMCPContent(query);
    assertExists(result);
    const text = result.content[0].text;
    assertEquals(text.includes("## chrome以外で使用可能な機能"), true);
    const hasKnownFeature = text.includes("Ambient light sensor") ||
      text.includes("Barcode detector");
    assertEquals(hasKnownFeature, true);
  },
});

Deno.test({
  name: "getNegatedBrowserBaselineStatusAsMCPContent - Invalid Browser Query",
  fn: async () => {
    const query = "invalid-browser" as Browsers;
    const result = await getNegatedBrowserBaselineStatusAsMCPContent(query);
    assertExists(result);
    assertEquals(
      result.content[0].text.includes("情報が見つかりませんでした") ||
        result.content[0].text.includes("は見つかりませんでした"),
      true,
      "Response should indicate that no information was found",
    );
  },
});
