/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { NumberCard } from './components/NumberCard';
import { NumberDetailModal } from './components/NumberDetailModal';
import { TimesTableMatrix } from './components/TimesTableMatrix';
import { FactorQuizGame } from './components/FactorQuizGame';
import { MultiplicationTablesView } from './components/MultiplicationTablesView';
import { RevisionView } from './components/RevisionView';
import {
  AppViewMode,
  FilterCategory,
  RangePreset,
  SortOrder,
} from './types';
import {
  getNumberDetail,
  soundFx,
  integerPower,
  getPowerOfBaseInfo,
  toSuperscript,
  getPowerName,
} from './utils/mathUtils';
import {
  Sparkles,
  ArrowUpRight,
  BookOpen,
  PlusCircle,
  ArrowDown,
  RefreshCw,
  Zap,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

const QUICK_TEST_NUMBERS = [27, 64, 12, 24, 36, 48, 72, 81, 100, 144];

export default function App() {
  const [viewMode, setViewMode] = useState<AppViewMode>('grid');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [rangePreset, setRangePreset] = useState<RangePreset>('1-100');
  const [customStart, setCustomStart] = useState<number>(1);
  const [customEnd, setCustomEnd] = useState<number>(100);
  const [extraCount, setExtraCount] = useState<number>(0);
  const [autoLoadBatch, setAutoLoadBatch] = useState<50 | 100>(100);
  const [autoLoadEnabled, setAutoLoadEnabled] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [autoScrollCountdown, setAutoScrollCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<boolean>(false);
  const loadingLockRef = useRef<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [customPowerExponent, setCustomPowerExponent] = useState<number>(4);
  const [multipleOfValue, setMultipleOfValue] = useState<number>(3);
  const [powerOfBase, setPowerOfBase] = useState<number>(2);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('arithmetica-theme');
        if (stored === 'dark') return true;
        if (stored === 'light') return false;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
      } catch {
        return false;
      }
    }
    return false;
  });

  // Synchronize theme with document.documentElement, document.body, and localStorage
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', darkMode);
      document.body.classList.toggle('dark', darkMode);
    }
    try {
      localStorage.setItem('arithmetica-theme', darkMode ? 'dark' : 'light');
    } catch {}
  }, [darkMode]);

  // Reset extra count when preset changes
  const handleSetRangePreset = (preset: RangePreset) => {
    setRangePreset(preset);
    setExtraCount(0);
  };

  // Compute number range based on preset + extra dynamically loaded count
  const { startNum, endNum } = useMemo(() => {
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
  }, [rangePreset, customStart, customEnd, extraCount]);

  // Generate base numbers (seamlessly supports large sets and power modes)
  const baseNumbers = useMemo(() => {
    const arr: number[] = [];
    const maxItems = 10000;
    const limit = Math.min(endNum, startNum + maxItems - 1);
    for (let i = startNum; i <= limit; i++) {
      if (filterCategory === 'square') {
        arr.push(i * i);
      } else if (filterCategory === 'cube') {
        arr.push(i * i * i);
      } else if (filterCategory === 'customPower') {
        arr.push(integerPower(i, customPowerExponent));
      } else {
        arr.push(i);
      }
    }
    return arr;
  }, [startNum, endNum, filterCategory, customPowerExponent]);

  // Filter & Sort numbers
  const filteredNumbers = useMemo(() => {
    let result = baseNumbers.filter((n) => {
      // Text search filter
      if (searchFilter.trim()) {
        const query = searchFilter.trim().toLowerCase();
        if (!n.toString().includes(query)) {
          const detail = getNumberDetail(n);
          const hasFactorMatch = detail.factors.some((f) => f.toString() === query);
          const hasEquationMatch = detail.allMultiplications.some((m) =>
            m.equation.toLowerCase().includes(query)
          );
          if (!hasFactorMatch && !hasEquationMatch) return false;
        }
      }

      // Category filter
      if (filterCategory === 'all') return true;
      if (filterCategory === 'square') return true;
      if (filterCategory === 'cube') return true;
      if (filterCategory === 'customPower') return true;

      const detail = getNumberDetail(n);
      if (filterCategory === 'prime') return detail.isPrime;
      if (filterCategory === 'composite') return detail.isComposite;
      if (filterCategory === 'even') return detail.isEven;
      if (filterCategory === 'odd') return detail.isOdd;
      if (filterCategory === 'multipleOf') return n % multipleOfValue === 0;
      if (filterCategory === 'powerOf') return getPowerOfBaseInfo(n, powerOfBase).isPower;

      return true;
    });

    // Sort order
    if (sortOrder === 'desc') {
      result.sort((a, b) => b - a);
    } else if (sortOrder === 'factors-count-desc') {
      result.sort((a, b) => {
        const fa = getNumberDetail(a).factors.length;
        const fb = getNumberDetail(b).factors.length;
        return fb - fa || a - b;
      });
    } else if (sortOrder === 'factors-count-asc') {
      result.sort((a, b) => {
        const fa = getNumberDetail(a).factors.length;
        const fb = getNumberDetail(b).factors.length;
        return fa - fb || a - b;
      });
    } else {
      result.sort((a, b) => a - b);
    }

    return result;
  }, [baseNumbers, searchFilter, filterCategory, multipleOfValue, powerOfBase, sortOrder]);

  const itemTypeLabel = useMemo(() => {
    if (filterCategory === 'square') return 'squares';
    if (filterCategory === 'cube') return 'cubes';
    if (filterCategory === 'customPower') return getPowerName(customPowerExponent).toLowerCase();
    if (filterCategory === 'powerOf') return `powers of ${powerOfBase}`;
    return 'numbers';
  }, [filterCategory, customPowerExponent, powerOfBase]);

  const handleSelectNumber = (num: number) => {
    setSelectedNumber(num);
  };

  // Load immediately (used by manual buttons or "Load Now" during countdown)
  const performLoad = (batchSize: 50 | 100) => {
    if (loadingLockRef.current) return;
    loadingLockRef.current = true;
    setIsLoadingMore(true);

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setAutoScrollCountdown(null);

    setTimeout(() => {
      setExtraCount((prev) => prev + batchSize);
      if (soundEnabled) {
        soundFx.playPop(1.1);
      }
      setIsLoadingMore(false);

      // Enforce a 3-second cooldown before any new auto-scroll countdown can start
      cooldownRef.current = true;
      setTimeout(() => {
        cooldownRef.current = false;
        loadingLockRef.current = false;
      }, 3000);
    }, 150);
  };

  // Start 3-second countdown when near bottom and auto-scroll is enabled
  const startAutoScrollCountdown = () => {
    if (!autoLoadEnabled || loadingLockRef.current || cooldownRef.current || autoScrollCountdown !== null) {
      return;
    }

    setAutoScrollCountdown(3);

    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    let remaining = 3;
    countdownIntervalRef.current = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        setAutoScrollCountdown(null);
        performLoad(autoLoadBatch);
      } else {
        setAutoScrollCountdown(remaining);
      }
    }, 1000);
  };

  // Cancel or turn off auto scroll
  const handleCancelAutoScroll = (turnOff: boolean = true) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setAutoScrollCountdown(null);
    if (turnOff) {
      setAutoLoadEnabled(false);
    }
    // Set brief cooldown so it doesn't immediately prompt again
    cooldownRef.current = true;
    setTimeout(() => {
      cooldownRef.current = false;
    }, 2000);
  };

  const handleManualLoad = (amount: 50 | 100) => {
    handleCancelAutoScroll(false);
    performLoad(amount);
  };

  // Clean up timer on unmount or when auto-scroll is toggled off
  useEffect(() => {
    if (!autoLoadEnabled) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setAutoScrollCountdown(null);
    }
  }, [autoLoadEnabled]);

  // Dual auto-scroll listener: IntersectionObserver + Window scroll event
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewMode !== 'grid' || !autoLoadEnabled) return;

    // 1. Intersection Observer on bottom sentinel
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting && !loadingLockRef.current && !cooldownRef.current) {
          startAutoScrollCountdown();
        }
      },
      {
        threshold: 0.05,
        rootMargin: '400px 0px 400px 0px',
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    // 2. Window Scroll Event fallback
    const handleScroll = () => {
      if (!autoLoadEnabled || viewMode !== 'grid' || loadingLockRef.current || cooldownRef.current) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      if (scrollY + windowHeight >= docHeight - 600) {
        startAutoScrollCountdown();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (currentSentinel) observer.unobserve(currentSentinel);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [viewMode, autoLoadEnabled, autoLoadBatch, autoScrollCountdown]);

  return (
    <div
      className={`min-h-screen w-full min-w-full flex flex-col font-sans transition-colors duration-200 ${
        darkMode
          ? 'bg-[#141412] text-[#FAF8F5] selection:bg-[#C29B38] selection:text-[#181816]'
          : 'bg-[#FAF8F5] text-[#4A4A38] selection:bg-[#5A5A40] selection:text-[#FAF8F5]'
      }`}
    >
      {/* Top Navigation Bar */}
      <Navbar
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSelectNumber={handleSelectNumber}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 overflow-x-auto">
        {/* Quick-test banner with user examples like 27 and 64 */}
        <section
          className={`border rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-xs transition-colors ${
            darkMode
              ? 'bg-[#1C1C18] border-[#383832]'
              : 'bg-white border-[#E8E4DE]'
          }`}
        >
          <div>
            <div
              className={`flex items-center gap-2 font-serif font-semibold text-sm ${
                darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Interactive Multiplication &amp; Factor Pairs Explorer</span>
            </div>
            <p
              className={`text-xs sm:text-sm mt-1 font-sans ${
                darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
              }`}
            >
              Click any natural number to view all its multiplication table combinations (e.g.{' '}
              <strong className={darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'}>27 → 3×9</strong>,{' '}
              <strong className={darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'}>
                64 → 8×8, 4×16, 2×32
              </strong>
              ).
            </p>
          </div>

          {/* Quick chip buttons aligned into the space directly beneath the description */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span
              className={`text-xs font-semibold mr-1 font-sans ${
                darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
              }`}
            >
              Quick Try:
            </span>
            {QUICK_TEST_NUMBERS.map((qn) => (
              <button
                key={qn}
                id={`quick-try-btn-${qn}`}
                onClick={() => {
                  soundFx.playPop(1);
                  handleSelectNumber(qn);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono-num border transition-all flex items-center gap-1 cursor-pointer ${
                  darkMode
                    ? 'bg-[#23231F] hover:bg-[#C29B38] text-[#D8D5CC] hover:text-[#181816] border-[#383832] hover:border-[#C29B38]'
                    : 'bg-[#FAF8F5] hover:bg-[#5A5A40] hover:text-[#FAF8F5] text-[#4A4A38] border-[#E8E4DE] hover:border-[#5A5A40]'
                }`}
              >
                <span>{qn}</span>
                <ArrowUpRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </div>
        </section>

        {/* VIEW 1: Natural Numbers Grid */}
        {viewMode === 'grid' && (
          <div className="space-y-6">
            {/* Filter and Range Controls */}
            <FilterBar
              rangePreset={rangePreset}
              setRangePreset={handleSetRangePreset}
              customStart={customStart}
              setCustomStart={setCustomStart}
              customEnd={customEnd}
              setCustomEnd={setCustomEnd}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              customPowerExponent={customPowerExponent}
              setCustomPowerExponent={setCustomPowerExponent}
              multipleOfValue={multipleOfValue}
              setMultipleOfValue={setMultipleOfValue}
              powerOfBase={powerOfBase}
              setPowerOfBase={setPowerOfBase}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              searchFilter={searchFilter}
              setSearchFilter={setSearchFilter}
              totalFilteredCount={filteredNumbers.length}
              darkMode={darkMode}
            />

            {/* Numbers Grid Container */}
            {filteredNumbers.length > 0 ? (
              <div className="space-y-6">
                <motion.div
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredNumbers.map((num, idx) => (
                      <NumberCard
                        key={num}
                        n={num}
                        index={idx}
                        isSelected={selectedNumber === num}
                        onSelect={handleSelectNumber}
                        darkMode={darkMode}
                        filterCategory={filterCategory}
                        customPowerExponent={customPowerExponent}
                        powerOfBase={powerOfBase}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Invisible Infinite Scroll Sentinel Trigger */}
                <div
                  ref={sentinelRef}
                  id="infinite-scroll-sentinel"
                  className="w-full h-4 pointer-events-none opacity-0"
                  aria-hidden="true"
                />

                {/* 3-Second Auto-Scroll Countdown Toast / Banner */}
                {autoScrollCountdown !== null && (
                  <div
                    className={`flex items-center justify-between p-4 rounded-2xl border shadow-xl transition-all ${
                      darkMode
                        ? 'bg-[#23231F] border-[#C29B38] text-[#FAF8F5]'
                        : 'bg-white border-[#5A5A40] text-[#4A4A38]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-serif font-bold text-sm border animate-pulse ${
                          darkMode
                            ? 'bg-[#181816] border-[#C29B38] text-[#C29B38]'
                            : 'bg-[#5A5A40] border-[#5A5A40] text-[#FAF8F5]'
                        }`}
                      >
                        {autoScrollCountdown}s
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-sans">
                            Auto-loading next {autoLoadBatch} {itemTypeLabel} in {autoScrollCountdown}s...
                          </span>
                          <span className="inline-block w-2 h-2 rounded-full bg-[#A3B18A] animate-ping" />
                        </div>
                        <div className="w-48 bg-black/10 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="bg-[#A3B18A] h-full transition-all duration-1000 ease-linear"
                            style={{ width: `${((4 - autoScrollCountdown) / 3) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 font-sans">
                      <button
                        id="cancel-auto-scroll-btn"
                        onClick={() => handleCancelAutoScroll(true)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          darkMode
                            ? 'bg-[#181816] border-[#383832] text-[#9E9B90] hover:text-[#FAF8F5] hover:border-red-400'
                            : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#9A948C] hover:text-red-600 hover:border-red-300'
                        }`}
                      >
                        Turn Off
                      </button>
                      <button
                        id="load-now-btn"
                        onClick={() => performLoad(autoLoadBatch)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          darkMode
                            ? 'bg-[#C29B38] text-[#181816] border-[#C29B38] hover:bg-[#D4AC45]'
                            : 'bg-[#5A5A40] text-[#FAF8F5] border-[#5A5A40] hover:bg-[#4A4A35]'
                        }`}
                      >
                        Load Now
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading Status Indicator during Active Load */}
                {isLoadingMore && (
                  <div
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border animate-pulse transition-colors ${
                      darkMode
                        ? 'bg-[#1C1C18] border-[#383832] text-[#C29B38]'
                        : 'bg-white border-[#E8E4DE] text-[#5A5A40]'
                    }`}
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-[#A3B18A]" />
                    <span className="text-xs font-semibold font-sans">
                      Loading next {autoLoadBatch} {itemTypeLabel}...
                    </span>
                  </div>
                )}

                {/* Bottom Load-More Controller & Infinite Scroll Configuration */}
                <div
                  className={`p-5 rounded-2xl border flex flex-col lg:flex-row items-center justify-between gap-4 transition-colors ${
                    darkMode
                      ? 'bg-[#1C1C18] border-[#383832]'
                      : 'bg-white border-[#E8E4DE]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                        darkMode
                          ? 'bg-[#23231F] border-[#383832] text-[#C29B38]'
                          : 'bg-[#F2EFE9] border-[#E8E4DE] text-[#5A5A40]'
                      }`}
                    >
                      <Zap className="w-5 h-5 text-[#A3B18A] animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-serif font-semibold ${
                            darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                          }`}
                        >
                          {filterCategory === 'square'
                            ? `Showing squares for base numbers ${startNum} to ${endNum}`
                            : filterCategory === 'cube'
                            ? `Showing cubes for base numbers ${startNum} to ${endNum}`
                            : filterCategory === 'customPower'
                            ? `Showing ${customPowerExponent}th powers (x${toSuperscript(customPowerExponent)}) for base numbers ${startNum} to ${endNum}`
                            : filterCategory === 'powerOf'
                            ? `Showing powers of base ${powerOfBase} in range ${startNum} to ${endNum}`
                            : `Showing numbers up to ${endNum}`}
                        </h4>
                        {autoLoadEnabled ? (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1 ${
                              darkMode
                                ? 'bg-[#1C241D] text-[#A3B18A] border-[#2E3C2F]'
                                : 'bg-[#F2EFE9] text-[#6E7A5A] border-[#E8E4DE]'
                            }`}
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Auto-Loading Active (+{autoLoadBatch})
                          </span>
                        ) : (
                          <button
                            id="enable-auto-scroll-badge-btn"
                            onClick={() => {
                              soundFx.playPop(1);
                              setAutoLoadEnabled(true);
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                              darkMode
                                ? 'bg-[#23231F] text-[#9E9B90] border-[#383832] hover:text-[#FAF8F5] hover:border-[#C29B38]'
                                : 'bg-[#FAF8F5] text-[#9A948C] border-[#E8E4DE] hover:text-[#4A4A38] hover:border-[#5A5A40]'
                            }`}
                            title="Click to enable Auto-Scroll"
                          >
                            Auto-Scroll: Disabled (Click to Enable)
                          </button>
                        )}
                      </div>
                      <p
                        className={`text-xs font-sans mt-0.5 ${
                          darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                        }`}
                      >
                        {filteredNumbers.length} numbers loaded.{' '}
                        {autoLoadEnabled
                          ? `Next ${itemTypeLabel} load automatically as you scroll.`
                          : filterCategory === 'square' || filterCategory === 'cube' || filterCategory === 'customPower' || filterCategory === 'powerOf'
                          ? `Click +50 or +100 to load more ${itemTypeLabel}, or enable Auto-Scroll.`
                          : 'Click +50 or +100 to load more, or enable Auto-Scroll.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 font-sans">
                    {/* Auto-scroll toggle and batch selector */}
                    <div
                      className={`flex items-center p-1 rounded-xl border text-xs gap-1 ${
                        darkMode
                          ? 'bg-[#181816] border-[#383832]'
                          : 'bg-[#F2EFE9] border-[#E8E4DE]'
                      }`}
                    >
                      <button
                        id="auto-scroll-toggle-btn"
                        onClick={() => {
                          soundFx.playPop(1);
                          setAutoLoadEnabled((prev) => !prev);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          autoLoadEnabled
                            ? darkMode
                              ? 'bg-[#1C241D] text-[#A3B18A] border border-[#2E3C2F]'
                              : 'bg-[#5A5A40] text-[#FAF8F5]'
                            : darkMode
                            ? 'text-[#9E9B90] hover:text-[#FAF8F5]'
                            : 'text-[#9A948C] hover:text-[#4A4A38]'
                        }`}
                        title={autoLoadEnabled ? 'Click to disable auto-scroller' : 'Click to enable auto-scroller'}
                      >
                        <Zap className={`w-3 h-3 ${autoLoadEnabled ? 'text-[#A3B18A]' : 'opacity-40'}`} />
                        <span>Auto-Scroll: {autoLoadEnabled ? 'ON' : 'OFF'}</span>
                      </button>

                      {autoLoadEnabled && (
                        <div className="flex items-center pl-1 border-l border-current/15">
                          <button
                            id="auto-batch-50-btn"
                            onClick={() => {
                              setAutoLoadBatch(50);
                              soundFx.playPop(1);
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                              autoLoadBatch === 50
                                ? darkMode
                                  ? 'bg-[#C29B38] text-[#181816]'
                                  : 'bg-[#5A5A40] text-[#FAF8F5]'
                                : darkMode
                                ? 'text-[#9E9B90] hover:text-[#FAF8F5]'
                                : 'text-[#9A948C] hover:text-[#4A4A38]'
                            }`}
                          >
                            +50
                          </button>
                          <button
                            id="auto-batch-100-btn"
                            onClick={() => {
                              setAutoLoadBatch(100);
                              soundFx.playPop(1.1);
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer ${
                              autoLoadBatch === 100
                                ? darkMode
                                  ? 'bg-[#C29B38] text-[#181816]'
                                  : 'bg-[#5A5A40] text-[#FAF8F5]'
                                : darkMode
                                ? 'text-[#9E9B90] hover:text-[#FAF8F5]'
                                : 'text-[#9A948C] hover:text-[#4A4A38]'
                            }`}
                          >
                            +100
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Manual load buttons */}
                    <button
                      id="load-next-50-btn"
                      onClick={() => handleManualLoad(50)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        darkMode
                          ? 'bg-[#23231F] hover:bg-[#2C2C26] text-[#FAF8F5] border-[#383832]'
                          : 'bg-white hover:bg-[#F2EFE9] text-[#4A4A38] border-[#E8E4DE]'
                      }`}
                      title={`Load next 50 ${itemTypeLabel} immediately`}
                    >
                      <PlusCircle className="w-3.5 h-3.5 text-[#A3B18A]" />
                      <span>+50</span>
                    </button>

                    <button
                      id="load-next-100-btn"
                      onClick={() => handleManualLoad(100)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        darkMode
                          ? 'bg-[#C29B38] hover:bg-[#D4AC45] text-[#181816]'
                          : 'bg-[#5A5A40] hover:bg-[#4A4A38] text-[#FAF8F5]'
                      }`}
                      title={`Load next 100 ${itemTypeLabel} immediately`}
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>+100</span>
                    </button>

                    {extraCount > 0 && (
                      <button
                        onClick={() => {
                          soundFx.playPop(0.9);
                          setExtraCount(0);
                        }}
                        className={`p-1.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                          darkMode
                            ? 'bg-[#23231F] hover:bg-[#2C2C26] text-[#9E9B90] hover:text-[#FAF8F5] border-[#383832]'
                            : 'bg-white hover:bg-[#F2EFE9] text-[#9A948C] hover:text-[#4A4A38] border-[#E8E4DE]'
                        }`}
                        title="Reset to default preset range"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`text-center py-16 rounded-2xl border space-y-3 shadow-xs font-sans ${
                  darkMode
                    ? 'bg-[#1C1C18] border-[#383832]'
                    : 'bg-white border-[#E8E4DE]'
                }`}
              >
                <BookOpen
                  className={`w-10 h-10 mx-auto ${
                    darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                  }`}
                />
                <h3
                  className={`text-base font-serif font-semibold ${
                    darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                  }`}
                >
                  No natural numbers found
                </h3>
                <p
                  className={`text-xs max-w-sm mx-auto ${
                    darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                  }`}
                >
                  Try adjusting your filter category or expanding the number range presets above.
                </p>
                <button
                  onClick={() => {
                    setFilterCategory('all');
                    setSearchFilter('');
                    handleSetRangePreset('1-100');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
                    darkMode
                      ? 'bg-[#23231F] hover:bg-[#2C2C26] text-[#FAF8F5] border-[#383832]'
                      : 'bg-[#F2EFE9] hover:bg-[#E8E4DE] text-[#4A4A38] border-[#E8E4DE]'
                  }`}
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: Multiplication Tables (1 to 20 + custom upto any number) */}
        {viewMode === 'tables' && (
          <MultiplicationTablesView
            onSelectNumber={handleSelectNumber}
            darkMode={darkMode}
          />
        )}

        {/* VIEW 3: Quick Revision Flashcards (1 to 100 with compact popup) */}
        {viewMode === 'revision' && (
          <RevisionView
            onSelectNumber={handleSelectNumber}
            darkMode={darkMode}
          />
        )}

        {/* VIEW 4: Times Table Multiplication Matrix */}
        {viewMode === 'matrix' && (
          <TimesTableMatrix
            onSelectNumber={handleSelectNumber}
            darkMode={darkMode}
          />
        )}

        {/* VIEW 5: Factor Quiz / Practice Game */}
        {viewMode === 'quiz' && (
          <FactorQuizGame
            onInspectNumber={handleSelectNumber}
            darkMode={darkMode}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-6 mt-12 text-center text-xs font-sans transition-colors ${
          darkMode
            ? 'bg-[#181816] border-[#383832] text-[#9E9B90]'
            : 'bg-white border-[#E8E4DE] text-[#9A948C]'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`font-semibold ${
                darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
              }`}
            >
              Arithmetica &mdash; Natural Numbers &amp; Tables Explorer
            </span>
            <span>&bull;</span>
            <span>Factor Pair Decomposition</span>
          </div>
          <div className="flex items-center gap-2 opacity-70">
            <span>Clean Arithmetic Learning Suite</span>
          </div>
        </div>
      </footer>

      {/* Main Popup Modal for Factor Tables & Multiplications */}
      <AnimatePresence>
        {selectedNumber !== null && (
          <NumberDetailModal
            key="number-detail-modal"
            number={selectedNumber}
            onClose={() => setSelectedNumber(null)}
            onSelectNumber={handleSelectNumber}
            darkMode={darkMode}
            {...({ filterCategory } as any)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
