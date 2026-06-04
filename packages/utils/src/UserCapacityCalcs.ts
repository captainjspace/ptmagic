import type {DecoratedGSUModel} from "./GSUmodels.js";
import type {TokenCalculatorConfig } from "./TokenCalculatorConfig.js";
import type {AdjustedTokenInputs} from "./TokenCruncher.js";



export interface TimeFactors  {
  turnDuration: number;
  turnsPerMinute: number;
};


export interface UserCapacity {
  timeFactors: TimeFactors;
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
  turnDuration: number;
  turnsPerMinute: number;

  peakTokenBurner: {
    p95TokenBurn: number;
    peakStableBurn: number;
    p95bucketHit: number;
    p95bucketRecoverySeconds: number;
  };
}
/* in order fill the responsw */

export const getUserCapacity = (
  tokenCalcConfig:TokenCalculatorConfig,
  decoratedGSUModel: DecoratedGSUModel, 
  adjustedTokens: AdjustedTokenInputs
): UserCapacity => {


  /* this cover what we need minute x minute */
  const tokenBucketSize = decoratedGSUModel.gsuModelCalcs.tokenBucketSize;
  const tokensPerSecond = decoratedGSUModel.gsuModel.tokensPerSecond;
  const perMinute       = decoratedGSUModel.gsuModelCalcs.perMinute;

  const burndownTokens = adjustedTokens.burndownTokens;
  const timeFactors = tokenCalcConfig.timeFactors; 
  const burndownInputTokens = adjustedTokens.burndownInputTokens;
  const outputAverageAdjustedTokens = adjustedTokens.outputAverageAdjustedTokens;
  const peakAdjustedTokens = adjustedTokens.peakAdjustedTokens;


  const { turnDuration, turnsPerMinute } = timeFactors;

  const maxConcurrentInputUsers = Math.floor(tokenBucketSize / burndownInputTokens);
  const concurrentInputBurn = maxConcurrentInputUsers * burndownInputTokens;
  const concurrentResponseToken = maxConcurrentInputUsers * outputAverageAdjustedTokens;
  const recoveryRate = turnDuration * tokensPerSecond;
  const AtSixSeconds = tokenBucketSize - concurrentInputBurn + recoveryRate;
  const responsesPossible = Math.floor(AtSixSeconds / outputAverageAdjustedTokens);
  const remainingResponses = Math.max(maxConcurrentInputUsers - responsesPossible, 0);
  const remainingTokens = AtSixSeconds - responsesPossible * outputAverageAdjustedTokens;
  const AtTwenty = remainingTokens + 2 * recoveryRate - remainingResponses * outputAverageAdjustedTokens;
  const staggeredMinuteBurn = burndownTokens * turnsPerMinute * maxConcurrentInputUsers;
  const userCapacityRatio = maxConcurrentInputUsers / (staggeredMinuteBurn / perMinute);
  const realUserFloor = Math.floor(userCapacityRatio);
  const stableBurn = realUserFloor * burndownTokens * turnsPerMinute;
  const stableRecovery = perMinute - stableBurn;
  const p95TokenBurn = peakAdjustedTokens * turnsPerMinute;
  const peakStableBurn = (stableBurn / (realUserFloor || 1)) * (Math.max(realUserFloor - 1, 0)) + p95TokenBurn;
  const p95bucketHit = perMinute - peakStableBurn;
  const p95bucketRecoverySeconds = p95bucketHit / (stableRecovery || 1);

  return {
    timeFactors,
    maxConcurrentInputUsers, concurrentInputBurn, concurrentResponseToken,
    staggeredMinuteBurn, recoveryRate, AtSixSeconds, responsesPossible,
    remainingResponses, remainingTokens, AtTwenty,
    userCapacity: userCapacityRatio, realUserFloor,
    stableBurn, stableRecovery, turnDuration, turnsPerMinute,
    peakTokenBurner: { p95TokenBurn, peakStableBurn, p95bucketHit, p95bucketRecoverySeconds },
  };
}

