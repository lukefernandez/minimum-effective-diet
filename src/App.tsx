import { Calculator } from "./components/Calculator";

function App() {
  return (
    <div className="mb-12 mt-16 font-sans sm:mt-24">
      <h1 className="mx-auto mb-6 max-w-xs text-4xl font-medium xs:max-w-md sm:mb-8 sm:max-w-xl">
        The Minimum Effective Diet
      </h1>
      <Calculator />
    </div>
  );
}

export default App;
