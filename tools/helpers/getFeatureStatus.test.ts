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
