const fs = require('fs');
const path = require('path');

try {
  const serverPath = path.join(__dirname, 'server.js');
  const checkoutPath = path.join(__dirname, 'api', 'create-checkout-session.js');

  let server = fs.readFileSync(serverPath, 'utf8');
  let checkout = fs.readFileSync(checkoutPath, 'utf8');

  const serverImportAnchor = "const createCheckoutSession = require('./api/create-checkout-session');";
  const jsonAnchor = "app.use(express.json({ limit: '1mb' }));";
  const checkoutRouteAnchor = "app.post('/api/create-checkout-session', createCheckoutSession);";

  if (!server.includes("require('./xpay-gateway')")) {
    if (!server.includes(serverImportAnchor)) throw new Error('Anchor import checkout non trovato in server.js');
    server = server.replace(serverImportAnchor, `${serverImportAnchor}\nconst xpayGateway = require('./xpay-gateway');`);
  }

  if (!server.includes("express.urlencoded({ limit: '1mb', extended: false })")) {
    if (!server.includes(jsonAnchor)) throw new Error('Anchor middleware JSON non trovato in server.js');
    server = server.replace(jsonAnchor, `${jsonAnchor}\napp.use(express.urlencoded({ limit: '1mb', extended: false }));`);
  }

  if (!server.includes("app.get('/api/xpay/status'")) {
    if (!server.includes(checkoutRouteAnchor)) throw new Error('Anchor route checkout non trovato in server.js');
    server = server.replace(checkoutRouteAnchor, `${checkoutRouteAnchor}
app.get('/api/xpay/status', xpayGateway.statusHandler);
app.get('/api/xpay/redirect', xpayGateway.redirectHandler);
app.get('/api/xpay/return', xpayGateway.returnHandler);
app.post('/api/xpay/notify', xpayGateway.notifyHandler);
app.get('/api/xpay/cancel', xpayGateway.cancelHandler);`);
  }

  const checkoutImportAnchor = "const DEFAULT_SITE_URL = 'https://miele-backend-omega.vercel.app';";
  if (!checkout.includes("require('../xpay-gateway')")) {
    if (!checkout.includes(checkoutImportAnchor)) throw new Error('Anchor DEFAULT_SITE_URL non trovato nel checkout');
    checkout = checkout.replace(checkoutImportAnchor, `const xpayGateway = require('../xpay-gateway');\n\n${checkoutImportAnchor}`);
  }

  const stripeAnchor = "    if (!process.env.STRIPE_SECRET_KEY) {";
  if (!checkout.includes('xpayGateway.createPaymentRedirectUrl')) {
    if (!checkout.includes(stripeAnchor)) throw new Error('Anchor Stripe non trovato nel checkout');
    const xpayBlock = `    if (xpayGateway.isLiveEnabled()) {
      const goodsCents = sanitizedItems.reduce(
        (sum, item) => sum + (Math.round(item.amount * 100) * item.quantity),
        0
      );
      const totalCents = goodsCents + shippingCents;
      const itemSummary = sanitizedItems
        .map((item) => item.quantity + 'x ' + item.name)
        .join(' | ')
        .slice(0, 200);
      const payment = xpayGateway.createPaymentRedirectUrl({
        amountCents: totalCents,
        email,
        description: 'Ordine La Fabbrica delle Api',
        note1: orderReference,
        note2: itemSummary,
        note3: cleanText(body.notes, 200)
      });
      console.log('[XPay] Avvio pagamento ' + payment.id + ' per ' + (totalCents / 100).toFixed(2) + ' EUR.');
      return res.status(200).json(payment);
    }

`;
    checkout = checkout.replace(stripeAnchor, xpayBlock + stripeAnchor);
  }

  fs.writeFileSync(serverPath, server, 'utf8');
  fs.writeFileSync(checkoutPath, checkout, 'utf8');
  console.log('[Miele Artigianale] Nexi XPay predisposto: route, callback MAC e checkout protetto pronti.');
} catch (error) {
  console.error('[Miele Artigianale] Errore predisposizione Nexi XPay:', error);
  process.exitCode = 1;
}
