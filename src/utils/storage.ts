import { AuditRun, Lead, Invoice, OllamaModel, OllamaSettings } from '../types';

const STORAGE_KEYS = {
  DOSSIERS: 'omega_dossiers_v3',
  LEADS: 'omega_leads_v3',
  INVOICES: 'omega_invoices_v3',
  OLLAMA: 'omega_ollama_settings_v3',
};

export const DEFAULT_OLLAMA_MODELS: OllamaModel[] = [
  {
    id: 'qwen2.5:14b',
    name: 'Qwen 2.5 (14B)',
    tag: 'qwen2.5:14b',
    size: '9.0 GB',
    category: 'Empfohlen',
    description: 'Offizielles OMEGA Master Modell. Herausragende deutsche Sprachbeherrschung, hohe Burstiness-Kontrolle und messerscharfe Persona-Argumentation.',
    contextLength: '32k',
    recommendedFor: 'B2B Sales-Copy, Red-Critic Gatekeeper & Slop-Sanitization',
  },
  {
    id: 'qwen2.5:7b',
    name: 'Qwen 2.5 (7B)',
    tag: 'qwen2.5:7b',
    size: '4.7 GB',
    category: 'Schnell',
    description: 'Extrem flink und speichereffizient (läuft ab 6 GB VRAM). Ideal für schnelle Scans und flüssige Vorab-Iterationen.',
    contextLength: '32k',
    recommendedFor: 'Agile Vorab-Audits & schwächere Hardware',
  },
  {
    id: 'qwen2.5:32b',
    name: 'Qwen 2.5 (32B)',
    tag: 'qwen2.5:32b',
    size: '19.0 GB',
    category: 'Enterprise',
    description: 'Maximales Reasoning und gnadenlose Kritikschärfe. Entlarvt selbst subtilste Banalitäten und liefert erstklassige Master-Copy.',
    contextLength: '32k',
    recommendedFor: 'High-Ticket Angebote (>2.000 €) & Enterprise Landingpages',
  },
  {
    id: 'deepseek-r1:14b',
    name: 'DeepSeek R1 (14B)',
    tag: 'deepseek-r1:14b',
    size: '9.0 GB',
    category: 'Reasoning',
    description: 'Adversarial Reasoning Spezialist mit Chain-of-Thought Denkmustern. Perfekt für den Ruthless CFO und logische Widerspruchsanalysen.',
    contextLength: '64k',
    recommendedFor: 'CFO ROI-Blocker & mathematische Amortisations-Prüfung',
  },
  {
    id: 'deepseek-r1:8b',
    name: 'DeepSeek R1 (8B)',
    tag: 'deepseek-r1:8b',
    size: '4.9 GB',
    category: 'Reasoning',
    description: 'Kompakte Reasoning-Maschine auf Llama-3-Basis für blitzschnelle logische Beweisführungs-Audits.',
    contextLength: '64k',
    recommendedFor: 'Schnelle mathematische Gegenprüfungen',
  },
  {
    id: 'llama3.3:70b',
    name: 'Llama 3.3 (70B)',
    tag: 'llama3.3:70b',
    size: '43.0 GB',
    category: 'Enterprise',
    description: 'Meta Flaggschiff mit unvergleichlichem Allgemeinwissen und profundem Branchen-Insider-Verständnis.',
    contextLength: '128k',
    recommendedFor: 'Umfangreiche Full-Funnel Audits mit viel Kontext',
  },
  {
    id: 'llama3.1:8b',
    name: 'Llama 3.1 (8B)',
    tag: 'llama3.1:8b',
    size: '4.7 GB',
    category: 'Schnell',
    description: 'Schneller Standard-Allrounder. Gut geeignet für den ungeduldigen ADHD-Scroller und Headline-Hooks.',
    contextLength: '128k',
    recommendedFor: 'Mobile-Scroller Hook-Checks',
  },
  {
    id: 'mistral-nemo:12b',
    name: 'Mistral NeMo (12B)',
    tag: 'mistral-nemo:12b',
    size: '7.1 GB',
    category: 'Empfohlen',
    description: 'Europäisches Spitzenmodell (Mistral & NVIDIA) mit präziser deutscher Syntax und hervorragender Slop-Erkennung.',
    contextLength: '128k',
    recommendedFor: 'DSGVO- und EU-Regulierte Märkte',
  },
];

export const DEFAULT_OLLAMA_SETTINGS: OllamaSettings = {
  apiUrl: 'http://localhost:11434',
  selectedModel: 'qwen2.5:14b',
  customModelName: '',
  temperature: 0.4,
  topP: 0.9,
  connectionStatus: 'demo',
  latencyMs: 12,
};


