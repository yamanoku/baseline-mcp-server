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
    const expectedContent = `## chrome以外で使用可能な機能
Alternative style sheets, Ambient light sensor, attr(), Audio session, Audio and video tracks, autocorrect, background-clip: border-area, Barcode detector, Case-sensitive attribute selector, color-adjust, color-contrast(), ::column, Selection composed ranges, Contact picker, Content Index, contrast-color(), Reversed counter-reset, crisp-edges, cross-fade(), CSS object model (DOM level 2), Custom ellipses, Digital goods, display: contents, display: ruby, Early data, element(), execCommand(), EXT_disjoint_timer_query WebGL extension, fastSeek(), fit-content(), UI fonts, font-language-override, font-synthesis-position, font-width, @function, Gamepad VR hands and poses, getBoxQuads(), glyph-orientation-vertical, Global privacy control, Hanging punctuation, HTML media capture, if(), image(), ime-mode, Import assertions, Insertable streams for MediaStreamTrack, interactivity, inverted-colors media query, JPEG XL, line-clamp, <link rel="prefetch">, Magnetometer, Managed media source, margin-trim, mask-border, Masonry, Media element pseudo-classes, MediaController, MediaStream recording, <meta name="theme-color">, Mutation events, Open and closed selectors, overflow-clip-margin, OVR_multiview2 WebGL extension, path(), Portals, prefers-reduced-data media query, print-color-adjust, Private click measurement, ReadableStream.from(), reading-flow, RegExp.escape(), Rhythmic sizing, ruby-overhang, Screen orientation lock, ::scroll-button, smooth, speak, speak-as, Speech recognition grammar, stretch, SVG 1.1 (discouraged), SVG <script> async and defer, :target-within, Temporal, text-autospace, text-indent: each-line, text-indent: hanging, text-justify, TransformStream transformer cancel() method, Uint8Array base64 and hex conversion, video-dynamic-range media query, Exception references with exnref (WebAssembly), Web NFC, WebDriver, WebNN, WebRTC encoded transform, WebVR, WebVTT cue alignment, WebVTT regions`;
    assertEquals(result.content[0].text, expectedContent);
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
