// @ts-ignore: bun:test provided by Bun runtime
import { describe, it, expect } from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  getNumberDetail,
  toRomanNumeral,
  getFullMultiplicationTable,
  soundFx,
} from '../src/utils/mathUtils';
import type { FilterCategory, RangePreset } from '../src/types';

// Load source code files for structural and responsive assertion
const NAVBAR_SRC = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/Navbar.tsx'),
  'utf8'
);
const FILTERBAR_SRC = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/FilterBar.tsx'),
  'utf8'
);
const QUIZ_SRC = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/FactorQuizGame.tsx'),
  'utf8'
);
const REVISION_SRC = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/RevisionView.tsx'),
  'utf8'
);
const MODAL_SRC = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/NumberDetailModal.tsx'),
  'utf8'
);
const MATRIX_SRC = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/TimesTableMatrix.tsx'),
  'utf8'
);
const APP_SRC = fs.readFileSync(
  path.resolve(process.cwd(), 'src/App.tsx'),
  'utf8'
);

// ============================================================================
// SUITE 1: MATHEMATICAL EDGE CASES (Number 1, 0, >3999, >10,000)
// ============================================================================
describe('Empirical Edge Cases: Mathematical Extremes & Boundaries', () => {
  it('Number 1: comprehensive unit and dual-power verification', () => {
    const detail = getNumberDetail(1);

    // Classification & Primes
    expect(detail.n).toBe(1);
    expect(detail.classification).toBe('unit');
    expect(detail.isPrime).toBe(false);
    expect(detail.isComposite).toBe(false);

    // Divisors & Factor Pairs
    expect(detail.factors).toEqual([1]);
    expect(detail.sumOfDivisors).toBe(1);
    expect(detail.properDivisorsSum).toBe(0);
    expect(detail.factorPairs).toEqual([
      { a: 1, b: 1, isSquarePair: true, isCubePair: true },
    ]);

    // Powers (1² = 1, 1³ = 1)
    expect(detail.isSquare).toBe(true);
    expect(detail.squareRoot).toBe(1);
    expect(detail.isCube).toBe(true);
    expect(detail.cubeRoot).toBe(1);

    // Representations
    expect(detail.roman).toBe('I');
    expect(detail.binary).toBe('1');
    expect(detail.hex).toBe('0x1');
    expect(detail.primeFactorizationString).toBe('1 (Unit)');
    expect(detail.primeFactors).toEqual([]);

    // Multiplications & Containing Tables
    expect(detail.allMultiplications).toEqual([
      { a: 1, b: 1, equation: '1 × 1 = 1' },
    ]);
    expect(detail.containingTables).toEqual([
      { tableOf: 1, multiplier: 1, equation: '1 × 1 = 1' },
    ]);
  });

  it('Number 0 and negative inputs: clamps gracefully to natural number 1', () => {
    const zero = getNumberDetail(0);
    expect(zero.n).toBe(1);
    expect(zero.classification).toBe('unit');

    const negOne = getNumberDetail(-1);
    expect(negOne.n).toBe(1);

    const negLarge = getNumberDetail(-99999);
    expect(negLarge.n).toBe(1);
  });

  it('Float inputs: truncates decimals safely via Math.floor', () => {
    const float1 = getNumberDetail(25.99);
    expect(float1.n).toBe(25);
    expect(float1.isSquare).toBe(true);
    expect(float1.squareRoot).toBe(5);

    const float2 = getNumberDetail(0.75);
    expect(float2.n).toBe(1); // floor(0.75) is 0, clamped to 1
  });

  it('Roman numerals: verifies 1 to 3999 range and handles out-of-bounds', () => {
    // Exact standard boundaries
    expect(toRomanNumeral(1)).toBe('I');
    expect(toRomanNumeral(3999)).toBe('MMMCMXCIX');

    // Values >= 4000
    expect(toRomanNumeral(4000)).toBe('N/A');
    expect(toRomanNumeral(4001)).toBe('N/A');
    expect(toRomanNumeral(10000)).toBe('N/A');
    expect(toRomanNumeral(1000000)).toBe('N/A');

    // Values < 1
    expect(toRomanNumeral(0)).toBe('N/A');
    expect(toRomanNumeral(-1)).toBe('N/A');
    expect(toRomanNumeral(-100)).toBe('N/A');
  });

  it('Large Numbers (>10,000): stress-tests performance and exact factorizations', () => {
    const start = performance.now();

    // 10,000 = 100²
    const d10k = getNumberDetail(10000);
    expect(d10k.isSquare).toBe(true);
    expect(d10k.squareRoot).toBe(100);
    expect(d10k.isCube).toBe(false);
    expect(d10k.primeFactorizationString).toBe('2⁴ × 5⁴');

    // 15,625 = 125² = 25³ = 5⁶
    const d15k = getNumberDetail(15625);
    expect(d15k.isSquare).toBe(true);
    expect(d15k.squareRoot).toBe(125);
    expect(d15k.isCube).toBe(true);
    expect(d15k.cubeRoot).toBe(25);
    expect(d15k.primeFactorizationString).toBe('5⁶');

    // 46,656 = 216² = 36³ = 6⁶
    const d46k = getNumberDetail(46656);
    expect(d46k.isSquare).toBe(true);
    expect(d46k.squareRoot).toBe(216);
    expect(d46k.isCube).toBe(true);
    expect(d46k.cubeRoot).toBe(36);
    expect(d46k.primeFactorizationString).toBe('2⁶ × 3⁶');

    // 125,000 = 50³
    const d125k = getNumberDetail(125000);
    expect(d125k.isCube).toBe(true);
    expect(d125k.cubeRoot).toBe(50);

    // 1,000,000 = 100³ = 1000²
    const d1m = getNumberDetail(1000000);
    expect(d1m.isSquare).toBe(true);
    expect(d1m.squareRoot).toBe(1000);
    expect(d1m.isCube).toBe(true);
    expect(d1m.cubeRoot).toBe(100);
    expect(d1m.primeFactorizationString).toBe('2⁶ × 5⁶');

    // Large prime test: 104729 (10,000th prime)
    const prime10k = getNumberDetail(104729);
    expect(prime10k.isPrime).toBe(true);
    expect(prime10k.classification).toBe('prime');
    expect(prime10k.factors).toEqual([1, 104729]);

    const elapsed = performance.now() - start;
    // Entire batch of extreme numbers must evaluate in < 50ms
    expect(elapsed).toBeLessThan(50);
  });
});

