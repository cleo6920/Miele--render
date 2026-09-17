const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const replacements = [
    [
      '<div class="alveo-preview-page"><img src="/images/alveo-colazioni-cover.jpg?v=preview1" alt="Copertina della raccolta">',
      '<div class="alveo-preview-page"><img src="https://drive.google.com/uc?export=view&id=1l4ZAnTABUG_34bkbzROciGEYcEFgFHLR" alt="Copertina della raccolta">'
    ],
    [
      '<div class="alveo-preview-page"><img src="/images/alveo-colazioni-preview-ricetta.jpg?v=preview1" alt="Pagina ricetta di esempio">',
      '<div class="alveo-preview-page"><img src="https://drive.google.com/uc?export=view&id=1Ravlx5sk7HThpciomZg3_i9ySBj_yFhL" alt="Pagina ricetta di esempio">'
    ],
    [
      '<div class="alveo-preview-page"><img src="/images/alveo-colazioni-preview-extra.jpg?v=preview1" alt="Pagina extra di esempio">',
      '<div class="alveo-preview-page"><img src="https://drive.google.com/uc?export=view&id=1uu-dd3daN5LZccteeLnN9EHo-e6ECyIp" alt="Pagina extra di esempio">'
    ]
  ];

  replacements.forEach(([from, to]) => {
    if (!html.includes(from)) throw new Error(`Anteprima attesa non trovata: ${from.slice(0, 80)}`);
    html = html.replace(from, to);
  });

  const oldStaticBuy = '<button type="button" data-alveo-demo="colazioni" className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-stone-950">Guarda esempio</button>';
  const newStaticBuy = '<button type="button" data-alveo-buy="colazioni" className="mt-3 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2.5 text-sm font-black text-stone-950">Acquista PDF</button>';
  if (!html.includes(oldStaticBuy)) throw new Error('Pulsante Guarda esempio del PDF non trovato');
  html = html.replace(oldStaticBuy, newStaticBuy);

  html = html.replace("String(btn.textContent||'').trim()==='Acquista prova'", "String(btn.textContent||'').trim()==='Acquista PDF'");
  html = html.replace("btn.textContent='Acquista prova';", "btn.textContent='Acquista PDF';");
  html = html.replace("btn.setAttribute('aria-label','Simula acquisto di 10 Colazioni dell’Alveare');", "btn.setAttribute('aria-label','Acquista PDF 10 Colazioni dell’Alveare - simulazione Render');");

  if (!html.includes('Acquista PDF')) throw new Error('Testo Acquista PDF non applicato');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Alveo Digitale: anteprima HD e pulsante Acquista PDF applicati solo su Render.');
} catch (error) {
  console.error('[Miele Artigianale] Errore fix anteprima HD Alveo Digitale:', error);
  process.exitCode = 1;
}
