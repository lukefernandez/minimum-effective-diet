import { Calculator } from "./components/Calculator";

function App() {
  return (
    <div className="mt-16 pb-12 font-sans sm:mt-24">
      <h1 className="mx-auto max-w-xs text-4xl font-medium xs:max-w-md sm:max-w-xl">
        The Minimum Effective Diet
      </h1>
      <Calculator />
    </div>
  );
}

export default App;
