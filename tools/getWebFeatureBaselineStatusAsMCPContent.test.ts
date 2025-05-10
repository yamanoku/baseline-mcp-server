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

    // コンテンツの特定の部分をチェック（APIの値は変動するため、完全一致ではなく部分チェックに変更）
    const text = result.content[0].text;

    // 基本構造のチェック
    const hasFeatureHeading = text.includes("## 機能");
    assertEquals(hasFeatureHeading, true);

    // 機能名と説明のチェック
    const hasFeatureDescription = text.includes(
      "<dialog>: 広くサポートされているWeb標準機能です",
    );
    assertEquals(hasFeatureDescription, true);

    // サポート状況のチェック
    const hasSupportStatus = text.includes("## サポート状況");
    assertEquals(hasSupportStatus, true);

    // ブラウザサポート状況のチェック
    const hasBrowserSupport = text.includes("## ブラウザのサポート状況");
    assertEquals(hasBrowserSupport, true);

    // 主要ブラウザのチェック
    const hasMajorBrowsers = text.includes("chrome:") &&
      text.includes("firefox:") &&
      text.includes("safari:");
    assertEquals(hasMajorBrowsers, true);

    // 使用状況のチェック
    const hasUsageInfo = text.includes("## 機能の使用状況");
    assertEquals(hasUsageInfo, true);
  },
});

Deno.test({
  name: "getWebFeatureBaselineStatusAsMCPContent - Multiple Valid Queries",
  fn: async () => {
    const queries = ["dialog", "grid"];
    const result = await getWebFeatureBaselineStatusAsMCPContent(queries);
    assertExists(result);
    assertExists(result.content);
    assertExists(result.content[0]);
    assertExists(result.content[0].text);

    // 結果のテキストに dialog または grid のいずれかが含まれていることを確認
    const text = result.content[0].text;
    const containsFeature = text.includes("dialog") || text.includes("grid");
    assertEquals(containsFeature, true);

    // 複数の機能に関する結果が返されていることを確認
    const containsFeatureList = text.includes("## 具体的な機能");
    assertEquals(containsFeatureList, true);
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

Deno.test({
  name: "getWebFeatureBaselineStatusAsMCPContent - Multiple Invalid Queries",
  fn: async () => {
    const queries = ["invalid-element-1", "invalid-element-2"];
    const result = await getWebFeatureBaselineStatusAsMCPContent(queries);
    assertExists(result);
    assertEquals(
      result.content[0].text,
      '「invalid-element-1", "invalid-element-2」に関する情報は見つかりませんでした。別の機能名で試してみてください。',
    );
  },
});
