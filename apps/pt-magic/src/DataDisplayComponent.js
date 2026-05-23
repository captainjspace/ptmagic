import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import "./style.css";
import { getTokenData } from "@ptcalc/utils";
// 1. Establish the base configuration structure as the state baseline
const initialConfig = {
    model: "flashLite31",
    inputTokens: {
        prompt: { tokens: 10000, isContextCached: true },
        contextHistory: { tokens: 6000 },
    },
    outputTokens: { average: 500, peak: 4400 },
    agentPattern: { name: "Single Agent Double Loop", contextFactor: 1 },
    timeFactors: { turnDuration: 6, turnsPerMinute: 3 },
    site: { dailyUsers: 250000, canary: 0.05, rush: 0.2 },
};
const formatLabel = (str) => {
    return str
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (match) => match.toUpperCase())
        .trim();
};
export default function DataDisplay() {
    // 2. Track the configuration inputs in React State
    const [config, setConfig] = useState(initialConfig);
    // 3. Compute derived metric data on the fly during render
    const data = getTokenData(config);
    // 4. Update the deep nested configuration values safely when inputs change
    const handleInputChange = (key, val) => {
        setConfig((prev) => {
            // Create a deep copy clone to avoid mutating state directly
            const updated = JSON.parse(JSON.stringify(prev));
            if (key === "promptTokens")
                updated.inputTokens.prompt.tokens = val;
            if (key === "contextHistoryTokens")
                updated.inputTokens.contextHistory.tokens = val;
            if (key === "isCached")
                updated.inputTokens.prompt.isContextCached = val;
            if (key === "contextFactor")
                updated.agentPattern.contextFactor = val;
            if (key === "turnsPerMinute")
                updated.timeFactors.turnsPerMinute = val;
            return updated;
        });
    };
    const getValueColor = (key, value) => {
        if (typeof value === "number" && value < 0)
            return "text-red-400 font-bold";
        if (key.toLowerCase().includes("capacity") ||
            key.toLowerCase().includes("possible"))
            return "text-emerald-400 font-semibold";
        if (typeof value === "boolean")
            return value ? "text-blue-400" : "text-slate-500";
        return "text-slate-200";
    };
    return (_jsx("div", { className: "min-h-screen bg-slate-950 text-slate-100 p-8 font-sans selection:bg-blue-500/30", children: _jsxs("div", { className: "max-w-7xl mx-auto space-y-8", children: [_jsxs("div", { className: "border-b border-slate-800 pb-6", children: [_jsx("h1", { className: "text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent", children: "GSU Metric Explorer" }), _jsx("p", { className: "text-sm text-slate-400 mt-1", children: "Dynamic data presentation layer driven by pure computational state." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: Object.entries(data).map(([sectionName, fields]) => {
                        // Skip rendering helper configurations if they get appended directly to root
                        if (sectionName === "timeFactors" || sectionName === "modelCalc")
                            return null;
                        return (_jsx("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700/60 transition-colors", children: _jsxs("div", { children: [_jsx("h2", { className: "text-lg font-bold text-slate-300 border-b border-slate-800 pb-2 mb-4 tracking-wide", children: formatLabel(sectionName) }), _jsx("div", { className: "space-y-3", children: Object.entries(fields).map(([key, value]) => {
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
                                            return (_jsxs("div", { className: "flex items-center justify-between text-sm group", children: [_jsxs("span", { className: "text-slate-400 select-none group-hover:text-slate-300 transition-colors", children: [formatLabel(key), ":"] }), _jsx("div", { className: "flex items-center pl-4", children: isConfigurable ? (typeof value === "boolean" ? (_jsx("input", { type: "checkbox", checked: value, onChange: (e) => handleInputChange(key, e.target.checked), className: "rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-0 w-4 h-4 cursor-pointer" })) : (_jsx("input", { type: typeof value === "number"
                                                                ? "number"
                                                                : "text", value: value, onChange: (e) => handleInputChange(key, typeof value === "number"
                                                                ? Number(e.target.value)
                                                                : e.target.value), className: "w-24 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-right text-blue-300 font-mono focus:border-blue-500/50 focus:outline-none transition-colors" }))) : (_jsx("span", { className: `font-mono text-right ${getValueColor(key, value)}`, children: typeof value === "number"
                                                                ? Number.isInteger(value)
                                                                    ? value.toLocaleString()
                                                                    : value.toFixed(2)
                                                                : String(value) })) })] }, key));
                                        }) })] }) }, sectionName));
                    }) }), data.UserCapacity?.AtTwenty < 0 && (_jsxs("div", { className: "bg-red-950/20 border border-red-900/50 text-red-300 p-4 rounded-xl text-sm flex items-start space-x-3", children: [_jsx("span", { className: "text-lg leading-none mt-0.5", children: "\u26A0\uFE0F" }), _jsxs("div", { children: [_jsx("span", { className: "font-bold", children: "Bucket Deficit Warning:" }), " ", "AtTwenty simulation drops to", " ", _jsx("span", { className: "font-mono bg-red-950/60 px-1 py-0.5 rounded text-red-200", children: data.UserCapacity.AtTwenty.toLocaleString() }), " ", "tokens. The system is consuming burst resources faster than steady-state baseline replenishment allows."] })] }))] }) }));
}
