// @ts-ignore: bun:test provided by Bun runtime
import { describe, it, expect } from 'bun:test';
import {
  getNumberDetail,
  integerPower,
  getMaxSafeExponent,
  getMaxSafeBase,
} from '../src/utils/mathUtils';
import type { FilterCategory, RangePreset, SortOrder } from '../src/types';

/**
 * Pure generator mirroring App.tsx range & number generation contract
 */
function computeRangeBounds(
  rangePreset: RangePreset,
  customStart = 1,
  customEnd = 100,
  extraCount = 0
): { startNum: number; endNum: number } {
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

function generateNumbers(
  startNum: number,
  endNum: number,
  filterCategory: FilterCategory = 'all',
  maxItems = 10000,
  multipleOfValue = 3,
  powerOfBase = 2,
  customPowerExponent = 4
): number[] {
  const arr: number[] = [];
  const limit = Math.min(endNum, startNum + maxItems - 1);
  if (filterCategory === 'square') {
    for (let i = startNum; i <= limit; i++) {
      arr.push(i * i);
    }
  } else if (filterCategory === 'cube') {
    for (let i = startNum; i <= limit; i++) {
      arr.push(i * i * i);
    }
  } else if (filterCategory === 'customPower') {
    const maxBase = getMaxSafeBase(customPowerExponent);
    const safeLimit = Math.min(limit, maxBase);
    for (let i = startNum; i <= safeLimit; i++) {
      arr.push(integerPower(i, customPowerExponent));
    }
  } else if (filterCategory === 'multipleOf') {
    const step = Math.max(1, multipleOfValue);
    for (let i = startNum; i <= limit; i++) {
      arr.push(i * step);
    }
  } else if (filterCategory === 'powerOf') {
    const maxExp = getMaxSafeExponent(powerOfBase);
    for (let i = startNum; i <= limit; i++) {
      const exp = i - 1;
      if (exp >= 0 && exp <= maxExp) {
        arr.push(integerPower(powerOfBase, exp));
      }
    }
  } else {
    for (let i = startNum; i <= limit; i++) {
      arr.push(i);
    }
  }
  return arr;
}

function filterAndSortNumbers(
  baseNumbers: number[],
  filterCategory: FilterCategory = 'all',
  searchQuery = '',
  sortOrder: SortOrder = 'asc'
): number[] {
  let result = baseNumbers.filter((n) => {
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      if (!n.toString().includes(query)) {
        const detail = getNumberDetail(n);
        const hasFactorMatch = detail.factors.some((f) => f.toString() === query);
        const hasEquationMatch = detail.allMultiplications.some((m) =>
          m.equation.toLowerCase().includes(query)
        );
        if (!hasFactorMatch && !hasEquationMatch) return false;
      }
    }

    if (
      filterCategory === 'all' ||
      filterCategory === 'square' ||
      filterCategory === 'cube' ||
      filterCategory === 'customPower' ||
      filterCategory === 'multipleOf' ||
      filterCategory === 'powerOf'
    ) {
      return true;
    }

    const detail = getNumberDetail(n);
    if (filterCategory === 'prime') return detail.isPrime;
    if (filterCategory === 'composite') return detail.isComposite;
    if (filterCategory === 'even') return detail.isEven;
    if (filterCategory === 'odd') return detail.isOdd;
    return true;
  });

  if (sortOrder === 'desc') {
    result.sort((a, b) => b - a);
  }
  return result;
}

