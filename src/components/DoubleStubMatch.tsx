import React, { useState } from "react";
import {
  doubleStubMatch,
  formatComplex,
  formatPolar,
  DoubleStubSolution,
} from "../calculations";
import {
  ToolCard,
  FieldGrid,
  Field,
  Select,
  ActionBar,
  ResultCard,
  ResultSection,
  ResultRow,
  Divider,
} from "./RFComponents";

interface Props {
  onInsert?: (html: string) => void;
}

const LAMBDA_OPTIONS = [
  { id: "0.125", name: "λ / 8" },
  { id: "0.25", name: "λ / 4" },
  { id: "0.375", name: "3λ / 8" },
  { id: "0.5", name: "λ / 2" },
  { id: "0.625", name: "5λ / 8" },
  { id: "0.75", name: "3λ / 4" },
  { id: "0.875", name: "7λ / 8" },
  { id: "1", name: "λ" },
];

const DoubleStubMatch: React.FC<Props> = ({ onInsert }) => {
  const [inputType, setInputType] = useState<"gamma" | "zl">("zl");
  const [Z0, setZ0] = useState("50");
  const [freqGHz, setFreqGHz] = useState("");
  const [gammaMag, setGammaMag] = useState("");
  const [gammaAngle, setGammaAngle] = useState("");
  const [zlRe, setZlRe] = useState("");
  const [zlIm, setZlIm] = useState("0");
  const [d1Lambda, setD1Lambda] = useState("0.25");
  const [spacingLambda, setSpacingLambda] = useState("0.25");
  const [d1Custom, setD1Custom] = useState(false);
  const [spacingCustom, setSpacingCustom] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof doubleStubMatch> | null>(null);

  const handleCalculate = () => {
    try {
      const res = doubleStubMatch({
        inputType,
        Z0: parseFloat(Z0),
        freqGHz: freqGHz ? parseFloat(freqGHz) : undefined,
        gammaMag: inputType === "gamma" ? parseFloat(gammaMag) : undefined,
        gammaAngle: inputType === "gamma" ? parseFloat(gammaAngle) : undefined,
        zlRe: inputType === "zl" ? parseFloat(zlRe) : undefined,
        zlIm: inputType === "zl" ? parseFloat(zlIm) || 0 : undefined,
        d1Lambda: parseFloat(d1Lambda),
        spacingLambda: parseFloat(spacingLambda),
      });
      setResult(res);
    } catch {
      alert("Invalid input values");
    }
  };

  const generateHTML = (): string => {
    if (!result) return "";
    let html = `<h3>Double Shunt-Stub Matching Results</h3>`;
    html += `<p><strong>Load:</strong> ZL = ${formatComplex(result.ZL)} Ω</p>`;
    html += `<p><strong>ΓL:</strong> ${formatPolar(result.Gamma)}</p>`;
    html += `<p><strong>yL:</strong> ${formatComplex(result.yL)}</p>`;
    html += `<p><strong>y1 (at first stub):</strong> ${formatComplex(result.y1)}</p>`;
    result.solutions.forEach((sol: DoubleStubSolution, i: number) => {
      html += `<h4>Solution ${i + 1}</h4>`;
      html += `<p>B_total = ${sol.B_total.toFixed(6)}</p>`;
      html += `<p>b_stub1 = ${sol.b_stub1.toFixed(6)}</p>`;
      html += `<p>y2 = ${formatComplex(sol.y2)}</p>`;
      html += `<p>b_stub2 = ${sol.b_stub2.toFixed(6)}</p>`;
      html += `<p>Stub 1: Open = ${sol.open1.toFixed(6)} λ, Short = ${sol.short1.toFixed(6)} λ</p>`;
      html += `<p>Stub 2: Open = ${sol.open2.toFixed(6)} λ, Short = ${sol.short2.toFixed(6)} λ</p>`;
    });
    return html;
  };

  return (
    <ToolCard
      title="Double Shunt-Stub Matching"
      description="Two-stub matching with configurable spacing"
    >
      <Select
        label="Input type"
        value={inputType}
        onValueChange={(v) => setInputType(v as "gamma" | "zl")}
        options={[
          { id: "gamma", name: "ΓL Input" },
          { id: "zl", name: "ZL Input" },
        ]}
      />

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

      <FieldGrid>
        <div className="rf-port-box">
          {d1Custom ? (
            <Field
              label="d1"
              hint="λ — custom"
              inputProps={{
                type: "number",
                step: "0.001",
                value: d1Lambda,
                onChange: (e) => setD1Lambda(e.target.value),
              }}
            />
          ) : (
            <Select
              label="d1"
              value={d1Lambda}
              onValueChange={setD1Lambda}
              options={LAMBDA_OPTIONS}
            />
          )}
          <label className="rf-checkbox">
            <input
              type="checkbox"
              checked={d1Custom}
              onChange={(e) => setD1Custom(e.target.checked)}
            />
            <span>Enter custom value</span>
          </label>
        </div>
        <div className="rf-port-box">
          {spacingCustom ? (
            <Field
              label="Stub spacing"
              hint="λ — custom"
              inputProps={{
                type: "number",
                step: "0.001",
                value: spacingLambda,
                onChange: (e) => setSpacingLambda(e.target.value),
              }}
            />
          ) : (
            <Select
              label="Stub spacing"
              value={spacingLambda}
              onValueChange={setSpacingLambda}
              options={LAMBDA_OPTIONS}
            />
          )}
          <label className="rf-checkbox">
            <input
              type="checkbox"
              checked={spacingCustom}
              onChange={(e) => setSpacingCustom(e.target.checked)}
            />
            <span>Enter custom value</span>
          </label>
        </div>
      </FieldGrid>

      {inputType === "gamma" ? (
        <FieldGrid>
          <Field
            label="|ΓL|"
            inputProps={{
              type: "number",
              step: "0.01",
              value: gammaMag,
              onChange: (e) => setGammaMag(e.target.value),
            }}
          />
          <Field
            label="∠ΓL"
            hint="degrees"
            inputProps={{
              type: "number",
              step: "0.1",
              value: gammaAngle,
              onChange: (e) => setGammaAngle(e.target.value),
            }}
          />
        </FieldGrid>
      ) : (
        <FieldGrid>
          <Field
            label="ZL Real"
            inputProps={{ type: "number", value: zlRe, onChange: (e) => setZlRe(e.target.value) }}
          />
          <Field
            label="ZL Imaginary"
            inputProps={{ type: "number", value: zlIm, onChange: (e) => setZlIm(e.target.value) }}
          />
        </FieldGrid>
      )}

      <ActionBar
        onCalculate={handleCalculate}
        onInsert={result && onInsert ? () => onInsert(generateHTML()) : undefined}
      />

      {result && (
        <ResultCard>
          <ResultRow label="Load" value={<>{formatComplex(result.ZL)} Ω</>} />
          <ResultRow label="Reflection coefficient" value={formatPolar(result.Gamma)} />
          <ResultRow label="yL" value={formatComplex(result.yL)} />
          <ResultRow label="y1 (at first stub)" value={formatComplex(result.y1)} />
          <Divider />
          {result.solutions.length === 0 ? (
            <p className="rf-text-destructive">
              No solution exists for this configuration.
            </p>
          ) : (
            result.solutions.map((sol, i) => (
              <ResultSection key={i} title={`Solution ${i + 1}`}>
                <ResultRow label="B_total" value={sol.B_total.toFixed(6)} />
                <ResultRow label="b_stub1" value={sol.b_stub1.toFixed(6)} />
                <ResultRow label="y2" value={formatComplex(sol.y2)} />
                <ResultRow label="b_stub2" value={sol.b_stub2.toFixed(6)} />
                <ResultRow
                  label="Stub 1 length"
                  value={
                    <>
                      Open = {sol.open1.toFixed(6)} λ, Short = {sol.short1.toFixed(6)} λ
                    </>
                  }
                />
                <ResultRow
                  label="Stub 2 length"
                  value={
                    <>
                      Open = {sol.open2.toFixed(6)} λ, Short = {sol.short2.toFixed(6)} λ
                    </>
                  }
                />
              </ResultSection>
            ))
          )}
        </ResultCard>
      )}
    </ToolCard>
  );
};

export default DoubleStubMatch;