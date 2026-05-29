import type { TokenCalcResponse } from "@ptcalc/utils";

interface RushHourTableProps {
  data: TokenCalcResponse;
}

const RushHourTable = ({ data }: RushHourTableProps) => {
  if (!data || !data.siteCapacity) {
    return <div className="p-8 bg-slate-900 border border-slate-800 rounded-xl text-slate-400">Loading site capacity data...</div>;
  }
  const { minuteGrid } = data.siteCapacity;

  if (!minuteGrid || Object.keys(minuteGrid).length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
        <p className="text-slate-400 italic">No rush hour data available for the current configuration.</p>
      </div>
    );
  }

  const rows = Object.entries(minuteGrid).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="w-2 h-6 bg-blue-500 rounded-full mr-3"></span>
            Retail Rush Hour: Staying Power
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Simulating one additional user arriving every minute beyond baseline capacity.
            Shows how long the burst bucket survives under sustained overage.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950 text-slate-400 font-medium uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Minute (Δ Users)</th>
                <th className="px-6 py-4">Active Users</th>
                <th className="px-6 py-4">Minute Burn</th>
                <th className="px-6 py-4">Accum. Debt</th>
                <th className="px-6 py-4">Reserve Tokens</th>
                <th className="px-6 py-4">Recovery Time</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map(([minute, record]) => {
                const isCritical = record.reserveTokens < record.minuteBurn;
                return (
                  <tr key={minute} className={`hover:bg-slate-800/30 transition-colors ${isCritical ? 'bg-red-950/10' : ''}`}>
                    <td className="px-6 py-4 font-mono text-blue-400">+{minute}m</td>
                    <td className="px-6 py-4 text-white font-semibold">{record.activeUsers}</td>
                    <td className="px-6 py-4 font-mono">{record.minuteBurn.toLocaleString()}</td>
                    <td className="px-6 py-4 font-mono text-amber-300">{record.accumulatedTokenDebt.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                         <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${record.reserveTokens > 100000 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                              style={{ width: `${Math.max(0, (record.reserveTokens / data.model.tokenBucketSize) * 100)}%` }}
                            ></div>
                         </div>
                         <span className="font-mono">{record.reserveTokens.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-400">{record.recoveryTime}s</td>
                    <td className="px-6 py-4">
                      {record.reserveTokens <= 0 ? (
                        <span className="px-2 py-1 bg-red-900/40 text-red-400 rounded-md text-xs font-bold uppercase border border-red-800">Exhausted</span>
                      ) : record.stacking ? (
                        <span className="px-2 py-1 bg-amber-900/40 text-amber-400 rounded-md text-xs font-bold uppercase border border-amber-800">Stacking Debt</span>
                      ) : (
                        <span className="px-2 py-1 bg-emerald-900/40 text-emerald-400 rounded-md text-xs font-bold uppercase border border-emerald-800">Stable</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl shadow-lg border-l-4 border-l-emerald-500">
            <span className="text-slate-500 block mb-1 uppercase tracking-widest text-[10px] font-bold">Baseline Capacity</span>
            <span className="text-xl font-black text-emerald-400">{data.userCapacity.realUserFloor} Users</span>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl shadow-lg border-l-4 border-l-blue-500">
            <span className="text-slate-500 block mb-1 uppercase tracking-widest text-[10px] font-bold">Bucket Staying Power</span>
            <span className="text-xl font-black text-blue-400">{rows.length} Minutes</span>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl shadow-lg border-l-4 border-l-purple-500">
            <span className="text-slate-500 block mb-1 uppercase tracking-widest text-[10px] font-bold">Max Burst Load</span>
            <span className="text-xl font-black text-purple-400">{rows[rows.length - 1]?.[1].activeUsers} Users</span>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl shadow-lg border-l-4 border-l-amber-500">
            <span className="text-slate-500 block mb-1 uppercase tracking-widest text-[10px] font-bold">Avg. Minute Burn</span>
            <span className="text-xl font-black text-amber-400">{Math.round(data.userCapacity.stableBurn / data.userCapacity.realUserFloor / 1000).toLocaleString()}k</span>
        </div>
      </div>
    </div>
  );
};

export default RushHourTable;
