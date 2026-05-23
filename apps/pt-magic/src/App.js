import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import "./App.css";
import "./styles.css";
import TokenSimulator from "./tokenSimulator.tsx";
import DataDisplay from "./DataDisplayComponent.tsx";
function App() {
    return (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx(DataDisplay, {}), " "] }), _jsx("div", { children: _jsx(TokenSimulator, {}) })] }));
}
export default App;
