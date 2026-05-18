const json=`
{
  "model": "flash25",
  "inputTokens": {
    "prompt": {
      "tokens": 10000,
      "isContextCached": true
    },
    "contextHistory": {
      "tokens": 8000
    }
  },
  "outputTokens": {
    "average": 500,
    "peak": 4400
  },
  "agentPattern": {
    "name": "Single Agent Double Loop",
    "contextFactor": 2
  },
  "timeFactors":{
    "turnDuration": 6,
    "turnsPerMinute": 3
  }
}
`
const config= JSON.parse(json);

const models =  {
  flash25: {
    tokensPerSecond: 2690,
    tokenAccumulationMinutes: 2,
    cacheFactor: 0.1,
    outputFactor: 9
  },
  flashLite31: {
    tokensPerSecond: 4050,
    tokenAccumulationMinutes: 2,
    cacheFactor: 0.1,
    outputFactor: 6
  }
}
const CalcTokenErrorCodes = {
  exits: {
    BAD_MODEL: ` ${config.model} must be defined ${Object.keys(models)} `
  }
}

const modelCalc = (name) => {
  const modelName=name;
  if ( ! Object.hasOwn(models,modelName)) {
    console.error(CalcTokenErrorCodes.exits.BAD_MODEL);
    process.exit(-1);
  }

  const model = models[modelName];
  const perMinute=model.tokensPerSecond * 60;
  const tokenBucketSize = perMinute * model.tokenAccumulationMinutes;

  const modelCalc =  {...model, modelName, perMinute, tokenBucketSize };
  return modelCalc;
}

const durationCalc = (calcTokens) => {

   const timeFactors  = config.timeFactors;
   const modelCalc    = calcTokens.modelCalc;
   const durationCalc = {timeFactors, modelCalc};

   return durationCalc;
}

const calcTokens = () => {

  /* Calculation Inputs */
  //model
  const model=modelCalc(config.model);

  //agent pattern
  const agentPattern=config.agentPattern.name;
  const contextFactor=config.agentPattern.contextFactor || 1;

  //prompt + context
  const promptTokens=config.inputTokens.prompt.tokens;
  const isCached=config.inputTokens.prompt.isContextCached;
  const contextHistoryTokens=config.inputTokens.contextHistory.tokens;

  //output 
  const outputAverageTokens=config.outputTokens.average;
  const outputPeakTokens=config.outputTokens.peak;

  /* Calculations */ 

  //base inputs 
  const baseInputTokens=promptTokens + contextHistoryTokens;

  //context cache
  const promptCacheAdjustedTokens=promptTokens * ((isCached)?model.cacheFactor:1);  
  const baseAdjustedInputTokens=promptCacheAdjustedTokens+contextHistoryTokens;

  //loop
  // informational
  const loopAdjustedPromptTokens=promptTokens * contextFactor;
  const loopAndCacheAdjustedPromptTokens = promptCacheAdjustedTokens * contextFactor;
  const loopAdjustedContextHistoryTokens = contextHistoryTokens * contextFactor;
  const checkInputTokens=loopAdjustedPromptTokens+ loopAdjustedContextHistoryTokens;

  // 
  const loopAdjustedInputTokens=baseInputTokens * contextFactor;
  const loopAndCacheAdjustedInputTokens=baseAdjustedInputTokens * contextFactor;

  const realInputTokens=loopAdjustedInputTokens;
  const burndownInputTokens=loopAndCacheAdjustedInputTokens;


  if (checkInputTokens!==realInputTokens)  {
    console.warn("check token input loop factor");
  } 

  //output adjusted for model 
  const outputAverageAdjustedTokens=outputAverageTokens*model.outputFactor;
  const outputPeakAdjustedTokens=outputPeakTokens*model.outputFactor;

  // Raw Counts - ADK
  const rawTokens=realInputTokens+outputAverageTokens;
  const rawRatio=realInputTokens/outputAverageTokens;

  // Adjusted Raw - Burn Rate
  const burndownTokens=burndownInputTokens+outputAverageAdjustedTokens;
  const burndownRatio=burndownInputTokens/outputAverageAdjustedTokens;

  //peak
  const peakRawTokens=realInputTokens+outputPeakTokens;
  const peakRawRatio=realInputTokens/outputPeakTokens;

  const peakAdjustedTokens=burndownInputTokens+outputPeakAdjustedTokens;
  const peakAdjustedRatio=burndownInputTokens/outputPeakAdjustedTokens;
  
  const timeFactors = config.timeFactors;

  const maxConcurrentInputUsers = Math.floor(model.tokenBucketSize / burndownInputTokens);
  const concurrentInputBurn  = maxConcurrentInputUsers * burndownInputTokens;
  const concurrentResponseToken = maxConcurrentInputUsers * outputAverageAdjustedTokens;
  const recoveryRate = timeFactors.turnDuration * model.tokensPerSecond;
  const AtSixSeconds = model.tokenBucketSize - concurrentInputBurn + recoveryRate;
  const responsesPossible = Math.floor(AtSixSeconds/outputAverageAdjustedTokens);
  const remainingResponses = Math.max(maxConcurrentInputUsers-responsesPossible);
  const remainingTokens = AtSixSeconds - (responsesPossible * outputAverageAdjustedTokens);
  const AtTwenty = remainingTokens + (2*recoveryRate) - (remainingResponses*outputAverageAdjustedTokens);
  const staggeredMinuteBurn  = burndownTokens * timeFactors.turnsPerMinute * maxConcurrentInputUsers;
  const realUserCapacity =   maxConcurrentInputUsers / (staggeredMinuteBurn/model.perMinute); 

  const calcTokens={
    ...model, 
    agentPattern, 
    contextFactor,

    promptTokens, contextHistoryTokens, baseInputTokens,  realInputTokens,
    outputAverageTokens, rawTokens, outputPeakTokens, peakRawTokens, 

    rawRatio, peakRawRatio, 

    isCached,  promptCacheAdjustedTokens,  baseAdjustedInputTokens, loopAdjustedPromptTokens,
    loopAndCacheAdjustedPromptTokens,  loopAdjustedContextHistoryTokens, burndownInputTokens,
    outputAverageAdjustedTokens, outputPeakAdjustedTokens, burndownTokens, peakAdjustedTokens, 
    burndownRatio, peakAdjustedRatio,

    ...timeFactors, maxConcurrentInputUsers, concurrentInputBurn, concurrentResponseToken, 
    staggeredMinuteBurn, recoveryRate,
    AtSixSeconds,responsesPossible,remainingResponses, remainingTokens, AtTwenty,
    realUserCapacity 

  };
  return calcTokens;
}
const calcData=calcTokens();

const tables = () => {
  console.table(calcData);
  const time=durationCalc(calcData);
  console.table(time);
};
const dumpJSON = () => { 
  console.log(JSON.stringify(calcData,null,4));
};


tables()

dumpJSON();