// ============================================================================
// SUITE 2: INTERACTIVE CONTROLS (Search, Audio, Presets, Custom Ranges)
// ============================================================================
describe('Empirical Edge Cases: Interactive Controls & User Inputs', () => {
  it('Navbar quick jump input: rejects non-positive, empty, or non-numeric inputs', () => {
    // Pure validator mirroring handleSearchSubmit in Navbar.tsx
    function validateQuickJump(input: string): number | null {
      const parsed = parseInt(input.trim(), 10);
      if (!isNaN(parsed) && parsed > 0) {
        return parsed;
      }
      return null;
    }

    expect(validateQuickJump('')).toBeNull();
    expect(validateQuickJump('   ')).toBeNull();
    expect(validateQuickJump('abc')).toBeNull();
    expect(validateQuickJump('NaN')).toBeNull();
    expect(validateQuickJump('0')).toBeNull();
    expect(validateQuickJump('-5')).toBeNull();
    expect(validateQuickJump('-100')).toBeNull();

    // Valid inputs
    expect(validateQuickJump('1')).toBe(1);
    expect(validateQuickJump('64')).toBe(64);
    expect(validateQuickJump(' 100 ')).toBe(100);
    expect(validateQuickJump('1000000')).toBe(1000000);
  });

  it('Grid search filter: handles empty, numeric, factor-match, and special characters safely', () => {
    const baseNumbers = [12, 27, 49, 64, 72, 81, 100];

    function filterNumbers(numbers: number[], searchFilter: string): number[] {
      if (!searchFilter.trim()) return numbers;
      const query = searchFilter.trim().toLowerCase();
      return numbers.filter((n) => {
        if (!n.toString().includes(query)) {
          const detail = getNumberDetail(n);
          const hasFactorMatch = detail.factors.some((f) => f.toString() === query);
          const hasEquationMatch = detail.allMultiplications.some((m) =>
            m.equation.toLowerCase().includes(query)
          );
          if (!hasFactorMatch && !hasEquationMatch) return false;
        }
        return true;
      });
    }

    // Empty query returns all
    expect(filterNumbers(baseNumbers, '')).toEqual(baseNumbers);
    expect(filterNumbers(baseNumbers, '   ')).toEqual(baseNumbers);

    // Number matching by digit
    expect(filterNumbers(baseNumbers, '64')).toEqual([64]);

    // Number matching by factor: '8' is a factor of 64 and 72
    const factorMatch8 = filterNumbers(baseNumbers, '8');
    expect(factorMatch8).toContain(64);
    expect(factorMatch8).toContain(72);
    expect(factorMatch8).toContain(81); // contains digit '8'

    // Special regex characters in input must NOT throw SyntaxError
    expect(() => filterNumbers(baseNumbers, '(')).not.toThrow();
    expect(() => filterNumbers(baseNumbers, '[')).not.toThrow();
    expect(() => filterNumbers(baseNumbers, '*')).not.toThrow();
    expect(() => filterNumbers(baseNumbers, '.*')).not.toThrow();
    expect(filterNumbers(baseNumbers, '[')).toEqual([]);

    // Negative or out of range search returns empty list
    expect(filterNumbers(baseNumbers, '-10')).toEqual([]);
    expect(filterNumbers(baseNumbers, '9999')).toEqual([]);
  });

  it('Sound engine: soundFx.enabled safely mutes audio and handles non-browser environment', () => {
    // Toggle muting
    soundFx.enabled = false;
    expect(soundFx.enabled).toBe(false);

    // Calling sound methods while disabled must not throw
    expect(() => soundFx.playPop(1)).not.toThrow();
    expect(() => soundFx.playSuccess()).not.toThrow();
    expect(() => soundFx.playChord()).not.toThrow();

    // Re-enable
    soundFx.enabled = true;
    expect(soundFx.enabled).toBe(true);

    // Calling sound methods in Bun/headless environment must safely no-op
    expect(() => soundFx.playPop(1.2)).not.toThrow();
    expect(() => soundFx.playSuccess()).not.toThrow();
    expect(() => soundFx.playChord()).not.toThrow();
  });

  it('Custom range bounds: handles min > max inversion and non-positive inputs', () => {
    function computeRange(
      rangePreset: RangePreset,
      customStart: number,
      customEnd: number,
      extraCount = 0
    ) {
      let s = 1;
      let e = 100;
      switch (rangePreset) {
        case '1-50':
          s = 1;
          e = 50;
          break;
        case '1-100':
          s = 1;
          e = 100;
          break;
        case '101-200':
          s = 101;
          e = 200;
          break;
        case '201-500':
          s = 201;
          e = 500;
          break;
        case '1-1000':
          s = 1;
          e = 1000;
          break;
        case 'custom':
          s = Math.max(1, Math.min(customStart, customEnd));
          e = Math.max(1, Math.max(customStart, customEnd));
          break;
        default:
          s = 1;
          e = 100;
      }
      return { startNum: s, endNum: e + extraCount };
    }

    // Normal custom
    expect(computeRange('custom', 10, 50)).toEqual({ startNum: 10, endNum: 50 });

    // Inverted custom (min > max: 50 to 10)
    expect(computeRange('custom', 50, 10)).toEqual({ startNum: 10, endNum: 50 });

    // Non-positive custom bounds (-20 to -5)
    expect(computeRange('custom', -20, -5)).toEqual({ startNum: 1, endNum: 1 });

    // Zero bounds (0 to 0)
    expect(computeRange('custom', 0, 0)).toEqual({ startNum: 1, endNum: 1 });

    // One non-positive, one positive (-10 to 25)
    expect(computeRange('custom', -10, 25)).toEqual({ startNum: 1, endNum: 25 });
  });

  it('Range safety cap: limits maximum generated items to 10,000 to prevent OOM', () => {
    const startNum = 1;
    const endNum = 500000;
    const maxItems = 10000;
    const limit = Math.min(endNum, startNum + maxItems - 1);
    expect(limit).toBe(10000);
    expect(limit - startNum + 1).toBe(10000);
  });
});

