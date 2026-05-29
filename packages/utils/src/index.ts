import type { TokenCalculatorConfig } from "./TokenCalculatorConfig";

export const defaultConfig: TokenCalculatorConfig = {
  model: "flashLite31",
  inputTokens: {
    prompt: {
      tokens: 12000,
      isContextCached: true
    },
    contextHistory: {
      tokens: 4000
    }
  },
  outputTokens: {
    average: 250,
    peak: 4400
  },
  agentPattern: {
    name: "Single Agent Double Loop",
    contextFactor: 2
  },
  timeFactors: {
    turnDuration: 6,
    turnsPerMinute: 3
  },
  site: {
    dailyUsers: 250000,
    canary: 0.05,
    rush: 0.2
  }
};

export interface Model {
  name: string;
  tokensPerSecond: number;
  tokenAccumulationMinutes: number | 2;
  cacheFactor: number;
  outputFactor: number | 1;
}

export interface DecoratedModel extends Model {
  modelKey: string;
  perMinute: number;
  tokenBucketSize: number;
  agentPattern?: string;
  contextFactor?: number;
}

export interface RawTokenInput {
  promptTokens: number;
  contextHistoryTokens: number;
  baseInputTokens: number;
  realInputTokens: number;
  outputAverageTokens: number;
  rawTokens: number;
  outputPeakTokens: number;
  peakRawTokens: number;
}

export interface AdjustedTokenInputs {
  isCached: boolean;
  promptCacheAdjustedTokens: number;
  baseAdjustedInputTokens: number;
  loopAdjustedPromptTokens: number;
  loopAndCacheAdjustedPromptTokens: number;
  loopAdjustedContextHistoryTokens: number;
  burndownInputTokens: number;
  outputAverageAdjustedTokens: number;
  outputPeakAdjustedTokens: number;
  burndownTokens: number;
  peakAdjustedTokens: number;
}

export interface TokenRatios {
  rawRatio: number;
  peakRawRatio: number;
  burndownRatio: number;
  peakAdjustedRatio: number;
}

export interface UserCapacity {
  maxConcurrentInputUsers: number;
  concurrentInputBurn: number;
  concurrentResponseToken: number;
  staggeredMinuteBurn: number;
  recoveryRate: number;
  AtSixSeconds: number;
  responsesPossible: number;
  remainingResponses: number;
  remainingTokens: number;
  AtTwenty: number;
  userCapacity: number;
  realUserFloor: number;
  stableBurn: number;
  stableRecovery: number;
  peakTokenBurner: {
    p95TokenBurn: number;
    peakStableBurn: number;
    p95bucketHit: number;
    p95bucketRecoverySeconds: number;
  };
  turnDuration: number;
  turnsPerMinute: number;
}

export interface GridRecord {
  activeUsers: number;
  tokenBurn: number;
  recoveryOffset: number;
  accumulatedTokenDebt: number;
  reserveTokens: number;
  stacking: boolean;
  recoveryTime: number;
  minuteBurn: number;
}

export interface SiteCapacity {
  timeFactors: {
    turnDuration: number;
    turnsPerMinute: number;
  };
  rushHourData: any;
  minuteGrid: Record<number, GridRecord>;
  canarySize: number;
  canaryHour: number;
  canaryMinute: number;
  rushSize: number;
  rushDaily: number;
  dailyUsers: number;
  canary: number;
  rush: number;
}

export interface TokenCalcResponse {
  config: TokenCalculatorConfig;
  model: DecoratedModel;
  rawTokenInput: RawTokenInput;
  adjustedTokenInputs: AdjustedTokenInputs;
  tokenRatios: TokenRatios;
  userCapacity: UserCapacity;
  siteCapacity: SiteCapacity;
}

import { modelCalc } from "./GSUmodels";
import { siteCalc } from "./SiteModel";
import { flattenObject } from "./flattenObject";

