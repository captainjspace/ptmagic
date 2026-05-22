/**
 * GSUModels.ts
 */

import { getErrorCode, SubjectKeys, SeverityKeys } from "./ErrorCodes.ts";
import * as process from "node:process";

/* Error Codes  */
const exits=SeverityKeys.exits;
const BAD_MODEL=SubjectKeys.BAD_MODEL;

export const ModelKeys = {
  flash25     :  "flash25",
  flashLite31 :  "flashLite31",
  flash35     :  "flash35"
} as const;

type ModelKey = typeof ModelKeys[keyof typeof ModelKeys];

interface Model {
  name:string;
  tokensPerSecond: number;
  tokenAccumulationMinutes: number | 2;
  cacheFactor: number;
  outputFactor:  number | 1;
}


/* Static Models */
export const models: Record<ModelKey,Model> =  {
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
  },
  flash35: {
    name: "Gemini 3.5 Flash",
    tokensPerSecond: 675,
    tokenAccumulationMinutes: 2,
    cacheFactor: 0.1,
    outputFactor: 6
  }
}

interface DecoratedModel extends Model {
  modelKey:ModelKey;
  perMinute:number;
  tokenBucketSize:number;
}

/* This is where model related calc */
export const modelCalc = (modelKey:ModelKey) => {

  if ( ! Object.hasOwn(models,modelKey)) {
    console.error([getErrorCode(exits, BAD_MODEL)]);
    process.exit(-1);
  }
  const model = models[modelKey];
  const perMinute=model.tokensPerSecond * 60;
  const tokenBucketSize = perMinute * model.tokenAccumulationMinutes;

  const modelCalc:DecoratedModel =  {...model, modelKey, perMinute, tokenBucketSize };
  return modelCalc;
}


