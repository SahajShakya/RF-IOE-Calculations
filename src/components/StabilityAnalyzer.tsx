import React, { useState } from "react";
import {
  analyzeStability,
  fromPolar,
  formatComplex,
  formatPolar,
  StabilityResult,
} from "../calculations";
import {
  ToolCard,
  SParameterInputs,
  SPort,
  ActionBar,
  ResultCard,
  ResultSection,
  ResultRow,
  StatusBadge,
  Divider,
} from "./RFComponents";

interface Props {
  onInsert?: (html: string) => void;
}

const StabilityAnalyzer: React.FC<Props> = ({ onInsert }) => {
  const [s11Mag, setS11Mag] = useState("");
  const [s11Angle, setS11Angle] = useState("");
  const [s12Mag, setS12Mag] = useState("");
  const [s12Angle, setS12Angle] = useState("");
  const [s21Mag, setS21Mag] = useState("");
  const [s21Angle, setS21Angle] = useState("");
  const [s22Mag, setS22Mag] = useState("");
  const [s22Angle, setS22Angle] = useState("");
  const [result, setResult] = useState<StabilityResult | null>(null);

  const ports: SPort[] = [
    { label: "S11", mag: s11Mag, angle: s11Angle, setMag: setS11Mag, setAngle: setS11Angle },
    { label: "S12", mag: s12Mag, angle: s12Angle, setMag: setS12Mag, setAngle: setS12Angle },
    { label: "S21", mag: s21Mag, angle: s21Angle, setMag: setS21Mag, setAngle: setS21Angle },
    { label: "S22", mag: s22Mag, angle: s22Angle, setMag: setS22Mag, setAngle: setS22Angle },
  ];

  const handleCalculate = () => {
    try {
      const res = analyzeStability({
        S11: fromPolar(parseFloat(s11Mag), parseFloat(s11Angle)),
        S12: fromPolar(parseFloat(s12Mag), parseFloat(s12Angle)),
        S21: fromPolar(parseFloat(s21Mag), parseFloat(s21Angle)),
        S22: fromPolar(parseFloat(s22Mag), parseFloat(s22Angle)),
      });
      setResult(res);
    } catch {
      alert("Invalid input values");
    }
  };

  const generateHTML = (): string => {
    if (!result) return "";
    let html = `<h3>Transistor Stability Analysis</h3>`;
    html += `<p><strong>Δ:</strong> ${formatPolar(result.Delta)}, |Δ| = ${result.Delta_mag.toFixed(6)}</p>`;
    html += `<p><strong>K (Rollett):</strong> ${result.K.toFixed(6)}</p>`;
    html += `<p><strong>μ:</strong> ${result.mu.toFixed(6)}</p>`;
    html += `<p><strong>μ':</strong> ${result.mu_prime.toFixed(6)}</p>`;
    html += `<p><strong>Result:</strong> ${result.stability}</p>`;
    if (result.CL) {
      html += `<p><strong>Load Stability Circle:</strong> CL = ${formatComplex(result.CL)}, RL = ${result.RL!.toFixed(6)}</p>`;
    }
    if (result.CS) {
      html += `<p><strong>Source Stability Circle:</strong> CS = ${formatComplex(result.CS)}, RS = ${result.RS!.toFixed(6)}</p>`;
    }
    return html;
  };

  return (
    <ToolCard
      title="Transistor Stability Analyzer"
      description="Enter S-parameters in polar form: magnitude and angle (degrees)"
    >
      <SParameterInputs ports={ports} />

      <ActionBar
        onCalculate={handleCalculate}
        onInsert={result && onInsert ? () => onInsert(generateHTML()) : undefined}
      />

      {result && (
        <ResultCard>
          <ResultSection title="Stability criteria">
            <ResultRow
              label="Δ"
              value={formatPolar(result.Delta)}
              badge={<StatusBadge ok={result.Delta_mag < 1} />}
            />
            <ResultRow label="K (Rollett)" value={result.K.toFixed(6)} badge={<StatusBadge ok={result.K > 1} />} />
            <ResultRow label="μ" value={result.mu.toFixed(6)} badge={<StatusBadge ok={result.mu > 1} />} />
            <ResultRow
              label="μ′"
              value={result.mu_prime.toFixed(6)}
              badge={<StatusBadge ok={result.mu_prime > 1} />}
            />
          </ResultSection>

          <Divider />

          <p className="text-sm font-semibold text-foreground">{result.stability}</p>

          {result.CL && (
            <>
              <Divider />
              <ResultSection title="Load stability circle">
                <ResultRow label="Center CL" value={formatComplex(result.CL)} />
                <ResultRow label="Radius RL" value={result.RL!.toFixed(6)} />
              </ResultSection>
            </>
          )}
          {result.CS && (
            <ResultSection title="Source stability circle">
              <ResultRow label="Center CS" value={formatComplex(result.CS)} />
              <ResultRow label="Radius RS" value={result.RS!.toFixed(6)} />
            </ResultSection>
          )}
        </ResultCard>
      )}
    </ToolCard>
  );
};

export default StabilityAnalyzer;