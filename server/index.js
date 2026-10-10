// ---------------------------------------------------------------------------
// Small Node server for the site.
//
//   POST /api/contact    -> validates the query and emails it to the chapter
//   GET  /api/health     -> { ok, mailConfigured }
//   GET  /api/rates      -> today's USD to INR rate (for the Membership page)
//   GET  /api/newsletter -> IEEE CTSoc newsletter issues that are online
//   everything else    -> the built site in /dist (after `npm run build`)
//
// Development:  `npm run dev` starts this alongside Vite.
// Production:   `npm run build` then `npm start`.
// ---------------------------------------------------------------------------
import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import { Server as SocketServer } from 'socket.io';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createTransport, handleContact } from './contact.js';
import { getNewsletterIssues, getUsdInr } from './feeds.js';
import { createCyberhunt } from './cyberhunt/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, '../dist');
const port = Number(process.env.PORT) || 8787;
const allowedOrigin = process.env.ALLOWED_ORIGIN || '';

const app = express();
const server = createServer(app);
const io = new SocketServer(server, { cors: { origin: allowedOrigin || true, credentials: true } });
app.disable('x-powered-by');
// Needed to see the visitor's real address behind a hosting proxy.
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));

// Only needed when the site and this server live on different domains.
if (allowedOrigin) {
  app.use('/api', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Vary', 'Origin');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    return next();
  });
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, mailConfigured: Boolean(createTransport()) });
});

app.post('/api/contact', async (req, res) => {
  const { status, payload } = await handleContact(req.body, { ip: req.ip });
  res.status(status).json(payload);
});

// Live data, fetched and remembered by the server (see server/feeds.js).
app.get('/api/rates', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.json(await getUsdInr());
});

app.get('/api/newsletter', async (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.json(await getNewsletterIssues());
});

const cyberhunt = await createCyberhunt(io);
app.use('/api/cyberhunt', cyberhunt.router);

app.use('/api', (req, res) => {
  res.status(404).json({ ok: false, error: 'Not found' });
});

// Malformed JSON and oversized bodies end up here.
app.use((error, req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(400).json({ ok: false, error: 'The request could not be read.' });
  }
  return next(error);
});

if (existsSync(dist)) {
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  // Single-page app: every non-file route gets index.html and the router
  // in the browser decides what to show (including the 404 page).
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    return res.sendFile(path.join(dist, 'index.html'));
  });
}

server.listen(port, () => {
  const mail = createTransport() ? 'configured' : 'NOT configured (set GMAIL_USER and GMAIL_APP_PASSWORD in .env)';
  console.log(`[server] listening on http://localhost:${port}`);
  console.log(`[server] email delivery: ${mail}`);
});
