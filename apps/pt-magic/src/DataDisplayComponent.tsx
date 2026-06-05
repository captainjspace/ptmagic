import "./style.css";
import { useEffect, useRef } from "react";
import { flattenObject } from "@ptcalc/utils";
import type { TokenCalcResponse } from "@ptcalc/utils";

const SKIP_SECTIONS = new Set(["inputConfig", "rushHourCapacity"]);

const formatLabel = (str: string) =>
  str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1 $2")
    .replace(/^./, (m) => m.toUpperCase())
    .trim()
    .replace(/\bGsu\b/g, "GSU");

const getValueColor = (key: string, value: unknown): string => {
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

const formatValue = (value: unknown): string => {
  if (typeof value === "number")
    return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(3);
  return String(value);
};

function Row({ label, value }: { label: string; value: unknown }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef<unknown>(value);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (prevRef.current !== value) {
      prevRef.current = value;
      const el = rowRef.current;
      if (el) {
        el.classList.remove("flash-update");
        void el.offsetWidth; // force reflow so browser sees the removal
        el.classList.add("flash-update");
      }
    }
  }, [value]);

  return (
    <div
      ref={rowRef}
      className="flex items-start justify-between text-sm gap-4 rounded px-1 -mx-1"
    >
      <span className="text-slate-400 select-none shrink-0 leading-snug">
        {formatLabel(label)}:
      </span>
      <span
        className={`font-mono text-right leading-snug ${getValueColor(label, value)}`}
      >
        {formatValue(value)}
      </span>
    </div>
  );
}

interface DataDisplayProps {
  data: TokenCalcResponse;
}

export default function DataDisplay({ data }: DataDisplayProps) {
  if (!data) {
    return (
      <div className="p-8 bg-red-900/20 border border-red-800 rounded-xl text-red-400">
        Error: Calculation data missing.
      </div>
    );
  }

  const flat = flattenObject(data) as Record<string, unknown>;

  const grouped: Record<string, Record<string, unknown>> = {};
  for (const [dotKey, value] of Object.entries(flat)) {
    if (Array.isArray(value)) continue;
    const dot = dotKey.indexOf(".");
    const section = dot === -1 ? dotKey : dotKey.slice(0, dot);
    const subKey = dot === -1 ? "" : dotKey.slice(dot + 1);
    if (SKIP_SECTIONS.has(section)) continue;
    if (!grouped[section]) grouped[section] = {};
    grouped[section][subKey] = value;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(grouped).map(([section, fields]) => {
          const flatRows: [string, unknown][] = [];
          const subGroups: Record<string, [string, unknown][]> = {};

          for (const [key, value] of Object.entries(fields)) {
            const dot = key.indexOf(".");
            if (dot === -1) {
              flatRows.push([key, value]);
            } else {
              const parent = key.slice(0, dot);
              const leaf = key.slice(dot + 1);
              if (!subGroups[parent]) subGroups[parent] = [];
              subGroups[parent].push([leaf, value]);
            }
          }

          return (
            <div
              key={section}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg hover:border-slate-700/60 transition-colors"
            >
              <h2 className="section-heading">
                {formatLabel(section)}
              </h2>

              <div className="space-y-2">
                {flatRows.map(([key, value]) => (
                  <Row key={key} label={key} value={value} />
                ))}

                {Object.entries(subGroups).map(([parent, rows]) => (
                  <div key={parent}>
                    <h3 className="text-[16px] font-bold bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text uppercase tracking-narrow mt-4 mb-4">
                      {formatLabel(parent)}
                    </h3>
                    <div className="space-y-2 pl-2 border-l border-slate-800">
                      {rows.map(([leaf, value]) => (
                        <Row key={leaf} label={leaf} value={value} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {data.userCapacity?.AtTwenty < 0 && (
        <div className="bg-red-950/20 border border-red-900/50 text-red-300 p-4 rounded-xl text-sm flex items-start space-x-3">
          <span className="text-lg leading-none mt-0.5">⚠️</span>
          <div>
            <span className="font-bold">Bucket Deficit Warning:</span> AtTwenty
            simulation drops to{" "}
            <span className="font-mono bg-red-950/60 px-1 py-0.5 rounded text-red-200">
              {data.userCapacity.AtTwenty.toLocaleString()}
            </span>{" "}
            tokens. The system is consuming burst resources faster than
            steady-state baseline replenishment allows.
          </div>
        </div>
      )}
    </div>
  );
}