const SEED_DOSSIERS: AuditRun[] = [
  {
    id: 'OMG-20261021-143022',
    timestamp: '2026-10-21T14:30:22Z',
    targetSource: 'https://saas-flow-matrix.io/enterprise',
    niche: 'B2B SaaS / KI-Automatisierung',
    style: 'Messerscharfer Direkt-Response-Experte',
    objections: 'Zu komplexe API-Einbindung, unklare DSGVO-Haftung, versteckte Zusatzkosten',
    pipelineMode: 'omega',
    convScoreBefore: 54,
    convScoreAfter: 95,
    slopToxicityBefore: 78,
    slopToxicityAfter: 3,
    burstinessBefore: 4.1,
    burstinessAfter: 9.6,
    humanScoreAfter: 94,
    loopsUsed: 3,
    metricsBefore: {
      burstiness: 4.1,
      avgSentenceWords: 18.4,
      slopHits: ['in der heutigen schnelllebigen welt', 'ganzheitlicher ansatz', 'nahtlos'],
      hitCount: 3,
      slopToxicity: 78,
      monotonyPenalty: 30,
      phrasePenalty: 42,
    },
    metricsAfter: {
      burstiness: 9.6,
      avgSentenceWords: 8.8,
      slopHits: [],
      hitCount: 0,
      slopToxicity: 3,
      monotonyPenalty: 0,
      phrasePenalty: 0,
    },
    personas: [
      {
        id: 'BURNED_SKEPTIC',
        title: 'Der verbrannte Käufer (Skeptiker)',
        focus: 'Vertrauens-Verlust & Leere Versprechen',
        score: 42,
        worstElement: 'Versprechen von „10x Produktivität“ ohne jeglichen mathematischen Beweis.',
        critique: [
          'Wieder ein SaaS-Tool, das mir die Sterne vom Himmel verspricht. Wo ist der Nachweis?',
          'Kein einziges konkretes Rechenbeispiel im gesamten oberen Drittel.',
          'Null Angaben zu deutschen Rechenzentren oder DSGVO.'
        ]
      },
      {
        id: 'RUTHLESS_CFO',
        title: 'Der geizige Entscheider (ROI-Prüfer)',
        focus: 'Amortisation & Kostenrisiko',
        score: 46,
        worstElement: 'Verschleierte Lizenzstaffeln und unklare Setup-Gebühren.',
        critique: [
          'Das Investitionsrisiko ist bei 12-Monats-Verträgen viel zu hoch.',
          'Amortisationszeitpunkt wird mit keiner Silbe beziffert.',
          'Kein klarer Vergleich zu bestehenden Standardwerkzeugen.'
        ]
      },
      {
        id: 'ADHD_SCROLLER',
        title: 'Der ungeduldige 3-Sekunden-Scroller',
        focus: 'Mobile Lesbarkeit & Rhythmus',
        score: 51,
        worstElement: 'Verschachtelte Bandwurmsätze mit mehr als 25 Wörtern.',
        critique: [
          'Ich scrolle nach 2 Sekunden weiter. Viel zu viel generisches Geschwafel.',
          'Die Headline geht über 4 Zeilen auf dem iPhone.',
          'Der Button sagt nur „Mehr erfahren“. Langweilig!'
        ]
      },
      {
        id: 'DOMAIN_PEDANT',
        title: 'Der Branchen-Insider (Fach-Pedant)',
        focus: 'Buzzword-Detektion & Konsistenz',
        score: 40,
        worstElement: 'Gleich 3 klassische KI-Floskeln im Hauptabsatz.',
        critique: [
          '„In der heutigen schnelllebigen Welt“ – sofort als ChatGPT-Prompt enttarnt.',
          'Begriff „ganzheitlich“ wird inflationär als Lückenfüller genutzt.',
          'Die technischen Spezifikationen widersprechen den Marketing-Behauptungen.'
        ]
      }
    ],
    lethalFlaws: [
      'Enttarnte GPT-Floskeln („in der heutigen schnelllebigen Welt“, „ganzheitlicher Ansatz“)',
      'Fehlende Risikoumkehr oder Amortisations-Garantie für das CFO-Audit',
      'Extrem monotone Satzlängen (Burstiness: 4.1) ohne emotionalen Kauf-Impuls'
    ],
    worstQuote: '„In der heutigen schnelllebigen Welt bieten wir Ihnen einen ganzheitlichen Ansatz für nahtlose Workflows...“',
    masterCopy: `# DIE 14-TAGE SAAS-AMORTISATION

Schluss mit theoretischem Tool-Chaos.
Wer im Bereich KI-Automatisierung heute noch Standard-Schnittstellen schaltet, verbrennt bis zu 40% seines Budgets durch kognitive Reibung. Wir beenden das. Heute.

## Der verifizierte Mechanismus
Unsere Architektur bricht die Skepsis Ihrer Entscheider in der ersten Sekunde. 
Messbare Spezifität.
Klare Zahlen.
Und null KI-Floskeln.

- 100% DSGVO-konform: ISO 27001 zertifizierte Server in Frankfurt am Main.
- Garantiertes ROI-Audit: Amortisiert sich innerhalb von 14 Tagen oder volle Rückabwicklung.
- Keine versteckten Kosten: Transparente Festpreise ohne Lizenzfallen.

[ JETZT DEN 4-PERSONA STRESSTEST STARTEN → ]`,
    executivePitch: `Moin [Gründer / Geschäftsführer],

ich habe Ihren aktuellen Webauftritt für saas-flow-matrix.io gestern Abend durch unsere synthetische Fokusgruppe aus 4 feindlichen Käufer-Personas und einen deterministischen Slop-Forensik-Filter gejagt.

Das System hat 3 kritische Conversion-Lecks markiert:
1. Enttarnte GPT-Floskeln („in der heutigen schnelllebigen Welt“, „ganzheitlicher Ansatz“)
2. Hohes Absprung-Risiko beim CFO durch fehlenden Amortisations-Nachweis
3. Monotone Satzstrukturen auf Mobilgeräten

Der initiale Conversion-Score lag bei mageren 54/100 Punkten.

Hier ist der direkt für Sie gehärtete Hero-Hook als freies Geschenk zur sofortigen Verwendung:
> "Schluss mit theoretischem Tool-Chaos. Wer im Bereich KI-Automatisierung heute noch Standard-Schnittstellen schaltet, verbrennt bis zu 40% seines Budgets durch kognitive Reibung."

Wenn Sie wollen, dass ich Ihren gesamten Funnel einmal komplett durch den OMEGA Master-Stresstest jage, lassen Sie es mich kurz wissen.

Beste Grüße aus Hamburg,
Erik Gieske`,
    proposal: {
      recommendedPackage: 'Pre-Launch Autopsy (950 €)',
      price: 950,
      deliverables: [
        '4-Persona Stresstest + Slop-Sanitization',
        'Executive Dossier & High-Ticket Cold Pitch',
        'Schlüsselfertige Master-Copy (Hero, Mechanismus, CTA)'
      ],
      timeline: 'Fertigstellung in 48 Stunden',
      roiGuarantee: 'Mindestens 92 Punkte im Re-Audit oder 100% Geld zurück.'
    }
  }
];

