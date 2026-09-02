const fs = require('fs');
const path = require('path');

// Prima esegue l'unico layout stabile già approvato.
require('./stable-shop-prestart.js');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const oldBlock = `    let cta = originalTrisParent.querySelector('#tris-impact-cta-copy');\n    if(!cta){\n      cta = document.createElement('div');\n      cta.id = 'tris-impact-cta-copy';\n      cta.style.pointerEvents = 'none';\n      cta.innerHTML = '<div style="font-weight:900;font-size:17px;line-height:1.05;">🔥 SCEGLI IL TRIS — PORTA A CASA DI PIÙ</div><div style="font-weight:700;font-size:12px;line-height:1.2;margin-top:4px;">3 prodotti selezionati · 1 sola spedizione</div>';\n      originalTrisParent.appendChild(cta);\n    }`;

  const newBlock = `    let cta = originalTrisParent.querySelector('#tris-impact-cta-copy');\n    if(!cta){\n      cta = document.createElement('div');\n      cta.id = 'tris-impact-cta-copy';\n      cta.style.pointerEvents = 'none';\n      originalTrisParent.appendChild(cta);\n    }\n\n    // Legge i nomi direttamente dal pannello tris corrente: nessuna copia dati o blocco duplicato.\n    const livePanel = findTrisPanel();\n    let trisNames = [];\n    if(livePanel){\n      trisNames = Array.from(livePanel.querySelectorAll('div,span,p,li,strong,b')).map(el => (el.textContent || '').trim())\n        .filter(t => /^\\+\\s+/.test(t))\n        .map(t => t.replace(/^\\+\\s+/, '').trim())\n        .filter((t, i, arr) => t && arr.indexOf(t) === i)\n        .slice(0, 3);\n      if(trisNames.length < 3){\n        trisNames = (livePanel.innerText || '').split(/\\n+/).map(t => t.trim())\n          .filter(t => /^\\+\\s+/.test(t))\n          .map(t => t.replace(/^\\+\\s+/, '').trim())\n          .filter((t, i, arr) => t && arr.indexOf(t) === i)\n          .slice(0, 3);\n      }\n    }\n    const trisLine = trisNames.length ? trisNames.join(' · ') : '3 prodotti selezionati';\n    cta.innerHTML = '<div style="font-weight:900;font-size:17px;line-height:1.05;">🔥 PIÙ PRODOTTI, MENO SPESA DI SPEDIZIONE</div><div style="font-weight:700;font-size:12px;line-height:1.2;margin-top:5px;">' + trisLine + '</div>';`;

  if (html.includes(newBlock)) {
    console.log('[Miele Artigianale] CTA tris con nomi prodotti già aggiornata.');
  } else if (html.includes(oldBlock)) {
    html = html.replace(oldBlock, newBlock);
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log('[Miele Artigianale] CTA tris aggiornata: slogan breve + nomi reali dei tre prodotti.');
  } else {
    throw new Error('Blocco CTA tris originale non trovato: nessuna modifica applicata');
  }
} catch (error) {
  console.error('[Miele Artigianale] Errore aggiornamento testo CTA tris:', error);
}