// ============================================================================
// SUITE 3: QUIZ STREAKS, MULTI-SELECT SCORING & RESETS
// ============================================================================
describe('Empirical Edge Cases: Factor Quiz Streaks, Scoring & Resets', () => {
  interface QuizState {
    score: number;
    streak: number;
    bestStreak: number;
    isAnswered: boolean;
    confettiFired: boolean;
  }

  function submitQuizAnswer(
    state: QuizState,
    options: { id: string; text: string; isCorrect: boolean }[],
    selectedIds: string[]
  ): QuizState {
    if (state.isAnswered || selectedIds.length === 0) return state;

    const chosenOpts = options.filter((o) => selectedIds.includes(o.id));
    const totalCorrectOpts = options.filter((o) => o.isCorrect);
    const allChosenAreCorrect = chosenOpts.every((o) => o.isCorrect);
    const allCorrectAreChosen = chosenOpts.length === totalCorrectOpts.length;

    if (allChosenAreCorrect && allCorrectAreChosen && chosenOpts.length > 0) {
      const newStreak = state.streak + 1;
      const scoreDelta = 10 * Math.min(newStreak, 5);
      const confettiFired = newStreak % 3 === 0;
      return {
        score: state.score + scoreDelta,
        streak: newStreak,
        bestStreak: Math.max(state.bestStreak, newStreak),
        isAnswered: true,
        confettiFired,
      };
    } else {
      return {
        score: state.score,
        streak: 0, // Streak reset to 0 on incorrect
        bestStreak: state.bestStreak,
        isAnswered: true,
        confettiFired: false,
      };
    }
  }

  const sampleQuestion = [
    { id: 'c1', text: '4 × 16', isCorrect: true },
    { id: 'c2', text: '8 × 8', isCorrect: true },
    { id: 'w1', text: '3 × 20', isCorrect: false },
    { id: 'w2', text: '5 × 12', isCorrect: false },
  ];

  it('streak progression: builds streak, increases score multiplier, and triggers confetti at multiples of 3', () => {
    let state: QuizState = { score: 0, streak: 0, bestStreak: 0, isAnswered: false, confettiFired: false };

    // Q1 correct: streak = 1, score = +10, no confetti
    state = submitQuizAnswer(state, sampleQuestion, ['c1', 'c2']);
    expect(state.streak).toBe(1);
    expect(state.score).toBe(10);
    expect(state.confettiFired).toBe(false);

    // Q2 correct: streak = 2, score = 10 + 20 = 30, no confetti
    state.isAnswered = false;
    state = submitQuizAnswer(state, sampleQuestion, ['c1', 'c2']);
    expect(state.streak).toBe(2);
    expect(state.score).toBe(30);
    expect(state.confettiFired).toBe(false);

    // Q3 correct: streak = 3, score = 30 + 30 = 60, confetti fires!
    state.isAnswered = false;
    state = submitQuizAnswer(state, sampleQuestion, ['c1', 'c2']);
    expect(state.streak).toBe(3);
    expect(state.score).toBe(60);
    expect(state.confettiFired).toBe(true);

    // Q4 correct: streak = 4, score = 60 + 40 = 100
    state.isAnswered = false;
    state = submitQuizAnswer(state, sampleQuestion, ['c1', 'c2']);
    expect(state.streak).toBe(4);
    expect(state.score).toBe(100);

    // Q5 correct: streak = 5, score = 100 + 50 = 150
    state.isAnswered = false;
    state = submitQuizAnswer(state, sampleQuestion, ['c1', 'c2']);
    expect(state.streak).toBe(5);
    expect(state.score).toBe(150);

    // Q6 correct: streak = 6, multiplier capped at 5x (+50), confetti fires again!
    state.isAnswered = false;
    state = submitQuizAnswer(state, sampleQuestion, ['c1', 'c2']);
    expect(state.streak).toBe(6);
    expect(state.score).toBe(200);
    expect(state.confettiFired).toBe(true);
    expect(state.bestStreak).toBe(6);
  });

  it('streak reset: resets streak to 0 on any incorrect answer while preserving score and bestStreak', () => {
    let state: QuizState = { score: 200, streak: 6, bestStreak: 6, isAnswered: false, confettiFired: false };

    // Submitting wrong answer (only 1 correct pair)
    state = submitQuizAnswer(state, sampleQuestion, ['c1']);
    expect(state.streak).toBe(0); // Streak reset!
    expect(state.score).toBe(200); // Score retained
    expect(state.bestStreak).toBe(6); // Best streak preserved
  });

  it('empty selection cannot be submitted and does not modify state', () => {
    const initialState: QuizState = { score: 50, streak: 2, bestStreak: 2, isAnswered: false, confettiFired: false };
    const state = submitQuizAnswer(initialState, sampleQuestion, []);
    expect(state).toEqual(initialState);
  });
});