const SEED_LEADS: Lead[] = [
  {
    id: 'lead-1',
    url: 'https://growth-consulting-nord.de',
    name: 'Torben Nielsen',
    email: 't.nielsen@growth-consulting-nord.de',
    niche: 'B2B Unternehmensberatung',
    objections: 'Kunden zögern bei Tagessätzen über 2.000 €, hohe Vergleichbarkeit',
    createdAt: '2026-10-22T09:15:00Z',
    status: 'Auditiert',
  },
  {
    id: 'lead-2',
    url: 'https://apex-logistics-cloud.io',
    name: 'Dr. Sarah Weimann',
    email: 's.weimann@apex-cloud.com',
    niche: 'Supply Chain SaaS',
    objections: 'Lange Vertriebszyklen, unklare ERP-Integration',
    createdAt: '2026-10-22T14:40:00Z',
    status: 'Gepitcht',
  }
];

const SEED_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'OMG-20261021-4821',
    date: '21.10.2026',
    dueDate: '04.11.2026',
    clientName: 'SaaS Matrix GmbH',
    clientEmail: 'billing@saas-matrix.io',
    projectName: 'Landingpage Stresstest & Copy-Härtung',
    packageKey: 'pre-launch',
    packageName: 'Pre-Launch Autopsy',
    packageDesc: '4-Persona Stresstest + Slop-Sanitization + Executive Dossier + Cold-Pitch',
    net: 950,
    vatRate: 0.19,
    vatAmount: 180.50,
    gross: 1130.50,
    notes: 'Zahlbar innerhalb von 14 Tagen ohne Abzug.',
    status: 'Bezahlt'
  }
];

export function getDossiers(): AuditRun[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOSSIERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DOSSIERS, JSON.stringify(SEED_DOSSIERS));
      return SEED_DOSSIERS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_DOSSIERS;
  }
}

export function saveDossier(dossier: AuditRun): void {
  const all = getDossiers();
  const updated = [dossier, ...all.filter(d => d.id !== dossier.id)];
  localStorage.setItem(STORAGE_KEYS.DOSSIERS, JSON.stringify(updated));
}

export function getLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(SEED_LEADS));
      return SEED_LEADS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_LEADS;
  }
}

export function saveLead(lead: Lead): void {
  const all = getLeads();
  const updated = [lead, ...all.filter(l => l.id !== lead.id)];
  localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
}

export function updateLeadStatus(id: string, status: Lead['status']): void {
  const all = getLeads();
  const updated = all.map(l => l.id === id ? { ...l, status } : l);
  localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
}

export function getInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(SEED_INVOICES));
      return SEED_INVOICES;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_INVOICES;
  }
}

export function saveInvoice(invoice: Invoice): void {
  const all = getInvoices();
  const updated = [invoice, ...all.filter(i => i.id !== invoice.id)];
  localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(updated));
}

export function getOllamaSettings(): OllamaSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.OLLAMA);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.OLLAMA, JSON.stringify(DEFAULT_OLLAMA_SETTINGS));
      return DEFAULT_OLLAMA_SETTINGS;
    }
    return { ...DEFAULT_OLLAMA_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_OLLAMA_SETTINGS;
  }
}

export function saveOllamaSettings(settings: OllamaSettings): void {
  localStorage.setItem(STORAGE_KEYS.OLLAMA, JSON.stringify(settings));
}