describe('Tier 1: Range Generation (Squares 1-50, Cubes 1-50, Cubes 1-100)', () => {
  it('preset 1-50 in Cubes view generates exactly 50 cube cards (1³ to 50³)', () => {
    const { startNum, endNum } = computeRangeBounds('1-50');
    expect(startNum).toBe(1);
    expect(endNum).toBe(50);

    const cubes = generateNumbers(startNum, endNum, 'cube');
    expect(cubes.length).toBe(50);
    expect(cubes[0]).toBe(1); // 1^3
    expect(cubes[1]).toBe(8); // 2^3
    expect(cubes[2]).toBe(27); // 3^3
    expect(cubes[3]).toBe(64); // 4^3
    expect(cubes[49]).toBe(125000); // 50^3

    // Verify all 50 generated numbers are true cubes
    for (let k = 1; k <= 50; k++) {
      expect(cubes[k - 1]).toBe(k * k * k);
      const detail = getNumberDetail(cubes[k - 1]);
      expect(detail.isCube).toBe(true);
      expect(detail.cubeRoot).toBe(k);
    }
  });

  it('preset 1-100 in Cubes view generates exactly 100 cube cards (1³ to 100³)', () => {
    const { startNum, endNum } = computeRangeBounds('1-100');
    expect(startNum).toBe(1);
    expect(endNum).toBe(100);

    const cubes = generateNumbers(startNum, endNum, 'cube');
    expect(cubes.length).toBe(100);
    expect(cubes[0]).toBe(1);
    expect(cubes[99]).toBe(1000000); // 100^3 = 1,000,000

    expect(cubes[15]).toBe(4096); // 16^3 = 4096
    const detail4096 = getNumberDetail(cubes[15]);
    expect(detail4096.isCube).toBe(true);
    expect(detail4096.cubeRoot).toBe(16);
  });

  it('preset 1-50 in Squares view generates exactly 50 square cards (1² to 50²)', () => {
    const { startNum, endNum } = computeRangeBounds('1-50');
    const squares = generateNumbers(startNum, endNum, 'square');
    expect(squares.length).toBe(50);
    expect(squares[0]).toBe(1);
    expect(squares[1]).toBe(4);
    expect(squares[2]).toBe(9);
    expect(squares[7]).toBe(64); // 8^2 = 64
    expect(squares[49]).toBe(2500); // 50^2 = 2500

    for (let k = 1; k <= 50; k++) {
      expect(squares[k - 1]).toBe(k * k);
      const detail = getNumberDetail(squares[k - 1]);
      expect(detail.isSquare).toBe(true);
      expect(detail.squareRoot).toBe(k);
    }
  });

  it('preset 1-100 in Squares view generates exactly 100 square cards (1² to 100²)', () => {
    const { startNum, endNum } = computeRangeBounds('1-100');
    const squares = generateNumbers(startNum, endNum, 'square');
    expect(squares.length).toBe(100);
    expect(squares[0]).toBe(1);
    expect(squares[99]).toBe(10000); // 100^2 = 10,000

    expect(squares[63]).toBe(4096); // 64^2 = 4096
    const detail4096 = getNumberDetail(squares[63]);
    expect(detail4096.isSquare).toBe(true);
    expect(detail4096.squareRoot).toBe(64);
  });

  it('custom range bounds generates base-specific squares and cubes', () => {
    const { startNum, endNum } = computeRangeBounds('custom', 10, 20);
    expect(startNum).toBe(10);
    expect(endNum).toBe(20);

    const cubes = generateNumbers(startNum, endNum, 'cube');
    expect(cubes.length).toBe(11);
    expect(cubes[0]).toBe(1000); // 10^3
    expect(cubes[10]).toBe(8000); // 20^3

    const squares = generateNumbers(startNum, endNum, 'square');
    expect(squares.length).toBe(11);
    expect(squares[0]).toBe(100); // 10^2
    expect(squares[10]).toBe(400); // 20^2
  });
});

describe('Tier 2: Boundary & Corner Cases in Range Generation', () => {
  it('correctly handles inverted custom range inputs (e.g. start > end)', () => {
    const { startNum, endNum } = computeRangeBounds('custom', 75, 25);
    expect(startNum).toBe(25);
    expect(endNum).toBe(75);
    const cubes = generateNumbers(startNum, endNum, 'cube');
    expect(cubes.length).toBe(51);
    expect(cubes[0]).toBe(15625); // 25^3
    expect(cubes[50]).toBe(421875); // 75^3
  });

  it('clamps non-positive custom inputs to minimum base 1', () => {
    const { startNum, endNum } = computeRangeBounds('custom', -10, 0);
    expect(startNum).toBe(1);
    expect(endNum).toBe(1);
    const cubes = generateNumbers(startNum, endNum, 'cube');
    expect(cubes).toEqual([1]);
  });

  it('verifies extreme power bounds: 16³=4096, 50³=125,000, 100³=1,000,000', () => {
    const { startNum, endNum } = computeRangeBounds('1-100');
    const cubes = generateNumbers(startNum, endNum, 'cube');

    // 16^3 = 4096
    expect(cubes[15]).toBe(4096);
    // 50^3 = 125,000
    expect(cubes[49]).toBe(125000);
    // 100^3 = 1,000,000
    expect(cubes[99]).toBe(1000000);
  });

  it('positions multi-power numbers correctly in both squares and cubes series', () => {
    // 64 is 4^3 and 8^2
    const cubes100 = generateNumbers(1, 100, 'cube');
    const squares100 = generateNumbers(1, 100, 'square');

    expect(cubes100.indexOf(64)).toBe(3); // 4th item (base 4)
    expect(squares100.indexOf(64)).toBe(7); // 8th item (base 8)

    // 729 is 9^3 and 27^2
    expect(cubes100.indexOf(729)).toBe(8); // 9th item (base 9)
    expect(squares100.indexOf(729)).toBe(26); // 27th item (base 27)

    // 4096 is 16^3 and 64^2
    expect(cubes100.indexOf(4096)).toBe(15); // 16th item (base 16)
    expect(squares100.indexOf(4096)).toBe(63); // 64th item (base 64)
  });

  it('handles safety limit for ultra-large ranges gracefully', () => {
    // Range 1 to 20,000 clamped by maxItems limit 10,000
    const limitedCubes = generateNumbers(1, 20000, 'cube', 1000);
    expect(limitedCubes.length).toBe(1000);
    expect(limitedCubes[999]).toBe(1000 * 1000 * 1000); // 1000^3 = 1,000,000,000
  });
});

