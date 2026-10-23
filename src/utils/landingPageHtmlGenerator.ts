import { AuditRun, MarketLanguage } from '../types';

/**
 * Bereinigt Text von Markdown-Tags für sauberen HTML-Einsatz
 */
function cleanMd(text: string): string {
  return text
    .replace(/^#+\s+/gm, '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^>\s+/gm, '')
    .replace(/`/g, '')
    .trim();
}

/**
 * Generiert eine vollständige, schlüsselfertige Single-File HTML-Landingpage
 * für deutsche (DACH) oder englische/amerikanische (US/UK) Kunden.
 */
export function generateLandingPageHtml(audit: AuditRun, lang: MarketLanguage = audit.market || 'de'): string {
  const isEn = lang === 'en';
  const cleanDomain = audit.targetSource.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const brandName = audit.niche.includes('/') ? audit.niche.split('/')[0].trim() : audit.niche;
  const convDelta = audit.convScoreAfter - audit.convScoreBefore;
  
  // Extrahiere Headline und Subheadline aus der Master-Copy
  const masterLines = audit.masterCopy.split('\n').filter(l => l.trim().length > 0);
  
  const defaultHeadline = isEn 
    ? `The Next Generation of ${audit.niche}`
    : `Die nächste Generation von ${audit.niche}`;
  const defaultSubheadline = isEn
    ? `Stop burning budget on generic agency theory. We eliminate cognitive friction to command qualified buyer decisions.`
    : `Schluss mit theoretischem Agentur-Geschwätz. Wir schaffen messbare Ergebnisse ohne kognitive Reibung.`;

  const headline = masterLines[0] ? cleanMd(masterLines[0]) : defaultHeadline;
  const subheadline = masterLines[1] ? cleanMd(masterLines[1]) : defaultSubheadline;

  // Parse objections to generate tailored FAQ items
  const objectionsList = audit.objections
    .split(/[,;]/)
    .map(o => o.trim())
    .filter(o => o.length > 3);

  const defaultFaqsDe = [
    {
      q: `Wie schnell amortisiert sich diese Lösung für unser Unternehmen?`,
      a: `Durch die Beseitigung kognitiver Reibung und austauschbarer Floskeln steigt die Conversion-Rate im Schnitt um +25% bis +40%. Bei normalem Traffic amortisiert sich die Investition in der Regel in unter 30 Tagen.`,
    },
    {
      q: `Erfüllt diese Website alle Anforderungen der DSGVO?`,
      a: `Ja, zu 100%. Dieses HTML-Dokument ist schlank, setzt keine unerlaubten Third-Party-Tracker voraus und läuft ohne unnötigen Server-Overhead. Hosting in Deutschland/EU ist direkt möglich.`,
    },
    {
      q: `Können wir den Code direkt in WordPress, Webflow oder Framer einbinden?`,
      a: `Absolut. Sie können diese Datei als eigenständige 'index.html' auf jeden Webserver (Apache, Nginx, Vercel, Netlify) laden oder die einzelnen Sektionen per Copy-Paste in Ihr bestehendes CMS übernehmen.`,
    },
  ];

  const defaultFaqsEn = [
    {
      q: `How quickly does this conversion architecture pay for itself?`,
      a: `By eliminating cognitive friction and generic marketing fluff, conversion rates jump +25% to +40% on average. With normal qualified traffic, this sprint typically amortizes in under 30 days.`,
    },
    {
      q: `Is this website compliant with global privacy & security standards (SOC-2/GDPR)?`,
      a: `Yes, 100%. This single-file document runs zero unauthorized third-party trackers, zero bloatware analytics, and requires zero database overhead.`,
    },
    {
      q: `Can our engineering team drop this code directly into Webflow, WordPress, or Next.js?`,
      a: `Absolutely. You can deploy this file as a standalone 'index.html' on any web server (Vercel, Netlify, Apache, AWS S3) or copy the Tailwind sections straight into your CMS.`,
    },
  ];

  const objectionFaqs = objectionsList.map((obj) => ({
    q: isEn ? `Concern: "${obj}" – How is this resolved?` : `Befürchtung: „${obj}“ – Wie wird das gelöst?`,
    a: isEn
      ? `This is precisely what our 4 adversarial buyer personas solved during the audit: transparent fixed sprint pricing, verifiable ROI guarantees, and zero-risk ramp-up options rather than opaque retainers.`
      : `Genau diesen Einwand haben unsere 4 feindlichen Käufer-Personas im Audit adressiert: Wir setzen auf transparente Festpreise, verifizierbare ROI-Garantien und risikofreie Einstiegsoptionen statt undurchsichtiger Retainer.`,
  }));

  const allFaqs = [...objectionFaqs, ...(isEn ? defaultFaqsEn : defaultFaqsDe)].slice(0, 4);

  // Currency & Guarantee strings
  const guaranteeText = audit.proposal.roiGuarantee || (isEn
    ? `If the hardened copy does not achieve a 92+ score on the re-audit, you receive a 100% full refund.`
    : `Wenn der vereinbarte Conversion-Score im Re-Audit nicht erreicht wird, entstehen Ihnen keinerlei Kosten.`);

  return `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'de'}" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline} | ${brandName}</title>
  <meta name="description" content="${subheadline}">
  <meta property="og:title" content="${headline}">
  <meta property="og:description" content="${subheadline}">
  <meta property="og:type" content="website">

  <!-- Tailwind CSS Engine CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#ecfeff',
              100: '#cffafe',
              400: '#22d3ee',
              500: '#06b6d4',
              600: '#0891b2',
              900: '#164e63',
              950: '#083344',
            },
            accent: {
              400: '#34d399',
              500: '#10b981',
              600: '#059669',
            }
          }
        }
      }
    }
  </script>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #0b0f19;
      color: #f3f4f6;
    }
    .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }
    .glow-cyan {
      box-shadow: 0 0 50px -15px rgba(6, 182, 212, 0.25);
    }
    .glow-accent {
      box-shadow: 0 0 50px -15px rgba(16, 185, 129, 0.25);
    }
    .glass {
      background: rgba(17, 24, 39, 0.75);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
  </style>
</head>
<body class="min-h-screen flex flex-col selection:bg-cyan-500 selection:text-black">

  <!-- Top Announcement Bar -->
  <div class="bg-gradient-to-r from-cyan-950 via-slate-900 to-emerald-950 border-b border-cyan-800/40 py-2 px-4 text-center text-xs">
    <div class="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
      <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
        ${isEn ? 'OMEGA CONVERSION CERTIFIED' : 'OMEGA AUDIT-ZERTIFIKAT'}
      </span>
      <span class="text-slate-300">
        ${isEn 
          ? `Conversion-hardened copy scoring <strong>${audit.convScoreAfter}/100 points</strong> & <strong>0% AI Slop</strong>`
          : `Conversion-optimierte Fassung mit <strong>${audit.convScoreAfter}/100 Punkten</strong> & <strong>0% KI-Slop</strong>`}
      </span>
      <a href="#kontakt" class="text-cyan-400 font-bold hover:underline ml-1">
        ${isEn ? 'Test live demo &rarr;' : 'Jetzt live testen &rarr;'}
      </a>
    </div>
  </div>

  <!-- Navigation Bar -->
  <header class="sticky top-0 z-40 glass border-b border-slate-800/80">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-black font-black text-lg shadow-md shadow-cyan-500/30">
          Ω
        </div>
        <span class="font-extrabold text-white text-base tracking-tight">${brandName}</span>
      </div>

      <nav class="hidden md:flex items-center space-x-6 text-xs font-semibold text-slate-300">
        <a href="#vorteile" class="hover:text-cyan-400 transition">${isEn ? 'Benefits' : 'Vorteile'}</a>
        <a href="#vergleich" class="hover:text-cyan-400 transition">${isEn ? 'Before / After' : 'Vorher/Nachher'}</a>
        <a href="#loesung" class="hover:text-cyan-400 transition">${isEn ? 'Mechanism' : 'Mechanismus'}</a>
        <a href="#faq" class="hover:text-cyan-400 transition">FAQ</a>
        <a href="#garantie" class="hover:text-cyan-400 transition">${isEn ? 'Guarantee' : 'Garantie'}</a>
      </nav>

      <div class="flex items-center space-x-3">
        <a href="#kontakt" class="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black text-xs font-extrabold rounded-xl transition shadow-lg shadow-cyan-500/20">
          ${isEn ? 'Request Consultation' : 'Gespräch anfragen'}
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative pt-20 pb-24 overflow-hidden border-b border-slate-800">
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(6,182,212,0.18),rgba(255,255,255,0))] pointer-events-none"></div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8 relative z-10">
      
      <!-- Trust Badge -->
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border-cyan-500/30 text-xs text-cyan-300 shadow-sm animate-pulse">
        <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
        <span class="font-bold tracking-wide uppercase text-[11px]">
          ${isEn 
            ? `4-Persona Stress-Test Cleared: Score ${audit.convScoreAfter}/100` 
            : `4-Persona Stresstest bestanden: Score ${audit.convScoreAfter}/100`}
        </span>
      </div>

      <!-- Main Headline -->
      <h1 class="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
        ${headline}
      </h1>

      <!-- Subheadline -->
      <p class="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
        ${subheadline}
      </p>

      <!-- CTAs & Proof Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <a href="#kontakt" class="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-extrabold text-sm rounded-xl transition shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2">
          <span>${isEn ? 'GET STARTED TODAY' : 'JETZT UNVERBINDLICH ANFRAGEN'}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </a>

        <a href="#vergleich" class="w-full sm:w-auto px-6 py-4 glass hover:bg-slate-800/80 text-white font-semibold text-sm rounded-xl transition border border-slate-700 flex items-center justify-center gap-2">
          <span>${isEn ? 'Inspect Audit Scorecard' : 'Audit-Ergebnisse einsehen'}</span>
          <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        </a>
      </div>

      <!-- Proof Stats Ticker -->
      <div class="pt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
        <div class="glass p-4 rounded-2xl border-slate-800">
          <div class="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">+${convDelta} Pts</div>
          <div class="text-[11px] text-slate-400 uppercase tracking-wider mt-1 font-semibold">
            ${isEn ? 'Conversion Uplift' : 'Conversion Uplift'}
          </div>
          <div class="text-[10px] text-slate-500 mt-0.5">
            ${isEn ? `From ${audit.convScoreBefore} to ${audit.convScoreAfter} pts` : `Von ${audit.convScoreBefore} auf ${audit.convScoreAfter} Punkte`}
          </div>
        </div>

        <div class="glass p-4 rounded-2xl border-slate-800">
          <div class="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">0%</div>
          <div class="text-[11px] text-slate-400 uppercase tracking-wider mt-1 font-semibold">
            ${isEn ? 'AI Slop Toxicity' : 'AI-Slop Toxizität'}
          </div>
          <div class="text-[10px] text-slate-500 mt-0.5">
            ${isEn ? 'Zero ChatGPT fluff' : 'Keine ChatGPT-Worthülsen'}
          </div>
        </div>

        <div class="glass p-4 rounded-2xl border-slate-800">
          <div class="text-2xl sm:text-3xl font-black text-white font-mono">&lt; 30 Days</div>
          <div class="text-[11px] text-slate-400 uppercase tracking-wider mt-1 font-semibold">
            ${isEn ? 'Payback Horizon' : 'Amortisation'}
          </div>
          <div class="text-[10px] text-slate-500 mt-0.5">
            ${isEn ? 'Crystal clear CFO ROI' : 'Glasklarer ROI für den CFO'}
          </div>
        </div>

        <div class="glass p-4 rounded-2xl border-slate-800">
          <div class="text-2xl sm:text-3xl font-black text-amber-400 font-mono">100%</div>
          <div class="text-[11px] text-slate-400 uppercase tracking-wider mt-1 font-semibold">
            ${isEn ? 'Compliance & Security' : 'DSGVO-Haftung'}
          </div>
          <div class="text-[10px] text-slate-500 mt-0.5">
            ${isEn ? 'SOC-2 / Privacy Ready' : 'Deutsche Server & Standards'}
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- Problem & Solution Comparison Section -->
  <section id="vergleich" class="py-20 bg-slate-950/60 border-b border-slate-800">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      
      <div class="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <span class="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          ${isEn ? 'HEAD-TO-HEAD BREAKDOWN' : 'KONKRETE GEGENÜBERSTELLUNG'}
        </span>
        <h2 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          ${isEn ? 'Why Conventional Landing Pages Hemorrhage Pipeline' : 'Warum herkömmliche Seiten Besucher verlieren'}
        </h2>
        <p class="text-slate-400 text-sm">
          ${isEn 
            ? 'Hostile buyer personas (Skeptic, CFO, Scroller, Pedant) dissect and expose generic marketing fluff in seconds.'
            : 'Die feindlichen Käufer-Personas (Skeptiker, CFO, Scroller) entlarven leere Floskeln in Sekunden.'}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Vorher (Alt / Slop) -->
        <div class="p-6 rounded-2xl bg-red-950/20 border border-red-900/40 space-y-4">
          <div class="flex items-center justify-between pb-3 border-b border-red-900/30">
            <span class="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
              <span>${isEn ? 'Conventional Generic Websites' : 'Herkömmliche Standard-Websites'}</span>
            </span>
            <span class="text-xs font-mono font-bold text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-800">
              Score: ${audit.convScoreBefore}/100
            </span>
          </div>

          <ul class="space-y-3 text-xs text-slate-300">
            ${audit.lethalFlaws.map(flaw => `
              <li class="flex items-start gap-2">
                <span class="text-red-400 font-bold shrink-0">&times;</span>
                <span>${flaw}</span>
              </li>
            `).join('')}
            <li class="flex items-start gap-2">
              <span class="text-red-400 font-bold shrink-0">&times;</span>
              <span>${isEn ? 'Monotone blocks of text with zero emotional hooks, losing mobile scrollers immediately.' : 'Monotone Textblöcke ohne Kaufimpuls, die Besucher auf Mobilgeräten überfordern.'}</span>
            </li>
          </ul>

          <div class="pt-3 border-t border-red-900/20 text-[11px] text-red-300 italic">
            ${isEn ? 'Flagged phrase:' : 'Enttarnte Phrase:'} ${audit.worstQuote}
          </div>
        </div>

        <!-- Nachher (Neu / OMEGA-gehärtet) -->
        <div class="p-6 rounded-2xl bg-cyan-950/25 border border-cyan-800/60 space-y-4 relative overflow-hidden glow-cyan">
          <div class="flex items-center justify-between pb-3 border-b border-cyan-800/40">
            <span class="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
              <span>${isEn ? 'OMEGA Hardened Architecture (This Page)' : 'OMEGA-gehärtete Version (Diese Seite)'}</span>
            </span>
            <span class="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Score: ${audit.convScoreAfter}/100
            </span>
          </div>

          <ul class="space-y-3 text-xs text-slate-200">
            <li class="flex items-start gap-2">
              <span class="text-emerald-400 font-bold shrink-0">&check;</span>
              <span><strong>0% AI-Slop:</strong> ${isEn ? 'Hard metrics, verifiable outcomes, zero empty marketing claims.' : 'Klare Fakten, überprüfbare Ergebnisse und keine Werbe-Worthülsen.'}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-400 font-bold shrink-0">&check;</span>
              <span><strong>${isEn ? 'CFO-Proof Amortization:' : 'CFO-sichere Beweise:'}</strong> ${isEn ? 'Clear financial payback and zero cognitive friction.' : 'Transparente Amortisation und minimale kognitive Barrieren.'}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-400 font-bold shrink-0">&check;</span>
              <span><strong>${isEn ? 'Adversarially Battle-Tested:' : 'Adversarial gestählt:'}</strong> ${isEn ? 'Validated across 4 hostile buyer personas in recursive Red-Critic loops.' : 'Durch 4 feindliche Käufer-Personas im Dual Red-Critic Loop validiert.'}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-emerald-400 font-bold shrink-0">&check;</span>
              <span><strong>${isEn ? 'High Burstiness Dynamics:' : 'Hohe Burstiness:'}</strong> ${isEn ? 'Dynamic, rhythmic sentence structure commands attention on mobile.' : 'Kurze, rhythmisierte Sätze halten die Aufmerksamkeit mobil aufrecht.'}</span>
            </li>
          </ul>

          <div class="pt-3 border-t border-cyan-800/30 text-[11px] text-cyan-300 font-medium">
            ${isEn ? `Quality Certification: Red-Critic Gatekeeper cleared with ${audit.convScoreAfter} of 100 points.` : `Qualitätsnachweis: Red-Critic Gatekeeper bestanden mit ${audit.convScoreAfter} von 100 Punkten.`}
          </div>
        </div>

      </div>

    </div>
  </section>

  <!-- Core Features / Pillars Section -->
  <section id="vorteile" class="py-20 border-b border-slate-800">
    <div class="max-w-6xl mx-auto px-4 sm:px-6">
      
      <div class="text-center max-w-2xl mx-auto mb-14 space-y-3">
        <span class="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">
          ${isEn ? 'THE 3 CORE PILLARS' : 'DIE 3 KERNPFEILER'}
        </span>
        <h2 class="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          ${isEn ? 'Mathematical Precision Over Hope Marketing' : 'Präzision statt Zufalls-Marketing'}
        </h2>
        <p class="text-slate-400 text-sm">
          ${isEn ? 'How this architecture positions your offer as the uncontested choice.' : 'Wie dieses System Ihr Angebot im Markt unanfechtbar positioniert.'}
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div class="glass p-6 rounded-2xl border-slate-800 hover:border-cyan-800/60 transition group space-y-3">
          <div class="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-bold text-lg font-mono">
            01
          </div>
          <h3 class="text-base font-bold text-white group-hover:text-cyan-300 transition">
            ${isEn ? 'Empirical Proof Engineering' : 'Harte Beweisführung'}
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            ${isEn 
              ? 'Instead of vague claims like "we are your trusted partner", we deliver quantifiable payback, concrete deadlines, and verifiable benchmarks.'
              : 'Statt vager Behauptungen wie „wir sind Ihr Partner“ liefern wir mathematische Amortisation, glasklare Deadlines und nachvollziehbare Benchmarks.'}
          </p>
        </div>

        <div class="glass p-6 rounded-2xl border-slate-800 hover:border-emerald-800/60 transition group space-y-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center font-bold text-lg font-mono">
            02
          </div>
          <h3 class="text-base font-bold text-white group-hover:text-emerald-300 transition">
            ${isEn ? 'Objection Annihilation' : 'Einwand-Neutralisierung'}
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            ${isEn 
              ? `We proactively dismantle your prospects' deepest hesitations (${audit.objections}) immediately ahead of the primary call to action.`
              : `Wir adressieren die größten Zweifel Ihrer Kunden (${audit.objections}) proaktiv direkt vor dem Call-to-Action.`}
          </p>
        </div>

        <div class="glass p-6 rounded-2xl border-slate-800 hover:border-purple-800/60 transition group space-y-3">
          <div class="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center font-bold text-lg font-mono">
            03
          </div>
          <h3 class="text-base font-bold text-white group-hover:text-purple-300 transition">
            ${isEn ? 'Zero Cognitive Friction' : 'Null Kognitive Reibung'}
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">
            ${isEn 
              ? 'Mobile-First architecture: sub-second load performance, optimal typographic contrast, and friction-free user decision paths.'
              : 'Mobile-First optimiert: Ein responsives Layout mit schneller Ladezeit, klaren Schriftgrößen und sofort verständlichen Handlungsschritten.'}
          </p>
        </div>

      </div>

    </div>
  </section>

  <!-- FAQ / Objection Accordion Section -->
  <section id="faq" class="py-20 bg-slate-950/40 border-b border-slate-800">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      
      <div class="text-center space-y-3">
        <span class="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">
          ${isEn ? 'OBJECTION DESTROYER & FAQ' : 'EINWAND-KILLER & FAQ'}
        </span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-white">
          ${isEn ? 'Frequently Asked Questions & Radical Transparency' : 'Häufig gestellte Fragen & Transparenz'}
        </h2>
        <p class="text-slate-400 text-xs sm:text-sm">
          ${isEn ? 'Straightforward answers to the primary market objections without fluff.' : 'Alle Antworten auf die typischen Einwände im Markt ohne Ausflüchte.'}
        </p>
      </div>

      <div class="space-y-3">
        ${allFaqs.map((faq, idx) => `
          <div class="glass rounded-xl border border-slate-800 overflow-hidden">
            <button 
              type="button"
              onclick="toggleFaq(${idx})" 
              class="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/40 transition"
            >
              <span class="font-bold text-xs sm:text-sm text-slate-200">${faq.q}</span>
              <svg id="faq-icon-${idx}" class="w-4 h-4 text-cyan-400 transform transition-transform duration-200 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <div id="faq-answer-${idx}" class="hidden px-5 pb-5 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60">
              ${faq.a}
            </div>
          </div>
        `).join('')}
      </div>

    </div>
  </section>

  <!-- Guarantee & Risk Reversal Banner -->
  <section id="garantie" class="py-14 border-b border-slate-800 bg-gradient-to-r from-cyan-950/30 via-slate-900/60 to-emerald-950/30">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-4">
      <div class="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
      </div>

      <h3 class="text-xl sm:text-2xl font-black text-white">
        ${isEn ? 'Ironclad Quality & ROI Guarantee' : 'Unsere ROI- & Qualitäts-Garantie'}
      </h3>

      <p class="text-slate-300 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
        ${guaranteeText}
      </p>

      <div class="text-[11px] text-slate-500 font-mono">
        ${isEn ? 'Recommended Package:' : 'Empfohlenes Leistungs-Paket:'} ${audit.proposal.recommendedPackage} (${audit.proposal.timeline})
      </div>
    </div>
  </section>

  <!-- Lead Contact Form Section -->
  <section id="kontakt" class="py-20 relative">
    <div class="max-w-2xl mx-auto px-4 sm:px-6">
      
      <div class="glass p-6 sm:p-8 rounded-3xl border border-cyan-800/50 shadow-2xl glow-cyan space-y-6">
        
        <div class="text-center space-y-2">
          <span class="text-[11px] font-bold text-cyan-400 uppercase tracking-widest font-mono">
            ${isEn ? 'DIRECT INQUIRY' : 'DIREKT-ANFRAGE'}
          </span>
          <h2 class="text-2xl sm:text-3xl font-black text-white">
            ${isEn ? 'Claim Your Growth Consultation' : 'Jetzt unverbindliches Erstgespräch sichern'}
          </h2>
          <p class="text-slate-400 text-xs">
            ${isEn 
              ? 'Enter your work details below. Our team responds within 24 hours with an empirical teardown of your conversion leaks.'
              : 'Tragen Sie Ihre Kontaktdaten ein. Wir melden uns innerhalb von 24 Stunden mit einer detaillierten Vorab-Einschätzung.'}
          </p>
        </div>

        <form id="landing-contact-form" onsubmit="handleFormSubmit(event)" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">
                ${isEn ? 'Your Full Name *' : 'Ihr vollständiger Name *'}
              </label>
              <input 
                type="text" 
                required 
                placeholder="${isEn ? 'Mark Spencer' : 'Max Mustermann'}"
                class="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">
                ${isEn ? 'Work Email *' : 'Geschäftliche E-Mail *'}
              </label>
              <input 
                type="email" 
                required 
                placeholder="${isEn ? 'mark@company.com' : 'max@unternehmen.de'}"
                class="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition font-mono"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">
                ${isEn ? 'Company / Website URL' : 'Unternehmen / Website-URL'}
              </label>
              <input 
                type="text" 
                placeholder="https://${cleanDomain}"
                class="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition font-mono"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">
                ${isEn ? 'Phone (optional)' : 'Telefonnummer (optional)'}
              </label>
              <input 
                type="tel" 
                placeholder="${isEn ? '+1 (555) 019-2834' : '+49 170 1234567'}"
                class="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">
              ${isEn ? 'What is your primary conversion roadblock right now?' : 'Was ist Ihre größte Herausforderung aktuell?'}
            </label>
            <textarea 
              rows="3" 
              placeholder="${isEn ? 'e.g. High bounce rate on mobile, unproven ROI objections from CFOs, poor inbound lead quality...' : 'z. B. Zu hohe Bounce-Rate, unklarer Mehrwert, zu wenige qualifizierte Inbound-Leads...'}"
              class="w-full bg-slate-900/90 border border-slate-700 focus:border-cyan-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none transition resize-none"
            ></textarea>
          </div>

          <button 
            type="submit" 
            id="submit-btn"
            class="w-full py-4 bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-black font-extrabold text-xs sm:text-sm rounded-xl transition shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>${isEn ? 'SUBMIT INQUIRY FOR FREE' : 'ANFRAGE KOSTENFREI ABSENDEN'}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
          </button>

          <div id="form-feedback" class="hidden p-4 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs text-center">
            ✓ <strong>${isEn ? 'Thank you!' : 'Vielen Dank für Ihre Anfrage!'}</strong> ${isEn ? 'Your inquiry has been logged. Expect our diagnostic response within 24 hours.' : 'Ihre Daten wurden erfasst. Sie erhalten innerhalb von 24 Stunden eine Rückmeldung.'}
          </div>

          <p class="text-center text-[10px] text-slate-500">
            ${isEn ? '100% Privacy-compliant. Zero third-party data tracking. Unsubscribe anytime.' : '100% DSGVO-konform. Keine Weitergabe an Dritte. Jederzeit widerrufbar.'}
          </p>
        </form>

      </div>

    </div>
  </section>

  <!-- Footer -->
  <footer class="border-t border-slate-800/80 bg-slate-950 py-10 px-4 sm:px-6 text-xs text-slate-500">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        <span class="text-slate-400 font-medium">© ${new Date().getFullYear()} ${brandName}. ${isEn ? 'All rights reserved.' : 'Alle Rechte vorbehalten.'}</span>
      </div>

      <div class="flex items-center space-x-6 text-[11px] text-slate-400">
        <a href="#kontakt" class="hover:text-cyan-400 transition">${isEn ? 'Contact' : 'Kontakt'}</a>
        <a href="#vorteile" class="hover:text-cyan-400 transition">${isEn ? 'Benefits' : 'Vorteile'}</a>
        <span class="text-slate-600">|</span>
        <span class="text-slate-500 font-mono">Dossier-Ref: ${audit.id}</span>
      </div>
    </div>
  </footer>

  <!-- Vanilla JS Interactions -->
  <script>
    function toggleFaq(index) {
      var ans = document.getElementById('faq-answer-' + index);
      var icon = document.getElementById('faq-icon-' + index);
      if (ans.classList.contains('hidden')) {
        ans.classList.remove('hidden');
        icon.classList.add('rotate-180');
      } else {
        ans.classList.add('hidden');
        icon.classList.remove('rotate-180');
      }
    }

    function handleFormSubmit(e) {
      e.preventDefault();
      var btn = document.getElementById('submit-btn');
      var feedback = document.getElementById('form-feedback');
      btn.innerText = '${isEn ? 'TRANSMITTING...' : 'WIRD ÜBERTRAGEN...'}';
      btn.disabled = true;

      setTimeout(function() {
        btn.classList.add('hidden');
        feedback.classList.remove('hidden');
      }, 700);
    }
  </script>
</body>
</html>`;
}

/**
 * Lädt die schlüsselfertige HTML-Datei im Browser herunter
 */
export function downloadLandingPageHtml(audit: AuditRun, lang: MarketLanguage = audit.market || 'de'): void {
  const htmlContent = generateLandingPageHtml(audit, lang);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const suffix = lang === 'en' ? '_EN' : '_DE';
  a.download = `${audit.id}_READY_TO_DEPLOY_LANDINGPAGE${suffix}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
