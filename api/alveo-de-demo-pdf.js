const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const GREEN = rgb(0.05, 0.29, 0.23);
const GOLD = rgb(0.86, 0.60, 0.06);
const CREAM = rgb(0.97, 0.94, 0.87);
const DARK = rgb(0.10, 0.15, 0.12);
const MUTED = rgb(0.36, 0.42, 0.38);
const WHITE = rgb(1, 1, 1);

function wrap(text, font, size, maxWidth) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? current + ' ' + word : word;
    if (!current || font.widthOfTextAtSize(next, size) <= maxWidth) current = next;
    else { lines.push(current); current = word; }
  }
  if (current) lines.push(current);
  return lines;
}

function drawWrapped(page, text, x, y, maxWidth, font, size, color, lineHeight = size * 1.28) {
  let yy = y;
  for (const line of wrap(text, font, size, maxWidth)) {
    page.drawText(line, { x, y: yy, size, font, color });
    yy -= lineHeight;
  }
  return yy;
}

function footer(page, n, regular) {
  page.drawText('10 Frühstücke aus dem Bienenstock · RENDER-DEMO', {
    x: 42, y: 24, size: 8.5, font: regular, color: MUTED
  });
  page.drawText(String(n), { x: 548, y: 24, size: 8.5, font: regular, color: MUTED });
}

