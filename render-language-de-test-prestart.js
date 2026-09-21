const fs = require('fs');
const path = require('path');

try {
  const marker = 'data-global-language-switch="true"';
  const tag = '<script src="/render-language-de-test.js?v=20260921-it-en-global-1" '+marker+'></script>';
  const oldMarkers = [
    'data-render-language-de-test="true"',
    'data-global-language-switch="true"'
  ];
  const publicPages = [
    'index.html',
    'home.html',
    'centro.html',
    'alveoterapia.html',
    'bacheca.html',
    'chi-siamo.html',
    'contatti.html',
    'alveo-digitale.html',
    'privacy.html',
    'condizioni-vendita.html',
    'resi-recesso.html',
    'saldo-api.html',
    'success.html',
    'cancel.html',
    'test-purchase-success.html'
  ];

  let injectedPages = 0;
  publicPages.forEach((fileName) => {
    const filePath = path.join(__dirname, fileName);
    if (!fs.existsSync(filePath)) return;
    let html = fs.readFileSync(filePath, 'utf8');

    html = html.replace(/<script src="\/render-language-de-test\.js\?v=[^"]+" data-render-language-de-test="true"><\/script>\s*/g, '');
    html = html.replace(/<script src="\/render-language-de-test\.js\?v=[^"]+" data-global-language-switch="true"><\/script>\s*/g, '');

    if (html.includes('</body>')) html = html.replace('</body>', tag+'\n</body>');
    else html += '\n'+tag;

    fs.writeFileSync(filePath, html, 'utf8');
    injectedPages += 1;
  });

  console.log('[Global language] IT/EN selector enabled on '+injectedPages+' customer pages.');
} catch (error) {
  console.error('[Global language] Errore attivazione IT/EN:', error);
  process.exitCode = 1;
}
