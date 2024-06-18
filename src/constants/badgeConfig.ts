// badgeConfig.ts
export interface BadgeConfig {
  text: string;
  color: string;
}

export const badgeConfig: { [key: string]: BadgeConfig } = {
  isTotals: {
    text: "TOTALS",
    color: "primary.light",
  },
  isComputationsOnly: {
    text: "INSIGHT",
    color: "secondary.light",
  },
  isEnableOtherBucket: {
    text: "HIDE_OTHER_CATEGORY",
    color: "secondary.light",
  },
  // Add more badges here
};
