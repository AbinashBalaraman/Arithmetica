// @ts-ignore: bun:test provided by Bun runtime
import { describe, it, expect } from 'bun:test';
import {
  integerPower,
  getNthRoot,
  getPowerOfBaseInfo,
  toSuperscript,
  getPowerName,
} from '../src/utils/mathUtils';

describe('Tier 1: Core Power Math Utilities', () => {
  it('integerPower computes exact integer powers', () => {
    expect(integerPower(2, 0)).toBe(1);
    expect(integerPower(5, 0)).toBe(1);
    expect(integerPower(2, 1)).toBe(2);
    expect(integerPower(2, 4)).toBe(16);
    expect(integerPower(3, 4)).toBe(81);
    expect(integerPower(5, 3)).toBe(125);
    expect(integerPower(10, 4)).toBe(10000);
    expect(integerPower(2, 10)).toBe(1024);
    expect(integerPower(4, 6)).toBe(4096);
  });

  it('getNthRoot calculates exact integer roots for general exponents', () => {
    // 4th roots
    expect(getNthRoot(1, 4)).toBe(1);
    expect(getNthRoot(16, 4)).toBe(2);
    expect(getNthRoot(81, 4)).toBe(3);
    expect(getNthRoot(256, 4)).toBe(4);
    expect(getNthRoot(625, 4)).toBe(5);
    expect(getNthRoot(2401, 4)).toBe(7);
    expect(getNthRoot(15, 4)).toBeNull();
    expect(getNthRoot(80, 4)).toBeNull();

    // 5th roots
    expect(getNthRoot(32, 5)).toBe(2);
    expect(getNthRoot(243, 5)).toBe(3);
    expect(getNthRoot(1024, 5)).toBe(4);
    expect(getNthRoot(100000, 5)).toBe(10);
    expect(getNthRoot(33, 5)).toBeNull();

    // 6th roots
    expect(getNthRoot(64, 6)).toBe(2);
    expect(getNthRoot(729, 6)).toBe(3);
    expect(getNthRoot(4096, 6)).toBe(4);
    expect(getNthRoot(65, 6)).toBeNull();

    // 10th roots
    expect(getNthRoot(1024, 10)).toBe(2);
    expect(getNthRoot(59049, 10)).toBe(3);

    // Negative or zero boundary protection
    expect(getNthRoot(0, 4)).toBeNull();
    expect(getNthRoot(-16, 4)).toBeNull();
    expect(getNthRoot(16, 0)).toBeNull();
  });

  it('getPowerOfBaseInfo identifies exact powers of any base and returns exponent', () => {
    // Base 2
    expect(getPowerOfBaseInfo(1, 2)).toEqual({ isPower: true, exponent: 0 });
    expect(getPowerOfBaseInfo(2, 2)).toEqual({ isPower: true, exponent: 1 });
    expect(getPowerOfBaseInfo(4, 2)).toEqual({ isPower: true, exponent: 2 });
    expect(getPowerOfBaseInfo(8, 2)).toEqual({ isPower: true, exponent: 3 });
    expect(getPowerOfBaseInfo(16, 2)).toEqual({ isPower: true, exponent: 4 });
    expect(getPowerOfBaseInfo(32, 2)).toEqual({ isPower: true, exponent: 5 });
    expect(getPowerOfBaseInfo(64, 2)).toEqual({ isPower: true, exponent: 6 });
    expect(getPowerOfBaseInfo(128, 2)).toEqual({ isPower: true, exponent: 7 });
    expect(getPowerOfBaseInfo(256, 2)).toEqual({ isPower: true, exponent: 8 });
    expect(getPowerOfBaseInfo(512, 2)).toEqual({ isPower: true, exponent: 9 });
    expect(getPowerOfBaseInfo(1024, 2)).toEqual({ isPower: true, exponent: 10 });
    expect(getPowerOfBaseInfo(4096, 2)).toEqual({ isPower: true, exponent: 12 });

    // Non-powers of 2
    expect(getPowerOfBaseInfo(3, 2)).toEqual({ isPower: false, exponent: null });
    expect(getPowerOfBaseInfo(6, 2)).toEqual({ isPower: false, exponent: null });
    expect(getPowerOfBaseInfo(12, 2)).toEqual({ isPower: false, exponent: null });
    expect(getPowerOfBaseInfo(100, 2)).toEqual({ isPower: false, exponent: null });

    // Base 3
    expect(getPowerOfBaseInfo(1, 3)).toEqual({ isPower: true, exponent: 0 });
    expect(getPowerOfBaseInfo(3, 3)).toEqual({ isPower: true, exponent: 1 });
    expect(getPowerOfBaseInfo(9, 3)).toEqual({ isPower: true, exponent: 2 });
    expect(getPowerOfBaseInfo(27, 3)).toEqual({ isPower: true, exponent: 3 });
    expect(getPowerOfBaseInfo(81, 3)).toEqual({ isPower: true, exponent: 4 });
    expect(getPowerOfBaseInfo(243, 3)).toEqual({ isPower: true, exponent: 5 });
    expect(getPowerOfBaseInfo(729, 3)).toEqual({ isPower: true, exponent: 6 });
    expect(getPowerOfBaseInfo(26, 3)).toEqual({ isPower: false, exponent: null });

    // Base 10
    expect(getPowerOfBaseInfo(1, 10)).toEqual({ isPower: true, exponent: 0 });
    expect(getPowerOfBaseInfo(10, 10)).toEqual({ isPower: true, exponent: 1 });
    expect(getPowerOfBaseInfo(100, 10)).toEqual({ isPower: true, exponent: 2 });
    expect(getPowerOfBaseInfo(1000, 10)).toEqual({ isPower: true, exponent: 3 });
    expect(getPowerOfBaseInfo(10000, 10)).toEqual({ isPower: true, exponent: 4 });
    expect(getPowerOfBaseInfo(500, 10)).toEqual({ isPower: false, exponent: null });

    // Edge cases
    expect(getPowerOfBaseInfo(0, 2)).toEqual({ isPower: false, exponent: null });
    expect(getPowerOfBaseInfo(-4, 2)).toEqual({ isPower: false, exponent: null });
    expect(getPowerOfBaseInfo(8, 1)).toEqual({ isPower: false, exponent: null });
  });

  it('toSuperscript formats numbers to unicode superscripts accurately', () => {
    expect(toSuperscript(0)).toBe('⁰');
    expect(toSuperscript(2)).toBe('²');
    expect(toSuperscript(3)).toBe('³');
    expect(toSuperscript(4)).toBe('⁴');
    expect(toSuperscript(5)).toBe('⁵');
    expect(toSuperscript(6)).toBe('⁶');
    expect(toSuperscript(7)).toBe('⁷');
    expect(toSuperscript(8)).toBe('⁸');
    expect(toSuperscript(10)).toBe('¹⁰');
    expect(toSuperscript(12)).toBe('¹²');
  });

  it('getPowerName returns human friendly power descriptors', () => {
    expect(getPowerName(2)).toBe('Squares');
    expect(getPowerName(3)).toBe('Cubes');
    expect(getPowerName(4)).toBe('4th Powers');
    expect(getPowerName(5)).toBe('5th Powers');
    expect(getPowerName(6)).toBe('6th Powers');
    expect(getPowerName(8)).toBe('8th Powers');
    expect(getPowerName(10)).toBe('10th Powers');
  });
});

