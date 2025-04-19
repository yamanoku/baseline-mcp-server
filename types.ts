export type BaselineStatus = "widely" | "limited" | "newly" | "no_data";

type Browser = "chrome" | "edge" | "firefox" | "safari";

type BrowserImplementationsData = {
  date: string;
  status: "available";
  version: string;
};

export type WebFeature = {
  baseline: {
    status: BaselineStatus;
  };
  browser_implementations: {
    [key in Browser]?: BrowserImplementationsData;
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
