import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Flame,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { getNumberDetail, soundFx } from '../utils/mathUtils';

interface QuizQuestion {
  targetNumber: number;
  correctPairs: string[]; // e.g. ["8 × 8", "4 × 16", "2 × 32", "1 × 64"]
  options: { text: string; isCorrect: boolean; id: string }[];
}

const QUIZ_NUMBERS = [12, 16, 18, 20, 24, 27, 32, 36, 40, 48, 54, 60, 64, 72, 80, 81, 96, 100];

function generateQuestion(): QuizQuestion {
  const target = QUIZ_NUMBERS[Math.floor(Math.random() * QUIZ_NUMBERS.length)];
  const detail = getNumberDetail(target);

  const correctPairs = detail.factorPairs.map(p => `${p.a} × ${p.b}`);
  
  // Pick 2-3 correct pairs
  const pickedCorrect = [...correctPairs].sort(() => 0.5 - Math.random()).slice(0, Math.min(2, correctPairs.length));
  
  // Generate plausible incorrect distractors
  const distractors: string[] = [];
  while (distractors.length < 4) {
    const a = Math.floor(Math.random() * 12) + 2;
    const b = Math.floor(Math.random() * 15) + 2;
    const formula = `${Math.min(a, b)} × ${Math.max(a, b)}`;
    if (a * b !== target && !distractors.includes(formula) && !correctPairs.includes(formula)) {
      distractors.push(formula);
    }
  }

  const allOpts = [
    ...pickedCorrect.map(text => ({ text, isCorrect: true, id: Math.random().toString() })),
    ...distractors.slice(0, 4).map(text => ({ text, isCorrect: false, id: Math.random().toString() })),
  ].sort(() => 0.5 - Math.random());

  return {
    targetNumber: target,
    correctPairs,
    options: allOpts,
  };
}

interface FactorQuizGameProps {
  onInspectNumber: (num: number) => void;
  darkMode?: boolean;
}