export const calcTokens = (inputConfig: TokenCalculatorConfig): TokenCalcResponse => {
  const model = modelCalc(inputConfig.model);
  const site = siteCalc(inputConfig.site);
  const timeFactors = inputConfig.timeFactors;
  const agentPattern = inputConfig.agentPattern.name;
  const contextFactor = inputConfig.agentPattern.contextFactor || 1;

  const promptTokens = inputConfig.inputTokens.prompt.tokens;
  const isCached = inputConfig.inputTokens.prompt.isContextCached;
  const contextHistoryTokens = inputConfig.inputTokens.contextHistory.tokens;
  const outputAverageTokens = inputConfig.outputTokens.average;
  const outputPeakTokens = inputConfig.outputTokens.peak;

  const baseInputTokens = promptTokens + contextHistoryTokens;
  const promptCacheAdjustedTokens = promptTokens * (isCached ? model.cacheFactor : 1);
  const baseAdjustedInputTokens = promptCacheAdjustedTokens + contextHistoryTokens;

  const realInputTokens = baseInputTokens * contextFactor;
  const burndownInputTokens = baseAdjustedInputTokens * contextFactor;

  const outputAverageAdjustedTokens = outputAverageTokens * model.outputFactor;
  const outputPeakAdjustedTokens = outputPeakTokens * model.outputFactor;

  const rawTokens = realInputTokens + outputAverageTokens;
  const rawRatio = realInputTokens / outputAverageTokens;
  const burndownTokens = burndownInputTokens + outputAverageAdjustedTokens;
  const burndownRatio = burndownInputTokens / outputAverageAdjustedTokens;
  const peakRawTokens = realInputTokens + outputPeakTokens;
  const peakRawRatio = realInputTokens / outputPeakTokens;
  const peakAdjustedTokens = burndownInputTokens + outputPeakAdjustedTokens;
  const peakAdjustedRatio = burndownInputTokens / outputPeakAdjustedTokens;

  const maxConcurrentInputUsers = Math.floor(model.tokenBucketSize / burndownInputTokens);
  const concurrentInputBurn = maxConcurrentInputUsers * burndownInputTokens;
  const recoveryRate = timeFactors.turnDuration * model.tokensPerSecond;
  const AtSixSeconds = model.tokenBucketSize - concurrentInputBurn + recoveryRate;
  const responsesPossible = Math.floor(AtSixSeconds / outputAverageAdjustedTokens);
  const remainingResponses = Math.max(maxConcurrentInputUsers - responsesPossible, 0);
  const remainingTokens = AtSixSeconds - responsesPossible * outputAverageAdjustedTokens;
  const AtTwenty = remainingTokens + 2 * recoveryRate - remainingResponses * outputAverageAdjustedTokens;
  const staggeredMinuteBurn = burndownTokens * timeFactors.turnsPerMinute * maxConcurrentInputUsers;
  const userCapacity = maxConcurrentInputUsers / (staggeredMinuteBurn / model.perMinute);
  const realUserFloor = Math.floor(userCapacity);
  const stableBurn = realUserFloor * burndownTokens * timeFactors.turnsPerMinute;
  const stableRecovery = model.perMinute - stableBurn;

  const p95TokenBurn = peakAdjustedTokens * timeFactors.turnsPerMinute;
  const peakStableBurn = (stableBurn / (realUserFloor || 1)) * (Math.max(realUserFloor - 1, 0)) + p95TokenBurn;
  const p95bucketHit = model.perMinute - peakStableBurn;
  const p95bucketRecoverySeconds = p95bucketHit / (stableRecovery || 1);

  // Simple Rush Hour Calc Inline to avoid external imports
  const minuteGrid: Record<number, GridRecord> = {};
  let reserve = model.tokenBucketSize;
  let accumulatedDebt = 0;

  for (let i = 1; i <= site.rushDaily - realUserFloor; i++) {
    const activeUsers = realUserFloor + i;
    const minuteBurn = stableBurn + i * burndownTokens;
    const minuteDebt = Math.max(0, minuteBurn - model.perMinute);
    
    accumulatedDebt += minuteDebt;
    reserve = Math.min(model.tokenBucketSize, Math.max(0, reserve + model.perMinute - minuteBurn));
    
    minuteGrid[i] = {
      activeUsers,
      minuteBurn,
      recoveryOffset: model.perMinute,
      accumulatedTokenDebt: accumulatedDebt,
      reserveTokens: reserve,
      stacking: minuteDebt > 0,
      recoveryTime: Math.abs(Math.ceil((model.tokenBucketSize - reserve) / (recoveryRate || 1))),
      minuteBurn: minuteBurn
    };

    if (reserve <= 0) break;
  }

  return {
    config: inputConfig,
    model: { ...model, agentPattern, contextFactor, modelKey: inputConfig.model },
    rawTokenInput: { promptTokens, contextHistoryTokens, baseInputTokens, realInputTokens, outputAverageTokens, rawTokens, outputPeakTokens, peakRawTokens },
    adjustedTokenInputs: { isCached, promptCacheAdjustedTokens, baseAdjustedInputTokens, loopAdjustedPromptTokens: promptTokens * contextFactor, loopAndCacheAdjustedPromptTokens: promptCacheAdjustedTokens * contextFactor, loopAdjustedContextHistoryTokens, burndownInputTokens, outputAverageAdjustedTokens, outputPeakAdjustedTokens, burndownTokens, peakAdjustedTokens },
    tokenRatios: { rawRatio, peakRawRatio, burndownRatio, peakAdjustedRatio },
    userCapacity: { ...timeFactors, maxConcurrentInputUsers, concurrentInputBurn, concurrentResponseToken: maxConcurrentInputUsers * outputAverageAdjustedTokens, staggeredMinuteBurn, recoveryRate, AtSixSeconds, responsesPossible, remainingResponses, remainingTokens, AtTwenty, userCapacity, realUserFloor, stableBurn, stableRecovery, peakTokenBurner: { p95TokenBurn, peakStableBurn, p95bucketHit, p95bucketRecoverySeconds } },
    siteCapacity: { ...site, timeFactors, rushHourData: minuteGrid[Object.keys(minuteGrid).length], minuteGrid }
  };
};

export const getCalculatedTokens = (activeConfig?: TokenCalculatorConfig) => {
  return calcTokens(activeConfig ?? defaultConfig);
};

export const tables = (calcData: any) => console.table(flattenObject(calcData));
export const getCalcAsJSON = (calcData: any) => JSON.stringify(calcData, null, 4);

export const refreshTokenData = (activeConfig?: TokenCalculatorConfig) => {
  const calcData = getCalculatedTokens(activeConfig);
  tables(calcData);
  return calcData;
};

export const getTokenData = (activeConfig?: TokenCalculatorConfig) => {
  return getCalcAsJSON(getCalculatedTokens(activeConfig ?? defaultConfig));
};

if (import.meta.main) {
  // Your main logic here
  refreshTokenData();
}
