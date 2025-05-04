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
    const expectedContent = `## 機能
- <dialog>: 広くサポートされているWeb標準機能です。ほとんどのブラウザで安全に使用できます。
## サポート状況
### Newly available
2022-03-14
### Widely available
2024-09-14

## ブラウザのサポート状況
- chrome: 37 (2014-08-26), chrome_android: 37 (2014-09-03), edge: 79 (2020-01-15), firefox: 98 (2022-03-08), firefox_android: 98 (2022-03-08), safari: 15.4 (2022-03-14), safari_ios: 15.4 (2022-03-14)

## 機能の使用状況
- 6.990607`;
    assertEquals(result.content[0].text, expectedContent);
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
