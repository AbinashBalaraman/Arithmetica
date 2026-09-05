import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import {
  getNumberDetail,
  soundFx,
  getNthRoot,
  getPowerOfBaseInfo,
  toSuperscript,
  integerPower,
} from '../utils/mathUtils';
import { FilterCategory } from '../types';

interface NumberCardProps {
  n: number;
  index?: number;
  isSelected?: boolean;
  onSelect: (n: number) => void;
  darkMode?: boolean;
  filterCategory?: FilterCategory;
  customPowerExponent?: number;
  powerOfBase?: number;
  multipleOfValue?: number;
}

export const NumberCard: React.FC<NumberCardProps> = ({
  n,
  index = 0,
  isSelected = false,
  onSelect,
  darkMode = false,
  filterCategory,
  customPowerExponent = 4,
  powerOfBase = 2,
  multipleOfValue = 3,
}) => {
  const detail = useMemo(() => getNumberDetail(n), [n]);

  const customRoot = useMemo(() => {
    if (filterCategory === 'customPower') {
      return getNthRoot(n, customPowerExponent);
    }
    return null;
  }, [n, filterCategory, customPowerExponent]);

  const powerOfInfo = useMemo(() => {
    if (filterCategory === 'powerOf') {
      return getPowerOfBaseInfo(n, powerOfBase);
    }
    return { isPower: false, exponent: null };
  }, [n, filterCategory, powerOfBase]);

  const handleClick = () => {
    soundFx.playPop(0.9 + (n % 20) * 0.03);
    onSelect(n);
  };

  // Select top highlight multiplication pair (excluding 1 x N if composite, or showing square/cube pair)
  const previewPair = useMemo(() => {
    if (filterCategory === 'multipleOf' && multipleOfValue > 0 && n % multipleOfValue === 0) {
      const m = Math.round(n / multipleOfValue);
      return `${multipleOfValue} × ${m}`;
    }
    if (filterCategory === 'customPower' && customRoot !== null) {
      const rest = integerPower(customRoot, customPowerExponent - 1);
      return `${customRoot} × ${rest}`;
    }
    if (filterCategory === 'powerOf' && powerOfInfo.isPower && powerOfInfo.exponent !== null) {
      if (powerOfInfo.exponent === 0) return `1 × 1`;
      const prev = integerPower(powerOfBase, powerOfInfo.exponent - 1);
      return `${powerOfBase} × ${prev}`;
    }
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
      // Pick the pair with closest factors (e.g. 3x9 for 27, 8x8 or 4x16 for 64)
      const best = nonTrivial[nonTrivial.length - 1];
      return `${best.a} × ${best.b}`;
    }
    return `1 × ${n}`;
  }, [detail, n, filterCategory, customRoot, customPowerExponent, powerOfInfo, powerOfBase, multipleOfValue]);

  return (
    <motion.button
      id={`number-card-${n}`}
      layout="position"
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.15 } }}
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min((index % 60) * 0.02, 0.4),
      }}
      whileTap={{ scale: 0.97 }}
      onClick={handleClick}
      className={`group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl text-left transition-colors duration-200 cursor-pointer overflow-hidden border ${
        isSelected
          ? darkMode
            ? 'bg-[#33332B] border-[#C29B38] ring-2 ring-[#C29B38]/40 shadow-md'
            : 'bg-[#F2EFE9] border-[#5A5A40] ring-2 ring-[#5A5A40]/30 shadow-md'
          : detail.isPrime
          ? darkMode
            ? 'bg-[#23231F] border-[#383832] hover:border-[#A3B18A] hover:bg-[#282822] hover:shadow-md'
            : 'bg-white border-[#E8E4DE] hover:border-[#6E7A5A] hover:bg-[#FAF8F5] hover:shadow-md'
          : filterCategory === 'customPower' && customRoot !== null
          ? darkMode
            ? 'bg-[#23231F] border-[#383832] hover:border-[#D4A373] hover:bg-[#282822] hover:shadow-md'
            : 'bg-white border-[#E8E4DE] hover:border-[#9C6A5A] hover:bg-[#FAF8F5] hover:shadow-md'
          : filterCategory === 'powerOf' && powerOfInfo.isPower
          ? darkMode
            ? 'bg-[#23231F] border-[#383832] hover:border-[#C29B38] hover:bg-[#282822] hover:shadow-md'
            : 'bg-white border-[#E8E4DE] hover:border-[#8C7348] hover:bg-[#FAF8F5] hover:shadow-md'
          : filterCategory === 'cube' && detail.isCube
          ? darkMode
            ? 'bg-[#23231F] border-[#383832] hover:border-[#D4A373] hover:bg-[#282822] hover:shadow-md'
            : 'bg-white border-[#E8E4DE] hover:border-[#9C6A5A] hover:bg-[#FAF8F5] hover:shadow-md'
          : detail.isSquare
          ? darkMode
            ? 'bg-[#23231F] border-[#383832] hover:border-[#C29B38] hover:bg-[#282822] hover:shadow-md'
            : 'bg-white border-[#E8E4DE] hover:border-[#8C7348] hover:bg-[#FAF8F5] hover:shadow-md'
          : detail.isCube
          ? darkMode
            ? 'bg-[#23231F] border-[#383832] hover:border-[#D4A373] hover:bg-[#282822] hover:shadow-md'
            : 'bg-white border-[#E8E4DE] hover:border-[#9C6A5A] hover:bg-[#FAF8F5] hover:shadow-md'
          : darkMode
          ? 'bg-[#23231F] border-[#383832] hover:border-[#525248] hover:bg-[#282822] hover:shadow-md'
          : 'bg-white border-[#E8E4DE] hover:border-[#D8D2C7] hover:bg-[#FAF8F5] hover:shadow-md'
      }`}
    >
      {/* Subtle top indicator bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 transition-colors ${
          detail.isPrime
            ? darkMode
              ? 'bg-[#A3B18A]'
              : 'bg-[#6E7A5A]'
            : filterCategory === 'customPower' && customRoot !== null
            ? darkMode
              ? 'bg-[#D4A373]'
              : 'bg-[#9C6A5A]'
            : filterCategory === 'powerOf' && powerOfInfo.isPower
            ? darkMode
              ? 'bg-[#C29B38]'
              : 'bg-[#8C7348]'
            : filterCategory === 'cube' && detail.isCube
            ? darkMode
              ? 'bg-[#D4A373]'
              : 'bg-[#9C6A5A]'
            : detail.isSquare
            ? darkMode
              ? 'bg-[#C29B38]'
              : 'bg-[#8C7348]'
            : detail.isCube
            ? darkMode
              ? 'bg-[#D4A373]'
              : 'bg-[#9C6A5A]'
            : darkMode
            ? 'bg-transparent group-hover:bg-[#444438]'
            : 'bg-transparent group-hover:bg-[#D8D2C7]'
        }`}
      />

      {/* Top Header Row: Number and Tags */}
      <div className="flex items-start justify-between w-full gap-2">
        <span
          className={`text-3xl sm:text-4xl font-serif font-bold tracking-tight transition-colors ${
            darkMode
              ? (filterCategory === 'cube' && detail.isCube) || (filterCategory === 'customPower' && customRoot !== null)
                ? 'text-[#FAF8F5] group-hover:text-[#D4A373]'
                : (filterCategory === 'powerOf' && powerOfInfo.isPower)
                ? 'text-[#FAF8F5] group-hover:text-[#C29B38]'
                : 'text-[#FAF8F5] group-hover:text-[#C29B38]'
              : (filterCategory === 'cube' && detail.isCube) || (filterCategory === 'customPower' && customRoot !== null)
              ? 'text-[#4A4A38] group-hover:text-[#9C6A5A]'
              : (filterCategory === 'powerOf' && powerOfInfo.isPower)
              ? 'text-[#4A4A38] group-hover:text-[#8C7348]'
              : 'text-[#4A4A38] group-hover:text-[#5A5A40]'
          }`}
        >
          {n}
        </span>

        <div className="flex flex-wrap items-center justify-end gap-1 font-sans">
          {detail.isPrime && (
            <span
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                darkMode
                  ? 'bg-[#1C241D] text-[#A3B18A] border-[#2E3C2F]'
                  : 'bg-[#F2EFE9] text-[#6E7A5A] border-[#E8E4DE]'
              }`}
            >
              Prime
            </span>
          )}
          {filterCategory === 'multipleOf' ? (
            <>
              {multipleOfValue > 0 && n % multipleOfValue === 0 && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#272B28] text-[#8DA399] border-[#38423E]'
                      : 'bg-[#F2EFE9] text-[#5A6E64] border-[#E8E4DE]'
                  }`}
                >
                  {multipleOfValue} × {Math.round(n / multipleOfValue)}
                </span>
              )}
              {detail.isSquare && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#2A2922] text-[#C29B38] border-[#4E4A35]'
                      : 'bg-[#F2EFE9] text-[#8C7348] border-[#E8E4DE]'
                  }`}
                >
                  {detail.squareRoot}²
                </span>
              )}
              {detail.isCube && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#2E2420] text-[#D4A373] border-[#483730]'
                      : 'bg-[#F2EFE9] text-[#9C6A5A] border-[#E8E4DE]'
                  }`}
                >
                  {detail.cubeRoot}³
                </span>
              )}
            </>
          ) : filterCategory === 'customPower' ? (
            <>
              {customRoot !== null && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#2E2420] text-[#D4A373] border-[#483730]'
                      : 'bg-[#F2EFE9] text-[#9C6A5A] border-[#E8E4DE]'
                  }`}
                >
                  {customRoot}{toSuperscript(customPowerExponent)}
                </span>
              )}
              {detail.isSquare && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#2A2922] text-[#C29B38] border-[#4E4A35]'
                      : 'bg-[#F2EFE9] text-[#8C7348] border-[#E8E4DE]'
                  }`}
                >
                  {detail.squareRoot}²
                </span>
              )}
              {detail.isCube && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#2E2420] text-[#D4A373] border-[#483730]'
                      : 'bg-[#F2EFE9] text-[#9C6A5A] border-[#E8E4DE]'
                  }`}
                >
                  {detail.cubeRoot}³
                </span>
              )}
            </>
          ) : filterCategory === 'powerOf' ? (
            <>
              {powerOfInfo.isPower && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#2A2922] text-[#C29B38] border-[#4E4A35]'
                      : 'bg-[#F2EFE9] text-[#8C7348] border-[#E8E4DE]'
                  }`}
                >
                  {powerOfBase}{toSuperscript(powerOfInfo.exponent!)}
                </span>
              )}
              {detail.isSquare && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#2A2922] text-[#C29B38] border-[#4E4A35]'
                      : 'bg-[#F2EFE9] text-[#8C7348] border-[#E8E4DE]'
                  }`}
                >
                  {detail.squareRoot}²
                </span>
              )}
              {detail.isCube && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#2E2420] text-[#D4A373] border-[#483730]'
                      : 'bg-[#F2EFE9] text-[#9C6A5A] border-[#E8E4DE]'
                  }`}
                >
                  {detail.cubeRoot}³
                </span>
              )}
            </>
          ) : filterCategory === 'cube' ? (
            <>
              {detail.isCube && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#2E2420] text-[#D4A373] border-[#483730]'
                      : 'bg-[#F2EFE9] text-[#9C6A5A] border-[#E8E4DE]'
                  }`}
                >
                  {detail.cubeRoot}³
                </span>
              )}
              {detail.isSquare && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#2A2922] text-[#C29B38] border-[#4E4A35]'
                      : 'bg-[#F2EFE9] text-[#8C7348] border-[#E8E4DE]'
                  }`}
                >
                  {detail.squareRoot}²
                </span>
              )}
            </>
          ) : (
            <>
              {detail.isSquare && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#2A2922] text-[#C29B38] border-[#4E4A35]'
                      : 'bg-[#F2EFE9] text-[#8C7348] border-[#E8E4DE]'
                  }`}
                >
                  {detail.squareRoot}²
                </span>
              )}
              {detail.isCube && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#2E2420] text-[#D4A373] border-[#483730]'
                      : 'bg-[#F2EFE9] text-[#9C6A5A] border-[#E8E4DE]'
                  }`}
                >
                  {detail.cubeRoot}³
                </span>
              )}
            </>
          )}
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium ${
              darkMode ? 'bg-[#181816] text-[#7A776E]' : 'bg-[#F2EFE9] text-[#9A948C]'
            }`}
          >
            {detail.isEven ? 'EVEN' : 'ODD'}
          </span>
        </div>
      </div>

      {/* Center / Bottom: Multiplication Tables / Factor Pair highlights */}
      <div
        className={`mt-3.5 pt-2.5 border-t w-full flex items-center justify-between font-sans ${
          darkMode ? 'border-[#383832]' : 'border-[#E8E4DE]'
        }`}
      >
        <div className="flex flex-col">
          <span
            className={`text-[10px] uppercase tracking-widest font-semibold ${
              darkMode ? 'text-[#7A776E]' : 'text-[#9A948C]'
            }`}
          >
            Table Pair
          </span>
          <span
            className={`text-xs sm:text-sm font-bold font-mono-num ${
              darkMode
                ? filterCategory === 'cube' && detail.isCube
                  ? 'text-[#D4A373]'
                  : 'text-[#A3B18A]'
                : filterCategory === 'cube' && detail.isCube
                ? 'text-[#9C6A5A]'
                : 'text-[#5A5A40]'
            }`}
          >
            {previewPair}
          </span>
        </div>

        <div className="text-right">
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
              darkMode
                ? 'bg-[#181816] text-[#D8D5CC] group-hover:bg-[#2E2E28]'
                : 'bg-[#F2EFE9] text-[#4A4A38] group-hover:bg-[#E8E4DE]'
            }`}
          >
            {detail.factors.length} {detail.factors.length === 1 ? 'factor' : 'factors'}
          </span>
        </div>
      </div>
    </motion.button>
  );
};
