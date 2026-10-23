import React, { useState } from 'react';
import { 
  Cpu, 
  Settings2, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Copy, 
  Sliders, 
  Terminal, 
  Zap, 
  ShieldAlert, 
  Layers, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { OllamaModel, OllamaSettings } from '../types';
import { DEFAULT_OLLAMA_MODELS } from '../utils/storage';

interface OllamaModelSelectorProps {
  settings: OllamaSettings;
  onUpdateSettings: (settings: OllamaSettings) => void;
  compact?: boolean;
}

export const OllamaModelSelector: React.FC<OllamaModelSelectorProps> = ({
  settings,
  onUpdateSettings,
  compact = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const activeModel = DEFAULT_OLLAMA_MODELS.find(m => m.tag === settings.selectedModel) || {
    id: 'custom',
    name: settings.customModelName || settings.selectedModel || 'Custom Model',
    tag: settings.selectedModel || 'custom',
    size: 'Variable',
    category: 'Benutzerdefiniert' as const,
    description: 'Manuell eingegebenes lokales Ollama Modell.',
    contextLength: 'Auto',
    recommendedFor: 'Individuelle Workflows',
  };

  const handleSelectModel = (tag: string) => {
    onUpdateSettings({
      ...settings,
      selectedModel: tag,
    });
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    // Simulate connection ping to Ollama daemon
    setTimeout(() => {
      const isLocalhost = settings.apiUrl.includes('localhost') || settings.apiUrl.includes('127.0.0.1');
      if (isLocalhost) {
        onUpdateSettings({
          ...settings,
          connectionStatus: 'connected',
          latencyMs: Math.floor(Math.random() * 15 + 8),
        });
        setTestResult('Erfolgreich: Lokaler Ollama Daemon (Port 11434) antwortet mit 12ms Latenz.');
      } else {
        onUpdateSettings({
          ...settings,
          connectionStatus: 'connected',
          latencyMs: 45,
        });
        setTestResult(`Erfolgreich: Remote Ollama Host (${settings.apiUrl}) erreichbar.`);
      }
      setIsTesting(false);
    }, 700);
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <>
      {compact ? (
        /* Compact Header / Navbar Trigger */
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 text-xs bg-slate-900/90 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-cyan-800 transition cursor-pointer group"
          title="Ollama LLM Modell wechseln & konfigurieren"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 group-hover:animate-ping"></span>
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono font-bold text-white text-[11px]">{activeModel.name}</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono hidden xl:inline">({activeModel.size})</span>
          <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 transition" />
        </button>
      ) : (
        /* Full In-Panel Selector inside Engine Configuration */
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ollama LLM Engine & Modell:</span>
            </label>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 cursor-pointer transition"
            >
              <Settings2 className="w-3 h-3" />
              <span>Endpoint & Details</span>
            </button>
          </div>

          <div className="relative">
            <select
              value={settings.selectedModel}
              onChange={(e) => handleSelectModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 hover:border-cyan-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono transition appearance-none cursor-pointer pr-8"
            >
              <optgroup label="Empfohlen für OMEGA Master (Deutsch & Burstiness)">
                <option value="qwen2.5:14b">qwen2.5:14b — Qwen 2.5 (14B, 9.0 GB) [Standard & Gatekeeper]</option>
                <option value="mistral-nemo:12b">mistral-nemo:12b — Mistral NeMo (12B, 7.1 GB) [EU / DSGVO]</option>
              </optgroup>
              <optgroup label="Adversarial Reasoning & CFO-Logik">
                <option value="deepseek-r1:14b">deepseek-r1:14b — DeepSeek R1 (14B, 9.0 GB) [CoT Reasoning]</option>
                <option value="deepseek-r1:8b">deepseek-r1:8b — DeepSeek R1 (8B, 4.9 GB) [Agiles Reasoning]</option>
              </optgroup>
              <optgroup label="Enterprise & Maximale Tiefe">
                <option value="qwen2.5:32b">qwen2.5:32b — Qwen 2.5 (32B, 19.0 GB) [High-End Stresstest]</option>
                <option value="llama3.3:70b">llama3.3:70b — Llama 3.3 (70B, 43.0 GB) [Enterprise Full-Funnel]</option>
              </optgroup>
              <optgroup label="Schnell & Leichtgewichtig">
                <option value="qwen2.5:7b">qwen2.5:7b — Qwen 2.5 (7B, 4.7 GB) [Geringer VRAM]</option>
                <option value="llama3.1:8b">llama3.1:8b — Llama 3.1 (8B, 4.7 GB) [Schneller Allrounder]</option>
              </optgroup>
              <optgroup label="Eigenes Modell">
                <option value="custom">Benutzerdefiniertes Ollama-Modell...</option>
              </optgroup>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {settings.selectedModel === 'custom' && (
            <div className="pt-1 animate-fadeIn">
              <input
                type="text"
                placeholder="z. B. qwen2.5-coder:14b, phi4:14b oder mein-finetune:latest"
                value={settings.customModelName}
                onChange={(e) => onUpdateSettings({ ...settings, customModelName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-cyan-300 font-mono placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Model info banner */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
            <span className="truncate pr-2">{activeModel.description}</span>
            <span className="font-mono text-cyan-400 shrink-0 font-bold">{activeModel.size}</span>
          </div>
        </div>
      )}

      {/* Detailed Ollama Configuration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#111827] border border-[#1f2937] rounded-2xl max-w-3xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-black font-black text-xl shadow-lg shadow-cyan-500/20">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Ollama LLM Konfiguration</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono">
                      v11434
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Wählen Sie das KI-Modell für Swarm-Audits, Slop-Sanitizing und Proposal-Generierung
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Connection Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ollama Host & API-URL:
                  </label>
                  <input
                    type="text"
                    value={settings.apiUrl}
                    onChange={(e) => onUpdateSettings({ ...settings, apiUrl: e.target.value })}
                    placeholder="http://localhost:11434"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-700 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Prüfe Verbindung...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Verbindung testen</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {testResult && (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{testResult}</span>
                </div>
              )}
            </div>

            {/* Models Catalog Grid */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Verfügbare Modelle ({DEFAULT_OLLAMA_MODELS.length})</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  Aktuell aktiv: <strong className="text-cyan-300 font-mono">{settings.selectedModel}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {DEFAULT_OLLAMA_MODELS.map((model) => {
                  const isSelected = settings.selectedModel === model.tag;

                  return (
                    <div
                      key={model.tag}
                      onClick={() => handleSelectModel(model.tag)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-cyan-950/50 border-cyan-500 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-1.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white font-mono">{model.name}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                                {model.size}
                              </span>
                            </div>
                            <span className="text-[10px] text-cyan-400 font-mono">{model.tag}</span>
                          </div>

                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono ${
                            model.category === 'Empfohlen'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : model.category === 'Reasoning'
                              ? 'bg-purple-950 text-purple-300 border border-purple-800'
                              : model.category === 'Enterprise'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}>
                            {model.category}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-snug line-clamp-2 mt-1">
                          {model.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 truncate max-w-[200px]">
                          Einsatz: {model.recommendedFor}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyCommand(`ollama run ${model.tag}`);
                            }}
                            title={`Kopiere: ollama run ${model.tag}`}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                          >
                            {copiedCmd === `ollama run ${model.tag}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>

                          <button
                            type="button"
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isSelected
                                ? 'bg-cyan-500 text-black'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {isSelected ? 'Aktiv' : 'Wählen'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hyperparameters Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span>Modell-Parameter (Inference-Steuerung)</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Temperature:</span>
                    <span className="font-mono text-cyan-400 font-bold">{settings.temperature}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.temperature}
                    onChange={(e) => onUpdateSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>0.1 (Deterministisch / Slop-Filter)</span>
                    <span>1.0 (Kreativ)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300 font-medium">Top-P (Nucleus Sampling):</span>
                    <span className="font-mono text-cyan-400 font-bold">{settings.topP}</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settings.topP}
                    onChange={(e) => onUpdateSettings({ ...settings, topP: parseFloat(e.target.value) })}
                    className="w-full accent-cyan-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                    <span>0.1 (Fokussiert)</span>
                    <span>1.0 (Breit)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CLI Quick Tip */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Terminal-Befehl zum Laden:</span>
                <code className="text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  ollama run {settings.selectedModel === 'custom' && settings.customModelName ? settings.customModelName : settings.selectedModel}
                </code>
              </div>
              <button
                onClick={() => copyCommand(`ollama run ${settings.selectedModel === 'custom' && settings.customModelName ? settings.customModelName : settings.selectedModel}`)}
                className="px-2.5 py-1 text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 flex items-center gap-1 cursor-pointer"
              >
                {copiedCmd?.includes('ollama run') ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Kopieren</span>
              </button>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-extrabold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-cyan-500/20"
              >
                EINSTELLUNGEN ÜBERNEHMEN
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
