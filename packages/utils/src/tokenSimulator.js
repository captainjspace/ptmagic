import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from 'react';
import "./style.css";
import { getCalcAsJSON } from "@ptcalc/utils";
// Top-level diagnostic execution
const data = getCalcAsJSON();
console.log(data);
const TokenSimulator = () => {
    // Config States
    const [steadyUsers, setSteadyUsers] = useState(8);
    const [burstUsers, setBurstUsers] = useState(7);
    const [tokensPerTurn, setTokensPerTurn] = useState(11600);
    const [turnsPerMinute] = useState(3);
    // Constants
    const MAX_TPS = 2690;
    const BUCKET_SIZE = 322800;
    // Calculated Metrics
    const steadyTPS = (steadyUsers * turnsPerMinute * tokensPerTurn) / 60;
    const burstTPS = ((steadyUsers + burstUsers) * turnsPerMinute * tokensPerTurn) / 60;
    const isSteadyFailing = steadyTPS >= MAX_TPS;
    const isBurstDraining = burstTPS > MAX_TPS;
    const drainRate = burstTPS - MAX_TPS;
    const recoveryRate = MAX_TPS - steadyTPS;
    const timeToEmptySeconds = isBurstDraining ? (BUCKET_SIZE / drainRate) : 0;
    const timeToRecoverSeconds = (!isSteadyFailing && isBurstDraining) ? (BUCKET_SIZE / recoveryRate) : 0;
    // Formatters
    const formatTime = (seconds) => {
        if (seconds === Infinity || seconds < 0)
            return "Never";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };
    return (_jsx("div", { className: "min-h-screen bg-slate-950 text-slate-200 p-8 font-sans", children: _jsxs("div", { className: "max-w-5xl mx-auto space-y-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight text-white", children: "GSU Token Burst & Recovery" }), _jsx("p", { className: "text-slate-400 mt-2", children: "Modeling 1x Gemini 2.5 Flash GSU (2,690 TPS Baseline / 322k Burst Bucket)" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsxs("div", { className: "lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl", children: [_jsx("h2", { className: "text-xl font-semibold mb-6 text-blue-400", children: "Environment Variables" }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "flex justify-between text-sm font-medium mb-2", children: [_jsx("span", { children: "Steady State Users" }), _jsx("span", { className: "text-blue-300", children: steadyUsers })] }), _jsx("input", { type: "range", min: "1", max: "50", value: steadyUsers, onChange: (e) => setSteadyUsers(Number(e.target.value)), className: "w-full accent-blue-500" })] }), _jsxs("div", { children: [_jsxs("label", { className: "flex justify-between text-sm font-medium mb-2", children: [_jsx("span", { children: "+ Sudden Burst Users" }), _jsxs("span", { className: "text-purple-300", children: ["+", burstUsers] })] }), _jsx("input", { type: "range", min: "0", max: "50", value: burstUsers, onChange: (e) => setBurstUsers(Number(e.target.value)), className: "w-full accent-purple-500" })] }), _jsxs("div", { className: "pt-4 border-t border-slate-800", children: [_jsxs("label", { className: "flex justify-between text-sm font-medium mb-2", children: [_jsx("span", { children: "PT Tokens Per Turn" }), _jsx("span", { className: "text-emerald-300", children: tokensPerTurn.toLocaleString() })] }), _jsx("input", { type: "range", min: "3000", max: "40000", step: "500", value: tokensPerTurn, onChange: (e) => setTokensPerTurn(Number(e.target.value)), className: "w-full accent-emerald-500" })] })] })] }), _jsxs("div", { className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: `p-4 rounded-lg border flex items-center justify-between ${isSteadyFailing ? 'bg-red-950/50 border-red-900 text-red-200' : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-200'}`, children: [_jsxs("div", { children: [_jsx("h3", { className: "font-bold", children: isSteadyFailing ? 'CRITICAL: Baseline Exceeded' : 'Baseline Stable' }), _jsx("p", { className: "text-sm opacity-80", children: isSteadyFailing ? 'Your steady state users are pulling more than 2,690 TPS. The system will crash without spillover.' : 'Steady state leaves enough faucet capacity to refill the bucket after bursts.' })] }), _jsxs("div", { className: "text-2xl font-bold tracking-tighter", children: [Math.round(steadyTPS).toLocaleString(), " ", _jsx("span", { className: "text-sm font-normal opacity-70", children: "TPS" })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-6", children: [_jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16" }), _jsxs("h3", { className: "text-slate-400 font-medium mb-1", children: ["During Burst Spike (", steadyUsers + burstUsers, " users)"] }), _jsxs("div", { className: "text-3xl font-bold text-white mb-4", children: [Math.round(burstTPS).toLocaleString(), " ", _jsx("span", { className: "text-lg text-slate-500 font-normal", children: "TPS" })] }), _jsxs("div", { className: "bg-slate-950 rounded p-3", children: [_jsx("div", { className: "text-sm text-slate-400", children: "Bucket Drains In" }), _jsx("div", { className: `text-xl font-bold ${!isBurstDraining ? 'text-emerald-400' : (timeToEmptySeconds < 30 ? 'text-red-400' : 'text-amber-400')}`, children: !isBurstDraining ? "Safe (No Drain)" : formatTime(timeToEmptySeconds) })] })] }), _jsxs("div", { className: "bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-16 -mt-16" }), _jsx("h3", { className: "text-slate-400 font-medium mb-1", children: "Post-Burst Recovery" }), _jsxs("div", { className: "text-3xl font-bold text-white mb-4", children: [Math.round(recoveryRate > 0 ? recoveryRate : 0).toLocaleString(), " ", _jsx("span", { className: "text-lg text-slate-500 font-normal", children: "TPS Excess" })] }), _jsxs("div", { className: "bg-slate-950 rounded p-3", children: [_jsx("div", { className: "text-sm text-slate-400", children: "Bucket Refills In" }), _jsx("div", { className: `text-xl font-bold ${isSteadyFailing ? 'text-red-500' : 'text-blue-400'}`, children: isSteadyFailing ? "Never (Baseline Heavy)" : formatTime(timeToRecoverSeconds) })] })] })] })] })] })] }) }));
};
export default TokenSimulator;
//# sourceMappingURL=tokenSimulator.js.map