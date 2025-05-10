import type { WebFeature, WebFeatureResponse } from "../../types.ts";
import { APIURL } from "../../constants.ts";

/**
 * クエリ文字列に基づいてWeb Status APIから機能のBaseline情報を取得します。
 *
 * @param query - 特定のWeb機能を検索するための検索クエリ文字列、または検索クエリ文字列の配列
 * @returns WebFeatureオブジェクトの配列またはリクエストが失敗した場合はundefinedで解決するPromise
 * @throws エラーはコンソールに記録されますが、呼び出し元にはスローされません
 *
 * @remarks
 * - この関数はフェッチリクエストに5000msのタイムアウトを使用します
 * - クエリパラメータはAPI URLに追加される前にURLエンコードされます
 * - レスポンスがOKでない場合、エラーをスローする前にレスポンスボディがキャンセルされます
 * - 複数のクエリが配列として提供された場合、それらは「+OR+」でつなげられます（例：query1+OR+query2）
 */
export const getFeatureStatus = async (
  query: string | string[],
): Promise<WebFeature[] | undefined> => {
  try {
    // 配列の場合、ORで連結
    const queryString = Array.isArray(query)
      ? query.map((q) => encodeURIComponent(q)).join("+OR+")
      : encodeURIComponent(query);

    // 空のクエリの場合は早期リターン
    if (!queryString) return undefined;

    const url = `${APIURL}?q=${queryString}`;

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
