import fileconfig from "./config.json" with { type: "json" };

const json=`
{
  "model": "flashLite31",
  "inputTokens": {
    "prompt": {
      "tokens": 10000,
      "isContextCached": true
    },
    "contextHistory": {
      "tokens": 6000
    }
  },
  "outputTokens": {
    "average": 500,
    "peak": 4400
  },
  "agentPattern": {
    "name": "Single Agent Double Loop",
    "contextFactor": 1
  },
  "timeFactors":{
    "turnDuration": 6,
    "turnsPerMinute": 3
  },
  "site" {
    "dailyUsers": 250000,
    "canary": 0.05,
    "rush:" 0.20
  }
}
`
let config={...fileconfig};  // JSON.parse(json);

export const models =  {
  flash25: {
    name:"Gemini 2.5 Flash",
    tokensPerSecond: 2690,
    tokenAccumulationMinutes: 2,
    cacheFactor: 0.1,
    outputFactor: 9
  },
  flashLite31: {
    name: "Gemini 3.1 Flash",
    tokensPerSecond: 4030,
    tokenAccumulationMinutes: 2,
    cacheFactor: 0.1,
    outputFactor: 6
  }
}

export const CalcTokenErrorCodes = {
  exits: {
    BAD_MODEL: ` ${config.model} must be defined ${Object.keys(models)} `,
    SITE_MODEL: `${config.site} must be have %s `,
    SITE_VALUE: `${config.site} value of %s must be %s - %s`
  },
}

export const siteCalc = (siteConf) => {
  const site=siteConf;
  const siteMsg = [];
  const requiredKeys = ["dailyUsers","canary","rush"];
  requiredKeys.forEach( (k) =>  {
    if ( ! Object.hasOwn(site,k)) {
      siteMsg.push([CalcTokenErrorCodes.exits.SITE_MODEL, k]);
    }
    if (isNaN(site[k]) || site[k]<=0) {
      siteMsg.push([CalcTokenErrorCodes.exits.SITE_VALUE, k,"> than 0", site[k]]);
    }
  });

  if (siteMsg.length!=0) {
    siteMsg.forEach((m) => console.error(m));
    process.exit(-1);
  }

  const canarySize = site.dailyUsers * site.canary;
  const canaryHour = canarySize / 24;
  const canaryMinute = Math.ceil(canaryHour / 60);

  const rushSize = canarySize * site.rush;
  const rushDaily = Math.ceil(rushSize / 60);

  const siteCalc = {...site, canarySize, canaryHour, canaryMinute, rushSize, rushDaily};
  return siteCalc;
}

export const modelCalc = (name) => {
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

export const durationCalc = (calcTokens) => {

  const timeFactors  = config.timeFactors;
  const modelCalc    = calcTokens.modelCalc;
  const durationCalc = {timeFactors, modelCalc};

  return durationCalc;
}

export const calcTokens = () => {

  /* Calculation Inputs */
  //site
  const site=siteCalc(config.site); 

  //mode
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
  const userCapacity =   maxConcurrentInputUsers / (staggeredMinuteBurn/model.perMinute); 
  const realUserFloor = Math.floor(userCapacity);
  const stableBurn = realUserFloor * burndownTokens * timeFactors.turnsPerMinute;
  const stableRecovery =  model.perMinute - stableBurn;
  //const dailyBurn = model.perMinute *60 *24;
  const p95TokenBurn = peakAdjustedTokens * timeFactors.turnsPerMinute;
  //replace a normal user with peak
  const peakStableBurn = ( stableBurn / realUserFloor ) * (realUserFloor-1) + p95TokenBurn;
  const p95bucketHit = model.perMinute - peakStableBurn;
  const p95bucketRecoverySeconds = p95bucketHit/stableRecovery;

  const timeToRecoveryExtraUser = () => {

    const rushHourTokenData = {

      debtStack: [],
      tokenBurn: 0,
      recoveryOffset: 0,
      reserveTokens: model.tokenBucketSize,
      recoveryTime: 0,
      stacking: false,

      getTokenData() {
        const { recoveryOffset, reserveTokens, debtStack, stacking, recoveryTime, tokenBurn } = rushHourTokenData;
        const accumulatedTokenDebt = debtStack.reduce( (a,b) => a+b,0 );

        return { 
          tokenBurn, 
          recoveryOffset, 
          accumulatedTokenDebt, 
          reserveTokens, 
          stacking,
          recoveryTime
        } 
      },

      setStacking() { 
        this.stacking=(this.debtStack.length>0)? true : false 
      },
      addTotal(tokens){
        this.tokenBurn+=tokens;
        this.recoveryOffset+=model.perMinute
      },

      updateRecoveryTime(){
        this.recoveryTime = Math.abs(Math.ceil( (model.tokenBucketSize-this.reserveTokens) / recoveryRate ));
      },

      recoverReserve(){
        const reserve = this.reserveTokens+model.perMinute;
        console.log(reserve, model.tokenBucketSize);
        this.reserveTokens = Math.min(reserve, model.tokenBucketSize);
      },
      burnReserve(tokens){
        this.reserveTokens-=tokens;
        if (this.reserveTokens<=0) throw Error("Out of Tokens");
        this.updateRecoveryTime()
      },

      /***
       * orchestrate  
       * 1 recover the last minute
       * 2 track total overage and recover
       * 3 add to stack
       * 4 burn reserve
       */
      stackCalc(data){
        this.recoverReserve();
        const minuteDebt = data.tokens-model.perMinute;
        this.addTotal(data.tokens)
        if (minuteDebt>0) {
          this.debtStack.push(minuteDebt);
          this.setStacking();
        }
        try {
          this.burnReserve(minuteDebt);
        } catch (err) {
          console.log(err.message);
        } finally {
          return this.getTokenData();
        }
      },
    };



    const userGrid ={};
    let rushHourData;
    for (let i=1; i<=(site.rushDaily-realUserFloor); i++) {
      const activeUsers=realUserFloor+i;
      const minuteBurn = stableBurn + (i* burndownTokens);
      rushHourData=rushHourTokenData.stackCalc({tokens: minuteBurn})
      const gridRecord = {  activeUsers, minuteBurn, ...rushHourData};
      if (process.env.DEBUG===1) {
        console.log(userGrid);
      }
      userGrid[i]=gridRecord;
      if (rushHourData.reserveTokens<=0) {
        console.debug("break");
        break;
      }
    }
    return { userGrid, rushHourData };
  };

  const {userGrid,rushHourData} = timeToRecoveryExtraUser();
  console.table(userGrid);
  console.dirXml(userGrid)

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

const calcData=calcTokens();
const time=durationCalc(calcData);

export const getTokenData = {...calcData, ...time }

const flattenObject = (obj, parent = '', res = {}) => {
  for (let key in obj) {
    const propName = parent ? `${parent}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      flattenObject(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
};

export const tables = () => {
  console.table(flattenObject(calcData));
  console.table(time);
};

export const getCalcAsJSON = () => { 
  return JSON.stringify(calcData,null,4)
};

if (import.meta.main) {
  // Your main logic here
  tables()
}






