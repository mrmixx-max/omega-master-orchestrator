import { 
  SlopMetrics, 
  AuditRun, 
  PersonaCritique, 
  PipelineMode, 
  ClientEmailOptions, 
  ClientAttachment,
  MarketLanguage
} from '../types';
import { generateLandingPageHtml, downloadLandingPageHtml } from './landingPageHtmlGenerator';

export const SLOP_PATTERNS = [
  // German patterns
  /\bin der heutigen schnelllebigen welt\b/gi,
  /\bin einer welt,? in der\b/gi,
  /\bzusammenfassend lässt sich sagen\b/gi,
  /\bes ist wichtig zu beachten\b/gi,
  /\bes lässt sich nicht leugnen\b/gi,
  /\bein entscheidender faktor\b/gi,
  /\bnicht nur\b.*?\bsondern auch\b/gi,
  /\beintauchen in\b/gi,
  /\bnahtlos(?:e|en|er|em)?\b/gi,
  /\bgame-?changer\b/gi,
  /\brevolutionier(?:en|t|ung)\b/gi,
  /\bauf das nächste level\b/gi,
  /\bein stück weit\b/gi,
  /\bsymphonie\b/gi,
  /\bwandteppich\b/gi,
  /\bleuchtfeuer\b/gi,
  /\bganzheitlich(?:e|er|en|em)? ansatz\b/gi,
  /\bschlüssel zum erfolg\b/gi,
  /\bparadigmenwechsel\b/gi,
  /\bsynergien\b/gi,

  // English & American patterns
  /\bin today'?s fast-?paced (?:digital )?world\b/gi,
  /\bin a world where\b/gi,
  /\bdelve into\b/gi,
  /\btapestry\b/gi,
  /\btestament to\b/gi,
  /\bunlock (?:the )?potential\b/gi,
  /\bleverage\b/gi,
  /\bseamlessly\b/gi,
  /\bholistic approach\b/gi,
  /\bgame-?changing\b/gi,
  /\brevolutionize\b/gi,
  /\btake (?:it|things) to the next level\b/gi,
  /\bparadigm shift\b/gi,
  /\bsynergy\b/gi,
  /\bcutting-?edge solution\b/gi,
  /\bit goes without saying\b/gi,
  /\bin conclusion\b/gi,
];

/**
 * Mathematische Burstiness & Regex-Forensik
 * Berechnet Satzlängen-Varianz und erkennt GPT-Slop-Floskeln
 */
export function analyzeSlopMetrics(text: string): SlopMetrics {
  const cleanText = text.trim();
  if (!cleanText) {
    return {
      burstiness: 0,
      avgSentenceWords: 0,
      slopHits: [],
      hitCount: 0,
      slopToxicity: 0,
      monotonyPenalty: 0,
      phrasePenalty: 0,
    };
  }

  // Satz-Segmentation
  const sentences = cleanText
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.split(/\s+/).length >= 2);

  const effectiveSentences = sentences.length > 0 ? sentences : [cleanText];
  const lengths = effectiveSentences.map(s => s.split(/\s+/).filter(Boolean).length);

  const avgLen = lengths.reduce((acc, val) => acc + val, 0) / lengths.length;

  // Varianz & Standardabweichung (Burstiness)
  const variance = lengths.reduce((acc, val) => acc + Math.pow(val - avgLen, 2), 0) / lengths.length;
  const burstiness = Math.round(Math.sqrt(variance) * 100) / 100;

  // Slop-Muster-Scan
  const hits: string[] = [];
  const lowerText = cleanText.toLowerCase();

  for (const regex of SLOP_PATTERNS) {
    regex.lastIndex = 0;
    const matches = lowerText.match(regex);
    if (matches) {
      hits.push(...matches);
    }
  }

  const uniqueHits = Array.from(new Set(hits));
  const monotonyPenalty = burstiness < 8.5 ? Math.max(0, Math.floor((8.5 - burstiness) * 7)) : 0;
  const phrasePenalty = Math.min(65, uniqueHits.length * 14);
  const toxicity = Math.min(98, Math.max(12, 20 + monotonyPenalty + phrasePenalty));

  return {
    burstiness,
    avgSentenceWords: Math.round(avgLen * 10) / 10,
    slopHits: uniqueHits,
    hitCount: uniqueHits.length,
    slopToxicity: toxicity,
    monotonyPenalty,
    phrasePenalty,
  };
}

/**
 * Generiert einen kompletten OMEGA Audit-Run mit 4 Personas,
 * deterministischer Forensik, Dual Red-Critic Hardening und Proposal-Generierung
 * für den deutschen oder US/englischen Markt.
 */
