const fs = require('fs');
const path = require('path');
const express = require('express');
const createCheckoutSession = require('./api/create-checkout-session');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IMAGE_VERSION = '20260827-1';

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

  .shop-brand-wrap {
    min-width: 0 !important;
    width: min(760px, calc(100vw - 360px)) !important;
    max-width: min(760px, calc(100vw - 360px)) !important;
    margin-left: auto !important;
    margin-right: 24px !important;
    overflow: hidden !important;
    position: relative !important;
    padding: 22px 28px 26px !important;
    border-radius: 28px !important;
    background:
      radial-gradient(circle at 78% 10%, rgba(255,193,7,.16), transparent 28%),
      linear-gradient(135deg, rgba(7,55,43,.72), rgba(5,18,14,.25)) !important;
    border: 1px solid rgba(212,175,55,.45) !important;
    box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 16px 45px rgba(0,0,0,.28) !important;
  }

  .shop-brand-wrap::before {
    content: '✦';
    position: absolute;
    top: 12px;
    right: 18px;
    color: #f5c85b;
    font-size: 18px;
    text-shadow: 0 0 14px rgba(245,200,91,.8);
  }

  .shop-brand-title {
    display: block !important;
    box-sizing: border-box !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 0 auto !important;
    white-space: normal !important;
    overflow-wrap: normal !important;
    word-break: normal !important;
    font-family: Georgia, 'Times New Roman', serif !important;
    font-size: clamp(2.35rem, 4.6vw, 4.9rem) !important;
    line-height: .94 !important;
    letter-spacing: -.025em !important;
    text-align: center !important;
    text-transform: uppercase !important;
    color: #f6cf69 !important;
    background: linear-gradient(180deg,#fff0a8 0%,#f3c651 42%,#c88716 100%) !important;
    -webkit-background-clip: text !important;
    background-clip: text !important;
    -webkit-text-fill-color: transparent !important;
    filter: drop-shadow(0 3px 0 rgba(94,56,0,.8)) drop-shadow(0 8px 18px rgba(0,0,0,.48)) !important;
  }

  .shop-subtitle-spin {
    display: flex !important;
    width: fit-content !important;
    margin: 0 auto !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 14px !important;
    max-width: 100% !important;
    padding-top: 10px !important;
    font-weight: 700 !important;
    color: #fff6d8 !important;
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

  @media (max-width: 900px) {
    .shop-brand-wrap {
      width: calc(100vw - 32px) !important;
      max-width: calc(100vw - 32px) !important;
      margin: 12px auto !important;
      padding: 20px 18px 22px !important;
    }
    .shop-brand-title {
      font-size: clamp(2rem, 8vw, 3.8rem) !important;
      line-height: .96 !important;
    }
  }

  @media (max-width: 760px) {
    #center-home-bar { padding: 8px 10px; }
    #center-home-link { padding: 8px 12px; font-size: 13px; }
    .shop-brand-wrap { padding: 18px 14px 20px !important; border-radius: 20px !important; }
    .shop-brand-title {
      font-size: clamp(1.9rem, 10vw, 3.25rem) !important;
      text-align: center !important;
      line-height: .98 !important;
    }
    .shop-subtitle-spin {
      justify-content: center !important;
      font-size: clamp(.95rem, 4.4vw, 1.35rem) !important;
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
    const title = headings.find((el) => (el.textContent || '').includes('La Fabbrica delle Api'));
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

    html = html.replaceAll("L'Italiano", 'La Fabbrica delle Api');
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
