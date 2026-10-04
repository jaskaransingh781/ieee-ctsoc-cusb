// Serverless version of GET /api/rates, for hosts such as Vercel.
// Same logic as server/index.js (see server/feeds.js).
import { getUsdInr } from '../server/feeds.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=21600');
  return res.status(200).json(await getUsdInr());
}
