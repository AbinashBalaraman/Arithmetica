// @ts-ignore: bun:test provided by Bun runtime
import { describe, it, expect } from 'bun:test';
import {
  getNumberDetail,
  toRomanNumeral,
  getFullMultiplicationTable,
} from '../src/utils/mathUtils';

describe('Tier 1: Math Precision & Integer Roots', () => {
  it('correctly identifies perfect squares with exact integer roots', () => {
    const squares = [1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 144, 400, 900, 2500, 10000];
    for (const sq of squares) {
      const detail = getNumberDetail(sq);
      expect(detail.isSquare).toBe(true);
      expect(detail.squareRoot).toBe(Math.round(Math.sqrt(sq)));
      expect(detail.squareRoot! * detail.squareRoot!).toBe(sq);
    }
  });

  it('rejects non-square numbers cleanly without false positives', () => {
    const nonSquares = [2, 3, 5, 6, 7, 8, 10, 11, 15, 26, 50, 99, 101, 1000];
    for (const n of nonSquares) {
      const detail = getNumberDetail(n);
      expect(detail.isSquare).toBe(false);
      expect(detail.squareRoot).toBeNull();
    }
  });

  it('correctly identifies perfect cubes with exact integer roots', () => {
    const cubes = [1, 8, 27, 64, 125, 216, 343, 512, 729, 1000, 1331, 1728, 2197, 4096];
    for (const cb of cubes) {
      const detail = getNumberDetail(cb);
      expect(detail.isCube).toBe(true);
      expect(detail.cubeRoot).toBe(Math.round(Math.cbrt(cb)));
      expect(detail.cubeRoot! * detail.cubeRoot! * detail.cubeRoot!).toBe(cb);
    }
  });

  it('rejects non-cube numbers cleanly without false positives', () => {
    const nonCubes = [2, 3, 4, 9, 16, 25, 36, 50, 100, 200, 500, 999, 1001];
    for (const n of nonCubes) {
      const detail = getNumberDetail(n);
      expect(detail.isCube).toBe(false);
      expect(detail.cubeRoot).toBeNull();
    }
  });

  it('computes complete and correctly sorted factor pairs', () => {
    const detail = getNumberDetail(60);
    // 60 factors: 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60
    expect(detail.factors).toEqual([1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60]);
    expect(detail.factorPairs).toEqual([
      { a: 1, b: 60, isSquarePair: false, isCubePair: false },
      { a: 2, b: 30, isSquarePair: false, isCubePair: false },
      { a: 3, b: 20, isSquarePair: false, isCubePair: false },
      { a: 4, b: 15, isSquarePair: false, isCubePair: false },
      { a: 5, b: 12, isSquarePair: false, isCubePair: false },
      { a: 6, b: 10, isSquarePair: false, isCubePair: false },
    ]);
  });
});

