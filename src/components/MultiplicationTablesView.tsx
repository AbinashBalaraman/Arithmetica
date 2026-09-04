import React, { useState, useMemo } from 'react';
import {
  Table,
  Sliders,
  Copy,
  Check,
  Search,
  Sparkles,
  ChevronRight,
  RotateCcw,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react';
import { soundFx } from '../utils/mathUtils';

interface MultiplicationTablesViewProps {
  onSelectNumber: (num: number) => void;
  darkMode?: boolean;
}

export const MultiplicationTablesView: React.FC<MultiplicationTablesViewProps> = ({
  onSelectNumber,
  darkMode = false,
}) => {
  // Table range settings (Default 1 to 20 as requested)
  const [startTable, setStartTable] = useState<number>(1);
  const [endTable, setEndTable] = useState<number>(20);
  const [maxMultiplier, setMaxMultiplier] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedTable, setCopiedTable] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [selectedSingleTable, setSelectedSingleTable] = useState<number | null>(null);

  // Generate list of tables to render
  const tablesList = useMemo(() => {
    const start = Math.max(1, Math.min(startTable, endTable));
    const end = Math.max(1, Math.max(startTable, endTable));
    const list: number[] = [];
    const limit = Math.min(end, start + 100); // cap max batch to 100 tables for smooth rendering
    for (let t = start; t <= limit; t++) {
      list.push(t);
    }
    return list;
  }, [startTable, endTable]);

  // Filtered list if single table or search is active
  const filteredTables = useMemo(() => {
    if (selectedSingleTable !== null) {
      return [selectedSingleTable];
    }
    if (!searchTerm.trim()) return tablesList;
    const query = searchTerm.trim().toLowerCase();
    const queryNum = parseInt(query, 10);
    return tablesList.filter((tableNum) => {
      if (tableNum.toString().includes(query)) return true;
      if (!isNaN(queryNum)) {
        // check if queryNum is a product in this table
        for (let m = 1; m <= maxMultiplier; m++) {
          if (tableNum * m === queryNum) return true;
        }
      }
      return false;
    });
  }, [tablesList, selectedSingleTable, searchTerm, maxMultiplier]);

  const handleCopyTable = (tableNum: number) => {
    const lines: string[] = [];
    for (let m = 1; m <= maxMultiplier; m++) {
      lines.push(`${tableNum} × ${m} = ${tableNum * m}`);
    }
    const text = `Multiplication Table of ${tableNum}:\n` + lines.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      soundFx.playPop(1.2);
      setCopiedTable(tableNum);
      setTimeout(() => setCopiedTable(null), 2000);
    });
  };

  const setPresetRange = (start: number, end: number) => {
    soundFx.playPop(1);
    setStartTable(start);
    setEndTable(end);
    setSelectedSingleTable(null);
  };

  return (
    <div className="space-y-6 w-full min-w-full">
      {/* Header & Controls Banner */}
      <div
        className={`p-5 rounded-2xl border transition-colors shadow-xs ${
          darkMode
            ? 'bg-[#23231F] border-[#383832] text-[#E8E6DF]'
            : 'bg-white border-[#E8E4DE] text-[#4A4A38]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-serif font-semibold text-base sm:text-lg">
              <div
                className={`p-1.5 rounded-xl ${
                  darkMode ? 'bg-[#33332B] text-[#C29B38]' : 'bg-[#F2EFE9] text-[#5A5A40]'
                }`}
              >
                <Table className="w-5 h-5" />
              </div>
              <h2 className={darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'}>
                Multiplication Tables (1 to {endTable > 20 ? endTable : '20+'})
              </h2>
              <span
                className={`text-[11px] font-sans font-bold px-2 py-0.5 rounded-full border ${
                  darkMode
                    ? 'bg-[#2E2E28] text-[#A3B18A] border-[#44443A]'
                    : 'bg-[#F2EFE9] text-[#5A5A40] border-[#E8E4DE]'
                }`}
              >
                Customizable
              </span>
            </div>
            <p
              className={`text-xs sm:text-sm mt-1 font-sans ${
                darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
              }`}
            >
              Explore standard times tables from 1 to 20 or customize any table range and multiplier depth.
            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-xs font-semibold font-sans mr-1 ${
                darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
              }`}
            >
              Presets:
            </span>
            <button
              onClick={() => setPresetRange(1, 10)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer border ${
                startTable === 1 && endTable === 10 && selectedSingleTable === null
                  ? darkMode
                    ? 'bg-[#A3B18A] text-[#181816] border-[#A3B18A]'
                    : 'bg-[#5A5A40] text-[#FAF8F5] border-[#5A5A40]'
                  : darkMode
                  ? 'bg-[#181816] hover:bg-[#2A2A24] text-[#E8E6DF] border-[#383832]'
                  : 'bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#4A4A38] border-[#E8E4DE]'
              }`}
            >
              Tables 1–10
            </button>
            <button
              onClick={() => setPresetRange(1, 20)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer border ${
                startTable === 1 && endTable === 20 && selectedSingleTable === null
                  ? darkMode
                    ? 'bg-[#A3B18A] text-[#181816] border-[#A3B18A]'
                    : 'bg-[#5A5A40] text-[#FAF8F5] border-[#5A5A40]'
                  : darkMode
                  ? 'bg-[#181816] hover:bg-[#2A2A24] text-[#E8E6DF] border-[#383832]'
                  : 'bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#4A4A38] border-[#E8E4DE]'
              }`}
            >
              Tables 1–20 (Default)
            </button>
            <button
              onClick={() => setPresetRange(1, 30)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer border ${
                startTable === 1 && endTable === 30 && selectedSingleTable === null
                  ? darkMode
                    ? 'bg-[#A3B18A] text-[#181816] border-[#A3B18A]'
                    : 'bg-[#5A5A40] text-[#FAF8F5] border-[#5A5A40]'
                  : darkMode
                  ? 'bg-[#181816] hover:bg-[#2A2A24] text-[#E8E6DF] border-[#383832]'
                  : 'bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#4A4A38] border-[#E8E4DE]'
              }`}
            >
              Tables 1–30
            </button>
            <button
              onClick={() => {
                soundFx.playPop(1);
                setShowSettings(!showSettings);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer border ${
                showSettings
                  ? darkMode
                    ? 'bg-[#33332B] text-[#C29B38] border-[#C29B38]'
                    : 'bg-[#E8E4DE] text-[#4A4A38] border-[#5A5A40]'
                  : darkMode
                  ? 'bg-[#181816] hover:bg-[#2A2A24] text-[#E8E6DF] border-[#383832]'
                  : 'bg-[#FAF8F5] hover:bg-[#F2EFE9] text-[#4A4A38] border-[#E8E4DE]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
          </div>
        </div>

        {/* Customization Options Bar */}
        {showSettings && (
          <div
            className={`mt-4 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-sans ${
              darkMode ? 'border-[#383832]' : 'border-[#E8E4DE]'
            }`}
          >
            <div>
              <label
                className={`block font-semibold mb-1 ${
                  darkMode ? 'text-[#9E9B90]' : 'text-[#5A5A40]'
                }`}
              >
                Start Table (From Table #):
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={startTable}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1) setStartTable(val);
                }}
                className={`w-full px-3 py-2 rounded-xl border font-mono-num ${
                  darkMode
                    ? 'bg-[#181816] border-[#383832] text-[#E8E6DF]'
                    : 'bg-white border-[#E8E4DE] text-[#4A4A38]'
                }`}
              />
            </div>
            <div>
              <label
                className={`block font-semibold mb-1 ${
                  darkMode ? 'text-[#9E9B90]' : 'text-[#5A5A40]'
                }`}
              >
                End Table (To Table #):
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={endTable}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val) && val >= 1) setEndTable(val);
                }}
                className={`w-full px-3 py-2 rounded-xl border font-mono-num ${
                  darkMode
                    ? 'bg-[#181816] border-[#383832] text-[#E8E6DF]'
                    : 'bg-white border-[#E8E4DE] text-[#4A4A38]'
                }`}
              />
            </div>
            <div>
              <label
                className={`block font-semibold mb-1 ${
                  darkMode ? 'text-[#9E9B90]' : 'text-[#5A5A40]'
                }`}
              >
                Multiplier Depth (Rows per table):
              </label>
              <select
                value={maxMultiplier}
                onChange={(e) => setMaxMultiplier(parseInt(e.target.value, 10))}
                className={`w-full px-3 py-2 rounded-xl border font-sans font-medium cursor-pointer ${
                  darkMode
                    ? 'bg-[#181816] border-[#383832] text-[#E8E6DF]'
                    : 'bg-white border-[#E8E4DE] text-[#4A4A38]'
                }`}
              >
                <option value={10}>Up to × 10 (Standard)</option>
                <option value={12}>Up to × 12 (Classic)</option>
                <option value={15}>Up to × 15</option>
                <option value={20}>Up to × 20 (Extended)</option>
                <option value={25}>Up to × 25</option>
              </select>
            </div>
            <div>
              <label
                className={`block font-semibold mb-1 ${
                  darkMode ? 'text-[#9E9B90]' : 'text-[#5A5A40]'
                }`}
              >
                Focus on Single Table:
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  placeholder="e.g. 7, 24, 99"
                  value={selectedSingleTable ?? ''}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setSelectedSingleTable(isNaN(val) ? null : val);
                  }}
                  className={`w-full px-3 py-2 rounded-xl border font-mono-num ${
                    darkMode
                      ? 'bg-[#181816] border-[#383832] text-[#E8E6DF]'
                      : 'bg-white border-[#E8E4DE] text-[#4A4A38]'
                  }`}
                />
                {selectedSingleTable !== null && (
                  <button
                    onClick={() => setSelectedSingleTable(null)}
                    className={`p-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                      darkMode
                        ? 'bg-[#181816] border-[#383832] text-[#9E9B90]'
                        : 'bg-[#F2EFE9] border-[#E8E4DE] text-[#4A4A38]'
                    }`}
                    title="Clear single focus"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filter / Search within Tables */}
        <div
          className={`mt-4 pt-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
            darkMode ? 'border-[#383832]' : 'border-[#E8E4DE]'
          }`}
        >
          <div className="relative w-full sm:max-w-xs">
            <Search
              className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 ${
                darkMode ? 'text-[#7A776E]' : 'text-[#9A948C]'
              }`}
            />
            <input
              type="text"
              placeholder="Search table or product (e.g. 56)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs font-sans ${
                darkMode
                  ? 'bg-[#181816] border-[#383832] text-[#E8E6DF] placeholder-[#7A776E]'
                  : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#4A4A38] placeholder-[#9A948C]'
              }`}
            />
          </div>

          <div
            className={`text-xs font-sans font-medium ${
              darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
            }`}
          >
            Displaying{' '}
            <strong className={darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'}>
              {filteredTables.length}
            </strong>{' '}
            multiplication tables (depth ×{maxMultiplier})
          </div>
        </div>
      </div>

      {/* Grid of Multiplication Tables */}
      {filteredTables.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full min-w-full">
          {filteredTables.map((tableNum) => {
            const isCopied = copiedTable === tableNum;

            return (
              <div
                key={tableNum}
                className={`rounded-2xl border transition-all duration-200 shadow-xs flex flex-col overflow-hidden ${
                  darkMode
                    ? 'bg-[#23231F] border-[#383832] hover:border-[#5A5A48]'
                    : 'bg-white border-[#E8E4DE] hover:border-[#C4BEB2]'
                }`}
              >
                {/* Table Header Card */}
                <div
                  className={`p-3.5 border-b flex items-center justify-between ${
                    darkMode
                      ? 'bg-[#1C1C18] border-[#383832]'
                      : 'bg-[#FAF8F5] border-[#E8E4DE]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        soundFx.playPop(1.1);
                        onSelectNumber(tableNum);
                      }}
                      className={`font-serif font-bold text-base hover:underline cursor-pointer flex items-center gap-1 ${
                        darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                      }`}
                      title={`Inspect factors and details of number ${tableNum}`}
                    >
                      <span>Table of {tableNum}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleCopyTable(tableNum)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-sans font-semibold border transition-colors cursor-pointer ${
                      isCopied
                        ? darkMode
                          ? 'bg-[#33332B] text-[#A3B18A] border-[#A3B18A]'
                          : 'bg-[#FAF8F5] text-[#6E7A5A] border-[#6E7A5A]'
                        : darkMode
                        ? 'bg-[#23231F] hover:bg-[#2E2E28] text-[#E8E6DF] border-[#383832]'
                        : 'bg-white hover:bg-[#F2EFE9] text-[#4A4A38] border-[#E8E4DE]'
                    }`}
                    title="Copy full table equations"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3 h-3 text-[#A3B18A]" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[#9A948C]" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Table Rows */}
                <div className="p-3.5 space-y-1.5 font-mono-num text-xs flex-1">
                  {Array.from({ length: maxMultiplier }, (_, idx) => idx + 1).map((m) => {
                    const product = tableNum * m;
                    const isSquare = tableNum === m;
                    const isMatchedProduct =
                      searchTerm.trim() && product.toString() === searchTerm.trim();

                    return (
                      <div
                        key={m}
                        onClick={() => {
                          soundFx.playPop(1);
                          onSelectNumber(product);
                        }}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer group ${
                          isMatchedProduct
                            ? darkMode
                              ? 'bg-[#3E3A24] border-[#C29B38] text-[#FAF8F5]'
                              : 'bg-[#FFF9E6] border-[#D4A373] text-[#4A4A38]'
                            : isSquare
                            ? darkMode
                              ? 'bg-[#2A2922] border-[#4E4A35] text-[#FAF8F5]'
                              : 'bg-[#FAF8F5] border-[#D8D2C7] text-[#4A4A38]'
                            : darkMode
                            ? 'bg-[#1C1C18]/60 hover:bg-[#2A2A24] border-[#2E2E28] text-[#D8D5CC]'
                            : 'bg-[#FAF8F5]/60 hover:bg-[#F2EFE9] border-[#EFECE6] text-[#4A4A38]'
                        }`}
                        title={`Click to inspect product number ${product}`}
                      >
                        <span className="font-medium text-[11px] sm:text-xs">
                          <span className={darkMode ? 'text-[#E8E6DF]' : 'text-[#4A4A38]'}>
                            {tableNum}
                          </span>
                          <span className="text-[#9A948C] mx-1">×</span>
                          <span className={darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'}>
                            {m}
                          </span>
                        </span>
                        <div className="flex items-center gap-1">
                          <span
                            className={`font-bold ${
                              isSquare
                                ? darkMode
                                  ? 'text-[#C29B38]'
                                  : 'text-[#8C7348]'
                                : darkMode
                                ? 'text-[#A3B18A]'
                                : 'text-[#6E7A5A]'
                            }`}
                          >
                            = {product}
                          </span>
                          {isSquare && (
                            <span className="text-[10px] text-[#C29B38]" title="Perfect Square">
                              ★
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Table Card Action */}
                <div
                  className={`p-2.5 border-t text-center ${
                    darkMode ? 'bg-[#1C1C18] border-[#383832]' : 'bg-[#FAF8F5] border-[#E8E4DE]'
                  }`}
                >
                  <button
                    onClick={() => {
                      soundFx.playPop(1);
                      onSelectNumber(tableNum);
                    }}
                    className={`w-full py-1 rounded-lg text-[11px] font-sans font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                      darkMode
                        ? 'text-[#A3B18A] hover:bg-[#23231F]'
                        : 'text-[#5A5A40] hover:bg-[#F2EFE9]'
                    }`}
                  >
                    <span>View All Factors of {tableNum}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className={`text-center py-16 rounded-2xl border space-y-3 font-sans ${
            darkMode
              ? 'bg-[#23231F] border-[#383832] text-[#E8E6DF]'
              : 'bg-white border-[#E8E4DE] text-[#4A4A38]'
          }`}
        >
          <BookOpen className="w-10 h-10 text-[#9A948C] mx-auto" />
          <h3 className="text-base font-serif font-semibold">No multiplication tables found</h3>
          <p className="text-xs text-[#9A948C] max-w-sm mx-auto">
            Try adjusting your search criteria or resetting the table range to 1–20.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSingleTable(null);
              setPresetRange(1, 20);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition-colors ${
              darkMode
                ? 'bg-[#181816] text-[#E8E6DF] border-[#383832] hover:bg-[#2A2A24]'
                : 'bg-[#F2EFE9] text-[#4A4A38] border-[#E8E4DE] hover:bg-[#E8E4DE]'
            }`}
          >
            Reset to Tables 1–20
          </button>
        </div>
      )}
    </div>
  );
};
