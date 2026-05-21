import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./styles.css";
import "./App.tsx";
import DataDisplay from "./dataDisplay.tsx"; 

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DataDisplay />
  </StrictMode>,
)
