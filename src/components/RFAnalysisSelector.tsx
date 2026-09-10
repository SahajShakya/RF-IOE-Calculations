import React, { useState } from "react";
import { cn } from "../lib/cn";
import SingleStubMatch from "./SingleStubMatch";
import DoubleStubMatch from "./DoubleStubMatch";
import StabilityAnalyzer from "./StabilityAnalyzer";
import PowerGain from "./PowerGain";
import MaxGain from "./MaxGain";
import FilterDesign from "./FilterDesign";

interface Props {
  onInsert?: (html: string) => void;
}

type AnalysisType =
  | "single-stub"
  | "double-stub"
  | "stability"
  | "power-gain"
  | "max-gain"
  | "filter-design"
  | null;

const analyses: { id: AnalysisType; label: string; description: string }[] = [
  { id: "single-stub", label: "Single Shunt-Stub Matching", description: "Find stub position and length for impedance matching" },
  { id: "double-stub", label: "Double Shunt-Stub Matching", description: "Two-stub matching with configurable spacing" },
  { id: "stability", label: "Transistor Stability Analysis", description: "K, μ, μ′ tests and stability circles" },
  { id: "power-gain", label: "Bilateral & Unilateral Power Gain", description: "GP, GA, GT calculations with S-parameters" },
  { id: "max-gain", label: "GaAs FET Maximum Gain", description: "Maximum gain with single-stub matching networks" },
  { id: "filter-design", label: "Microwave Filter Design", description: "Butterworth/Chebyshev LPF, HPF, BPF, BSF" },
];

const RFAnalysisSelector: React.FC<Props> = ({ onInsert }) => {
  const [selected, setSelected] = useState<AnalysisType>(null);

  const renderAnalysis = () => {
    switch (selected) {
      case "single-stub":
        return <SingleStubMatch onInsert={onInsert} />;
      case "double-stub":
        return <DoubleStubMatch onInsert={onInsert} />;
      case "stability":
        return <StabilityAnalyzer onInsert={onInsert} />;
      case "power-gain":
        return <PowerGain onInsert={onInsert} />;
      case "max-gain":
        return <MaxGain onInsert={onInsert} />;
      case "filter-design":
        return <FilterDesign onInsert={onInsert} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {!selected ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {analyses.map((a) => (
            <div
              key={a.id as string}
              className={cn(
                "border border-gray-300 bg-white rounded-lg shadow-md p-4 mb-4 cursor-pointer transition-all hover:shadow-md",
                selected === a.id && "border-blue-400 ring-2 ring-blue-200"
              )}
              onClick={() => setSelected(a.id)}
            >
              <div className="mb-4">
                <p className="text-base font-bold text-gray-900 mb-1">{a.label}</p>
                <p className="text-sm text-gray-600">{a.description}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="px-3 py-1 text-xs font-semibold bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
            >
              ← Choose another analysis
            </button>
            <span className="text-sm font-medium text-gray-800">
              {analyses.find((a) => a.id === selected)?.label}
            </span>
          </div>
          {renderAnalysis()}
        </>
      )}
    </div>
  );
};

export default RFAnalysisSelector;