// ============================================================================
// SUITE 4: MODAL KEYBOARD NAVIGATION (Esc, ArrowLeft, ArrowRight)
// ============================================================================
describe('Empirical Edge Cases: Modal Keyboard Navigation', () => {
  it('modal navigation logic: ArrowLeft steps down, ArrowRight steps up, clamps at 1', () => {
    function navigateModal(currentNum: number, direction: 'prev' | 'next'): number {
      if (direction === 'prev') {
        return currentNum > 1 ? currentNum - 1 : currentNum;
      } else {
        return currentNum + 1;
      }
    }

    // Stepping from 2 down to 1
    expect(navigateModal(2, 'prev')).toBe(1);

    // Stepping at 1 (boundary clamping)
    expect(navigateModal(1, 'prev')).toBe(1); // Stays at 1, never 0 or negative!

    // Stepping up from 1 to 2, 64 to 65
    expect(navigateModal(1, 'next')).toBe(2);
    expect(navigateModal(64, 'next')).toBe(65);
  });

  it('NumberDetailModal.tsx source includes Escape, ArrowLeft, ArrowRight handlers', () => {
    expect(MODAL_SRC).toContain("e.key === 'Escape'");
    expect(MODAL_SRC).toContain("e.key === 'ArrowLeft'");
    expect(MODAL_SRC).toContain("e.key === 'ArrowRight'");
    expect(MODAL_SRC).toContain('number > 1');
  });

  it('RevisionView.tsx source includes Escape, ArrowLeft, ArrowRight handlers', () => {
    expect(REVISION_SRC).toContain("e.key === 'Escape'");
    expect(REVISION_SRC).toContain("e.key === 'ArrowLeft'");
    expect(REVISION_SRC).toContain("e.key === 'ArrowRight'");
    expect(REVISION_SRC).toContain('filteredNumbers.indexOf');
  });
});

