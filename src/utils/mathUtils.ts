import { FactorPair, PrimeFactor, ContainingTable, NumberDetail } from '../types';

const numberDetailCache = new Map<number, NumberDetail>();
const MAX_CACHE_SIZE = 2500;

/**
 * Calculates all factors, factor pairs, prime factorization,
 * containing multiplication tables, and number properties.
 */
export function getNumberDetail(n: number): NumberDetail {
  const num = Math.max(1, Math.floor(n));
  if (numberDetailCache.has(num)) {
    return numberDetailCache.get(num)!;
  }
  
  const s = Math.round(Math.sqrt(num));
  const isSquare = s * s === num;
  const squareRoot = isSquare ? s : null;

  const c = Math.round(Math.cbrt(num));
  const isCube = c * c * c === num;
  const cubeRoot = isCube ? c : null;

  // Prime factorization with safety limit against thread freeze on massive numbers
  const primeFactors: PrimeFactor[] = [];
  let temp = num;
  let d = 2;
  const maxTrialDivisor = 100000;
  while (d * d <= temp && d <= maxTrialDivisor) {
    if (temp % d === 0) {
      let count = 0;
      while (temp % d === 0) {
        count++;
        temp = Math.floor(temp / d);
      }
      primeFactors.push({ prime: d, exponent: count });
    }
    d = d === 2 ? 3 : d + 2;
  }
  if (temp > 1) {
    primeFactors.push({ prime: temp, exponent: 1 });
  }

  // Derive all factors from prime factorization
  let factors: number[] = [1];
  for (const pf of primeFactors) {
    const next: number[] = [];
    let p = 1;
    for (let e = 1; e <= pf.exponent; e++) {
      p *= pf.prime;
      for (const f of factors) {
        next.push(f * p);
      }
    }
    factors.push(...next);
  }
  factors.sort((a, b) => a - b);

  // Derive factor pairs
  const factorPairs: FactorPair[] = [];
  for (const f of factors) {
    if (f * f > num) break;
    const other = Math.floor(num / f);
    factorPairs.push({
      a: f,
      b: other,
      isSquarePair: f === other,
      isCubePair: isCube && cubeRoot !== null && (f === cubeRoot || other === cubeRoot),
    });
  }

  // Sort factor pairs nicely: [1x64, 2x32, 4x16, 8x8]
  factorPairs.sort((a, b) => a.a - b.a);

  // All ordered multiplications (both commutative orders)
  const allMultiplications: { a: number; b: number; equation: string }[] = [];
  const seenEquations = new Set<string>();

  for (const pair of factorPairs) {
    const eq1 = `${pair.a} × ${pair.b} = ${num}`;
    if (!seenEquations.has(eq1)) {
      seenEquations.add(eq1);
      allMultiplications.push({ a: pair.a, b: pair.b, equation: eq1 });
    }
    if (pair.a !== pair.b) {
      const eq2 = `${pair.b} × ${pair.a} = ${num}`;
      if (!seenEquations.has(eq2)) {
        seenEquations.add(eq2);
        allMultiplications.push({ a: pair.b, b: pair.a, equation: eq2 });
      }
    }
  }
  // Sort multiplications by first operand
  allMultiplications.sort((a, b) => a.a - b.a);

  // Containing multiplication tables: which times tables hit this number?
  const containingTables: ContainingTable[] = [];
  for (const factor of factors) {
    const multiplier = num / factor;
    containingTables.push({
      tableOf: factor,
      multiplier,
      equation: `${factor} × ${multiplier} = ${num}`,
    });
  }

  // Format prime factorization string e.g. "2⁴ × 3²" or "Prime Number"
  let primeFactorizationString = '';
  if (num === 1) {
    primeFactorizationString = '1 (Unit)';
  } else if (primeFactors.length === 1 && primeFactors[0].exponent === 1) {
    primeFactorizationString = `${num} (Prime Number)`;
  } else {
    const superscripts: { [key: string]: string } = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
      '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    };
    const formatPower = (pow: number) => {
      if (pow === 1) return '';
      return String(pow).split('').map(char => superscripts[char] || char).join('');
    };

    primeFactorizationString = primeFactors
      .map(pf => `${pf.prime}${formatPower(pf.exponent)}`)
      .join(' × ');
  }

  const isPrime = num > 1 && factors.length === 2;
  const isComposite = num > 1 && !isPrime;
  const isEven = num % 2 === 0;
  const isOdd = !isEven;

  const sumOfDivisors = factors.reduce((sum, f) => sum + f, 0);
  const properDivisorsSum = sumOfDivisors - num;

  let classification: NumberDetail['classification'];
  if (num === 1) {
    classification = 'unit';
  } else if (isPrime) {
    classification = 'prime';
  } else if (properDivisorsSum === num) {
    classification = 'composite-perfect';
  } else if (properDivisorsSum > num) {
    classification = 'composite-abundant';
  } else {
    classification = 'composite-deficient';
  }

  const result: NumberDetail = {
    n: num,
    isPrime,
    isComposite,
    isEven,
    isOdd,
    isSquare,
    squareRoot,
    isCube,
    cubeRoot,
    factors,
    factorPairs,
    allMultiplications,
    containingTables,
    primeFactors,
    primeFactorizationString,
    sumOfDivisors,
    properDivisorsSum,
    classification,
    binary: num.toString(2),
    hex: '0x' + num.toString(16).toUpperCase(),
    roman: toRomanNumeral(num),
  };

  if (numberDetailCache.size >= MAX_CACHE_SIZE) {
    numberDetailCache.clear();
  }
  numberDetailCache.set(num, result);
  return result;
}

