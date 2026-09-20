const fs = require('fs');
const path = require('path');

try {
  const indexPath = path.join(__dirname, 'index.html');
  const serverPath = path.join(__dirname, 'server.js');
  let html = fs.readFileSync(indexPath, 'utf8');
  let server = fs.readFileSync(serverPath, 'utf8');

  const marker = 'data-render-language-de-test="true"';
  if (!html.includes(marker)) {
    const tag = '<script src="/render-language-de-test.js?v=20260920-1" '+marker+'></script>';
    html = html.includes('</body>') ? html.replace('</body>', tag+'\n</body>') : html+'\n'+tag;
  }

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

  fs.writeFileSync(indexPath, html, 'utf8');
  fs.writeFileSync(serverPath, server, 'utf8');
  console.log('[Render language test] IT/DE selector, German Alveo preview and German demo PDF route enabled.');
} catch (error) {
  console.error('[Render language test] Errore attivazione prova IT/DE:', error);
  process.exitCode = 1;
}
