import React from 'react';
import { 
  Terminal, 
  Users, 
  Scale, 
  Receipt, 
  Sparkles, 
  RotateCcw,
  Layers,
  Crosshair,
  Globe
} from 'lucide-react';

import { OllamaSettings, MarketLanguage } from '../types';
import { OllamaModelSelector } from './OllamaModelSelector';
import { PWAInstallButton } from './PWAInstallButton';

export type ActiveTab = 'engine' | 'scraper' | 'lead-capture' | 'compare' | 'invoices' | 'portfolio' | 'batch';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onReset: () => void;
  leadsCount: number;
  dossiersCount: number;
  ollamaSettings: OllamaSettings;
  onUpdateOllamaSettings: (settings: OllamaSettings) => void;
  market: MarketLanguage;
  onToggleMarket: (market: MarketLanguage) => void;
  onOpenWindowsModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onReset,
  leadsCount,
  dossiersCount,
  ollamaSettings,
  onUpdateOllamaSettings,
  market,
  onToggleMarket,
  onOpenWindowsModal,
}) => {
  return (
    <header className="border-b border-[#1f2937] bg-[#111827]/90 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('engine')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-emerald-500 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-cyan-500/25 select-none">
            Ω
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold tracking-wider text-base md:text-lg text-white">
                OMEGA MASTER-ORCHESTRATOR
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                v3.0 PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Adversarial Swarm Stresstest & Deterministischer Slop-Sanitizer
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center overflow-x-auto pb-1 md:pb-0 gap-1.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('engine')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'engine'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Audit Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('scraper')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'scraper'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Web Scraper</span>
          </button>

          <button
            onClick={() => setActiveTab('lead-capture')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'lead-capture'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lead Capture</span>
            {leadsCount > 0 && (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {leadsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'compare'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-purple-400" />
            <span>Dossier Vergleich</span>
            {dossiersCount > 0 && (
              <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {dossiersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'batch'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-red-400" />
            <span>Kaltakquise Engine</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'invoices'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-amber-400" />
            <span>Rechnungen</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
              activeTab === 'portfolio'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 shadow-sm shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Portfolio</span>
          </button>
        </nav>

        {/* Status, Market, Model & Reset */}
        <div className="flex items-center space-x-2 md:space-x-3 shrink-0">
          {/* Windows Desktop App Button */}
          <PWAInstallButton onOpenWindowsModal={onOpenWindowsModal} />

          {/* Dual Market Switcher Toggle (DE vs US) */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => onToggleMarket('de')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                market === 'de'
                  ? 'bg-gradient-to-r from-cyan-950 to-slate-900 text-cyan-300 border border-cyan-700 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="DACH-Markt (Deutschland, Österreich, Schweiz - DSGVO & € EUR)"
            >
              <span>🇩🇪</span>
              <span className="hidden sm:inline">DE (DACH)</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleMarket('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                market === 'en'
                  ? 'bg-gradient-to-r from-cyan-950 to-slate-900 text-cyan-300 border border-cyan-700 shadow-sm shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="US/UK Global Market (American Sales Psychology & $ USD)"
            >
              <span>🇺🇸</span>
              <span className="hidden sm:inline">US / EN</span>
            </button>
          </div>

          {/* Ollama Model Selector (Compact) */}
          <div className="hidden lg:block">
            <OllamaModelSelector
              settings={ollamaSettings}
              onUpdateSettings={onUpdateOllamaSettings}
              compact={true}
            />
          </div>

          <div className="hidden xl:flex items-center space-x-2 text-xs text-slate-300 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Gate-Schwelle: <strong className="text-white font-mono">&gt;= 92 Pkt</strong></span>
          </div>

          <button
            onClick={onReset}
            title="Dashboard zurücksetzen"
            className="p-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg transition border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
