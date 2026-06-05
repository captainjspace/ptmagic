export interface TokenCalculatorConfig {
  model: string;
  gsuCount: number;
  inputTokens: {
    prompt: {
      tokens: number;
      isContextCached: boolean;
    };
    contextHistory: {
      tokens: number;
    };
  };
  outputTokens: {
    average: number;
    peak: number;
  };
  agentPattern: {
    name: string;
    contextFactor: number;
  };
  timeFactors: {
    turnDuration: number;
    turnsPerMinute: number;
  };
  site: {
    dailyUsers: number;
    canary: number;
    rush: number;
  };
}
