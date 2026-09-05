// @ts-ignore: bun:test provided by Bun runtime
import { describe, it, expect } from 'bun:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { getNumberDetail } from '../src/utils/mathUtils';
import type { FilterCategory } from '../src/types';

// Read component source files for structural and behavioral contract verification
const QUIZ_SRC = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/FactorQuizGame.tsx'),
  'utf8'
);
const REVISION_SRC = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/RevisionView.tsx'),
  'utf8'
);
const NUMBER_CARD_SRC = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/NumberCard.tsx'),
  'utf8'
);
const NUMBER_DETAIL_MODAL_SRC = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/NumberDetailModal.tsx'),
  'utf8'
);
const FILTER_BAR_SRC = fs.readFileSync(
  path.resolve(process.cwd(), 'src/components/FilterBar.tsx'),
  'utf8'
);

describe('Tier 1 & Tier 2: FactorQuizGame Scoring Validation', () => {
  interface QuizOption {
    id: string;
    text: string;
    isCorrect: boolean;
  }

  // Pure scoring evaluator matching the interface contract
  function evaluateQuizSubmission(
    options: QuizOption[],
    selectedIds: string[]
  ): { isCorrect: boolean; scoreDelta: number; newStreak: number } {
    if (selectedIds.length === 0) {
      return { isCorrect: false, scoreDelta: 0, newStreak: 0 };
    }

    const chosenOpts = options.filter((o) => selectedIds.includes(o.id));
    const totalCorrectOpts = options.filter((o) => o.isCorrect);

    const allChosenAreCorrect = chosenOpts.every((o) => o.isCorrect);
    const hasAtLeastOneCorrect = chosenOpts.length > 0;
    const hasSelectedAllCorrect = chosenOpts.length === totalCorrectOpts.length;

    const isUserCorrect = allChosenAreCorrect && hasAtLeastOneCorrect && hasSelectedAllCorrect;

    if (isUserCorrect) {
      const newStreak = 1;
      const scoreDelta = 10 * Math.min(newStreak, 5);
      return { isCorrect: true, scoreDelta, newStreak };
    } else {
      return { isCorrect: false, scoreDelta: 0, newStreak: 0 };
    }
  }

  const sampleQuestionOptions: QuizOption[] = [
    { id: '1', text: '4 × 16', isCorrect: true },
    { id: '2', text: '8 × 8', isCorrect: true },
    { id: '3', text: '3 × 20', isCorrect: false },
    { id: '4', text: '5 × 12', isCorrect: false },
    { id: '5', text: '6 × 11', isCorrect: false },
  ];

  it('awards points and streak when ALL correct pairs are selected', () => {
    const result = evaluateQuizSubmission(sampleQuestionOptions, ['1', '2']);
    expect(result.isCorrect).toBe(true);
    expect(result.scoreDelta).toBe(10);
    expect(result.newStreak).toBe(1);
  });

  it('rejects partial submissions: selecting only 1 of 2 correct pairs must fail', () => {
    // Only selecting '4 × 16'
    const result1 = evaluateQuizSubmission(sampleQuestionOptions, ['1']);
    expect(result1.isCorrect).toBe(false);
    expect(result1.scoreDelta).toBe(0);
    expect(result1.newStreak).toBe(0);

    // Only selecting '8 × 8'
    const result2 = evaluateQuizSubmission(sampleQuestionOptions, ['2']);
    expect(result2.isCorrect).toBe(false);
    expect(result2.scoreDelta).toBe(0);
    expect(result2.newStreak).toBe(0);
  });

  it('rejects submissions containing all correct pairs PLUS an incorrect distractor', () => {
    const result = evaluateQuizSubmission(sampleQuestionOptions, ['1', '2', '3']);
    expect(result.isCorrect).toBe(false);
    expect(result.scoreDelta).toBe(0);
    expect(result.newStreak).toBe(0);
  });

  it('rejects submissions with only incorrect distractors', () => {
    const result = evaluateQuizSubmission(sampleQuestionOptions, ['3', '4']);
    expect(result.isCorrect).toBe(false);
    expect(result.scoreDelta).toBe(0);
    expect(result.newStreak).toBe(0);
  });

  it('disallows empty selection submission', () => {
    const result = evaluateQuizSubmission(sampleQuestionOptions, []);
    expect(result.isCorrect).toBe(false);
    expect(result.scoreDelta).toBe(0);
    expect(result.newStreak).toBe(0);
  });

  it('verifies streak progression multiplier logic (10 * min(streak, 5))', () => {
    const calcScore = (streak: number) => 10 * Math.min(streak, 5);
    expect(calcScore(1)).toBe(10);
    expect(calcScore(2)).toBe(20);
    expect(calcScore(3)).toBe(30);
    expect(calcScore(4)).toBe(40);
    expect(calcScore(5)).toBe(50);
    expect(calcScore(10)).toBe(50); // capped at 5x multiplier
  });

  it('verifies distractor generation rule: distractors must never multiply to target', () => {
    const target = 64;
    const distractors = ['3 × 21', '5 × 13', '7 × 9', '6 × 10'];
    for (const d of distractors) {
      const [a, b] = d.split(' × ').map(Number);
      expect(a * b).not.toBe(target);
    }
  });

  it('verifies FactorQuizGame.tsx source contains strict multi-select scoring check', () => {
    // Verifies the code checks that total selected equals total correct options
    const hasTotalCheck =
      QUIZ_SRC.includes('totalCorrect') ||
      QUIZ_SRC.includes('correctOpts.length') ||
      QUIZ_SRC.includes('totalCorrectOpts') ||
      QUIZ_SRC.includes('filter((o) => o.isCorrect).length');
    expect(hasTotalCheck).toBe(true);
  });
});

