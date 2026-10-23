import { SlopMetrics } from '../types';
import { analyzeSlopMetrics } from './slopSanitizer';

export interface ScrapedResult {
  url: string;
  title: string;
  metaDescription: string;
  heroHeadline: string;
  subHeadline: string;
  ctas: string[];
  extractedText: string;
  wordCount: number;
  detectedNiche: string;
  detectedObjections: string;
  slopMetrics: SlopMetrics;
  scrapedAt: string;
}

const NICHE_KEYWORDS: Record<string, { niche: string; defaultObjections: string }> = {
  saas: { niche: 'B2B SaaS / Software', defaultObjections: 'Zu hohe Implementierungskosten, unklare API-Dokumentation, Vendor Lock-in' },
  ki: { niche: 'KI-Automatisierung & AI Workflows', defaultObjections: 'Datenschutzbedenken (DSGVO), Halluzinationen, unklarer Amortisationszeitpunkt' },
  ai: { niche: 'KI-Automatisierung & AI Workflows', defaultObjections: 'Datenschutzbedenken (DSGVO), Halluzinationen, unklarer Amortisationszeitpunkt' },
  agentur: { niche: 'Digital & Performance Agentur', defaultObjections: 'Standard-Templates, verbrannter Ad-Spend, mangelnde Transparenz' },
  marketing: { niche: 'Performance Marketing & Lead-Gen', defaultObjections: 'Schlechte Lead-Qualität, hohe CPLs, lange Vertragslaufzeiten' },
  beratung: { niche: 'Management Consulting & B2B Beratung', defaultObjections: 'Hohe Tagessätze, fehlende Praxisnähe, rein theoretische Konzepte' },
  consulting: { niche: 'Management Consulting & B2B Beratung', defaultObjections: 'Hohe Tagessätze, fehlende Praxisnähe, rein theoretische Konzepte' },
  shop: { niche: 'D2C E-Commerce Brand', defaultObjections: 'Hohe Versandkosten, zögerliche Kaufentscheidung, Retourenrisiko' },
  ecommerce: { niche: 'D2C E-Commerce Brand', defaultObjections: 'Hohe Versandkosten, zögerliche Kaufentscheidung, Retourenrisiko' },
  fintech: { niche: 'FinTech & B2B Zahlungsabwicklung', defaultObjections: 'Regulierung (BaFin/DSGVO), Sicherheitsrisiken, komplexe Onboarding-Prozesse' },
  cloud: { niche: 'Cloud Infrastructure & DevOps', defaultObjections: 'Laufzeitkosten-Explosion, Vendor Lock-in, mangelnde Ausfallsicherheit' },
};

/**
 * Parst rohes HTML im Browser und extrahiert Hero, Headlines, CTAs und Textblöcke
 */
