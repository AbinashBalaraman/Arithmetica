import React from 'react';
import {
  Filter,
  SlidersHorizontal,
  Search,
  Hash,
  Sparkles,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import { FilterCategory, RangePreset, SortOrder } from '../types';
import { soundFx } from '../utils/mathUtils';

interface FilterBarProps {
  rangePreset: RangePreset;
  setRangePreset: (preset: RangePreset) => void;
  customStart: number;
  setCustomStart: (n: number) => void;
  customEnd: number;
  setCustomEnd: (n: number) => void;
  filterCategory: FilterCategory;
  setFilterCategory: (cat: FilterCategory) => void;
  multipleOfValue: number;
  setMultipleOfValue: (n: number) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  searchFilter: string;
  setSearchFilter: (s: string) => void;
  totalFilteredCount: number;
  darkMode?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  rangePreset,
  setRangePreset,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
  filterCategory,
  setFilterCategory,
  multipleOfValue,
  setMultipleOfValue,
  sortOrder,
  setSortOrder,
  searchFilter,
  setSearchFilter,
  totalFilteredCount,
  darkMode = false,
}) => {
  const rangeButtons: { label: string; preset: RangePreset }[] = [
    { label: '1 – 50', preset: '1-50' },
    { label: '1 – 100', preset: '1-100' },
    { label: '101 – 200', preset: '101-200' },
    { label: '201 – 500', preset: '201-500' },
    { label: '1 – 1000', preset: '1-1000' },
    { label: 'Custom', preset: 'custom' },
  ];

  const categoryChips: { label: string; cat: FilterCategory; icon?: React.ReactNode }[] = [
    { label: 'All Numbers', cat: 'all', icon: <Hash className="w-3.5 h-3.5" /> },
    { label: 'Primes Only', cat: 'prime', icon: <Sparkles className="w-3.5 h-3.5 text-[#6E7A5A]" /> },
    { label: 'Composites', cat: 'composite' },
    { label: 'Even', cat: 'even' },
    { label: 'Odd', cat: 'odd' },
    { label: 'Squares (x²)', cat: 'square', icon: <Layers className="w-3.5 h-3.5 text-[#8C7348]" /> },
    { label: 'Cubes (x³)', cat: 'cube' },
    { label: 'Multiples of...', cat: 'multipleOf' },
  ];

  return (
    <div
      className={`rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 font-sans border transition-colors ${
        darkMode
          ? 'bg-[#23231F] border-[#383832] text-[#E8E6DF]'
          : 'bg-white border-[#E8E4DE] text-[#4A4A38]'
      }`}
    >
      {/* Top row: Range selector & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Preset Range Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 mr-1 ${
              darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Range:
          </span>
          {rangeButtons.map((btn) => (
            <button
              key={btn.preset}
              onClick={() => {
                soundFx.playPop(1);
                setRangePreset(btn.preset);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                rangePreset === btn.preset
                  ? darkMode
                    ? 'bg-[#A3B18A] text-[#181816] border-[#A3B18A] shadow-xs'
                    : 'bg-[#5A5A40] text-[#FAF8F5] border-[#5A5A40] shadow-xs'
                  : darkMode
                  ? 'bg-[#181816] hover:bg-[#2A2A24] text-[#E8E6DF] border-[#383832]'
                  : 'bg-[#F2EFE9] hover:bg-[#E8E4DE] text-[#4A4A38] border-[#E8E4DE]'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-56">
            <Search
              className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                darkMode ? 'text-[#7A776E]' : 'text-[#9A948C]'
              }`}
            />
            <input
              type="text"
              placeholder="Filter list..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className={`w-full rounded-xl pl-9 pr-3 py-1.5 text-xs sm:text-sm focus:outline-none transition-colors border ${
                darkMode
                  ? 'bg-[#181816] border-[#383832] text-[#E8E6DF] placeholder-[#7A776E] focus:border-[#C29B38]'
                  : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#4A4A38] placeholder-[#9A948C] focus:border-[#5A5A40]'
              }`}
            />
          </div>

          {/* Sort Dropdown */}
          <div
            className={`flex items-center gap-1 border rounded-xl px-2.5 py-1.5 text-xs ${
              darkMode
                ? 'bg-[#181816] border-[#383832] text-[#E8E6DF]'
                : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#4A4A38]'
            }`}
          >
            <ArrowUpDown
              className={`w-3.5 h-3.5 ${darkMode ? 'text-[#7A776E]' : 'text-[#9A948C]'}`}
            />
            <select
              value={sortOrder}
              onChange={(e) => {
                soundFx.playPop(1);
                setSortOrder(e.target.value as SortOrder);
              }}
              aria-label="Sort numbers by order"
              className={`bg-transparent text-xs font-semibold focus:outline-none cursor-pointer ${
                darkMode ? 'text-[#E8E6DF]' : 'text-[#4A4A38]'
              }`}
            >
              <option value="asc" className={darkMode ? 'bg-[#23231F] text-[#E8E6DF]' : 'bg-[#FAF8F5] text-[#4A4A38]'}>
                1 → 100 (Asc)
              </option>
              <option value="desc" className={darkMode ? 'bg-[#23231F] text-[#E8E6DF]' : 'bg-[#FAF8F5] text-[#4A4A38]'}>
                100 → 1 (Desc)
              </option>
              <option value="factors-count-desc" className={darkMode ? 'bg-[#23231F] text-[#E8E6DF]' : 'bg-[#FAF8F5] text-[#4A4A38]'}>
                Most Factors First
              </option>
              <option value="factors-count-asc" className={darkMode ? 'bg-[#23231F] text-[#E8E6DF]' : 'bg-[#FAF8F5] text-[#4A4A38]'}>
                Least Factors First
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Custom Range Inputs if custom selected */}
      {rangePreset === 'custom' && (
        <div
          className={`flex items-center gap-3 p-3 rounded-xl border flex-wrap ${
            darkMode
              ? 'bg-[#181816] border-[#383832] text-[#E8E6DF]'
              : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#4A4A38]'
          }`}
        >
          <span className="text-xs font-semibold">Custom Range:</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="100000"
              value={customStart}
              onChange={(e) => setCustomStart(Math.max(1, parseInt(e.target.value) || 1))}
              className={`w-20 rounded-lg px-2.5 py-1 text-xs font-mono-num border ${
                darkMode
                  ? 'bg-[#23231F] border-[#383832] text-[#E8E6DF]'
                  : 'bg-white border-[#E8E4DE] text-[#4A4A38]'
              }`}
            />
            <span className={darkMode ? 'text-[#7A776E] text-xs' : 'text-[#9A948C] text-xs'}>
              to
            </span>
            <input
              type="number"
              min="1"
              max="100000"
              value={customEnd}
              onChange={(e) => setCustomEnd(Math.max(1, parseInt(e.target.value) || 1))}
              className={`w-20 rounded-lg px-2.5 py-1 text-xs font-mono-num border ${
                darkMode
                  ? 'bg-[#23231F] border-[#383832] text-[#E8E6DF]'
                  : 'bg-white border-[#E8E4DE] text-[#4A4A38]'
              }`}
            />
          </div>
        </div>
      )}

      {/* Category Pills & Count */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t ${
          darkMode ? 'border-[#383832]' : 'border-[#E8E4DE]'
        }`}
      >
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 mr-1 ${
              darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter:
          </span>
          {categoryChips.map((chip) => (
            <button
              key={chip.cat}
              onClick={() => {
                soundFx.playPop(1);
                setFilterCategory(chip.cat);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border ${
                filterCategory === chip.cat
                  ? darkMode
                    ? 'bg-[#A3B18A] text-[#181816] border-[#A3B18A] shadow-xs'
                    : 'bg-[#5A5A40] text-[#FAF8F5] border-[#5A5A40] shadow-xs'
                  : darkMode
                  ? 'bg-[#181816] hover:bg-[#2A2A24] text-[#E8E6DF] border-[#383832]'
                  : 'bg-[#F2EFE9] hover:bg-[#E8E4DE] text-[#4A4A38] border-[#E8E4DE]'
              }`}
            >
              {chip.icon}
              <span>{chip.label}</span>
            </button>
          ))}

          {/* If Multiples of selected */}
          {filterCategory === 'multipleOf' && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className={`text-xs ${darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'}`}>
                Multiple of:
              </span>
              <select
                value={multipleOfValue}
                onChange={(e) => {
                  soundFx.playPop(1);
                  setMultipleOfValue(parseInt(e.target.value, 10));
                }}
                aria-label="Select base number for multiples"
                className={`border rounded-lg px-2.5 py-0.5 text-xs font-bold focus:outline-none cursor-pointer ${
                  darkMode
                    ? 'bg-[#181816] border-[#383832] text-[#A3B18A]'
                    : 'bg-[#F2EFE9] border-[#E8E4DE] text-[#5A5A40]'
                }`}
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 20, 25].map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div
          className={`text-xs font-medium whitespace-nowrap font-sans ${
            darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
          }`}
        >
          Showing{' '}
          <strong className={darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'}>
            {totalFilteredCount}
          </strong>{' '}
          numbers
        </div>
      </div>
    </div>
  );
};
