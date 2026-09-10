// ============================================================
// RF/MICROWAVE CALCULATION UTILITIES
// JavaScript equivalents of Python RF calculators
// ============================================================

// ------------------------------------------------------------
// COMPLEX NUMBER HELPERS
// ------------------------------------------------------------

export interface Complex {
  re: number;
  im: number;
}

export function complex(re: number, im: number = 0): Complex {
  return { re, im };
}

export function add(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function sub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function mul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function div(a: Complex, b: Complex): Complex {
  const denom = b.re * b.re + b.im * b.im;
  if (denom < 1e-30) return { re: 0, im: 0 };
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
}

export function conjugate(z: Complex): Complex {
  return { re: z.re, im: -z.im };
}

export function abs(z: Complex): number {
  return Math.sqrt(z.re * z.re + z.im * z.im);
}

export function phase(z: Complex): number {
  return Math.atan2(z.im, z.re);
}

export function fromPolar(mag: number, angleDeg: number): Complex {
  const rad = (angleDeg * Math.PI) / 180;
  return { re: mag * Math.cos(rad), im: mag * Math.sin(rad) };
}

export function toPolar(z: Complex): { mag: number; angleDeg: number } {
  return { mag: abs(z), angleDeg: (phase(z) * 180) / Math.PI };
}

export function formatComplex(z: Complex): string {
  if (Math.abs(z.im) < 1e-10) return z.re.toFixed(6);
  const sign = z.im >= 0 ? "+" : "-";
  return `${z.re.toFixed(6)} ${sign} j${Math.abs(z.im).toFixed(6)}`;
}

export function formatPolar(z: Complex): string {
  const p = toPolar(z);
  return `${p.mag.toFixed(6)} ∠ ${p.angleDeg.toFixed(6)}°`;
}

export function db(value: number): number {
  if (value <= 0) return -Infinity;
  return 10 * Math.log10(value);
}

// ------------------------------------------------------------
// SINGLE SHUNT-STUB MATCHING
// ------------------------------------------------------------

export interface SingleStubInput {
  inputType: "gamma" | "zl";
  Z0: number;
  freqGHz?: number;
  gammaMag?: number;
  gammaAngle?: number;
  zlRe?: number;
  zlIm?: number;
}

export interface SingleStubSolution {
  d: number;
  y_d: Complex;
  b_stub: number;
  open: number;
  short: number;
  swr?: number;
  wavelength?: number;
}

export function singleStubMatch(input: SingleStubInput): {
  ZL: Complex;
  Gamma: Complex;
  zL: Complex;
  yL: Complex;
  VSWR: number;
  solutions: SingleStubSolution[];
  wavelength?: number;
} {
  const { Z0, inputType, freqGHz } = input;
  let Gamma: Complex;
  let ZL: Complex;

  if (inputType === "gamma") {
    Gamma = fromPolar(input.gammaMag!, input.gammaAngle!);
    ZL = mul({ re: Z0, im: 0 }, div(add({ re: 1, im: 0 }, Gamma), sub({ re: 1, im: 0 }, Gamma)));
  } else {
    ZL = { re: input.zlRe!, im: input.zlIm || 0 };
    Gamma = div(sub(ZL, { re: Z0, im: 0 }), add(ZL, { re: Z0, im: 0 }));
  }

  const wavelength = freqGHz ? (3e8 / (freqGHz * 1e9)) : undefined;

  const zL = { re: ZL.re / Z0, im: ZL.im / Z0 };
  const yL = div({ re: 1, im: 0 }, zL);
  const gL = yL.re;
  const bL = yL.im;

  const gammaMag = abs(Gamma);
  const VSWR = (1 + gammaMag) / (1 - gammaMag);

  const A = gL * gL + bL * bL - gL;
  const Bq = -2 * bL;
  const Cq = 1 - gL;
  const D = Bq * Bq - 4 * A * Cq;

  const solutions: SingleStubSolution[] = [];

  if (D >= 0) {
    const sqrtD = Math.sqrt(D);
    const tValues = [(-Bq + sqrtD) / (2 * A), (-Bq - sqrtD) / (2 * A)];

    for (const t of tValues) {
      let angleD = Math.atan(t);
      if (angleD < 0) angleD += Math.PI;
      const d = angleD / (2 * Math.PI);

      const tComplex = { re: 0, im: t };
      const y_d = div(add(yL, tComplex), add({ re: 1, im: 0 }, mul(yL, tComplex)));

      const B_stub = -y_d.im;
      const b_stub = -y_d.im;

      let angleOpen = Math.atan(b_stub);
      if (angleOpen < 0) angleOpen += Math.PI;
      const open = angleOpen / (2 * Math.PI);

      let lShort: number;
      if (Math.abs(b_stub) < 1e-12) {
        lShort = 0.25;
      } else {
        let angleShort = Math.atan(-1 / b_stub);
        if (angleShort < 0) angleShort += Math.PI;
        lShort = angleShort / (2 * Math.PI);
      }

      solutions.push({ d, y_d, b_stub, open, short: lShort, wavelength });
    }
  }

  return { ZL, Gamma, zL, yL, VSWR, solutions, wavelength };
}

// ------------------------------------------------------------
// DOUBLE SHUNT-STUB MATCHING
// ------------------------------------------------------------

export function transformAdmittance(y: Complex, distLambda: number): Complex {
  const betaD = 2 * Math.PI * distLambda;
  const t = Math.tan(betaD);
  const tComplex = { re: 0, im: t };
  return div(add(y, tComplex), add({ re: 1, im: 0 }, mul(y, tComplex)));
}

export function openStubLength(b: number): number {
  let angle = Math.atan(b);
  if (angle < 0) angle += Math.PI;
  return angle / (2 * Math.PI);
}

export function shortStubLength(b: number): number {
  if (Math.abs(b) < 1e-12) return 0.25;
  let angle = Math.atan(-1 / b);
  if (angle < 0) angle += Math.PI;
  return angle / (2 * Math.PI);
}

export interface DoubleStubInput {
  inputType: "gamma" | "zl";
  Z0: number;
  freqGHz?: number;
  gammaMag?: number;
  gammaAngle?: number;
  zlRe?: number;
  zlIm?: number;
  d1Lambda: number;
  spacingLambda: number;
}

export interface DoubleStubSolution {
  B_total: number;
  b_stub1: number;
  y2: Complex;
  b_stub2: number;
  open1: number;
  short1: number;
  open2: number;
  short2: number;
}

export function doubleStubMatch(input: DoubleStubInput): {
  ZL: Complex;
  Gamma: Complex;
  zL: Complex;
  yL: Complex;
  y1: Complex;
  solutions: DoubleStubSolution[];
  wavelength?: number;
} {
  const { Z0, inputType, freqGHz, d1Lambda, spacingLambda } = input;
  let Gamma: Complex;
  let ZL: Complex;

  if (inputType === "gamma") {
    Gamma = fromPolar(input.gammaMag!, input.gammaAngle!);
    ZL = mul({ re: Z0, im: 0 }, div(add({ re: 1, im: 0 }, Gamma), sub({ re: 1, im: 0 }, Gamma)));
  } else {
    ZL = { re: input.zlRe!, im: input.zlIm || 0 };
    Gamma = div(sub(ZL, { re: Z0, im: 0 }), add(ZL, { re: Z0, im: 0 }));
  }

  const wavelength = freqGHz ? (3e8 / (freqGHz * 1e9)) : undefined;

  const zL = { re: ZL.re / Z0, im: ZL.im / Z0 };
  const yL = div({ re: 1, im: 0 }, zL);

  const y1 = transformAdmittance(yL, d1Lambda);
  const g1 = y1.re;
  const b1 = y1.im;

  const betaD12 = 2 * Math.PI * spacingLambda;
  const t = Math.tan(betaD12);

  const solutions: DoubleStubSolution[] = [];

  if (Math.abs(t) > 1e-12) {
    const rhs = g1 * (1 + t * t) - (g1 * t) * (g1 * t);

    if (rhs >= -1e-10) {
      const sqrtRhs = Math.sqrt(Math.max(rhs, 0));
      const B_totals = [(1 + sqrtRhs) / t, (1 - sqrtRhs) / t];

      for (const B_total of B_totals) {
        const b_stub1 = B_total - b1;

        const y_after = { re: g1, im: B_total };
        const y_before_stub2 = transformAdmittance(y_after, spacingLambda);
        const b_stub2 = -y_before_stub2.im;

        solutions.push({
          B_total,
          b_stub1,
          y2: y_before_stub2,
          b_stub2,
          open1: openStubLength(b_stub1),
          short1: shortStubLength(b_stub1),
          open2: openStubLength(b_stub2),
          short2: shortStubLength(b_stub2),
        });
      }
    }
  }

  return { ZL, Gamma, zL, yL, y1, solutions, wavelength };
}

// ------------------------------------------------------------
// STABILITY ANALYSIS
// ------------------------------------------------------------

export interface StabilityInput {
  S11: Complex;
  S12: Complex;
  S21: Complex;
  S22: Complex;
}

export interface StabilityResult {
  Delta: Complex;
  Delta_mag: number;
  K: number;
  mu: number;
  mu_prime: number;
  isUnconditional: boolean;
  stability: string;
  CL?: Complex;
  RL?: number;
  CS?: Complex;
  RS?: number;
}

export function analyzeStability(input: StabilityInput): StabilityResult {
  const { S11, S12, S21, S22 } = input;

  const Delta = sub(mul(S11, S22), mul(S12, S21));
  const Delta_mag = abs(Delta);

  const denom_K = 2 * abs(mul(S12, S21));
  let K: number;
  if (denom_K > 1e-12) {
    K = (1 - abs(S11) ** 2 - abs(S22) ** 2 + Delta_mag ** 2) / denom_K;
  } else {
    K = Infinity;
  }

  // mu
  const mu_num = 1 - abs(S11) ** 2;
  const mu_den = abs(sub(S22, mul(Delta, conjugate(S11)))) + abs(mul(S12, S21));
  const mu = mu_den > 1e-12 ? mu_num / mu_den : Infinity;

  // mu prime
  const mu_prime_num = 1 - abs(S22) ** 2;
  const mu_prime_den = abs(sub(S11, mul(Delta, conjugate(S22)))) + abs(mul(S12, S21));
  const mu_prime = mu_prime_den > 1e-12 ? mu_prime_num / mu_prime_den : Infinity;

  const kDeltaUncond = K > 1 && Delta_mag < 1;
  const muUncond = mu > 1 && mu_prime > 1;
  const isUnconditional = kDeltaUncond || muUncond;
  const stability = isUnconditional ? "UNCONDITIONALLY STABLE" : "CONDITIONALLY STABLE / POTENTIALLY UNSTABLE";

  // Load stability circle
  let CL: Complex | undefined;
  let RL: number | undefined;
  const denom_CL = abs(S22) ** 2 - Delta_mag ** 2;
  if (Math.abs(denom_CL) > 1e-12) {
    CL = div(conjugate(sub(S22, mul(Delta, conjugate(S11)))), { re: denom_CL, im: 0 });
    RL = abs(mul(S12, S21)) / denom_CL;
  }

  // Source stability circle
  let CS: Complex | undefined;
  let RS: number | undefined;
  const denom_CS = abs(S11) ** 2 - Delta_mag ** 2;
  if (Math.abs(denom_CS) > 1e-12) {
    CS = div(conjugate(sub(S11, mul(Delta, conjugate(S22)))), { re: denom_CS, im: 0 });
    RS = abs(mul(S12, S21)) / denom_CS;
  }

  return { Delta, Delta_mag, K, mu, mu_prime, isUnconditional, stability, CL, RL, CS, RS };
}

// ------------------------------------------------------------
// POWER GAIN (BILATERAL & UNILATERAL)
// ------------------------------------------------------------

export interface GainInput {
  S11: Complex;
  S12: Complex;
  S21: Complex;
  S22: Complex;
  Z0: number;
  ZS: number;
  ZL: number;
}

export interface GainResult {
  Gamma_S: Complex;
  Gamma_L: Complex;
  Gamma_in: Complex;
  Gamma_out: Complex;
  GP_B: number;
  GA_B: number;
  GT_B: number;
  GP_U: number;
  GA_U: number;
  GT_U: number;
}

export function calculateGain(input: GainInput): GainResult {
  const { S11, S12, S21, S22, Z0, ZS, ZL } = input;

  const Gamma_S = div({ re: ZS - Z0, im: 0 }, { re: ZS + Z0, im: 0 });
  const Gamma_L = div({ re: ZL - Z0, im: 0 }, { re: ZL + Z0, im: 0 });

  // Bilateral
  const denom_in = sub({ re: 1, im: 0 }, mul(S22, Gamma_L));
  const Gamma_in = add(S11, div(mul(mul(S12, S21), Gamma_L), denom_in));

  const denom_out = sub({ re: 1, im: 0 }, mul(S11, Gamma_S));
  const Gamma_out = add(S22, div(mul(mul(S12, S21), Gamma_S), denom_out));

  // Bilateral GP
  const GP_B_num = abs(S21) ** 2 * (1 - abs(Gamma_L) ** 2);
  const GP_B_den = (1 - abs(Gamma_in) ** 2) * abs(sub({ re: 1, im: 0 }, mul(S22, Gamma_L))) ** 2;
  const GP_B = GP_B_num / GP_B_den;

  // Bilateral GA
  const GA_B_num = abs(S21) ** 2 * (1 - abs(Gamma_S) ** 2);
  const GA_B_den = (1 - abs(Gamma_out) ** 2) * abs(sub({ re: 1, im: 0 }, mul(S11, Gamma_S))) ** 2;
  const GA_B = GA_B_num / GA_B_den;

  // Bilateral GT
  const GT_B_num = abs(S21) ** 2 * (1 - abs(Gamma_S) ** 2) * (1 - abs(Gamma_L) ** 2);
  const GT_B_den = abs(sub(mul(sub({ re: 1, im: 0 }, mul(S11, Gamma_S)), sub({ re: 1, im: 0 }, mul(S22, Gamma_L))), mul(mul(mul(S12, S21), Gamma_S), Gamma_L))) ** 2;
  const GT_B = GT_B_num / GT_B_den;

  // Unilateral
  const GP_U = (abs(S21) ** 2 * (1 - abs(Gamma_L) ** 2)) / ((1 - abs(S11) ** 2) * abs(sub({ re: 1, im: 0 }, mul(S22, Gamma_L))) ** 2);
  const GA_U = (abs(S21) ** 2 * (1 - abs(Gamma_S) ** 2)) / ((1 - abs(S22) ** 2) * abs(sub({ re: 1, im: 0 }, mul(S11, Gamma_S))) ** 2);
  const GT_U = (abs(S21) ** 2 * (1 - abs(Gamma_S) ** 2) * (1 - abs(Gamma_L) ** 2)) / (abs(sub({ re: 1, im: 0 }, mul(S11, Gamma_S))) ** 2 * abs(sub({ re: 1, im: 0 }, mul(S22, Gamma_L))) ** 2);

  return { Gamma_S, Gamma_L, Gamma_in, Gamma_out, GP_B, GA_B, GT_B, GP_U, GA_U, GT_U };
}

// ------------------------------------------------------------
// MAX GAIN + SINGLE STUB MATCHING
// ------------------------------------------------------------

export interface MaxGainResult {
  Delta: Complex;
  Delta_mag: number;
  K: number;
  isUnconditional: boolean;
  bilateral?: {
    B1: number;
    C1: Complex;
    B2: number;
    C2: Complex;
    Gamma_S: Complex;
    Gamma_L: Complex;
    GT_max: number;
    GT_max_dB: number;
    inputMatch: SingleStubSolution[];
    outputMatch: SingleStubSolution[];
  };
  unilateral: {
    Gamma_S: Complex;
    Gamma_L: Complex;
    GTU_max: number;
    GTU_max_dB: number;
    inputMatch: SingleStubSolution[];
    outputMatch: SingleStubSolution[];
  };
}

export function calculateMaxGain(
  S11: Complex, S12: Complex, S21: Complex, S22: Complex,
  Z0: number, freqGHz?: number
): MaxGainResult {
  const Delta = sub(mul(S11, S22), mul(S12, S21));
  const denom_K = 2 * abs(mul(S12, S21));
  const K = denom_K > 1e-12 ? (1 + abs(Delta) ** 2 - abs(S11) ** 2 - abs(S22) ** 2) / denom_K : Infinity;
  const isUnconditional = abs(Delta) < 1 && K > 1;

  const wavelength = freqGHz ? 3e8 / (freqGHz * 1e9) : undefined;

  // Bilateral
  let bilateral: MaxGainResult["bilateral"];
  if (K > 1 && abs(S12) > 1e-12) {
    const B1 = 1 + abs(S11) ** 2 - abs(S22) ** 2 - abs(Delta) ** 2;
    const C1 = sub(S11, mul(Delta, conjugate(S22)));
    const D1 = B1 * B1 - 4 * abs(C1) ** 2;

    const B2 = 1 + abs(S22) ** 2 - abs(S11) ** 2 - abs(Delta) ** 2;
    const C2 = sub(S22, mul(Delta, conjugate(S11)));
    const D2 = B2 * B2 - 4 * abs(C2) ** 2;

    if (D1 >= 0 && D2 >= 0) {
      const root1_s = { re: (B1 + Math.sqrt(D1)) / (2 * C1.re), im: 0 };
      const root2_s = { re: (B1 - Math.sqrt(D1)) / (2 * C1.re), im: 0 };
      const valid_s = [root1_s, root2_s].filter(x => abs(x) < 1);

      const root1_l = { re: (B2 + Math.sqrt(D2)) / (2 * C2.re), im: 0 };
      const root2_l = { re: (B2 - Math.sqrt(D2)) / (2 * C2.re), im: 0 };
      const valid_l = [root1_l, root2_l].filter(x => abs(x) < 1);

      if (valid_s.length > 0 && valid_l.length > 0) {
        const Gamma_S = valid_s[0];
        const Gamma_L = valid_l[0];

        const GT_max = abs({ re: S21.re / S12.re, im: 0 }) * (K - Math.sqrt(K * K - 1));
        const GT_max_dB = db(GT_max);

        const inputMatch = stubMatchForGamma(Gamma_S, wavelength);
        const outputMatch = stubMatchForGamma(Gamma_L, wavelength);

        bilateral = { B1, C1, B2, C2, Gamma_S, Gamma_L, GT_max, GT_max_dB, inputMatch, outputMatch };
      }
    }
  }

  // Unilateral
  const Gamma_S_U = conjugate(S11);
  const Gamma_L_U = conjugate(S22);
  const denom1 = 1 - abs(S11) ** 2;
  const denom2 = 1 - abs(S22) ** 2;
  const GTU_max = denom1 > 0 && denom2 > 0 ? (1 / denom1) * abs(S21) ** 2 * (1 / denom2) : 0;
  const GTU_max_dB = GTU_max > 0 ? db(GTU_max) : -Infinity;

  const inputMatch = stubMatchForGamma(Gamma_S_U, wavelength);
  const outputMatch = stubMatchForGamma(Gamma_L_U, wavelength);

  const unilateral = { Gamma_S: Gamma_S_U, Gamma_L: Gamma_L_U, GTU_max, GTU_max_dB, inputMatch, outputMatch };

  return { Delta, Delta_mag: abs(Delta), K, isUnconditional, bilateral, unilateral };
}

function stubMatchForGamma(gamma: Complex, wavelength?: number): SingleStubSolution[] {
  const z = div(add({ re: 1, im: 0 }, gamma), sub({ re: 1, im: 0 }, gamma));
  const y = div({ re: 1, im: 0 }, z);
  const g = y.re;
  const b = y.im;

  const A = g * g + b * b - g;
  const Bq = -2 * b;
  const Cq = 1 - g;
  const D = Bq * Bq - 4 * A * Cq;

  const solutions: SingleStubSolution[] = [];
  if (D < -1e-10) return solutions;

  const sqrtD = Math.sqrt(Math.max(0, D));
  const roots: number[] = [];

  if (Math.abs(A) > 1e-12) {
    roots.push((-Bq + sqrtD) / (2 * A));
    roots.push((-Bq - sqrtD) / (2 * A));
  } else if (Math.abs(Bq) > 1e-12) {
    roots.push(-Cq / Bq);
  }

  for (const t of roots) {
    let theta = Math.atan(t);
    if (theta < 0) theta += Math.PI;
    const d = theta / (2 * Math.PI);

    const tC = { re: 0, im: t };
    const y_d = div(add(y, tC), add({ re: 1, im: 0 }, mul(y, tC)));
    const b_stub = -y_d.im;

    let lOpen: number;
    if (Math.abs(b_stub) < 1e-12) {
      lOpen = 0;
    } else {
      let thetaOpen = Math.atan(b_stub);
      if (thetaOpen < 0) thetaOpen += Math.PI;
      lOpen = thetaOpen / (2 * Math.PI);
    }

    let lShort: number;
    if (Math.abs(b_stub) < 1e-12) {
      lShort = 0.25;
    } else {
      let thetaShort = Math.atan(-1 / b_stub);
      if (thetaShort < 0) thetaShort += Math.PI;
      lShort = thetaShort / (2 * Math.PI);
    }

    const gamma_d = div(sub({ re: 1, im: 0 }, y_d), add({ re: 1, im: 0 }, y_d));
    const gamma_dMag = abs(gamma_d);
    const swr = gamma_dMag >= 1 ? Infinity : (1 + gamma_dMag) / (1 - gamma_dMag);

    solutions.push({ d, y_d, b_stub, open: lOpen, short: lShort, swr, wavelength });
  }

  solutions.sort((a, b) => a.d - b.d);
  return solutions;
}

// ------------------------------------------------------------
// FILTER DESIGN (BUTTERWORTH / CHEBYSHEV)
// ------------------------------------------------------------

export interface FilterInput {
  approximation: "butterworth" | "chebyshev";
  filterType: "lpf" | "hpf" | "bpf" | "bsf";
  N?: number;
  fc?: number;
  fx?: number;
  attenuation_db?: number;
  ripple_db?: number;
  f1?: number;
  f2?: number;
  Z0: number;
}

export interface FilterElement {
  k: number;
  topology: string;
  L: number | null;
  C: number | null;
}

export interface FilterResult {
  N: number;
  g: number[];
  elements: FilterElement[];
  omega_c?: number;
  omega0?: number;
  BW?: number;
}

export function designFilter(input: FilterInput): FilterResult {
  const { approximation, filterType, Z0 } = input;
  let { N, fc, fx, attenuation_db, ripple_db, f1, f2 } = input;

  // Calculate N if not given
  if (!N || N < 1) {
    if (approximation === "butterworth") {
      const omega_x_prime = fx! / fc!;
      const num = Math.pow(10, attenuation_db! / 10) - 1;
      N = Math.max(1, Math.ceil(Math.log10(num) / (2 * Math.log10(omega_x_prime))));
    } else {
      const omega_x_prime = fx! / fc!;
      const epsilon_sq = Math.pow(10, ripple_db! / 10) - 1;
      const A_linear = Math.pow(10, attenuation_db! / 10);
      const required_Tn = Math.sqrt((A_linear - 1) / epsilon_sq);
      N = Math.max(1, Math.ceil(Math.acosh(required_Tn) / Math.acosh(omega_x_prime)));
    }
  }

  // Prototype values
  const g = new Array(N + 2).fill(0);

  if (approximation === "butterworth") {
    g[0] = 1.0;
    for (let k = 1; k <= N; k++) {
      g[k] = 2 * Math.sin(((2 * k - 1) * Math.PI) / (2 * N));
    }
    g[N + 1] = 1.0;
  } else {
    const epsilon = Math.sqrt(Math.pow(10, ripple_db! / 10) - 1);
    const beta = Math.asinh(1 / epsilon);
    const gamma = Math.sinh(beta / N);

    g[0] = 1.0;

    const a = new Array(N + 1).fill(0);
    for (let k = 1; k <= N; k++) {
      a[k] = Math.sin(((2 * k - 1) * Math.PI) / (2 * N));
    }

    const b = new Array(N + 1).fill(0);
    for (let k = 1; k <= N; k++) {
      b[k] = gamma ** 2 + Math.sin((k * Math.PI) / N) ** 2;
    }

    g[1] = (2 * a[1]) / gamma;
    for (let k = 2; k <= N; k++) {
      g[k] = (4 * a[k - 1] * a[k]) / (b[k - 1] * g[k - 1]);
    }

    if (N % 2 === 1) {
      g[N + 1] = 1.0;
    } else {
      g[N + 1] = Math.pow(1 / Math.tanh(beta / 2), 2);
    }
  }

  // Frequency transformation
  let omega_c = 0;
  let omega0 = 0;
  let BW = 0;
  let delta_omega = 0;
  let f0 = 0;

  if (filterType === "lpf" || filterType === "hpf") {
    omega_c = 2 * Math.PI * fc! * 1e9;
  } else {
    const omega1 = 2 * Math.PI * f1! * 1e9;
    const omega2 = 2 * Math.PI * f2! * 1e9;
    omega0 = Math.sqrt(omega1 * omega2);
    delta_omega = omega2 - omega1;
    f0 = Math.sqrt(f1! * f2!);
    BW = f2! - f1!;
  }

  // Component values
  const elements: FilterElement[] = [];

  for (let k = 1; k <= N; k++) {
    const value = g[k];

    if (filterType === "lpf") {
      if (k % 2 === 1) {
        elements.push({ k, topology: "Shunt C", L: null, C: value / (Z0 * omega_c) });
      } else {
        elements.push({ k, topology: "Series L", L: (value * Z0) / omega_c, C: null });
      }
    } else if (filterType === "hpf") {
      if (k % 2 === 1) {
        elements.push({ k, topology: "Shunt L", L: Z0 / (value * omega_c), C: null });
      } else {
        elements.push({ k, topology: "Series C", L: null, C: 1 / (value * Z0 * omega_c) });
      }
    } else if (filterType === "bpf") {
      if (k % 2 === 1) {
        elements.push({
          k, topology: "Shunt L || C",
          L: Z0 / (value * delta_omega),
          C: (value * delta_omega) / (Z0 * omega0 ** 2),
        });
      } else {
        elements.push({
          k, topology: "Series L + C",
          L: (value * Z0 * delta_omega) / omega0 ** 2,
          C: 1 / (value * Z0 * delta_omega),
        });
      }
    } else {
      // bsf
      if (k % 2 === 1) {
        elements.push({
          k, topology: "Parallel L || C",
          L: (value * Z0 * delta_omega) / omega0 ** 2,
          C: 1 / (value * Z0 * delta_omega),
        });
      } else {
        elements.push({
          k, topology: "Series L + C",
          L: Z0 / (value * delta_omega),
          C: (value * delta_omega) / (Z0 * omega0 ** 2),
        });
      }
    }
  }

  return { N, g, elements, omega_c: filterType === "lpf" || filterType === "hpf" ? omega_c : undefined, omega0: filterType === "bpf" || filterType === "bsf" ? omega0 : undefined, BW: filterType === "bpf" || filterType === "bsf" ? BW : undefined };
}
