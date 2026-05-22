// 1. Pass the configuration down to durationCalc
export const durationCalc = (calcTokens, customConfig = config) => {
  const timeFactors  = customConfig.timeFactors;
  const modelCalc    = calcTokens.modelCalc;
  const durationCalc = {timeFactors, modelCalc};

  return durationCalc;
}

// 2. Allow calcTokens to accept an incoming dynamic configuration
export const calcTokens = (customConfig = config) => {

  /* Calculation Inputs */
  // Use customConfig instead of the global config variable
  const site=siteCalc(customConfig.site); 

  const model=modelCalc(customConfig.model);

  const agentPattern=customConfig.agentPattern.name;
  const contextFactor=customConfig.agentPattern.contextFactor || 1;

  const promptTokens=customConfig.inputTokens.prompt.tokens;
  const isCached=customConfig.inputTokens.prompt.isContextCached;
  const contextHistoryTokens=customConfig.inputTokens.contextHistory.tokens;

  const outputAverageTokens=customConfig.outputTokens.average;
  const outputPeakTokens=customConfig.outputTokens.peak;

  /* ... Keep all your math lines exactly the same ... */

  const timeFactors = customConfig.timeFactors;

  /* ... Keep all the intermediate variable assignments the same ... */

  const calcTokens={
    Model: {
      ...model, 
      agentPattern, 
      contextFactor,
    },
    RawTokenInput: { promptTokens, contextHistoryTokens, baseInputTokens,  realInputTokens,
      outputAverageTokens, rawTokens, outputPeakTokens, peakRawTokens, 
    },
    AdjustedTokenInputs: {
      isCached,  promptCacheAdjustedTokens,  baseAdjustedInputTokens, loopAdjustedPromptTokens,
      loopAndCacheAdjustedPromptTokens,  loopAdjustedContextHistoryTokens, burndownInputTokens,
      outputAverageAdjustedTokens, outputPeakAdjustedTokens, burndownTokens, peakAdjustedTokens, 
    },
    TokenRatios: {
      rawRatio, peakRawRatio, 
      burndownRatio, peakAdjustedRatio,
    },
    UserCapacity: {
      ...timeFactors, 
      maxConcurrentInputUsers, concurrentInputBurn, concurrentResponseToken, 
      staggeredMinuteBurn, recoveryRate,
      AtSixSeconds,responsesPossible,remainingResponses, remainingTokens, AtTwenty,
      userCapacity, realUserFloor, 
      stableBurn, stableRecovery,
      PeakTokenBurner:  {
        p95TokenBurn,
        peakStableBurn,
        p95bucketHit,
        p95bucketRecoverySeconds
      },
    },
    SiteCapacity: {
        ...site,
        rushHourData,
        userGrid
    }
  };
  return calcTokens;
}

// 3. Update getTokenData to accept the config thread
export const getTokenData = (customConfig = config) => {   
  const calcData = calcTokens(customConfig);
  const time = durationCalc(calcData, customConfig);
  return {...calcData, ...time };
}
