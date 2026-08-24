import { FactorPair, PrimeFactor, ContainingTable, NumberDetail } from '../types';

/**
 * Calculates all factors, factor pairs, prime factorization,
 * containing multiplication tables, and number properties.
 */
export function getNumberDetail(n: number): NumberDetail {
  const num = Math.max(1, Math.floor(n));
  
  // Find all factors
  const factors: number[] = [];
  const factorPairs: FactorPair[] = [];
  
  const sqrt = Math.sqrt(num);
  const isSquare = Number.isInteger(sqrt);
  const squareRoot = isSquare ? Math.round(sqrt) : null;
  
  const cbrt = Math.cbrt(num);
  const isCube = Math.abs(cbrt - Math.round(cbrt)) < 1e-9;
  const cubeRoot = isCube ? Math.round(cbrt) : null;

  for (let i = 1; i <= Math.sqrt(num); i++) {
    if (num % i === 0) {
      factors.push(i);
      const other = num / i;
      if (other !== i) {
        factors.push(other);
      }
      factorPairs.push({
        a: i,
        b: other,
        isSquarePair: i === other,
      });
    }
  }

  factors.sort((a, b) => a - b);
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

  // Prime factorization
  const primeFactors: PrimeFactor[] = [];
  let temp = num;
  let d = 2;
  while (d * d <= temp) {
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

  return {
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
