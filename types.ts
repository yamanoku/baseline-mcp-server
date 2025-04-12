export type BaselineStatus = "widely" | "limited" | "newly" | "no_data";

export type WebFeature = {
  baseline: {
    status: BaselineStatus;
  };
  name: string;
};

export type WebFeatureResponse = {
  data: WebFeature[];
};
