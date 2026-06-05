import type { TokenCalculatorConfig } from "./TokenCalculatorConfig.js";
import type { TokenPack } from "./TokenCruncher.js";
import type { UserCapacity } from "./UserCapacityCalcs.js";
import type { DecoratedGSUModel } from "./GSUmodels.js";
import type { DecoratedSiteModel } from "./SiteModel.js";
import type { RushHourCapacity } from "./RushHourCalc.js";
export type { GridRecord } from "./RushHourCalc.js";
export type { TokenCalculatorConfig } from "./TokenCalculatorConfig.js";
export type { ModelKey } from "./GSUmodels.js";
export { flattenObject } from "./flattenObject.js";

import { getUserCapacity } from "./UserCapacityCalcs.js";
import { getDecorateGSUModel } from "./GSUmodels.js";
import { siteCalc } from "./SiteModel.js";
import { flattenObject } from "./flattenObject.js";
import { crunchTokens } from "./TokenCruncher.js";
import { calculateRushHour } from "./RushHourCalc.js";

export const defaultConfig: TokenCalculatorConfig = {
  model: "flashLite31",
  gsuCount: 1,
  inputTokens: {
    prompt: { tokens: 12000, isContextCached: true },
    contextHistory: { tokens: 4000 },
  },
  outputTokens: { average: 250, peak: 4400 },
  agentPattern: { name: "Single Agent Double Loop", contextFactor: 2 },
  timeFactors: { turnDuration: 6, turnsPerMinute: 3 },
  site: { dailyUsers: 250000, canary: 0.05, rush: 0.2 },
};
export interface Model {
  name: string;
  tokensPerSecond: number;
  tokenAccumulationMinutes: number;
  cacheFactor: number;
  outputFactor: number;
}

export interface TokenCalcResponse {
  inputConfig: TokenCalculatorConfig;
  decoratedGSUModel: DecoratedGSUModel;
  tokenPack: TokenPack;
  userCapacity: UserCapacity;
  rushHourCapacity: RushHourCapacity;
  decoratedSiteModel: DecoratedSiteModel;
}

export const calcTokens = (
  inputConfig: TokenCalculatorConfig,
): TokenCalcResponse => {
  const decoratedSiteModel = siteCalc(inputConfig.site);
  const decoratedGSUModel = getDecorateGSUModel(inputConfig.model, inputConfig.gsuCount ?? 1);
  const tokenPack = crunchTokens(inputConfig, decoratedGSUModel);
  const userCapacity = getUserCapacity(
    inputConfig,
    decoratedGSUModel,
    tokenPack.AdjustedTokenInputs,
  );

  const rushHourCapacity = calculateRushHour({
    decoratedSiteModel,
    decoratedGSUModel,
    userCapacity,
    adjustedTokens: tokenPack.AdjustedTokenInputs,
  });
  return {
    inputConfig,
    decoratedGSUModel,
    decoratedSiteModel,
    tokenPack,
    userCapacity,
    rushHourCapacity,
  };
};

export const getCalculatedTokens = (activeConfig?: TokenCalculatorConfig) => {
  return calcTokens(activeConfig ?? defaultConfig);
};

export const tables = (calcData: unknown) =>
  console.table(flattenObject(calcData));
export const getCalcAsJSON = (calcData: unknown) =>
  JSON.stringify(calcData, null, 4);

export const refreshTokenData = (activeConfig?: TokenCalculatorConfig) => {
  const calcData = getCalculatedTokens(activeConfig);
  return calcData;
};

export const getTokenData = (activeConfig?: TokenCalculatorConfig) => {
  return getCalcAsJSON(getCalculatedTokens(activeConfig ?? defaultConfig));
};

if (import.meta.main) {
  const _calcData = refreshTokenData();
  console.log("\n── Ramp grid (1 extra user/min until drain) ──");
  console.table(_calcData.rushHourCapacity.minuteGrid);
  console.log("\n── Hour grid (60-min base + 3-min peak burst at min 20) ──");
  console.table(_calcData.rushHourCapacity.hourGrid);
  tables(_calcData);
  console.log(getCalcAsJSON(_calcData));
}
