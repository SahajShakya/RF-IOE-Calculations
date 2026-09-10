import React, { useState } from "react";
import { designFilter, FilterResult } from "../calculations";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface Props {
  onInsert?: (html: string) => void;
}

const FilterDesign: React.FC<Props> = ({ onInsert }) => {
  const [approximation, setApproximation] = useState<"butterworth" | "chebyshev">("butterworth");
  const [filterType, setFilterType] = useState<"lpf" | "hpf" | "bpf" | "bsf">("lpf");
  const [N, setN] = useState("");
  const [fc, setFc] = useState("");
  const [fx, setFx] = useState("");
  const [attenuation_db, setAttenuationDb] = useState("");
  const [ripple_db, setRippleDb] = useState("0.2");
  const [f1, setF1] = useState("");
  const [f2, setF2] = useState("");
  const [Z0, setZ0] = useState("50");
  const [result, setResult] = useState<FilterResult | null>(null);

  const handleCalculate = () => {
    try {
      const res = designFilter({
        approximation,
        filterType,
        N: N ? parseInt(N) : undefined,
        fc: fc ? parseFloat(fc) : undefined,
        fx: fx ? parseFloat(fx) : undefined,
        attenuation_db: attenuation_db ? parseFloat(attenuation_db) : undefined,
        ripple_db: approximation === "chebyshev" ? parseFloat(ripple_db) : undefined,
        f1: f1 ? parseFloat(f1) : undefined,
        f2: f2 ? parseFloat(f2) : undefined,
        Z0: parseFloat(Z0),
      });
      setResult(res);
    } catch {
      alert("Invalid input values");
    }
  };

  const generateHTML = (): string => {
    if (!result) return "";
    let html = `<h3>Microwave Filter Design</h3>`;
    html += `<p><strong>Approximation:</strong> ${approximation === "butterworth" ? "Butterworth" : "Chebyshev"}</p>`;
    html += `<p><strong>Filter Type:</strong> ${filterType.toUpperCase()}</p>`;
    html += `<p><strong>Order N:</strong> ${result.N}</p>`;
    html += `<p><strong>Z0:</strong> ${Z0} Ω</p>`;
    html += `<h4>Prototype g-values</h4>`;
    html += `<ul>`;
    result.g.forEach((val, i) => {
      html += `<li>g${i} = ${val.toFixed(8)}</li>`;
    });
    html += `</ul>`;
    html += `<h4>Component Values</h4>`;
    html += `<ul>`;
    result.elements.forEach((el) => {
      html += `<li>g${el.k} — ${el.topology}`;
      if (el.L !== null) html += `: L = ${(el.L * 1e9).toFixed(6)} nH`;
      if (el.C !== null) html += `: C = ${(el.C * 1e12).toFixed(6)} pF`;
      html += `</li>`;
    });
    html += `</ul>`;
    return html;
  };

  return (
    <ToolCard
      title="Microwave Filter Design"
      description="Butterworth / Chebyshev LPF, HPF, BPF, BSF synthesis"
    >
      <FieldGrid>
        <Select value={approximation} onValueChange={(v) => setApproximation(v as "butterworth" | "chebyshev")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Approximation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="butterworth">Butterworth</SelectItem>
            <SelectItem value="chebyshev">Chebyshev</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={(v) => setFilterType(v as "lpf" | "hpf" | "bpf" | "bsf")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="lpf">Low-Pass (LPF)</SelectItem>
            <SelectItem value="hpf">High-Pass (HPF)</SelectItem>
            <SelectItem value="bpf">Band-Pass (BPF)</SelectItem>
            <SelectItem value="bsf">Band-Stop (BSF)</SelectItem>
          </SelectContent>
        </Select>
      </FieldGrid>

      <FieldGrid>
        <Field
          label="Order N"
          hint="leave empty to calculate"
          inputProps={{ type: "number", min: "1", value: N, onChange: (e) => setN(e.target.value) }}
        />
        <Field
          label="Z0"
          hint="Ω"
          inputProps={{ type: "number", value: Z0, onChange: (e) => setZ0(e.target.value) }}
        />
      </FieldGrid>

      <FieldGrid>
        {approximation === "chebyshev" && (
          <Field
            label="Pass-band ripple"
            hint="dB"
            inputProps={{
              type: "number",
              step: "0.01",
              value: ripple_db,
              onChange: (e) => setRippleDb(e.target.value),
            }}
          />
        )}
        {!N && (
          <>
            <Field
              label="Cutoff freq fc"
              hint="GHz"
              inputProps={{
                type: "number",
                step: "0.01",
                value: fc,
                onChange: (e) => setFc(e.target.value),
              }}
            />
            <Field
              label="Attenuation freq fx"
              hint="GHz"
              inputProps={{
                type: "number",
                step: "0.01",
                value: fx,
                onChange: (e) => setFx(e.target.value),
              }}
            />
            <Field
              label="Required attenuation"
              hint="dB"
              inputProps={{
                type: "number",
                step: "0.1",
                value: attenuation_db,
                onChange: (e) => setAttenuationDb(e.target.value),
              }}
            />
          </>
        )}
        {(filterType === "lpf" || filterType === "hpf") && (
          <Field
            label="Cutoff frequency fc"
            hint="GHz"
            inputProps={{
              type: "number",
              step: "0.01",
              value: fc,
              onChange: (e) => setFc(e.target.value),
            }}
          />
        )}
        {(filterType === "bpf" || filterType === "bsf") && (
          <>
            <Field
              label="Lower freq f1"
              hint="GHz"
              inputProps={{
                type: "number",
                step: "0.01",
                value: f1,
                onChange: (e) => setF1(e.target.value),
              }}
            />
            <Field
              label="Upper freq f2"
              hint="GHz"
              inputProps={{
                type: "number",
                step: "0.01",
                value: f2,
                onChange: (e) => setF2(e.target.value),
              }}
            />
          </>
        )}
      </FieldGrid>

      <ActionBar
        onCalculate={handleCalculate}
        onInsert={result && onInsert ? () => onInsert(generateHTML()) : undefined}
      />

      {result && (
        <ResultCard>
          <ResultRow label="Order N" value={result.N} />
          <Divider />

          <ResultSection title="Prototype g-values">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Index</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.g.map((val, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">g{i}</TableCell>
                    <TableCell className="text-right">{val.toFixed(8)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ResultSection>

          <Divider />

          <ResultSection title="Component values">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Element</TableHead>
                  <TableHead>Topology</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.elements.map((el) => (
                  <TableRow key={el.k}>
                    <TableCell className="font-medium">g{el.k}</TableCell>
                    <TableCell>{el.topology}</TableCell>
                    <TableCell className="text-right">
                      {el.L !== null && `L = ${(el.L * 1e9).toFixed(6)} nH`}
                      {el.C !== null && `C = ${(el.C * 1e12).toFixed(6)} pF`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ResultSection>
        </ResultCard>
      )}
    </ToolCard>
  );
};

export default FilterDesign;