describe('Tier 2: Range & Sequence Generation for Custom Powers', () => {
  it('generates exact 4th-power sequence for base numbers 1 to 50', () => {
    const sequence: number[] = [];
    for (let i = 1; i <= 50; i++) {
      sequence.push(integerPower(i, 4));
    }
    expect(sequence.length).toBe(50);
    expect(sequence[0]).toBe(1); // 1⁴
    expect(sequence[1]).toBe(16); // 2⁴
    expect(sequence[2]).toBe(81); // 3⁴
    expect(sequence[3]).toBe(256); // 4⁴
    expect(sequence[4]).toBe(625); // 5⁴
    expect(sequence[9]).toBe(10000); // 10⁴
    expect(sequence[49]).toBe(6250000); // 50⁴
  });

  it('generates exact 5th-power sequence for base numbers 1 to 20', () => {
    const sequence: number[] = [];
    for (let i = 1; i <= 20; i++) {
      sequence.push(integerPower(i, 5));
    }
    expect(sequence.length).toBe(20);
    expect(sequence[0]).toBe(1); // 1⁵
    expect(sequence[1]).toBe(32); // 2⁵
    expect(sequence[2]).toBe(243); // 3⁵
    expect(sequence[3]).toBe(1024); // 4⁵
    expect(sequence[4]).toBe(3125); // 5⁵
    expect(sequence[9]).toBe(100000); // 10⁵
  });

  it('filters powers of base 2 accurately in range 1 to 100', () => {
    const range: number[] = [];
    for (let i = 1; i <= 100; i++) {
      range.push(i);
    }
    const powersOf2 = range.filter((n) => getPowerOfBaseInfo(n, 2).isPower);
    expect(powersOf2).toEqual([1, 2, 4, 8, 16, 32, 64]);
  });

  it('filters powers of base 3 accurately in range 1 to 100', () => {
    const range: number[] = [];
    for (let i = 1; i <= 100; i++) {
      range.push(i);
    }
    const powersOf3 = range.filter((n) => getPowerOfBaseInfo(n, 3).isPower);
    expect(powersOf3).toEqual([1, 3, 9, 27, 81]);
  });

  it('filters powers of base 10 accurately in range 1 to 1000', () => {
    const range: number[] = [];
    for (let i = 1; i <= 1000; i++) {
      range.push(i);
    }
    const powersOf10 = range.filter((n) => getPowerOfBaseInfo(n, 10).isPower);
    expect(powersOf10).toEqual([1, 10, 100, 1000]);
  });

  it('filters powers of base 2 accurately in sub-ranges (101-200 and 201-500)', () => {
    const range101to200: number[] = [];
    for (let i = 101; i <= 200; i++) range101to200.push(i);
    const powersRange1 = range101to200.filter((n) => getPowerOfBaseInfo(n, 2).isPower);
    expect(powersRange1).toEqual([128]); // 2⁷

    const range201to500: number[] = [];
    for (let i = 201; i <= 500; i++) range201to500.push(i);
    const powersRange2 = range201to500.filter((n) => getPowerOfBaseInfo(n, 2).isPower);
    expect(powersRange2).toEqual([256]); // 2⁸
  });
});

