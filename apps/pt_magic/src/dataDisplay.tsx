import React, { useState } from 'react';
import "./style.css";
import {getTokenData} from "@ptcalc/utils";

// Your exact generated JSON structure used as the initial state seed
const initialData = JSON.stringify(getTokenData());



const _initialData = {
  "Model": {
    "tokensPerSecond": 4030,
    "tokenAccumulationMinutes": 2,
    "cacheFactor": 0.1,
    "outputFactor": 6,
    "modelName": "flashLite31",
    "perMinute": 241800,
    "tokenBucketSize": 483600,
    "agentPattern": "Single Agent Double Loop",
    "contextFactor": 1
  },
  "RawTokenInput": {
    "promptTokens": 10000,
    "contextHistoryTokens": 6000,
    "baseInputTokens": 16000,
    "realInputTokens": 16000,
    "outputAverageTokens": 500,
    "rawTokens": 16500,
    "outputPeakTokens": 4400,
    "peakRawTokens": 20400
  },
  "AdjustedTokenInputs": {
    "isCached": true,
    "promptCacheAdjustedTokens": 1000,
    "baseAdjustedInputTokens": 7000,
    "loopAdjustedPromptTokens": 10000,
    "loopAndCacheAdjustedPromptTokens": 1000,
    "loopAdjustedContextHistoryTokens": 6000,
    "burndownInputTokens": 7000,
    "outputAverageAdjustedTokens": 3000,
    "outputPeakAdjustedTokens": 26400,
    "burndownTokens": 10000,
    "peakAdjustedTokens": 33400
  },
  "TokenRatios": {
    "rawRatio": 32,
    "peakRawRatio": 3.6363636363636362,
    "burndownRatio": 2.3333333333333335,
    "peakAdjustedRatio": 0.26515151515151514
  },
  "UserCapacity": {
    "turnDuration": 6,
    "turnsPerMinute": 3,
    "maxConcurrentInputUsers": 69,
    "concurrentInputBurn": 483000,
    "concurrentResponseToken": 207000,
    "staggeredMinuteBurn": 2070000,
    "recoveryRate": 24180,
    "AtSixSeconds": 24780,
    "responsesPossible": 8,
    "remainingResponses": 61,
    "remainingTokens": 780,
    "AtTwenty": -133860,
    "realUserCapacity": 8.06,
    "stableBurn": 241800
  }
};

// Helper to turn camelCase strings into readable Section Labels
const formatLabel = (str) => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (match) => match.toUpperCase())
    .trim();
};

export default function DataDisplay() {
  const [data, setData] = useState(initialData);

  // Generic handler that dynamically modifies deep JSON values on input changes
  const handleInputChange = (section, key, val) => {
    setData(prev => {
      const updated = {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: val
        }
      };
      
      // Hook your calculation engine right here! 
      // i.e., updated = runYourCalculationEngine(updated);
      
      return updated;
    });
  };

  // Determines color styling based on metric health or negative indicators (like AtTwenty)
  const getValueColor = (key, value) => {
    if (typeof value === 'number' && value < 0) return 'text-red-400 font-bold';
    if (key.toLowerCase().includes('capacity') || key.toLowerCase().includes('possible')) return 'text-emerald-400 font-semibold';
    if (typeof value === 'boolean') return value ? 'text-blue-400' : 'text-slate-500';
    return 'text-slate-200';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            GSU Metric Explorer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Auto-generated data presentation layer from calculation payload.
          </p>
        </div>

        {/* Dynamic Card Generation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(data).map(([sectionName, fields]) => (
            <div 
              key={sectionName} 
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700/60 transition-colors"
            >
              <div>
                <h2 className="text-lg font-bold text-slate-300 border-b border-slate-800 pb-2 mb-4 tracking-wide">
                  {formatLabel(sectionName)}
                </h2>
                
                <div className="space-y-3">
                  {Object.entries(fields).map(([key, value]) => {
                    // Check if this field is an input state or a calculated metric
                    const isConfigurable = ['tokensPerSecond', 'promptTokens', 'contextHistoryTokens', 'contextFactor', 'turnsPerMinute', 'isCached'].includes(key);

                    return (
                      <div key={key} className="flex items-center justify-between text-sm group">
                        <span className="text-slate-400 select-none group-hover:text-slate-300 transition-colors">
                          {formatLabel(key)}:
                        </span>
                        
                        <div className="flex items-center pl-4">
                          {isConfigurable ? (
                            typeof value === 'boolean' ? (
                              <input 
                                type="checkbox"
                                checked={value}
                                onChange={(e) => handleInputChange(sectionName, key, e.target.checked)}
                                className="rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-0 w-4 h-4 cursor-pointer"
                              />
                            ) : (
                              <input 
                                type={typeof value === 'number' ? 'number' : 'text'}
                                value={value}
                                onChange={(e) => handleInputChange(sectionName, key, typeof value === 'number' ? Number(e.target.value) : e.target.value)}
                                className="w-24 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-right text-blue-300 font-mono focus:border-blue-500/50 focus:outline-none transition-colors"
                              />
                            )
                          ) : (
                            <span className={`font-mono text-right ${getValueColor(key, value)}`}>
                              {typeof value === 'number' ? (Number.isInteger(value) ? value.toLocaleString() : value.toFixed(2)) : String(value)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Diagnostic Status Box */}
        {data.UserCapacity?.AtTwenty < 0 && (
          <div className="bg-red-950/20 border border-red-900/50 text-red-300 p-4 rounded-xl text-sm flex items-start space-x-3">
            <span className="text-lg leading-none mt-0.5">⚠️</span>
            <div>
              <span className="font-bold">Bucket Deficit Warning:</span> AtTwenty simulation drops to <span className="font-mono bg-red-950/60 px-1 py-0.5 rounded text-red-200">{data.UserCapacity.AtTwenty.toLocaleString()}</span> tokens. The system is consuming burst resources faster than steady-state baseline replenishment allows.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
