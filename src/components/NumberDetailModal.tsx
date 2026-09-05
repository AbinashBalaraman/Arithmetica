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
  Box,
} from 'lucide-react';
import { ActiveTab, FactorPair, FilterCategory } from '../types';
import { getNumberDetail, getFullMultiplicationTable, soundFx } from '../utils/mathUtils';

interface NumberDetailModalProps {
  number: number | null;
  onClose: () => void;
  onSelectNumber: (num: number) => void;
  darkMode?: boolean;
  filterCategory?: FilterCategory;
}

export const NumberDetailModal: React.FC<NumberDetailModalProps> = ({
  number,
  onClose,
  onSelectNumber,
  darkMode = false,
  filterCategory,
}) => {
  if (number === null) return null;

  const detail = useMemo(() => getNumberDetail(number), [number]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('pairs');

  // Context-aware default factor pair selection
  const getDefaultPair = (d: typeof detail, cat?: FilterCategory): FactorPair => {
    if (d.factorPairs.length === 0) return { a: 1, b: number };
    // When opened in Cubes context, select cubic factor pair (k × k²)
    if (cat === 'cube' && d.isCube) {
      const cubePair = d.factorPairs.find(
        (p) => p.isCubePair || (d.cubeRoot !== null && (p.a === d.cubeRoot || p.b === d.cubeRoot))
      );
      if (cubePair) return cubePair;
    }
    // Otherwise prefer square pair if available
    const squarePair = d.factorPairs.find((p) => p.isSquarePair);
    if (squarePair) return squarePair;
    // Default to closest factors
    return d.factorPairs[d.factorPairs.length - 1];
  };

  const [selectedPair, setSelectedPair] = useState<FactorPair>(() =>
    getDefaultPair(detail, filterCategory)
  );
  const [copied, setCopied] = useState(false);
  const [tableLimit, setTableLimit] = useState<number>(12);

  // 3D Isometric Visualizer state
  const [visualizerMode, setVisualizerMode] = useState<'2d' | '3d'>(
    detail.isCube && filterCategory === 'cube' ? '3d' : '2d'
  );
  const [activeCubeLayer, setActiveCubeLayer] = useState<number | 'all'>('all');
  const [explodedView, setExplodedView] = useState<boolean>(false);
  const [hoveredCubeBlock, setHoveredCubeBlock] = useState<{ x: number; y: number; z: number } | null>(null);
  const [largeCubeSlice, setLargeCubeSlice] = useState<number>(1);

  // Sync selectedPair and visualizerMode when number or filterCategory changes
  React.useEffect(() => {
    setSelectedPair(getDefaultPair(detail, filterCategory));
    if (detail.isCube && filterCategory === 'cube') {
      setVisualizerMode('3d');
    } else if (!detail.isCube) {
      setVisualizerMode('2d');
    }
    setActiveCubeLayer('all');
    setHoveredCubeBlock(null);
    setLargeCubeSlice(1);
  }, [detail, filterCategory]);

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
            <div className="flex items-baseline gap-3 min-w-0">
              <span
                title={number.toLocaleString()}
                className={`font-serif font-bold tracking-tight italic break-all ${
                  String(number).length > 10
                    ? 'text-2xl sm:text-3xl md:text-4xl'
                    : String(number).length > 6
                    ? 'text-3xl sm:text-4xl md:text-5xl'
                    : 'text-4xl sm:text-5xl'
                } ${
                  darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                }`}
              >
                {number}
              </span>
              <div className="flex flex-col min-w-0">
                <h2
                  className={`text-base sm:text-lg font-serif font-semibold tracking-tight break-all ${
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
              {/* Badges List with context-aware ordering */}
              {filterCategory === 'cube' ? (
                <>
                  {detail.isCube && (
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border shadow-xs ${
                        darkMode
                          ? 'bg-[#3A261D] text-[#E0A96D] border-[#6A4836] ring-1 ring-[#E0A96D]/50'
                          : 'bg-[#FBF0E6] text-[#8C4A38] border-[#D4A373] ring-1 ring-[#8C4A38]/30'
                      }`}
                    >
                      Cube: {detail.cubeRoot}³
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
                </>
              ) : (
                <>
                  {detail.isSquare && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                        filterCategory === 'square'
                          ? darkMode
                            ? 'bg-[#332E1C] text-[#E6C458] border-[#685D30] ring-1 ring-[#E6C458]/40 shadow-xs'
                            : 'bg-[#FEFCE8] text-[#854D0E] border-[#CA8A04] ring-1 ring-[#854D0E]/30 shadow-xs'
                          : darkMode
                          ? 'bg-[#2A2922] text-[#C29B38] border-[#4E4A35]'
                          : 'bg-[#F2EFE9] text-[#8C7348] border-[#E8E4DE]'
                      }`}
                    >
                      Square: {detail.squareRoot}²
                    </span>
                  )}
                  {detail.isCube && (
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${
                        darkMode
                          ? 'bg-[#3A261D] text-[#E0A96D] border-[#6A4836]'
                          : 'bg-[#FBF0E6] text-[#8C4A38] border-[#D4A373]'
                      }`}
                    >
                      Cube: {detail.cubeRoot}³
                    </span>
                  )}
                </>
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

          {/* Cubic Equation Banner for Cube Numbers */}
          {detail.isCube && detail.cubeRoot !== null && (
            <div
              className={`mt-3 px-3.5 py-2.5 rounded-xl border flex flex-wrap items-center justify-between gap-2.5 transition-colors ${
                filterCategory === 'cube'
                  ? darkMode
                    ? 'bg-[#2E2018] border-[#5A3828] text-[#E0A96D] shadow-xs'
                    : 'bg-[#FDF3EB] border-[#E8C5B0] text-[#8C4A38] shadow-xs'
                  : darkMode
                  ? 'bg-[#241D1A] border-[#3E2E26] text-[#D4A373]'
                  : 'bg-[#FAF4EF] border-[#EADBCE] text-[#9C6A5A]'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider font-sans border ${
                    darkMode
                      ? 'bg-[#3D291E] border-[#634230] text-[#E0A96D]'
                      : 'bg-[#F5E2D2] border-[#DCBBA2] text-[#8C4A38]'
                  }`}
                >
                  Perfect Cube
                </span>
                <span className="text-sm sm:text-base font-serif font-bold">
                  {detail.cubeRoot}³ = {detail.cubeRoot} × {detail.cubeRoot} × {detail.cubeRoot} = {number}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs font-sans">
                <span>
                  Cube Root: <strong className="font-mono-num font-bold">∛{number} = {detail.cubeRoot}</strong>
                </span>
                {detail.isSquare && detail.squareRoot !== null && (
                  <span className="opacity-75 font-sans">
                    (Also Square: {detail.squareRoot}² = {number})
                  </span>
                )}
              </div>
            </div>
          )}

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
              {detail.factorPairs.map((pair, idx) => {
                const isCubic = pair.isCubePair || (detail.isCube && detail.cubeRoot !== null && (pair.a === detail.cubeRoot || pair.b === detail.cubeRoot));
                const isSquare = pair.isSquarePair;
                const isSelected = selectedPair.a === pair.a && selectedPair.b === pair.b;
                return (
                  <span
                    key={idx}
                    onClick={() => {
                      setSelectedPair(pair);
                      setActiveTab('visualizer');
                      soundFx.playPop(1);
                    }}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono-num font-bold border cursor-pointer transition-colors ${
                      isSelected
                        ? darkMode
                          ? 'bg-[#C29B38] text-[#181816] border-[#C29B38]'
                          : 'bg-[#5A5A40] text-[#FAF8F5] border-[#5A5A40]'
                        : isCubic
                        ? darkMode
                          ? 'bg-[#2E2420] hover:bg-[#3D2E26] text-[#E0A96D] border-[#523A2E]'
                          : 'bg-[#FDF3EB] hover:bg-[#F8E5D6] text-[#8C4A38] border-[#E8C5B0]'
                        : darkMode
                        ? 'bg-[#181816] hover:bg-[#282822] text-[#A3B18A] border-[#383832]'
                        : 'bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#5A5A40] border-[#E8E4DE]'
                    }`}
                    title={`Click to view ${pair.a} × ${pair.b} visualizer${isCubic ? ' (Cubic Factor Pair)' : isSquare ? ' (Square Pair)' : ''}`}
                  >
                    {pair.a} × {pair.b} = {number}
                    {isCubic && <span className="text-[9px] font-sans font-normal opacity-85">³</span>}
                    {isSquare && <span className="text-[9px] font-sans font-normal opacity-85">²</span>}
                  </span>
                );
              })}
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
                  const isCube = pair.isCubePair || (detail.isCube && detail.cubeRoot !== null && (pair.a === detail.cubeRoot || pair.b === detail.cubeRoot));
                  return (
                    <div
                      key={idx}
                      className={`relative p-3.5 sm:p-4 rounded-xl border transition-all ${
                        isSquare
                          ? darkMode
                            ? 'bg-[#23231F] border-[#C29B38] shadow-xs'
                            : 'bg-white border-[#8C7348] shadow-xs'
                          : isCube
                          ? darkMode
                            ? 'bg-[#261E1A] border-[#D4A373] shadow-xs'
                            : 'bg-[#FDF8F4] border-[#D4A373] shadow-xs'
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
                          Pair #{idx + 1} {isSquare && '★ Square'} {isCube && '◆ Cube Pair'}
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

          {/* TAB 2: Visual Array & Grid / 3D Isometric Cube Visualizer */}
          {activeTab === 'visualizer' && (
            <div className="space-y-4 sm:space-y-5">
              {/* Header & Sub-view Mode Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3
                    className={`text-sm sm:text-base font-serif font-semibold ${
                      darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                    }`}
                  >
                    {visualizerMode === '3d' && detail.isCube
                      ? `3D Isometric Cube Model (${detail.cubeRoot} × ${detail.cubeRoot} × ${detail.cubeRoot})`
                      : 'Geometric Area & Array Model'}
                  </h3>
                  <p
                    className={`text-[11px] sm:text-xs font-sans ${
                      darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                    }`}
                  >
                    {visualizerMode === '3d' && detail.cubeRoot
                      ? `Symmetric 3D cubic solid: ${detail.cubeRoot} width × ${detail.cubeRoot} depth × ${detail.cubeRoot} height = ${number} total cubic units.`
                      : `Rectangle of ${selectedPair.a} rows × ${selectedPair.b} columns = ${number} total blocks.`}
                  </p>
                </div>

                {/* Toggle between 2D Factor Array and 3D Isometric Cube Model for cube numbers */}
                {detail.isCube && (
                  <div
                    className={`flex items-center gap-1 p-1 rounded-xl border font-sans self-start sm:self-auto ${
                      darkMode ? 'bg-[#181816] border-[#383832]' : 'bg-[#F2EFE9] border-[#E8E4DE]'
                    }`}
                  >
                    <button
                      type="button"
                      id="visualizer-toggle-2d"
                      onClick={() => {
                        setVisualizerMode('2d');
                        soundFx.playPop(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        visualizerMode === '2d'
                          ? darkMode
                            ? 'bg-[#C29B38] text-[#181816] font-bold shadow-xs'
                            : 'bg-[#5A5A40] text-[#FAF8F5] font-bold shadow-xs'
                          : darkMode
                          ? 'text-[#9E9B90] hover:text-[#FAF8F5]'
                          : 'text-[#9A948C] hover:text-[#4A4A38]'
                      }`}
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>2D Factor Array</span>
                    </button>
                    <button
                      type="button"
                      id="visualizer-toggle-3d"
                      onClick={() => {
                        setVisualizerMode('3d');
                        soundFx.playPop(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        visualizerMode === '3d'
                          ? darkMode
                            ? 'bg-[#D4A373] text-[#181816] font-bold shadow-xs'
                            : 'bg-[#9C6A5A] text-[#FAF8F5] font-bold shadow-xs'
                          : darkMode
                          ? 'text-[#9E9B90] hover:text-[#FAF8F5]'
                          : 'text-[#9A948C] hover:text-[#4A4A38]'
                      }`}
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>3D Isometric Cube Model</span>
                    </button>
                  </div>
                )}
              </div>

              {/* VIEW 1: 3D Isometric Cube Model (when detail.isCube && visualizerMode === '3d') */}
              {visualizerMode === '3d' && detail.isCube && detail.cubeRoot !== null ? (
                <div className="space-y-4">
                  {number <= 400 ? (
                    /* Interactive 3D Isometric Block Model for k <= 7 (units <= 343/400) */
                    (() => {
                      const k = detail.cubeRoot;
                      const gapZ = explodedView ? 16 : 0;
                      const s =
                        k <= 2 ? 46 : k === 3 ? 32 : k === 4 ? 24 : k === 5 ? 18 : k === 6 ? 15 : 13;
                      const alpha = s * 0.866025;
                      const beta = s * 0.5;

                      const blocks: { x: number; y: number; z: number; id: number }[] = [];
                      let bId = 1;
                      for (let z = 0; z < k; z++) {
                        for (let y = 0; y < k; y++) {
                          for (let x = 0; x < k; x++) {
                            blocks.push({ x, y, z, id: bId++ });
                          }
                        }
                      }

                      const displayBlocks =
                        activeCubeLayer === 'all'
                          ? blocks
                          : blocks.filter((b) => b.z === (activeCubeLayer as number) - 1);

                      // Painter's algorithm sort: back-to-front
                      displayBlocks.sort((a, b) => {
                        const sumA = a.x + a.y + a.z;
                        const sumB = b.x + b.y + b.z;
                        if (sumA !== sumB) return sumA - sumB;
                        if (a.z !== b.z) return a.z - b.z;
                        if (a.y !== b.y) return a.y - b.y;
                        return a.x - b.x;
                      });

                      let minX = Infinity;
                      let maxX = -Infinity;
                      let minY = Infinity;
                      let maxY = -Infinity;

                      for (const b of displayBlocks) {
                        const cx = (b.x - b.y) * alpha;
                        const cy = (b.x + b.y) * beta - b.z * (s + gapZ);
                        minX = Math.min(minX, cx - alpha);
                        maxX = Math.max(maxX, cx + alpha);
                        minY = Math.min(minY, cy - beta);
                        maxY = Math.max(maxY, cy + beta + s);
                      }

                      if (displayBlocks.length === 0 || minX === Infinity) {
                        minX = -100;
                        maxX = 100;
                        minY = -100;
                        maxY = 100;
                      }

                      const pad = 24;
                      const vbX = minX - pad;
                      const vbY = minY - pad;
                      const vbW = maxX - minX + pad * 2;
                      const vbH = maxY - minY + pad * 2;

                      return (
                        <div className="w-full flex flex-col items-center">
                          {/* Controls: Layers and Exploded Slices */}
                          <div className="flex flex-wrap items-center justify-between gap-2 w-full max-w-xl font-sans text-xs mb-2">
                            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                              <span
                                className={`text-[11px] font-semibold mr-1 whitespace-nowrap ${
                                  darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                                }`}
                              >
                                Layer:
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCubeLayer('all');
                                  soundFx.playPop(1);
                                }}
                                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold cursor-pointer transition-colors ${
                                  activeCubeLayer === 'all'
                                    ? darkMode
                                      ? 'bg-[#D4A373] text-[#181816] font-bold'
                                      : 'bg-[#9C6A5A] text-[#FAF8F5] font-bold'
                                    : darkMode
                                    ? 'bg-[#181816] text-[#D8D5CC] hover:bg-[#282822]'
                                    : 'bg-[#FAF8F5] text-[#4A4A38] hover:bg-[#F2EFE9]'
                                }`}
                              >
                                All ({k})
                              </button>
                              {Array.from({ length: k }).map((_, lIdx) => {
                                const layerNum = lIdx + 1;
                                const isActive = activeCubeLayer === layerNum;
                                return (
                                  <button
                                    key={layerNum}
                                    type="button"
                                    onClick={() => {
                                      setActiveCubeLayer(layerNum);
                                      soundFx.playPop(1);
                                    }}
                                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono-num font-semibold cursor-pointer transition-colors ${
                                      isActive
                                        ? darkMode
                                          ? 'bg-[#D4A373] text-[#181816] font-bold'
                                          : 'bg-[#9C6A5A] text-[#FAF8F5] font-bold'
                                        : darkMode
                                        ? 'bg-[#181816] text-[#D8D5CC] hover:bg-[#282822]'
                                        : 'bg-[#FAF8F5] text-[#4A4A38] hover:bg-[#F2EFE9]'
                                    }`}
                                  >
                                    L{layerNum}
                                  </button>
                                );
                              })}
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setExplodedView(!explodedView);
                                soundFx.playPop(1);
                              }}
                              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                                explodedView
                                  ? darkMode
                                    ? 'bg-[#3A2A20] text-[#E0A96D] border-[#684838]'
                                    : 'bg-[#FAF0E6] text-[#8C4A38] border-[#D4A373]'
                                  : darkMode
                                  ? 'bg-[#181816] text-[#9E9B90] border-[#383832] hover:text-[#FAF8F5]'
                                  : 'bg-[#FAF8F5] text-[#9A948C] border-[#E8E4DE] hover:text-[#4A4A38]'
                              }`}
                            >
                              {explodedView ? 'Compact View' : 'Explode Slices'}
                            </button>
                          </div>

                          {/* Hover Info Pill */}
                          <div
                            className={`h-7 px-3 rounded-lg border flex items-center justify-center text-[11px] font-sans w-full max-w-xl mb-3 transition-colors ${
                              hoveredCubeBlock
                                ? darkMode
                                  ? 'bg-[#2A201A] border-[#483730] text-[#E0A96D]'
                                  : 'bg-[#FDF6F0] border-[#EAD5C3] text-[#8C4A38]'
                                : darkMode
                                ? 'bg-[#181816] border-[#383832] text-[#7A776E]'
                                : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#9A948C]'
                            }`}
                          >
                            {hoveredCubeBlock ? (
                              <span>
                                Unit #
                                {(hoveredCubeBlock.z * k + hoveredCubeBlock.y) * k +
                                  hoveredCubeBlock.x +
                                  1}
                                : Coordinate (x:{hoveredCubeBlock.x + 1}, y:
                                {hoveredCubeBlock.y + 1}, z:{hoveredCubeBlock.z + 1}) &bull; Layer{' '}
                                {hoveredCubeBlock.z + 1} of {k}
                              </span>
                            ) : (
                              <span>Hover over blocks to inspect individual unit cubes</span>
                            )}
                          </div>

                          {/* 3D Isometric SVG Container */}
                          <div
                            className={`p-3 rounded-2xl border flex items-center justify-center w-full max-w-xl min-h-[300px] sm:min-h-[340px] ${
                              darkMode
                                ? 'bg-[#181816] border-[#383832]'
                                : 'bg-[#FAF8F5] border-[#E8E4DE]'
                            }`}
                          >
                            <svg
                              viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
                              className="w-full max-w-[460px] h-[280px] sm:h-[320px] select-none"
                            >
                              {displayBlocks.map((b) => {
                                const cx = (b.x - b.y) * alpha;
                                const cy = (b.x + b.y) * beta - b.z * (s + gapZ);
                                const isHovered =
                                  hoveredCubeBlock?.x === b.x &&
                                  hoveredCubeBlock?.y === b.y &&
                                  hoveredCubeBlock?.z === b.z;

                                const topFace = `${cx},${cy - beta} ${cx + alpha},${cy} ${cx},${cy + beta} ${cx - alpha},${cy}`;
                                const leftFace = `${cx - alpha},${cy} ${cx},${cy + beta} ${cx},${cy + beta + s} ${cx - alpha},${cy + s}`;
                                const rightFace = `${cx},${cy + beta} ${cx + alpha},${cy} ${cx + alpha},${cy + s} ${cx},${cy + beta + s}`;

                                const topColor = isHovered
                                  ? '#FCD34D'
                                  : darkMode
                                  ? '#D4A373'
                                  : '#E8B88A';
                                const leftColor = isHovered
                                  ? '#F59E0B'
                                  : darkMode
                                  ? '#A8745E'
                                  : '#C2846F';
                                const rightColor = isHovered
                                  ? '#D97706'
                                  : darkMode
                                  ? '#7A4D3E'
                                  : '#965745';
                                const strokeColor = darkMode ? '#181816' : '#FAF8F5';

                                return (
                                  <g
                                    key={`${b.x}-${b.y}-${b.z}`}
                                    className="cursor-pointer transition-opacity"
                                    onMouseEnter={() =>
                                      setHoveredCubeBlock({ x: b.x, y: b.y, z: b.z })
                                    }
                                    onMouseLeave={() => setHoveredCubeBlock(null)}
                                    onClick={() => soundFx.playPop(1)}
                                  >
                                    <polygon
                                      points={topFace}
                                      fill={topColor}
                                      stroke={strokeColor}
                                      strokeWidth="0.8"
                                    />
                                    <polygon
                                      points={leftFace}
                                      fill={leftColor}
                                      stroke={strokeColor}
                                      strokeWidth="0.8"
                                    />
                                    <polygon
                                      points={rightFace}
                                      fill={rightColor}
                                      stroke={strokeColor}
                                      strokeWidth="0.8"
                                    />
                                  </g>
                                );
                              })}
                            </svg>
                          </div>

                          {/* Dimensions & Volume Callouts */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-xl font-sans text-xs mt-3">
                            <div
                              className={`p-2 rounded-xl border text-center ${
                                darkMode
                                  ? 'bg-[#181816] border-[#383832]'
                                  : 'bg-[#FAF8F5] border-[#E8E4DE]'
                              }`}
                            >
                              <span
                                className={`text-[10px] uppercase font-semibold block ${
                                  darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                                }`}
                              >
                                Width (x)
                              </span>
                              <span
                                className={`text-sm font-bold font-mono-num ${
                                  darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                                }`}
                              >
                                {k} units
                              </span>
                            </div>
                            <div
                              className={`p-2 rounded-xl border text-center ${
                                darkMode
                                  ? 'bg-[#181816] border-[#383832]'
                                  : 'bg-[#FAF8F5] border-[#E8E4DE]'
                              }`}
                            >
                              <span
                                className={`text-[10px] uppercase font-semibold block ${
                                  darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                                }`}
                              >
                                Depth (y)
                              </span>
                              <span
                                className={`text-sm font-bold font-mono-num ${
                                  darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                                }`}
                              >
                                {k} units
                              </span>
                            </div>
                            <div
                              className={`p-2 rounded-xl border text-center ${
                                darkMode
                                  ? 'bg-[#181816] border-[#383832]'
                                  : 'bg-[#FAF8F5] border-[#E8E4DE]'
                              }`}
                            >
                              <span
                                className={`text-[10px] uppercase font-semibold block ${
                                  darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                                }`}
                              >
                                Height (z)
                              </span>
                              <span
                                className={`text-sm font-bold font-mono-num ${
                                  darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                                }`}
                              >
                                {k} layers
                              </span>
                            </div>
                            <div
                              className={`p-2 rounded-xl border text-center ${
                                darkMode
                                  ? 'bg-[#2A201A] border-[#483730]'
                                  : 'bg-[#FDF6F0] border-[#EAD5C3]'
                              }`}
                            >
                              <span
                                className={`text-[10px] uppercase font-semibold block ${
                                  darkMode ? 'text-[#D4A373]' : 'text-[#8C4A38]'
                                }`}
                              >
                                Volume (V)
                              </span>
                              <span
                                className={`text-sm font-bold font-mono-num ${
                                  darkMode ? 'text-[#E0A96D]' : 'text-[#8C4A38]'
                                }`}
                              >
                                {number} units³
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    /* Scalable Isometric Geometric Representation for Large Cubes (>400 units, e.g. 16³ = 4096) */
                    (() => {
                      const k = detail.cubeRoot;
                      const S = 150;
                      const alpha = S * 0.866025;
                      const beta = S * 0.5;

                      const pTop = { x: 0, y: -beta };
                      const pRight = { x: alpha, y: 0 };
                      const pBottom = { x: 0, y: beta };
                      const pLeft = { x: -alpha, y: 0 };
                      const pBottomDown = { x: 0, y: beta + S };
                      const pLeftDown = { x: -alpha, y: S };
                      const pRightDown = { x: alpha, y: S };

                      const subdivisions = Math.min(k, 24);

                      const topGridLines: string[] = [];
                      const leftGridLines: string[] = [];
                      const rightGridLines: string[] = [];

                      for (let i = 1; i < subdivisions; i++) {
                        const t = i / subdivisions;
                        // Top face lines
                        const x1 = (1 - t) * pLeft.x + t * pTop.x;
                        const y1 = (1 - t) * pLeft.y + t * pTop.y;
                        const x2 = (1 - t) * pBottom.x + t * pRight.x;
                        const y2 = (1 - t) * pBottom.y + t * pRight.y;
                        topGridLines.push(`M ${x1} ${y1} L ${x2} ${y2}`);

                        const x3 = (1 - t) * pTop.x + t * pRight.x;
                        const y3 = (1 - t) * pTop.y + t * pRight.y;
                        const x4 = (1 - t) * pLeft.x + t * pBottom.x;
                        const y4 = (1 - t) * pLeft.y + t * pBottom.y;
                        topGridLines.push(`M ${x3} ${y3} L ${x4} ${y4}`);

                        // Left face lines
                        const lx1 = (1 - t) * pLeft.x + t * pLeftDown.x;
                        const ly1 = (1 - t) * pLeft.y + t * pLeftDown.y;
                        const lx2 = (1 - t) * pBottom.x + t * pBottomDown.x;
                        const ly2 = (1 - t) * pBottom.y + t * pBottomDown.y;
                        leftGridLines.push(`M ${lx1} ${ly1} L ${lx2} ${ly2}`);

                        const lx3 = (1 - t) * pLeft.x + t * pBottom.x;
                        const ly3 = (1 - t) * pLeft.y + t * pBottom.y;
                        const lx4 = (1 - t) * pLeftDown.x + t * pBottomDown.x;
                        const ly4 = (1 - t) * pLeftDown.y + t * pBottomDown.y;
                        leftGridLines.push(`M ${lx3} ${ly3} L ${lx4} ${ly4}`);

                        // Right face lines
                        const rx1 = (1 - t) * pBottom.x + t * pBottomDown.x;
                        const ry1 = (1 - t) * pBottom.y + t * pBottomDown.y;
                        const rx2 = (1 - t) * pRight.x + t * pRightDown.x;
                        const ry2 = (1 - t) * pRight.y + t * pRightDown.y;
                        rightGridLines.push(`M ${rx1} ${ry1} L ${rx2} ${ry2}`);

                        const rx3 = (1 - t) * pBottom.x + t * pRight.x;
                        const ry3 = (1 - t) * pBottom.y + t * pRight.y;
                        const rx4 = (1 - t) * pBottomDown.x + t * pRightDown.x;
                        const ry4 = (1 - t) * pBottomDown.y + t * pRightDown.y;
                        rightGridLines.push(`M ${rx3} ${ry3} L ${rx4} ${ry4}`);
                      }

                      // Active layer slice plane
                      const sliceFromTop = (k - largeCubeSlice + 0.5) / k;
                      const sliceP1 = { x: -alpha, y: S * sliceFromTop };
                      const sliceP2 = { x: 0, y: beta + S * sliceFromTop };
                      const sliceP3 = { x: alpha, y: S * sliceFromTop };
                      const slicePTop = { x: 0, y: -beta + S * sliceFromTop };

                      const pad = 54;
                      const vbX = -alpha - pad;
                      const vbY = -beta - pad;
                      const vbW = alpha * 2 + pad * 2;
                      const vbH = S + beta * 2 + pad * 2;

                      const faceTopColor = darkMode ? '#D4A373' : '#E8B88A';
                      const faceLeftColor = darkMode ? '#A8745E' : '#C2846F';
                      const faceRightColor = darkMode ? '#7A4D3E' : '#965745';
                      const wireColor = darkMode
                        ? 'rgba(255,255,255,0.2)'
                        : 'rgba(255,255,255,0.6)';
                      const edgeColor = darkMode ? '#FAF8F5' : '#4A4A38';

                      return (
                        <div className="w-full flex flex-col items-center">
                          {/* Scalable Isometric Wireframe SVG Container */}
                          <div
                            className={`p-4 rounded-2xl border flex items-center justify-center w-full max-w-xl min-h-[300px] sm:min-h-[340px] ${
                              darkMode
                                ? 'bg-[#181816] border-[#383832]'
                                : 'bg-[#FAF8F5] border-[#E8E4DE]'
                            }`}
                          >
                            <svg
                              viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
                              className="w-full max-w-[420px] h-[280px] sm:h-[310px] select-none overflow-visible"
                            >
                              {/* Shaded Faces */}
                              <polygon
                                points={`${pTop.x},${pTop.y} ${pRight.x},${pRight.y} ${pBottom.x},${pBottom.y} ${pLeft.x},${pLeft.y}`}
                                fill={faceTopColor}
                                stroke={edgeColor}
                                strokeWidth="1.5"
                              />
                              <polygon
                                points={`${pLeft.x},${pLeft.y} ${pBottom.x},${pBottom.y} ${pLeftDown.x + (pBottomDown.x - pBottom.x)},${pLeftDown.y + (pBottomDown.y - pBottom.y)} ${pLeftDown.x},${pLeftDown.y}`}
                                fill={faceLeftColor}
                                stroke={edgeColor}
                                strokeWidth="1.5"
                              />
                              <polygon
                                points={`${pBottom.x},${pBottom.y} ${pRight.x},${pRight.y} ${pRightDown.x},${pRightDown.y} ${pBottomDown.x},${pBottomDown.y}`}
                                fill={faceRightColor}
                                stroke={edgeColor}
                                strokeWidth="1.5"
                              />

                              {/* Layered Wireframe Grid Lines */}
                              <g stroke={wireColor} strokeWidth="0.75">
                                {topGridLines.map((d, i) => (
                                  <path key={`top-${i}`} d={d} />
                                ))}
                                {leftGridLines.map((d, i) => (
                                  <path key={`left-${i}`} d={d} />
                                ))}
                                {rightGridLines.map((d, i) => (
                                  <path key={`right-${i}`} d={d} />
                                ))}
                              </g>

                              {/* Highlighted Sliced Layer Plane */}
                              <polygon
                                points={`${slicePTop.x},${slicePTop.y} ${sliceP3.x},${sliceP3.y} ${sliceP2.x},${sliceP2.y} ${sliceP1.x},${sliceP1.y}`}
                                fill="rgba(252, 211, 77, 0.45)"
                                stroke="#F59E0B"
                                strokeWidth="2"
                                strokeDasharray="4 2"
                              />

                              {/* Outer Silhouette Edge Outline */}
                              <polygon
                                points={`${pTop.x},${pTop.y} ${pRight.x},${pRight.y} ${pRightDown.x},${pRightDown.y} ${pBottomDown.x},${pBottomDown.y} ${pLeftDown.x},${pLeftDown.y} ${pLeft.x},${pLeft.y}`}
                                fill="none"
                                stroke={edgeColor}
                                strokeWidth="2"
                              />
                              <line
                                x1={pBottom.x}
                                y1={pBottom.y}
                                x2={pTop.x}
                                y2={pTop.y}
                                stroke={edgeColor}
                                strokeWidth="1.5"
                              />
                              <line
                                x1={pBottom.x}
                                y1={pBottom.y}
                                x2={pLeft.x}
                                y2={pLeft.y}
                                stroke={edgeColor}
                                strokeWidth="1.5"
                              />
                              <line
                                x1={pBottom.x}
                                y1={pBottom.y}
                                x2={pRight.x}
                                y2={pRight.y}
                                stroke={edgeColor}
                                strokeWidth="1.5"
                              />
                              <line
                                x1={pBottom.x}
                                y1={pBottom.y}
                                x2={pBottomDown.x}
                                y2={pBottomDown.y}
                                stroke={edgeColor}
                                strokeWidth="1.5"
                              />

                              {/* Dimension Labels & Callouts */}
                              {/* Width Label (Right top edge) */}
                              <text
                                x={alpha / 2 + 10}
                                y={-beta / 2 - 6}
                                fill={darkMode ? '#D4A373' : '#8C4A38'}
                                fontSize="11"
                                fontWeight="bold"
                                textAnchor="middle"
                                transform={`rotate(30, ${alpha / 2 + 10}, ${-beta / 2 - 6})`}
                              >
                                {k} units
                              </text>

                              {/* Depth Label (Left top edge) */}
                              <text
                                x={-alpha / 2 - 10}
                                y={-beta / 2 - 6}
                                fill={darkMode ? '#D4A373' : '#8C4A38'}
                                fontSize="11"
                                fontWeight="bold"
                                textAnchor="middle"
                                transform={`rotate(-30, ${-alpha / 2 - 10}, ${-beta / 2 - 6})`}
                              >
                                {k} units
                              </text>

                              {/* Height Label (Left vertical edge) */}
                              <text
                                x={-alpha - 10}
                                y={S / 2}
                                fill={darkMode ? '#D4A373' : '#8C4A38'}
                                fontSize="11"
                                fontWeight="bold"
                                textAnchor="end"
                                dominantBaseline="middle"
                              >
                                {k} layers ({k} units)
                              </text>

                              {/* Slice Indicator */}
                              <circle cx={sliceP3.x} cy={sliceP3.y} r="3.5" fill="#F59E0B" />
                              <line
                                x1={sliceP3.x}
                                y1={sliceP3.y}
                                x2={sliceP3.x + 18}
                                y2={sliceP3.y}
                                stroke="#F59E0B"
                                strokeWidth="1.5"
                              />
                              <text
                                x={sliceP3.x + 22}
                                y={sliceP3.y + 3}
                                fill="#F59E0B"
                                fontSize="10"
                                fontWeight="bold"
                              >
                                Layer {largeCubeSlice}
                              </text>
                            </svg>
                          </div>

                          {/* Interactive Layer Slice Slider */}
                          <div
                            className={`w-full max-w-xl mt-3 px-3.5 py-3 rounded-xl border font-sans text-xs space-y-2 ${
                              darkMode
                                ? 'bg-[#181816] border-[#383832]'
                                : 'bg-[#FAF8F5] border-[#E8E4DE]'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-xs">
                                Inspect Horizontal Layer Slice:{' '}
                                <strong className="font-mono-num font-bold">
                                  Layer {largeCubeSlice} of {k}
                                </strong>
                              </span>
                              <span className="font-mono-num font-bold text-[11px] opacity-80">
                                {k} × {k} = {k * k} units
                              </span>
                            </div>
                            <input
                              type="range"
                              min="1"
                              max={k}
                              value={largeCubeSlice}
                              onChange={(e) => setLargeCubeSlice(parseInt(e.target.value, 10))}
                              className="w-full accent-[#D4A373] cursor-pointer"
                            />
                            <div className="flex items-center justify-between text-[11px] opacity-75">
                              <span>Layer 1 (Base)</span>
                              <span>
                                Cumulative: {largeCubeSlice * k * k} / {number} units
                              </span>
                              <span>Layer {k} (Top)</span>
                            </div>
                          </div>

                          {/* Volume & Dimensions Callouts */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-xl font-sans text-xs mt-3">
                            <div
                              className={`p-2 rounded-xl border text-center ${
                                darkMode
                                  ? 'bg-[#181816] border-[#383832]'
                                  : 'bg-[#FAF8F5] border-[#E8E4DE]'
                              }`}
                            >
                              <span
                                className={`text-[10px] uppercase font-semibold block ${
                                  darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                                }`}
                              >
                                Width (x)
                              </span>
                              <span
                                className={`text-sm font-bold font-mono-num ${
                                  darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                                }`}
                              >
                                {k} units
                              </span>
                            </div>
                            <div
                              className={`p-2 rounded-xl border text-center ${
                                darkMode
                                  ? 'bg-[#181816] border-[#383832]'
                                  : 'bg-[#FAF8F5] border-[#E8E4DE]'
                              }`}
                            >
                              <span
                                className={`text-[10px] uppercase font-semibold block ${
                                  darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                                }`}
                              >
                                Depth (y)
                              </span>
                              <span
                                className={`text-sm font-bold font-mono-num ${
                                  darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                                }`}
                              >
                                {k} units
                              </span>
                            </div>
                            <div
                              className={`p-2 rounded-xl border text-center ${
                                darkMode
                                  ? 'bg-[#181816] border-[#383832]'
                                  : 'bg-[#FAF8F5] border-[#E8E4DE]'
                              }`}
                            >
                              <span
                                className={`text-[10px] uppercase font-semibold block ${
                                  darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                                }`}
                              >
                                Height (z)
                              </span>
                              <span
                                className={`text-sm font-bold font-mono-num ${
                                  darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                                }`}
                              >
                                {k} layers
                              </span>
                            </div>
                            <div
                              className={`p-2 rounded-xl border text-center ${
                                darkMode
                                  ? 'bg-[#2A201A] border-[#483730]'
                                  : 'bg-[#FDF6F0] border-[#EAD5C3]'
                              }`}
                            >
                              <span
                                className={`text-[10px] uppercase font-semibold block ${
                                  darkMode ? 'text-[#D4A373]' : 'text-[#8C4A38]'
                                }`}
                              >
                                Volume (V)
                              </span>
                              <span
                                className={`text-sm font-bold font-mono-num ${
                                  darkMode ? 'text-[#E0A96D]' : 'text-[#8C4A38]'
                                }`}
                              >
                                {number} units³
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </div>
              ) : (
                /* VIEW 2: Standard 2D Factor Array Grid */
                <div className="space-y-4">
                  {/* Pair Selector Buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar font-sans">
                    <span
                      className={`text-[11px] font-semibold mr-1 whitespace-nowrap ${
                        darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                      }`}
                    >
                      Layout:
                    </span>
                    {detail.factorPairs.map((pair, idx) => {
                      const isSquare = pair.a === pair.b;
                      const isCube =
                        pair.isCubePair ||
                        (detail.isCube &&
                          detail.cubeRoot !== null &&
                          (pair.a === detail.cubeRoot || pair.b === detail.cubeRoot));
                      return (
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
                          {isCube && ' ³'}
                          {isSquare && ' ²'}
                        </button>
                      );
                    })}
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
                            darkMode
                              ? 'bg-[#181816] border-[#383832]'
                              : 'bg-[#FAF8F5] border-[#E8E4DE]'
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
                          darkMode
                            ? 'bg-[#181816] border-[#383832]'
                            : 'bg-[#FAF8F5] border-[#E8E4DE]'
                        }`}
                      >
                        <div
                          className={`text-3xl font-serif font-bold mb-1.5 ${
                            darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'
                          }`}
                        >
                          {selectedPair.a} × {selectedPair.b}
                        </div>
                        <p
                          className={`text-xs sm:text-sm ${
                            darkMode ? 'text-[#D8D5CC]' : 'text-[#4A4A38]'
                          }`}
                        >
                          A large array containing{' '}
                          <strong className={darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'}>
                            {number}
                          </strong>{' '}
                          units ({selectedPair.a} rows and {selectedPair.b} columns).
                        </p>
                        {detail.isCube && (
                          <button
                            type="button"
                            onClick={() => {
                              setVisualizerMode('3d');
                              soundFx.playPop(1);
                            }}
                            className={`mt-3 px-3.5 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                              darkMode
                                ? 'bg-[#2E2018] hover:bg-[#3D2C22] border-[#5A3828] text-[#E0A96D]'
                                : 'bg-[#FDF3EB] hover:bg-[#F8E5D6] border-[#E8C5B0] text-[#8C4A38]'
                            }`}
                          >
                            <Box className="w-3.5 h-3.5" />
                            <span>View 3D Isometric Cube Visualizer</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
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

                {/* Perfect Square Property */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    detail.isSquare
                      ? darkMode
                        ? 'bg-[#282418] border-[#C29B38] shadow-xs'
                        : 'bg-[#FDFBF4] border-[#C29B38] shadow-xs'
                      : darkMode
                      ? 'bg-[#23231F] border-[#383832]'
                      : 'bg-white border-[#E8E4DE]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase ${
                        darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                      }`}
                    >
                      Perfect Square
                    </span>
                    {detail.isSquare && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          darkMode ? 'bg-[#C29B38]/20 text-[#E6C458]' : 'bg-[#C29B38]/20 text-[#8C7348]'
                        }`}
                      >
                        Square
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-xl sm:text-2xl font-bold font-mono-num mt-1 ${
                      detail.isSquare
                        ? darkMode
                          ? 'text-[#E6C458]'
                          : 'text-[#8C7348]'
                        : darkMode
                        ? 'text-[#FAF8F5]'
                        : 'text-[#4A4A38]'
                    }`}
                  >
                    {detail.isSquare ? `Yes — ${detail.squareRoot}²` : 'No'}
                  </div>
                  <p className={`text-xs mt-1 font-sans ${darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'}`}>
                    {detail.isSquare
                      ? `√${number} = ${detail.squareRoot} (${detail.squareRoot} × ${detail.squareRoot} = ${number})`
                      : `√${number} ≈ ${Math.sqrt(number).toFixed(3)} (Nearest: ${Math.floor(Math.sqrt(number))}²=${Math.floor(Math.sqrt(number)) ** 2}, ${Math.ceil(Math.sqrt(number))}²=${Math.ceil(Math.sqrt(number)) ** 2})`}
                  </p>
                </div>

                {/* Perfect Cube Property */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    detail.isCube
                      ? darkMode
                        ? 'bg-[#2A201A] border-[#D4A373] shadow-xs'
                        : 'bg-[#FDF6F0] border-[#D4A373] shadow-xs'
                      : darkMode
                      ? 'bg-[#23231F] border-[#383832]'
                      : 'bg-white border-[#E8E4DE]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold uppercase ${
                        darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                      }`}
                    >
                      Perfect Cube
                    </span>
                    {detail.isCube && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          darkMode ? 'bg-[#D4A373]/20 text-[#E0A96D]' : 'bg-[#D4A373]/20 text-[#9C6A5A]'
                        }`}
                      >
                        Cube
                      </span>
                    )}
                  </div>
                  <div
                    className={`text-xl sm:text-2xl font-bold font-mono-num mt-1 ${
                      detail.isCube
                        ? darkMode
                          ? 'text-[#E0A96D]'
                          : 'text-[#9C6A5A]'
                        : darkMode
                        ? 'text-[#FAF8F5]'
                        : 'text-[#4A4A38]'
                    }`}
                  >
                    {detail.isCube ? `Yes — ${detail.cubeRoot}³` : 'No'}
                  </div>
                  <p className={`text-xs mt-1 font-sans ${darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'}`}>
                    {detail.isCube
                      ? `∛${number} = ${detail.cubeRoot} (${detail.cubeRoot} × ${detail.cubeRoot} × ${detail.cubeRoot} = ${number})`
                      : `∛${number} ≈ ${Math.cbrt(number).toFixed(3)} (Nearest: ${Math.floor(Math.cbrt(number))}³=${Math.floor(Math.cbrt(number)) ** 3}, ${Math.ceil(Math.cbrt(number))}³=${Math.ceil(Math.cbrt(number)) ** 3})`}
                  </p>
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
