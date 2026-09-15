const crypto = require('crypto');

const PROD_ENDPOINT = 'https://ecommerce.nexi.it/ecomm/ecomm/DispatcherServlet';

function clean(value, max = 200) {
  return String(value || '').trim().slice(0, max);
}

function siteUrl() {
  return String(process.env.APP_URL || 'https://lafabbricadelleapi.it')
    .trim()
    .replace(/\/+$/, '');
}

function config() {
  const alias = clean(process.env.XPAY_ALIAS, 30);
  const secret = String(process.env.XPAY_MAC_KEY || '').trim();
  const endpoint = String(process.env.XPAY_ENDPOINT || PROD_ENDPOINT).trim();
  return { alias, secret, endpoint };
}

function isLiveEnabled() {
  return String(process.env.XPAY_LIVE_ENABLED || '').trim().toLowerCase() === 'true';
}

function isConfigured() {
  const { alias, secret, endpoint } = config();
  return Boolean(alias && secret && /^https:\/\//i.test(endpoint));
}

function sha1(value) {
  return crypto.createHash('sha1').update(value, 'utf8').digest('hex');
}

function startMac(codTrans, divisa, importo, secret) {
  return sha1(`codTrans=${codTrans}divisa=${divisa}importo=${importo}${secret}`);
}

function resultMac(fields, secret) {
  const codTrans = clean(fields.codTrans, 30);
  const esito = clean(fields.esito, 20);
  const importo = clean(fields.importo, 20);
  const divisa = clean(fields.divisa, 3);
  const data = clean(fields.data, 20);
  const orario = clean(fields.orario, 20);
  const codAut = clean(fields.codAut, 20);
  return sha1(`codTrans=${codTrans}esito=${esito}importo=${importo}divisa=${divisa}data=${data}orario=${orario}codAut=${codAut}${secret}`);
}

function timingSafeEqualText(a, b) {
  const left = Buffer.from(String(a || '').toLowerCase(), 'utf8');
  const right = Buffer.from(String(b || '').toLowerCase(), 'utf8');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function signToken(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

function readToken(token, secret) {
  const [body, signature] = String(token || '').split('.');
  if (!body || !signature) throw new Error('Token XPay non valido.');
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (!timingSafeEqualText(signature, expected)) throw new Error('Firma token XPay non valida.');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (!payload || Number(payload.exp || 0) < Date.now()) throw new Error('Sessione XPay scaduta.');
  return payload;
}

function makeTransactionId() {
  const time = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(5).toString('hex').toUpperCase();
  return `FDA${time}${random}`.slice(0, 30);
}

function createPaymentRedirectUrl({ amountCents, email, description, note1, note2, note3 }) {
  const { alias, secret } = config();
  if (!alias || !secret) throw new Error('Configurazione XPay incompleta.');

  const importo = String(Math.round(Number(amountCents)));
  if (!/^\d+$/.test(importo) || Number(importo) < 1 || Number(importo) > 99999999) {
    throw new Error('Importo XPay non valido.');
  }

  const codTrans = makeTransactionId();
  const divisa = 'EUR';
  const base = siteUrl();
  const payload = {
    exp: Date.now() + (15 * 60 * 1000),
    alias,
    importo,
    divisa,
    codTrans,
    mac: startMac(codTrans, divisa, importo, secret),
    url: `${base}/api/xpay/return`,
    url_back: `${base}/api/xpay/cancel`,
    urlpost: `${base}/api/xpay/notify`,
    mail: clean(email, 150),
    languageId: 'ITA',
    descrizione: clean(description || 'Ordine La Fabbrica delle Api', 500),
    Note1: clean(note1, 200),
    Note2: clean(note2, 200),
    Note3: clean(note3, 200)
  };
  const token = signToken(payload, secret);
  return {
    id: codTrans,
    url: `${base}/api/xpay/redirect?t=${encodeURIComponent(token)}`,
    xpay: true
  };
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function redirectHandler(req, res) {
  try {
    const { secret, endpoint } = config();
    if (!isLiveEnabled()) return res.status(503).send('XPay non è ancora abilitato per i pagamenti reali.');
    if (!secret || !endpoint) return res.status(503).send('Configurazione XPay incompleta.');
    const payload = readToken(req.query && req.query.t, secret);
    const fields = [
      'alias', 'importo', 'divisa', 'codTrans', 'url', 'url_back', 'mac', 'urlpost',
      'mail', 'languageId', 'descrizione', 'Note1', 'Note2', 'Note3'
    ];
    const inputs = fields
      .filter((key) => payload[key] !== undefined && payload[key] !== '')
      .map((key) => `<input type="hidden" name="${escapeHtml(key)}" value="${escapeHtml(payload[key])}">`)
      .join('\n');

    res.setHeader('Cache-Control', 'no-store');
    return res.type('html').send(`<!doctype html>
<html lang="it"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Pagamento Nexi XPay</title></head>
<body><p>Reindirizzamento al pagamento sicuro Nexi…</p>
<form id="xpay-form" method="post" action="${escapeHtml(endpoint)}" accept-charset="ISO-8859-1">
${inputs}
<noscript><button type="submit">Continua al pagamento Nexi</button></noscript>
</form><script>document.getElementById('xpay-form').submit();</script></body></html>`);
  } catch (error) {
    console.error('[XPay] Errore redirect:', error && error.message ? error.message : error);
    return res.status(400).send('Impossibile avviare il pagamento Nexi.');
  }
}

function verifyResult(fields) {
  const { alias, secret } = config();
  if (!alias || !secret) return false;
  if (clean(fields.alias, 30) !== alias) return false;
  const expected = resultMac(fields, secret);
  return timingSafeEqualText(fields.mac, expected);
}

function returnHandler(req, res) {
  const fields = req.query || {};
  const base = siteUrl();
  const valid = verifyResult(fields);
  const codTrans = clean(fields.codTrans, 30);
  const esito = clean(fields.esito, 20).toUpperCase();

  if (!valid) {
    console.error(`[XPay] MAC di ritorno non valido per ${codTrans || 'transazione sconosciuta'}.`);
    return res.redirect(302, `${base}/cancel.html?xpay=mac_invalid`);
  }

  if (esito === 'OK') {
    console.log(`[XPay] Pagamento confermato: ${codTrans}.`);
    return res.redirect(302, `${base}/success.html?xpay=ok&codTrans=${encodeURIComponent(codTrans)}`);
  }

  console.log(`[XPay] Pagamento non completato: ${codTrans}, esito ${esito || 'KO'}.`);
  return res.redirect(302, `${base}/cancel.html?xpay=${encodeURIComponent(esito || 'ko')}`);
}

function notifyHandler(req, res) {
  const fields = req.body || {};
  const codTrans = clean(fields.codTrans, 30);
  if (!verifyResult(fields)) {
    console.error(`[XPay] Notifica con MAC non valido per ${codTrans || 'transazione sconosciuta'}.`);
    return res.status(400).send('MAC non valido');
  }

  console.log(`[XPay] Notifica valida: ${codTrans}, esito ${clean(fields.esito, 20)}, importo ${clean(fields.importo, 20)} ${clean(fields.divisa, 3)}.`);
  return res.status(200).send('OK');
}

function cancelHandler(req, res) {
  const base = siteUrl();
  const esito = clean(req.query && req.query.esito, 20) || 'annullo';
  return res.redirect(302, `${base}/cancel.html?xpay=${encodeURIComponent(esito)}`);
}

function statusHandler(_req, res) {
  return res.status(200).json({
    provider: 'Nexi XPay',
    configured: isConfigured(),
    liveEnabled: isLiveEnabled(),
    mode: isLiveEnabled() ? 'production' : 'prepared'
  });
}

module.exports = {
  isLiveEnabled,
  isConfigured,
  createPaymentRedirectUrl,
  redirectHandler,
  returnHandler,
  notifyHandler,
  cancelHandler,
  statusHandler
};
