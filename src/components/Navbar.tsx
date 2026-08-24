import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Volume2,
  VolumeX,
  Grid3X3,
  Table,
  Zap,
  Table2,
  Trophy,
  Dices,
  CloudUpload,
  Moon,
  Sun,
} from 'lucide-react';
import { AppViewMode } from '../types';
import { soundFx } from '../utils/mathUtils';

interface NavbarProps {
  viewMode: AppViewMode;
  setViewMode: (mode: AppViewMode) => void;
  onSelectNumber: (num: number) => void;
  onOpenNetlifyModal: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  viewMode,
  setViewMode,
  onSelectNumber,
  onOpenNetlifyModal,
  soundEnabled,
  setSoundEnabled,
  darkMode,
  setDarkMode,
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(searchInput.trim(), 10);
    if (!isNaN(parsed) && parsed > 0) {
      soundFx.playPop(1.2);
      onSelectNumber(parsed);
      setSearchInput('');
    }
  };

  const handleRandomNumber = () => {
    const random = Math.floor(Math.random() * 100) + 1;
    soundFx.playPop(1.1);
    onSelectNumber(random);
  };

  const toggleSound = () => {
    soundFx.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) {
      soundFx.playPop(1);
    }
  };

  const toggleDarkMode = () => {
    soundFx.playPop(1.2);
    setDarkMode(!darkMode);
  };

  return (
    <header
      className={`sticky top-0 z-30 border-b backdrop-blur-md transition-colors ${
        darkMode
          ? 'bg-[#181816]/90 border-[#383832]'
          : 'bg-[#FAF8F5]/90 border-[#E8E4DE]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2 sm:gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shadow-sm font-serif font-bold text-lg sm:text-xl ring-2 transition-colors ${
              darkMode
                ? 'bg-[#33332B] text-[#C29B38] ring-[#444438]'
                : 'bg-[#5A5A40] text-[#FAF8F5] ring-[#E8E4DE]'
            }`}
          >
            ℕ
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1
                className={`text-lg sm:text-2xl font-semibold tracking-tight italic font-serif transition-colors ${
                  darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                }`}
              >
                Arithmetica
              </h1>
              <span
                className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-sans font-bold border ${
                  darkMode
                    ? 'bg-[#282822] text-[#A3B18A] border-[#383832]'
                    : 'bg-[#F2EFE9] text-[#5A5A40] border-[#E8E4DE]'
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#A3B18A]" />
                Tables &amp; Factors
              </span>
            </div>
            <p
              className={`text-[10px] sm:text-[11px] uppercase tracking-widest font-sans font-medium hidden sm:block ${
                darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
              }`}
            >
              Natural Numbers &amp; Multiplication Suite
            </p>
          </div>
        </div>

        {/* Search Jump Input */}
        <form onSubmit={handleSearchSubmit} className="hidden xl:flex items-center max-w-xs w-full">
          <div className="relative w-full">
            <Search
              className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                darkMode ? 'text-[#7A776E]' : 'text-[#9A948C]'
              }`}
            />
            <input
              id="navbar-quick-jump-input"
              type="number"
              min="1"
              max="10000000"
              placeholder="Jump to number..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className={`w-full rounded-xl pl-9 pr-14 py-2 text-sm font-sans shadow-sm focus:outline-none transition-colors ${
                darkMode
                  ? 'bg-[#23231F] border border-[#383832] text-[#E8E6DF] placeholder-[#7A776E] focus:border-[#C29B38]'
                  : 'bg-white border border-[#E8E4DE] text-[#4A4A38] placeholder-[#9A948C] focus:border-[#5A5A40]'
              }`}
            />
            <button
              type="submit"
              className={`absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-xs font-sans font-semibold rounded-lg transition-colors cursor-pointer ${
                darkMode
                  ? 'bg-[#33332B] hover:bg-[#444438] text-[#FAF8F5]'
                  : 'bg-[#5A5A40] hover:bg-[#4A4A38] text-[#FAF8F5]'
              }`}
            >
              Go
            </button>
          </div>
        </form>

        {/* Controls & Mode Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* View Mode Pills with Tables & Revision */}
          <div
            className={`flex items-center border rounded-xl p-1 shadow-inner overflow-x-auto no-scrollbar ${
              darkMode
                ? 'bg-[#23231F] border-[#383832]'
                : 'bg-[#F2EFE9] border-[#E8E4DE]'
            }`}
          >
            {/* 1. Numbers Grid */}
            <button
              id="view-mode-grid-btn"
              onClick={() => {
                soundFx.playPop(1);
                setViewMode('grid');
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'grid'
                  ? darkMode
                    ? 'bg-[#A3B18A] text-[#181816] shadow-sm'
                    : 'bg-[#5A5A40] text-[#FAF8F5] shadow-sm'
                  : darkMode
                  ? 'text-[#D8D5CC] opacity-80 hover:opacity-100 hover:bg-[#2A2A24]'
                  : 'text-[#4A4A38] opacity-75 hover:opacity-100 hover:bg-white/60'
              }`}
              title="Natural Numbers Grid & Explorers"
            >
              <Grid3X3 className="w-3.5 h-3.5" />
              <span>Numbers</span>
            </button>

            {/* 2. Tables Button (1 to 20 & customizable) */}
            <button
              id="view-mode-tables-btn"
              onClick={() => {
                soundFx.playPop(1);
                setViewMode('tables');
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'tables'
                  ? darkMode
                    ? 'bg-[#A3B18A] text-[#181816] shadow-sm'
                    : 'bg-[#5A5A40] text-[#FAF8F5] shadow-sm'
                  : darkMode
                  ? 'text-[#D8D5CC] opacity-80 hover:opacity-100 hover:bg-[#2A2A24]'
                  : 'text-[#4A4A38] opacity-75 hover:opacity-100 hover:bg-white/60'
              }`}
              title="Multiplication Tables 1 to 20"
            >
              <Table className="w-3.5 h-3.5" />
              <span>Tables</span>
            </button>

            {/* 3. Revision Mode Button */}
            <button
              id="view-mode-revision-btn"
              onClick={() => {
                soundFx.playPop(1.1);
                setViewMode('revision');
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'revision'
                  ? darkMode
                    ? 'bg-[#C29B38] text-[#181816] shadow-sm'
                    : 'bg-[#5A5A40] text-[#FAF8F5] shadow-sm'
                  : darkMode
                  ? 'text-[#D8D5CC] opacity-80 hover:opacity-100 hover:bg-[#2A2A24]'
                  : 'text-[#4A4A38] opacity-75 hover:opacity-100 hover:bg-white/60'
              }`}
              title="Quick Revision Mode (1–100 Factors Box)"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Revision</span>
            </button>

            {/* 4. Matrix Button */}
            <button
              id="view-mode-matrix-btn"
              onClick={() => {
                soundFx.playPop(1);
                setViewMode('matrix');
              }}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'matrix'
                  ? darkMode
                    ? 'bg-[#A3B18A] text-[#181816] shadow-sm'
                    : 'bg-[#5A5A40] text-[#FAF8F5] shadow-sm'
                  : darkMode
                  ? 'text-[#D8D5CC] opacity-80 hover:opacity-100 hover:bg-[#2A2A24]'
                  : 'text-[#4A4A38] opacity-75 hover:opacity-100 hover:bg-white/60'
              }`}
              title="Times Table Multiplication Matrix"
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Matrix</span>
            </button>

            {/* 5. Quiz Button */}
            <button
              id="view-mode-quiz-btn"
              onClick={() => {
                soundFx.playPop(1.1);
                setViewMode('quiz');
              }}
              className={`hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-sans font-semibold transition-all cursor-pointer whitespace-nowrap ${
                viewMode === 'quiz'
                  ? darkMode
                    ? 'bg-[#A3B18A] text-[#181816] shadow-sm'
                    : 'bg-[#5A5A40] text-[#FAF8F5] shadow-sm'
                  : darkMode
                  ? 'text-[#D8D5CC] opacity-80 hover:opacity-100 hover:bg-[#2A2A24]'
                  : 'text-[#4A4A38] opacity-75 hover:opacity-100 hover:bg-white/60'
              }`}
              title="Practice Factor Quiz"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Quiz</span>
            </button>
          </div>

          {/* Dark Mode Toggle ("nork mode" / default is white) */}
          <button
            id="dark-mode-toggle-btn"
            onClick={toggleDarkMode}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
              darkMode
                ? 'bg-[#2A2A24] border-[#444438] text-[#C29B38] hover:bg-[#34342C]'
                : 'bg-white border-[#E8E4DE] text-[#4A4A38] hover:bg-[#F2EFE9]'
            }`}
            title={darkMode ? 'Switch to Light Mode (Default)' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Random Number */}
          <button
            id="random-number-dice-btn"
            onClick={handleRandomNumber}
            className={`p-2 sm:p-2.5 rounded-xl border transition-colors cursor-pointer shadow-xs ${
              darkMode
                ? 'bg-[#23231F] border-[#383832] text-[#D8D5CC] hover:bg-[#2A2A24]'
                : 'bg-white border-[#E8E4DE] text-[#4A4A38] hover:bg-[#F2EFE9]'
            }`}
            title="Inspect Random Number"
          >
            <Dices className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={toggleSound}
            className={`p-2 sm:p-2.5 rounded-xl border transition-colors cursor-pointer shadow-xs ${
              soundEnabled
                ? darkMode
                  ? 'bg-[#23231F] border-[#383832] text-[#A3B18A]'
                  : 'bg-white border-[#E8E4DE] text-[#5A5A40]'
                : darkMode
                ? 'bg-[#1C1C18] border-[#383832] text-[#7A776E]'
                : 'bg-[#F2EFE9] border-[#E8E4DE] text-[#9A948C]'
            }`}
            title={soundEnabled ? 'Mute Sounds' : 'Enable Audio Chimes'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Netlify Deploy Guide Trigger */}
          <button
            id="netlify-deploy-trigger-btn"
            onClick={onOpenNetlifyModal}
            className={`hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-sans font-semibold border transition-all cursor-pointer shadow-xs ${
              darkMode
                ? 'bg-[#23231F] text-[#E8E6DF] border-[#383832] hover:bg-[#2A2A24]'
                : 'bg-white text-[#4A4A38] border-[#E8E4DE] hover:bg-[#F2EFE9]'
            }`}
            title="How to host on Netlify"
          >
            <CloudUpload className="w-3.5 h-3.5 text-[#A3B18A]" />
            <span>Deploy</span>
          </button>
        </div>
      </div>
    </header>
  );
};
