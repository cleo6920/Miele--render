const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  const styleId = 'cosmesi-card-image-fit-v1';
  if (!html.includes(`id="${styleId}"`)) {
    const css = `<style id="${styleId}">
/* Solo le tre card indicate: foto interamente contenute nel riquadro. */
img[src="/images/cosmesi-crema-mani.jpg"],
img[src="/images/cosmesi-burrocacao-propoli-aloe.jpg"],
img[src="/images/cosmesi-burrocacao-miele-pappa-reale.jpg"] {
  object-fit: contain !important;
  object-position: center !important;
  box-sizing: border-box !important;
  padding: 10px !important;
  background: #fff !important;
}
</style>`;
    html = html.replace('</head>', `${css}\n</head>`);
  }

  if (!html.includes(styleId)) throw new Error('CSS adattamento immagini Cosmesi non inserito');

  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('[Miele Artigianale] Cosmesi: Crema Mani e due Burrocacao contenuti correttamente nelle card.');
} catch (error) {
  console.error('[Miele Artigianale] Errore fit immagini Cosmesi:', error);
  process.exitCode = 1;
}