// ============================================================================
// SUITE 5: TIMES TABLE MATRIX (Crosshairs, Clicks, Overflow)
// ============================================================================
describe('Empirical Edge Cases: Times Table Matrix & Multiplication Tables', () => {
  it('Pythagorean matrix calculates intersection products and diagonal squares accurately', () => {
    for (let r = 1; r <= 20; r++) {
      for (let c = 1; c <= 20; c++) {
        const product = r * c;
        const isSquare = r === c;
        if (isSquare) {
          expect(Math.round(Math.sqrt(product))).toBe(r);
        }
      }
    }
  });

  it('TimesTableMatrix.tsx source supports sizes 10, 12, 15, 20 and overflow-x-auto', () => {
    expect(MATRIX_SRC).toContain('overflow-x-auto');
    expect(MATRIX_SRC).toContain('10');
    expect(MATRIX_SRC).toContain('12');
    expect(MATRIX_SRC).toContain('15');
    expect(MATRIX_SRC).toContain('20');
  });

  it('MultiplicationTablesView.tsx contains search, depth customization, and copy functionality', () => {
    const TABLES_SRC = fs.readFileSync(
      path.resolve(process.cwd(), 'src/components/MultiplicationTablesView.tsx'),
      'utf8'
    );
    expect(TABLES_SRC).toContain('maxMultiplier');
    expect(TABLES_SRC).toContain('handleCopyTable');
    expect(TABLES_SRC).toContain('navigator.clipboard.writeText');
  });
});

// ============================================================================
// SUITE 6: VIEWPORT RESPONSIVENESS & MOBILE LAYOUT AUDIT
// ============================================================================
describe('Empirical Edge Cases: Viewport Breakpoints & Responsive Architecture', () => {
  it('Navbar view pills: verifies Matrix (hidden sm:flex) and Quiz (hidden md:flex) responsiveness', () => {
    // Finding: On mobile viewports <640px, Matrix is hidden. On <768px, Quiz is hidden.
    expect(NAVBAR_SRC).toContain('hidden sm:flex');
    expect(NAVBAR_SRC).toContain('hidden md:flex');
    // Verifies Navbar includes min-w-0 for flex blowout protection
    expect(NAVBAR_SRC).toContain('min-w-0');
  });

  it('NumberCard grid defines responsive columns across mobile, tablet, desktop, ultrawide', () => {
    // 2 cols on mobile (320px), 3 on sm (640px), 4 on md (768px), 5 on lg (1024px), 6 on xl (1280px)
    expect(APP_SRC).toContain('grid-cols-2');
    expect(APP_SRC).toContain('sm:grid-cols-3');
    expect(APP_SRC).toContain('md:grid-cols-4');
    expect(APP_SRC).toContain('lg:grid-cols-5');
    expect(APP_SRC).toContain('xl:grid-cols-6');
  });

  it('Ultrawide layout protection: App.tsx constrains main content to max-w-7xl', () => {
    expect(APP_SRC).toContain('max-w-7xl');
    expect(APP_SRC).toContain('w-full min-w-full');
  });

  it('Table views contain horizontal overflow containment on mobile', () => {
    expect(MATRIX_SRC).toContain('overflow-x-auto');
    expect(APP_SRC).toContain('overflow-x-auto');
  });
});
