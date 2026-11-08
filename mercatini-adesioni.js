const EVENTS = new Set(['castel-d-ario']);
const CONSENT_VERSION = '2026-11-08';
const MAX_BODY_BYTES = 8192;

function reply(request, message, status) {
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
  if (request.headers.get('Accept')?.includes('application/json')) {
    return Response.json({ message }, { status, headers });
  }
  headers['Content-Type'] = 'text/html; charset=utf-8';
  return new Response(`<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Adesione mercatini</title><main><h1>Adesione mercatini</h1><p>${message}</p><a href="/mercatini-eventi#adesione">Torna ai Mercatini ed Eventi</a></main></html>`, { status, headers });
}

async function readFields(request) {
  const reader = request.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let length = 0;
  let body = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return new URLSearchParams(body + decoder.decode());
    length += value.byteLength;
    if (length > MAX_BODY_BYTES) {
      await reader.cancel();
      return null;
    }
    body += decoder.decode(value, { stream: true });
  }
}

export async function receiveMarketApplication(request, database) {
  if (request.method !== 'POST') {
    return new Response(null, { status: 405, headers: { Allow: 'POST', 'Cache-Control': 'no-store' } });
  }
  if (request.headers.get('Origin') !== new URL(request.url).origin) {
    return reply(request, 'Origine della richiesta non valida.', 403);
  }
  const contentType = request.headers.get('Content-Type')?.split(';')[0];
  if (contentType !== 'application/x-www-form-urlencoded') {
    return reply(request, 'Formato della richiesta non valido.', 415);
  }

  try {
    const fields = await readFields(request);
    if (!fields) return reply(request, 'Richiesta troppo lunga o vuota.', 400);
    const get = (name) => (fields.get(name) || '').normalize('NFC').trim().replace(/\s+/g, ' ');
    const nome = get('nome');
    const cognome = get('cognome');
    const merce = get('merce');
    const metraturaRaw = get('metratura_banco');
    const metratura = metraturaRaw ? Number(metraturaRaw.replace(',', '.')) : null;
    const email = get('email').toLowerCase();
    const telefono = get('telefono');
    const evento = get('evento');
    if (!nome || nome.length > 80 || !cognome || cognome.length > 80 ||
        !merce || merce.length > 250 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
        telefono.length > 24 || !/^\+?[0-9 ().-]+$/.test(telefono) || !/^\d{6,15}$/.test(telefono.replace(/\D/g, '')) ||
        (fields.has('metratura_banco') && (!/^\d+(?:[.,]\d{1,2})?$/.test(metraturaRaw) || !Number.isFinite(metratura) || metratura <= 0)) ||
        !EVENTS.has(evento) || get('consenso') !== 'si') {
      return reply(request, 'Controlla i dati inseriti e il consenso, poi riprova.', 400);
    }
    await database.prepare(
      'INSERT INTO adesioni_mercatini (evento,nome,cognome,merce,telefono,email,versione_consenso,metratura_banco_mq) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(evento,email,nome,cognome) DO NOTHING'
    ).bind(evento, nome, cognome, merce, telefono, email, CONSENT_VERSION, metratura).run();
    return reply(request, 'Richiesta ricevuta. Il gestore ti contatterà per l’eventuale conferma.', 200);
  } catch {
    return reply(request, 'Al momento non è possibile registrare la richiesta. Riprova più tardi.', 503);
  }
}
