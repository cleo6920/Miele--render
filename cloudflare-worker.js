const VERCEL_V2_ORIGIN = 'https://miele-backend-omega.vercel.app';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/__cloudflare-test') {
      return Response.json({
        ok: true,
        mode: 'cloudflare-v2-safe',
        staticAssets: true,
        frontendSource: 'latest-v2-synced',
        apiMode: 'temporary-vercel-v2-proxy'
      }, {
        headers: { 'Cache-Control': 'no-store' }
      });
    }

    if (url.pathname.startsWith('/api/')) {
      const target = new URL(url.pathname + url.search, VERCEL_V2_ORIGIN);
      return fetch(new Request(target, request));
    }

    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status !== 404) return assetResponse;

    if (url.pathname.startsWith('/images/') || url.pathname.startsWith('/downloads/')) {
      const target = new URL(url.pathname + url.search, VERCEL_V2_ORIGIN);
      return fetch(new Request(target, request));
    }

    return assetResponse;
  }
};
