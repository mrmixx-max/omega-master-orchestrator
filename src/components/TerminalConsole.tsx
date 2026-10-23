import React, { useEffect, useRef } from 'react';
import { Terminal, Copy, Check } from 'lucide-react';

export interface LogEntry {
  id: string;
  text: string;
  color: string;
  time: string;
}

interface TerminalConsoleProps {
  logs: LogEntry[];
  isRunning: boolean;
  progress: number;
  currentStep: string;
  statusBadge: {
    text: string;
    type: 'ready' | 'running' | 'success' | 'error';
  };
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  logs,
  isRunning,
  progress,
  currentStep,
  statusBadge,
}) => {
  const consoleRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.time}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const badgeStyles = {
    ready: 'bg-slate-800 text-slate-300 border-slate-700',
    running: 'bg-cyan-950 text-cyan-400 border-cyan-800 animate-pulse',
    success: 'bg-emerald-950 text-emerald-400 border-emerald-800',
    error: 'bg-red-950 text-red-400 border-red-800',
  };

  return (
    <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5 shadow-xl font-mono text-xs relative overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1f2937] mb-3">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block shadow-sm shadow-red-500/50"></span>
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block shadow-sm shadow-amber-500/50"></span>
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block shadow-sm shadow-emerald-500/50"></span>
          </div>
          <span className="text-slate-400 text-[11px] ml-2 flex items-center gap-1.5 font-semibold">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>omega_orchestrator.py — Live Terminal</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            title="Log kopieren"
            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <div className={`px-2.5 py-0.5 rounded text-[10px] font-bold border tracking-wider ${badgeStyles[statusBadge.type]}`}>
            {statusBadge.text}
          </div>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={consoleRef}
        className="h-48 overflow-y-auto space-y-1.5 text-slate-300 scroll-smooth pr-2 select-text"
      >
        {logs.map((log) => (
          <div key={log.id} className={`leading-relaxed break-all ${log.color}`}>
            <span className="text-slate-600 text-[10px] mr-2 select-none">[{log.time}]</span>
            {log.text}
          </div>
        ))}
      </div>

      {/* Progress Bar Container */}
      {(isRunning || progress > 0) && (
        <div className="mt-4 pt-3 border-t border-[#1f2937]">
          <div className="flex justify-between text-[10px] text-slate-400 mb-1.5">
            <span className="font-sans font-medium text-slate-300">{currentStep}</span>
            <span className="font-mono font-bold text-cyan-400">{progress}%</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800 p-0.5">
            <div
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};
