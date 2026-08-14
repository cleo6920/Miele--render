const fs = require('fs');
const path = require('path');
const express = require('express');
const createCheckoutSession = require('./api/create-checkout-session');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IMAGE_VERSION = '20260814-3';

// Rebuild the approved Center homepage image from a text-safe base64 asset.
// This avoids binary corruption when updating the repository through the connector.
try {
  const encodedImagePath = path.join(__dirname, 'images', 'centro-porticato-home-fixed.txt');
  const targetImagePath = path.join(__dirname, 'images', 'centro-porticato-home.jpg');
  if (fs.existsSync(encodedImagePath)) {
    const encoded = fs.readFileSync(encodedImagePath, 'utf8').trim();
    const imageBuffer = Buffer.from(encoded, 'base64');
    if (imageBuffer.length > 1000) {
      fs.writeFileSync(targetImagePath, imageBuffer);
      console.log('[Miele Artigianale] Immagine Centro ricostruita correttamente.');
    }
  }
} catch (error) {
  console.error('[Miele Artigianale] Errore ricostruzione immagine Centro:', error);
}

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
  html, body { max-width: 100%; overflow-x: hidden !important; }

  #center-home-bar {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 9px 18px;
    background: #07372b;
    border-bottom: 1px solid rgba(212,175,55,.55);
    position: relative;
    z-index: 40;
  }
  #center-home-link {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 15px;
    border-radius: 999px;
    border: 1px solid rgba(212,175,55,.9);
    background: rgba(255,255,255,.04);
    color: #fff;
    text-decoration: none;
    font: 700 14px/1.1 system-ui, sans-serif;
    box-shadow: 0 5px 16px rgba(0,0,0,.2);
  }
  #center-home-link:hover { background: rgba(212,175,55,.16); }

  .shop-brand-title {
    max-width: min(920px, 100%) !important;
    width: 100% !important;
    white-space: normal !important;
    overflow-wrap: normal !important;
    word-break: normal !important;
    font-size: clamp(2.4rem, 5.4vw, 5.4rem) !important;
    line-height: .98 !important;
    text-align: right !important;
  }
  .shop-brand-wrap {
    min-width: 0 !important;
    max-width: 100% !important;
    overflow: visible !important;
  }
  .shop-subtitle-spin {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: flex-end !important;
    gap: 14px !important;
    max-width: 100% !important;
    transform-style: preserve-3d;
    perspective: 1000px;
    animation: rotate3DLinear 20s infinite linear;
    transform-origin: center center;
  }
  .shop-subtitle-spin svg {
    flex: 0 0 auto;
    width: 60px;
    height: 40px;
  }

  @media (max-width: 760px) {
    #center-home-bar { padding: 8px 10px; }
    #center-home-link { padding: 8px 12px; font-size: 13px; }
    .shop-brand-title {
      font-size: clamp(2rem, 10vw, 3.15rem) !important;
      text-align: center !important;
    }
    .shop-subtitle-spin {
      justify-content: center !important;
      font-size: clamp(1rem, 4.6vw, 1.45rem) !important;
      text-align: center !important;
    }
  }
</style>
<script>
(() => {
  const enhanceShop = () => {
    if (!document.getElementById('center-home-bar')) {
      const bar = document.createElement('div');
      bar.id = 'center-home-bar';
      const link = document.createElement('a');
      link.id = 'center-home-link';
      link.href = '/';
      link.setAttribute('aria-label', 'Torna alla Home del Centro');
      link.textContent = '← Home Centro';
      bar.appendChild(link);
      const first = document.body.firstElementChild;
      if (first) document.body.insertBefore(bar, first);
      else document.body.appendChild(bar);
    }

    const headings = Array.from(document.querySelectorAll('h1,h2,h3'));
    const title = headings.find((el) => (el.textContent || '').includes('La Bottega del Centro'));
    if (title) {
      title.classList.add('shop-brand-title');
      if (title.parentElement) title.parentElement.classList.add('shop-brand-wrap');

      const wrap = title.parentElement;
      if (wrap) {
        const subtitle = Array.from(wrap.querySelectorAll('p')).find((el) =>
          (el.textContent || '').includes("Mieli e prodotti dell'alveare")
        );
        const flag = title.querySelector('svg');
        if (subtitle && flag && !subtitle.classList.contains('shop-subtitle-spin')) {
          flag.classList.remove('text-3d-effect');
          subtitle.classList.add('shop-subtitle-spin');
          subtitle.insertBefore(flag, subtitle.firstChild);
        }
      }
    }
  };

  const start = () => {
    enhanceShop();
    const observer = new MutationObserver(() => enhanceShop());
    observer.observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
</script>`;

const sendShop = (_req, res) => {
  try {
    const indexPath = path.join(__dirname, 'index.html');
    let html = fs.readFileSync(indexPath, 'utf8');

    html = html.replaceAll("L'Italiano", 'La Bottega del Centro');
    html = html.replaceAll('I Mieli Artigianali', "Mieli e prodotti dell'alveare");

    html = html.replace(
      'className="text-6xl sm:text-7xl lg:text-8xl font-black text-amber-900 flex flex-col items-end gap-2 text-3d-effect"',
      'className="text-6xl sm:text-7xl lg:text-8xl font-black text-amber-900 flex flex-col items-end gap-2"'
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

app.get('/', sendPage('home.html'));
app.get('/home', sendPage('home.html'));
app.get('/centro', sendPage('centro.html'));
app.get('/alveoterapia', sendPage('alveoterapia.html'));
app.get('/bacheca', sendPage('bacheca.html'));
app.get('/chi-siamo', sendPage('chi-siamo.html'));
app.get('/contatti', sendPage('contatti.html'));

app.get('/shop', sendShop);
app.get('/shop.html', sendShop);
app.get('/index.html', sendShop);

app.use(express.static(__dirname));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Miele Artigianale] Server avviato sulla porta ${PORT}.`);
});
