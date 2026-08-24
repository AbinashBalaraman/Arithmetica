import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  CloudUpload,
  Check,
  Copy,
  Terminal,
  FolderArchive,
  Github,
  Sparkles,
} from 'lucide-react';
import { soundFx } from '../utils/mathUtils';

interface NetlifyDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export const NetlifyDeployModal: React.FC<NetlifyDeployModalProps> = ({
  isOpen,
  onClose,
  darkMode = false,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    soundFx.playSuccess();
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden z-10 my-auto p-6 space-y-6 transition-colors ${
          darkMode
            ? 'bg-[#1C1C18] border-[#383832] text-[#FAF8F5]'
            : 'bg-[#FAF8F5] border-[#E8E4DE] text-[#4A4A38]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
                darkMode
                  ? 'bg-[#23231F] border-[#383832] text-[#C29B38]'
                  : 'bg-[#F2EFE9] border-[#E8E4DE] text-[#5A5A40]'
              }`}
            >
              <CloudUpload className="w-5 h-5" />
            </div>
            <div>
              <h3
                className={`text-lg font-serif font-semibold flex items-center gap-2 ${
                  darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                }`}
              >
                Host on Netlify
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                    darkMode
                      ? 'bg-[#1C241D] text-[#A3B18A] border-[#2E3C2F]'
                      : 'bg-[#F2EFE9] text-[#6E7A5A] border-[#E8E4DE]'
                  }`}
                >
                  Ready
                </span>
              </h3>
              <p
                className={`text-xs font-sans ${
                  darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                }`}
              >
                This app is fully configured for static hosting with{' '}
                <code
                  className={`font-mono-num font-semibold ${
                    darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'
                  }`}
                >
                  netlify.toml
                </code>{' '}
                &amp;{' '}
                <code
                  className={`font-mono-num font-semibold ${
                    darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'
                  }`}
                >
                  _redirects
                </code>
                .
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              darkMode
                ? 'bg-[#23231F] hover:bg-[#2C2C26] text-[#9E9B90] hover:text-[#FAF8F5] border-[#383832]'
                : 'bg-[#F2EFE9] hover:bg-[#E8E4DE] text-[#9A948C] hover:text-[#4A4A38] border-[#E8E4DE]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Deployment Methods */}
        <div className="space-y-4">
          {/* Method 1: Drag and drop */}
          <div
            className={`p-4 rounded-2xl border space-y-2 shadow-xs ${
              darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center gap-2 font-semibold text-sm ${
                  darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                }`}
              >
                <FolderArchive
                  className={`w-4 h-4 ${
                    darkMode ? 'text-[#C29B38]' : 'text-[#8C7348]'
                  }`}
                />
                <span>Method 1: Drag &amp; Drop to Netlify Drop (Fastest)</span>
              </div>
            </div>
            <p
              className={`text-xs leading-relaxed ${
                darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
              }`}
            >
              1. Build the production files by running{' '}
              <code
                className={`font-mono-num font-bold ${
                  darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'
                }`}
              >
                npm run build
              </code>
              .<br />
              2. Drag the generated{' '}
              <code
                className={`font-mono-num font-bold ${
                  darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'
                }`}
              >
                dist/
              </code>{' '}
              folder directly onto{' '}
              <a
                href="https://app.netlify.com/drop"
                target="_blank"
                rel="noreferrer"
                className={`font-semibold underline ${
                  darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'
                }`}
              >
                app.netlify.com/drop
              </a>
              .
            </p>
          </div>

          {/* Method 2: Git repository connection */}
          <div
            className={`p-4 rounded-2xl border space-y-2 shadow-xs ${
              darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
            }`}
          >
            <div
              className={`flex items-center gap-2 font-semibold text-sm ${
                darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
              }`}
            >
              <Github
                className={`w-4 h-4 ${
                  darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'
                }`}
              />
              <span>Method 2: Connect via GitHub Repository</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono-num">
              <div
                className={`p-2.5 rounded-xl border ${
                  darkMode
                    ? 'bg-[#181816] border-[#383832]'
                    : 'bg-[#FAF8F5] border-[#E8E4DE]'
                }`}
              >
                <span
                  className={`block text-[10px] uppercase font-sans font-semibold ${
                    darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                  }`}
                >
                  Build command:
                </span>
                <span
                  className={`font-bold ${
                    darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'
                  }`}
                >
                  npm run build
                </span>
              </div>
              <div
                className={`p-2.5 rounded-xl border ${
                  darkMode
                    ? 'bg-[#181816] border-[#383832]'
                    : 'bg-[#FAF8F5] border-[#E8E4DE]'
                }`}
              >
                <span
                  className={`block text-[10px] uppercase font-sans font-semibold ${
                    darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
                  }`}
                >
                  Publish directory:
                </span>
                <span
                  className={`font-bold ${
                    darkMode ? 'text-[#C29B38]' : 'text-[#5A5A40]'
                  }`}
                >
                  dist
                </span>
              </div>
            </div>
          </div>

          {/* Method 3: Netlify CLI */}
          <div
            className={`p-4 rounded-2xl border space-y-2 shadow-xs ${
              darkMode ? 'bg-[#23231F] border-[#383832]' : 'bg-white border-[#E8E4DE]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div
                className={`flex items-center gap-2 font-semibold text-sm ${
                  darkMode ? 'text-[#FAF8F5]' : 'text-[#4A4A38]'
                }`}
              >
                <Terminal
                  className={`w-4 h-4 ${
                    darkMode ? 'text-[#A3B18A]' : 'text-[#6E7A5A]'
                  }`}
                />
                <span>Method 3: Netlify CLI Terminal One-Liner</span>
              </div>
              <button
                onClick={() => handleCopy('npx netlify deploy --prod --dir=dist', 'cli')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono-num transition-colors cursor-pointer border ${
                  darkMode
                    ? 'bg-[#181816] hover:bg-[#2A2A24] text-[#D8D5CC] border-[#383832]'
                    : 'bg-[#F2EFE9] hover:bg-[#E8E4DE] text-[#4A4A38] border-[#E8E4DE]'
                }`}
              >
                {copiedCmd === 'cli' ? (
                  <Check className="w-3 h-3 text-[#A3B18A]" />
                ) : (
                  <Copy className="w-3 h-3 text-[#9E9B90]" />
                )}
                <span>{copiedCmd === 'cli' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre
              className={`p-2.5 rounded-xl font-mono-num text-xs border overflow-x-auto ${
                darkMode
                  ? 'bg-[#181816] text-[#C29B38] border-[#383832]'
                  : 'bg-[#FAF8F5] text-[#5A5A40] border-[#E8E4DE]'
              }`}
            >
              npm run build &amp;&amp; npx netlify deploy --prod --dir=dist
            </pre>
          </div>
        </div>

        <div
          className={`flex items-center justify-between pt-2 border-t ${
            darkMode ? 'border-[#383832]' : 'border-[#E8E4DE]'
          }`}
        >
          <div
            className={`flex items-center gap-1.5 text-xs ${
              darkMode ? 'text-[#9E9B90]' : 'text-[#9A948C]'
            }`}
          >
            <Sparkles
              className={`w-3.5 h-3.5 ${
                darkMode ? 'text-[#C29B38]' : 'text-[#8C7348]'
              }`}
            />
            <span>SPA routing &amp; caching rules configured automatically.</span>
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              darkMode
                ? 'bg-[#C29B38] hover:bg-[#D4A373] text-[#181816]'
                : 'bg-[#5A5A40] hover:bg-[#4A4A38] text-[#FAF8F5]'
            }`}
          >
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
