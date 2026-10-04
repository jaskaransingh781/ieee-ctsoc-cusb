// Serverless version of the contact endpoint, for hosts such as Vercel that
// run files in /api as functions. It uses the same logic as server/index.js.
// Set GMAIL_USER, GMAIL_APP_PASSWORD and CONTACT_TO in the host's
// environment-variable settings (never in the code).
import { handleContact } from '../server/contact.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ ok: false, error: 'The request could not be read.' });
    }
  }

  const forwarded = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() || 'unknown';

  const { status, payload } = await handleContact(body ?? {}, { ip });
  return res.status(status).json(payload);
}
