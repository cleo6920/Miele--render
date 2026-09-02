const fs = require('fs');
const path = require('path');

// Esegue prima la catena stabile corrente.
require('./stable-shop-prestart.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const oldLine = `      cta.innerHTML = '<div style="font-weight:900;font-size:17px;line-height:1.05;">🔥 SCEGLI IL TRIS — PORTA A CASA DI PIÙ</div><div style="font-weight:700;font-size:12px;line-height:1.2;margin-top:4px;">3 prodotti selezionati · 1 sola spedizione</div>';`;

  const replacement = `      const livePanel = findTrisPanel();\n      let trisNames = [];\n      if(livePanel){\n        trisNames = Array.from(livePanel.querySelectorAll('div,span,p,li,strong,b')).map(el => (el.textContent || '').trim())\n          .filter(t => /^\\+\\s+/.test(t))\n          .map(t => t.replace(/^\\+\\s+/, '').trim())\n          .filter((t, i, arr) => t && arr.indexOf(t) === i)\n          .slice(0, 3);\n        if(trisNames.length < 3){\n          trisNames = (livePanel.innerText || '').split(/\\n+/).map(t => t.trim())\n            .filter(t => /^\\+\\s+/.test(t))\n            .map(t => t.replace(/^\\+\\s+/, '').trim())\n            .filter((t, i, arr) => t && arr.indexOf(t) === i)\n            .slice(0, 3);\n        }\n      }\n      const trisLine = trisNames.length ? trisNames.join(' · ') : '';\n      cta.innerHTML = '<div style="font-weight:900;font-size:17px;line-height:1.05;">🔥 SCEGLI IL TRIS — 3 PRODOTTI, STESSO COSTO DI SPEDIZIONE</div>' + (trisLine ? '<div style="font-weight:700;font-size:12px;line-height:1.2;margin-top:5px;">' + trisLine + '</div>' : '');`;

  const count = html.split(oldLine).length - 1;
  if (count !== 1) {
    throw new Error('CTA legacy atteso una sola volta, trovato: ' + count);
  }

  html = html.replace(oldLine, replacement);

  // Verifica che il testo legacy non rimanga nel file servito.
  if (html.includes('PORTA A CASA DI PIÙ') || html.includes('3 prodotti selezionati · 1 sola spedizione')) {
    throw new Error('Testo CTA legacy ancora presente dopo la sostituzione');
  }

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] CTA tris autoritativa applicata: nessun testo legacy nel file servito.');
} catch (error) {
  console.error('[Miele Artigianale] Errore CTA tris autoritativa:', error);
}
