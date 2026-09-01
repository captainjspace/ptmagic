import type { TokenCalculatorConfig, ModelKey } from "@ptcalc/utils";

const MODELS: { key: ModelKey; label: string }[] = [
  { key: "flash25", label: "Gemini 2.5 Flash" },
  { key: "flashLite31", label: "Gemini 3.1 Flash" },
  { key: "flash35", label: "Gemini 3.5 Flash" },
  { key: "deepseekOcr", label: "DeepSeek-OCR" },
  { key: "deepseekV32", label: "DeepSeek-V3.2" },
  { key: "gemma426bA4bIt", label: "Gemma 4 26B A4B IT" },
  { key: "kimiK2Thinking", label: "Kimi K2 Thinking" },
  { key: "llama3370b", label: "Llama 3.3 70B" },
  { key: "llama4Maverick17b128e", label: "Llama 4 Maverick 17B-128E" },
  { key: "llama4Scout17b16e", label: "Llama 4 Scout 17B-16E" },
  { key: "minimaxM2", label: "MiniMax M2" },
  { key: "gptOss120b", label: "OpenAI gpt-oss 120B" },
  { key: "gptOss20b", label: "OpenAI gpt-oss 20B" },
  { key: "qwen3235b", label: "Qwen3 235B" },
  { key: "qwen3Coder", label: "Qwen3 Coder" },
  { key: "qwen3Next80bInstruct", label: "Qwen3-Next-80B Instruct" },
  { key: "qwen3Next80bThinking", label: "Qwen3-Next-80B Thinking" },
  { key: "glm47", label: "GLM 4.7" },
  { key: "glm5", label: "GLM 5" },
];

function setNumber(value: unknown): number {
  if (value === "" || value === undefined || value === null) return 1;
  const parsed = parseInt(String(value).replace(/\D/g, ""), 10);
  return isNaN(parsed) || parsed < 1 ? 1 : parsed;
}


interface ConfigFormProps {
  config: TokenCalculatorConfig;
  onInputChange: (key: string, val: string | number | boolean) => void;
}

export default function ConfigForm({ config, onInputChange }: ConfigFormProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
      <h2 className="text-sm font-bold text-slate-500 text-shadow-indigo-800 uppercase tracking-widest mb-4">
        Configuration
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-x-6 gap-y-4 w-full">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">Model</label>
          <select
            value={config.model}
            onChange={(e) => onInputChange("model", e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-sm text-slate-200 focus:border-blue-500/50 focus:outline-none transition-colors cursor-pointer"
          >
            {MODELS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <NumField
          label="GSU Count"
          value={config.gsuCount}
            onChange={(v) => onInputChange("gsuCount", setNumber(v))}
        />
        <NumField
          label="Prompt Tokens"
          value={config.inputTokens.prompt.tokens}
          onChange={(v) => onInputChange("promptTokens", setNumber(v))}
        />
        <NumField
          label="Context Tokens"
          value={config.inputTokens.contextHistory.tokens}
          onChange={(v) => onInputChange("contextHistoryTokens", setNumber(v))}
        />
        <NumField
          label="Context Factor"
          value={config.agentPattern.contextFactor}
          onChange={(v) => onInputChange("contextFactor", setNumber(v))}
        />
        <NumField
          label="Turns / Min"
          value={config.timeFactors.turnsPerMinute}
          onChange={(v) => onInputChange("turnsPerMinute", setNumber(v))}
        />
        <NumField
          label="Output Avg Tokens"
          value={config.outputTokens.average}
          onChange={(v) => onInputChange("outputAverage", setNumber(v))}
        />
        <NumField
          label="Output Peak Tokens"
          value={config.outputTokens.peak}
          onChange={(v) => onInputChange("outputPeak", setNumber(v))}
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">Cached</label>
            <input
              type="checkbox"
              checked={config.inputTokens.prompt.isContextCached}
              onChange={(e) => onInputChange("isCached", e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
        </div>
          <NumField
            label="Daily Site Traffic (all users)"
            value={config.site.dailyUsers}
            onChange={(v) => onInputChange("dailyUsers", setNumber(v))}
          />

        
    </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const safeValue = setNumber(value);

  return (
    <div className="flex flex-col gap-1 break-words whitespace-normal">
      <label className="text-xs text-slate-500 break-words whitespace-normal">
        {label}
      </label>
      <input
        type="number"
        value={safeValue}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-right text-blue-300 font-mono focus:border-blue-500/50 focus:outline-none transition-colors"
      />
    </div>
  );
}
