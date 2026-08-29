const path = require('path');
const express = require('express');
const createCheckoutSession = require('./api/create-checkout-session');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

// Unica logica backend necessaria all'e-commerce.
app.post('/api/create-checkout-session', createCheckoutSession);

// Asset serviti direttamente: nessuna riscrittura HTML, CSS o DOM a runtime.
app.use('/images', express.static(path.join(ROOT, 'images'), {
  etag: true,
  lastModified: true,
  maxAge: '1h'
}));

app.use(express.static(ROOT, {
  extensions: ['html'],
  index: false,
  etag: true,
  lastModified: true
}));

const send = (file) => (_req, res) => res.sendFile(path.join(ROOT, file));

app.get('/', send('centro.html'));
app.get('/shop', send('index.html'));
app.get('/centro', send('centro.html'));
app.get('/alveoterapia', send('alveoterapia.html'));
app.get('/chi-siamo', send('chi-siamo.html'));
app.get('/contatti', send('contatti.html'));
app.get('/bacheca', send('bacheca.html'));
app.get('/success', send('success.html'));
app.get('/cancel', send('cancel.html'));

app.use((_req, res) => res.status(404).sendFile(path.join(ROOT, '404.html')));

app.listen(PORT, () => {
  console.log(`[Miele Clean] Server avviato sulla porta ${PORT}. Nessuna riscrittura runtime attiva.`);
});