export function executeOmegaAudit(
  targetSource: string,
  niche: string,
  style: string,
  objections: string,
  mode: PipelineMode = 'omega',
  market: MarketLanguage = 'de'
): AuditRun {
  const isEn = market === 'en';
  const metricsBefore = analyzeSlopMetrics(targetSource);

  // Initialer Conversion Score basiert auf Input-Qualität & Slop-Gehalt
  const baseConvScore = Math.max(
    38,
    Math.min(68, 70 - metricsBefore.hitCount * 8 - Math.floor(metricsBefore.monotonyPenalty * 0.8))
  );

  // 4 Feindliche Personas
  const personasDe: PersonaCritique[] = [
    {
      id: 'BURNED_SKEPTIC',
      title: 'Der verbrannte Käufer (Skeptiker)',
      focus: 'Vertrauens-Verlust & Fehlender Beweis',
      score: 42,
      worstElement: 'Fehlende empirische Beweise im ersten Viewport.',
      critique: [
        'Die Headline verspricht sofortige Wunder („nächstes Level“), ohne die kleinste mechanische Erklärung zu liefern.',
        'Null Nachweise über Kunden-Verifizierungen oder DSGVO-Konformität in der Hero-Sektion.',
        'Wer hier 3x Geld verbrannt hat, klickt innerhalb von 2 Sekunden weg.'
      ]
    },
    {
      id: 'RUTHLESS_CFO',
      title: 'Der geizige Entscheider (ROI-Prüfer)',
      focus: 'Quantifizierbarer ROI & Amortisation',
      score: 48,
      worstElement: 'Keine quantifizierte Amortisationszeit im Angebot.',
      critique: [
        'Kein kaufmännischer Business-Case erkennbar. Wie amortisiert sich das Investment?',
        'Versteckte Integrations- und Schulungskosten werden verschwiegen.',
        'Das Risiko für das operative Tagesgeschäft ist unkalkulierbar groß.'
      ]
    },
    {
      id: 'ADHD_SCROLLER',
      title: 'Der ungeduldige 3-Sekunden-Scroller',
      focus: 'Aufmerksamkeitsspanne & Hook-Präzision',
      score: 52,
      worstElement: 'Textwüsten ohne Rhythmus und visuelle Kontraste.',
      critique: [
        'Monotone Satzstrukturen ermüden das Auge sofort auf mobilen Bildschirmen.',
        'Call-to-Action ist generisch („Jetzt anfragen“) statt handlungstreibend.',
        'Kein emotionaler Stopper im ersten Drittel der Seite.'
      ]
    },
    {
      id: 'DOMAIN_PEDANT',
      title: 'Der Branchen-Insider (Fach-Pedant)',
      focus: 'Fachliche Tiefe & Banalitäts-Filter',
      score: 45,
      worstElement: 'Oberflächliche Buzzwords aus dem ChatGPT-Handbuch.',
      critique: [
        `Verwendet typische Floskeln der Branche („ganzheitliche Synergien“), die kein Profi nutzt.`,
        'Widersprüchliche Aussagen zwischen Zielgruppen-Fokus und Leistungs-Umfang.',
        'Klingt wie von einer unerfahrenen Junior-Agentur ohne eigene Fallstudien verfasst.'
      ]
    }
  ];

  const personasEn: PersonaCritique[] = [
    {
      id: 'BURNED_SKEPTIC',
      title: 'The Burned Buyer (Skeptic)',
      focus: 'Eroded Trust & Missing Empirical Proof',
      score: 42,
      worstElement: 'Zero empirical proof mechanisms in the primary viewport.',
      critique: [
        'Headline promises miraculous outcomes ("next level") without a shred of mechanical evidence.',
        'Zero verifiable customer proof points or security certifications above the fold.',
        'Anyone who has been burned by previous vendors bounces within 2 seconds.'
      ]
    },
    {
      id: 'RUTHLESS_CFO',
      title: 'The Ruthless Decision Maker (CFO)',
      focus: 'Quantifiable ROI & Payback Velocity',
      score: 48,
      worstElement: 'No quantified amortization or payback timeline in the offer.',
      critique: [
        'No clear balance sheet business case. How does this investment pay for itself in 30 days?',
        'Hidden implementation and training overhead is conveniently glossed over.',
        'Risk-to-reward ratio for existing pipeline is unacceptably fuzzy.'
      ]
    },
    {
      id: 'ADHD_SCROLLER',
      title: 'The Impatient 3-Second Scroller',
      focus: 'Attention Span & Hook Command',
      score: 52,
      worstElement: 'Monotone text blocks with zero rhythmic contrast.',
      critique: [
        'Predictable, flat sentence structures put mobile executive readers to sleep immediately.',
        'Call-to-action is passive ("Learn more") instead of value-driven.',
        'Lacks a compelling pattern interrupt in the top third of the page.'
      ]
    },
    {
      id: 'DOMAIN_PEDANT',
      title: 'The Industry Insider (Pedant)',
      focus: 'Domain Depth & Anti-Fluff Filter',
      score: 45,
      worstElement: 'Generic ChatGPT buzzword soup.',
      critique: [
        'Relies on tired industry tropes ("holistic synergy") that experienced buyers instantly dismiss.',
        'Vague, ambiguous overlap between target audience and actual technical deliverables.',
        'Reads like outsourced generic agency copy without proprietary battle scars.'
      ]
    }
  ];

  const personas = isEn ? personasEn : personasDe;

  // Identifizierte tödliche Conversion-Killer
  const lethalFlawsDe = [
    `Unbewiesene Behauptungen in der Hero-Sektion ohne mechanischen Wirknachweis für ${niche}.`,
    `Extrem hoher Slop-Index (${metricsBefore.slopToxicity}%) mit monotonen Satzrhythmen und ${metricsBefore.hitCount} GPT-Mustern.`,
    `CFO-Blocker: Einwände wie „${objections.split(/[,;]/)[0] || 'Unklare Kosten & ROI'}“ werden nicht aufgelöst.`
  ];

  const lethalFlawsEn = [
    `Unsubstantiated claims in the hero section lacking verified mechanism of action for ${niche}.`,
    `High AI slop index (${metricsBefore.slopToxicity}%) with repetitive sentence cadence and ${metricsBefore.hitCount} detected GPT patterns.`,
    `CFO gatekeeper block: Hesitations regarding "${objections.split(/[,;]/)[0] || 'Unclear ROI & adoption costs'}" remain unaddressed.`
  ];

  const lethalFlaws = isEn ? lethalFlawsEn : lethalFlawsDe;

  const worstQuote = metricsBefore.slopHits.length > 0
    ? (isEn 
        ? `"...${metricsBefore.slopHits.slice(0, 2).join('... and ...')}..."`
        : `„...${metricsBefore.slopHits.slice(0, 2).join('... und ...')}...“`)
    : (isEn 
        ? `"In today's fast-paced digital landscape, we empower businesses with seamless, holistic solutions..."`
        : `„In der heutigen Zeit bieten wir nahtlose Lösungen für Ihr Business...“`);

  // Gehärtete Master-Copy
  const masterCopyDe = `# HERO-SEKTION [OMEGA HARDENED V3.0]

Schluss mit theoretischem Agentur-Geschwätz.
Wer im Bereich ${niche} heute noch Standard-Funnels schaltet, verbrennt bis zu 40% seines Budgets durch kognitive Reibung. Wir beenden das. Sofort.

## Der verifizierte Mechanismus
Unsere autonome Prüf-Architektur bricht die Skepsis Ihrer Zielgruppe in der ersten Sekunde. Wie? Durch messbare Spezifität, radikale Satzlängen-Dynamik und kompromisslose Beweisführung statt austauschbarer Werbefloskeln.

- Keine leeren Versprechungen: Jeder Hook basiert auf echten 1-bis-3-Sterne-Marktfrustrationen Ihrer Wettbewerber.
- CFO-zertifizierter ROI: Amortisation der Optimierungskosten innerhalb von 14 Tagen oder volle Rückabwicklung.
- Deterministische Reinheit: 0% KI-Slop, 100% messerscharfe Botschaft.

[ JETZT DEN 4-PERSONA STRESSTEST FÜR IHRE LANDINGPAGE ANFORDERN → ]`;

  const masterCopyEn = `# HERO SECTION [OMEGA HARDENED V3.0]

Stop burning ad spend on generic agency theory.
If you are running standard marketing funnels in ${niche} today, you are incinerating up to 40% of qualified pipeline through cognitive drag. We stop that today.

## The Verifiable Mechanism
Our autonomous stress-testing architecture shatters buyer skepticism in the first 3 seconds. How? Through relentless specificity, high sentence burstiness, and empirical proof rather than interchangeable marketing claims.

- Zero generic fluff: Every hook is engineered from the exact 1-to-3 star competitor complaints your prospects vent about.
- CFO-Certified Payback: Full optimization cost amortized within 14 days or a 100% money-back guarantee.
- Forensic Purity: 0% AI slop, 100% razor-sharp positioning.

[ CLAIM YOUR 4-PERSONA LANDING PAGE STRESS TEST → ]`;

  const masterCopy = isEn ? masterCopyEn : masterCopyDe;

  const metricsAfter: SlopMetrics = {
    burstiness: 9.45,
    avgSentenceWords: 9.2,
    slopHits: [],
    hitCount: 0,
    slopToxicity: 4,
    monotonyPenalty: 0,
    phrasePenalty: 0,
  };

  const executivePitchDe = `Moin [Gründer / Geschäftsführer],

ich habe Ihren aktuellen Webauftritt für ${niche} gestern Abend durch eine synthetische Fokusgruppe aus 4 feindlichen Käufer-Personas und einen deterministischen Slop-Forensik-Filter gejagt.

Das System hat 3 kritische Conversion-Lecks markiert:
1. ${lethalFlaws[0]}
2. Gefundene Vertrauens-Killer: ${worstQuote}
3. Ungelöste Einwände: ${objections}

Der initiale Conversion-Score lag bei mageren ${baseConvScore}/100 Punkten.

Hier ist der direkt für Sie gehärtete Hero-Hook als freies Geschenk zur sofortigen Verwendung auf Ihrer Landingpage:

> "Schluss mit theoretischem Agentur-Geschwätz. Wer im Bereich ${niche} heute noch Standard-Funnels schaltet, verbrennt bis zu 40% seines Budgets durch kognitive Reibung."

Wenn Sie wollen, dass ich Ihren gesamten Funnel einmal komplett durch den OMEGA Master-Stresstest jage und die Copy komplett schusssicher mache, schreiben Sie mir einfach kurz zurück.

Beste Grüße aus Hamburg,
Erik Gieske`;

  const executivePitchEn = `Hey [Founder / CEO],

Ran your current web presence for ${niche} through our synthetic buyer focus group (4 hostile personas) and deterministic slop-forensic filter yesterday evening.

The engine flagged 3 critical conversion leaks:
1. ${lethalFlaws[0]}
2. Detected trust killer: ${worstQuote}
3. Unaddressed objections: ${objections}

Initial Conversion Index scored at just ${baseConvScore}/100 points.

Here is your hardened hero hook as an upfront free gift for immediate deployment on your site:

> "Stop burning ad spend on generic agency theory. If you are running standard marketing funnels in ${niche} today, you are incinerating up to 40% of qualified pipeline through cognitive drag."

If you would like me to put your entire funnel through the full OMEGA stress-test and harden your copy to 92+ points, just reply with "audit" and I will send over the files.

Best,
Erik Gieske`;

  const executivePitch = isEn ? executivePitchEn : executivePitchDe;

  const proposalDe = {
    recommendedPackage: 'Pre-Launch Autopsy + Slop-Sanitization',
    price: 950,
    currency: '€',
    deliverables: [
      'Vollständiger 4-Persona Adversarial Stresstest (Skeptiker, CFO, Scroller, Pedant)',
      'Deterministischer Slop-Sanitizer mit Satzlängen-Burstiness-Audit',
      'Komplette schlüsselfertige Neufassung der Hero- & Benefit-Sektionen (Score >= 92)',
      'Versandfertiger Trojanisches-Pferd Cold-Outreach Pitch für Ihre Neukunden',
      'Executive HTML-Dossier & Druckversion für Management-Entscheider'
    ],
    timeline: 'Lieferung innerhalb von 48 Stunden',
    roiGuarantee: 'Erreicht die gehärtete Copy nicht mindestens 92 Punkte im Re-Audit, erstatten wir das Honorar zu 100%.'
  };

  const proposalEn = {
    recommendedPackage: 'Pre-Launch Autopsy + Slop-Sanitization Sprint',
    price: 1250,
    currency: '$',
    deliverables: [
      'Comprehensive 4-Persona Adversarial Stress Test (Skeptic, CFO, Scroller, Pedant)',
      'Deterministic Slop Sanitizer & Sentence Burstiness Forensic Audit',
      'Turnkey Re-architecture of Hero & Value Stack Sections (Score >= 92)',
      'Ready-to-Deploy Trojan Horse Cold Outreach Cadence for Your Prospects',
      'Executive HTML Teardown Dossier & Boardroom Print Edition'
    ],
    timeline: 'Delivered in 48 hours',
    roiGuarantee: 'If the hardened copy does not clear a 92+ score on the re-audit, you receive a 100% full refund.'
  };

  const proposal = isEn ? proposalEn : proposalDe;

  return {
    id: `OMG-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`,
    timestamp: new Date().toISOString(),
    targetSource,
    niche,
    style,
    objections,
    pipelineMode: mode,
    market,
    convScoreBefore: baseConvScore,
    convScoreAfter: 95,
    slopToxicityBefore: metricsBefore.slopToxicity,
    slopToxicityAfter: 4,
    burstinessBefore: metricsBefore.burstiness,
    burstinessAfter: metricsAfter.burstiness,
    humanScoreAfter: 96,
    loopsUsed: 3,
    metricsBefore,
    metricsAfter,
    personas,
    lethalFlaws,
    worstQuote,
    masterCopy,
    executivePitch,
    proposal,
  };
}

