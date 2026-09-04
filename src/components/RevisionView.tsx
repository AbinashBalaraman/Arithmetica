import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Zap,
  ArrowRight,
  PlusCircle,
  RefreshCw,
  Loader2,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { getNumberDetail, soundFx } from '../utils/mathUtils';

interface RevisionViewProps {
  onSelectNumber?: (num: number) => void;
  onOpenFullModal?: (num: number) => void;
  darkMode?: boolean;
}

export const RevisionView: React.FC<RevisionViewProps> = ({
  onSelectNumber,
  onOpenFullModal,
  darkMode = false,
}) => {
  // Number limit state (starts at 100, expandable by +50 or +100)
  const [maxCount, setMaxCount] = useState<number>(100);
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'primes' | 'squares' | 'cubes' | 'composites'>('all');
  const [autoLoadBatch, setAutoLoadBatch] = useState<50 | 100>(100);
  const [autoLoadEnabled, setAutoLoadEnabled] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [autoScrollCountdown, setAutoScrollCountdown] = useState<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownRef = useRef<boolean>(false);
  const loadingLockRef = useRef<boolean>(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reference callback for deep modal opener
  const handleOpenFullDetail = (n: number) => {
    setSelectedNum(null);
    if (onSelectNumber) {
      onSelectNumber(n);
    } else if (onOpenFullModal) {
      onOpenFullModal(n);
    }
  };

  // Generate numbers based on filterMode (power modes evaluate first N powers)
  const filteredNumbers = useMemo(() => {
    if (filterMode === 'squares') {
      return Array.from({ length: maxCount }, (_, i) => (i + 1) * (i + 1));
    }
    if (filterMode === 'cubes') {
      return Array.from({ length: maxCount }, (_, i) => (i + 1) * (i + 1) * (i + 1));
    }
    const base = Array.from({ length: maxCount }, (_, i) => i + 1);
    if (filterMode === 'all') return base;
    return base.filter((n) => {
      const detail = getNumberDetail(n);
      if (filterMode === 'primes') return detail.isPrime;
      if (filterMode === 'composites') return !detail.isPrime && n > 1;
      return true;
    });
  }, [maxCount, filterMode]);

  // Details for currently selected number popup
  const activeDetail = useMemo(() => {
    if (selectedNum === null) return null;
    return getNumberDetail(selectedNum);
  }, [selectedNum]);

  const handleSelect = (n: number, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    soundFx.playPop(1.1);
    setSelectedNum((prev) => (prev === n ? null : n));
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedNum === null) return;
    const currentIndex = filteredNumbers.indexOf(selectedNum);
    if (currentIndex > 0) {
      soundFx.playPop(1);
      setSelectedNum(filteredNumbers[currentIndex - 1]);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (selectedNum === null) return;
    const currentIndex = filteredNumbers.indexOf(selectedNum);
    if (currentIndex >= 0 && currentIndex < filteredNumbers.length - 1) {
      soundFx.playPop(1);
      setSelectedNum(filteredNumbers[currentIndex + 1]);
    }
  };

  // Perform loading with cooldown and timer reset
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
      setMaxCount((prev) => prev + batchSize);
      soundFx.playPop(1.1);
      setIsLoadingMore(false);

      // Enforce 3-second cooldown before another auto-scroll countdown can start
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
    cooldownRef.current = true;
    setTimeout(() => {
      cooldownRef.current = false;
    }, 2000);
  };

  const handleManualLoad = (amount: 50 | 100) => {
    handleCancelAutoScroll(false);
    performLoad(amount);
  };

  // Clean up timer on unmount or when auto-scroll is disabled
  useEffect(() => {
    if (!autoLoadEnabled) {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setAutoScrollCountdown(null);
    }
  }, [autoLoadEnabled]);

  // Keyboard navigation when popup is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedNum === null) return;
      if (e.key === 'Escape') {
        setSelectedNum(null);
      } else if (e.key === 'ArrowLeft') {
        const currentIndex = filteredNumbers.indexOf(selectedNum);
        if (currentIndex > 0) {
          soundFx.playPop(1);
          setSelectedNum(filteredNumbers[currentIndex - 1]);
        }
      } else if (e.key === 'ArrowRight') {
        const currentIndex = filteredNumbers.indexOf(selectedNum);
        if (currentIndex >= 0 && currentIndex < filteredNumbers.length - 1) {
          soundFx.playPop(1);
          setSelectedNum(filteredNumbers[currentIndex + 1]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNum, filteredNumbers]);

  // Infinite scroll trigger with 3s timer and cooldown
  useEffect(() => {
    if (!autoLoadEnabled) return;

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

    const handleScroll = () => {
      if (!autoLoadEnabled || loadingLockRef.current || cooldownRef.current) return;
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
  }, [autoLoadEnabled, autoLoadBatch, autoScrollCountdown]);

  return (
    <div className="space-y-6">
      {/* Revision Mode Header */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-colors shadow-xs ${
          darkMode
            ? 'bg-[#1C1C18] border-[#383832] text-[#E8E6DF]'
            : 'bg-white border-[#E8E4DE] text-[#4A4A38]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold border ${
                darkMode
                  ? 'bg-[#23231F] border-[#383832] text-[#C29B38]'
                  : 'bg-[#F2EFE9] border-[#E8E4DE] text-[#5A5A40]'
              }`}
            >
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className={`font-serif font-bold text-base sm:text-lg ${
                    darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                  }`}
                >
                  {filterMode === 'squares'
                    ? `Quick Revision: Squares (1²–${maxCount}²)`
                    : filterMode === 'cubes'
                    ? `Quick Revision: Cubes (1³–${maxCount}³)`
                    : `Quick Revision Flashcards (1–${maxCount})`}
                </h2>
                <span
                  className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    darkMode
                      ? 'bg-[#1C241D] text-[#A3B18A] border-[#2E3C2F]'
                      : 'bg-[#F2EFE9] text-[#5A5A40] border-[#E8E4DE]'
                  }`}
                >
                  Instant Popup
                </span>
              </div>
              <p
                className={`text-xs mt-0.5 font-sans ${
                  darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                }`}
              >
                Click any number to pop up its factor pairs directly in front of the card.
              </p>
            </div>
          </div>

          {/* Quick Filter Category Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-xs font-semibold mr-1 font-sans ${
                darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
              }`}
            >
              Filter:
            </span>
            {[
              { id: 'all', label: `All (1–${maxCount})` },
              { id: 'primes', label: 'Primes Only' },
              { id: 'squares', label: 'Perfect Squares' },
              { id: 'cubes', label: 'Perfect Cubes' },
              { id: 'composites', label: 'Composites' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  soundFx.playPop(1);
                  setFilterMode(cat.id as any);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-sans whitespace-nowrap transition-colors cursor-pointer border ${
                  filterMode === cat.id
                    ? darkMode
                      ? 'bg-[#C29B38] text-[#181816] border-[#C29B38]'
                      : 'bg-[#5A5A40] text-[#FAF8F5] border-[#5A5A40]'
                    : darkMode
                    ? 'bg-[#23231F] text-[#D8D5CC] border-[#383832] hover:bg-[#2C2C26]'
                    : 'bg-[#FAF8F5] text-[#4A4A38] border-[#E8E4DE] hover:bg-[#F2EFE9]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Revision Numbers Grid */}
      <div
        className={`p-4 sm:p-6 rounded-2xl border transition-colors shadow-xs relative ${
          darkMode
            ? 'bg-[#1C1C18] border-[#383832]'
            : 'bg-white border-[#E8E4DE]'
        }`}
      >
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-2.5">
          {filteredNumbers.map((num) => {
            const isSelected = selectedNum === num;
            const detail = getNumberDetail(num);
            const isPrime = detail.isPrime;
            const isSquare = detail.isSquare;
            const isCube = detail.isCube;

            return (
              <button
                key={num}
                id={`revision-num-${num}`}
                onClick={(e) => handleSelect(num, e)}
                className={`w-full h-12 sm:h-14 rounded-xl border flex flex-col items-center justify-center p-1 font-mono-num transition-all cursor-pointer ${
                  isSelected
                    ? darkMode
                      ? 'bg-[#C29B38] text-[#181816] border-[#C29B38] ring-2 ring-[#C29B38]/60 scale-105 z-10 font-bold shadow-lg'
                      : 'bg-[#5A5A40] text-[#FAF8F5] border-[#5A5A40] ring-2 ring-[#5A5A40]/40 scale-105 z-10 font-bold shadow-lg'
                    : filterMode === 'cubes' && isCube
                    ? darkMode
                      ? 'bg-[#2E2420] hover:bg-[#382E28] text-[#FAF8F5] border-[#483730]'
                      : 'bg-[#FBF6F0] hover:bg-[#F4ECE2] text-[#4A4A38] border-[#E2D4C6]'
                    : isSquare
                    ? darkMode
                      ? 'bg-[#2A2922] hover:bg-[#343228] text-[#FAF8F5] border-[#4E4A35]'
                      : 'bg-[#FAF6ED] hover:bg-[#F2EFE9] text-[#4A4A38] border-[#D8D2C7]'
                    : isCube
                    ? darkMode
                      ? 'bg-[#2E2420] hover:bg-[#382E28] text-[#FAF8F5] border-[#483730]'
                      : 'bg-[#FBF6F0] hover:bg-[#F4ECE2] text-[#4A4A38] border-[#E2D4C6]'
                    : isPrime
                    ? darkMode
                      ? 'bg-[#1C241D] hover:bg-[#232F24] text-[#A3B18A] border-[#2E3C2F]'
                      : 'bg-[#F2F5EF] hover:bg-[#E5ECE0] text-[#4A4A38] border-[#D4DCCF]'
                    : darkMode
                    ? 'bg-[#181816] hover:bg-[#2A2A24] text-[#E8E6DF] border-[#383832]'
                    : 'bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#4A4A38] border-[#E8E4DE]'
                }`}
                title={`Number ${num} - Click to see factor popup`}
              >
                <span className="text-sm sm:text-base font-bold">{num}</span>
                <span
                  className={`text-[9px] font-sans font-medium tracking-tight ${
                    isSelected
                      ? darkMode
                        ? 'text-[#181816]/90'
                        : 'text-[#FAF8F5]/90'
                      : isPrime
                      ? darkMode
                        ? 'text-[#A3B18A]'
                        : 'text-[#6E7A5A]'
                      : isSquare && isCube
                      ? darkMode
                        ? 'text-[#D4A373]'
                        : 'text-[#9C6A5A]'
                      : isSquare
                      ? darkMode
                        ? 'text-[#C29B38]'
                        : 'text-[#8C7348]'
                      : isCube
                      ? darkMode
                        ? 'text-[#D4A373]'
                        : 'text-[#9C6A5A]'
                      : darkMode
                      ? 'text-[#7A776E]'
                      : 'text-[#9A948C]'
                  }`}
                >
                  {isPrime
                    ? 'P'
                    : isSquare && isCube
                    ? 'Sq·Cb'
                    : isSquare
                    ? 'Sq'
                    : isCube
                    ? 'Cb'
                    : ''}
                </span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div
          className={`mt-5 pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs font-sans ${
            darkMode ? 'border-[#383832] text-[#9E9B90]' : 'border-[#E8E4DE] text-[#9A948C]'
          }`}
        >
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6E7A5A]" />
              <span>Prime (P)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8C7348]" />
              <span>Square (Sq)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9C6A5A]" />
              <span>Cube (Cb)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5A5A40]" />
              <span>Click to pop up factors</span>
            </span>
          </div>
          <span className="italic">Use keyboard ← and → to navigate numbers quickly</span>
        </div>
      </div>

      {/* FIXED-POSITION REVISION FLASHCARD POPUP (Does NOT move position when clicking Next/Prev) */}
      <AnimatePresence>
        {selectedNum !== null && activeDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop overlay to close on outside click */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setSelectedNum(null)}
            />

            {/* Stable Centered Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={`relative z-10 w-full max-w-sm sm:max-w-md p-5 rounded-2xl border shadow-2xl transition-colors ${
                darkMode
                  ? 'bg-[#23231F] border-[#C29B38]/60 text-[#FAF8F5]'
                  : 'bg-white border-[#5A5A40] text-[#4A4A38]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Popover Header */}
              <div className="flex items-center justify-between pb-3 border-b border-current/15 mb-3">
                <div className="flex items-center gap-3">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-serif font-bold text-lg border ${
                      darkMode
                        ? 'bg-[#181816] text-[#C29B38] border-[#383832]'
                        : 'bg-[#F2EFE9] text-[#5A5A40] border-[#E8E4DE]'
                    }`}
                  >
                    {activeDetail.n}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-serif font-bold text-base leading-tight">
                        Number {activeDetail.n}
                      </h4>
                      <span
                        className={`text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          activeDetail.isPrime
                            ? darkMode
                              ? 'bg-[#1C241D] text-[#A3B18A] border-[#2E3C2F]'
                              : 'bg-[#F2F5EF] text-[#6E7A5A] border-[#D4DCCF]'
                            : activeDetail.isSquare && activeDetail.isCube
                            ? darkMode
                              ? 'bg-[#2E2420] text-[#D4A373] border-[#483730]'
                              : 'bg-[#F2EFE9] text-[#9C6A5A] border-[#E8E4DE]'
                            : activeDetail.isSquare
                            ? darkMode
                              ? 'bg-[#2A2922] text-[#C29B38] border-[#4E4A35]'
                              : 'bg-[#FAF6ED] text-[#8C7348] border-[#D8D2C7]'
                            : activeDetail.isCube
                            ? darkMode
                              ? 'bg-[#2E2420] text-[#D4A373] border-[#483730]'
                              : 'bg-[#F2EFE9] text-[#9C6A5A] border-[#E8E4DE]'
                            : darkMode
                            ? 'bg-[#181816] text-[#9E9B90] border-[#383832]'
                            : 'bg-[#FAF8F5] text-[#9A948C] border-[#E8E4DE]'
                        }`}
                      >
                        {activeDetail.isPrime
                          ? 'Prime'
                          : activeDetail.isSquare && activeDetail.isCube
                          ? 'Square & Cube'
                          : activeDetail.isSquare
                          ? 'Square'
                          : activeDetail.isCube
                          ? 'Cube'
                          : 'Composite'}
                      </span>
                    </div>
                    <p className="text-xs opacity-75 font-sans mt-0.5">
                      {activeDetail.isPrime
                        ? 'Divisible only by 1 and itself.'
                        : activeDetail.isSquare && activeDetail.isCube
                        ? `Square of ${activeDetail.squareRoot} (${activeDetail.squareRoot}²) and Cube of ${activeDetail.cubeRoot} (${activeDetail.cubeRoot}³)`
                        : activeDetail.isSquare
                        ? `Square of ${activeDetail.squareRoot} (${activeDetail.squareRoot}²)`
                        : activeDetail.isCube
                        ? `Cube of ${activeDetail.cubeRoot} (${activeDetail.cubeRoot}³)`
                        : `Has ${activeDetail.factors.length} total divisors.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-sans">
                  <button
                    onClick={handlePrev}
                    disabled={filteredNumbers.indexOf(activeDetail.n) <= 0}
                    className={`p-1.5 rounded-xl border transition-colors cursor-pointer disabled:opacity-25 ${
                      darkMode
                        ? 'bg-[#181816] border-[#383832] text-[#E8E6DF] hover:bg-[#2C2C26]'
                        : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#4A4A38] hover:bg-[#F2EFE9]'
                    }`}
                    title="Previous Number (←)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={
                      filteredNumbers.indexOf(activeDetail.n) < 0 ||
                      filteredNumbers.indexOf(activeDetail.n) >= filteredNumbers.length - 1
                    }
                    className={`p-1.5 rounded-xl border transition-colors cursor-pointer disabled:opacity-25 ${
                      darkMode
                        ? 'bg-[#181816] border-[#383832] text-[#E8E6DF] hover:bg-[#2C2C26]'
                        : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#4A4A38] hover:bg-[#F2EFE9]'
                    }`}
                    title="Next Number (→)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedNum(null)}
                    className={`p-1.5 rounded-xl border ml-1 transition-colors cursor-pointer ${
                      darkMode
                        ? 'bg-[#181816] border-[#383832] text-[#9E9B90] hover:text-[#FAF8F5]'
                        : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#9A948C] hover:text-[#4A4A38]'
                    }`}
                    title="Close popup (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Factor Pairs Section (Main highlight) */}
              <div className="space-y-3 text-xs font-sans">
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs font-semibold opacity-85">
                    <span>Factor Pairs ({activeDetail.factorPairs.length}):</span>
                    {activeDetail.primeFactorizationString && (
                      <span className="font-mono-num text-[11px] text-[#A3B18A] font-bold">
                        {activeDetail.primeFactorizationString}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono-num max-h-40 overflow-y-auto pr-0.5">
                    {activeDetail.factorPairs.map((pair, idx) => (
                      <div
                        key={idx}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center justify-center ${
                          pair.a === pair.b
                            ? darkMode
                              ? 'bg-[#3A382A] border-[#C29B38] text-[#FAF8F5]'
                              : 'bg-[#FFF9E6] border-[#D4A373] text-[#4A4A38]'
                            : darkMode
                            ? 'bg-[#181816] border-[#383832] text-[#E8E6DF]'
                            : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#4A4A38]'
                        }`}
                      >
                        {pair.a} × {pair.b} = {activeDetail.n}
                      </div>
                    ))}
                  </div>
                </div>

                {/* All Factors list */}
                <div className="pt-2 border-t border-current/10">
                  <span className="block text-[10px] uppercase font-bold tracking-wider opacity-70 mb-1.5">
                    All Factors ({activeDetail.factors.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 font-mono-num">
                    {activeDetail.factors.map((f) => (
                      <button
                        key={f}
                        onClick={(e) => handleSelect(f, e)}
                        className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-transform hover:scale-110 cursor-pointer ${
                          f === activeDetail.n
                            ? darkMode
                              ? 'bg-[#A3B18A] text-[#181816]'
                              : 'bg-[#5A5A40] text-[#FAF8F5]'
                            : darkMode
                            ? 'bg-[#181816] text-[#E8E6DF] border border-[#383832] hover:border-[#C29B38]'
                            : 'bg-[#F2EFE9] text-[#4A4A38] border border-[#E8E4DE] hover:border-[#5A5A40]'
                        }`}
                        title={`Switch to number ${f}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer: Full Deep Explorer Link & Divisor Sum */}
              <div className="mt-4 pt-3 border-t border-current/10 flex items-center justify-between text-xs font-sans">
                <span className="text-[11px] opacity-70 font-mono-num">
                  Sum of Divisors: <strong className="font-bold">{activeDetail.sumOfDivisors}</strong>
                </span>
                <button
                  onClick={() => handleOpenFullDetail(activeDetail.n)}
                  className={`font-semibold flex items-center gap-1.5 px-3 py-1 rounded-xl border transition-colors cursor-pointer ${
                    darkMode
                      ? 'bg-[#181816] border-[#383832] text-[#C29B38] hover:bg-[#2C2C26]'
                      : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#5A5A40] hover:bg-[#F2EFE9]'
                  }`}
                >
                  <span>Full Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Invisible Infinite Scroll Sentinel Trigger */}
      <div
        ref={sentinelRef}
        id="revision-scroll-sentinel"
        className="w-full h-4 pointer-events-none opacity-0"
        aria-hidden="true"
      />

      {/* 3-Second Auto-Scroll Countdown Banner */}
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
                  Auto-loading next {autoLoadBatch} revision numbers in {autoScrollCountdown}s...
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
              id="revision-cancel-auto-scroll-btn"
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
              id="revision-load-now-btn"
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

      {/* Loading Status Indicator during Auto-Scroll */}
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
            Loading next {autoLoadBatch} revision numbers...
          </span>
        </div>
      )}

      {/* Bottom Load-More Controller & Infinite Scroll Configuration */}
      <div
        className={`p-5 rounded-2xl border flex flex-col lg:flex-row items-center justify-between gap-4 transition-colors shadow-xs ${
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
                {filterMode === 'squares'
                  ? `Revision squares: 1² to ${maxCount}²`
                  : filterMode === 'cubes'
                  ? `Revision cubes: 1³ to ${maxCount}³`
                  : `Revision range: 1 to ${maxCount}`}
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
                  id="enable-revision-auto-scroll-badge-btn"
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
                ? filterMode === 'squares'
                  ? 'Next squares load automatically as you scroll.'
                  : filterMode === 'cubes'
                  ? 'Next cubes load automatically as you scroll.'
                  : 'Next numbers load automatically as you scroll.'
                : filterMode === 'squares' || filterMode === 'cubes'
                ? `Click +50 or +100 to load more ${
                    filterMode === 'squares' ? 'squares' : 'cubes'
                  }, or enable Auto-Scroll.`
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
              id="revision-auto-scroll-toggle-btn"
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
                  id="revision-auto-batch-50-btn"
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
                  id="revision-auto-batch-100-btn"
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

          {/* Manual load buttons for Revision */}
          <button
            id="revision-load-next-50-btn"
            onClick={() => handleManualLoad(50)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              darkMode
                ? 'bg-[#23231F] hover:bg-[#2C2C26] text-[#FAF8F5] border-[#383832]'
                : 'bg-white hover:bg-[#F2EFE9] text-[#4A4A38] border-[#E8E4DE]'
            }`}
            title={`Load next 50 ${filterMode === 'squares' ? 'squares' : filterMode === 'cubes' ? 'cubes' : 'numbers'} immediately`}
          >
            <PlusCircle className="w-3.5 h-3.5 text-[#A3B18A]" />
            <span>
              +50{' '}
              {filterMode === 'squares'
                ? 'Squares'
                : filterMode === 'cubes'
                ? 'Cubes'
                : 'Numbers'}
            </span>
          </button>

          <button
            id="revision-load-next-100-btn"
            onClick={() => handleManualLoad(100)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              darkMode
                ? 'bg-[#C29B38] hover:bg-[#D4A373] text-[#181816]'
                : 'bg-[#5A5A40] hover:bg-[#4A4A38] text-[#FAF8F5]'
            }`}
            title={`Load next 100 ${filterMode === 'squares' ? 'squares' : filterMode === 'cubes' ? 'cubes' : 'numbers'} immediately`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>
              +100{' '}
              {filterMode === 'squares'
                ? 'Squares'
                : filterMode === 'cubes'
                ? 'Cubes'
                : 'Numbers'}
            </span>
          </button>

          {maxCount > 100 && (
            <button
              onClick={() => {
                soundFx.playPop(0.9);
                setMaxCount(100);
                setSelectedNum(null);
              }}
              className={`p-1.5 rounded-xl border text-xs transition-colors cursor-pointer ${
                darkMode
                  ? 'bg-[#23231F] hover:bg-[#2C2C26] text-[#9E9B90] hover:text-[#FAF8F5] border-[#383832]'
                  : 'bg-white hover:bg-[#F2EFE9] text-[#9A948C] hover:text-[#4A4A38] border-[#E8E4DE]'
              }`}
              title="Reset revision range back to 1–100"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
