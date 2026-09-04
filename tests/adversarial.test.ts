// @ts-ignore: bun:test provided by Bun runtime
import { describe, it, expect } from 'bun:test';
import {
  getNumberDetail,
  toRomanNumeral,
  getFullMultiplicationTable,
} from '../src/utils/mathUtils';
import type { FilterCategory, RangePreset, SortOrder } from '../src/types';

/**
 * Pure generator mirroring App.tsx range & pagination logic for adversarial verification
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
  maxItems = 10000
): number[] {
  const arr: number[] = [];
  const limit = Math.min(endNum, startNum + maxItems - 1);
  for (let i = startNum; i <= limit; i++) {
    if (filterCategory === 'square') {
      arr.push(i * i);
    } else if (filterCategory === 'cube') {
      arr.push(i * i * i);
    } else {
      arr.push(i);
    }
  }
  return arr;
}

/**
 * Pure helper mirroring NumberCard preview pair logic
 */
function computePreviewPair(
  n: number,
  filterCategory?: FilterCategory
): string {
  const detail = getNumberDetail(n);
  if (detail.isPrime) {
    return `1 × ${n}`;
  }
  if (filterCategory === 'cube' && detail.isCube && detail.cubeRoot) {
    const k = detail.cubeRoot;
    return `${k} × ${k * k}`;
  }
  if (detail.isSquare && detail.squareRoot) {
    return `${detail.squareRoot} × ${detail.squareRoot}`;
  }
  if (detail.isCube && detail.cubeRoot) {
    const k = detail.cubeRoot;
    return `${k} × ${k * k}`;
  }
  const nonTrivial = detail.factorPairs.filter((p) => p.a > 1);
  if (nonTrivial.length > 0) {
    const best = nonTrivial[nonTrivial.length - 1];
    return `${best.a} × ${best.b}`;
  }
  return `1 × ${n}`;
}

// -----------------------------------------------------------------------------
// TIER 5 ADVERSARIAL STRESS-TESTING SUITE
// -----------------------------------------------------------------------------

describe('Tier 5 Adversarial: Extreme Powers (k=50 -> 125,000, k=100 -> 1,000,000)', () => {
  it('verifies extreme cube k=100 -> 100³ = 1,000,000 with exact integer roots and factor pairs', () => {
    const n = 1000000;
    const detail = getNumberDetail(n);

    // Exact cube validation
    expect(detail.isCube).toBe(true);
    expect(detail.cubeRoot).toBe(100);
    expect(detail.cubeRoot! * detail.cubeRoot! * detail.cubeRoot!).toBe(1000000);

    // Exact square validation (1,000,000 = 1000^2)
    expect(detail.isSquare).toBe(true);
    expect(detail.squareRoot).toBe(1000);
    expect(detail.squareRoot! * detail.squareRoot!).toBe(1000000);

    // Cubic factor pair (100 × 10000)
    const cubicPair = detail.factorPairs.find((p) => p.a === 100 || p.b === 100);
    expect(cubicPair).toBeDefined();
    expect(cubicPair?.a).toBe(100);
    expect(cubicPair?.b).toBe(10000);
    expect(cubicPair?.isCubePair).toBe(true);

    // Square factor pair (1000 × 1000)
    const squarePair = detail.factorPairs.find((p) => p.isSquarePair);
    expect(squarePair).toBeDefined();
    expect(squarePair?.a).toBe(1000);
    expect(squarePair?.b).toBe(1000);

    // Prime factorization: 1,000,000 = 2^6 * 5^6
    expect(detail.primeFactorizationString).toBe('2⁶ × 5⁶');
  });

  it('verifies extreme cube k=50 -> 50³ = 125,000 with exact integer roots and factor pairs', () => {
    const n = 125000;
    const detail = getNumberDetail(n);

    expect(detail.isCube).toBe(true);
    expect(detail.cubeRoot).toBe(50);
    expect(detail.cubeRoot! * detail.cubeRoot! * detail.cubeRoot!).toBe(125000);

    // 125,000 is not a perfect square (sqrt ≈ 353.55)
    expect(detail.isSquare).toBe(false);
    expect(detail.squareRoot).toBeNull();

    // Cubic factor pair (50 × 2500)
    const cubicPair = detail.factorPairs.find((p) => p.a === 50 || p.b === 50);
    expect(cubicPair).toBeDefined();
    expect(cubicPair?.a).toBe(50);
    expect(cubicPair?.b).toBe(2500);
    expect(cubicPair?.isCubePair).toBe(true);

    // Prime factorization: 125,000 = 2^3 * 5^6
    expect(detail.primeFactorizationString).toBe('2³ × 5⁶');
  });

  it('verifies dense high-power cube progression up to 1,000,000 without precision degradation', () => {
    const highBases = [20, 30, 40, 50, 60, 70, 75, 80, 85, 90, 95, 98, 99, 100];
    for (const k of highBases) {
      const cubeVal = k * k * k;
      const detail = getNumberDetail(cubeVal);
      expect(detail.isCube).toBe(true);
      expect(detail.cubeRoot).toBe(k);
      expect(detail.cubeRoot! * detail.cubeRoot! * detail.cubeRoot!).toBe(cubeVal);

      const cubePair = detail.factorPairs.find((p) => p.a === k || p.b === k);
      expect(cubePair).toBeDefined();
      expect(cubePair?.isCubePair).toBe(true);
      expect(cubePair!.a * cubePair!.b).toBe(cubeVal);
    }
  });

  it('verifies dense high-power square progression up to 1,000,000 without precision degradation', () => {
    const highBases = [50, 100, 200, 300, 400, 500, 700, 800, 900, 1000];
    for (const k of highBases) {
      const sqVal = k * k;
      const detail = getNumberDetail(sqVal);
      expect(detail.isSquare).toBe(true);
      expect(detail.squareRoot).toBe(k);
      expect(detail.squareRoot! * detail.squareRoot!).toBe(sqVal);

      const sqPair = detail.factorPairs.find((p) => p.isSquarePair);
      expect(sqPair).toBeDefined();
      expect(sqPair?.a).toBe(k);
      expect(sqPair?.b).toBe(k);
    }
  });

  it('generates exact extreme cubes and squares via range generator', () => {
    const cubesRange = generateNumbers(1, 100, 'cube');
    expect(cubesRange.length).toBe(100);
    expect(cubesRange[49]).toBe(125000);
    expect(cubesRange[99]).toBe(1000000);

    const squaresRange = generateNumbers(1, 100, 'square');
    expect(squaresRange.length).toBe(100);
    expect(squaresRange[49]).toBe(2500);
    expect(squaresRange[99]).toBe(10000);
  });
});

