import  type {TokenCalculatorConfig } from "./TokenCalculatorConfig.js";
import type { DecoratedGSUModel } from "./GSUmodels.js";

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

export interface TokenPack {
  rawTokenInput:RawTokenInput;
  AdjustedTokenInputs: AdjustedTokenInputs;
  tokenRatio: TokenRatios;
}

type crunchTokens = (tokenData:TokenCalculatorConfig, decoratedGSUModel: DecoratedGSUModel) =>TokenPack

export const crunchTokens  = (tokenData:TokenCalculatorConfig, decoratedGSUModel: DecoratedGSUModel) :TokenPack  => { 
  /*
   * We need 3 items - 
   * inputTokens  section 
   * and the model factors
   * the Agent loop and the physical cache limits
   *
   * sitting 3 levels...
   */
  const inputConfig=tokenData;
  
  /* Nested Data Inputs */
  const contextFactor = inputConfig.agentPattern.contextFactor;
  const { cacheFactor, outputFactor } = decoratedGSUModel.gsuModel

  ///////
  //prompt + context
  const promptTokens = tokenData.inputTokens.prompt.tokens;
  const isCached = tokenData.inputTokens.prompt.isContextCached;
  const contextHistoryTokens = tokenData.inputTokens.contextHistory.tokens;

  //output
  const outputAverageTokens = tokenData.outputTokens.average;
  const outputPeakTokens = tokenData.outputTokens.peak;

  /* Calculations */

  //base inputs
  const baseInputTokens = promptTokens + contextHistoryTokens;

  //context cache
  const promptCacheAdjustedTokens =
    promptTokens * (isCached ? cacheFactor : 1);
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
  const outputAverageAdjustedTokens = outputAverageTokens * outputFactor;
  const outputPeakAdjustedTokens = outputPeakTokens * outputFactor;

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


  ////////
//  const promptTokens = inputConfig.inputTokens.prompt.tokens;
//  const isCached = inputConfig.inputTokens.prompt.isContextCached;
//  const contextHistoryTokens = inputConfig.inputTokens.contextHistory.tokens;
//  const outputAverageTokens = inputConfig.outputTokens.average;
//  const outputPeakTokens = inputConfig.outputTokens.peak;
//  const baseInputTokens = promptTokens + contextHistoryTokens;
//  const promptCacheAdjustedTokens = promptTokens * (isCached ? model.gsuModel.cacheFactor : 1);
//  const baseAdjustedInputTokens = promptCacheAdjustedTokens + contextHistoryTokens;
//
//  const realInputTokens = baseInputTokens * contextFactor;
//  const burndownInputTokens = baseAdjustedInputTokens * contextFactor;
//
//  const outputAverageAdjustedTokens = outputAverageTokens * model.gsuModel.outputFactor;
//  const outputPeakAdjustedTokens = outputPeakTokens * model.gsuModel.outputFactor;
//
//  const rawTokens = realInputTokens + outputAverageTokens;
//  const rawRatio = realInputTokens / outputAverageTokens;
//  const burndownTokens = burndownInputTokens + outputAverageAdjustedTokens;
//  const burndownRatio = burndownInputTokens / outputAverageAdjustedTokens;
//  const peakRawTokens = realInputTokens + outputPeakTokens;
//  const peakRawRatio = realInputTokens / outputPeakTokens;
//  const peakAdjustedTokens = burndownInputTokens + outputPeakAdjustedTokens;
//  const peakAdjustedRatio = burndownInputTokens / outputPeakAdjustedTokens;
//
  const tokenPack = {
    rawTokenInput : { 
      promptTokens, contextHistoryTokens, baseInputTokens, realInputTokens, outputAverageTokens, 
      rawTokens, outputPeakTokens, peakRawTokens 
    },
    AdjustedTokenInputs: {
      baseAdjustedInputTokens, isCached, promptCacheAdjustedTokens,
      loopAdjustedPromptTokens, loopAndCacheAdjustedPromptTokens, loopAdjustedContextHistoryTokens,
      burndownInputTokens, outputAverageAdjustedTokens, outputPeakAdjustedTokens,
      burndownTokens, peakAdjustedTokens
    },
    tokenRatio: {
      rawRatio, peakRawRatio, burndownRatio, peakAdjustedRatio
    }
  }
  return tokenPack; 

}
