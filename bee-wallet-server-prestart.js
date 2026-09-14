const fs = require('fs');
const path = require('path');

try {
  const serverPath = path.join(__dirname, 'server.js');
  let source = fs.readFileSync(serverPath, 'utf8');
  const importAnchor = "const createCheckoutSession = require('./api/create-checkout-session');";
  const routeAnchor = "app.post('/api/create-checkout-session', createCheckoutSession);";

  if (!source.includes("require('./api/bee-wallet')")) {
    if (!source.includes(importAnchor)) throw new Error('Anchor import checkout non trovato in server.js');
    source = source.replace(importAnchor, `${importAnchor}\nconst beeWallet = require('./api/bee-wallet');`);
  }

  if (!source.includes("app.post('/api/bee-wallet'")) {
    if (!source.includes(routeAnchor)) throw new Error('Anchor route checkout non trovato in server.js');
    source = source.replace(routeAnchor, `${routeAnchor}\napp.post('/api/bee-wallet', beeWallet);`);
  }

  fs.writeFileSync(serverPath, source, 'utf8');
  console.log('[Miele Artigianale] API Saldo Api permanente attiva su /api/bee-wallet.');
  const { callBeeDataApi } = require('./bee-wallet-client');
  callBeeDataApi('lookup', { email: 'healthcheck@bee-wallet.invalid' })
    .then(() => console.log('[Miele Artigianale] Archivio persistente Saldo Api: CONNESSO.'))
    .catch((err) => console.error('[Miele Artigianale] Archivio persistente Saldo Api: ERRORE', err && err.message ? err.message : err));
} catch (error) {
  console.error('[Miele Artigianale] Errore attivazione API Saldo Api:', error);
  process.exitCode = 1;
}