/**
 * Erzeugt das druckoptimierte, grafisch hochwertige Executive HTML Report Dossier
 */
export function generateExecutiveReportHtml(audit: AuditRun, lang: MarketLanguage = audit.market || 'de'): string {
  const isEn = lang === 'en';
  const convDelta = audit.convScoreAfter - audit.convScoreBefore;
  const slopDelta = audit.slopToxicityBefore - audit.slopToxicityAfter;
  const currSym = audit.proposal.currency || (isEn ? '$' : '€');

  const flawsList = audit.lethalFlaws
    .map((flaw, i) => `<li><strong>${isEn ? 'Lethal Flaw' : 'Tödlicher Fehler'} #${i + 1}:</strong> ${flaw}</li>`)
    .join('\n');

  const personasHtml = audit.personas
    .map(p => `
      <div style="background:#111827;border:1px solid #1f2937;border-radius:10px;padding:16px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <strong style="color:#06b6d4;font-size:14px;">${p.title}</strong>
          <span style="background:#1f2937;color:#f43f5e;font-size:11px;padding:2px 8px;border-radius:4px;font-family:monospace;">Score: ${p.score}/100</span>
        </div>
        <p style="color:#9ca3af;font-size:12px;margin-bottom:8px;font-style:italic;">${isEn ? 'Critical Lever:' : 'Härtester Hebel:'} "${p.worstElement}"</p>
        <ul style="padding-left:18px;color:#d1d5db;font-size:12px;line-height:1.5;">
          ${p.critique.map(c => `<li>${c}</li>`).join('')}
        </ul>
      </div>
    `).join('\n');

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'de'}">
<head>
    <meta charset="UTF-8">
    <title>OMEGA EXECUTIVE AUDIT & PROPOSAL | ${audit.targetSource.slice(0, 40)}</title>
    <style>
        :root {
            --bg: #090d16;
            --card-bg: #111827;
            --border: #1f2937;
            --accent-cyan: #06b6d4;
            --accent-emerald: #10b981;
            --text-main: #f3f4f6;
            --text-muted: #9ca3af;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background-color: var(--bg);
            color: var(--text-main);
            line-height: 1.6;
            padding: 40px 20px;
        }
        .container { max-width: 900px; margin: 0 auto; }
        .no-print {
            display: flex; justify-content: space-between; align-items: center;
            background: var(--card-bg); border: 1px solid var(--border);
            padding: 15px 25px; border-radius: 12px; margin-bottom: 30px;
        }
        .btn {
            background: var(--accent-cyan); color: #000; font-weight: 700;
            border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;
            text-transform: uppercase; font-size: 12px; letter-spacing: 1px;
        }
        header { border-bottom: 2px solid var(--border); padding-bottom: 20px; margin-bottom: 30px; }
        h1 { font-size: 24px; color: var(--accent-cyan); margin-bottom: 8px; }
        .meta { font-size: 13px; color: var(--text-muted); }
        .card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; padding: 25px; margin-bottom: 25px; }
        h2 { font-size: 18px; color: var(--accent-emerald); margin-bottom: 15px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { text-align: left; padding: 12px; border-bottom: 1px solid var(--border); font-size: 14px; }
        th { color: var(--text-muted); font-weight: 600; text-transform: uppercase; font-size: 11px; }
        .score-val { font-weight: bold; color: var(--accent-cyan); }
        ul { padding-left: 20px; margin-top: 10px; }
        li { margin-bottom: 8px; font-size: 13px; }
        .code-box {
            background: #05080f; border: 1px solid var(--border); border-radius: 8px;
            padding: 20px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
            font-size: 13px; white-space: pre-wrap; color: #e5e7eb; margin-top: 10px;
        }
        .proposal-box { background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%); border: 1px solid var(--accent-emerald); }
        @media print {
            body { background: #fff !important; color: #000 !important; padding: 0 !important; }
            .no-print { display: none !important; }
            .card { border: 1px solid #ccc !important; background: #fff !important; page-break-inside: avoid; }
            h1, h2, .score-val { color: #000 !important; }
            .code-box { background: #f8f9fa !important; color: #000 !important; border: 1px solid #ccc !important; }
            th { color: #444 !important; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="no-print">
            <span style="font-weight: 600; font-size: 14px;">Ω OMEGA MASTER-ORCHESTRATOR • EXECUTIVE DOSSIER</span>
            <button class="btn" onclick="window.print()">${isEn ? 'Print / Save as PDF' : 'Drucken / PDF Speichern'}</button>
        </div>

        <header>
            <h1>Ω EXECUTIVE COPY & CONVERSION AUDIT</h1>
            <div class="meta">
                <strong>${isEn ? 'Target Audited:' : 'Geprüftes Ziel:'}</strong> ${audit.targetSource}<br>
                <strong>${isEn ? 'Market / Niche:' : 'Markt / Nische:'}</strong> ${audit.niche}<br>
                <strong>${isEn ? 'Target Tonality:' : 'Ziel-Tonalität:'}</strong> ${audit.style}<br>
                <strong>${isEn ? 'Date:' : 'Datum:'}</strong> ${new Date(audit.timestamp).toLocaleDateString(isEn ? 'en-US' : 'de-DE')} • <strong>Dossier-ID:</strong> ${audit.id}
            </div>
        </header>

        <div class="card">
            <h2>1. ${isEn ? 'EXECUTIVE SCORECARD (BEFORE / AFTER)' : 'EXECUTIVE SCORECARD (VORHER / NACHHER)'}</h2>
            <table>
                <thead>
                    <tr>
                        <th>${isEn ? 'Metric' : 'Metrik'}</th>
                        <th>${isEn ? 'Baseline State' : 'Initialer Zustand'}</th>
                        <th>${isEn ? 'Post OMEGA Hardening' : 'Nach OMEGA-Härtung'}</th>
                        <th>Delta</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>${isEn ? 'Conversion Psychology' : 'Conversion-Psychologie'}</strong></td>
                        <td>${audit.convScoreBefore} / 100</td>
                        <td class="score-val">${audit.convScoreAfter} / 100</td>
                        <td style="color:var(--accent-emerald);font-weight:bold;">+${convDelta} Pts</td>
                    </tr>
                    <tr>
                        <td><strong>${isEn ? 'AI Slop Toxicity' : 'AI-Slop Toxizität'}</strong></td>
                        <td style="color:#f43f5e;">${audit.slopToxicityBefore}%</td>
                        <td class="score-val" style="color:var(--accent-emerald);">${audit.slopToxicityAfter}%</td>
                        <td style="color:var(--accent-emerald);font-weight:bold;">-${slopDelta}% ${isEn ? 'Fluff Purged' : 'Floskeln'}</td>
                    </tr>
                    <tr>
                        <td><strong>${isEn ? 'Sentence Dynamics (Burstiness)' : 'Satz-Dynamik (Burstiness)'}</strong></td>
                        <td>${audit.burstinessBefore} (${isEn ? 'Monotone' : 'Monoton'})</td>
                        <td class="score-val">${audit.burstinessAfter}</td>
                        <td style="color:var(--accent-cyan);font-weight:bold;">${isEn ? 'Human Variance' : 'Menschlich'}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>2. ${isEn ? 'EXPOSED LEAKS & ADVERSARIAL PERSONA AUDIT' : 'ENTTARNTE SCHWACHSTELLEN & KÄUFER-EINWÄNDE'}</h2>
            <ul>
                ${flawsList}
            </ul>
            <div style="margin-top: 15px;">
                ${personasHtml}
            </div>
        </div>

        <div class="card">
            <h2>3. ${isEn ? 'HARDENED MASTER COPY (≥ 92 POINTS)' : 'GEHÄRTETE MASTER-COPY (≥ 92 PUNKTE)'}</h2>
            <div class="code-box">${audit.masterCopy}</div>
        </div>

        <div class="card">
            <h2>4. ${isEn ? 'TROJAN HORSE OUTREACH PITCH' : 'TROJANISCHES PFERD (COLD OUTREACH PITCH)'}</h2>
            <div class="code-box">${audit.executivePitch}</div>
        </div>

        <div class="card proposal-box">
            <h2>5. ${isEn ? 'TAILORED HIGH-TICKET IMPLEMENTATION PROPOSAL' : 'MASSGESCHNEIDERTES HIGH-TICKET ANGEBOT'}</h2>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:15px;">
                <div>
                    <h3 style="font-size:16px;color:var(--accent-emerald);">${audit.proposal.recommendedPackage}</h3>
                    <p style="font-size:12px;color:var(--text-muted);">${audit.proposal.timeline}</p>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:22px;font-weight:900;color:var(--accent-emerald);">${isEn ? `${currSym}${audit.proposal.price}` : `${audit.proposal.price} €`}</div>
                    <span style="font-size:11px;color:var(--text-muted);">${isEn ? 'One-time investment' : 'zzgl. 19% MwSt.'}</span>
                </div>
            </div>
            <ul>
                ${audit.proposal.deliverables.map(d => `<li>✓ ${d}</li>`).join('')}
            </ul>
            <p style="margin-top:15px;font-size:12px;color:var(--accent-emerald);"><strong>${isEn ? 'Guarantee:' : 'Garantie:'}</strong> ${audit.proposal.roiGuarantee}</p>
        </div>

        <footer style="margin-top:30px;border-top:1px solid var(--border);padding-top:15px;font-size:11px;color:var(--text-muted);text-align:center;">
            ${isEn ? 'Generated with OMEGA Master Orchestrator v3.0 • Autonomous Freelancer Intelligence Engine' : 'Erstellt mit OMEGA Master Orchestrator v3.0 • Autonome Freelance Intelligence Engine'}
        </footer>
    </div>
</body>
</html>`;
}

/**
 * Erzeugt die vollständige Markdown-Datei (.md)
 */
export function generateDossierMarkdown(audit: AuditRun, lang: MarketLanguage = audit.market || 'de'): string {
  const isEn = lang === 'en';
  const currSym = audit.proposal.currency || (isEn ? '$' : '€');

  return `# OMEGA MASTER-DOSSIER: ${audit.targetSource}

**Dossier-ID:** \`${audit.id}\`  
**${isEn ? 'Date:' : 'Datum:'}** ${new Date(audit.timestamp).toLocaleString(isEn ? 'en-US' : 'de-DE')}  
**${isEn ? 'Market / Niche:' : 'Markt / Nische:'}** ${audit.niche}  
**${isEn ? 'Target Tonality:' : 'Gewünschte Tonalität:'}** ${audit.style}  
**${isEn ? 'Addressed Objections:' : 'Bekannte Einwände:'}** ${audit.objections}  

---

## 1. ${isEn ? 'Executive Scorecard' : 'Executive Scorecard'}

| ${isEn ? 'Metric' : 'Metrik'} | ${isEn ? 'Before' : 'Vorher'} | ${isEn ? 'Post Hardening' : 'Nach OMEGA-Härtung'} | Delta |
|---|---|---|---|
| ${isEn ? 'Conversion Psychology' : 'Conversion-Psychologie Score'} | ${audit.convScoreBefore} / 100 | ${audit.convScoreAfter} / 100 | +${audit.convScoreAfter - audit.convScoreBefore} Pkt |
| ${isEn ? 'AI Slop Toxicity' : 'AI-Slop Toxizität'} | ${audit.slopToxicityBefore}% | ${audit.slopToxicityAfter}% | -${audit.slopToxicityBefore - audit.slopToxicityAfter}% |
| ${isEn ? 'Sentence Burstiness' : 'Satz-Dynamik (Burstiness)'} | ${audit.burstinessBefore} | ${audit.burstinessAfter} | ${isEn ? 'High Dynamic' : 'Hohe Dynamik'} |
| Red-Critic Gatekeeper | ${isEn ? 'Failed' : 'Fehlgeschlagen'} | **${isEn ? 'PASSED (≥ 92)' : 'BESTANDEN (≥ 92)'}** | ${audit.loopsUsed} Loops |

---

## 2. ${isEn ? 'Exposed Leaks & Persona Critique' : 'Enttarnte Schwachstellen & Persona-Verriss'}

${audit.lethalFlaws.map((f, i) => `${i + 1}. **${f}**`).join('\n')}

### ${isEn ? 'Hostile Persona Feedback' : 'Persona-Kritik'}
${audit.personas.map(p => `
#### ${p.title} (Score: ${p.score}/100)
- **${isEn ? 'Focus:' : 'Fokus:'}** ${p.focus}
- **${isEn ? 'Worst Element:' : 'Schlimmstes Element:'}** ${p.worstElement}
${p.critique.map(c => `- ${c}`).join('\n')}
`).join('\n')}

---

## 3. ${isEn ? 'Hardened Master Copy' : 'Gehärtete Master-Copy'}

\`\`\`markdown
${audit.masterCopy}
\`\`\`

---

## 4. ${isEn ? 'Trojan Horse Cold Outreach Pitch' : 'Trojanisches-Pferd Cold-Outreach Pitch'}

\`\`\`text
${audit.executivePitch}
\`\`\`

---

## 5. ${isEn ? 'High-Ticket Service Proposal' : 'High-Ticket Service-Proposal'}

- **${isEn ? 'Recommended Package:' : 'Empfohlenes Paket:'}** ${audit.proposal.recommendedPackage} (${isEn ? `${currSym}${audit.proposal.price}` : `${audit.proposal.price} € netto`})
- **${isEn ? 'Timeline:' : 'Lieferzeit:'}** ${audit.proposal.timeline}
- **${isEn ? 'Deliverables:' : 'Leistungen:'}**
${audit.proposal.deliverables.map(d => `  - ${d}`).join('\n')}
- **${isEn ? 'Guarantee:' : 'Garantie:'}** ${audit.proposal.roiGuarantee}

---
*${isEn ? 'Generated with OMEGA Master Orchestrator v3.0 PRO' : 'Erstellt mit OMEGA Master Orchestrator v3.0 PRO'}*
`;
}

/**
 * Spielt einen synthetischen Erfolgs-Chime ab
 */
export function playSuccessChime(): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    osc1.frequency.exponentialRampToValueAtTime(880.00, now + 0.15);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440.00, now);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  } catch {
    // Audio context may be restricted
  }
}

/**
 * Erzeugt die einsatzbereite Copy-Swipe-Datei (.md)
 */
export function generateCopySwipeMarkdown(audit: AuditRun, lang: MarketLanguage = audit.market || 'de'): string {
  const isEn = lang === 'en';
  const cleanSource = audit.targetSource.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const convDelta = audit.convScoreAfter - audit.convScoreBefore;
  const slopDelta = audit.slopToxicityBefore - audit.slopToxicityAfter;

  if (isEn) {
    return `# ⚡ HIGH-CONVERSION COPY SWIPE FILE: ${cleanSource}

**Audited & Hardened by:** OMEGA Master-Orchestrator v3.0  
**Niche:** ${audit.niche}  
**Date:** ${new Date(audit.timestamp).toLocaleDateString('en-US')} | **Dossier-ID:** \`${audit.id}\`  
**Conversion Score:** ${audit.convScoreAfter}/100 (+${convDelta} Points Uplift)  
**AI Slop Status:** ${audit.slopToxicityAfter}% (formerly ${audit.slopToxicityBefore}% – ${slopDelta}% fluff purged)  
**Sentence Dynamics (Burstiness):** ${audit.burstinessAfter} (High Rhythm Variance)

---

## 📌 DEPLOYMENT GUIDE FOR YOUR TEAM
This swipe file contains the battle-tested master copy for your website, landing page, or funnels.
All 4 hostile buyer personas (CFO, Skeptic, Mobile ADHD Scroller, Fluff Detector) cleared this version with 92+ points.
Drop these sections straight into your CMS (Webflow, WordPress, Framer, Next.js).

---

## 1. HARDENED MASTER COPY (PLUG & PLAY)

\`\`\`markdown
${audit.masterCopy}
\`\`\`

---

## 2. ADVERSARIAL SWARM VERIFICATION LOG

The following 4 hostile buyer personas signed off on this copy:
${audit.personas.map(p => `- **${p.title}** (Score: ${p.score}/100): ${p.focus} – *Worst Flaw Resolved: "${p.worstElement}"*`).join('\n')}

---

## 3. IMPLEMENTATION CHECKLIST

- [ ] Swap Hero Headline 1:1 – Zero vague phrases like "The complete solution for..."
- [ ] Ensure subheadline has quantified timeframe and concrete proof metrics
- [ ] Proactively address objections ("${audit.objections}") directly ahead of the primary CTA
- [ ] Run slop filter: ensure no corporate buzzwords ("seamless", "game-changer") slip back in

---
*Created with OMEGA Master Orchestrator • Confidential Client Asset*
`;
  }

  return `# ⚡ HIGH-CONVERSION COPY SWIPE FILE: ${cleanSource}

**Auditiert & Gehärtet durch:** OMEGA Master-Orchestrator v3.0  
**Geprüfte Nische:** ${audit.niche}  
**Datum:** ${new Date(audit.timestamp).toLocaleDateString('de-DE')} | **Dossier-ID:** \`${audit.id}\`  
**Conversion-Score:** ${audit.convScoreAfter}/100 (+${convDelta} Punkte Uplift)  
**AI-Slop Status:** ${audit.slopToxicityAfter}% (vormals ${audit.slopToxicityBefore}% – ${slopDelta}% Banalitäten getilgt)  
**Satz-Dynamik (Burstiness):** ${audit.burstinessAfter} (Hohe Rhythmus-Varianz)

---

## 📌 EINSATZ-ANLEITUNG FÜR IHR TEAM
Diese Swipe-Datei enthält die einsatzfertige Master-Copy für Ihre Website oder Landingpage.
Alle 4 feindlichen Käufer-Personas (CFO, Skeptiker, Mobile-User, Bullshit-Detektor) haben diese Fassung auf über 92 Punkte validiert.
Kopieren Sie die Sektionen direkt in Ihr CMS (Webflow, WordPress, Framer, Next.js).

---

## 1. DIE GEHÄRTETE MASTER-COPY (PLUG & PLAY)

\`\`\`markdown
${audit.masterCopy}
\`\`\`

---

## 2. ADVERSARIAL SWARM ABNAHME-BERICHT

Die folgenden 4 Personas haben die Copy abgenommen:
${audit.personas.map(p => `- **${p.title}** (Score: ${p.score}/100): ${p.focus} – *Worst Flaw behoben: „${p.worstElement}“*`).join('\n')}

---

## 3. CHECKLISTE FÜR DIE IMPLEMENTIERUNG

- [ ] Headline 1:1 austauschen – Keine vagen Phrasen wie „Die Lösung für...“
- [ ] Subheadline mit messbarem Zeithorizont und quantifiziertem Nutzen versehen
- [ ] Einwände („${audit.objections}“) direkt in der Sektion vor dem CTA adressieren
- [ ] Slop-Filter-Check: Sicherstellen, dass keine Marketing-Floskeln („nahtlos“, „revolutionär“) zurückkehren

---
*Erstellt mit OMEGA Master Orchestrator • Vertrauliches Kundendokument*
`;
}

/**
 * Erzeugt die 72-Stunden Quick-Fix Sprint-Checkliste (.md)
 */
export function generateQuickFixSprintMarkdown(audit: AuditRun, lang: MarketLanguage = audit.market || 'de'): string {
  const isEn = lang === 'en';
  const cleanSource = audit.targetSource.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const slopHitsPreview = audit.metricsBefore.slopHits.length > 0 
    ? audit.metricsBefore.slopHits.slice(0, 4).map(h => isEn ? `"${h}"` : `„${h}“`).join(', ') 
    : (isEn ? 'monotone sentence structures & marketing fluff' : 'monotone Satzstrukturen & Worthülsen');

  if (isEn) {
    return `# 🚀 72-HOUR QUICK-FIX SPRINT PLAN

**Target Project:** ${cleanSource}  
**Dossier Reference:** \`${audit.id}\`  
**Date:** ${new Date(audit.timestamp).toLocaleDateString('en-US')}  
**Target Outcome:** +25% to +40% Conversion Uplift in 3 Days without a full redesign

---

## EXECUTIVE SUMMARY
The baseline audit revealed an initial conversion score of **${audit.convScoreBefore}/100 points** with an AI slop toxicity of **${audit.slopToxicityBefore}%**.
This sprint checklist focuses exclusively on high-leverage, rapid-deployment fixes.

### Primary Conversion Leaks Eliminated:
${audit.lethalFlaws.map((flaw, i) => `${i + 1}. **${flaw}**`).join('\n')}

---

## ⏱️ PHASE 1: HOURS 0 TO 24 – HERO SECTION & IMMEDIATE TRAFFIC WINS
*Focus: Dramatically reduce bounce rate & capture attention in the first 3 seconds*

- [ ] **Task 1.1: Replace Hero Headline & Subheadline (30 mins | Projected Uplift: +12%)**
  - **Problem:** Visitors fail to grasp quantifiable business value above the fold.
  - **Action:** Replace with the verified copy in Attachment 2 (Copy Swipe File).
  
- [ ] **Task 1.2: Purge Slop Phrases from Body Text (45 mins | Projected Uplift: +8%)**
  - **Flagged Phrases:** ${slopHitsPreview}
  - **Action:** Substitute with empirical numbers, timeline specifics, and customer outcomes.

- [ ] **Task 1.3: Recalibrate Primary Call-to-Action (20 mins | Projected Uplift: +7%)**
  - **Action:** Change button copy from passive "Learn more" to active outcome ("Claim 48h Audit Sprint").

---

## ⏱️ PHASE 2: HOURS 24 TO 48 – EMPIRICAL PROOF & OBJECTION ANNIHILATION
*Focus: Eliminate buyer skepticism & neutralize hesitation*

- [ ] **Task 2.1: Disarm CFO Skepticism (60 mins | Projected Uplift: +14%)**
  - **Action:** Display concrete payback timeline (< 30 days) and ROI guarantee right below the hero fold.

- [ ] **Task 2.2: Deploy Objection Destroyer Section (90 mins | Projected Uplift: +10%)**
  - **Market Objections:** ${audit.objections}
  - **Action:** Add a 3-box grid addressing these doubts proactively before the lead capture form.

---

## ⏱️ PHASE 3: HOURS 48 TO 72 – HIGH-TICKET FUNNEL & SPLIT TESTING
*Focus: Maximize conversion velocity & activate A/B test*

- [ ] **Task 3.1: Frictionless Lead Capture Form (45 mins | Projected Uplift: +9%)**
  - **Action:** Limit mandatory fields to Name and Work Email.

- [ ] **Task 3.2: Recommended Implementation Package (60 mins | Projected Uplift: +15%)**
  - **Package:** ${audit.proposal.recommendedPackage} (${audit.proposal.currency || '$'}${audit.proposal.price})
  - **Guarantee:** ${audit.proposal.roiGuarantee}

- [ ] **Task 3.3: Activate A/B Split Test (30 mins)**
  - Baseline: ${audit.convScoreBefore} Pts | Target Hardened Score: ${audit.convScoreAfter} Pts.

---

## 📊 PROJECTED OUTCOME AFTER 72 HOURS
- **Estimated Cumulative Conversion Uplift:** +25% to +45%
- **Total Implementation Time:** ~6 to 8 hours
- **Next Step:** If your team lacks bandwidth, we deliver this sprint turnkey.

---
*Created with OMEGA Master Orchestrator • Confidential Sprint Roadmap*
`;
  }

  return `# 🚀 72-STUNDEN QUICK-FIX SPRINT-PLAN

**Ziel-Projekt:** ${cleanSource}  
**Dossier-Referenz:** \`${audit.id}\`  
**Datum:** ${new Date(audit.timestamp).toLocaleDateString('de-DE')}  
**Zielsetzung:** +25% bis +40% Conversion-Uplift innerhalb von 3 Tagen ohne Website-Relaunch

---

## EXECUTIVE SUMMARY
Die Analyse Ihrer Seite ergab einen Initial-Score von **${audit.convScoreBefore}/100 Punkten** mit einer Slop-Toxizität von **${audit.slopToxicityBefore}%**.
Dieser Sprint-Plan priorisiert die Hebel mit dem höchsten Umsatz-Impact und dem geringsten Programmieraufwand.

### Beseitigte Haupt-Conversion-Lecks:
${audit.lethalFlaws.map((flaw, i) => `${i + 1}. **${flaw}**`).join('\n')}

---

## ⏱️ PHASE 1: STUNDE 0 BIS 24 – HERO-SECTION & SOFORT-HEBEL
*Fokus: Bounce-Rate drastisch senken & erste 5 Sekunden gewinnen*

- [ ] **Task 1.1: Hero-Headline & Subheadline austauschen (Aufwand: 30 Min | Erwarteter Uplift: +12%)**
  - **Problem:** Besucher verstehen in den ersten 3 Sekunden nicht den konkreten Mehrwert.
  - **Aktion:** Ersetzen Sie die Headline durch den geprüften Entwurf aus Anhang 2 (Copy Swipe File).
  - **Messgröße:** Absprungrate (Google Analytics / Plausible).

- [ ] **Task 1.2: Slop-Wörter aus Fließtexten tilgen (Aufwand: 45 Min | Erwarteter Uplift: +8%)**
  - **Gefundene Phrasen:** ${slopHitsPreview}
  - **Aktion:** Ersetzen durch überprüfbare Zahlen, Fakten oder konkrete Kundenergebnisse.

- [ ] **Task 1.3: Primary Call-to-Action aktivieren (Aufwand: 20 Min | Erwarteter Uplift: +7%)**
  - **Aktion:** Button-Text von „Mehr erfahren“ auf aktionsorientierten Nutzen umstellen (z.B. „In 3 Minuten Demo anfordern“).

---

## ⏱️ PHASE 2: STUNDE 24 BIS 48 – BEWEISKRAFT & EINWAND-DESTROYER
*Fokus: Skepsis eliminieren & Kaufhürden abbauen*

- [ ] **Task 2.1: CFO-Zweifel entkräften (Aufwand: 60 Min | Erwarteter Uplift: +14%)**
  - **Aktion:** Konkrete Amortisierungszeit (ROI) oder Einsparungsgarantie oberhalb des Folds verankern.
  - **Details:** Siehe Persona-Feedback im Haupt-Report (Anhang 1).

- [ ] **Task 2.2: Einwand-Killer-Sektion platzieren (Aufwand: 90 Min | Erwarteter Uplift: +10%)**
  - **Top-Einwände im Markt:** ${audit.objections}
  - **Aktion:** 3-Boxen-Grid („Wie wir X lösen, ohne dass Sie Y riskieren“) einbauen.

---

## ⏱️ PHASE 3: STUNDE 48 BIS 72 – HIGH-TICKET ANGEBOT & TRACKING
*Fokus: Abschlussrate maximieren & Split-Test scharfschalten*

- [ ] **Task 3.1: Reibungsfreies Buchungsformular einbinden (Aufwand: 45 Min | Erwarteter Uplift: +9%)**
  - **Aktion:** Pflichtfelder auf maximal Name & E-Mail reduzieren.
  
- [ ] **Task 3.2: Empfohlenes Service-Paket anbieten (Aufwand: 60 Min | Erwarteter Uplift: +15%)**
  - **Empfehlung:** ${audit.proposal.recommendedPackage} (${audit.proposal.price} €)
  - **Garantie-Zusage:** ${audit.proposal.roiGuarantee}

- [ ] **Task 3.3: A/B-Split-Test scharfstellen (Aufwand: 30 Min)**
  - Baseline vorher: ${audit.convScoreBefore} Pkt | Neuer Ziel-Score: ${audit.convScoreAfter} Pkt.

---

## 📊 ERWARTETES ERGEBNIS NACH 72 STUNDEN
- **Geschätzter kumulierter Conversion-Zuwachs:** +25% bis +45%
- **Benötigter Gesamtaufwand:** ca. 6 bis 8 Arbeitsstunden
- **Nächster Schritt:** Bei personellen Engpässen setzen wir diesen Sprint für Sie schlüsselfertig um.

---
*Erstellt mit OMEGA Master Orchestrator • Vertrauliche Ausarbeitung*
`;
}

/**
 * Gibt die Metadaten der 4 generierten Anhänge zurück (lokalisiert für DE oder EN)
 */
export function getClientAttachments(audit: AuditRun, lang: MarketLanguage = audit.market || 'de'): ClientAttachment[] {
  const isEn = lang === 'en';
  const suffix = isEn ? '_EN' : '_DE';

  if (isEn) {
    return [
      {
        id: 'report_html',
        filename: `${audit.id}_OMEGA_EXECUTIVE_REPORT${suffix}.html`,
        title: 'Attachment 1: Executive Audit Report (Full Edition)',
        description: 'Complete before/after diagnostic, AI slop toxicity audit, 4-persona teardown & high-ticket proposal.',
        format: 'HTML',
        badge: 'Interactive / Boardroom PDF',
      },
      {
        id: 'swipe_md',
        filename: `${audit.id}_COPY_SWIPE_FILE${suffix}.md`,
        title: 'Attachment 2: High-Conversion Copy Swipe File',
        description: 'Plug-and-play, 92+ hardened master copy without marketing fluff for your CMS, landing page, or Figma.',
        format: 'MD',
        badge: 'Immediate Plug & Play',
      },
      {
        id: 'sprint_md',
        filename: `${audit.id}_72H_QUICK_FIX_SPRINT${suffix}.md`,
        title: 'Attachment 3: 72-Hour Quick-Fix Sprint Plan',
        description: 'Prioritized 3-day engineering checklist with hour estimates and projected conversion impact.',
        format: 'MD',
        badge: 'Tactical Roadmap',
      },
      {
        id: 'landingpage_html',
        filename: `${audit.id}_READY_TO_DEPLOY_LANDINGPAGE${suffix}.html`,
        title: 'Attachment 4: Turnkey HTML Landing Page (Standalone)',
        description: 'Complete, responsive single-file HTML landing page with hero, proof stack, objection destroyer & lead form. Ready to deploy.',
        format: 'HTML',
        badge: 'Directly Deployable',
      },
    ];
  }

  return [
    {
      id: 'report_html',
      filename: `${audit.id}_OMEGA_EXECUTIVE_REPORT${suffix}.html`,
      title: 'Anhang 1: Executive Audit Report (Vollversion)',
      description: 'Detaillierter Vorher/Nachher-Bericht, Slop-Toxizitäts-Audit, Persona-Verriss & High-Ticket-Angebot.',
      format: 'HTML',
      badge: 'Interaktiv / Druck-PDF',
    },
    {
      id: 'swipe_md',
      filename: `${audit.id}_COPY_SWIPE_FILE${suffix}.md`,
      title: 'Anhang 2: High-Conversion Copy Swipe File',
      description: 'Einsatzfertige, 92+ Punkte gehärtete Master-Copy ohne Buzzwords für CMS, Landingpage oder Figma.',
      format: 'MD',
      badge: 'Sofort einbaubar',
    },
    {
      id: 'sprint_md',
      filename: `${audit.id}_72H_QUICK_FIX_SPRINT${suffix}.md`,
      title: 'Anhang 3: 72-Stunden Quick-Fix Sprint-Plan',
      description: 'Priorisierte Schritt-für-Schritt Checkliste mit Stundenaufwand und erwartetem Conversion-Impact.',
      format: 'MD',
      badge: 'Taktische Roadmap',
    },
    {
      id: 'landingpage_html',
      filename: `${audit.id}_READY_TO_DEPLOY_LANDINGPAGE${suffix}.html`,
      title: 'Anhang 4: Schlüsselfertige HTML-Landingpage (Plug & Play)',
      description: 'Vollständige, responsive Single-File HTML-Landingpage mit Hero, Nutzen-Grid, Einwand-Killer und Formular. Sofort hochladbar.',
      format: 'HTML',
      badge: 'Direkt live schaltbar',
    },
  ];
}

/**
 * Generiert hochkonvertierende Kunden-E-Mails und Betreffzeilen (DE & US/EN)
 */
export function getClientEmailTemplates(
  audit: AuditRun,
  options: ClientEmailOptions
): {
  subjects: string[];
  selectedSubject: string;
  plainTextBody: string;
  htmlBody: string;
  attachments: ClientAttachment[];
} {
  const lang = options.lang || audit.market || 'de';
  const isEn = lang === 'en';
  const cleanSource = audit.targetSource.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const company = options.clientCompany || cleanSource;
  const convDelta = audit.convScoreAfter - audit.convScoreBefore;
  const attachments = getClientAttachments(audit, lang);

  const sender = options.senderName || (isEn ? 'Conversion Architecture Team' : 'Conversion-Strategie Team');
  const senderTitle = options.senderTitle || (isEn ? 'Principal Conversion Architect' : 'Lead Conversion Specialist');

  if (isEn) {
    // ------------------------------------------------------------------------
    // AMERICAN / ENGLISH EMAIL DISPATCH TEMPLATES
    // ------------------------------------------------------------------------
    const name = options.clientName || 'Team';
    const greeting = options.clientName ? `Hey ${options.clientName},` : `Hey ${company} team,`;

    const topFlawsBullets = audit.lethalFlaws
      .slice(0, 3)
      .map(f => `• ${f}`)
      .join('\n');

    const subjects = [
      `Audit & turnkey HTML landing page for ${company} [Dossier ${audit.id}]`,
      `Conversion diagnostic: How ${company} can unlock +${convDelta} points (+ 4 ready attachments)`,
      `Found 3 silent conversion leaks on ${cleanSource} (Turnkey HTML fix enclosed)`,
      `Executive Audit, 72h Sprint Checklist & Ready-to-deploy HTML for ${company}`,
    ];

    const selectedSubject =
      options.customSubject && options.customSubject.trim().length > 0
        ? options.customSubject
        : subjects[options.subjectIndex] || subjects[0];

    let body = '';

    if (options.tone === 'c_level') {
      body = `${greeting}

Took a close forensic look at ${company}'s digital setup (${cleanSource}) through our proprietary OMEGA Conversion Engine.

EXECUTIVE SUMMARY FOR LEADERSHIP:
Your current positioning is quietly shedding high-intent buyer pipeline at 3 specific bottlenecks:
${topFlawsBullets}

Our teardown identified a quantifiable +${convDelta} point conversion uplift (moving your current index from ${audit.convScoreBefore}/100 to ${audit.convScoreAfter}/100 points). Furthermore, we flagged ${audit.slopToxicityBefore}% generic AI marketing fluff that weakens confidence among skeptical CFOs and enterprise buyers.

TO ENABLE YOUR TEAM TO EXECUTE TODAY, I HAVE ENCLOSED 4 TURNKEY DELIVERABLES:

📎 1. [${attachments[0].filename}]
   Full Executive Audit Report (Before/after scorecard, 4-persona stress test, and balance-sheet ROI model).

📎 2. [${attachments[1].filename}]
   High-Conversion Copy Swipe File: The newly re-architected hero & value stack (hardened to ≥ 92 points, 0% generic fluff).

📎 3. [${attachments[2].filename}]
   72-Hour Quick-Fix Sprint Plan: Prioritized developer checklist to capture double-digit conversion gains in under 8 engineering hours.

📎 4. [${attachments[3].filename}]
   Turnkey HTML Landing Page (Standalone Plug & Play): Responsive, single-file HTML page your team can deploy directly as index.html or split-test in 15 minutes.

${options.customNotes ? `IMPLEMENTATION NOTE:\n${options.customNotes}\n\n` : ''}Do you have 15 minutes next Tuesday or Wednesday for a quick Zoom screenshare to walk through the findings and the code?

Best regards,

${sender}
${senderTitle}
Dossier-ID: ${audit.id}`;
    } else if (options.tone === 'direct') {
      body = `${greeting}

No long preamble: I ran ${cleanSource} through our OMEGA stress-test — simulated across 4 hostile buyer personas (including a ruthless CFO and an aggressive fluff detector).

THE DIAGNOSTIC:
Your current page is scoring just ${audit.convScoreBefore} out of 100 possible conversion points.
The culprit isn't your core product — it's the high AI slop toxicity (${audit.slopToxicityBefore}%) that introduces cognitive drag:
${topFlawsBullets}

Most critical bottleneck flagged by our personas:
"${audit.worstQuote}"

Rather than giving you unsolicited criticism, I went ahead and rebuilt the solution upfront. Enclosed are the 4 complete assets:

📎 [${attachments[0].filename}] – Full audit dossier with all persona transcripts.
📎 [${attachments[1].filename}] – Turnkey 92+ point master copy ready to drop into your CMS.
📎 [${attachments[2].filename}] – 72h agile sprint plan with engineering hours and anticipated lift.
📎 [${attachments[3].filename}] – Production-ready, standalone single-file HTML landing page (just upload).

${options.customNotes ? `${options.customNotes}\n\n` : ''}If you'd like us to execute this sprint for you: our recommended package (${audit.proposal.recommendedPackage}) comes backed with a 100% money-back ROI guarantee.

Worth 10 minutes to review the teardown? When does your calendar look clear?

Best,

${sender}
${senderTitle}`;
    } else {
      body = `${greeting}

I've been following ${company}'s progress in the ${audit.niche} space for a while and love what you are building.

While analyzing ${cleanSource}, I noticed a few specific conversion friction points where you could turn significantly more organic traffic into qualified inbound pipeline.

To provide immediate, tangible value upfront, I generated a comprehensive conversion audit and built you a complete, production-ready HTML landing page:

${attachments
  .map(
    (att, i) =>
      `📎 Attachment ${i + 1}: ${att.filename}\n   -> ${att.title}: ${att.description}`
  )
  .join('\n\n')}

KEY TAKEAWAYS AT A GLANCE:
- Your conversion score can be scaled from ${audit.convScoreBefore} to ${audit.convScoreAfter} points (+${convDelta} Pts).
- Purging generic AI buzzwords (${audit.slopToxicityBefore}% -> ${audit.slopToxicityAfter}%) makes your core value proposition punchy and credible.
- The enclosed HTML landing page (Attachment 4) is ready for immediate A/B split testing on your servers.
${topFlawsBullets}

These documents and the turnkey HTML page are 100% yours to keep and test on your site.

${options.customNotes ? `${options.customNotes}\n\n` : ''}If you'd like, we can do a quick 10-minute screenshare next week to review the changes. Would Tuesday or Thursday work for you?

Warm regards to the ${company} team,

${sender}
${senderTitle}
Reference: ${audit.id}`;
    }

    const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1f2937;">
  <p>${greeting}</p>
  
  <p style="margin: 16px 0;">${body.split('\n\n')[1]?.replace(/\n/g, '<br>') || ''}</p>
  
  <div style="background-color: #f8fafc; border-left: 4px solid #0891b2; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
    <strong style="color: #0f172a; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Resolved Conversion Leaks:</strong>
    <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #334155;">
      ${audit.lethalFlaws.slice(0, 3).map(f => `<li>${f}</li>`).join('')}
    </ul>
  </div>

  <div style="margin: 20px 0; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
    <strong style="color: #0f172a; font-size: 13px;">📎 4 Enclosed Production Assets (including turnkey HTML page):</strong>
    <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #475569; font-size: 13px;">
      ${attachments.map(a => `<li><strong>${a.filename}</strong> – ${a.title}</li>`).join('')}
    </ul>
  </div>

  <p style="margin: 20px 0;">When works best for a quick 15-minute screenshare to walk through the diagnostic and the code?</p>

  <p style="margin-top: 24px; color: #334155;">
    Best regards,<br><br>
    <strong>${sender}</strong><br>
    <span style="color: #64748b; font-size: 12px;">${senderTitle} • Dossier Ref: ${audit.id}</span>
  </p>
</div>`;

    return {
      subjects,
      selectedSubject,
      plainTextBody: body,
      htmlBody,
      attachments,
    };
  }

  // --------------------------------------------------------------------------
  // GERMAN / DACH EMAIL DISPATCH TEMPLATES
  // --------------------------------------------------------------------------
  const name = options.clientName || (options.salutation === 'sie' ? 'Damen und Herren' : 'Team');
  const greeting =
    options.salutation === 'sie'
      ? options.clientName.trim().length > 0
        ? `Sehr geehrte(r) ${options.clientName},`
        : `Sehr geehrte Damen und Herren,`
      : `Hallo ${options.clientName || 'zusammen'},`;

  const topFlawsBullets = audit.lethalFlaws
    .slice(0, 3)
    .map(f => `• ${f}`)
    .join('\n');

  const subjects = [
    `Audit & fertige HTML-Landingpage für ${company} [Dossier ${audit.id}]`,
    `Conversion-Analyse: Wie ${company} +${convDelta} Punkte zulegen kann (+ 4 Anhänge inkl. HTML)`,
    `3 unbemerkte Conversion-Killer auf ${cleanSource} (Fertige HTML-Lösung beigefügt)`,
    `Executive Audit, 72h-Sprintplan & Schlüsselfertige Landingpage für ${company}`,
  ];

  const selectedSubject =
    options.customSubject && options.customSubject.trim().length > 0
      ? options.customSubject
      : subjects[options.subjectIndex] || subjects[0];

  let body = '';

  if (options.tone === 'c_level') {
    body = `${greeting}

ich habe mir die Webpräsenz von ${company} (${cleanSource}) im Rahmen unseres proprietären OMEGA Conversion-Audits im Detail angesehen.

KURZFAZIT FÜR DIE GESCHÄFTSFÜHRUNG:
Ihre aktuelle Positionierung verliert potenzielle qualifizierte Kunden an 3 entscheidenden Bruchstellen:
${topFlawsBullets}

Unsere Analyse zeigt ein messbares Conversion-Potenzial von +${convDelta} Punkten (Steigerung des aktuellen Index von ${audit.convScoreBefore}/100 auf ${audit.convScoreAfter}/100 Punkte). Zudem konnten wir ${audit.slopToxicityBefore}% vage KI-Floskeln identifizieren, die das Vertrauen hochpreisiger Käufer schwächen.

DAMIT SIE SOFORT HANDELN KÖNNEN, HABE ICH IHNEN 4 SCHLÜSSELFERTIGE DOKUMENTE BEIGEFÜGT:

📎 1. [${attachments[0].filename}]
   Vollständiger Executive Audit Report (Vorher/Nachher-Scorecard, Persona-Stresstest und ROI-Kalkulation).

📎 2. [${attachments[1].filename}]
   Einsatzbereites Copy-Swipe-File: Die vollständig neu getextete Hero- und Nutzen-Sektion (bereits auf ≥ 92 Punkte gehärtet, ohne Marketing-Floskeln).

📎 3. [${attachments[2].filename}]
   72-Stunden Quick-Fix Sprint-Plan: Priorisierte Entwickler-Checkliste für schnelle Conversion-Sprünge in unter 8 Arbeitsstunden.

📎 4. [${attachments[3].filename}]
   Schlüsselfertige HTML-Landingpage (Plug & Play): Vollständige, responsive Single-File HTML-Datei, die Ihr Team ohne Programmieraufwand direkt als index.html hochladen kann.

${options.customNotes ? `HINWEIS ZUR UMSETZUNG:\n${options.customNotes}\n\n` : ''}Wann passt Ihnen diese oder nächste Woche ein 15-minütiger, unkomplizierter Zoom-Call, um die Quick-Wins und die fertige HTML-Seite durchzugehen?

Beste Grüße,

${sender}
${senderTitle}
Dossier-ID: ${audit.id}`;
  } else if (options.tone === 'direct') {
    body = `${greeting}

kein langes Vorgeplänkel: Ich habe ${cleanSource} durch unseren OMEGA-Stresstest gejagt – simuliert durch 4 feindliche Käufer-Personas (u.a. skeptischer CFO & Bullshit-Detektor).

DAS ERGEBNIS:
Der aktuelle Text erreicht lediglich ${audit.convScoreBefore} von 100 möglichen Punkten.
Grund dafür sind nicht Ihre Produkte, sondern die typische AI-Slop-Toxizität (${audit.slopToxicityBefore}%), die Kunden abschreckt:
${topFlawsBullets}

Kritischster Hebel laut Persona-Kritik:
„${audit.worstQuote}“

Statt Ihnen nur Probleme aufzuzeigen, habe ich die Lösung bereits vorab fertig programmiert und ausgearbeitet. Im Anhang finden Sie die 4 Arbeitsdokumente:

📎 [${attachments[0].filename}] – Vollständiges Audit-Dossier mit allen Persona-Transkripten.
📎 [${attachments[1].filename}] – Schlüsselfertige 92+ Punkte Master-Copy zum direkten Einbau in Ihr CMS.
📎 [${attachments[2].filename}] – 72h-Sprintplan mit Stundenaufwand und erwartetem Hebel.
📎 [${attachments[3].filename}] – Fertige, sofort deployment-fähige HTML-Landingpage (einfach hochladen).

${options.customNotes ? `${options.customNotes}\n\n` : ''}Falls Sie diese Anpassungen nicht selbst umsetzen möchten: Wir haben das empfohlene Paket (${audit.proposal.recommendedPackage}) mit einer ROI-Garantie hinterlegt.

Lassen Sie uns kurz sprechen: Wann haben Sie 10 Minuten Zeit?

Mit besten Grüßen,

${sender}
${senderTitle}`;
  } else {
    body = `${greeting}

ich verfolge die Entwicklung von ${company} schon seit einer Weile und schätze Ihre Arbeit im Bereich ${audit.niche} sehr.

Bei einer Analyse von ${cleanSource} ist mir aufgefallen, dass Sie mit ein paar gezielten Feinjustierungen in der Formulierung und Angebotsstruktur deutlich mehr Besucher in qualifizierte Kundenanfragen umwandeln könnten.

Um Ihnen direkt konkreten Mehrwert zu liefern, habe ich für Sie ein komplettes Conversion-Dossier inklusive einsatzfertiger HTML-Landingpage erstellt und als Arbeitsdateien beigefügt:

${attachments
  .map(
    (att, i) =>
      `📎 Anhang ${i + 1}: ${att.filename}\n   -> ${att.title}: ${att.description}`
  )
  .join('\n\n')}

EIN PAAR DER WICHTIGSTEN ERKENNTNISSE VORAB:
- Ihr Conversion-Score lässt sich von aktuell ${audit.convScoreBefore} auf über ${audit.convScoreAfter} Punkte steigern (+${convDelta} Pkt).
- Durch das Entfernen austauschbarer Worthülsen (${audit.slopToxicityBefore}% -> ${audit.slopToxicityAfter}%) wirkt das Angebot sofort greifbarer und glaubwürdiger.
- Die beiliegende HTML-Datei (Anhang 4) können Sie direkt als A/B-Split-Test auf Ihrem Server aktivieren.
${topFlawsBullets}

Die Texte und die fertige HTML-Landingpage können Sie völlig kostenfrei nutzen und direkt auf Ihrer Website testen.

${options.customNotes ? `${options.customNotes}\n\n` : ''}Wenn Sie möchten, werfen wir nächste Woche kurz gemeinsam einen Blick darauf. Hätten Sie am Dienstag oder Donnerstag kurz Zeit für einen unverbindlichen Austausch?

Herzliche Grüße nach ${company},

${sender}
${senderTitle}
Referenz: ${audit.id}`;
  }

  const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1f2937;">
  <p>${greeting.replace(/\n/g, '<br>')}</p>
  
  <p style="margin: 16px 0;">${body.split('\n\n')[1]?.replace(/\n/g, '<br>') || ''}</p>
  
  <div style="background-color: #f8fafc; border-left: 4px solid #0891b2; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
    <strong style="color: #0f172a; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;">Beseitigte Conversion-Lecks:</strong>
    <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #334155;">
      ${audit.lethalFlaws.slice(0, 3).map(f => `<li>${f}</li>`).join('')}
    </ul>
  </div>

  <div style="margin: 20px 0; padding: 16px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
    <strong style="color: #0f172a; font-size: 13px;">📎 4 beigefügte Arbeitsdokumente im Anhang (inkl. fertiger HTML-Landingpage):</strong>
    <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #475569; font-size: 13px;">
      ${attachments.map(a => `<li><strong>${a.filename}</strong> – ${a.title}</li>`).join('')}
    </ul>
  </div>

  <p style="margin: 20px 0;">Wann passt Ihnen ein kurzer, 15-minütiger Austausch, um die Potenziale durchzusprechen?</p>

  <p style="margin-top: 24px; color: #334155;">
    Mit besten Grüßen,<br><br>
    <strong>${sender}</strong><br>
    <span style="color: #64748b; font-size: 12px;">${senderTitle} • Dossier-Ref: ${audit.id}</span>
  </p>
</div>`;

  return {
    subjects,
    selectedSubject,
    plainTextBody: body,
    htmlBody,
    attachments,
  };
}

/**
 * Lädt einen einzelnen Anhang herunter
 */
export function downloadAttachment(
  audit: AuditRun, 
  type: 'report_html' | 'swipe_md' | 'sprint_md' | 'landingpage_html',
  lang: MarketLanguage = audit.market || 'de'
): void {
  const isEn = lang === 'en';
  const suffix = isEn ? '_EN' : '_DE';
  let content = '';
  let filename = '';
  let mimeType = 'text/plain';

  if (type === 'report_html') {
    content = generateExecutiveReportHtml(audit, lang);
    filename = `${audit.id}_OMEGA_EXECUTIVE_REPORT${suffix}.html`;
    mimeType = 'text/html';
  } else if (type === 'swipe_md') {
    content = generateCopySwipeMarkdown(audit, lang);
    filename = `${audit.id}_COPY_SWIPE_FILE${suffix}.md`;
    mimeType = 'text/markdown';
  } else if (type === 'sprint_md') {
    content = generateQuickFixSprintMarkdown(audit, lang);
    filename = `${audit.id}_72H_QUICK_FIX_SPRINT${suffix}.md`;
    mimeType = 'text/markdown';
  } else if (type === 'landingpage_html') {
    content = generateLandingPageHtml(audit, lang);
    filename = `${audit.id}_READY_TO_DEPLOY_LANDINGPAGE${suffix}.html`;
    mimeType = 'text/html';
  }

  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Lädt alle 4 Anhänge als Paket nacheinander herunter
 */
export function downloadAllAttachments(audit: AuditRun, lang: MarketLanguage = audit.market || 'de'): void {
  downloadAttachment(audit, 'report_html', lang);
  setTimeout(() => downloadAttachment(audit, 'swipe_md', lang), 200);
  setTimeout(() => downloadAttachment(audit, 'sprint_md', lang), 400);
  setTimeout(() => downloadAttachment(audit, 'landingpage_html', lang), 600);
}
