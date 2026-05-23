import React, { useState } from "react";
import "./style.css";
import { getCalcAsJSON } from "@ptcalc/utils";

// Top-level diagnostic execution
const data: string = getCalcAsJSON();
console.log(data);

const TokenSimulator = (): React.JSX.Element => {
  // Config States
  const [steadyUsers, setSteadyUsers] = useState<number>(8);
  const [burstUsers, setBurstUsers] = useState<number>(7);
  const [tokensPerTurn, setTokensPerTurn] = useState<number>(11600);
  const [turnsPerMinute] = useState<number>(3);

  // Constants
  const MAX_TPS: number = 2690;
  const BUCKET_SIZE: number = 322800;

  // Calculated Metrics
  const steadyTPS: number = (steadyUsers * turnsPerMinute * tokensPerTurn) / 60;
  const burstTPS: number =
    ((steadyUsers + burstUsers) * turnsPerMinute * tokensPerTurn) / 60;

  const isSteadyFailing: boolean = steadyTPS >= MAX_TPS;
  const isBurstDraining: boolean = burstTPS > MAX_TPS;

  const drainRate: number = burstTPS - MAX_TPS;
  const recoveryRate: number = MAX_TPS - steadyTPS;

  const timeToEmptySeconds: number = isBurstDraining
    ? BUCKET_SIZE / drainRate
    : 0;
  const timeToRecoverSeconds: number =
    !isSteadyFailing && isBurstDraining ? BUCKET_SIZE / recoveryRate : 0;

  // Formatters
  const formatTime = (seconds: number): string => {
    if (seconds === Infinity || seconds < 0) return "Never";
    const m: number = Math.floor(seconds / 60);
    const s: number = Math.floor(seconds % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            GSU Token Burst & Recovery
          </h1>
          <p className="text-slate-400 mt-2">
            Modeling 1x Gemini 2.5 Flash GSU (2,690 TPS Baseline / 322k Burst
            Bucket)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-6 text-blue-400">
              Environment Variables
            </h2>

            <div className="space-y-6">
              <div>
                <label className="flex justify-between text-sm font-medium mb-2">
                  <span>Steady State Users</span>
                  <span className="text-blue-300">{steadyUsers}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={steadyUsers}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSteadyUsers(Number(e.target.value))
                  }
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <label className="flex justify-between text-sm font-medium mb-2">
                  <span>+ Sudden Burst Users</span>
                  <span className="text-purple-300">+{burstUsers}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={burstUsers}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setBurstUsers(Number(e.target.value))
                  }
                  className="w-full accent-purple-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800">
                <label className="flex justify-between text-sm font-medium mb-2">
                  <span>PT Tokens Per Turn</span>
                  <span className="text-emerald-300">
                    {tokensPerTurn.toLocaleString()}
                  </span>
                </label>
                <input
                  type="range"
                  min="3000"
                  max="40000"
                  step="500"
                  value={tokensPerTurn}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTokensPerTurn(Number(e.target.value))
                  }
                  className="w-full accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Metrics Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-time Status Banner */}
            <div
              className={`p-4 rounded-lg border flex items-center justify-between ${isSteadyFailing ? "bg-red-950/50 border-red-900 text-red-200" : "bg-emerald-950/30 border-emerald-900/50 text-emerald-200"}`}
            >
              <div>
                <h3 className="font-bold">
                  {isSteadyFailing
                    ? "CRITICAL: Baseline Exceeded"
                    : "Baseline Stable"}
                </h3>
                <p className="text-sm opacity-80">
                  {isSteadyFailing
                    ? "Your steady state users are pulling more than 2,690 TPS. The system will crash without spillover."
                    : "Steady state leaves enough faucet capacity to refill the bucket after bursts."}
                </p>
              </div>
              <div className="text-2xl font-bold tracking-tighter">
                {Math.round(steadyTPS).toLocaleString()}{" "}
                <span className="text-sm font-normal opacity-70">TPS</span>
              </div>
            </div>

            {/* Scenario Grid */}
            <div className="grid grid-cols-2 gap-6">
              {/* Drain Scenario */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                <h3 className="text-slate-400 font-medium mb-1">
                  During Burst Spike ({steadyUsers + burstUsers} users)
                </h3>
                <div className="text-3xl font-bold text-white mb-4">
                  {Math.round(burstTPS).toLocaleString()}{" "}
                  <span className="text-lg text-slate-500 font-normal">
                    TPS
                  </span>
                </div>

                <div className="bg-slate-950 rounded p-3">
                  <div className="text-sm text-slate-400">Bucket Drains In</div>
                  <div
                    className={`text-xl font-bold ${!isBurstDraining ? "text-emerald-400" : timeToEmptySeconds < 30 ? "text-red-400" : "text-amber-400"}`}
                  >
                    {!isBurstDraining
                      ? "Safe (No Drain)"
                      : formatTime(timeToEmptySeconds)}
                  </div>
                </div>
              </div>

              {/* Recovery Scenario */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-16 -mt-16"></div>
                <h3 className="text-slate-400 font-medium mb-1">
                  Post-Burst Recovery
                </h3>
                <div className="text-3xl font-bold text-white mb-4">
                  {Math.round(
                    recoveryRate > 0 ? recoveryRate : 0,
                  ).toLocaleString()}{" "}
                  <span className="text-lg text-slate-500 font-normal">
                    TPS Excess
                  </span>
                </div>

                <div className="bg-slate-950 rounded p-3">
                  <div className="text-sm text-slate-400">
                    Bucket Refills In
                  </div>
                  <div
                    className={`text-xl font-bold ${isSteadyFailing ? "text-red-500" : "text-blue-400"}`}
                  >
                    {isSteadyFailing
                      ? "Never (Baseline Heavy)"
                      : formatTime(timeToRecoverSeconds)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenSimulator;