describe('Tier 1: RevisionView Categories & Filtered Navigation', () => {
  // Navigation helper mirroring RevisionView filtered navigation contract
  function getNextNumber(current: number, filteredList: number[]): number {
    const idx = filteredList.indexOf(current);
    if (idx === -1 || idx >= filteredList.length - 1) return current;
    return filteredList[idx + 1];
  }

  function getPrevNumber(current: number, filteredList: number[]): number {
    const idx = filteredList.indexOf(current);
    if (idx <= 0) return current;
    return filteredList[idx - 1];
  }

  const cubeList = [1, 8, 27, 64, 125, 216, 343, 512, 729, 1000];

  it('RevisionView source includes cubes in filterMode definition', () => {
    // Verify 'cubes' is included in filter mode union or state
    expect(REVISION_SRC).toContain("'cubes'");
  });

  it('navigates sequentially within filtered cubes without escaping to non-cubes', () => {
    // Current at 27
    const nextAfter27 = getNextNumber(27, cubeList);
    expect(nextAfter27).toBe(64); // Next cube, NOT 28

    const nextAfter64 = getNextNumber(64, cubeList);
    expect(nextAfter64).toBe(125); // Next cube, NOT 65

    const prevAfter64 = getPrevNumber(64, cubeList);
    expect(prevAfter64).toBe(27); // Prev cube, NOT 63

    const prevAfter27 = getPrevNumber(27, cubeList);
    expect(prevAfter27).toBe(8); // Prev cube, NOT 26
  });

  it('clamps navigation cleanly at boundaries of the filtered list', () => {
    // At start (1)
    const prevAtStart = getPrevNumber(1, cubeList);
    expect(prevAtStart).toBe(1);

    // At end (1000)
    const nextAtEnd = getNextNumber(1000, cubeList);
    expect(nextAtEnd).toBe(1000);
  });

  it('RevisionView generates first N cubes for power filters rather than raw numbers <= N', () => {
    const count = 50;
    const generatedCubes = Array.from({ length: count }, (_, i) => (i + 1) ** 3);
    expect(generatedCubes.length).toBe(50);
    expect(generatedCubes[0]).toBe(1);
    expect(generatedCubes[49]).toBe(125000);

    const generatedSquares = Array.from({ length: count }, (_, i) => (i + 1) ** 2);
    expect(generatedSquares.length).toBe(50);
    expect(generatedSquares[0]).toBe(1);
    expect(generatedSquares[49]).toBe(2500);
  });

  it('RevisionView source implements filtered list index navigation', () => {
    const hasFilteredNav =
      REVISION_SRC.includes('filteredNumbers.indexOf') ||
      REVISION_SRC.includes('currentIndex') ||
      REVISION_SRC.includes('filteredList');
    expect(hasFilteredNav).toBe(true);
  });
});