async function buildPdf() {
  const pdf = await PDFDocument.create();
  pdf.setTitle('10 Frühstücke aus dem Bienenstock - Deutsche Demo');
  pdf.setAuthor('La Fabbrica delle Api');
  pdf.setSubject('Render-Sprachtest Deutsch');
  pdf.setKeywords(['Alveo Digital', 'Frühstück', 'Honig', 'Demo', 'Deutsch']);

  const helv = await pdf.embedFont(StandardFonts.Helvetica);
  const helvBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const times = await pdf.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const W = 595.28, H = 841.89;

  // 1 - Cover
  {
    const p = pdf.addPage([W, H]);
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: GREEN });
    p.drawRectangle({ x: 0, y: H - 235, width: W, height: 235, color: rgb(0.48, 0.30, 0.08) });
    p.drawCircle({ x: 44, y: H - 38, size: 4, color: GOLD });
    p.drawText('LA FABBRICA DELLE API', { x: 56, y: H - 43, size: 10, font: helvBold, color: WHITE });
    p.drawRectangle({ x: 42, y: 560, width: 122, height: 22, color: GOLD });
    p.drawText('DEMO · 5 SEITEN', { x: 55, y: 567, size: 9, font: helvBold, color: DARK });
    p.drawText('10 FRÜHSTÜCKE', { x: 42, y: 485, size: 34, font: timesBold, color: WHITE });
    p.drawText('AUS DEM BIENENSTOCK', { x: 42, y: 445, size: 30, font: timesBold, color: WHITE });
    p.drawText('ZEHN MORGEN. ZEHN KLEINE GENUSSMOMENTE.', { x: 42, y: 398, size: 11, font: helvBold, color: GOLD });
    drawWrapped(p, 'Ein kleines Magazin zum Kochen, Blättern und jeden Morgen neu Entdecken.', 42, 365, 500, helv, 13, WHITE, 18);
    p.drawLine({ start: { x: 42, y: 290 }, end: { x: 553, y: 290 }, thickness: 1, color: rgb(0.36, 0.54, 0.47) });
    p.drawText('10 VOLLSTÄNDIGE REZEPTE', { x: 42, y: 254, size: 11, font: helvBold, color: WHITE });
    p.drawText('20 SCHNELLE IDEEN', { x: 42, y: 225, size: 11, font: helvBold, color: WHITE });
    p.drawText('WOCHENPLANER UND EINKAUFSLISTE', { x: 310, y: 254, size: 10.5, font: helvBold, color: GOLD });
    p.drawText('QUIZ UND HONIGVERKOSTUNG', { x: 310, y: 225, size: 10.5, font: helvBold, color: GOLD });
    p.drawText('SPRACHTEST AUF RENDER · NICHT DIE ENDGÜLTIGE DEUTSCHE AUSGABE', { x: 88, y: 95, size: 8.5, font: helv, color: WHITE });
    footer(p, 1, helv);
  }

  // 2 - Index
  {
    const p = pdf.addPage([W, H]);
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREAM });
    p.drawCircle({ x: 42, y: H - 34, size: 4, color: GOLD });
    p.drawText('LA FABBRICA DELLE API', { x: 54, y: H - 39, size: 9, font: helvBold, color: GREEN });
    p.drawText('INHALT', { x: 510, y: H - 39, size: 9, font: helvBold, color: GREEN });
    p.drawText('DER WEG DURCH DEN RATGEBER', { x: 42, y: 760, size: 9.5, font: helvBold, color: GOLD });
    p.drawText('Was dich erwartet', { x: 42, y: 720, size: 30, font: timesBold, color: GREEN });
    drawWrapped(p, 'Jeder Abschnitt hat seinen eigenen Rhythmus: Rezepte, praktische Hilfen, Honigwissen und schnelle Ideen.', 42, 680, 510, helv, 11.5, MUTED, 16);
    p.drawLine({ start: { x: 42, y: 645 }, end: { x: 553, y: 645 }, thickness: 2, color: GOLD });

    const left = [
      ['01', 'Joghurt, Obst und Blütenhonig', '4'],
      ['02', 'Geröstetes Brot, Ricotta und Akazienhonig', '6'],
      ['03', 'Apfel-Kastanien-Porridge', '8'],
      ['04', 'Bananen-Pancakes mit Orangenhonig', '10'],
      ['05', 'Knuspriges Honig-Granola', '12'],
      ['06', 'Obstsalat mit Pfirsichhonig', '14'],
      ['07', 'Toast mit Apfel, Zimt und Honig', '16'],
      ['08', 'Bananen-Honig-Smoothie', '18'],
      ['09', 'Kalter Porridge mit Erdbeeren', '20'],
      ['10', 'Brot, Ricotta und Honigverkostung', '22']
    ];
    p.drawText('01 · DIE 10 FRÜHSTÜCKE', { x: 42, y: 615, size: 10.5, font: helvBold, color: GREEN });
    let y = 585;
    for (const [n, name, pg] of left) {
      p.drawText(n, { x: 42, y, size: 12, font: timesBold, color: GOLD });
      const fsize = name.length > 35 ? 8.4 : 9.2;
      p.drawText(name, { x: 72, y: y + 1, size: fsize, font: helvBold, color: DARK });
      p.drawText(pg, { x: 280, y: y + 1, size: 9, font: helv, color: MUTED });
      y -= 42;
    }

    p.drawText('02 · ORGANISIERE DEINE MORGEN', { x: 320, y: 615, size: 10.5, font: helvBold, color: GREEN });
    p.drawText('Wochenplaner', { x: 320, y: 585, size: 10, font: helvBold, color: DARK });
    p.drawText('25', { x: 535, y: 585, size: 9, font: helv, color: MUTED });
    p.drawText('Einkaufsliste', { x: 320, y: 545, size: 10, font: helvBold, color: DARK });
    p.drawText('26', { x: 535, y: 545, size: 9, font: helv, color: MUTED });

    p.drawText('03 · ENTDECKE DEINEN HONIG', { x: 320, y: 495, size: 10.5, font: helvBold, color: GREEN });
    const right1 = [['Quiz: Welcher Honig passt zu dir?', '28'], ['Der Honig, der zu dir passt', '29'], ['Kleine Verkostung', '30'], ['Geschmackspass', '31']];
    y = 465;
    for (const [name, pg] of right1) {
      p.drawText(name, { x: 320, y, size: 9.5, font: helvBold, color: DARK });
      p.drawText(pg, { x: 535, y, size: 9, font: helv, color: MUTED });
      y -= 36;
    }

    p.drawText('04 · 20 SCHNELLE IDEEN', { x: 320, y: 305, size: 10.5, font: helvBold, color: GREEN });
    const right2 = [['Frisch und cremig', '33'], ['Warm und knusprig', '34'], ['Zum Vorbereiten oder Mitnehmen', '35'], ['Langsam genießen und teilen', '36']];
    y = 275;
    for (const [name, pg] of right2) {
      p.drawText(name, { x: 320, y, size: name.length > 25 ? 8.5 : 9.5, font: helvBold, color: DARK });
      p.drawText(pg, { x: 535, y, size: 9, font: helv, color: MUTED });
      y -= 36;
    }
    p.drawRectangle({ x: 320, y: 70, width: 233, height: 100, color: GREEN });
    p.drawText('EIN RATGEBER, DEN DU WIRKLICH NUTZT', { x: 335, y: 140, size: 9, font: helvBold, color: WHITE });
    drawWrapped(p, 'Blättere der Reihe nach oder springe direkt zu den Abschnitten, die du brauchst.', 335, 118, 200, helv, 9.5, WHITE, 13);
    footer(p, 2, helv);
  }

  // 3 - Section opener
  {
    const p = pdf.addPage([W, H]);
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(0.36, 0.20, 0.06) });
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: rgb(0.18, 0.10, 0.03), opacity: 0.20 });
    p.drawCircle({ x: 42, y: H - 34, size: 4, color: GOLD });
    p.drawText('LA FABBRICA DELLE API', { x: 54, y: H - 39, size: 9, font: helvBold, color: WHITE });
    p.drawText('REZEPTE', { x: 510, y: H - 39, size: 9, font: helvBold, color: WHITE });
    p.drawText('01', { x: 42, y: 610, size: 92, font: times, color: GOLD });
    p.drawLine({ start: { x: 45, y: 592 }, end: { x: 205, y: 592 }, thickness: 3, color: GOLD });
    p.drawText('Die 10 Frühstücke', { x: 42, y: 535, size: 34, font: timesBold, color: WHITE });
    drawWrapped(p, 'Zehn vollständige Rezepte. Jedes Frühstück wird auf der nächsten Seite mit Varianten und praktischen Tipps fortgesetzt.', 42, 490, 500, helv, 13, WHITE, 18);
    p.drawText('Diese Seite zeigt im Render-Test, dass auch die Vorschau in der gewählten Sprache wechselt.', { x: 42, y: 120, size: 10, font: helv, color: rgb(0.95, 0.86, 0.64) });
    footer(p, 3, helv);
  }

  // 4 - Recipe
  {
    const p = pdf.addPage([W, H]);
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREAM });
    p.drawRectangle({ x: 0, y: H - 230, width: W, height: 230, color: rgb(0.74, 0.38, 0.13) });
    p.drawText('DIE 10 FRÜHSTÜCKE', { x: 430, y: H - 38, size: 8.5, font: helvBold, color: WHITE });
    p.drawText('FRÜHSTÜCK 01 · REZEPT', { x: 430, y: H - 55, size: 8.5, font: helv, color: WHITE });
    p.drawText('01', { x: 480, y: 625, size: 62, font: timesBold, color: WHITE });
    p.drawText('FRÜHSTÜCK 01', { x: 42, y: 575, size: 10, font: helvBold, color: GOLD });
    p.drawText('Joghurt, Obst und Blütenhonig', { x: 42, y: 535, size: 27, font: timesBold, color: GREEN });
    p.drawText('Frisch, farbenfroh und in wenigen Minuten fertig.', { x: 42, y: 505, size: 11, font: helv, color: MUTED });

    p.drawText('ZEIT', { x: 50, y: 455, size: 9.5, font: helvBold, color: GOLD });
    p.drawText('5 Minuten', { x: 50, y: 435, size: 12, font: helvBold, color: DARK });
    p.drawText('SCHWIERIGKEIT', { x: 230, y: 455, size: 9.5, font: helvBold, color: GOLD });
    p.drawText('Sehr einfach', { x: 230, y: 435, size: 12, font: helvBold, color: DARK });
    p.drawText('FÜR', { x: 430, y: 455, size: 9.5, font: helvBold, color: GOLD });
    p.drawText('1 Person', { x: 430, y: 435, size: 12, font: helvBold, color: DARK });
    p.drawLine({ start: { x: 42, y: 410 }, end: { x: 553, y: 410 }, thickness: 1.5, color: GOLD });

    p.drawText('DU BRAUCHST', { x: 42, y: 380, size: 11, font: helvBold, color: GREEN });
    const ing = ['150 g Naturjoghurt', '100 g Obst der Saison', '2 EL Haferflocken', '1 TL Blütenhonig'];
    let y = 350;
    for (const t of ing) {
      p.drawCircle({ x: 48, y: y + 4, size: 2.6, color: GOLD });
      p.drawText(t, { x: 60, y, size: 11, font: helv, color: DARK });
      y -= 25;
    }

    p.drawText('SO GEHT’S', { x: 320, y: 380, size: 11, font: helvBold, color: GREEN });
    const steps = [
      ['01', 'Joghurt in eine Schüssel geben.'],
      ['02', 'Obst und Haferflocken dazugeben.'],
      ['03', 'Kurz vor dem Servieren mit Honig verfeinern.']
    ];
    y = 350;
    for (const [n, t] of steps) {
      p.drawText(n, { x: 320, y, size: 16, font: timesBold, color: GOLD });
      drawWrapped(p, t, 352, y + 2, 190, helv, 10.5, DARK, 14);
      y -= 48;
    }

    p.drawRectangle({ x: 0, y: 70, width: W, height: 120, color: GREEN });
    p.drawText('EMPFOHLENER HONIG', { x: 42, y: 145, size: 9.5, font: helvBold, color: GOLD });
    p.drawText('Blütenhonig', { x: 42, y: 112, size: 21, font: timesBold, color: WHITE });
    drawWrapped(p, 'Mild und ausgewogen: verbindet Joghurt, Getreide und Obst.', 215, 132, 320, helv, 11, WHITE, 15);
    footer(p, 4, helv);
  }

  // 5 - Variants
  {
    const p = pdf.addPage([W, H]);
    p.drawRectangle({ x: 0, y: 0, width: W, height: H, color: CREAM });
    p.drawRectangle({ x: 0, y: 0, width: 210, height: H, color: GREEN });
    p.drawText('01', { x: 35, y: 650, size: 86, font: times, color: WHITE });
    p.drawText('FRÜHSTÜCK', { x: 36, y: 610, size: 10.5, font: helvBold, color: WHITE });
    drawWrapped(p, 'Joghurt, Obst und Blütenhonig', 36, 575, 145, timesBold, 17, WHITE, 21);
    drawWrapped(p, 'Varianten und Ideen für mehr Abwechslung - ohne die Zubereitung komplizierter zu machen.', 36, 150, 145, helv, 10.5, WHITE, 15);

    p.drawText('FRÜHSTÜCK 01 · VARIANTEN UND IDEEN', { x: 245, y: 750, size: 9, font: helvBold, color: GOLD });
    p.drawText('Mach es noch mehr zu deinem', { x: 245, y: 710, size: 24, font: timesBold, color: GREEN });
    p.drawLine({ start: { x: 245, y: 685 }, end: { x: 553, y: 685 }, thickness: 2, color: GOLD });
    p.drawText('DREI VARIANTEN', { x: 245, y: 650, size: 11, font: helvBold, color: GREEN });

    const vars = [
      ['01', 'Pfirsich', 'Pfirsichwürfel und ein wenig Blütenhonig.'],
      ['02', 'Beeren', 'Heidelbeeren, Himbeeren oder gut abgetropfte Erdbeeren.'],
      ['03', 'Apfel und Zimt', 'Dünne Apfelscheiben, Zimt und geröstete Haferflocken.']
    ];
    let y = 615;
    for (const [n, ttl, desc] of vars) {
      p.drawText(n, { x: 245, y, size: 16, font: timesBold, color: GOLD });
      p.drawText(ttl, { x: 278, y: y + 1, size: 12, font: helvBold, color: DARK });
      y = drawWrapped(p, desc, 278, y - 17, 265, helv, 9.7, MUTED, 13) - 15;
    }

    p.drawText('VORBEREITEN', { x: 245, y: 445, size: 11, font: helvBold, color: GREEN });
    p.drawText('01', { x: 245, y: 410, size: 16, font: timesBold, color: GOLD });
    p.drawText('Am Vorabend vorbereiten', { x: 278, y: 411, size: 11.5, font: helvBold, color: DARK });
    drawWrapped(p, 'Obst abends waschen und schneiden. Getreide und Honig getrennt aufbewahren; erst kurz vor dem Essen dazugeben.', 278, 391, 265, helv, 9.5, MUTED, 13);
    p.drawText('02', { x: 245, y: 315, size: 16, font: timesBold, color: GOLD });
    p.drawText('Alternativen', { x: 278, y: 316, size: 11.5, font: helvBold, color: DARK });
    drawWrapped(p, 'Joghurt, griechischer Joghurt oder Ricotta. Haferflocken oder Granola. Obst der Saison.', 278, 296, 265, helv, 9.5, MUTED, 13);

    p.drawRectangle({ x: 245, y: 120, width: 308, height: 95, color: rgb(1.0, 0.94, 0.72), borderColor: rgb(0.92, 0.82, 0.55), borderWidth: 1 });
    p.drawText('MEINE VARIANTE', { x: 280, y: 185, size: 10, font: helvBold, color: GREEN });
    p.drawLine({ start: { x: 280, y: 160 }, end: { x: 530, y: 160 }, thickness: 0.5, color: rgb(0.82, 0.75, 0.58) });
    p.drawLine({ start: { x: 280, y: 142 }, end: { x: 530, y: 142 }, thickness: 0.5, color: rgb(0.82, 0.75, 0.58) });

    p.drawRectangle({ x: 210, y: 55, width: 385, height: 48, color: GREEN });
    p.drawText('FÜR 2 PERSONEN · 300 g Joghurt · 200 g Obst · 4 EL Haferflocken · 2 TL Blütenhonig', { x: 240, y: 74, size: 8.5, font: helvBold, color: WHITE });
    footer(p, 5, helv);
  }

  return pdf.save();
}

let cachedPdf = null;

module.exports = async (_req, res) => {
  try {
    if (!cachedPdf) cachedPdf = await buildPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Disposition', 'attachment; filename="10-Fruehstuecke-aus-dem-Bienenstock-DEMO.pdf"');
    return res.status(200).send(Buffer.from(cachedPdf));
  } catch (error) {
    console.error('[Alveo DE Demo] PDF generation error:', error);
    return res.status(500).send('Impossibile generare la demo PDF tedesca.');
  }
};