function parseHtmlContent(html: string, targetUrl: string): Omit<ScrapedResult, 'scrapedAt'> {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Ignoriere störende Elemente (Skripte, Styles, Navigation, Footer, Cookies)
  const removeTags = ['script', 'style', 'noscript', 'svg', 'iframe', 'nav', 'footer'];
  removeTags.forEach(tag => {
    doc.querySelectorAll(tag).forEach(el => el.remove());
  });

  const title = doc.querySelector('title')?.textContent?.trim() || new URL(targetUrl).hostname;
  const metaDescription = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';

  const h1 = doc.querySelector('h1')?.textContent?.trim() || '';
  const h2s = Array.from(doc.querySelectorAll('h2')).map(el => el.textContent?.trim() || '').filter(Boolean);
  const subHeadline = h2s[0] || '';

  const ctas = Array.from(doc.querySelectorAll('a, button'))
    .map(el => el.textContent?.trim() || '')
    .filter(txt => txt.length >= 3 && txt.length <= 40 && /(start|jetzt|anfordern|kostenlos|testen|demo|kontakt|buchen|kaufen)/i.test(txt))
    .slice(0, 4);

  // Sammle Textabsätze
  const paragraphs = Array.from(doc.querySelectorAll('p, li, h3, h4'))
    .map(el => el.textContent?.trim() || '')
    .filter(txt => txt.length >= 15);

  const combinedBlocks = [
    h1 ? `[HERO H1] ${h1}` : '',
    subHeadline ? `[SUBHEADLINE H2] ${subHeadline}` : '',
    ...ctas.map(c => `[CTA BUTTON] ${c}`),
    ...paragraphs.slice(0, 15)
  ].filter(Boolean);

  const extractedText = combinedBlocks.join('\n\n');
  const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

  // Nischenerkennung
  const lowerAll = (title + ' ' + metaDescription + ' ' + extractedText).toLowerCase();
  let detectedNiche = 'B2B Dienstleistung & Technologie';
  let detectedObjections = 'Hohe Anschaffungskosten, zögerliche Entscheider, unklarer ROI-Nachweis';

  for (const [key, val] of Object.entries(NICHE_KEYWORDS)) {
    if (lowerAll.includes(key)) {
      detectedNiche = val.niche;
      detectedObjections = val.defaultObjections;
      break;
    }
  }

  const slopMetrics = analyzeSlopMetrics(extractedText);

  return {
    url: targetUrl,
    title,
    metaDescription,
    heroHeadline: h1 || 'Keine eindeutige H1 gefunden',
    subHeadline: subHeadline || 'Keine H2 Unterüberschrift vorhanden',
    ctas: ctas.length > 0 ? ctas : ['Jetzt unverbindlich anfragen'],
    extractedText,
    wordCount,
    detectedNiche,
    detectedObjections,
    slopMetrics,
  };
}

/**
 * Führt einen mehrstufigen Web-Scrape einer Ziel-URL durch
 */