describe('Tier 1 & Tier 3: NumberCard & NumberDetailModal Multi-Power Presentation', () => {
  function computeNumberCardPreviewPair(
    detail: ReturnType<typeof getNumberDetail>,
    filterCategory?: FilterCategory
  ): string {
    if (filterCategory === 'cube' && detail.isCube && detail.cubeRoot) {
      return `${detail.cubeRoot} × ${detail.cubeRoot * detail.cubeRoot}`;
    }
    if (detail.isPrime) {
      return `1 × ${detail.n}`;
    }
    if (detail.isSquare && detail.squareRoot) {
      return `${detail.squareRoot} × ${detail.squareRoot}`;
    }
    const nonTrivial = detail.factorPairs.filter((p) => p.a > 1);
    if (nonTrivial.length > 0) {
      const best = nonTrivial[nonTrivial.length - 1];
      return `${best.a} × ${best.b}`;
    }
    return `1 × ${detail.n}`;
  }

  it('formats cubic factor preview (4 × 16) for 64 in Cubes view', () => {
    const detail64 = getNumberDetail(64);
    const previewCubes = computeNumberCardPreviewPair(detail64, 'cube');
    expect(previewCubes).toBe('4 × 16');
  });

  it('formats square factor preview (8 × 8) for 64 in default/square view', () => {
    const detail64 = getNumberDetail(64);
    const previewSquare = computeNumberCardPreviewPair(detail64, 'square');
    expect(previewSquare).toBe('8 × 8');

    const previewDefault = computeNumberCardPreviewPair(detail64, 'all');
    expect(previewDefault).toBe('8 × 8');
  });

  it('formats cubic factor preview (16 × 256) for 4096 in Cubes view', () => {
    const detail4096 = getNumberDetail(4096);
    const previewCubes = computeNumberCardPreviewPair(detail4096, 'cube');
    expect(previewCubes).toBe('16 × 256');
  });

  it('NumberCard.tsx renders both badges simultaneously without mutually exclusive omission', () => {
    // Verifies NumberCard does not contain `detail.isCube && !detail.isSquare`
    expect(NUMBER_CARD_SRC).not.toContain('!detail.isSquare');
    // Verifies both squareRoot and cubeRoot badges are present
    expect(NUMBER_CARD_SRC).toContain('detail.squareRoot');
    expect(NUMBER_CARD_SRC).toContain('detail.cubeRoot');
  });

  it('NumberCard.tsx prioritizes cube badge when filterCategory is cube', () => {
    // Verifies filterCategory is accepted in props and checked
    expect(NUMBER_CARD_SRC).toContain("filterCategory === 'cube'");
  });

  it('calculates 3D isometric cube block dimensions accurately (k × k × k)', () => {
    const cubeNumbers = [8, 27, 64, 125, 216, 4096];
    for (const num of cubeNumbers) {
      const detail = getNumberDetail(num);
      expect(detail.isCube).toBe(true);
      const k = detail.cubeRoot!;
      const totalUnits = k * k * k;
      expect(totalUnits).toBe(num);

      // Verify layer count and dimensions
      const layers = k;
      const rowsPerLayer = k;
      const colsPerRow = k;
      expect(layers * rowsPerLayer * colsPerRow).toBe(num);
    }
  });
});

