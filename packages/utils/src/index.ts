import fileconfig from "./config.json" with { type: "json" };
import { modelCalc } from "./GSUmodels.ts";
import { siteCalc } from "./SiteModel.ts";
import type { TokenCalculatorConfig } from "./TokenCalculatorConfig.ts";
import { flattenObject } from "./flattenObject.ts";

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

let config: TokenCalculatorConfig = { ...fileconfig }; // JSON.parse(json);

export const calcTokens = (config: TokenCalculatorConfig) => {
  /* Calculation Inputs */
  //site
  const site = siteCalc(config.site);
  //mode
  const model = modelCalc(config.model);

  //agent pattern
  const agentPattern = config.agentPattern.name;
  const contextFactor = config.agentPattern.contextFactor || 1;

  //prompt + context
  const promptTokens = config.inputTokens.prompt.tokens;
  const isCached = config.inputTokens.prompt.isContextCached;
  const contextHistoryTokens = config.inputTokens.contextHistory.tokens;

  //output
  const outputAverageTokens = config.outputTokens.average;
  const outputPeakTokens = config.outputTokens.peak;

  /* Calculations */

  //base inputs
  const baseInputTokens = promptTokens + contextHistoryTokens;

  //context cache
  const promptCacheAdjustedTokens =
    promptTokens * (isCached ? model.cacheFactor : 1);
  const baseAdjustedInputTokens =
    promptCacheAdjustedTokens + contextHistoryTokens;

  //loop
  // informational
  const loopAdjustedPromptTokens = promptTokens * contextFactor;
  const loopAndCacheAdjustedPromptTokens =
    promptCacheAdjustedTokens * contextFactor;
  const loopAdjustedContextHistoryTokens = contextHistoryTokens * contextFactor;
  const checkInputTokens =
    loopAdjustedPromptTokens + loopAdjustedContextHistoryTokens;

  //
  const loopAdjustedInputTokens = baseInputTokens * contextFactor;
  const loopAndCacheAdjustedInputTokens =
    baseAdjustedInputTokens * contextFactor;

  const realInputTokens = loopAdjustedInputTokens;
  const burndownInputTokens = loopAndCacheAdjustedInputTokens;

  if (checkInputTokens !== realInputTokens) {
    console.warn("check token input loop factor");
  }

  //output adjusted for model
  const outputAverageAdjustedTokens = outputAverageTokens * model.outputFactor;
  const outputPeakAdjustedTokens = outputPeakTokens * model.outputFactor;

  // Raw Counts - ADK
  const rawTokens = realInputTokens + outputAverageTokens;
  const rawRatio = realInputTokens / outputAverageTokens;

  // Adjusted Raw - Burn Rate
  const burndownTokens = burndownInputTokens + outputAverageAdjustedTokens;
  const burndownRatio = burndownInputTokens / outputAverageAdjustedTokens;

  //peak
  const peakRawTokens = realInputTokens + outputPeakTokens;
  const peakRawRatio = realInputTokens / outputPeakTokens;

  const peakAdjustedTokens = burndownInputTokens + outputPeakAdjustedTokens;
  const peakAdjustedRatio = burndownInputTokens / outputPeakAdjustedTokens;

  const timeFactors = config.timeFactors;

  const maxConcurrentInputUsers = Math.floor(
    model.tokenBucketSize / burndownInputTokens,
  );
  const concurrentInputBurn = maxConcurrentInputUsers * burndownInputTokens;
  const concurrentResponseToken =
    maxConcurrentInputUsers * outputAverageAdjustedTokens;
  const recoveryRate = timeFactors.turnDuration * model.tokensPerSecond;
  const AtSixSeconds =
    model.tokenBucketSize - concurrentInputBurn + recoveryRate;
  const responsesPossible = Math.floor(
    AtSixSeconds / outputAverageAdjustedTokens,
  );
  const remainingResponses = Math.max(
    maxConcurrentInputUsers - responsesPossible,
  );
  const remainingTokens =
    AtSixSeconds - responsesPossible * outputAverageAdjustedTokens;
  const AtTwenty =
    remainingTokens +
    2 * recoveryRate -
    remainingResponses * outputAverageAdjustedTokens;
  const staggeredMinuteBurn =
    burndownTokens * timeFactors.turnsPerMinute * maxConcurrentInputUsers;
  const userCapacity =
    maxConcurrentInputUsers / (staggeredMinuteBurn / model.perMinute);
  const realUserFloor = Math.floor(userCapacity);
  const stableBurn =
    realUserFloor * burndownTokens * timeFactors.turnsPerMinute;
  const stableRecovery = model.perMinute - stableBurn;
  //const dailyBurn = model.perMinute *60 *24;
  const p95TokenBurn = peakAdjustedTokens * timeFactors.turnsPerMinute;
  //replace a normal user with peak
  const peakStableBurn =
    (stableBurn / realUserFloor) * (realUserFloor - 1) + p95TokenBurn;
  const p95bucketHit = model.perMinute - peakStableBurn;
  const p95bucketRecoverySeconds = p95bucketHit / stableRecovery;

  const timeToRecoveryExtraUser = () => {
    const rushHourTokenData = {
      debtStack: [0],
      tokenBurn: 0,
      recoveryOffset: 0,
      reserveTokens: model.tokenBucketSize,
      recoveryTime: 0,
      stacking: false,

      getTokenData() {
        const {
          recoveryOffset,
          reserveTokens,
          debtStack,
          stacking,
          recoveryTime,
          tokenBurn,
        } = rushHourTokenData;
        const accumulatedTokenDebt = debtStack.reduce(
          (a: number, b: number) => a + b,
          0,
        );

        return {
          tokenBurn,
          recoveryOffset,
          accumulatedTokenDebt,
          reserveTokens,
          stacking,
          recoveryTime,
        };
      },

      setStacking() {
        this.stacking = this.debtStack.length > 0 ? true : false;
      },
      addTotal(tokens: number) {
        this.tokenBurn += tokens;
        this.recoveryOffset += model.perMinute;
      },

      updateRecoveryTime() {
        this.recoveryTime = Math.abs(
          Math.ceil(
            (model.tokenBucketSize - this.reserveTokens) / recoveryRate,
          ),
        );
      },

      recoverReserve() {
        const reserve = this.reserveTokens + model.perMinute;
        this.reserveTokens = Math.min(reserve, model.tokenBucketSize);
      },
      burnReserve(tokens: number) {
        this.reserveTokens -= tokens;
        if (this.reserveTokens <= 0) throw Error("Out of Tokens");
        this.updateRecoveryTime();
      },

      /***
       * orchestrate
       * 1 recover the last minute
       * 2 track total overage and recover
       * 3 add to stack
       * 4 burn reserve
       */
      stackCalc(data: any) {
        this.recoverReserve();
        const minuteDebt = data.tokens - model.perMinute;
        this.addTotal(data.tokens);
        if (minuteDebt > 0) {
          this.debtStack.push(minuteDebt);
          this.setStacking();
        }
        try {
          this.burnReserve(minuteDebt);
        } catch (err) {
          console.log(err);
        } finally {
          return this.getTokenData();
        }
      },
    };

    /* Build these user capacity items */
    const minuteGrid: Record<number, GridRecord> = {};
    let rushHourData;

    for (let i = 1; i <= site.rushDaily - realUserFloor; i++) {
      const activeUsers = realUserFloor + i;
      const minuteBurn = stableBurn + i * burndownTokens;
      rushHourData = rushHourTokenData.stackCalc({ tokens: minuteBurn });

      const key = i as keyof typeof minuteGrid;
      const gridRecord: GridRecord = {
        activeUsers,
        minuteBurn,
        ...rushHourData,
      };
      minuteGrid[key] = gridRecord;

      if (rushHourData.reserveTokens <= 0) {
        console.debug("break");
        break;
      }
    }
    return { minuteGrid, rushHourData };
  };

  const { minuteGrid, rushHourData } = timeToRecoveryExtraUser();
  console.table(minuteGrid);

  const calcTokens = {
    Model: {
      ...model,
      agentPattern,
      contextFactor,
    },

    RawTokenInput: {
      promptTokens,
      contextHistoryTokens,
      baseInputTokens,
      realInputTokens,
      outputAverageTokens,
      rawTokens,
      outputPeakTokens,
      peakRawTokens,
    },

    AdjustedTokenInputs: {
      isCached,
      promptCacheAdjustedTokens,
      baseAdjustedInputTokens,
      loopAdjustedPromptTokens,
      loopAndCacheAdjustedPromptTokens,
      loopAdjustedContextHistoryTokens,
      burndownInputTokens,
      outputAverageAdjustedTokens,
      outputPeakAdjustedTokens,
      burndownTokens,
      peakAdjustedTokens,
    },

    TokenRatios: {
      rawRatio,
      peakRawRatio,
      burndownRatio,
      peakAdjustedRatio,
    },

    UserCapacity: {
      ...timeFactors,
      maxConcurrentInputUsers,
      concurrentInputBurn,
      concurrentResponseToken,
      staggeredMinuteBurn,
      recoveryRate,
      AtSixSeconds,
      responsesPossible,
      remainingResponses,
      remainingTokens,
      AtTwenty,
      userCapacity,
      realUserFloor,
      stableBurn,
      stableRecovery,
      PeakTokenBurner: {
        p95TokenBurn,
        peakStableBurn,
        p95bucketHit,
        p95bucketRecoverySeconds,
      },
    },
    SiteCapacity: {
      ...site,
      timeFactors,
      rushHourData,
      minuteGrid,
    },
  };
  return calcTokens;
};

