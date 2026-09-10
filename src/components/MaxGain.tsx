import React, { useState } from "react";
import {
  calculateMaxGain,
  fromPolar,
  formatComplex,
  formatPolar,
  db,
  MaxGainResult,
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
  StatusBadge,
  Divider,
} from "./RFComponents";

interface Props {
  onInsert?: (html: string) => void;
}

const MaxGain: React.FC<Props> = ({ onInsert }) => {
  const [Z0, setZ0] = useState("50");
  const [freqGHz, setFreqGHz] = useState("");
  const [s11Mag, setS11Mag] = useState("");
  const [s11Angle, setS11Angle] = useState("");
  const [s12Mag, setS12Mag] = useState("");
  const [s12Angle, setS12Angle] = useState("");
  const [s21Mag, setS21Mag] = useState("");
  const [s21Angle, setS21Angle] = useState("");
  const [s22Mag, setS22Mag] = useState("");
  const [s22Angle, setS22Angle] = useState("");
  const [result, setResult] = useState<MaxGainResult | null>(null);

  const ports: SPort[] = [
    { label: "S11", mag: s11Mag, angle: s11Angle, setMag: setS11Mag, setAngle: setS11Angle },
    { label: "S12", mag: s12Mag, angle: s12Angle, setMag: setS12Mag, setAngle: setS12Angle },
    { label: "S21", mag: s21Mag, angle: s21Angle, setMag: setS21Mag, setAngle: setS21Angle },
    { label: "S22", mag: s22Mag, angle: s22Angle, setMag: setS22Mag, setAngle: setS22Angle },
  ];

  const handleCalculate = () => {
    try {
      const res = calculateMaxGain(
        fromPolar(parseFloat(s11Mag), parseFloat(s11Angle)),
        fromPolar(parseFloat(s12Mag), parseFloat(s12Angle)),
        fromPolar(parseFloat(s21Mag), parseFloat(s21Angle)),
        fromPolar(parseFloat(s22Mag), parseFloat(s22Angle)),
        parseFloat(Z0),
        freqGHz ? parseFloat(freqGHz) : undefined
      );
      setResult(res);
    } catch {
      alert("Invalid input values");
    }
  };

  const generateHTML = (): string => {
    if (!result) return "";
    let html = `<h3>GaAs FET Maximum Gain + Single-Stub Matching</h3>`;
    html += `<p><strong>Δ:</strong> ${formatPolar(result.Delta)}, |Δ| = ${result.Delta_mag.toFixed(6)}</p>`;
    html += `<p><strong>K:</strong> ${result.K.toFixed(6)}</p>`;
    html += `<p><strong>Status:</strong> ${result.isUnconditional ? "UNCONDITIONALLY STABLE" : "NOT UNCONDITIONALLY STABLE"}</p>`;
    if (result.bilateral) {
      html += `<h4>Bilateral Maximum Gain</h4>`;
      html += `<p>ΓS = ${formatPolar(result.bilateral.Gamma_S)}</p>`;
      html += `<p>ΓL = ${formatPolar(result.bilateral.Gamma_L)}</p>`;
      html += `<p>GT,max = ${result.bilateral.GT_max.toFixed(6)} (${result.bilateral.GT_max_dB.toFixed(4)} dB)</p>`;
    }
    html += `<h4>Unilateral Maximum Gain</h4>`;
    html += `<p>ΓS = ${formatPolar(result.unilateral.Gamma_S)}</p>`;
    html += `<p>ΓL = ${formatPolar(result.unilateral.Gamma_L)}</p>`;
    html += `<p>GTU,max = ${result.unilateral.GTU_max.toFixed(6)} (${result.unilateral.GTU_max_dB.toFixed(4)} dB)</p>`;
    return html;
  };

  return (
    <ToolCard
      title="GaAs FET Maximum Gain"
      description="Maximum gain with single-stub matching networks"
    >
      <FieldGrid>
        <Field
          label="Z0"
          hint="Ω"
          inputProps={{ type: "number", value: Z0, onChange: (e) => setZ0(e.target.value) }}
        />
        <Field
          label="Frequency"
          hint="GHz — optional"
          inputProps={{ type: "number", value: freqGHz, onChange: (e) => setFreqGHz(e.target.value) }}
        />
      </FieldGrid>

      <SParameterInputs ports={ports} />

      <ActionBar
        onCalculate={handleCalculate}
        onInsert={result && onInsert ? () => onInsert(generateHTML()) : undefined}
      />

      {result && (
        <ResultCard>
          <ResultRow label="Δ" value={formatPolar(result.Delta)} />
          <ResultRow
            label="|Δ|"
            value={result.Delta_mag.toFixed(6)}
            badge={<StatusBadge ok={result.Delta_mag < 1} />}
          />
          <ResultRow label="K" value={result.K.toFixed(6)} badge={<StatusBadge ok={result.K > 1} />} />
          <ResultRow
            label="Status"
            value={result.isUnconditional ? "UNCONDITIONALLY STABLE" : "NOT UNCONDITIONALLY STABLE"}
            badge={<StatusBadge ok={result.isUnconditional} />}
          />
          <Divider />

          {result.bilateral && (
            <>
              <ResultSection title="Bilateral maximum gain">
                <ResultRow label="ΓS" value={formatPolar(result.bilateral.Gamma_S)} />
                <ResultRow label="ΓL" value={formatPolar(result.bilateral.Gamma_L)} />
                <ResultRow
                  label="GT,max"
                  value={
                    <>
                      {result.bilateral.GT_max.toFixed(6)} ({result.bilateral.GT_max_dB.toFixed(4)} dB)
                    </>
                  }
                />
                {result.bilateral.inputMatch.length > 0 && (
                  <ResultRow
                    label="Input match (S1)"
                    value={
                      <>
                        d = {result.bilateral.inputMatch[0].d.toFixed(6)} λ, Open ={" "}
                        {result.bilateral.inputMatch[0].open.toFixed(6)} λ, Short ={" "}
                        {result.bilateral.inputMatch[0].short.toFixed(6)} λ
                      </>
                    }
                  />
                )}
                {result.bilateral.outputMatch.length > 0 && (
                  <ResultRow
                    label="Output match (S1)"
                    value={
                      <>
                        d = {result.bilateral.outputMatch[0].d.toFixed(6)} λ, Open ={" "}
                        {result.bilateral.outputMatch[0].open.toFixed(6)} λ, Short ={" "}
                        {result.bilateral.outputMatch[0].short.toFixed(6)} λ
                      </>
                    }
                  />
                )}
              </ResultSection>
              <Divider />
            </>
          )}

          <ResultSection title="Unilateral maximum gain">
            <ResultRow label="ΓS" value={formatPolar(result.unilateral.Gamma_S)} />
            <ResultRow label="ΓL" value={formatPolar(result.unilateral.Gamma_L)} />
            <ResultRow
              label="GTU,max"
              value={
                <>
                  {result.unilateral.GTU_max.toFixed(6)} ({result.unilateral.GTU_max_dB.toFixed(4)} dB)
                </>
              }
            />
            {result.unilateral.inputMatch.length > 0 && (
              <ResultRow
                label="Input match (S1)"
                value={
                  <>
                    d = {result.unilateral.inputMatch[0].d.toFixed(6)} λ, Open ={" "}
                    {result.unilateral.inputMatch[0].open.toFixed(6)} λ, Short ={" "}
                    {result.unilateral.inputMatch[0].short.toFixed(6)} λ
                  </>
                }
              />
            )}
            {result.unilateral.outputMatch.length > 0 && (
              <ResultRow
                label="Output match (S1)"
                value={
                  <>
                    d = {result.unilateral.outputMatch[0].d.toFixed(6)} λ, Open ={" "}
                    {result.unilateral.outputMatch[0].open.toFixed(6)} λ, Short ={" "}
                    {result.unilateral.outputMatch[0].short.toFixed(6)} λ
                  </>
                }
              />
            )}
          </ResultSection>
        </ResultCard>
      )}
    </ToolCard>
  );
};

export default MaxGain;