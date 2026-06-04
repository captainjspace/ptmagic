import React, { useState } from "react";
import "./styles.css";
import type { TokenCalcResponse } from "@ptcalc/utils";

interface TokenSimulatorProps {
  data: TokenCalcResponse;
}

const TokenSimulator = ({ data }: TokenSimulatorProps): React.JSX.Element => {
  if (!data || !data.userCapacity || !data.decoratedGSUModel || !data.tokenPack) {
    return <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">Loading burst simulation metrics...</div>;
  }

  // Config States
  const [steadyUsers, setSteadyUsers] = useState<number>(Math.floor(data.userCapacity.realUserFloor || 1));
  const [burstUsers, setBurstUsers] = useState<number>(5);

  // Use dynamic values from the calculated model
  const MAX_TPS: number = data.decoratedGSUModel.gsuModel.tokensPerSecond;
  const BUCKET_SIZE: number = data.decoratedGSUModel.gsuModelCalcs.tokenBucketSize;
  const tokensPerTurn: number = data.tokenPack.AdjustedTokenInputs.burndownTokens;
  const turnsPerMinute: number = data.userCapacity.turnsPerMinute;

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
    <div className="bg-slate-950 text-slate-200 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center">
            <span className="w-2 h-6 bg-purple-500 rounded-full mr-3"></span>
            Real-time Burst Dynamics
          </h2>
          <p className="text-slate-400 mt-2">
            Modeling 1x {data.decoratedGSUModel.gsuModel.name} GSU ({MAX_TPS.toLocaleString()} TPS Baseline / {(BUCKET_SIZE/1000).toFixed(0)}k Burst
            Bucket)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-6 text-blue-400 underline underline-offset-8">
              Live Scenarios
            </h3>

            <div className="space-y-6">
              <div>
                <label className="flex justify-between text-sm font-medium mb-2">
                  <span>Steady State Users</span>
                  <span className="text-blue-300">{steadyUsers}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max={Math.floor(data.userCapacity.realUserFloor * 1.5)}
                  value={steadyUsers}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSteadyUsers(Number(e.target.value))
                  }
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
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
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-800">
                <div className="flex justify-between text-sm mb-1 text-slate-400">
                    <span>Effective Tokens/Turn</span>
                    <span className="text-emerald-300">{Math.round(tokensPerTurn).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                    <span>Turns Per Minute</span>
                    <span className="text-emerald-300">{turnsPerMinute}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real-time Status Banner */}
            <div
              className={`p-5 rounded-xl border-2 flex items-center justify-between shadow-2xl transition-all duration-300 ${isSteadyFailing ? "bg-red-950/40 border-red-500 text-red-100" : "bg-emerald-950/30 border-emerald-500/50 text-emerald-100"}`}
            >
              <div className="flex items-start space-x-4">
                <div className={`p-2 rounded-lg ${isSteadyFailing ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
                   {isSteadyFailing ? '⚠️' : '✅'}
                </div>
                <div>
                  <h3 className="font-black text-lg">
                    {isSteadyFailing
                      ? "CRITICAL: BASELINE EXCEEDED"
                      : "BASELINE STABLE"}
                  </h3>
                  <p className="text-xs opacity-70 leading-relaxed max-w-sm">
                    {isSteadyFailing
                      ? "Steady state demand exceeds GSU capacity. The burst bucket will never recover and eventually fail."
                      : "The system has enough headroom to replenish the burst bucket between traffic spikes."}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black tracking-tighter">
                    {Math.round(steadyTPS).toLocaleString()}
                </div>
                <div className="text-xs font-bold opacity-60">STEADY TPS</div>
              </div>
            </div>

            {/* Scenario Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Drain Scenario */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/20 transition-colors"></div>
                <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">
                  Peak Spike ({steadyUsers + burstUsers} users)
                </h3>
                <div className="text-4xl font-black text-white mb-6 tracking-tighter">
                  {Math.round(burstTPS).toLocaleString()}{" "}
                  <span className="text-sm text-slate-500 font-bold ml-1">TPS</span>
                </div>

                <div className="bg-slate-950/80 backdrop-blur-sm rounded-lg p-4 border border-slate-800">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Time to Failure</div>
                  <div
                    className={`text-2xl font-black ${!isBurstDraining ? "text-emerald-400" : timeToEmptySeconds < 60 ? "text-red-400" : "text-amber-400"}`}
                  >
                    {!isBurstDraining
                      ? "∞ (No Drain)"
                      : formatTime(timeToEmptySeconds)}
                  </div>
                </div>
              </div>

              {/* Recovery Scenario */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-500/20 transition-colors"></div>
                <h3 className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">
                  Recovery Capacity
                </h3>
                <div className="text-4xl font-black text-white mb-6 tracking-tighter">
                  {Math.round(
                    recoveryRate > 0 ? recoveryRate : 0,
                  ).toLocaleString()}{" "}
                  <span className="text-sm text-slate-500 font-bold ml-1">TPS+</span>
                </div>

                <div className="bg-slate-950/80 backdrop-blur-sm rounded-lg p-4 border border-slate-800">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1">Refill Duration</div>
                  <div
                    className={`text-2xl font-black ${isSteadyFailing ? "text-red-500" : "text-blue-400"}`}
                  >
                    {isSteadyFailing
                      ? "∞ (Locked)"
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
