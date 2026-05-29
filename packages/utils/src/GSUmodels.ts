import { getErrorCode, SubjectKeys, SeverityKeys } from "./ErrorCodes.js";
import { type ModelKey, type DecoratedModel, type Model, ModelKeys } from "./types.js";

/* Error Codes  */
const exits = SeverityKeys.exits;
const BAD_MODEL = SubjectKeys.BAD_MODEL;

/* Static Models */
export const models: Record<ModelKey, Model> = {
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
export const modelCalc = (modelKeyStr: string): DecoratedModel => {
  if (!Object.hasOwn(models, modelKeyStr)) {
    const error = getErrorCode(exits, BAD_MODEL);
    console.error(error);
    throw new Error(error);
  }
  if (!isModelKey(modelKeyStr)) {
    throw new Error(`Invalid model key: ${modelKeyStr}`);
  }

  const modelKey: ModelKey = modelKeyStr;
  const model = models[modelKey];
  const perMinute = model.tokensPerSecond * 60;
  const tokenBucketSize = perMinute * model.tokenAccumulationMinutes;

  const modelCalc: DecoratedModel = {
    ...model,
    modelKey,
    perMinute,
    tokenBucketSize,
  };
  return modelCalc;
};
