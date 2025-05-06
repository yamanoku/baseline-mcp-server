import { getFeatureStatus } from "./helpers/getFeatureStatus.ts";
import type { TextContent } from "@modelcontextprotocol/sdk/types.js";
import type { Browsers } from "../types.ts";

/**
 * 特定のブラウザを除外して、利用可能になった機能のBaselineステータスに関する構造化された結果を返します。
 *
 * この関数はWeb機能に関連するクエリ文字列とブラウザ名を受け取り、
 * 指定されたブラウザを除外したBaselineステータスを検索します。
 *
 * @param excludedBrowserName - 除外対象にするブラウザ名
 *
 * @returns Promise<{ content: TextContent[] }>
 *   - 機能が見つかった場合: 指定されたブラウザを除外した機能のBaselineステータスに関するフォーマットされた情報を返します
 *   - 機能が見つからない場合: 情報が見つからなかったことを示すメッセージを返します
 *   - 例外エラーが発生した場合: エラーメッセージを返します
 *
 * @throws コンソールにエラーをログ出力することはありますが、常にレスポンスオブジェクトを返し、呼び出し元には例外をスローしません
 */
export const getNegatedBrowserBaselineStatusAsMCPContent = async (
  excludedBrowserName: Browsers,
): Promise<{ content: TextContent[] }> => {
  try {
    // -available_on:${query}の形式でAPIに渡す
    const apiQuery = `-available_on:${excludedBrowserName}`;
    const webFeatures = await getFeatureStatus(apiQuery);

    if (webFeatures === undefined || webFeatures.length === 0) {
      return {
        content: [
          {
            type: "text",
            text:
              `「${excludedBrowserName}」を除外した利用可能な機能は見つかりませんでした。別のブラウザ名で試してみてください。`,
          },
        ],
      };
    }

    // 機能名のリストを作成
    const featureNames = webFeatures.map((feature) => feature.name).join(", ");

    const createFormattedResponse = (
      featureNames: string,
    ) => {
      return [
        `\n## ${excludedBrowserName}以外で使用可能な機能\n${featureNames}`,
      ]
        .join("\n")
        .trim();
    };

    const formattedResponse = createFormattedResponse(
      featureNames,
    );

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