describe('Tier 1: Multi-Power Numbers (64, 729, 4096)', () => {
  it('verifies 64 is both perfect square (8²) and perfect cube (4³)', () => {
    const detail = getNumberDetail(64);
    expect(detail.isSquare).toBe(true);
    expect(detail.squareRoot).toBe(8);
    expect(detail.isCube).toBe(true);
    expect(detail.cubeRoot).toBe(4);
    // Verify factor pairs contains square pair (8x8) and cube factor (4x16)
    const squarePair = detail.factorPairs.find((p) => p.isSquarePair);
    expect(squarePair).toBeDefined();
    expect(squarePair).toEqual({ a: 8, b: 8, isSquarePair: true, isCubePair: false });

    const cubicPair = detail.factorPairs.find((p) => p.isCubePair);
    expect(cubicPair).toBeDefined();
    expect(cubicPair?.a).toBe(4);
    expect(cubicPair?.b).toBe(16);
    expect(cubicPair?.isCubePair).toBe(true);
  });

  it('verifies 729 is both perfect square (27²) and perfect cube (9³)', () => {
    const detail = getNumberDetail(729);
    expect(detail.isSquare).toBe(true);
    expect(detail.squareRoot).toBe(27);
    expect(detail.isCube).toBe(true);
    expect(detail.cubeRoot).toBe(9);

    const squarePair = detail.factorPairs.find((p) => p.isSquarePair);
    expect(squarePair).toBeDefined();
    expect(squarePair?.a).toBe(27);
    expect(squarePair?.b).toBe(27);

    const cubicPair = detail.factorPairs.find((p) => p.a === 9 || p.b === 9);
    expect(cubicPair).toBeDefined();
    expect(cubicPair?.a).toBe(9);
    expect(cubicPair?.b).toBe(81);
  });

  it('verifies 4096 is both perfect square (64²) and perfect cube (16³)', () => {
    const detail = getNumberDetail(4096);
    expect(detail.isSquare).toBe(true);
    expect(detail.squareRoot).toBe(64);
    expect(detail.isCube).toBe(true);
    expect(detail.cubeRoot).toBe(16);

    const squarePair = detail.factorPairs.find((p) => p.isSquarePair);
    expect(squarePair).toBeDefined();
    expect(squarePair?.a).toBe(64);
    expect(squarePair?.b).toBe(64);

    const cubicPair = detail.factorPairs.find((p) => p.a === 16 || p.b === 16);
    expect(cubicPair).toBeDefined();
    expect(cubicPair?.a).toBe(16);
    expect(cubicPair?.b).toBe(256);
  });

  it('verifies 1 is both perfect square (1²) and perfect cube (1³)', () => {
    const detail = getNumberDetail(1);
    expect(detail.isSquare).toBe(true);
    expect(detail.squareRoot).toBe(1);
    expect(detail.isCube).toBe(true);
    expect(detail.cubeRoot).toBe(1);
    expect(detail.factorPairs).toEqual([{ a: 1, b: 1, isSquarePair: true, isCubePair: true }]);
  });

  it('verifies 15625 is both perfect square (125²) and perfect cube (25³)', () => {
    const detail = getNumberDetail(15625);
    expect(detail.isSquare).toBe(true);
    expect(detail.squareRoot).toBe(125);
    expect(detail.isCube).toBe(true);
    expect(detail.cubeRoot).toBe(25);
  });
});