export const FactorQuizGame: React.FC<FactorQuizGameProps> = ({
  onInspectNumber,
  darkMode = false,
}) => {
  const [question, setQuestion] = useState<QuizQuestion>(generateQuestion());
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const nextQuestion = () => {
    setSelectedIds([]);
    setIsAnswered(false);
    setQuestion(generateQuestion());
    soundFx.playPop(1);
  };

  const handleOptionClick = (opt: { text: string; isCorrect: boolean; id: string }) => {
    if (isAnswered) return;

    const nextSelected = selectedIds.includes(opt.id)
      ? selectedIds.filter((id) => id !== opt.id)
      : [...selectedIds, opt.id];

    setSelectedIds(nextSelected);
    soundFx.playPop(0.95 + nextSelected.length * 0.05);
  };

  const handleSubmit = () => {
    if (isAnswered || selectedIds.length === 0) return;
    setIsAnswered(true);

    const chosenOpts = question.options.filter((o) => selectedIds.includes(o.id));
    const totalCorrectOpts = question.options.filter((o) => o.isCorrect);
    const allChosenAreCorrect = chosenOpts.every((o) => o.isCorrect);
    const allCorrectAreChosen = chosenOpts.length === totalCorrectOpts.length;

    if (allChosenAreCorrect && allCorrectAreChosen && chosenOpts.length > 0) {
      soundFx.playSuccess();
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBestStreak((prev) => Math.max(prev, newStreak));
      setScore((prev) => prev + 10 * Math.min(newStreak, 5));

      if (newStreak % 3 === 0) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } else {
      soundFx.playPop(0.6);
      setStreak(0);
    }
  };

  const isUserCorrect =
    isAnswered &&
    question.options.filter((o) => selectedIds.includes(o.id)).every((o) => o.isCorrect) &&
    question.options.filter((o) => selectedIds.includes(o.id)).length ===
      question.options.filter((o) => o.isCorrect).length &&
    question.options.filter((o) => o.isCorrect).length > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 shadow-xs transition-colors ${
            darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
          }`}
        >
          <div
            className={`p-2.5 rounded-xl ${
              darkMode ? 'bg-[#33332B] text-[#C29B38]' : 'bg-[#F2EFE9] text-[#5A5A40]'
            }`}
          >
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <span
              className={`text-xs uppercase font-semibold ${
                darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
              }`}
            >
              Score
            </span>
            <div
              className={`text-2xl font-bold font-mono-num ${
                darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
              }`}
            >
              {score}
            </div>
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 shadow-xs transition-colors ${
            darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
          }`}
        >
          <div
            className={`p-2.5 rounded-xl ${
              darkMode ? 'bg-[#382E20] text-[#D4A373]' : 'bg-[#F2EFE9] text-[#8C7348]'
            }`}
          >
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span
              className={`text-xs uppercase font-semibold ${
                darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
              }`}
            >
              Streak
            </span>
            <div
              className={`text-2xl font-bold font-mono-num ${
                darkMode ? 'text-[#D4A373]' : 'text-[#8C7348]'
              }`}
            >
              {streak} <span className="text-xs font-normal">🔥</span>
            </div>
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 shadow-xs transition-colors ${
            darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
          }`}
        >
          <div
            className={`p-2.5 rounded-xl ${
              darkMode ? 'bg-[#222E23] text-[#A3B18A]' : 'bg-[#F2EFE9] text-[#6E7A5A]'
            }`}
          >
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span
              className={`text-xs uppercase font-semibold ${
                darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
              }`}
            >
              Best Streak
            </span>
            <div
              className={`text-2xl font-bold font-mono-num ${
                darkMode ? 'text-[#A3B18A]' : 'text-[#6E7A5A]'
              }`}
            >
              {bestStreak}
            </div>
          </div>
        </div>
      </div>

      {/* Main Quiz Card */}
      <div
        className={`p-6 sm:p-8 rounded-2xl border shadow-xs space-y-6 text-center transition-colors ${
          darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
        }`}
      >
        <div>
          <span
            className={`text-xs uppercase font-bold tracking-widest ${
              darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
            }`}
          >
            Find the Multiplication Factor Pairs
          </span>
          <div
            className={`mt-2 text-5xl sm:text-6xl font-serif font-bold italic ${
              darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
            }`}
          >
            {question.targetNumber}
          </div>
          <p
            className={`text-xs sm:text-sm mt-2 ${
              darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
            }`}
          >
            Select all multiplication pairs below that multiply to{' '}
            <strong className={darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'}>
              {question.targetNumber}
            </strong>
            .
          </p>
        </div>

        {/* Options grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {question.options.map((opt) => {
            const isSelected = selectedIds.includes(opt.id);
            let stateStyle = darkMode
              ? 'bg-[#181816] border-[#383832] text-[#E8E6DF] hover:border-[#555548] hover:bg-[#282822]'
              : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#4A4A38] hover:border-[#D8D2C7] hover:bg-[#F2EFE9]';

            if (!isAnswered) {
              if (isSelected) {
                stateStyle = darkMode
                  ? 'bg-[#33332B] border-[#C29B38] text-[#FAF8F5] ring-2 ring-[#C29B38]/40 shadow-xs font-bold'
                  : 'bg-[#F2EFE9] border-[#5A5A40] text-[#5A5A40] ring-2 ring-[#5A5A40]/30 shadow-xs font-bold';
              }
            } else {
              if (opt.isCorrect) {
                stateStyle = darkMode
                  ? 'bg-[#1C261E] border-[#A3B18A] text-[#A3B18A] font-bold shadow-xs'
                  : 'bg-[#F2EFE9] border-[#6E7A5A] text-[#6E7A5A] font-bold shadow-xs';
              } else if (isSelected && !opt.isCorrect) {
                stateStyle = darkMode
                  ? 'bg-[#2E201E] border-[#D4A373] text-[#D4A373] shadow-xs'
                  : 'bg-[#F2EFE9] border-[#9C6A5A] text-[#9C6A5A] shadow-xs';
              } else {
                stateStyle = darkMode
                  ? 'bg-[#181816] border-[#2A2A24] text-[#66645E] opacity-40'
                  : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#9A948C] opacity-40';
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleOptionClick(opt)}
                disabled={isAnswered}
                className={`p-4 rounded-xl border font-mono-num text-base sm:text-lg font-semibold transition-all cursor-pointer ${stateStyle}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>{opt.text}</span>
                  {isAnswered && opt.isCorrect && (
                    <CheckCircle2
                      className={`w-4 h-4 ${darkMode ? 'text-[#A3B18A]' : 'text-[#6E7A5A]'}`}
                    />
                  )}
                  {isAnswered && isSelected && !opt.isCorrect && (
                    <XCircle
                      className={`w-4 h-4 ${darkMode ? 'text-[#D4A373]' : 'text-[#9C6A5A]'}`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Action button & Feedback */}
        <div
          className={`pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            darkMode ? 'border-[#383832]' : 'border-[#E8E4DE]'
          }`}
        >
          <button
            onClick={() => onInspectNumber(question.targetNumber)}
            className={`flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              darkMode ? 'text-[#9E9B90] hover:text-[#A3B18A]' : 'text-[#9A948C] hover:text-[#5A5A40]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Inspect Factor Table for {question.targetNumber}</span>
          </button>

          {!isAnswered ? (
            <button
              onClick={handleSubmit}
              disabled={selectedIds.length === 0}
              className={`px-6 py-2.5 rounded-xl disabled:opacity-40 disabled:pointer-events-none font-semibold text-sm shadow-xs transition-all cursor-pointer ${
                darkMode
                  ? 'bg-[#C29B38] hover:bg-[#D4A373] text-[#181816]'
                  : 'bg-[#5A5A40] hover:bg-[#4A4A38] text-[#FAF8F5]'
              }`}
            >
              Check Answer ({selectedIds.length} chosen)
            </button>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <span
                className={`text-sm font-bold ${
                  isUserCorrect
                    ? darkMode
                      ? 'text-[#A3B18A]'
                      : 'text-[#6E7A5A]'
                    : darkMode
                    ? 'text-[#D4A373]'
                    : 'text-[#9C6A5A]'
                }`}
              >
                {isUserCorrect ? 'Correct Factor Pairs!' : 'Not quite right!'}
              </span>
              <button
                onClick={nextQuestion}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm transition-all cursor-pointer shadow-xs ${
                  darkMode
                    ? 'bg-[#C29B38] hover:bg-[#D4A373] text-[#181816]'
                    : 'bg-[#5A5A40] hover:bg-[#4A4A38] text-[#FAF8F5]'
                }`}
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
