import React, { useState } from "react";
import {
  singleStubMatch,
  formatComplex,
  formatPolar,
  SingleStubSolution,
} from "../calculations";
import {
  ToolCard,
  FieldGrid,
  Field,
  ActionBar,
  ResultCard,
  ResultSection,
  ResultRow,
  Divider,
} from "./RFComponents";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Props {
  onInsert?: (html: string) => void;
}

const SingleStubMatch: React.FC<Props> = ({ onInsert }) => {
  const [inputType, setInputType] = useState<"gamma" | "zl">("gamma");
  const [Z0, setZ0] = useState("50");
  const [freqGHz, setFreqGHz] = useState("");
  const [gammaMag, setGammaMag] = useState("");
  const [gammaAngle, setGammaAngle] = useState("");
  const [zlRe, setZlRe] = useState("");
  const [zlIm, setZlIm] = useState("0");
  const [result, setResult] = useState<ReturnType<typeof singleStubMatch> | null>(null);

  const handleCalculate = () => {
    try {
      const res = singleStubMatch({
        inputType,
        Z0: parseFloat(Z0),
        freqGHz: freqGHz ? parseFloat(freqGHz) : undefined,
        gammaMag: inputType === "gamma" ? parseFloat(gammaMag) : undefined,
        gammaAngle: inputType === "gamma" ? parseFloat(gammaAngle) : undefined,
        zlRe: inputType === "zl" ? parseFloat(zlRe) : undefined,
        zlIm: inputType === "zl" ? parseFloat(zlIm) || 0 : undefined,
      });
      setResult(res);
    } catch {
      alert("Invalid input values");
    }
  };

  const generateHTML = (): string => {
    if (!result) return "";
    let html = `<h3>Single Shunt-Stub Matching Results</h3>`;
    html += `<p><strong>Load Impedance:</strong> ${formatComplex(result.ZL)} Ω</p>`;
    html += `<p><strong>Reflection Coefficient:</strong> ${formatPolar(result.Gamma)}</p>`;
    html += `<p><strong>VSWR:</strong> ${result.VSWR.toFixed(6)}</p>`;
    html += `<p><strong>Normalized Load:</strong> zL = ${formatComplex(result.zL)}, yL = ${formatComplex(result.yL)}</p>`;
    result.solutions.forEach((sol: SingleStubSolution, i: number) => {
      html += `<h4>Solution ${i + 1}</h4>`;
      html += `<p>d = ${sol.d.toFixed(6)} λ</p>`;
      html += `<p>y(d) = ${formatComplex(sol.y_d)}</p>`;
      html += `<p>b_stub = ${sol.b_stub.toFixed(6)}</p>`;
      html += `<p>Open stub: l = ${sol.open.toFixed(6)} λ</p>`;
      html += `<p>Short stub: l = ${sol.short.toFixed(6)} λ</p>`;
      if (sol.wavelength) {
        html += `<p>d = ${(sol.d * sol.wavelength * 100).toFixed(4)} cm</p>`;
        html += `<p>Open = ${(sol.open * sol.wavelength * 100).toFixed(4)} cm</p>`;
        html += `<p>Short = ${(sol.short * sol.wavelength * 100).toFixed(4)} cm</p>`;
      }
    });
    return html;
  };

  return (
    <ToolCard
      title="Single Shunt-Stub Matching"
      description="Find the stub position and length for impedance matching"
    >
      <Select value={inputType} onValueChange={(v) => setInputType(v as "gamma" | "zl")}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="Input type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="gamma">ΓL Input</SelectItem>
          <SelectItem value="zl">ZL Input</SelectItem>
        </SelectContent>
      </Select>

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
          <ResultRow label="Load impedance" value={<>{formatComplex(result.ZL)} Ω</>} />
          <ResultRow label="Reflection coefficient" value={formatPolar(result.Gamma)} />
          <ResultRow label="VSWR" value={result.VSWR.toFixed(6)} />
          <ResultRow
            label="Normalized load"
            value={<>{formatComplex(result.zL)} / yL = {formatComplex(result.yL)}</>}
          />
          <Divider />
          {result.solutions.map((sol, i) => (
            <ResultSection key={i} title={`Solution ${i + 1}`}>
              <ResultRow
                label="Stub position d"
                value={
                  <>
                    {sol.d.toFixed(6)} λ
                    {sol.wavelength ? ` = ${(sol.d * sol.wavelength * 100).toFixed(4)} cm` : ""}
                  </>
                }
              />
              <ResultRow label="y(d)" value={formatComplex(sol.y_d)} />
              <ResultRow label="b_stub" value={sol.b_stub.toFixed(6)} />
              <ResultRow
                label="Open stub"
                value={
                  <>
                    {sol.open.toFixed(6)} λ
                    {sol.wavelength ? ` = ${(sol.open * sol.wavelength * 100).toFixed(4)} cm` : ""}
                  </>
                }
              />
              <ResultRow
                label="Short stub"
                value={
                  <>
                    {sol.short.toFixed(6)} λ
                    {sol.wavelength ? ` = ${(sol.short * sol.wavelength * 100).toFixed(4)} cm` : ""}
                  </>
                }
              />
            </ResultSection>
          ))}
        </ResultCard>
      )}
    </ToolCard>
  );
};

export default SingleStubMatch;