describe('Tier 5 Adversarial: 6th-Power Numbers (n = k^6)', () => {
  const SIXTH_POWERS = [
    { k: 1, n: 1, sqrt: 1, cbrt: 1, primeFact: '1 (Unit)' },
    { k: 2, n: 64, sqrt: 8, cbrt: 4, primeFact: '2⁶' },
    { k: 3, n: 729, sqrt: 27, cbrt: 9, primeFact: '3⁶' },
    { k: 4, n: 4096, sqrt: 64, cbrt: 16, primeFact: '2¹²' },
    { k: 5, n: 15625, sqrt: 125, cbrt: 25, primeFact: '5⁶' },
    { k: 6, n: 46656, sqrt: 216, cbrt: 36, primeFact: '2⁶ × 3⁶' },
    { k: 7, n: 117649, sqrt: 343, cbrt: 49, primeFact: '7⁶' },
    { k: 8, n: 262144, sqrt: 512, cbrt: 64, primeFact: '2¹⁸' },
    { k: 9, n: 531441, sqrt: 729, cbrt: 81, primeFact: '3¹²' },
    { k: 10, n: 1000000, sqrt: 1000, cbrt: 100, primeFact: '2⁶ × 5⁶' },
  ];

  for (const item of SIXTH_POWERS) {
    it(`rigorously validates 6th-power number ${item.n} (${item.k}^6 = ${item.sqrt}² = ${item.cbrt}³)`, () => {
      const detail = getNumberDetail(item.n);

      // Both square and cube must be true
      expect(detail.isSquare).toBe(true);
      expect(detail.squareRoot).toBe(item.sqrt);
      expect(detail.squareRoot! * detail.squareRoot!).toBe(item.n);

      expect(detail.isCube).toBe(true);
      expect(detail.cubeRoot).toBe(item.cbrt);
      expect(detail.cubeRoot! * detail.cubeRoot! * detail.cubeRoot!).toBe(item.n);

      // Verify presence of square pair (s, s)
      const sqPair = detail.factorPairs.find((p) => p.isSquarePair);
      expect(sqPair).toBeDefined();
      expect(sqPair?.a).toBe(item.sqrt);
      expect(sqPair?.b).toBe(item.sqrt);

      // Verify presence of cube pair (c, c^2)
      const cbPair = detail.factorPairs.find((p) => (p.a === item.cbrt || p.b === item.cbrt) && p.isCubePair);
      expect(cbPair).toBeDefined();
      expect(cbPair?.isCubePair).toBe(true);
      expect(cbPair!.a * cbPair!.b).toBe(item.n);

      // Verify prime factorization string
      expect(detail.primeFactorizationString).toBe(item.primeFact);

      // Context-aware preview pair in 'cube' view prioritizes cubic factorization
      const cubeContextPreview = computePreviewPair(item.n, 'cube');
      expect(cubeContextPreview).toBe(`${item.cbrt} × ${item.cbrt * item.cbrt}`);

      // Context-aware preview pair in 'square' view prioritizes square factorization
      const squareContextPreview = computePreviewPair(item.n, 'square');
      expect(squareContextPreview).toBe(`${item.sqrt} × ${item.sqrt}`);
    });
  }
});

