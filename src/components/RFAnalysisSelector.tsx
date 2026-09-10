import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../lib/utils";
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
            <Card
              key={a.id as string}
              className={cn(
                "cursor-pointer transition-all hover:border-primary/50 hover:shadow-md",
                selected === a.id && "border-primary ring-2 ring-primary/20"
              )}
              onClick={() => setSelected(a.id)}
            >
              <CardHeader>
                <CardTitle className="text-base">{a.label}</CardTitle>
                <CardDescription>{a.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelected(null)}>
              ← Choose another analysis
            </Badge>
            <span className="text-sm font-medium text-foreground">
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