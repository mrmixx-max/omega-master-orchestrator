export type PipelineMode = 'omega' | 'swarm' | 'sanitize';
export type MarketLanguage = 'de' | 'en';

export interface SlopMetrics {
  burstiness: number;
  avgSentenceWords: number;
  slopHits: string[];
  hitCount: number;
  slopToxicity: number;
  monotonyPenalty: number;
  phrasePenalty: number;
}

export interface PersonaCritique {
  id: 'BURNED_SKEPTIC' | 'RUTHLESS_CFO' | 'ADHD_SCROLLER' | 'DOMAIN_PEDANT';
  title: string;
  focus: string;
  critique: string[];
  worstElement: string;
  score: number;
}

export interface AuditRun {
  id: string;
  timestamp: string;
  targetSource: string;
  niche: string;
  style: string;
  objections: string;
  pipelineMode: PipelineMode;
  market?: MarketLanguage;
  
  // Scores
  convScoreBefore: number;
  convScoreAfter: number;
  slopToxicityBefore: number;
  slopToxicityAfter: number;
  burstinessBefore: number;
  burstinessAfter: number;
  humanScoreAfter: number;
  loopsUsed: number;
  
  // Detailed metrics
  metricsBefore: SlopMetrics;
  metricsAfter: SlopMetrics;
  
  // Critique & outputs
  personas: PersonaCritique[];
  lethalFlaws: string[];
  worstQuote: string;
  masterCopy: string;
  executivePitch: string;
  proposal: {
    recommendedPackage: string;
    price: number;
    currency?: string;
    deliverables: string[];
    timeline: string;
    roiGuarantee: string;
  };
}

export interface Lead {
  id: string;
  url: string;
  name: string;
  email: string;
  niche: string;
  objections: string;
  createdAt: string;
  status: 'Neu' | 'In Bearbeitung' | 'Auditiert' | 'Gepitcht' | 'Gewonnen';
  auditId?: string;
  market?: MarketLanguage;
}

export interface InvoiceItem {
  id: string;
  name: string;
  desc: string;
  price: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientEmail: string;
  projectName: string;
  packageKey: string;
  packageName: string;
  packageDesc: string;
  net: number;
  vatRate: number;
  vatAmount: number;
  gross: number;
  currency?: string;
  notes?: string;
  status: 'Entwurf' | 'Versendet' | 'Bezahlt';
}

export interface BatchItem {
  id: string;
  url: string;
  company: string;
  niche: string;
  contactName: string;
  status: 'Bereit' | 'Läuft' | 'Abgeschlossen' | 'Fehler';
  convScore?: number;
  slopScore?: number;
  pitchSnippet?: string;
  market?: MarketLanguage;
}

export interface OllamaModel {
  id: string;
  name: string;
  tag: string;
  size: string;
  category: 'Empfohlen' | 'Reasoning' | 'Schnell' | 'Enterprise' | 'Benutzerdefiniert';
  description: string;
  contextLength: string;
  recommendedFor: string;
}

export interface OllamaSettings {
  apiUrl: string;
  selectedModel: string;
  customModelName: string;
  temperature: number;
  topP: number;
  connectionStatus: 'connected' | 'checking' | 'disconnected' | 'demo';
  latencyMs?: number;
}

export type EmailTone = 'c_level' | 'direct' | 'consultative';
export type EmailSalutation = 'sie' | 'du';

export interface ClientEmailOptions {
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  senderName: string;
  senderTitle: string;
  tone: EmailTone;
  salutation: EmailSalutation;
  subjectIndex: number;
  customSubject?: string;
  customNotes?: string;
  lang?: MarketLanguage;
}

export interface ClientAttachment {
  id: 'report_html' | 'swipe_md' | 'sprint_md' | 'landingpage_html';
  filename: string;
  title: string;
  description: string;
  format: 'HTML' | 'MD';
  badge: string;
}

export type ColdOutreachChannel = 'email' | 'loom' | 'linkedin' | 'phone' | 'breakup';

export interface ColdOutreachStep {
  step: number;
  channel: ColdOutreachChannel;
  title: string;
  timing: string;
  badge: string;
  goal: string;
  subjectOrOpener: string;
  script: string;
  actionAdvice: string;
}

export interface ColdOutreachSequence {
  leadId?: string;
  company: string;
  targetUrl: string;
  niche: string;
  contactName: string;
  slopPhrase: string;
  hardenedHook: string;
  convScore: number;
  convDelta: number;
  market: MarketLanguage;
  steps: ColdOutreachStep[];
}


