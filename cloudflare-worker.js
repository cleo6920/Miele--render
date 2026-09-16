const RENDER_ORIGIN = 'https://miele-render.onrender.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/__cloudflare-test') {
      return Response.json({
        ok: true,
        mode: 'cloudflare-test',
        staticAssets: true,
        apiMode: 'temporary-render-proxy'
      }, {
        headers: { 'Cache-Control': 'no-store' }
      });
    }

    // FASE 1 DELLA MIGRAZIONE:
    // tutte le pagine e immagini arrivano da Cloudflare;
    // le API restano temporaneamente su Render finché Saldo Api e Nexi
    // non sono stati portati e testati nativamente su Workers.
    if (url.pathname.startsWith('/api/')) {
      const target = new URL(url.pathname + url.search, RENDER_ORIGIN);
      const proxyRequest = new Request(target, request);
      return fetch(proxyRequest);
    }

    return env.ASSETS.fetch(request);
  }
};