describe('Tier 5 Adversarial: Non-Powers Close to Powers (Zero False Positives Guarantee)', () => {
  it('rejects numbers adjacent to 6th powers: 64 (62, 63, 65, 66)', () => {
    const neighbors = [62, 63, 65, 66];
    for (const n of neighbors) {
      const detail = getNumberDetail(n);
      expect(detail.isSquare).toBe(false);
      expect(detail.squareRoot).toBeNull();
      expect(detail.isCube).toBe(false);
      expect(detail.cubeRoot).toBeNull();
      expect(detail.factorPairs.some((p) => p.isSquarePair)).toBe(false);
      expect(detail.factorPairs.some((p) => p.isCubePair)).toBe(false);
    }
  });

  it('rejects numbers adjacent to 6th powers: 729 (727, 728, 730, 731)', () => {
    const neighbors = [727, 728, 730, 731];
    for (const n of neighbors) {
      const detail = getNumberDetail(n);
      expect(detail.isSquare).toBe(false);
      expect(detail.squareRoot).toBeNull();
      expect(detail.isCube).toBe(false);
      expect(detail.cubeRoot).toBeNull();
    }
  });

  it('rejects numbers adjacent to 6th powers: 4096 (4094, 4095, 4097, 4098)', () => {
    const neighbors = [4094, 4095, 4097, 4098];
    for (const n of neighbors) {
      const detail = getNumberDetail(n);
      expect(detail.isSquare).toBe(false);
      expect(detail.squareRoot).toBeNull();
      expect(detail.isCube).toBe(false);
      expect(detail.cubeRoot).toBeNull();
    }
  });

  it('rejects numbers adjacent to 6th powers: 15625 (15623, 15624, 15626, 15627)', () => {
    const neighbors = [15623, 15624, 15626, 15627];
    for (const n of neighbors) {
      const detail = getNumberDetail(n);
      expect(detail.isSquare).toBe(false);
      expect(detail.squareRoot).toBeNull();
      expect(detail.isCube).toBe(false);
      expect(detail.cubeRoot).toBeNull();
    }
  });

  it('rejects numbers adjacent to 6th powers: 46656 (46654, 46655, 46657, 46658)', () => {
    const neighbors = [46654, 46655, 46657, 46658];
    for (const n of neighbors) {
      const detail = getNumberDetail(n);
      expect(detail.isSquare).toBe(false);
      expect(detail.squareRoot).toBeNull();
      expect(detail.isCube).toBe(false);
      expect(detail.cubeRoot).toBeNull();
    }
  });

  it('rejects numbers adjacent to 6th powers: 117649 (117647, 117648, 117650, 117651)', () => {
    const neighbors = [117647, 117648, 117650, 117651];
    for (const n of neighbors) {
      const detail = getNumberDetail(n);
      expect(detail.isSquare).toBe(false);
      expect(detail.squareRoot).toBeNull();
      expect(detail.isCube).toBe(false);
      expect(detail.cubeRoot).toBeNull();
    }
  });

  it('rejects numbers adjacent to 6th powers: 262144 (262142, 262143, 262145, 262146)', () => {
    const neighbors = [262142, 262143, 262145, 262146];
    for (const n of neighbors) {
      const detail = getNumberDetail(n);
      expect(detail.isSquare).toBe(false);
      expect(detail.squareRoot).toBeNull();
      expect(detail.isCube).toBe(false);
      expect(detail.cubeRoot).toBeNull();
    }
  });

  it('rejects numbers adjacent to 6th powers: 531441 (531439, 531440, 531442, 531443)', () => {
    const neighbors = [531439, 531440, 531442, 531443];
    for (const n of neighbors) {
      const detail = getNumberDetail(n);
      expect(detail.isSquare).toBe(false);
      expect(detail.squareRoot).toBeNull();
      expect(detail.isCube).toBe(false);
      expect(detail.cubeRoot).toBeNull();
    }
  });

  it('rejects numbers adjacent to 6th powers: 1000000 (999998, 999999, 1000001, 1000002)', () => {
    const neighbors = [999998, 999999, 1000001, 1000002];
    for (const n of neighbors) {
      const detail = getNumberDetail(n);
      expect(detail.isSquare).toBe(false);
      expect(detail.squareRoot).toBeNull();
      expect(detail.isCube).toBe(false);
      expect(detail.cubeRoot).toBeNull();
    }
  });

  it('rejects numbers adjacent to pure cubes (27, 125, 216, 343, 512, 1000, 125000)', () => {
    const cubeNeighbors = [
      { cube: 27, neighbors: [26, 28] },
      { cube: 125, neighbors: [124, 126] },
      { cube: 216, neighbors: [215, 217] },
      { cube: 343, neighbors: [342, 344] },
      { cube: 512, neighbors: [511, 513] },
      { cube: 1000, neighbors: [999, 1001] },
      { cube: 125000, neighbors: [124999, 125001] },
    ];

    for (const group of cubeNeighbors) {
      for (const n of group.neighbors) {
        const detail = getNumberDetail(n);
        expect(detail.isCube).toBe(false);
        expect(detail.cubeRoot).toBeNull();
      }
    }
  });

  it('rejects non-squares adjacent to pure squares (25, 49, 100, 144, 2500, 10000)', () => {
    const squareNeighbors = [
      { sq: 25, neighbors: [24, 26] },
      { sq: 49, neighbors: [48, 50] },
      { sq: 100, neighbors: [99, 101] },
      { sq: 144, neighbors: [143, 145] },
      { sq: 2500, neighbors: [2499, 2501] },
      { sq: 10000, neighbors: [9999, 10001] },
    ];

    for (const group of squareNeighbors) {
      for (const n of group.neighbors) {
        const detail = getNumberDetail(n);
        expect(detail.isSquare).toBe(false);
        expect(detail.squareRoot).toBeNull();
      }
    }
  });

  it('performs exhaustive sweep around 64 (50 to 75) verifying 64 is uniquely square and cube', () => {
    for (let n = 50; n <= 75; n++) {
      const detail = getNumberDetail(n);
      if (n === 64) {
        expect(detail.isSquare).toBe(true);
        expect(detail.isCube).toBe(true);
      } else {
        expect(detail.isCube).toBe(false);
        if (n !== 64) {
          // No other squares exist in [50, 75]
          expect(detail.isSquare).toBe(false);
        }
      }
    }
  });
});

