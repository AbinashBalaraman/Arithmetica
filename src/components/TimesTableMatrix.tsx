import React, { useState } from 'react';
import { Sparkles, Info } from 'lucide-react';
import { soundFx } from '../utils/mathUtils';

interface TimesTableMatrixProps {
  onSelectNumber: (num: number) => void;
  darkMode?: boolean;
}

export const TimesTableMatrix: React.FC<TimesTableMatrixProps> = ({
  onSelectNumber,
  darkMode = false,
}) => {
  const [matrixSize, setMatrixSize] = useState<number>(12);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const numbers = Array.from({ length: matrixSize }, (_, i) => i + 1);

  const handleCellClick = (r: number, c: number) => {
    const product = r * c;
    soundFx.playPop(1 + (product % 10) * 0.05);
    onSelectNumber(product);
  };

  return (
    <div
      className={`rounded-2xl p-4 sm:p-6 shadow-xs space-y-5 font-sans border transition-colors ${
        darkMode
          ? 'bg-[#23231F] border-[#383832] text-[#E8E6DF]'
          : 'bg-white border-[#E8E4DE] text-[#4A4A38]'
      }`}
    >
      {/* Header with size toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2
              className={`text-xl font-serif font-semibold tracking-tight ${
                darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
              }`}
            >
              Pythagorean Multiplication Matrix
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                darkMode
                  ? 'bg-[#2E2E28] text-[#A3B18A] border-[#44443A]'
                  : 'bg-[#F2EFE9] text-[#5A5A40] border-[#E8E4DE]'
              }`}
            >
              {matrixSize}×{matrixSize} Grid
            </span>
          </div>
          <p
            className={`text-xs sm:text-sm font-sans mt-0.5 ${
              darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
            }`}
          >
            Hover over any intersection to trace coordinates. Click any cell to inspect its full factor breakdown!
          </p>
        </div>

        {/* Size switcher */}
        <div
          className={`flex items-center gap-1 p-1 rounded-xl border self-start sm:self-auto font-sans ${
            darkMode
              ? 'bg-[#181816] border-[#383832]'
              : 'bg-[#F2EFE9] border-[#E8E4DE]'
          }`}
        >
          <span
            className={`text-xs font-semibold px-2 ${
              darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
            }`}
          >
            Size:
          </span>
          {[10, 12, 15, 20].map((sz) => (
            <button
              key={sz}
              onClick={() => {
                soundFx.playPop(1);
                setMatrixSize(sz);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                matrixSize === sz
                  ? darkMode
                    ? 'bg-[#A3B18A] text-[#181816] shadow-xs'
                    : 'bg-[#5A5A40] text-[#FAF8F5] shadow-xs'
                  : darkMode
                  ? 'text-[#D8D5CC] hover:text-[#FAF8F5]'
                  : 'text-[#4A4A38] hover:text-black'
              }`}
            >
              {sz}×{sz}
            </button>
          ))}
        </div>
      </div>

      {/* Hover preview bar (Fixed layout height to prevent table jump & flicker) */}
      <div
        className={`flex items-center justify-between p-3.5 min-h-[52px] rounded-xl border transition-colors ${
          darkMode
            ? 'bg-[#181816] border-[#383832]'
            : 'bg-[#FAF8F5] border-[#E8E4DE]'
        }`}
      >
        {hoveredRow && hoveredCol ? (
          <div className="flex items-center gap-2 font-sans flex-wrap">
            <Sparkles
              className={`w-4 h-4 shrink-0 ${darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'}`}
            />
            <span
              className={`text-xs sm:text-sm font-medium ${
                darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
              }`}
            >
              Coordinate:
            </span>
            <span
              className={`text-sm sm:text-base font-bold font-mono-num ${
                darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
              }`}
            >
              {hoveredRow} × {hoveredCol} = {hoveredRow * hoveredCol}
            </span>
            {hoveredRow === hoveredCol && (
              <span
                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${
                  darkMode
                    ? 'bg-[#3A382A] text-[#C29B38] border-[#C29B38]'
                    : 'bg-[#F2EFE9] text-[#8C7348] border-[#E8E4DE]'
                }`}
              >
                Square ({hoveredRow}²)
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 font-sans text-xs sm:text-sm opacity-70">
            <Sparkles className="w-4 h-4 text-[#A3B18A]" />
            <span>Hover over any row/column intersection to trace equations & products.</span>
          </div>
        )}

        <span
          className={`text-xs hidden md:inline font-sans ${
            darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
          }`}
        >
          Click cell to inspect full factor breakdown
        </span>
      </div>

      {/* Matrix Table */}
      <div
        className={`overflow-x-auto rounded-2xl border p-3 shadow-xs ${
          darkMode
            ? 'bg-[#181816] border-[#383832]'
            : 'bg-[#FAF8F5] border-[#E8E4DE]'
        }`}
      >
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full border-collapse text-center select-none font-mono-num">
          <thead>
            <tr>
              <th
                className={`p-2 text-xs font-bold border-b border-r sticky left-0 z-20 ${
                  darkMode
                    ? 'text-[#C29B38] border-[#383832] bg-[#23231F]'
                    : 'text-[#5A5A40] border-[#E8E4DE] bg-white'
                }`}
              >
                ×
              </th>
              {numbers.map((col) => (
                <th
                  key={col}
                  className={`p-2 min-w-[42px] text-xs font-bold border-b transition-colors ${
                    hoveredCol === col
                      ? darkMode
                        ? 'bg-[#33332B] text-[#FAF8F5] border-[#444438]'
                        : 'bg-[#E8E4DE] text-[#4A4A38] font-bold border-[#E8E4DE]'
                      : darkMode
                      ? 'text-[#9E9B90] bg-[#23231F] border-[#383832]'
                      : 'text-[#9A948C] bg-white border-[#E8E4DE]'
                  }`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {numbers.map((row) => (
              <tr key={row}>
                {/* Row Header */}
                <th
                  className={`p-2 text-xs font-bold border-r sticky left-0 z-10 transition-colors ${
                    hoveredRow === row
                      ? darkMode
                        ? 'bg-[#33332B] text-[#FAF8F5] border-[#444438]'
                        : 'bg-[#E8E4DE] text-[#4A4A38] font-bold border-[#E8E4DE]'
                      : darkMode
                      ? 'text-[#9E9B90] bg-[#23231F] border-[#383832]'
                      : 'text-[#9A948C] bg-white border-[#E8E4DE]'
                  }`}
                >
                  {row}
                </th>

                {/* Product Cells */}
                {numbers.map((col) => {
                  const product = row * col;
                  const isSquare = row === col;
                  const isHovered = hoveredRow === row && hoveredCol === col;
                  const isCrosshair = hoveredRow === row || hoveredCol === col;

                  return (
                    <td
                      key={col}
                      onMouseEnter={() => {
                        setHoveredRow(row);
                        setHoveredCol(col);
                      }}
                      onMouseLeave={() => {
                        setHoveredRow(null);
                        setHoveredCol(null);
                      }}
                      onClick={() => handleCellClick(row, col)}
                      className={`p-2 text-xs sm:text-sm font-medium border cursor-pointer transition-all ${
                        isHovered
                          ? darkMode
                            ? 'bg-[#C29B38] text-[#181816] font-black scale-110 shadow-md z-10 rounded-lg ring-2 ring-[#C29B38]/50'
                            : 'bg-[#5A5A40] text-[#FAF8F5] font-black scale-110 shadow-md z-10 rounded-lg ring-2 ring-[#5A5A40]/40'
                          : isSquare
                          ? darkMode
                            ? 'bg-[#2A2922] text-[#C29B38] font-bold hover:bg-[#343228] border-[#4E4A35]'
                            : 'bg-[#F2EFE9] text-[#8C7348] font-bold hover:bg-[#E8E4DE] border-[#E8E4DE]/60'
                          : isCrosshair
                          ? darkMode
                            ? 'bg-[#23231F] text-[#FAF8F5] border-[#383832]'
                            : 'bg-white text-[#4A4A38] border-[#E8E4DE]/60'
                          : darkMode
                          ? 'text-[#D8D5CC] hover:bg-[#282822] hover:text-[#C29B38] border-[#2A2A24]'
                          : 'text-[#4A4A38] hover:bg-white hover:text-[#5A5A40] border-[#E8E4DE]/60'
                      }`}
                      title={`${row} × ${col} = ${product} (Click to inspect)`}
                    >
                      {product}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Legend footer */}
      <div
        className={`flex flex-wrap items-center justify-between text-xs pt-2 border-t gap-3 font-sans ${
          darkMode ? 'border-[#383832] text-[#9E9B90]' : 'border-[#E8E4DE] text-[#9A948C]'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div
              className={`w-3.5 h-3.5 rounded-md border ${
                darkMode ? 'bg-[#2A2922] border-[#4E4A35]' : 'bg-[#F2EFE9] border-[#E8E4DE]'
              }`}
            />
            <span>Diagonal Perfect Squares ($x^2$)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className={`w-3.5 h-3.5 rounded-md font-bold flex items-center justify-center text-[9px] ${
                darkMode ? 'bg-[#C29B38] text-[#181816]' : 'bg-[#5A5A40] text-[#FAF8F5]'
              }`}
            >
              ★
            </div>
            <span>Selected Intersection</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5" />
          <span>Commutative property: a × b = b × a</span>
        </div>
      </div>
    </div>
  );
};