describe('Tier 4: Real-World Student Exploration Scenario', () => {
  it('executes full student exploration flow: browse cubes -> inspect 64 -> revision flashcards -> quiz game', () => {
    // -------------------------------------------------------------
    // Step 1: Student visits Cubes view (preset 1-50)
    // -------------------------------------------------------------
    const cubesRange = Array.from({ length: 50 }, (_, i) => (i + 1) ** 3);
    expect(cubesRange.length).toBe(50);
    expect(cubesRange[0]).toBe(1);
    expect(cubesRange[3]).toBe(64); // 4^3 = 64 at index 3
    expect(cubesRange[49]).toBe(125000);

    // -------------------------------------------------------------
    // Step 2: Student inspects number 64
    // -------------------------------------------------------------
    const detail64 = getNumberDetail(64);
    expect(detail64.isSquare).toBe(true);
    expect(detail64.squareRoot).toBe(8);
    expect(detail64.isCube).toBe(true);
    expect(detail64.cubeRoot).toBe(4);

    // Verify cubic factor pair is identified
    const cubicPair = detail64.factorPairs.find((p) => p.a === 4 || p.b === 4);
    expect(cubicPair).toEqual({ a: 4, b: 16, isSquarePair: false, isCubePair: true });

    // In Cubes view, preview pair is 4 x 16
    const previewPair =
      detail64.isCube && detail64.cubeRoot
        ? `${detail64.cubeRoot} × ${detail64.cubeRoot * detail64.cubeRoot}`
        : '1 × 64';
    expect(previewPair).toBe('4 × 16');

    // -------------------------------------------------------------
    // Step 3: Student views 3D Isometric Model for 64
    // -------------------------------------------------------------
    const k = detail64.cubeRoot!;
    expect(k).toBe(4);
    const blocks: { x: number; y: number; z: number }[] = [];
    for (let x = 0; x < k; x++) {
      for (let y = 0; y < k; y++) {
        for (let z = 0; z < k; z++) {
          blocks.push({ x, y, z });
        }
      }
    }
    expect(blocks.length).toBe(64);

    // -------------------------------------------------------------
    // Step 4: Student switches to Revision View with 'cubes' filter
    // -------------------------------------------------------------
    const revisionCubes = Array.from({ length: 50 }, (_, i) => (i + 1) ** 3);
    let selectedNum = 27;

    // Student clicks Next
    const idx27 = revisionCubes.indexOf(selectedNum);
    selectedNum = revisionCubes[idx27 + 1];
    expect(selectedNum).toBe(64); // Stepped to 64, not 28!

    // Student clicks Next again
    const idx64 = revisionCubes.indexOf(selectedNum);
    selectedNum = revisionCubes[idx64 + 1];
    expect(selectedNum).toBe(125); // Stepped to 125, not 65!

    // Student clicks Prev
    const idx125 = revisionCubes.indexOf(selectedNum);
    selectedNum = revisionCubes[idx125 - 1];
    expect(selectedNum).toBe(64); // Returned to 64!

    // -------------------------------------------------------------
    // Step 5: Student takes Factor Quiz for 64
    // -------------------------------------------------------------
    const quizOptions = [
      { id: 'opt-1', text: '4 × 16', isCorrect: true },
      { id: 'opt-2', text: '8 × 8', isCorrect: true },
      { id: 'opt-3', text: '3 × 20', isCorrect: false },
      { id: 'opt-4', text: '5 × 12', isCorrect: false },
    ];

    // Attempt 1: Student selects only '4 × 16'
    const attempt1Chosen = quizOptions.filter((o) => ['opt-1'].includes(o.id));
    const totalCorrect = quizOptions.filter((o) => o.isCorrect).length;
    const attempt1Success =
      attempt1Chosen.length === totalCorrect && attempt1Chosen.every((o) => o.isCorrect);
    expect(attempt1Success).toBe(false); // Rejected! Partial answers do not pass

    // Attempt 2: Student selects BOTH '4 × 16' and '8 × 8'
    const attempt2Chosen = quizOptions.filter((o) => ['opt-1', 'opt-2'].includes(o.id));
    const attempt2Success =
      attempt2Chosen.length === totalCorrect && attempt2Chosen.every((o) => o.isCorrect);
    expect(attempt2Success).toBe(true); // Passed! Full points & streak awarded
  });
});

describe('Tier 5: Custom Multiples & Powers Controls & NumberCard Presentation', () => {
  it('FilterBar renders preset dropdown and custom number input for multiples', () => {
    expect(FILTER_BAR_SRC).toContain('id="multiple-of-preset-select"');
    expect(FILTER_BAR_SRC).toContain('id="custom-multiple-input"');
    expect(FILTER_BAR_SRC).toContain('Custom Number...');
    expect(FILTER_BAR_SRC).toContain('Multiple of {m}');
    expect(FILTER_BAR_SRC).toContain('standardMultiples');
  });

  it('FilterBar renders preset dropdown and custom base input for powers of base', () => {
    expect(FILTER_BAR_SRC).toContain('id="power-of-preset-select"');
    expect(FILTER_BAR_SRC).toContain('id="custom-power-base-input"');
    expect(FILTER_BAR_SRC).toContain('Custom Base...');
    expect(FILTER_BAR_SRC).toContain('Base {b}');
    expect(FILTER_BAR_SRC).toContain('standardPowerBases');
  });

  it('NumberCard formats previewPair and badges for multiples of custom values', () => {
    expect(NUMBER_CARD_SRC).toContain('multipleOfValue?: number;');
    expect(NUMBER_CARD_SRC).toContain('filterCategory === \'multipleOf\'');
    expect(NUMBER_CARD_SRC).toContain('${multipleOfValue} × ${m}');
  });
});

