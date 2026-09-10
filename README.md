# RF-IOE-Calculations

[![npm version](https://img.shields.io/npm/v/ioe-rf-calculations.svg)](https://www.npmjs.com/package/ioe-rf-calculations)
[![npm license](https://img.shields.io/npm/l/ioe-rf-calculations.svg)](https://github.com/SahajShakya/RF-IOE-Calculations/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-%3E%3D18-61DAFB)](https://reactjs.org)

**RF/Microwave calculation utilities and ready-made React components** for undergraduate RF & microwave engineering (IOE curriculum).

> `npm install ioe-rf-calculations`

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Tailwind setup](#tailwind-setup)
- [React components](#react-components)
  - [Individual tools](#individual-tools)
  - [All-in-one selector](#all-in-one-selector)
  - [Component API](#component-api)
  - [Building blocks](#building-blocks)
- [Calculation functions (framework-free)](#calculation-functions-framework-free)
  - [Complex number helpers](#complex-number-helpers)
  - [Single stub matching](#single-stub-matching)
  - [Double stub matching](#double-stub-matching)
  - [Stability analysis](#stability-analysis)
  - [Power gain](#power-gain)
  - [Maximum gain](#maximum-gain-gaas-fet)
  - [Filter design](#filter-design)
- [Recipes](#recipes)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## Features

| Tool | Component | Function | Description |
| --- | --- | --- | --- |
| Single Shunt-Stub Matching | `<SingleStubMatch />` | `singleStubMatch` | Stub position & length (open/short) for impedance matching |
| Double Shunt-Stub Matching | `<DoubleStubMatch />` | `doubleStubMatch` | Two-stub matching with configurable spacing |
| Transistor Stability Analysis | `<StabilityAnalyzer />` | `analyzeStability` | K, μ, μ′ tests, Δ, stability circles |
| Bilateral & Unilateral Power Gain | `<PowerGain />` | `calculateGain` | GP, GA, GT with S-parameters |
| GaAs FET Maximum Gain | `<MaxGain />` | `calculateMaxGain` | Max gain + single-stub matching networks |
| Microwave Filter Design | `<FilterDesign />` | `designFilter` | Butterworth/Chebyshev LPF, HPF, BPF, BSF |

- **Two APIs in one package**: pure calculation functions usable anywhere (Node, browser, plain JS/TS) **and** polished React components.
- **No design-system dependencies**: components are self-contained Tailwind CSS primitives (styling matches the NerdStudyHub admin interface's own components). No Radix, no CVA, no icon libraries.
- **Optional `onInsert` prop**: get results as HTML to embed into rich-text editors (e.g. TinyMCE).
- **MIT licensed.**

---

## Installation

```bash
npm install ioe-rf-calculations
```

Peer dependencies:

| Package | Version |
| --- | --- |
| `react` | `>= 18` |
| `react-dom` | `>= 18` |

The package ships its own minimal Tailwind class names and has **zero runtime dependencies**, so there is nothing else to install.

---

## Tailwind setup

The React components are plain Tailwind utilities — no CSS variables, no design tokens, no extra plugins. Just make sure Tailwind generates classes for the package:

```js
// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/ioe-rf-calculations/dist/**/*.{js,mjs}", // <-- add this
  ],
  ...
}
```

That's it. The components use standard Tailwind color utilities (`gray-*`, `indigo-*`, `green-*`, `red-*`), so they work in any project that runs Tailwind.

---

## React components

### Individual tools

```tsx
import {
  SingleStubMatch,
  DoubleStubMatch,
  StabilityAnalyzer,
  PowerGain,
  MaxGain,
  FilterDesign,
} from "ioe-rf-calculations";

export function MyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <SingleStubMatch />
      <StabilityAnalyzer />
      <FilterDesign />
    </div>
  );
}
```

### All-in-one selector

```tsx
import { RFAnalysisSelector } from "ioe-rf-calculations";

export function ToolsPage() {
  return <RFAnalysisSelector />;
}
```

`RFAnalysisSelector` renders a card grid of all six tools and lets users switch between them — perfect for a single "Calculators" page.

### Component API

Every tool component accepts one optional prop:

| Prop | Type | Description |
| --- | --- | --- |
| `onInsert` | `(html: string) => void` | Receives the results rendered as HTML. Ideal for inserting results into a rich-text editor. |

```tsx
import { SingleStubMatch } from "ioe-rf-calculations";

// Inside a page that mounts TinyMCE
const handleInsert = (html: string) => {
  editorRef.current?.insertContent(html);
};

<SingleStubMatch onInsert={handleInsert} />;
```

`MaxGain` also accepts an optional `freqGHz` frequency field for cm-dimension stub matching.

### Building blocks

Want to compose your own calculator UI? The shared building blocks are exported:

```tsx
import {
  ToolCard,       // Card wrapper with title + description
  Field,          // labeled Input
  FieldGrid,      // responsive 2-col grid of Fields
  ActionBar,      // Calculate + Insert buttons
  ResultCard,     // results container
  ResultSection,  // titled result group
  ResultRow,      // label → value row (with optional StatusBadge)
  StatusBadge,    // ✓ / ✗ status badge
  SParameterInputs, // reusable S11/S12/S21/S22 mag+angle inputs
  Divider,
} from "ioe-rf-calculations";
```

---

## Calculation functions (framework-free)

Import any function directly — no React, no Tailwind required.

```ts
import {
  singleStubMatch,
  doubleStubMatch,
  analyzeStability,
  calculateGain,
  calculateMaxGain,
  designFilter,
  fromPolar,
} from "ioe-rf-calculations";
```

### Complex number helpers

The library represents complex numbers as `{ re: number; im: number }` objects.

```ts
import { complex, add, sub, mul, div, conjugate, abs, phase, fromPolar, toPolar, formatComplex, formatPolar, db } from "ioe-rf-calculations";

const z = complex(3, 4);        // 3 + j4
fromPolar(1, 45);               // from magnitude + angle (degrees)
toPolar(z);                     // { mag: 5, angleDeg: 53.13 }
formatComplex(z);               // "3.0000 + j4.0000"
formatPolar(fromPolar(1, 45));  // "1.0000 ∠ 45.00°"
db(10);                         // 20 (10x power -> 20 dB)
```

### Single stub matching

```ts
const result = singleStubMatch({
  inputType: "gamma",        // "gamma" | "zl"
  Z0: 50,
  freqGHz: 2.4,              // optional — adds cm dimensions
  gammaMag: 0.7,             // used when inputType === "gamma"
  gammaAngle: 120,           // degrees
  // or, for inputType === "zl":
  // zlRe: 25, zlIm: 10,
});

console.log(result.ZL, result.Gamma, result.VSWR);
console.log(result.zL, result.yL);

result.solutions.forEach((sol) => {
  console.log(sol.d, sol.b_stub, sol.open, sol.short);
});
// → stub position (λ), stub susceptance, open & short stub lengths (λ + cm when freqGHz is set)
```

### Double stub matching

```ts
const result = doubleStubMatch({
  inputType: "zl",
  Z0: 50,
  zlRe: 25,
  zlIm: 10,
  d1Lambda: 0.25,      // distance from load to first stub
  spacingLambda: 0.375, // stub separation in wavelengths
});

if (result.solutions.length === 0) {
  console.log("No solution exists for this configuration.");
} else {
  result.solutions.forEach((sol) => {
    console.log(sol.B_total, sol.b_stub1, sol.b_stub2, sol.open1, sol.short1, sol.open2, sol.short2);
  });
}
```

### Stability analysis

```ts
const result = analyzeStability({
  S11: fromPolar(0.6, 160),
  S12: fromPolar(0.05, 10),
  S21: fromPolar(2.5, -20),
  S22: fromPolar(0.5, -130),
});

console.log(result.Delta, result.Delta_mag);
console.log(result.K);           // Rollett stability factor
console.log(result.mu, result.mu_prime);
console.log(result.stability);   // e.g. "UNCONDITIONALLY STABLE"
console.log(result.CL, result.RL); // load stability circle (if any)
console.log(result.CS, result.RS); // source stability circle (if any)
```

### Power gain

```ts
const result = calculateGain({
  S11: fromPolar(0.6, 160),
  S12: fromPolar(0.05, 10),
  S21: fromPolar(2.5, -20),
  S22: fromPolar(0.5, -130),
  Z0: 50,
  ZS: 50,
  ZL: 50,
});

// Bilateral (S12 ≠ 0)
console.log(result.Gamma_S, result.Gamma_L, result.Gamma_in, result.Gamma_out);
console.log(result.GP_B, result.GA_B, result.GT_B);

// Unilateral (S12 = 0 approximation)
console.log(result.GP_U, result.GA_U, result.GT_U);
```

### Maximum gain (GaAs FET)

```ts
const result = calculateMaxGain(
  fromPolar(0.6, 160),  // S11
  fromPolar(0.05, 10),  // S12
  fromPolar(2.5, -20),  // S21
  fromPolar(0.5, -130), // S22
  50,                   // Z0
  9.5                   // freqGHz — optional, adds cm stub dimensions
);

console.log(result.isUnconditional, result.K, result.Delta_mag);

// Bilateral design: ΓS, ΓL, GT,max + single-stub input/output matching networks
console.log(result.bilateral.Gamma_S, result.bilateral.Gamma_L, result.bilateral.GT_max);
console.log(result.bilateral.inputMatch[0]);  // { d, open, short }
console.log(result.bilateral.outputMatch[0]);

// Unilateral design (S12 = 0)
console.log(result.unilateral.Gamma_S, result.unilateral.Gamma_L, result.unilateral.GTU_max);
```

### Filter design

```ts
const result = designFilter({
  approximation: "chebyshev",    // "butterworth" | "chebyshev"
  filterType: "lpf",             // "lpf" | "hpf" | "bpf" | "bsf"
  N: 3,                          // optional — computed from specs if omitted
  fc: 2.4,                       // cutoff frequency (GHz) for LPF / HPF
  fx: 3.5,                       // attenuation frequency (GHz)
  attenuation_db: 30,            // required attenuation @ fx
  ripple_db: 0.2,                // Chebyshev only
  f1: 1.8,                       // lower cutoff (GHz) for BPF / BSF
  f2: 2.4,                       // upper cutoff (GHz) for BPF / BSF
  Z0: 50,
});

console.log(result.N);       // computed order
console.log(result.g);       // prototype g-values
result.elements.forEach((el) => {
  console.log(el.k, el.topology, el.L, el.C);
});
```

---

## Recipes

### Insert results into TinyMCE (admin/editor flow)

```tsx
import { useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { SingleStubMatch } from "ioe-rf-calculations";

export function AdminEditor() {
  const editorRef = useRef<any>(null);
  return (
    <>
      <SingleStubMatch onInsert={(html) => editorRef.current?.insertContent(html)} />
      <Editor
        onInit={(_, editor) => (editorRef.current = editor)}
        apiKey="YOUR_TINYMCE_KEY"
        init={{ height: 400 }}
      />
    </>
  );
}
```

### Public calculator page (read-only)

```tsx
import { RFAnalysisSelector } from "ioe-rf-calculations";

export default function CalculatorsPage() {
  return (
    <section className="container py-10">
      <h1 className="mb-6 text-2xl font-bold">RF/Microwave Calculators</h1>
      <RFAnalysisSelector />
    </section>
  );
}
```

### Use in plain Node.js

```bash
npm install ioe-rf-calculations
```

```js
import { designFilter } from "ioe-rf-calculations"; // ESM
// const { designFilter } = require("ioe-rf-calculations"); // CJS

const f = designFilter({
  approximation: "butterworth",
  filterType: "lpf",
  fc: 2.4,
  fx: 3.5,
  attenuation_db: 30,
  Z0: 50,
});
console.log(f.N, f.elements);
```

---

## Development

```bash
git clone https://github.com/SahajShakya/RF-IOE-Calculations.git
cd RF-IOE-Calculations
npm install
npm run build      # typecheck + vite library build → dist/
npm run typecheck  # tsc --noEmit only
```

The repo mirrors the two-layer design:

```
src/
├── calculations.ts   # pure RF/microwave math (framework-free)
├── components/       # React tool components built on the primitives below
└── lib/              # tiny class-name helper (no external deps)
```

The styling for every component lives directly in `components/RFComponents.tsx` as bare Tailwind utilities, styled to match the NerdStudyHub admin UI's own components (Card, InputField, SelectField, SubmitButton). There is no UI library to configure.

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feat/my-feature`).
3. Commit your changes.
4. Open a pull request.

Bug reports and new RF/microwave tool ideas are welcome via [Issues](https://github.com/SahajShakya/RF-IOE-Calculations/issues).

---

## License

[MIT](./LICENSE) © 2026 Sahaj Shakya