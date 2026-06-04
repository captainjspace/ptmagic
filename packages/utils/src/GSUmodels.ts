import { getErrorCode, SubjectKeys, SeverityKeys } from "./ErrorCodes.js";


const ModelKeys = {
  flash25: "flash25",
  flashLite31: "flashLite31",
  flash35: "flash35",
} as const;

export type ModelKey = (typeof ModelKeys)[keyof typeof ModelKeys];

export interface GSUModel {
  name: string;
  tokensPerSecond: number;
  tokenAccumulationMinutes: number | 2;
  cacheFactor: number;
  outputFactor: number | 1;
}

export interface GSUModelCalcs {
  modelKey: ModelKey;
  perMinute: number;
  tokenBucketSize: number;
}


export interface DecoratedGSUModel {
  gsuModel: GSUModel;
  gsuModelCalcs: GSUModelCalcs;
}

/* Error Codes  */
const exits = SeverityKeys.exits;
const BAD_MODEL = SubjectKeys.BAD_MODEL;

/* Static Models */
const models: Record<ModelKey, GSUModel> = {
  flash25: {
    name: "Gemini 2.5 Flash",
    tokensPerSecond: 2690,
    tokenAccumulationMinutes: 2,
    cacheFactor: 0.1,
    outputFactor: 9,
  },
  flashLite31: {
    name: "Gemini 3.1 Flash",
    tokensPerSecond: 4030,
    tokenAccumulationMinutes: 2,
    cacheFactor: 0.1,
    outputFactor: 6,
  },
  flash35: {
    name: "Gemini 3.5 Flash",
    tokensPerSecond: 675,
    tokenAccumulationMinutes: 2,
    cacheFactor: 0.1,
    outputFactor: 6,
  },
};

function isModelKey(key: string): key is ModelKey {
  return Object.values(ModelKeys).includes(key as ModelKey);
}


/* This is where model related calc */
const identifyModel = (modelKeyStr: string): { modelKey: ModelKey; gsuModel: GSUModel } => {

  if (!Object.hasOwn(models, modelKeyStr)) {
    const error = getErrorCode(exits, BAD_MODEL);
    console.error(error);
    throw new Error(error);
  }
  if (!isModelKey(modelKeyStr)) {
    throw new Error(`Invalid model key: ${modelKeyStr}`);
  }

  /* collect the valid model */
  const modelKey: ModelKey = modelKeyStr;
  const gsuModel: GSUModel  = models[modelKey];
  return { modelKey, gsuModel} ;
};


/* generate and collect key token data */
const getGSUModelCalcs = (gsuModel: GSUModel, modelKey: ModelKey): GSUModelCalcs => {
  const perMinute = gsuModel.tokensPerSecond * 60;
  return {
    modelKey,
    perMinute,
    tokenBucketSize: perMinute * gsuModel.tokenAccumulationMinutes,
  };
}

/***** convenient */
export const getDecorateGSUModel = (modelKeyStr: string):DecoratedGSUModel => {

  const { modelKey ,gsuModel } = identifyModel(modelKeyStr);
  const gsuModelCalcs = getGSUModelCalcs(gsuModel,modelKey);
  return { gsuModel , gsuModelCalcs };
}



