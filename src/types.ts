export interface FactorPair {
  a: number;
  b: number;
  isSquarePair?: boolean;
}

export interface PrimeFactor {
  prime: number;
  exponent: number;
}

export interface ContainingTable {
  tableOf: number;
  multiplier: number;
  equation: string;
}

export interface NumberDetail {
  n: number;
  isPrime: boolean;
  isComposite: boolean;
  isEven: boolean;
  isOdd: boolean;
  isSquare: boolean;
  squareRoot: number | null;
  isCube: boolean;
  cubeRoot: number | null;
  factors: number[];
  factorPairs: FactorPair[];
  allMultiplications: { a: number; b: number; equation: string }[];
  containingTables: ContainingTable[];
  primeFactors: PrimeFactor[];
  primeFactorizationString: string;
  sumOfDivisors: number;
  properDivisorsSum: number;
  classification: 'unit' | 'prime' | 'composite-perfect' | 'composite-abundant' | 'composite-deficient';
  binary: string;
  hex: string;
  roman: string;
}

export type RangePreset = '1-50' | '1-100' | '101-200' | '201-500' | '1-1000' | 'custom';

export type FilterCategory =
  | 'all'
  | 'even'
  | 'odd'
  | 'prime'
  | 'composite'
  | 'square'
  | 'cube'
  | 'multipleOf';

export type SortOrder = 'asc' | 'desc' | 'factors-count-desc' | 'factors-count-asc';

export type ActiveTab = 'pairs' | 'visualizer' | 'containing-tables' | 'full-table' | 'prime-tree' | 'properties';

export type AppViewMode = 'grid' | 'tables' | 'revision' | 'matrix' | 'quiz';
