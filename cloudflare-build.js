const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

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

function copyStaticRootFiles() {
  const allowedExt = new Set(['.html', '.css', '.svg', '.ico', '.txt', '.webmanifest']);
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!allowedExt.has(ext)) continue;
    fs.copyFileSync(path.join(root, entry.name), path.join(dist, entry.name));
  }
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const prestart = spawnSync(process.execPath, ['shipping-policy-start.js'], {
  cwd: root,
  env: { ...process.env, CLOUDFLARE_BUILD: '1' },
  stdio: 'inherit'
});

if (prestart.status !== 0) {
  console.error('[Cloudflare test] Build interrotto: prestart non completati.');
  process.exit(prestart.status || 1);
}

copyStaticRootFiles();
copyDir(path.join(root, 'images'), path.join(dist, 'images'));

// In Render / mostra home.html e /shop mostra index.html tramite Express.
// Cloudflare Static Assets non possiede quelle route virtuali, quindi creiamo
// directory index equivalenti senza modificare gli HTML originali.
const routeMap = {
  home: 'home.html',
  centro: 'centro.html',
  alveoterapia: 'alveoterapia.html',
  bacheca: 'bacheca.html',
  'chi-siamo': 'chi-siamo.html',
  contatti: 'contatti.html',
  shop: 'index.html'
};
for (const [route, file] of Object.entries(routeMap)) {
  const source = path.join(dist, file);
  if (!fs.existsSync(source)) continue;
  const routeDir = path.join(dist, route);
  fs.mkdirSync(routeDir, { recursive: true });
  fs.copyFileSync(source, path.join(routeDir, 'index.html'));
}

// La root pubblica deve comportarsi come Render: homepage del Centro.
if (fs.existsSync(path.join(dist, 'home.html'))) {
  fs.copyFileSync(path.join(dist, 'home.html'), path.join(dist, 'index.html'));
}

console.log('[Cloudflare test] Static assets pronti in dist/.');