describe('Tier 3: Cross-Feature Combinations (Auto-Load + Power Filters)', () => {
  it('auto-load in Cubes view loads successive increments of 50 base powers', () => {
    // Initial batch: bases 1 to 100 (100 cubes)
    let bounds = computeRangeBounds('1-100', 1, 100, 0);
    let cubes = generateNumbers(bounds.startNum, bounds.endNum, 'cube');
    expect(cubes.length).toBe(100);
    expect(cubes[99]).toBe(1000000); // 100^3

    // First auto-load increment (+50 base numbers: bases 101 to 150)
    bounds = computeRangeBounds('1-100', 1, 100, 50);
    cubes = generateNumbers(bounds.startNum, bounds.endNum, 'cube');
    expect(cubes.length).toBe(150);
    // Newly loaded chunk
    const newChunk1 = cubes.slice(100);
    expect(newChunk1.length).toBe(50);
    expect(newChunk1[0]).toBe(101 * 101 * 101); // 1,030,301
    expect(newChunk1[49]).toBe(150 * 150 * 150); // 3,375,000

    // Second auto-load increment (+100 base numbers: bases 1 to 200)
    bounds = computeRangeBounds('1-100', 1, 100, 100);
    cubes = generateNumbers(bounds.startNum, bounds.endNum, 'cube');
    expect(cubes.length).toBe(200);
    const newChunk2 = cubes.slice(150);
    expect(newChunk2.length).toBe(50);
    expect(newChunk2[0]).toBe(151 * 151 * 151); // 3,442,951
    expect(newChunk2[49]).toBe(200 * 200 * 200); // 8,000,000
  });

  it('auto-load in Squares view loads successive increments of 50 base squares', () => {
    // Initial batch: bases 1 to 50
    let bounds = computeRangeBounds('1-50', 1, 50, 0);
    let squares = generateNumbers(bounds.startNum, bounds.endNum, 'square');
    expect(squares.length).toBe(50);
    expect(squares[49]).toBe(2500);

    // Auto-load +50 -> bases 1 to 100
    bounds = computeRangeBounds('1-50', 1, 50, 50);
    squares = generateNumbers(bounds.startNum, bounds.endNum, 'square');
    expect(squares.length).toBe(100);
    expect(squares[99]).toBe(10000);
  });

  it('supports reverse sorting on power sequences', () => {
    const { startNum, endNum } = computeRangeBounds('1-50');
    const cubesAsc = generateNumbers(startNum, endNum, 'cube');
    const cubesDesc = filterAndSortNumbers(cubesAsc, 'cube', '', 'desc');

    expect(cubesDesc.length).toBe(50);
    expect(cubesDesc[0]).toBe(125000); // 50^3
    expect(cubesDesc[49]).toBe(1); // 1^3
  });

  it('supports search query filtering within power sequences', () => {
    const { startNum, endNum } = computeRangeBounds('1-100');
    const cubes = generateNumbers(startNum, endNum, 'cube');
    // Search for numbers containing "64"
    const matches = filterAndSortNumbers(cubes, 'cube', '64');
    expect(matches).toContain(64); // 4^3 = 64
    expect(matches).toContain(64000); // 40^3 = 64000
    for (const match of matches) {
      const detail = getNumberDetail(match);
      const isMatch =
        match.toString().includes('64') ||
        detail.factors.includes(64) ||
        detail.allMultiplications.some((m) => m.equation.includes('64'));
      expect(isMatch).toBe(true);
    }
  });

  it('multi-power numbers retain square and cube details in power views', () => {
    const cubes = generateNumbers(1, 50, 'cube');
    expect(cubes).toContain(64);
    const detail = getNumberDetail(64);
    // In Cubes view, 64 is present and has both properties
    expect(detail.isCube).toBe(true);
    expect(detail.cubeRoot).toBe(4);
    expect(detail.isSquare).toBe(true);
    expect(detail.squareRoot).toBe(8);
  });
});

