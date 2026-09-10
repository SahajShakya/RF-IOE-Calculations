import React, { useState } from "react";
import {
  calculateGain,
  fromPolar,
  formatPolar,
  db,
  GainResult,
} from "../calculations";
import {
  ToolCard,
  FieldGrid,
  Field,
  SParameterInputs,
  SPort,
  ActionBar,
  ResultCard,
  ResultSection,
  ResultRow,
  Divider,
} from "./RFComponents";

interface Props {
  onInsert?: (html: string) => void;
}

const PowerGain: React.FC<Props> = ({ onInsert }) => {
  const [s11Mag, setS11Mag] = useState("");
  const [s11Angle, setS11Angle] = useState("");
  const [s12Mag, setS12Mag] = useState("");
  const [s12Angle, setS12Angle] = useState("");
  const [s21Mag, setS21Mag] = useState("");
  const [s21Angle, setS21Angle] = useState("");
  const [s22Mag, setS22Mag] = useState("");
  const [s22Angle, setS22Angle] = useState("");
  const [Z0, setZ0] = useState("50");
  const [ZS, setZS] = useState("50");
  const [ZL, setZL] = useState("50");
  const [result, setResult] = useState<GainResult | null>(null);

  const ports: SPort[] = [
    { label: "S11", mag: s11Mag, angle: s11Angle, setMag: setS11Mag, setAngle: setS11Angle },
    { label: "S12", mag: s12Mag, angle: s12Angle, setMag: setS12Mag, setAngle: setS12Angle },
    { label: "S21", mag: s21Mag, angle: s21Angle, setMag: setS21Mag, setAngle: setS21Angle },
    { label: "S22", mag: s22Mag, angle: s22Angle, setMag: setS22Mag, setAngle: setS22Angle },
  ];

  const handleCalculate = () => {
    try {
      const res = calculateGain({
        S11: fromPolar(parseFloat(s11Mag), parseFloat(s11Angle)),
        S12: fromPolar(parseFloat(s12Mag), parseFloat(s12Angle)),
        S21: fromPolar(parseFloat(s21Mag), parseFloat(s21Angle)),
        S22: fromPolar(parseFloat(s22Mag), parseFloat(s22Angle)),
        Z0: parseFloat(Z0),
        ZS: parseFloat(ZS),
        ZL: parseFloat(ZL),
      });
      setResult(res);
    } catch {
      alert("Invalid input values");
    }
  };

  const generateHTML = (): string => {
    if (!result) return "";
    let html = `<h3>Bilateral & Unilateral Power Gain</h3>`;
    html += `<h4>Bilateral</h4>`;
    html += `<p>ΓS = ${formatPolar(result.Gamma_S)}, ΓL = ${formatPolar(result.Gamma_L)}</p>`;
    html += `<p>Γin = ${formatPolar(result.Gamma_in)}, Γout = ${formatPolar(result.Gamma_out)}</p>`;
    html += `<p>GP = ${result.GP_B.toFixed(6)} (${db(result.GP_B).toFixed(4)} dB)</p>`;
    html += `<p>GA = ${result.GA_B.toFixed(6)} (${db(result.GA_B).toFixed(4)} dB)</p>`;
    html += `<p>GT = ${result.GT_B.toFixed(6)} (${db(result.GT_B).toFixed(4)} dB)</p>`;
    html += `<h4>Unilateral</h4>`;
    html += `<p>GP = ${result.GP_U.toFixed(6)} (${db(result.GP_U).toFixed(4)} dB)</p>`;
    html += `<p>GA = ${result.GA_U.toFixed(6)} (${db(result.GA_U).toFixed(4)} dB)</p>`;
    html += `<p>GT = ${result.GT_U.toFixed(6)} (${db(result.GT_U).toFixed(4)} dB)</p>`;
    return html;
  };

  return (
    <ToolCard
      title="Bilateral & Unilateral Power Gain"
      description="Compute GP, GA, GT from S-parameters"
    >
      <SParameterInputs ports={ports} />

      <FieldGrid>
        <Field
          label="Z0"
          hint="Ω"
          inputProps={{ type: "number", value: Z0, onChange: (e) => setZ0(e.target.value) }}
        />
        <Field
          label="ZS"
          hint="Ω"
          inputProps={{ type: "number", value: ZS, onChange: (e) => setZS(e.target.value) }}
        />
        <Field
          label="ZL"
          hint="Ω"
          inputProps={{ type: "number", value: ZL, onChange: (e) => setZL(e.target.value) }}
        />
      </FieldGrid>

      <ActionBar
        onCalculate={handleCalculate}
        onInsert={result && onInsert ? () => onInsert(generateHTML()) : undefined}
      />

      {result && (
        <ResultCard>
          <ResultSection title="Reflection coefficients">
            <ResultRow label="ΓS" value={formatPolar(result.Gamma_S)} />
            <ResultRow label="ΓL" value={formatPolar(result.Gamma_L)} />
            <ResultRow label="Γin" value={formatPolar(result.Gamma_in)} />
            <ResultRow label="Γout" value={formatPolar(result.Gamma_out)} />
          </ResultSection>

          <Divider />

          <ResultSection title="Bilateral case">
            <ResultRow label="GP" value={<>{result.GP_B.toFixed(6)} ({db(result.GP_B).toFixed(4)} dB)</>} />
            <ResultRow label="GA" value={<>{result.GA_B.toFixed(6)} ({db(result.GA_B).toFixed(4)} dB)</>} />
            <ResultRow label="GT" value={<>{result.GT_B.toFixed(6)} ({db(result.GT_B).toFixed(4)} dB)</>} />
          </ResultSection>

          <Divider />

          <ResultSection title="Unilateral case (S12 = 0)">
            <ResultRow label="GP" value={<>{result.GP_U.toFixed(6)} ({db(result.GP_U).toFixed(4)} dB)</>} />
            <ResultRow label="GA" value={<>{result.GA_U.toFixed(6)} ({db(result.GA_U).toFixed(4)} dB)</>} />
            <ResultRow label="GT" value={<>{result.GT_U.toFixed(6)} ({db(result.GT_U).toFixed(4)} dB)</>} />
          </ResultSection>
        </ResultCard>
      )}
    </ToolCard>
  );
};

export default PowerGain;