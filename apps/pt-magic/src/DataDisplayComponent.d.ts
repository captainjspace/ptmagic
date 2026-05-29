import "./style.css";
import type { TokenCalcResponse } from "@ptcalc/utils";
interface DataDisplayProps {
    data: TokenCalcResponse;
    onInputChange: (key: string, val: any) => void;
}
export default function DataDisplay({ data, onInputChange }: DataDisplayProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=DataDisplayComponent.d.ts.map