describe('Tier 2: Boundary & Corner Cases in Number Theory', () => {
  it('handles edge case n = 1: unit classification, factors, and roman numeral', () => {
    const detail = getNumberDetail(1);
    expect(detail.n).toBe(1);
    expect(detail.isPrime).toBe(false);
    expect(detail.isComposite).toBe(false);
    expect(detail.classification).toBe('unit');
    expect(detail.factors).toEqual([1]);
    expect(detail.sumOfDivisors).toBe(1);
    expect(detail.properDivisorsSum).toBe(0);
    expect(detail.primeFactorizationString).toBe('1 (Unit)');
    expect(detail.roman).toBe('I');
  });

  it('handles edge case n = 2: smallest and only even prime', () => {
    const detail = getNumberDetail(2);
    expect(detail.isPrime).toBe(true);
    expect(detail.isEven).toBe(true);
    expect(detail.isOdd).toBe(false);
    expect(detail.classification).toBe('prime');
    expect(detail.factors).toEqual([1, 2]);
    expect(detail.primeFactorizationString).toBe('2 (Prime Number)');
    expect(detail.roman).toBe('II');
  });

  it('handles boundary inputs <= 0 by clamping gracefully to 1', () => {
    const zeroDetail = getNumberDetail(0);
    expect(zeroDetail.n).toBe(1);
    expect(zeroDetail.classification).toBe('unit');

    const negDetail = getNumberDetail(-99);
    expect(negDetail.n).toBe(1);
    expect(negDetail.classification).toBe('unit');
  });

  it('handles float inputs by flooring to integer', () => {
    const floatDetail = getNumberDetail(16.85);
    expect(floatDetail.n).toBe(16);
    expect(floatDetail.isSquare).toBe(true);
    expect(floatDetail.squareRoot).toBe(4);
  });

  it('handles 6th-power numbers (n = k^6) rigorously', () => {
    const sixthPowers = [
      { k: 1, n: 1, sqrt: 1, cbrt: 1 },
      { k: 2, n: 64, sqrt: 8, cbrt: 4 },
      { k: 3, n: 729, sqrt: 27, cbrt: 9 },
      { k: 4, n: 4096, sqrt: 64, cbrt: 16 },
      { k: 5, n: 15625, sqrt: 125, cbrt: 25 },
      { k: 6, n: 46656, sqrt: 216, cbrt: 36 },
    ];

    for (const item of sixthPowers) {
      const detail = getNumberDetail(item.n);
      expect(detail.isSquare).toBe(true);
      expect(detail.squareRoot).toBe(item.sqrt);
      expect(detail.isCube).toBe(true);
      expect(detail.cubeRoot).toBe(item.cbrt);
    }
  });

  it('handles large powers accurately without float precision collapse', () => {
    // 50^3 = 125,000
    const cube50 = getNumberDetail(125000);
    expect(cube50.isCube).toBe(true);
    expect(cube50.cubeRoot).toBe(50);

    // 100^3 = 1,000,000
    const cube100 = getNumberDetail(1000000);
    expect(cube100.isCube).toBe(true);
    expect(cube100.cubeRoot).toBe(100);

    // 50^2 = 2,500
    const square50 = getNumberDetail(2500);
    expect(square50.isSquare).toBe(true);
    expect(square50.squareRoot).toBe(50);

    // 100^2 = 10,000
    const square100 = getNumberDetail(10000);
    expect(square100.isSquare).toBe(true);
    expect(square100.squareRoot).toBe(100);
  });

  it('enforces Roman numeral boundaries: 1 to 3999 and N/A for out of bounds', () => {
    expect(toRomanNumeral(1)).toBe('I');
    expect(toRomanNumeral(4)).toBe('IV');
    expect(toRomanNumeral(9)).toBe('IX');
    expect(toRomanNumeral(49)).toBe('XLIX');
    expect(toRomanNumeral(99)).toBe('XCIX');
    expect(toRomanNumeral(499)).toBe('CDXCIX');
    expect(toRomanNumeral(999)).toBe('CMXCIX');
    expect(toRomanNumeral(2026)).toBe('MMXXVI');
    expect(toRomanNumeral(3999)).toBe('MMMCMXCIX');

    // Extremes > 3999
    expect(toRomanNumeral(4000)).toBe('N/A');
    expect(toRomanNumeral(10000)).toBe('N/A');
    expect(toRomanNumeral(1000000)).toBe('N/A');

    // Extremes < 1
    expect(toRomanNumeral(0)).toBe('N/A');
    expect(toRomanNumeral(-5)).toBe('N/A');
  });

  it('verifies proper divisor classification across unit, prime, perfect, abundant, deficient', () => {
    // Perfect: 6 (1+2+3 = 6), 28 (1+2+4+7+14 = 28)
    expect(getNumberDetail(6).classification).toBe('composite-perfect');
    expect(getNumberDetail(28).classification).toBe('composite-perfect');

    // Abundant: 12 (1+2+3+4+6 = 16 > 12), 24 (proper sum = 36 > 24)
    expect(getNumberDetail(12).classification).toBe('composite-abundant');
    expect(getNumberDetail(24).classification).toBe('composite-abundant');

    // Deficient: 4 (1+2 = 3 < 4), 8 (1+2+4 = 7 < 8), 9, 15
    expect(getNumberDetail(4).classification).toBe('composite-deficient');
    expect(getNumberDetail(8).classification).toBe('composite-deficient');
    expect(getNumberDetail(9).classification).toBe('composite-deficient');
    expect(getNumberDetail(15).classification).toBe('composite-deficient');

    // Primes: 7, 13
    expect(getNumberDetail(7).classification).toBe('prime');
    expect(getNumberDetail(13).classification).toBe('prime');
  });

  it('formats prime factorizations with correct exponents and superscripts', () => {
    expect(getNumberDetail(12).primeFactorizationString).toBe('2² × 3');
    expect(getNumberDetail(72).primeFactorizationString).toBe('2³ × 3²');
    expect(getNumberDetail(100).primeFactorizationString).toBe('2² × 5²');
    expect(getNumberDetail(128).primeFactorizationString).toBe('2⁷');
    expect(getNumberDetail(4096).primeFactorizationString).toBe('2¹²');
  });

  it('generates full multiplication tables accurately', () => {
    const tableOf7 = getFullMultiplicationTable(7, 12);
    expect(tableOf7.length).toBe(12);
    expect(tableOf7[0]).toEqual({
      step: 1,
      multiplier: 1,
      product: 7,
      equation: '7 × 1 = 7',
    });
    expect(tableOf7[11]).toEqual({
      step: 12,
      multiplier: 12,
      product: 84,
      equation: '7 × 12 = 84',
    });
  });
});
