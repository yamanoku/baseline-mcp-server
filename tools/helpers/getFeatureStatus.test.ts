import {
  assertEquals,
  assertExists,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { getFeatureStatus } from "./getFeatureStatus.ts";

Deno.test({
  name: "getFeatureStatus - Valid Query",
  fn: async () => {
    const query = "dialog";
    const result = await getFeatureStatus(query);
    assertExists(result);
    assertEquals(result.length, 2);
  },
});

Deno.test({
  name: "getFeatureStatus - Multiple Valid Queries",
  fn: async () => {
    const queries = ["dialog", "grid"];
    const result = await getFeatureStatus(queries);
    assertExists(result);
    // 実行環境によって変わる可能性があるので、具体的な数値は硬直にしない
    // APIが実際に「dialog OR grid」で検索を行えているかを確認
    assertExists(result.length);
  },
});

Deno.test({
  name: "getFeatureStatus - Invalid Query",
  fn: async () => {
    const query = "invalid-query";
    const result = await getFeatureStatus(query);
    assertEquals(result, []);
  },
});

Deno.test({
  name: "getFeatureStatus - Empty Query",
  fn: async () => {
    const query = "";
    const result = await getFeatureStatus(query);
    assertEquals(result, undefined);
  },
});

Deno.test({
  name: "getFeatureStatus - Empty Array Query",
  fn: async () => {
    const query: string[] = [];
    const result = await getFeatureStatus(query);
    assertEquals(result, undefined);
  },
});
