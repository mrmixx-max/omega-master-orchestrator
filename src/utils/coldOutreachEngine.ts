import { ColdOutreachSequence, ColdOutreachStep, AuditRun, MarketLanguage } from '../types';

/**
 * Generiert eine vollständige, 5-stufige Multi-Channel Kaltakquise-Sequenz
 * für den deutschen (DACH) oder amerikanischen/englischen (US/UK) Markt.
 */
export function generateColdOutreachSequence(params: {
  company: string;
  targetUrl: string;
  niche: string;
  contactName: string;
  objections?: string;
  slopPhrase?: string;
  hardenedHook?: string;
  convScore?: number;
  convDelta?: number;
  auditId?: string;
  market?: MarketLanguage;
}): ColdOutreachSequence {
  const market = params.market || 'de';
  const isEn = market === 'en';
  const cleanUrl = params.targetUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const company = params.company || cleanUrl;
  const name = params.contactName || (isEn ? 'Founder / CEO' : 'Geschäftsführer');
  const niche = params.niche || (isEn ? 'B2B SaaS / Services' : 'B2B Dienstleistung');
  const score = params.convScore || 54;
  const delta = params.convDelta || 41;
  const targetScore = Math.min(100, score + delta);
  const auditId = params.auditId || `OMG-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-OUT`;

  const slop = params.slopPhrase || (isEn
    ? '"in today’s fast-paced digital world, we leverage holistic solutions to drive seamless growth..."'
    : '„in der heutigen schnelllebigen welt bieten wir ihnen einen ganzheitlichen ansatz...“');

  const hook = params.hardenedHook || (isEn
    ? `Stop burning ad spend on generic agency theory. If you run standard marketing funnels in ${niche} today, you incinerate up to 40% of qualified pipeline through cognitive drag.`
    : `Schluss mit theoretischem Agentur-Geschwätz. Wer im Bereich ${niche} heute noch Standard-Funnels schaltet, verbrennt bis zu 40% seines Budgets durch kognitive Reibung.`);

  const objections = params.objections || (isEn
    ? 'Too expensive, unclear ROI, already using an in-house team/agency'
    : 'Zu hoher Aufwand, unklarer ROI, bestehende Agentur');

  let steps: ColdOutreachStep[] = [];

  if (isEn) {
    // ------------------------------------------------------------------------
    // AMERICAN / ENGLISH B2B 5-TOUCH CADENCE (Direct Response & Pattern Interrupt)
    // ------------------------------------------------------------------------
    steps = [
      // Step 1: Cold Email / Trojan Horse Value
      {
        step: 1,
        channel: 'email',
        title: 'Touch 1: The "Trojan Horse Slop Audit" (Cold Email)',
        timing: 'Day 1 • 09:15 AM EST',
        badge: 'High Reply Rate (Permissionless Value)',
        goal: 'Capture C-level attention with verified proof, expose conversion leaks, deliver turnkey HTML gift',
        subjectOrOpener: `Audit & turnkey HTML landing page for ${company} [Ref: ${auditId}]`,
        script: `Hey ${name},

Took a close look at ${company}'s landing page (${cleanUrl}) yesterday evening.

Your core value proposition in ${niche} is solid, but the page is quietly bleeding qualified buyers at one critical fold:

Classic AI slop detected in your primary viewport:
${slop}

Our deterministic forensic parser clocked your current Conversion Index at just ${score}/100 — specifically tripping red flags with skeptical CFOs and high-intent buyers.

Rather than just handing you a list of complaints, I rewrote the hero section and built you the solution upfront.

Here is your new, 92+ hardened headline as a free gift:
> "${hook}"

I also packaged this into a complete, standalone single-file HTML landing page (${auditId}_READY_TO_DEPLOY_LANDINGPAGE_EN.html). Your engineering or marketing team can drop this onto any web server or A/B test it in 15 minutes.

Mind if I send over the complete 4-part audit bundle (Executive Report, Copy Swipe, 72h Sprint Checklist & HTML file)? Zero obligation.

Best,
Erik Gieske
Conversion Architect & OMEGA Partner`,
        actionAdvice: 'Sell absolutely nothing in Touch 1. Deliver undeniable proof upfront. This triggers immediate reciprocity.',
      },

      // Step 2: 58-Second Loom Video
      {
        step: 2,
        channel: 'loom',
        title: 'Touch 2: The 58-Second Loom Video Teardown',
        timing: 'Day 3 • 11:30 AM EST (If no reply to Touch 1)',
        badge: '3.4x Higher Response Rate',
        goal: 'Max visual proof: split screen showing old slop vs turnkey HTML landing page live',
        subjectOrOpener: `Re: 58-second teardown for ${company}`,
        script: `[LOOM RECORDING SCRIPT – RUNTIME: EXACTLY 58 SECONDS]

⏱️ 00:00 - 00:10 (The Visual Hook):
"Hey ${name}, Erik here. I've got ${cleanUrl} pulled up on my left monitor, and wanted to show you in under 60 seconds exactly why high-intent buyers are bouncing before they hit your CTA..."

⏱️ 00:10 - 00:25 (The Slop Proof – Hover mouse over the hero section):
"Notice this sentence right here? ${slop}. Our 4 adversarial buyer personas — especially a ruthless CFO persona — immediately flagged this as generic marketing filler. Current score is hovering at ${score}/100."

⏱️ 00:25 - 00:45 (Reveal Solution – Flip browser tab to the ready-to-deploy HTML page):
"Instead of telling you what's broken, I went ahead and rebuilt the entire page for you over here. Look at this: hard metric claims, 0% AI filler, high-burstiness rhythm, and clear CFO amortization. Re-audit score: ${targetScore}/100."

⏱️ 00:45 - 00:58 (Low-Friction Call to Action):
"The full HTML file and the 72-hour developer sprint plan are sitting in my inbox ready for you. If you want the download link, just reply with 'send' and I'll drop it over — zero charge. Talk soon!"`,
        actionAdvice: 'Keep it punchy. Keep their website visible in the background. Never exceed 75 seconds under any circumstance.',
      },

      // Step 3: LinkedIn InMail
      {
        step: 3,
        channel: 'linkedin',
        title: 'Touch 3: LinkedIn Direct Message / InMail',
        timing: 'Day 6 • 02:00 PM EST',
        badge: '44%+ Acceptance Rate',
        goal: 'Executive direct contact on LinkedIn without generic sales odor',
        subjectOrOpener: `Quick question on ${cleanUrl}`,
        script: `Hey ${name},

Came across ${company}'s setup in the ${niche} space — love the trajectory.

Noticed one quick conversion leak on ${cleanUrl}: the hero hook leans on generic buzzwords that drop qualified demos (clocked ${score}/100 in our buyer audit).

Rewrote the section and generated a turnkey single-file HTML page for your team to test.

Mind if I drop the file and link over here? (Free value, zero pitch).

Best,
Erik`,
        actionAdvice: 'Keep it under 55 words. Never paste a Calendly link into the first touchpoint.',
      },

      // Step 4: Phone Outreach & Pattern Interrupt
      {
        step: 4,
        channel: 'phone',
        title: 'Touch 4: Pattern-Interrupt Cold Call & EA Bypass',
        timing: 'Day 9 • 10:15 AM or 04:30 PM EST',
        badge: 'Direct Meeting Conversion',
        goal: 'Sovereignly bypass executive assistants and book a 15-minute diagnostic review with the decision maker',
        subjectOrOpener: `HQ Switchboard / Direct Executive Line`,
        script: `📞 PART 1: EXECUTIVE ASSISTANT (EA) BYPASS:
EA: "Good morning, ${company}, how may I direct your call?"
You: "Hey, Erik Gieske calling for ${name} regarding the forensic website audit reference #${auditId}. Is he/she at their desk right now?"
EA: "What is this regarding specifically?"
You: "We completed a conversion teardown on ${cleanUrl} for leadership and delivered a turnkey HTML landing page a few days back. Just following up on the deliverable. Could you connect me real quick?"

📞 PART 2: DECISION MAKER PATTERN INTERRUPT:
Prospect: "${name} speaking."
You: "Hey ${name}, Erik Gieske with Omega. Did I catch you in the middle of a fire?"
[Wait 1 second for them to chuckle or ask 'what's this about?']
You: "I'll be 20 seconds: I sent you a turnkey HTML landing page and a 60-second video teardown for ${company} earlier this week. Did you get a chance to open the code yet?"

🔥 LIVE OBJECTION HANDLING ON THE PHONE:
• Objection: "We already have an agency / in-house team."
  -> Response: "That's exactly why I built it as open HTML and an agile sprint checklist! Your team can deploy this in 45 minutes and unlock +25% more pipeline without renegotiating retainers. Worth a 10-minute screenshare on Thursday?"

• Objection: "No budget / Not a priority."
  -> Response: "Totally hear you. This isn't a 6-month rebuild. It's an instant plug-and-play fix that pays for itself in under 30 days. Let's do 10 minutes next Tuesday at 11 AM — if it's not a fit, keep the code on the house."

• Objection: "Send me an email."
  -> Response: "Already in your inbox under subject line '[Ref: ${auditId}]'. Mind checking right now? I'll hold for 15 seconds."`,
        actionAdvice: 'Calm, authoritative, slow tempo. Do not sound like a telemarketer; sound like a technical audit director.',
      },

      // Step 5: High-Status Breakup Email
      {
        step: 5,
        channel: 'breakup',
        title: 'Touch 5: High-Status "Breakup" Closing (Archive)',
        timing: 'Day 14 • 05:00 PM EST',
        badge: 'Psychological Lever (FOMO & Relief)',
        goal: 'Polite withdrawal of value which removes pressure and consistently re-triggers replies',
        subjectOrOpener: `Final note: Archiving audit dossier #${auditId} for ${company}`,
        script: `Hey ${name},

Since I haven't heard back, I'm assuming conversion optimization and patching the demo leaks on ${cleanUrl} aren't high on your radar right now.

Completely understand — fires happen.

I'll be archiving dossier #${auditId} and the turnkey HTML page we generated for ${company} this coming Friday to keep our queue clean.

If you ever want to re-run the benchmark or split-test the code against your current page, just reach back out.

Wishing you and ${company} continued massive growth!

Best,
Erik Gieske`,
        actionAdvice: 'Zero bitterness, zero passive-aggression. High status. Often yields 15-20% of total replies due to pressure release.',
      },
    ];
  } else {
    // ------------------------------------------------------------------------
    // GERMAN / DACH B2B 5-TOUCH CADENCE (Formal, Trust-Anchored & DSGVO-Ready)
    // ------------------------------------------------------------------------
    steps = [
      // Step 1: E-Mail / Initial Cold Pitch (Der trojanische Audit)
      {
        step: 1,
        channel: 'email',
        title: 'Touch 1: Der „Trojanische Slop-Audit“ (E-Mail)',
        timing: 'Tag 1 • 09:15 Uhr',
        badge: 'Hohe Klickrate (Permissionless Value)',
        goal: 'Aufmerksamkeit erzeugen, konkreten Fehler belegen & freies Geschenk übergeben',
        subjectOrOpener: `Audit & fertige HTML-Landingpage für ${company} [Ref: ${auditId}]`,
        script: `Hallo ${name},

ich habe mir gestern Abend die Webpräsenz von ${company} (${cleanUrl}) im Detail angesehen.

Sie haben ein starkes Angebot im Bereich ${niche}, aber Ihre aktuelle Landingpage verliert qualifizierte Interessenten an einer entscheidenden Stelle:

Klassische KI-Worthülse im oberen Drittel:
${slop}

Unser deterministischer Anti-Slop-Filter beziffert den aktuellen Conversion-Index auf lediglich ${score}/100 Punkten – das schreckt vor allem kritische CFOs und skeptische B2B-Käufer ab.

Statt Ihnen nur Probleme aufzuzeigen, habe ich die Lösung bereits vorab fertig ausgearbeitet.

Hier ist Ihre neue, auf 92+ Punkte gehärtete Headline als freies Geschenk:
> "${hook}"

Zudem habe ich Ihnen bereits eine schlüsselfertige, responsive Single-File HTML-Landingpage programmiert (liegt als ${auditId}_READY_TO_DEPLOY_LANDINGPAGE_DE.html bei). Sie können diese Datei 1:1 auf Ihren Webspace laden oder per A/B-Test testen.

Darf ich Ihnen das vollständige 4-teilige Audit-Dossier (Report, Copy-Swipe, 72h-Sprintplan & HTML-Datei) kurz unverbindlich zusenden?

Beste Grüße,
Alexander Vance
Conversion-Architekt & OMEGA Partner`,
        actionAdvice: 'Verkaufen Sie in Touch 1 absolut nichts. Liefern Sie nur Mehrwert. Das baut sofortige Reziprozität auf.',
      },

      // Step 2: 60-Sekunden Loom-Video Skript
      {
        step: 2,
        channel: 'loom',
        title: 'Touch 2: Das 60-Sekunden Loom-Video-Audit',
        timing: 'Tag 3 • 11:30 Uhr (Falls keine Antwort auf Touch 1)',
        badge: '3.4x Höhere Antwortrate',
        goal: 'Beweiskraft maximieren: Den Bildschirm teilen und den Kontrast zwischen Alt und Neu visuell demonstrieren',
        subjectOrOpener: `Re: Video-Walkthrough (60 Sek) für ${company}`,
        script: `[LOOM-AUFNAHME-SKRIPT – GESAMTLÄNGE: EXAKT 58 SEKUNDEN]

⏱️ 00:00 - 00:10 (Der visuelle Hook):
„Moin ${name}, hier ist Alexander. Ich habe ${cleanUrl} hier gerade auf meinem linken Bildschirm geöffnet und wollte Ihnen in 60 Sekunden zeigen, warum Sie aktuell wertvolle Anfragen verschenken...“

⏱️ 00:10 - 00:25 (Der Slop-Beweis – mit der Maus über die Hero-Section kreisen):
„Sehen Sie diesen Satz hier oben? ${slop}. Unsere 4 feindlichen Käufer-Personas – darunter ein extrem skeptischer CFO – haben das sofort als austauschbare Floskel abgestraft. Der Score liegt bei nur ${score} von 100 Punkten.“

⏱️ 00:25 - 00:45 (Die Lösung enthüllen – Tab zur fertigen HTML-Landingpage wechseln):
„Statt Ihnen nur zu sagen, was falsch ist, habe ich Ihnen die Seite hier drüben schon komplett schlüsselfertig nachgebaut. Schauen Sie mal: Klare Zahlen, hohe Burstiness, 0% AI-Floskeln und glasklare Amortisation. Score: ${targetScore}/100 Punkte.“

⏱️ 00:45 - 00:58 (Reibungsarmer Call to Action):
„Die fertige HTML-Datei inklusive Entwickler-Sprintplan liegt bereit. Wenn Sie möchten, schicke ich Ihnen den Download-Link direkt rüber – kostet Sie keinen Cent. Geben Sie mir einfach kurz ein Zeichen. Bis dann!“`,
        actionAdvice: 'Sprechen Sie flüssig und energisch. Halten Sie die Kunden-URL im Hintergrund sichtbar. Niemals länger als 75 Sekunden.',
      },

      // Step 3: LinkedIn / Xing Social Selling
      {
        step: 3,
        channel: 'linkedin',
        title: 'Touch 3: LinkedIn Direct Message / InMail',
        timing: 'Tag 6 • 14:00 Uhr',
        badge: '42%+ Annahme-Quote',
        goal: 'Direkter C-Level Kontakt auf LinkedIn ohne Pitch-Geruch',
        subjectOrOpener: `Kurze Frage zu ${cleanUrl}`,
        script: `Hi ${name},

bin über eure aktuelle Positionierung bei ${company} gestolpert. Sehr starkes Setup im Bereich ${niche}!

Mir ist auf ${cleanUrl} allerdings ein Conversion-Leck aufgefallen: Der Hero-Hook wirkt durch ein paar typische Worthülsen etwas generisch und bremst die Inbound-Anfragen (Score lag im Persona-Audit bei ${score}/100).

Habe euch die Sektion aus Interesse umgeschrieben und als fertige Single-File HTML-Landingpage exportiert. 

Darf ich dir das Dokument und den Link hier kurz rüberschicken? (Völlig kostenfrei als Impuls).

Beste Grüße,
Alexander`,
        actionAdvice: 'Unter 60 Wörter bleiben. Niemals direkt Calendly-Links in die erste Nachricht werfen.',
      },

      // Step 4: Telefon-Akquise & Gatekeeper-Leitfaden (Cold Call)
      {
        step: 4,
        channel: 'phone',
        title: 'Touch 4: Telefon-Leitfaden & Gatekeeper-Bypass',
        timing: 'Tag 9 • 10:15 Uhr oder 16:30 Uhr',
        badge: 'Direkter Terminschluss',
        goal: 'Assistenz souverän passieren und mit dem Geschäftsführer ein 15-Minuten Review vereinbaren',
        subjectOrOpener: `Anruf Zentrale / Durchwahl Geschäftsführer`,
        script: `📞 TEIL 1: AM GATEKEEPER / DER ASSISTENZ VORBEIKOMMEN:
Assistent(in): „Guten Tag, Firma ${company}, mein Name ist Müller. Was kann ich für Sie tun?“
Sie: „Guten Tag Frau Müller, Alexander Vance hier. Es geht um das technische Website-Audit-Dossier mit der Referenznummer ${auditId} für Herrn/Frau ${name}. Ist er/sie gerade an seinem/ihrem Platz?“
Assistent(in): „Worum geht es denn genau?“
Sie: „Wir haben für die Geschäftsführung eine forensische Conversion-Analyse für ${cleanUrl} erstellt und die fertige HTML-Landingpage bereits beigefügt. Er/Sie hat dazu vor wenigen Tagen eine Unterlage erhalten. Verbinden Sie mich bitte kurz mit ihm/ihr.“

📞 TEIL 2: GESPRÄCH MIT DEM ENTSCHEIDER:
Entscheider: „${name} am Apparat.“
Sie: „Guten Tag Herr/Frau ${name}, Alexander Vance. Ich fasse mich kurz: Ich habe Ihnen vor einigen Tagen die schlüsselfertige HTML-Landingpage und den Stresstest für ${company} geschickt. Haben Sie das 1-Minuten-Video dazu schon gesehen?“

🔥 EINWANDBEHANDLUNG LIVE AM TELEFON:
• Einwand: „Wir haben bereits eine Agentur, die das macht.“
  -> Antwort: „Das ist hervorragend! Genau deshalb habe ich Ihnen die HTML-Datei und den 72h-Sprintplan als offenes Dokument beigelegt. Ihre bestehende Agentur kann das in unter 60 Minuten einbauen und Sie holen sofort +25% mehr Anfragen raus. Wann werfen wir gemeinsam 10 Minuten einen Blick drauf?“

• Einwand: „Kein Bedarf / Kein Budget.“
  -> Antwort: „Verstehe ich völlig. Es geht um kein neues Großprojekt. Die fertige Seite liegt bereits vor und amortisiert sich in unter 30 Tagen. Lassen Sie uns nächsten Dienstag um 11:00 Uhr kurz 10 Minuten zoomen – wenn es nichts für Sie ist, behalten Sie den Code kostenfrei.“

• Einwand: „Schicken Sie mir das per Mail.“
  -> Antwort: „Habe ich bereits mit dem Betreff '[Ref: ${auditId}]'. Schauen Sie jetzt kurz in Ihr Postfach? Ich bleibe 20 Sekunden in der Leitung.“`,
        actionAdvice: 'Ruhige, tiefe Stimme. Nicht hektisch werden. Niemals als Verkäufer klingen, sondern wie ein technischer Prüfingenieur.',
      },

      // Step 5: Der Breakup-Pitch
      {
        step: 5,
        channel: 'breakup',
        title: 'Touch 5: Der „Breakup“-Abschluss (Archivierung)',
        timing: 'Tag 14 • 17:00 Uhr',
        badge: 'Psychologischer Hebel (FOMO)',
        goal: 'Höflicher Rückzug mit psychologischem Druckverlust, der oft späte Antworten triggert',
        subjectOrOpener: `Letzter Hinweis: Archivierung Audit-Dossier #${auditId} für ${company}`,
        script: `Hallo ${name},

da ich bisher nichts von Ihnen gehört habe, gehe ich davon aus, dass Conversion-Optimierung und die Beseitigung der aktuellen Conversion-Lecks auf ${cleanUrl} derzeit keine Priorität bei Ihnen haben.

Völlig verständlich – das Tagesgeschäft geht vor.

Ich werde das Dossier #${auditId} und die für Sie programmierte HTML-Landingpage zum kommenden Freitag aus unserem aktiven System archivieren.

Falls Sie das Paket zu einem späteren Zeitpunkt nutzen oder gegen Ihre bestehende Seite gegentesten möchten, melden Sie sich einfach kurz.

Ich wünsche Ihnen und ${company} weiterhin maximale geschäftliche Erfolge!

Herzliche Grüße,
Alexander Vance`,
        actionAdvice: 'Keine Vorwürfe, keine Bitterkeit. Dieser Schritt erzielt häufig 15-20% der Antworten, weil der Druck komplett wegfällt.',
      },
    ];
  }

  return {
    leadId: params.auditId,
    company,
    targetUrl: cleanUrl,
    niche,
    contactName: name,
    slopPhrase: slop,
    hardenedHook: hook,
    convScore: score,
    convDelta: delta,
    market,
    steps,
  };
}

/**
 * Erzeugt die Sequenz direkt aus einem AuditRun-Objekt
 */
export function generateOutreachFromAudit(
  audit: AuditRun, 
  contactName = audit.market === 'en' ? 'Founder / CEO' : 'Inhaber / CEO'
): ColdOutreachSequence {
  const cleanSource = audit.targetSource.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const brand = audit.niche.includes('/') ? audit.niche.split('/')[0].trim() : cleanSource;
  
  // Extrahiere Hook aus Master-Copy
  const masterLines = audit.masterCopy.split('\n').filter(l => l.trim().length > 0);
  const hook = masterLines[0]?.replace(/^[#>\s*]+/, '') || 
    (audit.market === 'en' ? 'Stop burning pipeline on generic copy.' : 'Schluss mit unklaren Marketing-Floskeln.');

  return generateColdOutreachSequence({
    company: brand,
    targetUrl: audit.targetSource,
    niche: audit.niche,
    contactName,
    objections: audit.objections,
    slopPhrase: audit.worstQuote,
    hardenedHook: hook,
    convScore: audit.convScoreBefore,
    convDelta: audit.convScoreAfter - audit.convScoreBefore,
    auditId: audit.id,
    market: audit.market || 'de',
  });
}
