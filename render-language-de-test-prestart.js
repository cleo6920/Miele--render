const fs = require('fs');
const path = require('path');

try {
  const serverPath = path.join(__dirname, 'server.js');
  let server = fs.readFileSync(serverPath, 'utf8');

  const marker = 'data-render-language-de-test="true"';
  const tag = '<script src="/render-language-de-test.js?v=20260920-global-2" '+marker+'></script>';
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
    if (!html.includes(marker)) {
      html = html.includes('</body>') ? html.replace('</body>', tag+'\n</body>') : html+'\n'+tag;
      fs.writeFileSync(filePath, html, 'utf8');
      injectedPages += 1;
    } else {
      html = html.replace(/<script src="\/render-language-de-test\.js\?v=[^"]+" data-render-language-de-test="true"><\/script>/g, tag);
      fs.writeFileSync(filePath, html, 'utf8');
    }
  });

  const importAnchor = "const createCheckoutSession = require('./api/create-checkout-session');";
  if (!server.includes("require('./api/alveo-de-demo-pdf')")) {
    if (!server.includes(importAnchor)) throw new Error('Anchor import checkout non trovato');
    server = server.replace(importAnchor, importAnchor+"\nconst alveoDeDemoPdf = require('./api/alveo-de-demo-pdf');");
  }

  const routeAnchor = "app.post('/api/create-checkout-session', createCheckoutSession);";
  if (!server.includes("app.get('/downloads/10-fruehstuecke-bienenstock-demo-de.pdf'")) {
    if (!server.includes(routeAnchor)) throw new Error('Anchor route checkout non trovato');
    server = server.replace(routeAnchor, routeAnchor+"\napp.get('/downloads/10-fruehstuecke-bienenstock-demo-de.pdf', alveoDeDemoPdf);");
  }

  fs.writeFileSync(serverPath, server, 'utf8');
  console.log('[Render language test] Global IT/DE mode enabled on '+publicPages.length+' customer pages; newly injected: '+injectedPages+'. German Alveo preview and demo PDF route enabled.');
} catch (error) {
  console.error('[Render language test] Errore attivazione prova IT/DE:', error);
  process.exitCode = 1;
}
