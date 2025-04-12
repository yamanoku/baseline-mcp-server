import type { WebFeature, WebFeatureResponse } from "../../types.ts";
import { APIURL } from "../../constants.ts";

/**
 * クエリ文字列に基づいてWeb Status APIから機能のBaseline情報を取得します。
 *
 * @param query - 特定のWeb機能を検索するための検索クエリ文字列
 * @returns WebFeatureオブジェクトの配列またはリクエストが失敗した場合はundefinedで解決するPromise
 * @throws エラーはコンソールに記録されますが、呼び出し元にはスローされません
 *
 * @remarks
 * - この関数はフェッチリクエストに5000msのタイムアウトを使用します
 * - クエリパラメータはAPI URLに追加される前にURLエンコードされます
 * - レスポンスがOKでない場合、エラーをスローする前にレスポンスボディがキャンセルされます
 */
export const getFeatureStatus = async (
  query: string,
): Promise<WebFeature[] | undefined> => {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `${APIURL}?q=${encodedQuery}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`API request failed with status ${response.status}`);
    }

    const responseData: WebFeatureResponse = await response.json();
    return responseData.data;
  } catch (error) {
    console.error(error);
  }
};
