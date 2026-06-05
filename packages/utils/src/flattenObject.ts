export const flattenObject = (
  obj: any,
  parent?: string,
  res: { [key: string]: any } = {},
): {} => {
  for (const key in obj) {
    const propName: string = parent ? `${parent}.${key}` : key;
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      flattenObject(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
};

//
//
//
//
//
//
//
// Object.entries(data).map(([sectionName, fields]) => {
//   // Skip rendering helper configurations if they get appended directly to root
//   // if (sectionName === "userCapacitys" || sectionName === "decoratedGSUModel" || sectionName === "decoratedSiteModel")
//   // return null;
//
//   return (
//     <div
//     key={sectionName}
//     className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700/60 transition-colors"
//     >
//     <div>
//     <h2 className="text-lg font-bold text-slate-300 border-b border-slate-800 pb-2 mb-4 tracking-wide">
//     {formatLabel(sectionName)}
//     </h2>
//
//     <div className="space-y-3">
//     {Object.entries(fields as Record<string, unknown>).map(
//       ([key, value]) => {
//         if (typeof value === "object" && value !== null) {
//           let parent=key;
//           Object.entries(value as Record<string, unknown>).map(
//             ([ikey, ivalue]) => {
//               if (typeof ivalue === "object" && ivalue !== null) {
//                 parent.concat(ikey);
//                 return [parent,ivalue.toLocaleString()]
//               }
//               return [parent,ivalue]
//             }
//           )
//         } else  {
//           return [key,value];
//         }
//         // return null;
//
//         const isConfigurable = [
//           "promptTokens",
//           "contextHistoryTokens",
//           "contextFactor",
//           "turnsPerMinute",
//           "isCached",
//         ].includes(key);
//
//         return (
//           <div
//           key={key}
//           className="flex items-center justify-between text-sm group"
//           >
//           <span className="text-slate-400 select-none group-hover:text-slate-300 transition-colors">
//           {formatLabel(key)}:
//             </span>
//
//           <div className="flex items-center pl-4">
//           {isConfigurable ? (
//             typeof value === "boolean" ? (
//               <input
//               type="checkbox"
//               checked={value}
//               onChange={(e) =>
//                 onInputChange(key, e.target.checked)
//               }
//               className="rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-0 w-4 h-4 cursor-pointer"
//               />
//             ) : (
//             <input
//             type={
//               typeof value === "number"
//                 ? "number"
//                 : "text"
//             }
//             value={value as string | number}
//             onChange={(e) =>
//               onInputChange(
//                 key,
//                 typeof value === "number"
//                   ? Number(e.target.value)
//                   : e.target.value,
//               )
//             }
//             className="w-24 bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-right text-blue-300 font-mono focus:border-blue-500/50 focus:outline-none transition-colors"
//             />
//             )
//           ) : (
//           <span
//           className={`font-mono text-right ${getValueColor(key, value)}`}
//           >
//           {typeof value === "number"
//             ? Number.isInteger(value)
//             ? value.toLocaleString()
//             : value.toFixed(2)
//               : String(value)}
//               </span>
//           )}
//           </div>
//           </div>
//         );
//       },
//     )}
//     </div>
//     </div>
//     </div>
//   );
// })}
// </div>
// export const flattenObjectAsComponent