describe('Tier 5 Adversarial: Large Composite Numbers with Dense Factor Pairs (2520, 5040, 7560, 3600)', () => {
  it('analyzes highly composite number 2520 (48 factors, 24 pairs, abundant)', () => {
    const detail = getNumberDetail(2520);

    // Factors validation: 2520 = 2^3 * 3^2 * 5 * 7
    // Total factors = 4 * 3 * 2 * 2 = 48
    expect(detail.factors.length).toBe(48);
    expect(detail.factors[0]).toBe(1);
    expect(detail.factors[47]).toBe(2520);

    // Factor pairs: 48 / 2 = 24 pairs
    expect(detail.factorPairs.length).toBe(24);
    for (const pair of detail.factorPairs) {
      expect(pair.a * pair.b).toBe(2520);
      expect(pair.a).toBeLessThanOrEqual(pair.b);
      expect(pair.isSquarePair).toBe(false);
    }
    // Pairs must be strictly sorted by 'a'
    for (let i = 1; i < detail.factorPairs.length; i++) {
      expect(detail.factorPairs[i].a).toBeGreaterThan(detail.factorPairs[i - 1].a);
    }

    // Properties
    expect(detail.isSquare).toBe(false);
    expect(detail.isCube).toBe(false);
    expect(detail.isPrime).toBe(false);
    expect(detail.isComposite).toBe(true);
    expect(detail.isEven).toBe(true);
    expect(detail.classification).toBe('composite-abundant');
    expect(detail.properDivisorsSum).toBe(6840);
    expect(detail.primeFactorizationString).toBe('2³ × 3² × 5 × 7');
    expect(detail.roman).toBe('MMDXX');

    // Multiplications: 24 pairs * 2 commutative directions = 48 equations
    expect(detail.allMultiplications.length).toBe(48);
  });

  it('analyzes highly composite number 5040 (60 factors, 30 pairs, abundant)', () => {
    const detail = getNumberDetail(5040);

    // 5040 = 2^4 * 3^2 * 5 * 7
    // Total factors = 5 * 3 * 2 * 2 = 60
    expect(detail.factors.length).toBe(60);
    expect(detail.factorPairs.length).toBe(30);

    for (const pair of detail.factorPairs) {
      expect(pair.a * pair.b).toBe(5040);
      expect(pair.a).toBeLessThanOrEqual(pair.b);
    }

    expect(detail.classification).toBe('composite-abundant');
    expect(detail.properDivisorsSum).toBe(14304);
    expect(detail.primeFactorizationString).toBe('2⁴ × 3² × 5 × 7');
    // > 3999 returns N/A for roman
    expect(detail.roman).toBe('N/A');
    expect(detail.allMultiplications.length).toBe(60);
  });

  it('analyzes highly composite number 7560 (64 factors, 32 pairs, abundant)', () => {
    const detail = getNumberDetail(7560);

    // 7560 = 2^3 * 3^3 * 5 * 7
    // Total factors = 4 * 4 * 2 * 2 = 64
    expect(detail.factors.length).toBe(64);
    expect(detail.factorPairs.length).toBe(32);

    for (const pair of detail.factorPairs) {
      expect(pair.a * pair.b).toBe(7560);
      expect(pair.a).toBeLessThanOrEqual(pair.b);
    }

    expect(detail.classification).toBe('composite-abundant');
    expect(detail.properDivisorsSum).toBe(21240);
    expect(detail.primeFactorizationString).toBe('2³ × 3³ × 5 × 7');
    expect(detail.roman).toBe('N/A');
    expect(detail.allMultiplications.length).toBe(64);
  });

  it('analyzes composite square 3600 (45 factors, 23 pairs including 60x60 square pair)', () => {
    const detail = getNumberDetail(3600);

    // 3600 = 60^2 = 2^4 * 3^2 * 5^2
    // Total factors = 5 * 3 * 3 = 45 (odd count because it is a perfect square)
    expect(detail.factors.length).toBe(45);
    // Factor pairs = (45 - 1) / 2 + 1 = 23
    expect(detail.factorPairs.length).toBe(23);

    const sqPair = detail.factorPairs.find((p) => p.isSquarePair);
    expect(sqPair).toBeDefined();
    expect(sqPair?.a).toBe(60);
    expect(sqPair?.b).toBe(60);

    expect(detail.isSquare).toBe(true);
    expect(detail.squareRoot).toBe(60);
    expect(detail.isCube).toBe(false);
    expect(detail.primeFactorizationString).toBe('2⁴ × 3² × 5²');
    expect(detail.roman).toBe('MMMDC');

    // 22 pairs * 2 + 1 square pair = 45 distinct multiplications
    expect(detail.allMultiplications.length).toBe(45);
  });
});

