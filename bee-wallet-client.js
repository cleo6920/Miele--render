const BEE_DATA_API_URL = String(
  process.env.BEE_DATA_API_URL ||
  'https://ep-quiet-night-b241wmyg.apirest.c-6.eu-central-1.aws.neon.tech/neondb/rest/v1'
).replace(/\/+$/, '');

function unwrapPayload(data) {
  if (Array.isArray(data) && data.length === 1) {
    if (data[0] && data[0].bee_wallet_api) return data[0].bee_wallet_api;
    return data[0];
  }
  if (data && data.bee_wallet_api) return data.bee_wallet_api;
  return data;
}

async function callBeeDataApi(action, payload = {}) {
  const response = await fetch(`${BEE_DATA_API_URL}/rpc/bee_wallet_api`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ p_action: action, p_payload: payload })
  });

  let data = null;
  try {
    data = unwrapPayload(await response.json());
  } catch (_) {
    data = null;
  }

  if (!response.ok) {
    const message = data && (data.message || data.error)
      ? (data.message || data.error)
      : `Errore archivio Saldo Api (${response.status}).`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data || { ok: false, status: 502, error: 'Risposta vuota dall’archivio Saldo Api.' };
}

module.exports = { callBeeDataApi, BEE_DATA_API_URL };