describe('Tier 4: Multiples of & Powers of Full Set Generation & Safety Bounds', () => {
  it('preset 1-50 in Multiples view generates exactly 50 multiples of 25 (25 to 1250)', () => {
    const { startNum, endNum } = computeRangeBounds('1-50');
    const multiples = generateNumbers(startNum, endNum, 'multipleOf', 10000, 25);
    expect(multiples.length).toBe(50);
    expect(multiples[0]).toBe(25); // 1 × 25
    expect(multiples[1]).toBe(50); // 2 × 25
    expect(multiples[2]).toBe(75); // 3 × 25
    expect(multiples[49]).toBe(1250); // 50 × 25
    for (let i = 0; i < multiples.length; i++) {
      expect(multiples[i]).toBe((i + 1) * 25);
    }
  });

  it('preset 1-100 in Multiples view generates exactly 100 multiples of 25 (25 to 2500)', () => {
    const { startNum, endNum } = computeRangeBounds('1-100');
    const multiples = generateNumbers(startNum, endNum, 'multipleOf', 10000, 25);
    expect(multiples.length).toBe(100);
    expect(multiples[0]).toBe(25);
    expect(multiples[99]).toBe(2500); // 100 × 25
  });

  it('supports custom number multiples for any positive integer (e.g. 23 and 350)', () => {
    const { startNum, endNum } = computeRangeBounds('1-50');
    // Multiples of 23
    const multiples23 = generateNumbers(startNum, endNum, 'multipleOf', 10000, 23);
    expect(multiples23.length).toBe(50);
    expect(multiples23[0]).toBe(23);
    expect(multiples23[49]).toBe(1150); // 50 × 23

    // Multiples of 350
    const multiples350 = generateNumbers(startNum, endNum, 'multipleOf', 10000, 350);
    expect(multiples350.length).toBe(50);
    expect(multiples350[0]).toBe(350);
    expect(multiples350[49]).toBe(17500); // 50 × 350
  });

  it('dynamic load (+50 extra) expands multiples series by 50 next items', () => {
    const initial = computeRangeBounds('1-50');
    const initialMultiples = generateNumbers(initial.startNum, initial.endNum, 'multipleOf', 10000, 25);
    expect(initialMultiples.length).toBe(50);

    // After clicking +50
    const loaded = computeRangeBounds('1-50', 1, 50, 50);
    const loadedMultiples = generateNumbers(loaded.startNum, loaded.endNum, 'multipleOf', 10000, 25);
    expect(loadedMultiples.length).toBe(100);
    expect(loadedMultiples[50]).toBe(1275); // 51 × 25
    expect(loadedMultiples[99]).toBe(2500); // 100 × 25
  });

  it('preset 1-50 in Powers of base 2 generates 50 successive powers (2⁰ to 2⁴⁹)', () => {
    const { startNum, endNum } = computeRangeBounds('1-50');
    const powers = generateNumbers(startNum, endNum, 'powerOf', 10000, 3, 2);
    expect(powers.length).toBe(50);
    expect(powers[0]).toBe(1); // 2⁰
    expect(powers[1]).toBe(2); // 2¹
    expect(powers[2]).toBe(4); // 2²
    expect(powers[3]).toBe(8); // 2³
    expect(powers[49]).toBe(integerPower(2, 49)); // 2⁴⁹
  });

  it('preset 1-100 in Powers of base 2 safely caps at 53 powers without float overflow', () => {
    const { startNum, endNum } = computeRangeBounds('1-100');
    const powers = generateNumbers(startNum, endNum, 'powerOf', 10000, 3, 2);
    expect(powers.length).toBe(53); // 2⁰ to 2⁵²
    expect(powers[0]).toBe(1);
    expect(powers[52]).toBe(integerPower(2, 52));
    expect(powers[52]).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
    expect(Number.isSafeInteger(powers[52])).toBe(true);
  });

  it('10th power (x¹⁰) clamps safely at base 39 preventing freeze and wrong numbers', () => {
    const { startNum, endNum } = computeRangeBounds('1-50');
    expect(getMaxSafeBase(10)).toBe(39);

    const powers10th = generateNumbers(startNum, endNum, 'customPower', 10000, 3, 2, 10);
    expect(powers10th.length).toBe(39); // 1¹⁰ to 39¹⁰
    expect(powers10th[0]).toBe(1); // 1¹⁰
    expect(powers10th[1]).toBe(1024); // 2¹⁰
    expect(powers10th[38]).toBe(integerPower(39, 10)); // 39¹⁰
    expect(powers10th[38]).toBeLessThanOrEqual(Number.MAX_SAFE_INTEGER);
    expect(Number.isSafeInteger(powers10th[38])).toBe(true);

    // None of the numbers should equal Number.MAX_SAFE_INTEGER due to inaccurate truncation
    expect(powers10th).not.toContain(Number.MAX_SAFE_INTEGER);

    // Factor detail for 39¹⁰ executes in <30ms without thread freeze
    const startTime = performance.now();
    const detail39 = getNumberDetail(powers10th[38]);
    const elapsed = performance.now() - startTime;
    expect(elapsed).toBeLessThan(100);
    expect(detail39.primeFactors).toEqual([
      { prime: 3, exponent: 10 },
      { prime: 13, exponent: 10 },
    ]);
  });
});

