const crypto = require('crypto');
const { callBeeDataApi } = require('../bee-wallet-client');

function clean(value, max = 200) {
  return String(value || '').trim().slice(0, max);
}

function secureEqual(a, b) {
  const left = Buffer.from(String(a || ''));
  const right = Buffer.from(String(b || ''));
  return left.length === right.length && left.length > 0 && crypto.timingSafeEqual(left, right);
}

module.exports = async (req, res) => {
  res.setHeader('Allow', 'POST');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metodo non consentito.' });

  const configured = String(process.env.CESTO_ADMIN_KEY || '');
  const provided = String(req.headers['x-cesto-admin-key'] || '');
  if (!configured) return res.status(503).json({ error: 'Accesso amministrativo non configurato.' });
  if (!secureEqual(provided, configured)) return res.status(401).json({ error: 'Codice amministratore non valido.' });

  try {
    const body = req.body || {};
    const action = clean(body.action, 40).toLowerCase();
    let data;
    if (action === 'list') {
      data = await callBeeDataApi('admin_list_cesto_orders', { status: clean(body.status || 'TUTTI', 40) });
    } else if (action === 'update_status') {
      data = await callBeeDataApi('admin_update_cesto_status', {
        orderNumber: clean(body.orderNumber, 80),
        status: clean(body.status, 40).toUpperCase()
      });
    } else {
      return res.status(400).json({ error: 'Azione amministrativa non valida.' });
    }
    const status = Number(data && data.status) || (data && data.ok === false ? 400 : 200);
    return res.status(status).json(data);
  } catch (error) {
    console.error('[Ordini Cesto] Errore:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Impossibile gestire gli ordini Cesto.' });
  }
};