describe('Tier 3: Multi-Power Intersections & Precision Validation', () => {
  it('correctly maps multi-power number 64 across multiple roots and bases', () => {
    expect(getNthRoot(64, 2)).toBe(8); // 8²
    expect(getNthRoot(64, 3)).toBe(4); // 4³
    expect(getNthRoot(64, 6)).toBe(2); // 2⁶
    expect(getPowerOfBaseInfo(64, 2)).toEqual({ isPower: true, exponent: 6 });
    expect(getPowerOfBaseInfo(64, 4)).toEqual({ isPower: true, exponent: 3 });
    expect(getPowerOfBaseInfo(64, 8)).toEqual({ isPower: true, exponent: 2 });
  });

  it('correctly maps multi-power number 4096 across all root degrees', () => {
    expect(getNthRoot(4096, 2)).toBe(64); // 64²
    expect(getNthRoot(4096, 3)).toBe(16); // 16³
    expect(getNthRoot(4096, 4)).toBe(8); // 8⁴
    expect(getNthRoot(4096, 6)).toBe(4); // 4⁶
    expect(getNthRoot(4096, 12)).toBe(2); // 2¹²
    expect(getPowerOfBaseInfo(4096, 2)).toEqual({ isPower: true, exponent: 12 });
    expect(getPowerOfBaseInfo(4096, 4)).toEqual({ isPower: true, exponent: 6 });
    expect(getPowerOfBaseInfo(4096, 8)).toEqual({ isPower: true, exponent: 4 });
    expect(getPowerOfBaseInfo(4096, 16)).toEqual({ isPower: true, exponent: 3 });
  });
});
