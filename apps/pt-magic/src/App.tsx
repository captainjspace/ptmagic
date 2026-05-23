import "./App.css";
import "./styles.css";
import TokenSimulator from "./tokenSimulator.tsx";
import DataDisplay from "./DataDisplayComponent.tsx";

function App() {
  return (
    <>
      <div>
        <DataDisplay />{" "}
      </div>
      <div>
        <TokenSimulator />
      </div>
    </>
  );
}

export default App;
