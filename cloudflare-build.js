const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const root = __dirname;
const dist = path.join(root, 'dist');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function copyFileIfPresent(file) {
  const src = path.join(root, file);
  if (!fs.existsSync(src)) return;
  const dest = path.join(dist, file);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyBrowserAssets() {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (['.html', '.css', '.svg', '.ico', '.txt', '.webmanifest'].includes(ext)) {
      copyFileIfPresent(entry.name);
    }
  }

  const browserScripts = [
    'global-tools-v2.js',
    'shop-purchase-i18n.js',
    'render-language-de-test.js',
    'saldo-api.js',
    'cesto-admin.js'
  ];
  for (const file of browserScripts) {
    if (!fs.existsSync(path.join(root, file))) {
      throw new Error('[Cloudflare V2] Browser asset mancante: ' + file);
    }
    copyFileIfPresent(file);
  }

  copyDir(path.join(root, 'images'), path.join(dist, 'images'));
  copyDir(path.join(root, 'downloads'), path.join(dist, 'downloads'));
}

async function fetchReady(origin, pathname) {
  let lastError;
  for (let i = 0; i < 60; i++) {
    try {
      const response = await fetch(origin + pathname, { redirect: 'manual' });
      if (response.ok) return response;
      lastError = new Error(pathname + ' HTTP ' + response.status);
    } catch (error) {
      lastError = error;
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw lastError || new Error('Server locale non disponibile');
}

function writeRoute(route, html) {
  const clean = route.replace(/^\/+|\/+$/g, '');
  if (!clean) {
    fs.writeFileSync(path.join(dist, 'index.html'), html, 'utf8');
    return;
  }
  const dir = path.join(dist, clean);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html, 'utf8');
}

async function main() {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });

  copyBrowserAssets();

  const port = 39731;
  const origin = 'http://127.0.0.1:' + port;
  const server = spawn(process.execPath, ['shipping-policy-start.js'], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: 'inherit'
  });

  try {
    await fetchReady(origin, '/');

    const routes = [
      ['/', 'index.html'],
      ['/home', 'home.html'],
      ['/centro', 'centro.html'],
      ['/alveoterapia', 'alveoterapia.html'],
      ['/bacheca', 'bacheca.html'],
      ['/chi-siamo', 'chi-siamo.html'],
      ['/contatti', 'contatti.html'],
      ['/alveo-digitale', 'alveo-digitale.html'],
      ['/shop', 'shop-v2.html'],
      ['/success.html', 'success.html'],
      ['/cancel.html', 'cancel.html'],
      ['/saldo-api.html', 'saldo-api.html']
    ];

    for (const [pathname, flatFile] of routes) {
      const response = await fetchReady(origin, pathname);
      const html = await response.text();
      if (!/<html/i.test(html)) throw new Error('[Cloudflare V2] HTML non valido da ' + pathname);

      if (pathname === '/' || pathname === '/home') {
        if (!html.includes('globalToolsBar') || !html.includes('global-tools-v2.js')) {
          throw new Error('[Cloudflare V2] Home senza strumenti globali/Ape Pelù.');
        }
      }
      if (pathname === '/shop') {
        if (!html.includes('Ape Pelù') || !html.includes('shop-purchase-i18n.js')) {
          throw new Error('[Cloudflare V2] Shop V2 non riconosciuto o Ape Pelù assente.');
        }
        if (!html.includes('Alveo Digitale')) {
          throw new Error('[Cloudflare V2] Shop V2 senza collegamento Alveo Digitale.');
        }
        if (!html.includes('Punti Ape') || !html.includes('Saldo Api')) {
          throw new Error('[Cloudflare V2] Shop V2 senza Punti Ape/Saldo Api.');
        }
      }

      fs.writeFileSync(path.join(dist, flatFile), html, 'utf8');
      if (!pathname.endsWith('.html')) writeRoute(pathname, html);
    }

    // Alias storici devono puntare allo shop V2, mai allo shop legacy.
    const shopHtml = fs.readFileSync(path.join(dist, 'shop-v2.html'), 'utf8');
    fs.writeFileSync(path.join(dist, 'shop.html'), shopHtml, 'utf8');
    const shopDir = path.join(dist, 'shop');
    fs.mkdirSync(shopDir, { recursive: true });
    fs.writeFileSync(path.join(shopDir, 'index.html'), shopHtml, 'utf8');

    console.log('[Cloudflare V2] Build PASS: home V2, shop V2, Ape Pelù, collegamento Alveo Digitale, Punti Ape e Saldo Api presenti.');
  } finally {
    if (server.exitCode === null) server.kill('SIGTERM');
  }
}

main().catch(error => {
  console.error('[Cloudflare V2] Build fallito:', error);
  process.exit(1);
});
