import { getErrorCode, SubjectKeys, SeverityKeys } from "./ErrorCodes.js";

const ModelKeys = {
  flash25: "flash25",
  flashLite31: "flashLite31",
  flash35: "flash35",
  deepseekOcr: "deepseekOcr",
  deepseekV32: "deepseekV32",
  gemma426bA4bIt: "gemma426bA4bIt",
  kimiK2Thinking: "kimiK2Thinking",
  llama3370b: "llama3370b",
  llama4Maverick17b128e: "llama4Maverick17b128e",
  llama4Scout17b16e: "llama4Scout17b16e",
  minimaxM2: "minimaxM2",
  gptOss120b: "gptOss120b",
  gptOss20b: "gptOss20b",
  qwen3235b: "qwen3235b",
  qwen3Coder: "qwen3Coder",
  qwen3Next80bInstruct: "qwen3Next80bInstruct",
  qwen3Next80bThinking: "qwen3Next80bThinking",
  glm47: "glm47",
  glm5: "glm5",
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
  gsuCount: number;
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
  deepseekOcr: {
    name: "DeepSeek-OCR",
    tokensPerSecond: 3360,
    tokenAccumulationMinutes: 2,
    cacheFactor: 1,
    outputFactor: 4,
  },
  deepseekV32: {
    name: "DeepSeek-V3.2",
    tokensPerSecond: 1680,
    tokenAccumulationMinutes: 2,
    cacheFactor: 1,
    outputFactor: 4,
  },
  gemma426bA4bIt: {
    name: "Gemma 4 26B A4B IT",
    tokensPerSecond: 6725,
    tokenAccumulationMinutes: 2,
    cacheFactor: 1,
    outputFactor: 4,
  },
  kimiK2Thinking: {
    name: "Kimi K2 Thinking",
    tokensPerSecond: 1680,
    tokenAccumulationMinutes: 2,
    cacheFactor: 1,
    outputFactor: 4,
  },
  llama3370b: {
    name: "Llama 3.3 70B",
    tokensPerSecond: 1400,
    tokenAccumulationMinutes: 2,
    cacheFactor: 1,
    outputFactor: 1,
  },
  llama4Maverick17b128e: {
    name: "Llama 4 Maverick 17B-128E",
    tokensPerSecond: 2800,
    tokenAccumulationMinutes: 2,
    cacheFactor: 1,
    outputFactor: 4,
  },
  llama4Scout17b16e: {
    name: "Llama 4 Scout 17B-16E",
    tokensPerSecond: 4035,
    tokenAccumulationMinutes: 2,
    cacheFactor: 1,
    outputFactor: 3,
  },
  minimaxM2: {
    name: "MiniMax M2",
    tokensPerSecond: 3360,
    tokenAccumulationMinutes: 2,
    cacheFactor: 1,
    outputFactor: 4,
  },
  gptOss120b: {
    name: "OpenAI gpt-oss 120B",
    tokensPerSecond: 11205,
    tokenAccumulationMinutes: 2,
    cacheFactor: 1,
    outputFactor: 4,
  },
  gptOss20b: {
    name: "OpenAI gpt-oss 20B",
    tokensPerSecond: 14405,
    tokenAccumulationMinutes: 2,
    cacheFactor: 1,
    outputFactor: 4,
  },
  qwen3235b: {
    name: "Qwen3 235B",
    tokensPerSecond: 4035,
    tokenAccumulationMinutes: 2,
    cacheFactor: 1,
    outputFactor: 4,
  },
  qwen3Coder: {
    name: "Qwen3 Coder",
    tokensPerSecond: 1010,
    tokenAccumulationMinutes: 2,
    cacheFactor: 1,
    outputFactor: 4,
  },
  qwen3Next80bInstruct: {
    name: "Qwen3-Next-80B Instruct",
    tokensPerSecond: 6725,
    tokenAccumulationMinutes: 2,
    cacheFactor: 1,
    outputFactor: 8,
  },
  qwen3Next80bThinking: {
    name: "Qwen3-Next-80B Thinking",
    tokensPerSecond: 6725,
    tokenAccumulationMinutes: 2,
    cacheFactor: 1,
    outputFactor: 8,
  },
  glm47: {
    name: "GLM 4.7",
    tokensPerSecond: 1685,
    tokenAccumulationMinutes: 2,
    cacheFactor: 1,
    outputFactor: 4,
  },
  glm5: {
    name: "GLM 5",
    tokensPerSecond: 1010,
    tokenAccumulationMinutes: 2,
    cacheFactor: 1,
    outputFactor: 3,
  },
};

function isModelKey(key: string): key is ModelKey {
  return Object.values(ModelKeys).includes(key as ModelKey);
}

/* This is where model related calc */
const identifyModel = (
  modelKeyStr: string,
): { modelKey: ModelKey; gsuModel: GSUModel } => {
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
  const gsuModel: GSUModel = models[modelKey];
  return { modelKey, gsuModel };
};

/* generate and collect key token data */
const getGSUModelCalcs = (
  gsuModel: GSUModel,
  modelKey: ModelKey,
  gsuCount: number,
): GSUModelCalcs => {
  const perMinute = gsuModel.tokensPerSecond * 60 * gsuCount;
  return {
    modelKey,
    gsuCount,
    perMinute,
    tokenBucketSize: perMinute * gsuModel.tokenAccumulationMinutes,
  };
};

/***** convenient */
export const getDecorateGSUModel = (modelKeyStr: string, gsuCount: number = 1): DecoratedGSUModel => {
  const { modelKey, gsuModel } = identifyModel(modelKeyStr);
  const gsuModelCalcs = getGSUModelCalcs(gsuModel, modelKey, gsuCount);
  return { gsuModel, gsuModelCalcs };
};
