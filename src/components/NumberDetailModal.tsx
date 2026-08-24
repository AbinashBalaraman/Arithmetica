import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  Maximize2,
  TableProperties,
  Sparkles,
  GitBranch,
  Info,
  Layers,
  ArrowRight,
  Dices,
} from 'lucide-react';
import { ActiveTab, FactorPair } from '../types';
import { getNumberDetail, getFullMultiplicationTable, soundFx } from '../utils/mathUtils';

interface NumberDetailModalProps {
  number: number | null;
  onClose: () => void;
  onSelectNumber: (num: number) => void;
  darkMode?: boolean;
}

export const NumberDetailModal: React.FC<NumberDetailModalProps> = ({
  number,
  onClose,
  onSelectNumber,
  darkMode = false,
}) => {
  if (number === null) return null;

  const detail = useMemo(() => getNumberDetail(number), [number]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('pairs');
  const [selectedPair, setSelectedPair] = useState<FactorPair>(
    detail.factorPairs[detail.factorPairs.length - 1] || { a: 1, b: number }
  );
  const [copied, setCopied] = useState(false);
  const [tableLimit, setTableLimit] = useState<number>(12);

  // Sync selectedPair when number changes
  React.useEffect(() => {
    if (detail.factorPairs.length > 0) {
      // prefer square or closest factors
      const best = detail.factorPairs.find(p => p.isSquarePair) || detail.factorPairs[detail.factorPairs.length - 1];
      setSelectedPair(best);
    }
  }, [detail]);

  const fullTableRows = useMemo(
    () => getFullMultiplicationTable(number, tableLimit),
    [number, tableLimit]
  );

  const handleCopyEquations = () => {
    const text = detail.allMultiplications.map(m => m.equation).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    soundFx.playSuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrev = () => {
    if (number > 1) {
      soundFx.playPop(0.9);
      onSelectNumber(number - 1);
    }
  };

  const handleNext = () => {
    soundFx.playPop(1.1);
    onSelectNumber(number + 1);
  };

  const handleRandom = () => {
    const r = Math.floor(Math.random() * 100) + 1;
    soundFx.playPop(1);
    onSelectNumber(r);
  };

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [number]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm font-sans"
    >
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={`relative w-full max-w-3xl lg:max-w-4xl border rounded-2xl shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[92vh] transition-colors ${
          darkMode
            ? 'bg-[#1C1C18] border-[#383832] text-[#FAF8F5]'
            : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#4A4A38]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Banner */}
        <div
          className={`relative border-b p-4 sm:p-5 ${
            darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
          }`}
        >
          {/* Top action row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            {/* Prev / Next / Random Controls */}
            <div className="flex items-center gap-1 font-sans">
              <button
                id="modal-prev-num-btn"
                onClick={handlePrev}
                disabled={number <= 1}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border disabled:opacity-40 disabled:pointer-events-none transition-colors text-xs font-semibold cursor-pointer ${
                  darkMode
                    ? 'bg-[#181816] hover:bg-[#2A2A24] border-[#383832] text-[#D8D5CC]'
                    : 'bg-[#F2EFE9] hover:bg-[#E8E4DE] border-[#E8E4DE] text-[#4A4A38]'
                }`}
                title="Previous Number (Left Arrow)"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{number > 1 ? number - 1 : 1}</span>
              </button>

              <button
                id="modal-random-num-btn"
                onClick={handleRandom}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  darkMode
                    ? 'bg-[#181816] hover:bg-[#2A2A24] border-[#383832] text-[#D8D5CC] hover:text-[#C29B38]'
                    : 'bg-[#F2EFE9] hover:bg-[#E8E4DE] border-[#E8E4DE] text-[#4A4A38] hover:text-[#5A5A40]'
                }`}
                title="Pick Random Number"
              >
                <Dices className="w-3.5 h-3.5" />
              </button>

              <button
                id="modal-next-num-btn"
                onClick={handleNext}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-colors text-xs font-semibold cursor-pointer ${
                  darkMode
                    ? 'bg-[#181816] hover:bg-[#2A2A24] border-[#383832] text-[#D8D5CC]'
                    : 'bg-[#F2EFE9] hover:bg-[#E8E4DE] border-[#E8E4DE] text-[#4A4A38]'
                }`}
                title="Next Number (Right Arrow)"
              >
                <span>{number + 1}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Close Button */}
            <button
              id="modal-close-btn"
              onClick={onClose}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                darkMode
                  ? 'bg-[#181816] hover:bg-[#2A2A24] text-[#9E9B90] hover:text-[#FAF8F5] border-[#383832]'
                  : 'bg-[#F2EFE9] hover:bg-[#E8E4DE] text-[#9A948C] hover:text-[#4A4A38] border-[#E8E4DE]'
              }`}
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Number Display & Badges */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-baseline gap-3">
              <span
                className={`text-4xl sm:text-5xl font-serif font-bold tracking-tight italic ${
                  darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                }`}
              >
                {number}
              </span>
              <div className="flex flex-col">
                <h2
                  className={`text-base sm:text-lg font-serif font-semibold tracking-tight ${
                    darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                  }`}
                >
                  Natural Number {number}
                </h2>
                <p
                  className={`text-[11px] sm:text-xs font-sans ${
                    darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                  }`}
                >
                  {detail.factors.length} divisors &bull; {detail.factorPairs.length} factor{' '}
                  {detail.factorPairs.length === 1 ? 'pair' : 'pairs'}
                </p>
              </div>
            </div>

            {/* Badges List */}
            <div className="flex flex-wrap items-center gap-1 font-sans">
              {detail.isPrime && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#1C241D] text-[#A3B18A] border-[#2E3C2F]'
                      : 'bg-[#F2EFE9] text-[#6E7A5A] border-[#E8E4DE]'
                  }`}
                >
                  Prime
                </span>
              )}
              {detail.isComposite && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#2E2E28] text-[#C29B38] border-[#4E4A35]'
                      : 'bg-[#F2EFE9] text-[#5A5A40] border-[#E8E4DE]'
                  }`}
                >
                  Composite
                </span>
              )}
              {detail.isSquare && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#2A2922] text-[#C29B38] border-[#4E4A35]'
                      : 'bg-[#F2EFE9] text-[#8C7348] border-[#E8E4DE]'
                  }`}
                >
                  Square: {detail.squareRoot}²
                </span>
              )}
              {detail.isCube && (
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#2E2420] text-[#D4A373] border-[#483730]'
                      : 'bg-[#F2EFE9] text-[#9C6A5A] border-[#E8E4DE]'
                  }`}
                >
                  Cube: {detail.cubeRoot}³
                </span>
              )}
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wider border ${
                  darkMode
                    ? 'bg-[#181816] text-[#7A776E] border-[#383832]'
                    : 'bg-[#F2EFE9] text-[#9A948C] border-[#E8E4DE]'
                }`}
              >
                {detail.isEven ? 'EVEN' : 'ODD'}
              </span>
            </div>
          </div>

          {/* Quick Factor Pairs Chips in Header */}
          <div
            className={`mt-3 pt-2.5 border-t flex flex-wrap items-center gap-1.5 ${
              darkMode ? 'border-[#383832]' : 'border-[#E8E4DE]'
            }`}
          >
            <span
              className={`text-[10px] font-bold uppercase tracking-wider font-sans ${
                darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
              }`}
            >
              Factor Pairs:
            </span>
            <div className="flex flex-wrap items-center gap-1">
              {detail.factorPairs.map((pair, idx) => (
                <span
                  key={idx}
                  onClick={() => {
                    setSelectedPair(pair);
                    setActiveTab('visualizer');
                    soundFx.playPop(1);
                  }}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono-num font-bold border cursor-pointer transition-colors ${
                    darkMode
                      ? 'bg-[#181816] hover:bg-[#282822] text-[#A3B18A] border-[#383832]'
                      : 'bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#5A5A40] border-[#E8E4DE]'
                  }`}
                  title={`Click to view ${pair.a} × ${pair.b} visualizer`}
                >
                  {pair.a} × {pair.b} = {number}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar with horizontal scroll and no-shrink pill tabs */}
        <div
          className={`border-b px-3 sm:px-4 py-2 flex items-center gap-1.5 overflow-x-auto font-sans scrollbar-thin ${
            darkMode
              ? 'bg-[#181816] border-[#383832]'
              : 'bg-[#F2EFE9] border-[#E8E4DE]'
          }`}
        >
          <button
            id="tab-btn-pairs"
            onClick={() => {
              soundFx.playPop(1);
              setActiveTab('pairs');
            }}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'pairs'
                ? darkMode
                  ? 'bg-[#C29B38] text-[#181816] shadow-sm font-bold'
                  : 'bg-[#5A5A40] text-[#FAF8F5] shadow-sm font-bold'
                : darkMode
                ? 'bg-transparent text-[#9E9B90] hover:text-[#FAF8F5] hover:bg-[#23231F]'
                : 'bg-transparent text-[#9A948C] hover:text-[#4A4A38] hover:bg-white'
            }`}
          >
            <TableProperties className="w-3.5 h-3.5 shrink-0" />
            <span>Factor Tables ({detail.allMultiplications.length})</span>
          </button>

          <button
            id="tab-btn-visualizer"
            onClick={() => {
              soundFx.playPop(1);
              setActiveTab('visualizer');
            }}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'visualizer'
                ? darkMode
                  ? 'bg-[#C29B38] text-[#181816] shadow-sm font-bold'
                  : 'bg-[#5A5A40] text-[#FAF8F5] shadow-sm font-bold'
                : darkMode
                ? 'bg-transparent text-[#9E9B90] hover:text-[#FAF8F5] hover:bg-[#23231F]'
                : 'bg-transparent text-[#9A948C] hover:text-[#4A4A38] hover:bg-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>Array &amp; Grid</span>
          </button>

          <button
            id="tab-btn-containing"
            onClick={() => {
              soundFx.playPop(1);
              setActiveTab('containing-tables');
            }}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'containing-tables'
                ? darkMode
                  ? 'bg-[#C29B38] text-[#181816] shadow-sm font-bold'
                  : 'bg-[#5A5A40] text-[#FAF8F5] shadow-sm font-bold'
                : darkMode
                ? 'bg-transparent text-[#9E9B90] hover:text-[#FAF8F5] hover:bg-[#23231F]'
                : 'bg-transparent text-[#9A948C] hover:text-[#4A4A38] hover:bg-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Which Times Tables Hit {number}?</span>
          </button>

          <button
            id="tab-btn-full-table"
            onClick={() => {
              soundFx.playPop(1);
              setActiveTab('full-table');
            }}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'full-table'
                ? darkMode
                  ? 'bg-[#C29B38] text-[#181816] shadow-sm font-bold'
                  : 'bg-[#5A5A40] text-[#FAF8F5] shadow-sm font-bold'
                : darkMode
                ? 'bg-transparent text-[#9E9B90] hover:text-[#FAF8F5] hover:bg-[#23231F]'
                : 'bg-transparent text-[#9A948C] hover:text-[#4A4A38] hover:bg-white'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 shrink-0" />
            <span>Table of {number}</span>
          </button>

          <button
            id="tab-btn-prime-tree"
            onClick={() => {
              soundFx.playPop(1);
              setActiveTab('prime-tree');
            }}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'prime-tree'
                ? darkMode
                  ? 'bg-[#C29B38] text-[#181816] shadow-sm font-bold'
                  : 'bg-[#5A5A40] text-[#FAF8F5] shadow-sm font-bold'
                : darkMode
                ? 'bg-transparent text-[#9E9B90] hover:text-[#FAF8F5] hover:bg-[#23231F]'
                : 'bg-transparent text-[#9A948C] hover:text-[#4A4A38] hover:bg-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 shrink-0" />
            <span>Prime Factorization</span>
          </button>

          <button
            id="tab-btn-properties"
            onClick={() => {
              soundFx.playPop(1);
              setActiveTab('properties');
            }}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
              activeTab === 'properties'
                ? darkMode
                  ? 'bg-[#C29B38] text-[#181816] shadow-sm font-bold'
                  : 'bg-[#5A5A40] text-[#FAF8F5] shadow-sm font-bold'
                : darkMode
                ? 'bg-transparent text-[#9E9B90] hover:text-[#FAF8F5] hover:bg-[#23231F]'
                : 'bg-transparent text-[#9A948C] hover:text-[#4A4A38] hover:bg-white'
            }`}
          >
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>Math Properties</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div
          className={`p-4 sm:p-5 overflow-y-auto flex-1 ${
            darkMode ? 'bg-[#1C1C18]' : 'bg-[#FAF8F5]'
          }`}
        >
          {/* TAB 1: All Multiplication Combinations / Factor Tables */}
          {activeTab === 'pairs' && (
            <div className="space-y-4 sm:space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3
                    className={`text-sm sm:text-base font-serif font-semibold ${
                      darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                    }`}
                  >
                    Multiplication Equations for {number}
                  </h3>
                  <p
                    className={`text-[11px] sm:text-xs font-sans ${
                      darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                    }`}
                  >
                    Every pair of natural numbers that multiply to produce {number}.
                  </p>
                </div>
                <button
                  id="copy-equations-btn"
                  onClick={handleCopyEquations}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors shadow-xs self-start sm:self-auto cursor-pointer ${
                    darkMode
                      ? 'bg-[#23231F] hover:bg-[#2C2C26] border-[#383832] text-[#D8D5CC]'
                      : 'bg-white hover:bg-[#F2EFE9] border-[#E8E4DE] text-[#4A4A38]'
                  }`}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-[#A3B18A]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#9E9B90]" />
                  )}
                  <span>{copied ? 'Copied!' : 'Copy Equations'}</span>
                </button>
              </div>

              {/* Factor Pairs Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                {detail.factorPairs.map((pair, idx) => {
                  const isSquare = pair.a === pair.b;
                  return (
                    <div
                      key={idx}
                      className={`relative p-3.5 sm:p-4 rounded-xl border transition-all ${
                        isSquare
                          ? darkMode
                            ? 'bg-[#23231F] border-[#C29B38] shadow-xs'
                            : 'bg-white border-[#8C7348] shadow-xs'
                          : darkMode
                          ? 'bg-[#23231F] border-[#383832] hover:border-[#525248] shadow-xs'
                          : 'bg-white border-[#E8E4DE] hover:border-[#D8D2C7] shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider font-sans ${
                            darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                          }`}
                        >
                          Pair #{idx + 1} {isSquare && '★ Square'}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedPair(pair);
                            setActiveTab('visualizer');
                            soundFx.playPop(1);
                          }}
                          className={`text-[11px] font-semibold flex items-center gap-1 font-sans cursor-pointer ${
                            darkMode
                              ? 'text-[#C29B38] hover:text-[#D4A373]'
                              : 'text-[#5A5A40] hover:text-[#4A4A38]'
                          }`}
                        >
                          <span>Visualize</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Equations in pair */}
                      <div className="space-y-1.5 font-mono-num">
                        <div
                          className={`flex items-center justify-between px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border ${
                            darkMode
                              ? 'bg-[#181816] border-[#383832]'
                              : 'bg-[#FAF8F5] border-[#E8E4DE]'
                          }`}
                        >
                          <span
                            className={`text-sm sm:text-base font-bold ${
                              darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                            }`}
                          >
                            <button
                              onClick={() => {
                                soundFx.playPop(1);
                                onSelectNumber(pair.a);
                              }}
                              className={`cursor-pointer hover:underline ${
                                darkMode ? 'text-[#A3B18A]' : 'text-[#5A5A40]'
                              }`}
                              title={`Inspect number ${pair.a}`}
                            >
                              {pair.a}
                            </button>{' '}
                            ×{' '}
                            <button
                              onClick={() => {
                                soundFx.playPop(1);
                                onSelectNumber(pair.b);
                              }}
                              className={`cursor-pointer hover:underline ${
                                darkMode ? 'text-[#A3B18A]' : 'text-[#5A5A40]'
                              }`}
                              title={`Inspect number ${pair.b}`}
                            >
                              {pair.b}
                            </button>
                          </span>
                          <span
                            className={`text-sm sm:text-base font-bold ${
                              darkMode ? 'text-[#A3B18A]' : 'text-[#6E7A5A]'
                            }`}
                          >
                            = {number}
                          </span>
                        </div>

                        {!isSquare && (
                          <div
                            className={`flex items-center justify-between px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border ${
                              darkMode
                                ? 'bg-[#181816] border-[#383832]'
                                : 'bg-[#FAF8F5] border-[#E8E4DE]'
                            }`}
                          >
                            <span
                              className={`text-sm sm:text-base font-bold ${
                                darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                              }`}
                            >
                              <button
                                onClick={() => {
                                  soundFx.playPop(1);
                                  onSelectNumber(pair.b);
                                }}
                                className={`cursor-pointer hover:underline ${
                                  darkMode ? 'text-[#A3B18A]' : 'text-[#5A5A40]'
                                }`}
                                title={`Inspect number ${pair.b}`}
                              >
                                {pair.b}
                              </button>{' '}
                              ×{' '}
                              <button
                                onClick={() => {
                                  soundFx.playPop(1);
                                  onSelectNumber(pair.a);
                                }}
                                className={`cursor-pointer hover:underline ${
                                  darkMode ? 'text-[#A3B18A]' : 'text-[#5A5A40]'
                                }`}
                                title={`Inspect number ${pair.a}`}
                              >
                                {pair.a}
                              </button>
                            </span>
                            <span
                              className={`text-sm sm:text-base font-bold ${
                                darkMode ? 'text-[#A3B18A]' : 'text-[#6E7A5A]'
                              }`}
                            >
                              = {number}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Division Relation */}
                      <div
                        className={`mt-2.5 text-[10px] sm:text-[11px] font-mono-num flex items-center justify-between border-t pt-2 ${
                          darkMode
                            ? 'border-[#383832] text-[#9E9B90]'
                            : 'border-[#E8E4DE] text-[#9A948C]'
                        }`}
                      >
                        <span>
                          {number} ÷ {pair.a} = {pair.b}
                        </span>
                        <span>
                          {number} ÷ {pair.b} = {pair.a}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* All Divisors Chips */}
              <div
                className={`p-3.5 sm:p-4 rounded-xl border ${
                  darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
                }`}
              >
                <h4
                  className={`text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-2 font-sans ${
                    darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                  }`}
                >
                  All Individual Divisors ({detail.factors.length}):
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {detail.factors.map((f) => (
                    <button
                      key={f}
                      onClick={() => {
                        soundFx.playPop(1);
                        onSelectNumber(f);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold font-mono-num transition-all cursor-pointer ${
                        f === number
                          ? darkMode
                            ? 'bg-[#C29B38] text-[#181816] shadow-xs'
                            : 'bg-[#5A5A40] text-[#FAF8F5] shadow-xs'
                          : darkMode
                          ? 'bg-[#181816] hover:bg-[#2A2A24] text-[#FAF8F5] border border-[#383832]'
                          : 'bg-[#F2EFE9] hover:bg-[#E8E4DE] text-[#4A4A38] border border-[#E8E4DE]'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Visual Array & Grid Visualizer */}
          {activeTab === 'visualizer' && (
            <div className="space-y-4 sm:space-y-5">
              <div>
                <h3
                  className={`text-sm sm:text-base font-serif font-semibold ${
                    darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                  }`}
                >
                  Geometric Area &amp; Array Model
                </h3>
                <p
                  className={`text-[11px] sm:text-xs font-sans ${
                    darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                  }`}
                >
                  Rectangle of {selectedPair.a} rows × {selectedPair.b} columns = {number} total blocks.
                </p>
              </div>

              {/* Pair Selector Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar font-sans">
                <span
                  className={`text-[11px] font-semibold mr-1 whitespace-nowrap ${
                    darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                  }`}
                >
                  Layout:
                </span>
                {detail.factorPairs.map((pair, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundFx.playPop(1);
                      setSelectedPair(pair);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono-num whitespace-nowrap transition-colors cursor-pointer ${
                      selectedPair.a === pair.a && selectedPair.b === pair.b
                        ? darkMode
                          ? 'bg-[#C29B38] text-[#181816] shadow-xs'
                          : 'bg-[#5A5A40] text-[#FAF8F5] shadow-xs'
                        : darkMode
                        ? 'bg-[#23231F] hover:bg-[#2E2E28] text-[#D8D5CC] border border-[#383832]'
                        : 'bg-white hover:bg-[#F2EFE9] text-[#4A4A38] border border-[#E8E4DE]'
                    }`}
                  >
                    {pair.a} × {pair.b}
                  </button>
                ))}
              </div>

              {/* Grid Visual Display */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col items-center justify-center min-h-[220px] ${
                  darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
                }`}
              >
                <div className="mb-3 text-center">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider font-sans ${
                      darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                    }`}
                  >
                    Array Dimensions
                  </span>
                  <div
                    className={`text-xl sm:text-2xl font-serif font-bold mt-0.5 ${
                      darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                    }`}
                  >
                    {selectedPair.a} rows × {selectedPair.b} cols = {number} blocks
                  </div>
                </div>

                {/* Render dots with responsive sizing and scroll container */}
                {selectedPair.a * selectedPair.b <= 400 ? (
                  <div className="overflow-x-auto max-w-full max-h-[320px] p-2 flex justify-center w-full">
                    <div
                      className={`grid gap-1 sm:gap-1.5 p-3 rounded-xl border w-fit mx-auto ${
                        darkMode ? 'bg-[#181816] border-[#383832]' : 'bg-[#FAF8F5] border-[#E8E4DE]'
                      }`}
                      style={{
                        gridTemplateColumns: `repeat(${selectedPair.b}, minmax(0, 1fr))`,
                      }}
                    >
                      {Array.from({ length: selectedPair.a * selectedPair.b }).map((_, i) => {
                        const r = Math.floor(i / selectedPair.b) + 1;
                        const c = (i % selectedPair.b) + 1;
                        const blockSizeClass =
                          selectedPair.b <= 10
                            ? 'w-4 h-4 sm:w-5 sm:h-5'
                            : selectedPair.b <= 18
                            ? 'w-3 h-3 sm:w-4 sm:h-4'
                            : 'w-2 h-2 sm:w-3 sm:h-3';

                        return (
                          <div
                            key={i}
                            title={`Row ${r}, Col ${c} (Block #${i + 1})`}
                            className={`${blockSizeClass} rounded-xs transition-transform hover:scale-125 cursor-pointer shadow-2xs ${
                              darkMode
                                ? 'bg-[#C29B38] hover:bg-[#D4A373]'
                                : 'bg-[#5A5A40] hover:bg-[#4A4A38]'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div
                    className={`text-center p-6 rounded-xl border max-w-md ${
                      darkMode ? 'bg-[#181816] border-[#383832]' : 'bg-[#FAF8F5] border-[#E8E4DE]'
                    }`}
                  >
                    <div
                      className={`text-3xl font-serif font-bold mb-1.5 ${
                        darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'
                      }`}
                    >
                      {selectedPair.a} × {selectedPair.b}
                    </div>
                    <p className={`text-xs sm:text-sm ${darkMode ? 'text-[#D8D5CC]' : 'text-[#4A4A38]'}`}>
                      A large array containing{' '}
                      <strong className={darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'}>
                        {number}
                      </strong>{' '}
                      units ({selectedPair.a} rows and {selectedPair.b} columns).
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Which Times Tables Contain This Number? */}
          {activeTab === 'containing-tables' && (
            <div className="space-y-6">
              <div>
                <h3
                  className={`text-base sm:text-lg font-serif font-semibold ${
                    darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                  }`}
                >
                  Multiplication Tables that include {number}
                </h3>
                <p
                  className={`text-xs sm:text-sm font-sans ${
                    darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                  }`}
                >
                  These are all the standard multiplication tables where {number} appears as an exact product.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {detail.containingTables.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-colors flex items-center justify-between ${
                      darkMode
                        ? 'bg-[#23231F] border-[#383832] hover:border-[#525248]'
                        : 'bg-white border-[#E8E4DE] hover:border-[#D8D2C7]'
                    }`}
                  >
                    <div>
                      <span
                        className={`text-xs font-medium block font-sans ${
                          darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                        }`}
                      >
                        In Table of{' '}
                        <strong className={darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'}>
                          {entry.tableOf}
                        </strong>
                        :
                      </span>
                      <span
                        className={`text-base sm:text-lg font-bold font-mono-num ${
                          darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                        }`}
                      >
                        {entry.equation}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        soundFx.playPop(1);
                        onSelectNumber(entry.tableOf);
                      }}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border font-sans cursor-pointer ${
                        darkMode
                          ? 'bg-[#181816] hover:bg-[#2A2A24] text-[#D8D5CC] border-[#383832]'
                          : 'bg-[#F2EFE9] hover:bg-[#E8E4DE] text-[#4A4A38] border-[#E8E4DE]'
                      }`}
                      title={`View table of ${entry.tableOf}`}
                    >
                      Inspect {entry.tableOf}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Full Multiplication Table of Selected Number */}
          {activeTab === 'full-table' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3
                    className={`text-base sm:text-lg font-serif font-semibold ${
                      darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                    }`}
                  >
                    Full Times Table for {number}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm font-sans ${
                      darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                    }`}
                  >
                    Multiples of {number} up to {number} × {tableLimit}
                  </p>
                </div>

                {/* Limit Toggle */}
                <div
                  className={`flex items-center gap-1 p-1 rounded-xl border self-start sm:self-auto font-sans ${
                    darkMode
                      ? 'bg-[#181816] border-[#383832]'
                      : 'bg-[#F2EFE9] border-[#E8E4DE]'
                  }`}
                >
                  {[10, 12, 20, 50].map((limit) => (
                    <button
                      key={limit}
                      onClick={() => {
                        soundFx.playPop(1);
                        setTableLimit(limit);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        tableLimit === limit
                          ? darkMode
                            ? 'bg-[#C29B38] text-[#181816] shadow-xs'
                            : 'bg-[#5A5A40] text-[#FAF8F5] shadow-xs'
                          : darkMode
                          ? 'text-[#D8D5CC] hover:text-[#FAF8F5]'
                          : 'text-[#4A4A38] hover:text-black'
                      }`}
                    >
                      Up to {limit}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                {fullTableRows.map((row) => (
                  <div
                    key={row.step}
                    onClick={() => {
                      soundFx.playPop(1);
                      onSelectNumber(row.product);
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-colors flex items-center justify-between font-mono-num shadow-xs ${
                      darkMode
                        ? 'bg-[#23231F] hover:bg-[#2A2A24] border-[#383832] hover:border-[#525248]'
                        : 'bg-white hover:bg-[#F2EFE9] border-[#E8E4DE] hover:border-[#D8D2C7]'
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold ${
                        darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                      }`}
                    >
                      {number} × {row.multiplier}
                    </span>
                    <span
                      className={`font-bold text-base ${
                        darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'
                      }`}
                    >
                      = {row.product}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Prime Factorization & Tree */}
          {activeTab === 'prime-tree' && (
            <div className="space-y-6">
              <div>
                <h3
                  className={`text-base sm:text-lg font-serif font-semibold ${
                    darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                  }`}
                >
                  Prime Factor Decomposition
                </h3>
                <p
                  className={`text-xs sm:text-sm font-sans ${
                    darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                  }`}
                >
                  Fundamental theorem of arithmetic: every natural number greater than 1 has a unique prime factorization.
                </p>
              </div>

              {/* Hero Formula */}
              <div
                className={`p-6 rounded-2xl border text-center ${
                  darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
                }`}
              >
                <span
                  className={`text-xs uppercase font-bold tracking-wider font-sans ${
                    darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                  }`}
                >
                  Prime Factorization
                </span>
                <div
                  className={`text-3xl sm:text-4xl font-serif font-bold mt-2 mb-1 ${
                    darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                  }`}
                >
                  {number} ={' '}
                  <span
                    className={`font-mono-num ${darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'}`}
                  >
                    {detail.primeFactorizationString}
                  </span>
                </div>
                {detail.isPrime && (
                  <p
                    className={`text-xs font-semibold mt-2 font-sans ${
                      darkMode ? 'text-[#A3B18A]' : 'text-[#6E7A5A]'
                    }`}
                  >
                    {number} is a prime number! It has only 2 factors: 1 and itself.
                  </p>
                )}
              </div>

              {/* Breakdown cards for each prime component */}
              {detail.primeFactors.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {detail.primeFactors.map((pf, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border flex items-center justify-between ${
                        darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
                      }`}
                    >
                      <div>
                        <span
                          className={`text-xs font-medium font-sans ${
                            darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                          }`}
                        >
                          Prime Factor
                        </span>
                        <div
                          className={`text-xl font-bold font-mono-num ${
                            darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                          }`}
                        >
                          {pf.prime}{' '}
                          <span
                            className={`text-sm ${darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'}`}
                          >
                            (exponent {pf.exponent})
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          soundFx.playPop(1);
                          onSelectNumber(pf.prime);
                        }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg border font-sans cursor-pointer ${
                          darkMode
                            ? 'bg-[#181816] hover:bg-[#2A2A24] text-[#D8D5CC] border-[#383832]'
                            : 'bg-[#F2EFE9] hover:bg-[#E8E4DE] text-[#4A4A38] border-[#E8E4DE]'
                        }`}
                      >
                        Inspect Prime {pf.prime}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: Math Properties & Number Theory */}
          {activeTab === 'properties' && (
            <div className="space-y-6">
              <div>
                <h3
                  className={`text-base sm:text-lg font-serif font-semibold ${
                    darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                  }`}
                >
                  Mathematical Properties of {number}
                </h3>
                <p
                  className={`text-xs sm:text-sm font-sans ${
                    darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                  }`}
                >
                  Comprehensive number theory metrics and representations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-sans">
                <div
                  className={`p-4 rounded-2xl border ${
                    darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold uppercase ${
                      darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                    }`}
                  >
                    Divisor Count (τ)
                  </span>
                  <div
                    className={`text-2xl font-bold font-mono-num mt-1 ${
                      darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                    }`}
                  >
                    {detail.factors.length} divisors
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold uppercase ${
                      darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                    }`}
                  >
                    Sum of Divisors (σ)
                  </span>
                  <div
                    className={`text-2xl font-bold font-mono-num mt-1 ${
                      darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                    }`}
                  >
                    {detail.sumOfDivisors}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold uppercase ${
                      darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                    }`}
                  >
                    Classification
                  </span>
                  <div
                    className={`text-lg font-bold capitalize mt-1 ${
                      darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'
                    }`}
                  >
                    {detail.classification.replace('-', ' ')}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold uppercase ${
                      darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                    }`}
                  >
                    Roman Numeral
                  </span>
                  <div
                    className={`text-2xl font-serif font-bold mt-1 ${
                      darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                    }`}
                  >
                    {detail.roman}
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold uppercase ${
                      darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                    }`}
                  >
                    Binary Representation
                  </span>
                  <div
                    className={`text-xl font-bold font-mono-num mt-1 break-all ${
                      darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                    }`}
                  >
                    {detail.binary}₂
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold uppercase ${
                      darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                    }`}
                  >
                    Hexadecimal
                  </span>
                  <div
                    className={`text-2xl font-bold font-mono-num mt-1 ${
                      darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                    }`}
                  >
                    {detail.hex}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