//const currentConfig;
//const currentCalculatedState;
//const time;

//wrapper
export const getCalculatedTokens = (activeConfig?: TokenCalculatorConfig) => {
  return calcTokens(activeConfig ?? config);
};

export const tables = (calcData: any) => {
  console.table(flattenObject(calcData));
};

export const getCalcAsJSON = (calcData: any) => {
  return JSON.stringify(calcData, null, 4);
};

export const refreshTokenData = (activeConfig?: TokenCalculatorConfig) => {
  //validateInputs
  const calcData = getCalculatedTokens(activeConfig);
  const json = getCalcAsJSON(calcData);
  tables(calcData);
  console.log(json);

  return calcData;
};

export const getTokenData = (activeConfig: TokenCalculatorConfig) => {
  return getCalcAsJSON(getCalculatedTokens(activeConfig));
};

if (import.meta.main) {
  // Your main logic here
  refreshTokenData();
}

//defin erros
//
//const json=`
//{
//  "model": "flashLite31",
//  "inputTokens": {
//    "prompt": {
//      "tokens": 10000,
//      "isContextCached": true
//    },
//    "contextHistory": {
//      "tokens": 6000
//    }
//  },
//  "outputTokens": {
//    "average": 500,
//    "peak": 4400
//  },
//  "agentPattern": {
//    "name": "Single Agent Double Loop",
//    "contextFactor": 1
//  },
//  "timeFactors":{
//    "turnDuration": 6,
//    "turnsPerMinute": 3
//  },
//  "site" {
//    "dailyUsers": 250000,
//    "canary": 0.05,
//    "rush:" 0.20
//  }
//}
//`
