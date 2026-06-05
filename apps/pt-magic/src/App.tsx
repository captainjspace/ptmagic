import { useState } from "react";
import { HiUserCircle, HiChartPie, HiLightningBolt } from "react-icons/hi";
import "./App.css";
import "./styles.css";
import TokenSimulator from "./TokenSimulator.js";
import DataDisplay from "./DataDisplayComponent.js";
import RushHourTable from "./RushHourTable.js";
import ConfigForm from "./ConfigForm.js";
import { getCalculatedTokens, defaultConfig } from "@ptcalc/utils";
import type { TokenCalculatorConfig, TokenCalcResponse } from "@ptcalc/utils";

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [config, setConfig] = useState<TokenCalculatorConfig>(defaultConfig);

  const data: TokenCalcResponse = getCalculatedTokens(config);

  const handleInputChange = (key: string, val: string | number | boolean) => {
    setConfig((prev: TokenCalculatorConfig) => {
      const updated = JSON.parse(JSON.stringify(prev));
      if (key === "model") updated.model = val;
      if (key === "promptTokens") updated.inputTokens.prompt.tokens = val;
      if (key === "contextHistoryTokens")
        updated.inputTokens.contextHistory.tokens = val;
      if (key === "isCached") updated.inputTokens.prompt.isContextCached = val;
      if (key === "contextFactor") updated.agentPattern.contextFactor = val;
      if (key === "turnsPerMinute") updated.timeFactors.turnsPerMinute = val;
      if (key === "outputAverage") updated.outputTokens.average = val;
      if (key === "outputPeak") updated.outputTokens.peak = val;
      return updated;
    });
  };

  const tabs = [
    { title: "Metric Explorer", icon: HiChartPie },
    { title: "Rush Hour Analysis", icon: HiUserCircle },
    { title: "Burst Performance", icon: HiLightningBolt },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/60 pb-8 text-center md:text-left">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2 italic">
              PT<span className="text-blue-500">MAGIC</span>
            </h1>
            <p className="text-slate-500 font-semibold uppercase tracking-widest text-[10px]">
              Provisioned Throughput & Burst Bucket Dynamics
            </p>
          </div>
          <div className="flex bg-slate-900/40 p-1 rounded-xl border border-slate-800 mx-auto md:mx-0">
            {tabs.map((tab, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTab(idx)}
                className={`flex items-center space-x-2 px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 ${
                  activeTab === idx
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                    : "text-slate-500 hover:text-slate-300 hover:bg-slate-800/50"
                }`}
              >
                <tab.icon
                  className={`w-6 h-6 ${activeTab === idx ? "text-white" : "text-slate-400"}`}
                />
                <span className="hidden lg:inline">{tab.title}</span>
              </button>
            ))}
          </div>
        </header>

        <ConfigForm config={config} onInputChange={handleInputChange} />

        <main className="mt-8">
          {activeTab === 0 && <DataDisplay data={data} />}
          {activeTab === 1 && <RushHourTable data={data} />}
          {activeTab === 2 && <TokenSimulator data={data} />}
        </main>
      </div>
    </div>
  );
}

export default App;
