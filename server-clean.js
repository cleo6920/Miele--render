const fs = require('fs');
const path = require('path');
const express = require('express');
const createCheckoutSession = require('./api/create-checkout-session');

const ROOT = __dirname;

// Materializza soltanto gli asset finali già approvati che nel vecchio shop
// venivano preparati all'avvio. Nessuna riscrittura DOM o CSS.
try {
  const acaciaBase64Path = path.join(ROOT, 'images', 'acacia-tiny-valid.b64');
  const acaciaTargetPath = path.join(ROOT, 'images', 'acacia-shop.jpg');
  const base64 = fs.readFileSync(acaciaBase64Path, 'utf8').replace(/\s+/g, '');
  const jpegBuffer = Buffer.from(base64, 'base64');
  const validJpeg = jpegBuffer.length > 1000 &&
    jpegBuffer[0] === 0xff && jpegBuffer[1] === 0xd8 &&
    jpegBuffer[jpegBuffer.length - 2] === 0xff && jpegBuffer[jpegBuffer.length - 1] === 0xd9;
  if (!validJpeg) throw new Error('Acacia JPEG validation failed');
  fs.writeFileSync(acaciaTargetPath, jpegBuffer);
} catch (error) {
  console.error('[Miele Clean] Errore preparazione immagine Acacia:', error);
}

try {
  const balsamFinalPath = path.join(ROOT, 'images', 'balsam-miel-final.jpg');
  const balsamTargetPath = path.join(ROOT, 'images', 'balsam-miel.jpg');
  if (fs.existsSync(balsamFinalPath)) {
    fs.copyFileSync(balsamFinalPath, balsamTargetPath);
  }
} catch (error) {
  console.error('[Miele Clean] Errore preparazione immagine Balsam Miel:', error);
}

// Prepara una copia statica ripulita dell'HTML una sola volta all'avvio.
require('./prepare-clean-index.js');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));

app.post('/api/create-checkout-session', createCheckoutSession);

app.use('/images', express.static(path.join(ROOT, 'images'), {
  etag: true,
  lastModified: true,
  maxAge: '1h'
}));

const send = (file) => (_req, res) => res.sendFile(path.join(ROOT, file));

// Stessa struttura di navigazione del sito integrato attuale.
app.get('/', send('home.html'));
app.get('/home', send('home.html'));
app.get('/centro', send('centro.html'));
app.get('/alveoterapia', send('alveoterapia.html'));
app.get('/bacheca', send('bacheca.html'));
app.get('/chi-siamo', send('chi-siamo.html'));
app.get('/contatti', send('contatti.html'));

// Lo shop resta integrato nello stesso sito e mantiene tutti gli alias attuali.
app.get('/shop', send('index-clean.html'));
app.get('/shop.html', send('index-clean.html'));
app.get('/index.html', send('index-clean.html'));

app.get('/success', send('success.html'));
app.get('/cancel', send('cancel.html'));

// Asset e pagine statiche serviti senza riscritture runtime.
app.use(express.static(ROOT, {
  extensions: ['html'],
  index: false,
  etag: true,
  lastModified: true
}));

app.use((_req, res) => res.status(404).type('text/plain').send('Pagina non trovata'));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Miele Clean] Server integrato avviato sulla porta ${PORT}. Centro + shop nello stesso progetto, nessuna riscrittura DOM runtime continua.`);
});
