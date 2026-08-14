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

const sendIndex = (_req, res) => {
  try {
    const indexPath = path.join(__dirname, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');
    html = html.includes('</head>')
      ? html.replace('</head>', `${cacheBustScript}\n</head>`)
      : `${cacheBustScript}\n${html}`;
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.type('html').send(html);
  } catch (error) {
    console.error('[Miele Artigianale] Errore caricamento index:', error);
    return res.status(500).send('Errore caricamento pagina.');
  }
};

// Serve the versioned HTML before generic static middleware, so old browsers
// receive fresh image URLs even if they cached a previous /images/* redirect.
app.get('/', sendIndex);
app.get('/index.html', sendIndex);

// Serve the remaining repository files normally.
app.use(express.static(__dirname));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Miele Artigianale] Server avviato sulla porta ${PORT}.`);
});