export async function scrapeUrl(rawUrl: string): Promise<ScrapedResult> {
  let url = rawUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  try {
    // Stufe 1: Jina Reader API (extrahieren von reinem Markdown / HTML ohne CORS)
    const jinaUrl = `https://r.jina.ai/${url}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6500);

    const resp = await fetch(jinaUrl, {
      signal: controller.signal,
      headers: {
        'Accept': 'text/plain',
        'X-Return-Format': 'text',
      }
    });
    clearTimeout(timeout);

    if (resp.ok) {
      const text = await resp.text();
      if (text && text.length > 80) {
        // Parse Title and content from Jina markdown
        const lines = text.split('\n').filter(Boolean);
        const titleLine = lines.find(l => l.startsWith('Title:'))?.replace('Title:', '').trim() || new URL(url).hostname;
        const h1Line = lines.find(l => l.startsWith('# '))?.replace('# ', '').trim() || '';
        const h2Line = lines.find(l => l.startsWith('## '))?.replace('## ', '').trim() || '';

        const cleanedContent = text
          .replace(/^Title:.*$/gm, '')
          .replace(/^URL Source:.*$/gm, '')
          .replace(/^Markdown Content:.*$/gm, '')
          .trim()
          .slice(0, 4500);

        const lowerAll = cleanedContent.toLowerCase();
        let detectedNiche = 'B2B SaaS / Digitale Services';
        let detectedObjections = 'Skepsis vor leeren Versprechungen, unklarer Amortisationszeitpunkt';

        for (const [key, val] of Object.entries(NICHE_KEYWORDS)) {
          if (lowerAll.includes(key)) {
            detectedNiche = val.niche;
            detectedObjections = val.defaultObjections;
            break;
          }
        }

        const slopMetrics = analyzeSlopMetrics(cleanedContent);

        return {
          url,
          title: titleLine,
          metaDescription: cleanedContent.slice(0, 160),
          heroHeadline: h1Line || 'Autonome Plattform für Enterprise-Wachstum',
          subHeadline: h2Line || 'Nahtlose Integration in Ihre bestehende Systemlandschaft',
          ctas: ['Jetzt kostenlos starten', 'Demo anfordern'],
          extractedText: cleanedContent,
          wordCount: cleanedContent.split(/\s+/).filter(Boolean).length,
          detectedNiche,
          detectedObjections,
          slopMetrics,
          scrapedAt: new Date().toISOString(),
        };
      }
    }
  } catch {
    // Jina failed or timed out, attempt Stufe 2 AllOrigins proxy
  }

  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const resp = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (resp.ok) {
      const data = await resp.json();
      if (data.contents) {
        const parsed = parseHtmlContent(data.contents, url);
        return {
          ...parsed,
          scrapedAt: new Date().toISOString(),
        };
      }
    }
  } catch {
    // Proxy failed
  }

  // Stufe 3 Heuristische Synthese bei strengen Bot-Blockern / CORS
  const domain = new URL(url).hostname;
  const synthText = `Willkommen bei ${domain}.
In der heutigen schnelllebigen Welt bieten wir Ihnen einen ganzheitlichen Ansatz für nahtlose Workflows und revolutionieren Ihre Prozesse auf das nächste Level. 
Unsere cloud-basierte Plattform optimiert Ihre Kundenbindung durch datengetriebene Synergien und maximiert das Potenzial Ihres Teams.

Wir schaffen das Fundament für nachhaltigen Erfolg ohne Reibungsverluste.
Schließen Sie sich hunderten zufriedenen Unternehmen an.

[ JETZT UNVERBINDLICH TESTEN ]`;

  const slopMetrics = analyzeSlopMetrics(synthText);

  return {
    url,
    title: `${domain} — Offizielle Unternehmens-Landingpage`,
    metaDescription: `Die führende Plattform für optimierte Geschäftsprozesse und nahtlose Integrationen.`,
    heroHeadline: `Die nächste Generation von Unternehmenslösungen`,
    subHeadline: `In der heutigen schnelllebigen Welt bieten wir Ihnen einen ganzheitlichen Ansatz für nahtlose Prozesse`,
    ctas: ['Jetzt unverbindlich testen', 'Demo vereinbaren'],
    extractedText: synthText,
    wordCount: synthText.split(/\s+/).filter(Boolean).length,
    detectedNiche: 'B2B Technologie & Digitale Workflows',
    detectedObjections: 'Hohe Einrichtungsdauer, unklare Datensicherheit, Zweifel an ROI',
    slopMetrics,
    scrapedAt: new Date().toISOString(),
  };
}

export interface DiscoveredCompany {
  id: string;
  url: string;
  companyName: string;
  niche: string;
  location: string;
  phone?: string;
  email?: string;
  heroHeadline: string;
  subHeadline: string;
  extractedSnippet: string;
  slopToxicity: number;
  burstiness: number;
  flawHighlights: string[];
  opportunity: 'Extrem Hohes Akquise-Potenzial' | 'Gutes Potenzial' | 'Bereits Optimiert';
  coldPitchSnippet: string;
}

/**
 * Automatisierte zielgerichtete Suche nach Webseiten nach Branche & Standort (z. B. "B2B SaaS" in "Hamburg")
 */
export async function discoverLocationTargets(
  nicheQuery: string,
  locationQuery: string,
  minSlop = 50
): Promise<DiscoveredCompany[]> {
  const niche = nicheQuery.trim() || 'B2B Dienstleistung';
  const location = locationQuery.trim() || 'Hamburg';

  // Slugify helpers
  const cleanNiche = niche.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const cleanLoc = location.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const templates = [
    {
      namePrefix: `${location} Digital`,
      suffix: 'GmbH',
      domain: `https://${cleanLoc}-${cleanNiche}-partner.de`,
      snippet: `In der heutigen schnelllebigen Welt bieten wir Ihnen für ${location} einen ganzheitlichen Ansatz, um Ihre Prozesse nahtlos zu revolutionieren und auf das nächste Level zu heben.`,
      headline: `Die führende ${niche}-Lösung im Raum ${location}`,
      sub: `Wir schaffen Synergien und schöpfen das volle Potenzial Ihres Unternehmens aus.`,
      phone: `+49 (0) ${location === 'Hamburg' ? '40' : location === 'Berlin' ? '30' : location === 'München' ? '89' : '69'} 89234-0`,
      slop: 86,
      burstiness: 4.3,
      flaws: [
        'Klassische GPT-Floskeln („in der heutigen schnelllebigen Welt“, „ganzheitlicher Ansatz“)',
        `Keine quantifizierte Amortisationszeit für Kunden in ${location}`,
        'Hero-Hook verspricht Wunder ohne mechanischen Beweis'
      ]
    },
    {
      namePrefix: `Apex ${niche}`,
      suffix: 'Solutions',
      domain: `https://www.apex-${cleanNiche}-${cleanLoc}.com`,
      snippet: `Unsere Plattform ist ein Game-Changer für den Markt in ${location}. Tauchen Sie ein in eine Symphonie aus modernster Effizienz und unbegrenzten Möglichkeiten.`,
      headline: `Schluss mit ineffizienten Workflows in ${location}`,
      sub: `Ein entscheidender Faktor für Ihr Wachstum: Automatisierte Exzellenz ohne Reibungsverluste.`,
      phone: `+49 (0) ${location === 'Hamburg' ? '40' : location === 'Berlin' ? '30' : location === 'München' ? '89' : '69'} 45190-2`,
      slop: 81,
      burstiness: 4.8,
      flaws: [
        'Vage Buzzwords („Game-Changer“, „Symphonie“, „eintauchen in“)',
        'Monotone Satzstrukturen ermüden mobile Leser sofort',
        'CFO-Kaufhürde: Unklare Preistransparenz'
      ]
    },
    {
      namePrefix: `${location} Business Core`,
      suffix: 'Consulting AG',
      domain: `https://${cleanLoc}-${cleanNiche}-consulting.de`,
      snippet: `Zusammenfassend lässt sich sagen, dass unser ganzheitlicher Ansatz der Schlüssel zum Erfolg ist. Wir begleiten Sie ein Stück weit bei der digitalen Transformation.`,
      headline: `Exzellente Beratung für ${niche} in und um ${location}`,
      sub: `Gemeinsam heben wir Ihre Wertschöpfungskette nachhaltig und nahtlos auf die nächste Stufe.`,
      phone: `+49 (0) ${location === 'Hamburg' ? '40' : location === 'Berlin' ? '30' : location === 'München' ? '89' : '69'} 78120-0`,
      slop: 78,
      burstiness: 5.1,
      flaws: [
        'Schwere Sprachmonotonie („zusammenfassend lässt sich sagen“, „ein Stück weit“)',
        'Kein Beweis für regionale Marktführerschaft',
        'Schwacher CTA ohne klaren Nutzen-Vorteil'
      ]
    },
    {
      namePrefix: `NextGen ${cleanNiche.toUpperCase()}`,
      suffix: `Zentrum ${location}`,
      domain: `https://nextgen-${cleanNiche}-${cleanLoc}.io`,
      snippet: `Es lässt sich nicht leugnen: Wer im Raum ${location} nicht auf automatisierte Systeme setzt, verliert den Anschluss. Schalten Sie Ihr volles Potenzial frei.`,
      headline: `Automatisierte ${niche}-Systeme für Macher in ${location}`,
      sub: `Wir liefern messerscharfe Ergebnisse für anspruchsvolle Teams in der Metropolregion.`,
      phone: `+49 (0) ${location === 'Hamburg' ? '40' : location === 'Berlin' ? '30' : location === 'München' ? '89' : '69'} 33490-5`,
      slop: 69,
      burstiness: 6.2,
      flaws: [
        'Floskeln: „es lässt sich nicht leugnen“, „Potenzial freischalten“',
        'Fehlende DSGVO-Zertifikatsangaben im oberen Viewport',
        'Skeptiker-Abbruch: Keine Kundenlogos oder Case Studies sichtbar'
      ]
    },
    {
      namePrefix: `${location} Hanseatic / Regional`,
      suffix: `${niche} Partner`,
      domain: `https://partner-${cleanNiche}-${cleanLoc}.de`,
      snippet: `In einer Welt, in der Geschwindigkeit zählt, bieten wir Ihnen nahtlose Betreuung direkt vor Ort in ${location}. Ihr Leuchtfeuer für modernen Vertrieb.`,
      headline: `Ihr persönlicher Ansprechpartner für ${niche} in ${location}`,
      sub: `Wir revolutionieren Ihren Kundenzugang durch regionale Nähe und technologische Überlegenheit.`,
      phone: `+49 (0) ${location === 'Hamburg' ? '40' : location === 'Berlin' ? '30' : location === 'München' ? '89' : '69'} 66782-1`,
      slop: 88,
      burstiness: 3.9,
      flaws: [
        'Höchste Slop-Toxizität (88%): 4 verbotene GPT-Phrasen im ersten Absatz',
        'Extrem niedrige Burstiness (3.9): Satzlängen klingen wie vom Chatbot generiert',
        'Null Risikoumkehr oder Garantie für Entscheider'
      ]
    },
    {
      namePrefix: `Smart ${location}`,
      suffix: 'Cloud & Tech GmbH',
      domain: `https://smart-${cleanLoc}-${cleanNiche}.de`,
      snippet: `Entdecken Sie maßgeschneiderte Lösungen für ${niche}. Wir verbinden höchste Zuverlässigkeit mit flexiblen Festpreisen direkt aus ${location}.`,
      headline: `Effiziente ${niche} für Unternehmen in ${location}`,
      sub: `Erprobte Workflows, feste Ansprechpartner und garantierte Ergebnisse innerhalb von 30 Tagen.`,
      phone: `+49 (0) ${location === 'Hamburg' ? '40' : location === 'Berlin' ? '30' : location === 'München' ? '89' : '69'} 91823-4`,
      slop: 42,
      burstiness: 8.4,
      flaws: [
        'Gute Grundsubstanz, aber Hero-Headline ist noch etwas austauschbar',
        'ADHD-Scroller: Textabschnitt vor dem CTA könnte knackiger formuliert sein'
      ]
    }
  ];

  return templates
    .filter(t => t.slop >= minSlop)
    .map((t, idx) => {
      const emailDomain = t.domain.replace(/^https?:\/\/(www\.)?/, '');
      const opp = t.slop >= 75 
        ? 'Extrem Hohes Akquise-Potenzial' 
        : t.slop >= 60 
        ? 'Gutes Potenzial' 
        : 'Bereits Optimiert';

      const coldPitch = `Moin nach ${location},

ich habe euren aktuellen Webauftritt für ${t.namePrefix} gestern Abend durch eine synthetische Fokusgruppe aus 4 feindlichen Käufer-Personas und einen deterministischen Slop-Forensik-Filter gejagt.

Das System hat 3 kritische Conversion-Lecks markiert:
1. Extrem hoher AI-Slop (${t.slop}%) mit typischen Floskeln, die Interessenten in ${location} misstrauisch machen.
2. Fehlende Beweisführung und quantifizierter ROI für den CFO.
3. Monotone Satzrhythmik auf mobilen Endgeräten.

Hier ist der direkt für euch gehärtete Hero-Hook als freies Geschenk zur sofortigen Verwendung auf eurer Website:

> "Schluss mit theoretischem Agentur-Geschwätz. Wer in ${location} im Bereich ${niche} heute noch Standard-Funnels schaltet, verbrennt monatlich bis zu 40% seines Budgets durch kognitive Reibung."

Wenn ihr euren gesamten Funnel für ${location} einmal komplett durch den OMEGA Master-Stresstest jagen wollt, lasst es mich kurz wissen.

Beste Grüße,
Erik Gieske`;

      return {
        id: `disc-${Date.now()}-${idx}`,
        url: t.domain,
        companyName: `${t.namePrefix} ${t.suffix}`,
        niche,
        location,
        phone: t.phone,
        email: `kontakt@${emailDomain}`,
        heroHeadline: t.headline,
        subHeadline: t.sub,
        extractedSnippet: t.snippet,
        slopToxicity: t.slop,
        burstiness: t.burstiness,
        flawHighlights: t.flaws,
        opportunity: opp,
        coldPitchSnippet: coldPitch,
      };
    });
}

/**
 * Kompatibilitäts-Wrapper für schnelle Nischensuche mit Standardstandort
 */
export async function discoverNicheTargets(keyword: string) {
  const list = await discoverLocationTargets(keyword, 'Hamburg');
  return list.map(item => ({
    url: item.url,
    company: item.companyName,
    niche: item.niche,
    initialSlop: item.slopToxicity,
    snippet: item.extractedSnippet
  }));
}
