import type { TokenCalculatorConfig, ModelKey } from "@ptcalc/utils";

const MODELS: { key: ModelKey; label: string }[] = [
  { key: "flash25", label: "Gemini 2.5 Flash" },
  { key: "flashLite31", label: "Gemini 3.1 Flash" },
  { key: "flash35", label: "Gemini 3.5 Flash" },
];

interface ConfigFormProps {
  config: TokenCalculatorConfig;
  onInputChange: (key: string, val: string | number | boolean) => void;
}

export default function ConfigForm({ config, onInputChange }: ConfigFormProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
      <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
        Configuration
      </h2>
      <div className="flex flex-wrap gap-6 items-end">
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
          label="Prompt Tokens"
          value={config.inputTokens.prompt.tokens}
          onChange={(v) => onInputChange("promptTokens", v)}
        />
        <NumField
          label="Context Tokens"
          value={config.inputTokens.contextHistory.tokens}
          onChange={(v) => onInputChange("contextHistoryTokens", v)}
        />
        <NumField
          label="Context Factor"
          value={config.agentPattern.contextFactor}
          onChange={(v) => onInputChange("contextFactor", v)}
        />
        <NumField
          label="Turns / Min"
          value={config.timeFactors.turnsPerMinute}
          onChange={(v) => onInputChange("turnsPerMinute", v)}
        />
        <NumField
          label="Output Avg Tokens"
          value={config.outputTokens.average}
          onChange={(v) => onInputChange("outputAverage", v)}
        />
        <NumField
          label="Output Peak Tokens"
          value={config.outputTokens.peak}
          onChange={(v) => onInputChange("outputPeak", v)}
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs text-slate-500">Cached</label>
          <div className="flex items-center h-[34px]">
            <input
              type="checkbox"
              checked={config.inputTokens.prompt.isContextCached}
              onChange={(e) => onInputChange("isCached", e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
          </div>
        </div>
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
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-500">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-28 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm text-right text-blue-300 font-mono focus:border-blue-500/50 focus:outline-none transition-colors"
      />
    </div>
  );
}
