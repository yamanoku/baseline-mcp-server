export type BaselineStatus = "widely" | "limited" | "newly" | "no_data";

export const BROWSERS = ["chrome", "edge", "firefox", "safari"] as const;
export type Browsers = typeof BROWSERS[number];

type BrowserImplementationsData = {
  date: string;
  status: "available";
  version: string;
};

export type WebFeature = {
  baseline: {
    status: BaselineStatus;
    high_date?: string;
    low_date?: string;
  };
  browser_implementations: {
    [key in Browsers]?: BrowserImplementationsData;
  };
  usage: {
    chrome: {
      daily?: number;
    };
  };
  name: string;
};

export type WebFeatureResponse = {
  data: WebFeature[];
};
