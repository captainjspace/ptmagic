import React from "react";
import "./style.css";
import type { TokenCalcResponse, TokenCalculatorConfig } from "@ptcalc/utils";
interface TokenSimulatorProps {
    config: TokenCalculatorConfig;
    data: TokenCalcResponse;
}
declare const TokenSimulator: ({ data }: TokenSimulatorProps) => React.JSX.Element;
export default TokenSimulator;
//# sourceMappingURL=tokenSimulator.d.ts.map