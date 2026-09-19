const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  if (html.includes('data-alveo-priority-pair="true"')) {
    console.log('[Miele Artigianale] Alveo Digitale già affiancato alla Linea Veleno.');
    return;
  }

  const cardMarker = 'id="linea-alveo-digitale-home"';
  const cardPos = html.indexOf(cardMarker);
  if (cardPos === -1) throw new Error('Card Alveo Digitale non trovata');

  const cardStart = html.lastIndexOf('<article', cardPos);
  const cardEndStart = html.indexOf('</article>', cardPos);
  if (cardStart === -1 || cardEndStart === -1) throw new Error('Limiti card Alveo Digitale non trovati');
  const cardEnd = cardEndStart + '</article>'.length;
  const alveoCard = html.slice(cardStart, cardEnd);

  html = html.slice(0, cardStart) + html.slice(cardEnd);

  const velenoMarker = 'id="linea-benessere-veleno-api-home"';
  const velenoPos = html.indexOf(velenoMarker);
  if (velenoPos === -1) throw new Error('Sezione Linea Veleno non trovata');

  const sectionStart = html.lastIndexOf('<section', velenoPos);
  const sectionEndStart = html.indexOf('</section>', velenoPos);
  if (sectionStart === -1 || sectionEndStart === -1) throw new Error('Limiti sezione Linea Veleno non trovati');
  const sectionEnd = sectionEndStart + '</section>'.length;
  let section = html.slice(sectionStart, sectionEnd);

  const articleStart = section.indexOf('<article');
  const articleEndStart = section.indexOf('</article>', articleStart);
  if (articleStart === -1 || articleEndStart === -1) throw new Error('Card Linea Veleno non trovata');
  const articleEnd = articleEndStart + '</article>'.length;
  const velenoCard = section.slice(articleStart, articleEnd);

  const pair = `<div data-alveo-priority-pair="true" className="mx-auto grid w-full max-w-[1248px] grid-cols-1 xl:grid-cols-[minmax(0,900px)_minmax(0,328px)] gap-3 xl:gap-5 items-stretch">
${velenoCard}
${alveoCard}
</div>`;

  section = section.slice(0, articleStart) + pair + section.slice(articleEnd);
  html = html.slice(0, sectionStart) + section + html.slice(sectionEnd);

  if (!html.includes('data-alveo-priority-pair="true"')) throw new Error('Affiancamento Veleno + Alveo non applicato');
  if (!html.includes('/images/alveo-digitale-card-render.webp?v=alveo-card-1')) throw new Error('Nuova immagine Alveo Digitale non applicata');

  const pairPos = html.indexOf('data-alveo-priority-pair="true"');
  const velenoInPair = html.indexOf('Uno dei punti di forza del nostro Centro', pairPos);
  const alveoInPair = html.indexOf('id="linea-alveo-digitale-home"', pairPos);
  if (velenoInPair === -1 || alveoInPair === -1 || velenoInPair > alveoInPair) {
    throw new Error('Ordine prioritario Linea Veleno → Alveo Digitale non valido');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Linea Veleno prioritaria e Alveo Digitale affiancata; nuova foto realistica attiva solo su Render.');
} catch (error) {
  console.error('[Miele Artigianale] Errore layout prioritario Veleno + Alveo Digitale:', error);
  process.exitCode = 1;
}
