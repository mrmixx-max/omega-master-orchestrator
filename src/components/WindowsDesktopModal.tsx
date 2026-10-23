import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Check, 
  Copy, 
  Terminal, 
  Monitor, 
  Layers, 
  Cpu, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  HardDrive, 
  Zap,
  ChevronRight,
  Code
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { 
  generateWindowsBatchLauncher, 
  generateWindowsPowerShellShortcut, 
  generateElectronMainCjs, 
  triggerFileDownload 
} from '../utils/windowsDesktopGenerator';
import { MarketLanguage } from '../types';

interface WindowsDesktopModalProps {
  isOpen: boolean;
  onClose: () => void;
  market?: MarketLanguage;
}

export const WindowsDesktopModal: React.FC<WindowsDesktopModalProps> = ({
  isOpen,
  onClose,
  market = 'de',
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pwa' | 'batch' | 'electron'>('pwa');
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://omega-orchestrator.app';
  const config = {
    appUrl: currentUrl,
    appName: 'OMEGA Master Orchestrator',
    version: '3.0.0',
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const handleDownloadBat = () => {
    const batContent = generateWindowsBatchLauncher(config);
    triggerFileDownload(batContent, 'Launch_OMEGA_Windows.bat', 'application/x-bat');
  };

  const handleDownloadPs1 = () => {
    const ps1Content = generateWindowsPowerShellShortcut(config);
    triggerFileDownload(ps1Content, 'Create_Desktop_Shortcut.ps1', 'text/plain');
  };

  const handleDownloadElectron = () => {
    const electronContent = generateElectronMainCjs(config);
    triggerFileDownload(electronContent, 'electron-main.cjs', 'application/javascript');
  };

  const isEn = market === 'en';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-[#0d1322] border border-[#1e293b] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1f293d] bg-[#090d16]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-emerald-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
              {/* Windows 11 style 4-pane icon */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.949-1.801" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  {isEn ? 'Windows Desktop App Suite' : 'Windows Desktop App Zentrale'}
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                  v3.0.0 Win10/11
                </span>
                {isInstalled && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1 font-bold">
                    <Check className="w-3 h-3" /> {isEn ? 'Installed' : 'Installiert'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {isEn 
                  ? 'Native Windows desktop window, taskbar pinning, offline caching & standalone runtime' 
                  : 'Natives Windows-Desktop-Fenster, Taskleisten-Verknüpfung, Offline-Betrieb & Standalone-Laufzeit'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1f293d] bg-slate-950/60 px-5 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'pwa'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isEn ? '1. 1-Click Native App (PWA)' : '1. 1-Klick Native App (PWA)'}</span>
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'batch'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>{isEn ? '2. Windows Launcher (.bat / .ps1)' : '2. Windows Starter (.bat / .ps1)'}</span>
          </button>
          <button
            onClick={() => setActiveTab('electron')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'electron'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{isEn ? '3. Standalone .EXE (Electron)' : '3. Standalone .EXE (Electron)'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* TAB 1: 1-Click Native App (PWA) */}
          {activeTab === 'pwa' && (
            <div className="space-y-5">
              {/* Primary Action Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-emerald-950/40 border border-cyan-800/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1.5 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                    <h4 className="text-sm font-bold text-white">
                      {isEn ? 'Direct Windows Desktop Installation' : 'Direkte Windows-Desktop-Installation'}
                    </h4>
                  </div>
                  <p className="text-slate-300 text-xs max-w-md">
                    {isEn
                      ? 'Installs OMEGA Master Orchestrator directly into your Windows Start Menu, Desktop & Taskbar with zero installation overhead.'
                      : 'Installiert OMEGA direkt in Ihr Windows-Startmenü, auf den Desktop und in die Taskleiste. Startet in eigenem rahmenlosem Fenster.'}
                  </p>
                </div>

                <div className="flex flex-col gap-2 w-full md:w-auto">
                  {isInstallable ? (
                    <button
                      onClick={install}
                      className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2 cursor-pointer text-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isEn ? 'INSTALL WINDOWS APP NOW' : 'JETZT ALS WINDOWS-APP INSTALLIEREN'}</span>
                    </button>
                  ) : isInstalled ? (
                    <div className="py-2.5 px-4 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      <span>{isEn ? 'App Already Installed on Windows' : 'Bereits als Desktop-App installiert'}</span>
                    </div>
                  ) : (
                    <div className="py-2.5 px-4 rounded-xl bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-[11px] text-center">
                      <span>{isEn ? 'Use Edge / Chrome: Click "Install" icon in URL bar' : 'In Edge/Chrome: Klicke App-Installieren-Symbol in der Adressleiste'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Windows 11/10 Feature Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Monitor className="w-4 h-4" />
                    <span>{isEn ? 'Isolated Window' : 'Eigenes App-Fenster'}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    {isEn 
                      ? 'No URL bar, tabs or browser clutter. Runs identical to a native Windows software executable.' 
                      : 'Keine Adressleiste, keine Tabs. Fühlt sich an wie eine native Windows .exe Anwendung.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <HardDrive className="w-4 h-4" />
                    <span>{isEn ? 'Offline Cache Engine' : 'Offline-Caching'}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    {isEn 
                      ? 'Instant boot times and offline readiness via high-performance Service Worker runtime.' 
                      : 'Sofortiger Kaltstart und Offline-Nutzung aller Audit-Vorlagen via Service Worker.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Layers className="w-4 h-4" />
                    <span>{isEn ? 'Windows Taskbar Pin' : 'Taskleisten-Halterung'}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    {isEn 
                      ? 'Pin directly to Windows 11 taskbar with jump-list shortcuts for new audits and cold lead batches.' 
                      : 'Rechtsklick-Menü in der Windows-Taskleiste für Schnellzugriff auf Audits und Lead Hunter.'}
                  </p>
                </div>
              </div>

              {/* Step-by-Step Instructions for Edge & Chrome on Windows */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                <h5 className="font-bold text-white flex items-center gap-2 text-xs">
                  <span>{isEn ? 'Manual Installation in 2 Clicks (Microsoft Edge / Google Chrome):' : 'Manuelle Installation in 2 Klicks (Microsoft Edge / Google Chrome):'}</span>
                </h5>
                <ol className="list-decimal list-inside space-y-2 text-slate-300 text-xs pl-1">
                  <li>
                    <strong className="text-white">Microsoft Edge (Windows Standard):</strong>{' '}
                    {isEn
                      ? 'Click the App icon [⊞] at the right end of the address bar, then click "Install". Or go to Menu (...) → Apps → "Install OMEGA Master Orchestrator".'
                      : 'Klicken Sie auf das App-Symbol [⊞] rechts in der Adressleiste und wählen Sie "Installieren". Oder über das Menü (...) → Apps → "OMEGA installieren".'}
                  </li>
                  <li>
                    <strong className="text-white">Google Chrome / Brave:</strong>{' '}
                    {isEn
                      ? 'Click the install icon [↓] in the search bar, or open Menu (⋮) → "Save and Share" → "Install OMEGA Master Orchestrator...".'
                      : 'Klicken Sie auf das Download-Symbol [↓] in der Adressleiste oder auf Menü (⋮) → "Speichern und teilen" → "OMEGA installieren...".'}
                  </li>
                  <li>
                    {isEn
                      ? 'Check the box "Pin to taskbar" and "Create Desktop shortcut" in the Windows confirmation dialog.'
                      : 'Setzen Sie im Windows-Dialog den Haken bei "An Taskleiste anheften" und "Desktopverknüpfung erstellen".'}
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 2: Windows Batch Launcher & PowerShell */}
          {activeTab === 'batch' && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Terminal className="w-4 h-4" />
                    <span>Launch_OMEGA_Windows.bat</span>
                  </div>
                  <button
                    onClick={handleDownloadBat}
                    className="py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold flex items-center gap-1.5 transition cursor-pointer text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Download .bat' : '.bat herunterladen'}</span>
                  </button>
                </div>
                <p className="text-slate-300 text-xs">
                  {isEn
                    ? 'A standalone Windows Batch script that auto-detects Microsoft Edge or Chrome and opens OMEGA in dedicated desktop window mode (--app). No browser bars, completely distraction-free.'
                    : 'Ein sofort ausführbares Windows Batch-Skript. Erkennt automatisch Edge oder Chrome und öffnet OMEGA im rahmenlosen Desktop-App-Fenster (--app).'}
                </p>
                <div className="p-3 bg-black/60 rounded-xl font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800/80">
                  <div className="text-slate-500">:: Windows 1-Klick Startbefehl</div>
                  <div>start msedge.exe --app="{currentUrl}" --window-size=1440,920</div>
                </div>
              </div>

              {/* PowerShell Shortcut Script */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Code className="w-4 h-4" />
                    <span>Create_Desktop_Shortcut.ps1</span>
                  </div>
                  <button
                    onClick={handleDownloadPs1}
                    className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold flex items-center gap-1.5 transition cursor-pointer text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isEn ? 'Download .ps1' : '.ps1 herunterladen'}</span>
                  </button>
                </div>
                <p className="text-slate-300 text-xs">
                  {isEn
                    ? 'PowerShell script that generates a permanent .lnk shortcut directly on your Windows Desktop.'
                    : 'Erstellt automatisch eine native Verknüpfung (.lnk) auf Ihrem Windows Desktop.'}
                </p>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/50 border border-slate-800 font-mono text-[11px] text-slate-400">
                  <span className="truncate pr-2">powershell -ExecutionPolicy Bypass -File .\Create_Desktop_Shortcut.ps1</span>
                  <button
                    onClick={() => handleCopy('powershell -ExecutionPolicy Bypass -File .\\Create_Desktop_Shortcut.ps1', 'ps1')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer shrink-0"
                  >
                    {copiedScript === 'ps1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Standalone .EXE (Electron) */}
          {activeTab === 'electron' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold">
                    <Cpu className="w-4 h-4" />
                    <span>{isEn ? 'Standalone Windows Executable (.exe)' : 'Standalone Windows Executable (.exe)'}</span>
                  </div>
                  <button
                    onClick={handleDownloadElectron}
                    className="py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-extrabold flex items-center gap-1.5 transition cursor-pointer text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>electron-main.cjs</span>
                  </button>
                </div>
                <p className="text-slate-300 text-xs">
                  {isEn
                    ? 'Ready-to-use Electron main process script to compile a true standalone Windows .exe installer via electron-builder.'
                    : 'Vorkonfigurierter Electron-Hauptprozess. Erlaubt die Erstellung eines eigenständigen Windows-Installers (.exe / .msi) ohne Browser-Abhängigkeit.'}
                </p>

                {/* Build Instructions */}
                <div className="p-3 bg-black/70 rounded-xl font-mono text-[11px] text-cyan-300 space-y-1.5 border border-slate-800">
                  <div className="text-slate-500"># 1. Install Electron dependencies</div>
                  <div>npm install --save-dev electron electron-builder</div>
                  <div className="text-slate-500 mt-2"># 2. Test desktop window locally</div>
                  <div>npx electron electron-main.cjs</div>
                  <div className="text-slate-500 mt-2"># 3. Build Windows .exe installer</div>
                  <div>npx electron-builder --win nsis:ia32,x64</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-slate-400 text-xs">
                  {isEn
                    ? 'The PWA version (Method 1) requires zero compilation, updates automatically, and uses standard Windows sandbox security.'
                    : 'Empfehlung: Methode 1 (PWA) benötigt keine Installation von Drittsoftware, aktualisiert sich automatisch und nutzt die native Windows-Chromium-Sandbox.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[#1f293d] bg-[#090d16]/80 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{isEn ? 'Windows 10 / 11 Compatible' : 'Kompatibel mit Windows 10 & Windows 11 (64-Bit)'}</span>
          </div>
          <button
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition cursor-pointer"
          >
            {isEn ? 'Close' : 'Schließen'}
          </button>
        </div>
      </div>
    </div>
  );
};