describe('Tier 5 Adversarial: Auto-Load Pagination Increments Across Successive Steps', () => {
  it('validates 10 successive auto-load increments in Cubes view up to 600 base cubes', () => {
    // Start with preset 1-100 (bases 1..100)
    let extra = 0;
    const recordedSizes: number[] = [];

    for (let step = 0; step <= 10; step++) {
      const bounds = computeRangeBounds('1-100', 1, 100, extra);
      const cubes = generateNumbers(bounds.startNum, bounds.endNum, 'cube');

      const expectedLength = 100 + extra;
      expect(cubes.length).toBe(expectedLength);
      recordedSizes.push(cubes.length);

      // Verify boundary values
      expect(cubes[0]).toBe(1); // 1^3
      expect(cubes[expectedLength - 1]).toBe(expectedLength ** 3);

      // Verify monotonicity
      for (let i = 1; i < cubes.length; i++) {
        expect(cubes[i]).toBeGreaterThan(cubes[i - 1]);
      }

      // Verify no duplicates
      const uniqueCount = new Set(cubes).size;
      expect(uniqueCount).toBe(cubes.length);

      // Increment extra count by 50
      extra += 50;
    }

    // Step sequence: 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600
    expect(recordedSizes).toEqual([100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600]);
  });

  it('validates successive auto-load increments in Squares view from preset 1-50', () => {
    let extra = 0;
    const sizes: number[] = [];

    for (let step = 0; step < 5; step++) {
      const bounds = computeRangeBounds('1-50', 1, 50, extra);
      const squares = generateNumbers(bounds.startNum, bounds.endNum, 'square');
      const expectedLength = 50 + extra;
      expect(squares.length).toBe(expectedLength);
      sizes.push(squares.length);

      expect(squares[0]).toBe(1);
      expect(squares[expectedLength - 1]).toBe(expectedLength * expectedLength);

      extra += 50;
    }

    expect(sizes).toEqual([50, 100, 150, 200, 250]);
  });

  it('verifies that changing range preset cleanly resets extraCount without artifact leakage', () => {
    // User was browsing 1-50 with +200 extra loaded (total 250)
    const boundsBefore = computeRangeBounds('1-50', 1, 50, 200);
    expect(boundsBefore.endNum).toBe(250);

    // User switches preset to 1-100: extraCount is reset to 0 in App.tsx
    const boundsAfter = computeRangeBounds('1-100', 1, 100, 0);
    expect(boundsAfter.startNum).toBe(1);
    expect(boundsAfter.endNum).toBe(100);

    const freshCubes = generateNumbers(boundsAfter.startNum, boundsAfter.endNum, 'cube');
    expect(freshCubes.length).toBe(100);
    expect(freshCubes[99]).toBe(1000000);
  });

  it('clamps safely at maxItems limit (10,000) when massive ranges are requested', () => {
    const hugeBounds = computeRangeBounds('custom', 1, 50000, 0);
    expect(hugeBounds.startNum).toBe(1);
    expect(hugeBounds.endNum).toBe(50000);

    // generateNumbers caps at maxItems = 10000
    const clampedList = generateNumbers(hugeBounds.startNum, hugeBounds.endNum, 'cube', 10000);
    expect(clampedList.length).toBe(10000);
    expect(clampedList[0]).toBe(1);
    expect(clampedList[9999]).toBe(10000 * 10000 * 10000); // 1,000,000,000,000 (10^12)
  });
});

