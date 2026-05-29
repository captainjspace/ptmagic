import "./style.css";
import type { TokenCalcResponse } from "@ptcalc/utils";

const formatLabel = (str: string) => {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
};

interface DataDisplayProps {
  data: TokenCalcResponse;
  onInputChange: (key: string, val: any) => void;
}

export default function DataDisplay({ data, onInputChange }: DataDisplayProps) {
  if (!data) {
    console.error("DataDisplay received null or undefined data");
    return <div className="p-8 bg-red-900/20 border border-red-800 rounded-xl text-red-400">Error: Calculation data missing.</div>;
  }

  const getValueColor = (key: string, value: any) => {
    if (typeof value === "number" && value < 0) return "text-red-400 font-bold";
    if (
      key.toLowerCase().includes("capacity") ||
      key.toLowerCase().includes("possible")
    )
      return "text-emerald-400 font-semibold";
    if (typeof value === "boolean")
      return value ? "text-blue-400" : "text-slate-500";
    return "text-slate-200";
  };

  return (
    <div className="bg-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      <div className="space-y-8">
        {/* Dynamic Card Generation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(data).map(([sectionName, fields]) => {
            // Skip rendering helper configurations if they get appended directly to root
            if (sectionName === "timeFactors" || sectionName === "modelCalc" || sectionName === "siteCapacity")
              return null;

            return (
              <div
                key={sectionName}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700/60 transition-colors"
              >
                <div>
                  <h2 className="text-lg font-bold text-slate-300 border-b border-slate-800 pb-2 mb-4 tracking-wide">
                    {formatLabel(sectionName)}
                  </h2>

                  <div className="space-y-3">
                    {Object.entries(fields as Record<string, any>).map(
                      ([key, value]) => {
                        // Guard against rendering deeply nested child objects or grids directly inside lists
                        if (typeof value === "object" && value !== null)
                          return null;

                        const isConfigurable = [
                          "promptTokens",
                          "contextHistoryTokens",
                          "contextFactor",
                          "turnsPerMinute",
                          "isCached",
                        ].includes(key);

                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between text-sm group"
                          >
                            <span className="text-slate-400 select-none group-hover:text-slate-300 transition-colors">
                              {formatLabel(key)}:
                            </span>

                            <div className="flex items-center pl-4">
                              {isConfigurable ? (
                                typeof value === "boolean" ? (
                                  <input
                                    type="checkbox"
                                    checked={value}
                                    onChange={(e) =>
                                      onInputChange(key, e.target.checked)
                                    }
                                    className="rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-0 w-4 h-4 cursor-pointer"
                                  />
                                ) : (
                                  <input
                                    type={
                                      typeof value === "number"
                                        ? "number"
                                        : "text"
                                    }
                                    value={value}
                                    onChange={(e) =>
                                      onInputChange(
                                        key,
                                        typeof value === "number"
                                          ? Number(e.target.value)
                                          : e.target.value,
                                      )
                                    }
                                    className="w-24 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-right text-blue-300 font-mono focus:border-blue-500/50 focus:outline-none transition-colors"
                                  />
                                )
                              ) : (
                                <span
                                  className={`font-mono text-right ${getValueColor(key, value)}`}
                                >
                                  {typeof value === "number"
                                    ? Number.isInteger(value)
                                      ? value.toLocaleString()
                                      : value.toFixed(2)
                                    : String(value)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Diagnostic Status Box */}
        {data.userCapacity?.AtTwenty < 0 && (
          <div className="bg-red-950/20 border border-red-900/50 text-red-300 p-4 rounded-xl text-sm flex items-start space-x-3">
            <span className="text-lg leading-none mt-0.5">⚠️</span>
            <div>
              <span className="font-bold">Bucket Deficit Warning:</span>{" "}
              AtTwenty simulation drops to{" "}
              <span className="font-mono bg-red-950/60 px-1 py-0.5 rounded text-red-200">
                {data.userCapacity.AtTwenty.toLocaleString()}
              </span>{" "}
              tokens. The system is consuming burst resources faster than
              steady-state baseline replenishment allows.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
