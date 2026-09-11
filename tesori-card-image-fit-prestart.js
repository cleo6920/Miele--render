const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const styleId = 'tesori-card-image-fit-v1';
  if (!html.includes(`id="${styleId}"`)) {
    const css = `<style id="${styleId}">
/* Solo le due card indicate: foto interamente contenute nel riquadro. */
img[src*="f429f239-7de8-4c42-aa2f-04f65142268c"],
img[src*="96c84958-6021-4843-bac1-b7306310ca21"] {
  object-fit: contain !important;
  object-position: center !important;
  box-sizing: border-box !important;
  padding: 10px !important;
  background: #fff !important;
}
</style>`;
    html = html.replace('</head>', `${css}\n</head>`);
  }

  if (!html.includes(styleId)) throw new Error('CSS adattamento immagini Tesori non inserito');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Tesori di Francesco: Limoncello e Liquore al Caffe contenuti correttamente nelle card.');
} catch (error) {
  console.error('[Miele Artigianale] Errore fit immagini Tesori:', error);
  process.exitCode = 1;
}