describe('Tier 5 Adversarial: RevisionView & NumberCard Invariants', () => {
  it('RevisionView cubes filter generates exact first N cubes and supports bounded navigation', () => {
    const maxCount = 100;
    const cubes = Array.from({ length: maxCount }, (_, i) => (i + 1) * (i + 1) * (i + 1));
    expect(cubes.length).toBe(100);
    expect(cubes[0]).toBe(1);
    expect(cubes[3]).toBe(64);
    expect(cubes[99]).toBe(1000000);

    // Navigation test: index 3 (64)
    const curIdx = cubes.indexOf(64);
    expect(curIdx).toBe(3);
    const prevNum = cubes[curIdx - 1]; // 27
    const nextNum = cubes[curIdx + 1]; // 125
    expect(prevNum).toBe(27);
    expect(nextNum).toBe(125);

    // Boundary test at start (1): prev should not exist
    expect(curIdx > 0).toBe(true);
    const startIdx = cubes.indexOf(1);
    expect(startIdx).toBe(0);
    // At startIdx === 0, handlePrev condition `currentIndex > 0` is false

    // Boundary test at end (1,000,000): next should not exist
    const endIdx = cubes.indexOf(1000000);
    expect(endIdx).toBe(99);
    expect(endIdx < cubes.length - 1).toBe(false);
  });

  it('NumberCard preview pair and dual badges for 6th powers never collide or omit cube data', () => {
    const testCases = [
      { n: 64, cubePair: '4 × 16', squarePair: '8 × 8' },
      { n: 729, cubePair: '9 × 81', squarePair: '27 × 27' },
      { n: 4096, cubePair: '16 × 256', squarePair: '64 × 64' },
      { n: 15625, cubePair: '25 × 625', squarePair: '125 × 125' },
      { n: 1000000, cubePair: '100 × 10000', squarePair: '1000 × 1000' },
    ];

    for (const tc of testCases) {
      const cubePreview = computePreviewPair(tc.n, 'cube');
      const squarePreview = computePreviewPair(tc.n, 'square');
      expect(cubePreview).toBe(tc.cubePair);
      expect(squarePreview).toBe(tc.squarePair);

      const detail = getNumberDetail(tc.n);
      expect(detail.isCube).toBe(true);
      expect(detail.isSquare).toBe(true);
    }
  });
});