/**
 * Generate full multiplication table for number n (e.g. n × 1 up to n × limit)
 */
export function getFullMultiplicationTable(n: number, limit = 20) {
  const rows: { step: number; multiplier: number; product: number; equation: string }[] = [];
  for (let i = 1; i <= limit; i++) {
    rows.push({
      step: i,
      multiplier: i,
      product: n * i,
      equation: `${n} × ${i} = ${n * i}`,
    });
  }
  return rows;
}

/**
 * Convert positive integer to Roman Numeral
 */
export function toRomanNumeral(num: number): string {
  if (num > 3999 || num < 1) return 'N/A';
  const val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let roman = '';
  let temp = num;
  for (let i = 0; i < val.length; i++) {
    while (temp >= val[i]) {
      roman += syms[i];
      temp -= val[i];
    }
  }
  return roman;
}

/**
 * Sound synthesis helper using Web Audio API for lightweight, pleasing feedback.
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playPop(pitchMultiplier = 1) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440 * pitchMultiplier, now);
      osc.frequency.exponentialRampToValueAtTime(880 * pitchMultiplier, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Ignore audio failure
    }
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const now = this.ctx!.currentTime + idx * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 0.18);
      });
    } catch {
      // Ignore audio failure
    }
  }

  playChord() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const freqs = [392.00, 493.88, 587.33]; // G4, B4, D5
      const now = this.ctx.currentTime;
      freqs.forEach(f => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundFx = new SoundEngine();

/**
 * Accurately calculates integer powers (base^exp) up to safe integer boundaries.
 * Returns Infinity if calculation would exceed Number.MAX_SAFE_INTEGER to prevent precision loss.
 */
export function integerPower(base: number, exp: number): number {
  if (exp === 0) return 1;
  if (base === 0) return 0;
  if (exp === 1) return base;
  let res = 1;
  for (let i = 0; i < exp; i++) {
    if (res > Number.MAX_SAFE_INTEGER / base) return Infinity;
    res *= base;
  }
  return res;
}

/**
 * Calculates the exact integer n-th root of a number, or returns null if not an exact power.
 * Robust against floating point precision errors by checking adjacent candidates.
 */
export function getNthRoot(n: number, root: number): number | null {
  if (n <= 0 || root <= 0 || n > Number.MAX_SAFE_INTEGER) return null;
  if (n === 1) return 1;
  if (root === 1) return n;
  if (root === 2) {
    const s = Math.round(Math.sqrt(n));
    return s * s === n ? s : null;
  }
  if (root === 3) {
    const c = Math.round(Math.cbrt(n));
    return c * c * c === n ? c : null;
  }

  const approx = Math.round(Math.pow(n, 1 / root));
  for (const candidate of [approx, approx - 1, approx + 1]) {
    if (candidate >= 1 && integerPower(candidate, root) === n) {
      return candidate;
    }
  }
  return null;
}

/**
 * Checks whether a number is an exact power of a base (n = base^k, k >= 0)
 * and returns the exponent k.
 */
export function getPowerOfBaseInfo(n: number, base: number): { isPower: boolean; exponent: number | null } {
  if (n <= 0 || base < 2) return { isPower: false, exponent: null };
  if (n === 1) return { isPower: true, exponent: 0 };
  let temp = n;
  let exp = 0;
  while (temp % base === 0) {
    temp = Math.floor(temp / base);
    exp++;
  }
  if (temp === 1) {
    return { isPower: true, exponent: exp };
  }
  return { isPower: false, exponent: null };
}

/**
 * Converts an integer exponent to Unicode superscript string (e.g. 4 -> ⁴, 10 -> ¹⁰).
 */
export function toSuperscript(num: number): string {
  const superscripts: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
  };
  return num
    .toString()
    .split('')
    .map((ch) => superscripts[ch] || ch)
    .join('');
}

/**
 * Friendly name for power exponents (e.g. 2 -> Squares, 3 -> Cubes, 4 -> 4th Powers).
 */
export function getPowerName(exp: number): string {
  switch (exp) {
    case 2:
      return 'Squares';
    case 3:
      return 'Cubes';
    case 4:
      return '4th Powers';
    case 5:
      return '5th Powers';
    case 6:
      return '6th Powers';
    case 7:
      return '7th Powers';
    case 8:
      return '8th Powers';
    case 10:
      return '10th Powers';
    default:
      return `${exp}th Powers`;
  }
}

/**
 * Calculates the maximum safe integer exponent for a given base
 * such that base^exp <= Number.MAX_SAFE_INTEGER (9007199254740991).
 */
export function getMaxSafeExponent(base: number): number {
  if (base < 2) return 0;
  let exp = 0;
  let val = 1;
  while (Number.isSafeInteger(val * base)) {
    val *= base;
    exp++;
  }
  return exp;
}

/**
 * Calculates the maximum safe integer base such that base^exp <= Number.MAX_SAFE_INTEGER.
 */
export function getMaxSafeBase(exp: number): number {
  if (exp <= 0) return 0;
  if (exp === 1) return Number.MAX_SAFE_INTEGER;
  let b = Math.floor(Math.pow(Number.MAX_SAFE_INTEGER, 1 / exp));
  while (b > 0 && (integerPower(b, exp) > Number.MAX_SAFE_INTEGER || !Number.isSafeInteger(Math.pow(b, exp)))) {
    b--;
  }
  return b;
}

