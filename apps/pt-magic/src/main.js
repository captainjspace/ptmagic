import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./App.tsx";
import DataDisplay from "./DataDisplayComponent.tsx";
createRoot(document.getElementById("root")).render(_jsx(StrictMode, { children: _jsx(DataDisplay, {}) }));
