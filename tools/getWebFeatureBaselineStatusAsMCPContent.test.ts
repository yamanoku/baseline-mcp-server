import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { getWebFeatureBaselineStatusAsMCPContent } from "./getWebFeatureBaselineStatusAsMCPContent.ts";

Deno.test({
  name: "getWebFeatureBaselineStatusAsMCPContent - Valid Query",
  fn: async () => {
    const query = "<dialog>";
    const result = await getWebFeatureBaselineStatusAsMCPContent(query);
    assertExists(result);
    assertEquals(
      result.content[0].text,
      "- <dialog>: 広くサポートされているWeb標準機能です。ほとんどのブラウザで安全に使用できます。",
    );
  },
});

Deno.test({
  name: "getWebFeatureBaselineStatusAsMCPContent - Invalid Query",
  fn: async () => {
    const query = "invalid-element";
    const result = await getWebFeatureBaselineStatusAsMCPContent(query);
    assertExists(result);
    assertEquals(
      result.content[0].text,
      "「invalid-element」に関する情報は見つかりませんでした。別の機能名で試してみてください。",
    );
  },
});
