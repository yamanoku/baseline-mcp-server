import { getFeatureStatus } from "./helpers/getFeatureStatus.ts";
import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import type { BaselineStatus } from "../types.ts";

/**
 * Web機能APIへのクエリを投稿し、Baselineステータスに関する構造化された結果を返します。
 *
 * この関数はWeb機能に関連するクエリ文字列を受け取り、そのBaselineステータスを検索し、
 * ブラウザ間での機能のサポートレベルに関するフォーマットされた情報を返します。
 *
 * @param query - Baselineステータスを照会するWeb機能名
 *
 * @returns Promise<{ content: TextContent[] }>
 *   - 機能が見つかった場合: 機能のBaselineステータスに関するフォーマットされた情報を返します
 *   - 機能が見つからない場合: 情報が見つからなかったことを示すメッセージを返します
 *   - 例外エラーが発生した場合: エラーメッセージを返します
 *
 * @throws コンソールにエラーをログ出力することはありますが、常にレスポンスオブジェクトを返し、呼び出し元には例外をスローしません
 */
export const getWebFeatureBaselineStatusAsMCPContent = async (
  query: string,
): Promise<{ content: TextContent[] }> => {
  try {
    const webFeatures = await getFeatureStatus(query);

    if (webFeatures === undefined || webFeatures.length === 0) {
      return {
        content: [
          {
            type: "text",
            text:
              `「${query}」に関する情報は見つかりませんでした。別の機能名で試してみてください。`,
          },
        ],
      };
    }

    // Baselineカテゴリのリストを作成
    const baselineCategories = webFeatures
      .map((feature) => feature.baseline)
      .filter((value, index, self) => self.indexOf(value) === index);

    // BrowserImplementationsDataを取得
    const browserImplementationsData = webFeatures.map(
      (feature) => feature.browser_implementations,
    );

    // Usage情報を取得
    const usageInfo = webFeatures.map((feature) => feature.usage);

    const baselineCategoryDescriptions = {
      widely:
        "広くサポートされているWeb標準機能です。ほとんどのブラウザで安全に使用できます。",
      newly:
        "新しく標準化されたWeb機能です。主要なブラウザでサポートされ始めていますが、まだ普及途上です。",
      limited:
        "限定的にサポートされているWeb機能です。一部のブラウザでは使用できないか、フラグが必要な場合があります。",
      no_data:
        "現時点ではBaselineに含まれていないWeb機能です。ブラウザのサポート状況を個別に確認する必要があります。",
    } as const satisfies {
      [key in BaselineStatus]: string;
    };

    const formattedCategoryDescriptions = baselineCategories
      .filter((category) => baselineCategoryDescriptions[category.status])
      .map(
        (category) =>
          `##機能\n- ${query}: ${
            baselineCategoryDescriptions[category.status]
          }`,
      )
      .join("\n");

    const featureStatusList = webFeatures
      .map((feature) => `${feature.name}: ${feature.baseline.status}`)
      .join("\n- ");

    const browserSupportList = browserImplementationsData
      .map((browserData) => {
        const browserSupport = Object.entries(browserData).map(
          ([browser, data]) => {
            const version = data?.version || "N/A";
            const date = data?.date || "N/A";
            return `${browser}: ${version} (${date})`;
          },
        );
        return `${browserSupport.join(", ")}`;
      })
      .join("\n- ");

    const featureUsageList = usageInfo
      .map((usage) => {
        const usageData = Object.entries(usage).map(([_, data]) => {
          return `${data.daily ? data.daily * 100 : "N/A"}`;
        });
        return `${usageData.join(", ")}`;
      })
      .join("\n- ");

    const formattedResponse = [
      formattedCategoryDescriptions,
      `\n##ブラウザのサポート状況\n- ${browserSupportList}`,
      `\n##機能の使用状況\n- ${featureUsageList}`,
      webFeatures.length > 1 ? `\n##具体的な機能\n- ${featureStatusList}` : "",
    ]
      .join("\n")
      .trim();

    return {
      content: [
        {
          type: "text",
          text: formattedResponse,
        },
      ],
    };
  } catch (error) {
    console.error("Error processing event:", error);
    return {
      content: [
        {
          type: "text",
          text:
            "情報取得中にエラーが発生しました。しばらく経ってから再試行してください。",
        },
      ],
    };
  }
};
