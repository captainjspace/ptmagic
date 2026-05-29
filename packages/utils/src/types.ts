import type { TokenCalculatorConfig } from "./TokenCalculatorConfig.js";

export const ModelKeys = {
  flash25: "flash25",
  flashLite31: "flashLite31",
  flash35: "flash35",
} as const;

export type ModelKey = (typeof ModelKeys)[keyof typeof ModelKeys];

export interface Model {
  name: string;
  tokensPerSecond: number;
  tokenAccumulationMinutes: number | 2;
  cacheFactor: number;
  outputFactor: number | 1;
}

export interface DecoratedModel extends Model {
  modelKey: ModelKey;
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
  rushHourData:
    | {
        tokenBurn: number;
        recoveryOffset: number;
        accumulatedTokenDebt: number;
        reserveTokens: number;
        stacking: boolean;
        recoveryTime: number;
      }
    | undefined;
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
