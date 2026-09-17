const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const spritePath = '/images/alveo-colazioni-preview-sprite.webp?v=preview4';
  const replacements = [
    [
      '<img src="/images/alveo-colazioni-cover.jpg?v=preview1" alt="Copertina della raccolta">',
      '<div class="alveo-preview-sprite alveo-preview-sprite-cover" role="img" aria-label="Copertina della raccolta"></div>'
    ],
    [
      '<img src="/images/alveo-colazioni-preview-ricetta.jpg?v=preview1" alt="Pagina ricetta di esempio">',
      '<div class="alveo-preview-sprite alveo-preview-sprite-recipe" role="img" aria-label="Pagina ricetta di esempio"></div>'
    ],
    [
      '<img src="/images/alveo-colazioni-preview-extra.jpg?v=preview1" alt="Pagina extra di esempio">',
      '<div class="alveo-preview-sprite alveo-preview-sprite-extra" role="img" aria-label="Pagina extra di esempio"></div>'
    ]
  ];

  replacements.forEach(([from, to]) => {
    if (!html.includes(from)) throw new Error(`Anteprima attesa non trovata: ${from}`);
    html = html.replace(from, to);
  });

  const previewStyle = `<style data-alveo-preview-local="true">
.alveo-preview-sprite{display:block;width:100%;aspect-ratio:480/679;background-image:url('${spritePath}');background-repeat:no-repeat;background-size:300% 100%;border-radius:8px;background-color:#fff}
.alveo-preview-sprite-cover{background-position:0 0}
.alveo-preview-sprite-recipe{background-position:50% 0}
.alveo-preview-sprite-extra{background-position:100% 0}
</style>`;
  html = html.includes('</body>') ? html.replace('</body>', `${previewStyle}\n</body>`) : `${html}\n${previewStyle}`;

  const oldStaticBuy = '<button type="button" data-alveo-demo="colazioni" className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-stone-950">Guarda esempio</button>';
  const newStaticBuy = '<button type="button" data-alveo-buy="colazioni" className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-stone-950">Acquista PDF</button>';
  if (html.includes(oldStaticBuy)) html = html.replace(oldStaticBuy, newStaticBuy);

  html = html.replace("String(btn.textContent||'').trim()==='Acquista prova'", "String(btn.textContent||'').trim()==='Acquista PDF'");
  html = html.replace("btn.textContent='Acquista prova';", "btn.textContent='Acquista PDF';");
  html = html.replace("btn.setAttribute('aria-label','Simula acquisto di 10 Colazioni dell’Alveare');", "btn.setAttribute('aria-label','Acquista PDF 10 Colazioni dell’Alveare - simulazione Render');");

  if (!html.includes('alveo-preview-sprite-recipe')) throw new Error('Anteprima locale non applicata');
  if (!html.includes('Acquista PDF')) throw new Error('Pulsante Acquista PDF non applicato');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Alveo Digitale: anteprima locale nitida attiva, senza Google Drive.');
} catch (error) {
  console.error('[Miele Artigianale] Errore anteprima locale Alveo Digitale:', error);
  process.exitCode = 1;
}
