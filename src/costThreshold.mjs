const json=`
{
  "businessScenario": {
    "dailyConversations": 12500,
    "averageConvPerMinute": 8.7,
    "peakConvPerMinute": 41
  },
  "timeFactors":{
    "turnsPerConversation": 6
  }
}
`
const config= JSON.parse(json);

const models =  {
  flash25: {
    name: "Gemini 2.5 Flash",
    tps: 2690,
    cacheFactor: 0.1,
    outputFactor: 9,
    gsuCost: 2700
  },
  flashLite31: {
    name: "Gemini 3.1 Flash-Lite",
    tps: 4050,
    cacheFactor: 0.1,
    outputFactor: 6,
    gsuCost: 2700
  }
}

const phases = [
  {
    name: "Current State (Baseline)",
    model: models.flash25,
    prompt: 10000,
    history: 8000,
    output: 500,
    loopFactor: 2,
    loopSkipRate: 0 // 100% double loop
  },
  {
    name: "Phase 1: Austerity (Week 1-4)",
    model: models.flash25,
    prompt: 9000,
    history: 4000,
    output: 250,
    loopFactor: 2,
    loopSkipRate: 0 
  },
  {
    name: "Phase 2: Product Appending (Week 5-8)",
    model: models.flash25,
    prompt: 5000,
    history: 2500,  //add 500
    output: 150,
    loopFactor: 2,
    loopSkipRate: 0.75 // 75% of calls are single loop
  },
  {
    name: "Phase 3: Flash-Lite Migration (Week 9-12)",
    model: models.flashLite31,
    prompt: 5000,
    history: 2500,
    output: 150,
    loopFactor: 2,
    loopSkipRate: 0.75
  }
];

const calculatePhase = (p) => {
  const m = p.model;
  
  // Prompt is cached
  const promptBurn = p.prompt * m.cacheFactor;
  
  // Blended Loop Factor
  // If skipRate is 0.75, 75% have loopFactor 1, 25% have loopFactor 2
  const blendedLF = (p.loopSkipRate * 1) + ((1 - p.loopSkipRate) * p.loopFactor);
  
  const historyBurn = p.history * blendedLF;
  const outputBurn = p.output * m.outputFactor * blendedLF;
  
  const totalBurn = promptBurn + historyBurn + outputBurn;
  
  const tokensPerMin = m.tps * 60;
  const turnsPerMin = tokensPerMin / totalBurn;
  const capacityPerMin = turnsPerMin / config.timeFactors.turnsPerConversation;
  
  const gsusNeeded = Math.ceil(config.businessScenario.peakConvPerMinute / capacityPerMin);
  const monthlyCost = gsusNeeded * m.gsuCost;

  return {
    name: p.name,
    model: m.name,
    totalBurn,
    capacityPerMin,
    gsusNeeded,
    monthlyCost
  };
}

const report = () => {

  console.log("=== 12-WEEK OPTIMIZATION ROADMAP ===");
  console.log(`Target: ${config.businessScenario.peakConvPerMinute} users/min Peak Traffic`);
  console.log("----------------------------------------------------------------------");
  console.log(`${"PHASE".padEnd(35)} | ${"BURN/TURN".padEnd(10)} | ${"USERS/GSU".padEnd(10)} 
    | ${"GSUs".padEnd(5)} | ${"MONTHLY"}`);
  console.log("----------------------------------------------------------------------");

  phases.forEach(p => {
    const res = calculatePhase(p);
    console.log(`${res.name.padEnd(35)} | ${res.totalBurn.toFixed(0).padEnd(10)} 
      | ${res.capacityPerMin.toFixed(2).padEnd(10)} | ${res.gsusNeeded.toString().padEnd(5)} 
      | $${res.monthlyCost.toLocaleString()}`);
  });
  
  console.log("----------------------------------------------------------------------");
  console.log("Notes:");
  console.log("- Phase 2/3 uses 75% Loop-Skip via product appending.");
  console.log("- Phase 3 migrates to Flash-Lite (higher TPS, lower output multiplier).");
};

report();
