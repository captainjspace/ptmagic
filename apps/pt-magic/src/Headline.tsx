import "./style.css";
import type {TokenCalcResponse} from "@ptcalc/utils";

interface HeadlineProps {
  data: TokenCalcResponse;
}

export default function Headline({ data }: HeadlineProps) {
  if (!data) {
    return (
      <div className="p-8 bg-red-900/20 border border-red-800 rounded-xl text-red-400">
        Error: Calculation data missing.
      </div>
    );
  }
return (
<div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-sm">
        <div className="bg-slate-900/50 border border-slate-800 p-2 rounded-xl shadow-lg border-l-2 border-l-emerald-500">
          <span className="text-slate-500 block mb-1 uppercase tracking-standard text-[10px] font-bold">
            Baseline Capacity
          </span>
          <span className="text-md font-black text-emerald-200">
            {data.userCapacity.realUserFloor} Users
          </span>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-2 rounded-xl shadow-lg border-l-2 border-l-blue-500">
          <span className="text-slate-500 block mb-1 uppercase tracking-standard text-[10px] font-bold">
            Burndown Tokens
          </span>
          <span className="text-md font-black text-blue-200">
            {data.tokenPack.AdjustedTokenInputs.burndownTokens} Tokens
          </span>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-2 rounded-xl shadow-lg border-l-2 border-l-purple-500">
          <span className="text-slate-500 block mb-1 uppercase tracking-standard text-[10px] font-bold">
            Expected Cost of Output Tokens
          </span>
          <span className="text-sm font-black text-purple-200">
            <ul>
              <li>{data.tokenPack.AdjustedTokenInputs.outputAverageAdjustedTokens} PT Output Tokens</li> 
              <li>{data.tokenPack.rawTokenInput.outputAverageTokens} PayGo Tokens  </li>
            </ul>
          </span>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-2 rounded-xl shadow-lg border-l-2 border-l-amber-500">
          <span className="text-slate-500 block mb-1 uppercase tracking-standard text-[10px] font-bold">
            Avg. Minute Burn 
          </span>
          <span className="text-md font-black text-amber-200">
            {data.userCapacity.stableBurn.toLocaleString()} Tokens
          </span>
        </div>
      </div>
)
}
