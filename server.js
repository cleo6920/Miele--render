const path = require('path');
const express = require('express');
const createCheckoutSession = require('./api/create-checkout-session');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.post('/api/create-checkout-session', createCheckoutSession);

// Serve the repository files directly, including /images/*.
app.use(express.static(__dirname));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Miele Artigianale] Server avviato sulla porta ${PORT}.`);
});
