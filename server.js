const fs = require('fs');
const path = require('path');
const express = require('express');
const createCheckoutSession = require('./api/create-checkout-session');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IMAGE_VERSION = '20260814-2';

app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
app.post('/api/create-checkout-session', createCheckoutSession);

// During active development, force browsers to revalidate image files instead
// of keeping stale product photos from previous deployments.
app.use('/images', express.static(path.join(__dirname, 'images'), {
  etag: true,
  lastModified: true,
  maxAge: 0,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

const cacheBustScript = `
<script>
(() => {
  const version = ${JSON.stringify(IMAGE_VERSION)};
  const addVersion = (img) => {
    if (!img || !img.getAttribute) return;
    const raw = img.getAttribute('src');
    if (!raw) return;
    if (!/^(?:\\/?images\\/)/i.test(raw)) return;
    try {
      const url = new URL(raw, window.location.href);
      if (url.searchParams.get('v') !== version) {
        url.searchParams.set('v', version);
        img.src = url.pathname + url.search + url.hash;
      }
    } catch (_) {}
  };

  const scan = (root) => {
    if (!root) return;
    if (root.tagName === 'IMG') addVersion(root);
    if (root.querySelectorAll) root.querySelectorAll('img[src]').forEach(addVersion);
  };

  const start = () => {
    scan(document);
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(scan);
        if (mutation.type === 'attributes' && mutation.target.tagName === 'IMG') {
          addVersion(mutation.target);
        }
      }
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['src']
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
</script>`;

const shopBridgeScript = `
<style>
  #center-home-link {
    position: fixed;
    left: 16px;
    bottom: 18px;
    z-index: 99999;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 16px;
    border-radius: 999px;
    border: 1px solid rgba(212,175,55,.85);
    background: rgba(7,55,43,.96);
    color: #fff;
    text-decoration: none;
    font: 700 14px/1.1 system-ui, sans-serif;
    box-shadow: 0 8px 24px rgba(0,0,0,.35);
    backdrop-filter: blur(8px);
  }
  #center-home-link:hover { background: #0b4a39; }
  @media (max-width: 640px) {
    #center-home-link { left: 10px; bottom: 12px; padding: 10px 13px; font-size: 13px; }
  }
</style>
<script>
(() => {
  const addHomeLink = () => {
    if (document.getElementById('center-home-link')) return;
    const link = document.createElement('a');
    link.id = 'center-home-link';
    link.href = '/';
    link.setAttribute('aria-label', 'Torna alla Home del Centro');
    link.textContent = '← Home Centro';
    document.body.appendChild(link);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addHomeLink, { once: true });
  } else {
    addHomeLink();
  }
})();
</script>`;

// Existing ecommerce: keep index.html logic untouched and serve it only as the Shop.
const sendShop = (_req, res) => {
  try {
    const indexPath = path.join(__dirname, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');

    // Rebrand only the visible ecommerce identity for the new Center.
    html = html.replaceAll("L'Italiano", 'La Bottega del Centro');
    html = html.replaceAll('I Mieli Artigianali', "Mieli e prodotti dell'alveare");

    // Keep the shop name static and preserve the rotating 3D effect on the Italian flag only.
    html = html.replace(
      'className="text-6xl sm:text-7xl lg:text-8xl font-black text-amber-900 flex flex-col items-end gap-2 text-3d-effect"',
      'className="text-6xl sm:text-7xl lg:text-8xl font-black text-amber-900 flex flex-col items-end gap-2"'
    );
    html = html.replace(
      '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="40" viewBox="0 0 30 20">',
      '<svg className="text-3d-effect" xmlns="http://www.w3.org/2000/svg" width="60" height="40" viewBox="0 0 30 20">'
    );

    const injected = `${cacheBustScript}\n${shopBridgeScript}`;
    html = html.includes('</head>')
      ? html.replace('</head>', `${injected}\n</head>`)
      : `${injected}\n${html}`;

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.type('html').send(html);
  } catch (error) {
    console.error('[Miele Artigianale] Errore caricamento shop:', error);
    return res.status(500).send('Errore caricamento pagina.');
  }
};

const sendPage = (filename) => (_req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.sendFile(path.join(__dirname, filename));
};

// New institutional site.
app.get('/', sendPage('home.html'));
app.get('/home', sendPage('home.html'));
app.get('/centro', sendPage('centro.html'));
app.get('/alveoterapia', sendPage('alveoterapia.html'));
app.get('/bacheca', sendPage('bacheca.html'));
app.get('/chi-siamo', sendPage('chi-siamo.html'));
app.get('/contatti', sendPage('contatti.html'));

// Existing ecommerce preserved as-is.
app.get('/shop', sendShop);
app.get('/shop.html', sendShop);
app.get('/index.html', sendShop);

// Serve CSS, success/cancel pages and remaining repository files normally.
app.use(express.static(__dirname));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Miele Artigianale] Server avviato sulla porta ${PORT}.`);
});
