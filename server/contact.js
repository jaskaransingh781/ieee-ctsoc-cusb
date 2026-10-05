// ---------------------------------------------------------------------------
// Contact form and chapter registration: validation and email delivery.
//
// This module runs on the server only. The Gmail credentials are read from
// environment variables (see .env.example) and never reach the browser.
// It is shared by the Node server (server/index.js) and the serverless
// function (api/contact.js) so both behave identically.
// ---------------------------------------------------------------------------
import nodemailer from 'nodemailer';
import { site } from '../src/data/site.js';

const LIMITS = { name: 80, email: 120, phone: 20, subject: 120, message: 3000, sourcePage: 300 };

const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_MAX = 5; // messages per address per window
const recent = new Map();

function clean(value, max, { singleLine = true } = {}) {
  if (typeof value !== 'string') return '';
  let text = value.replace(/\u0000/g, '');
  // Line breaks are stripped from single-line fields so they can never be
  // used to inject extra email headers.
  text = singleLine ? text.replace(/[\r\n\t]+/g, ' ') : text.replace(/\r\n?/g, '\n');
  return text.trim().slice(0, max);
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function validateContact(body = {}) {
  const data = {
    name: clean(body.name, LIMITS.name),
    email: clean(body.email, LIMITS.email).toLowerCase(),
    phone: clean(body.phone, LIMITS.phone),
    subject: clean(body.subject, LIMITS.subject),
    message: clean(body.message, LIMITS.message, { singleLine: false }),
    sourcePage: clean(body.sourcePage, LIMITS.sourcePage),
    kind: 'query',
  };

  const fields = {};
  if (!data.name) fields.name = 'Enter your name.';
  if (!data.email) fields.email = 'Enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email))
    fields.email = 'That email address does not look right. Check it and try again.';
  if (data.phone && !/^[+()\d\s-]{7,20}$/.test(data.phone))
    fields.phone = 'Use digits only, with an optional country code.';
  if (!data.subject) fields.subject = 'Add a short subject.';
  if (data.message.length < 10) fields.message = 'Write a message of at least 10 characters.';

  return { data, fields, valid: Object.keys(fields).length === 0 };
}

// ------------------------------------------------- chapter registration
// The chapter interest form. The same rules are applied in the
// browser (src/data/registration.js); they are repeated here because the
// server never trusts what the browser sends.

const REG_LIMITS = { name: 80, uid: 16, section: 40, department: 80, course: 80, email: 120, phone: 20, interest: 60, other: 120 };
const OUTLOOK_DOMAINS = ['cuchd.in'];
const STUDENT_TYPES = ['Day Scholar', 'Hosteller'];
const OTHER_INTEREST = 'Other';
const MAX_INTERESTS = 20;

export function validateRegistration(body = {}) {
  const interests = Array.isArray(body.interests)
    ? [...new Set(body.interests.map((item) => clean(item, REG_LIMITS.interest)).filter(Boolean))].slice(0, MAX_INTERESTS)
    : [];

  const data = {
    kind: 'registration',
    name: clean(body.name, REG_LIMITS.name),
    uid: clean(body.uid, REG_LIMITS.uid).replace(/\s/g, '').toUpperCase(),
    section: clean(body.section, REG_LIMITS.section),
    department: clean(body.department, REG_LIMITS.department),
    course: clean(body.course, REG_LIMITS.course),
    email: clean(body.email, REG_LIMITS.email).toLowerCase(),
    phone: clean(body.phone, REG_LIMITS.phone)
      .replace(/[\s()-]/g, '')
      .replace(/^(\+?91|0)(?=\d{10}$)/, ''),
    studentType: clean(body.studentType, 20),
    interests,
    otherInterest: clean(body.otherInterest, REG_LIMITS.other),
    sourcePage: clean(body.sourcePage, LIMITS.sourcePage),
  };

  const fields = {};
  if (!data.name) fields.name = 'Please enter your name.';
  if (!data.uid) fields.uid = 'Please enter your UID.';
  else if (!/^[A-Z]?\d{2}[A-Z]{2,5}\d{3,6}$/.test(data.uid))
    fields.uid = 'That does not look like a CU UID. Enter it as printed on your ID card.';
  if (!data.section) fields.section = 'Please enter your section.';
  if (!data.department) fields.department = 'Please choose your department.';
  if (!data.course) fields.course = 'Please enter your course or program.';
  if (!data.email) fields.email = 'Please enter your CUCHD Outlook ID.';
  else if (!/^[^\s@]+@[^\s@]+$/.test(data.email) || !OUTLOOK_DOMAINS.some((domain) => data.email.endsWith(`@${domain}`)))
    fields.email = 'Please enter a valid CUCHD Outlook ID.';
  if (!data.phone) fields.phone = 'Please enter your contact number.';
  else if (!/^[6-9]\d{9}$/.test(data.phone)) fields.phone = 'Please enter a valid 10-digit Indian mobile number.';
  if (!STUDENT_TYPES.includes(data.studentType)) fields.studentType = 'Please choose Day Scholar or Hosteller.';
  if (!data.interests.length) fields.interests = 'Please select at least one area of interest.';
  else if (data.interests.includes(OTHER_INTEREST) && !data.otherInterest)
    fields.otherInterest = 'Please tell us what you are interested in.';

  return { data, fields, valid: Object.keys(fields).length === 0 };
}

function isRateLimited(key, now) {
  const cutoff = now - RATE_WINDOW_MS;
  const hits = (recent.get(key) ?? []).filter((time) => time > cutoff);
  if (hits.length >= RATE_MAX) {
    recent.set(key, hits);
    return true;
  }
  hits.push(now);
  recent.set(key, hits);
  // Keep the map from growing without bound.
  if (recent.size > 5000) {
    for (const [storedKey, times] of recent) {
      if (!times.some((time) => time > cutoff)) recent.delete(storedKey);
    }
  }
  return false;
}

/** Builds the Gmail transport, or returns null if it has not been configured. */
export function createTransport(env = process.env) {
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
  });
}

const stampIst = (now) =>
  new Intl.DateTimeFormat('en-IN', { dateStyle: 'full', timeStyle: 'long', timeZone: 'Asia/Kolkata' }).format(now);

const tableRows = (rows) =>
  rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#5d6f81;vertical-align:top;white-space:nowrap">${escapeHtml(label)}</td><td style="padding:4px 0">${escapeHtml(value)}</td></tr>`,
    )
    .join('\n    ');

/** The email for a chapter registration: one row per answer. */
export function buildRegistrationEmail(data, { env = process.env, now = new Date() } = {}) {
  const heading = 'New chapter registration from the IEEE CTSoc CUSB website';
  const interests = data.interests
    .map((item) => (item === OTHER_INTEREST && data.otherInterest ? `Other: ${data.otherInterest}` : item))
    .join(', ');

  const rows = [
    ['Full name', data.name],
    ['UID', data.uid],
    ['Section', data.section],
    ['Department', data.department],
    ['Course / Program', data.course],
    ['CUCHD Outlook ID', data.email],
    ['Contact number', data.phone],
    ['Student type', data.studentType],
    ['Interested in', interests],
    ['Sent', `${stampIst(now)} (${now.toISOString()})`],
    ['Source page', data.sourcePage || 'Not given'],
  ];

  const text = [heading, '', ...rows.map(([label, value]) => `${label}: ${value}`)].join('\n');

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#0d1b2a">
  <h2 style="margin:0 0 16px;font-size:18px;color:#16639d">${escapeHtml(heading)}</h2>
  <table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
    ${tableRows(rows)}
  </table>
  <p style="margin:20px 0 0;color:#5d6f81;font-size:13px">Reply to this email to write to ${escapeHtml(data.name)} directly.</p>
</div>`.trim();

  return {
    from: { name: 'IEEE CTSoc CUSB website', address: env.GMAIL_USER },
    to: env.CONTACT_TO || env.GMAIL_USER,
    replyTo: { name: data.name, address: data.email },
    subject: `[Chapter registration] ${data.name} (${data.uid})`,
    text,
    html,
  };
}

export function buildEmail(data, { env = process.env, now = new Date() } = {}) {
  if (data.kind === 'registration') return buildRegistrationEmail(data, { env, now });

  const to = env.CONTACT_TO || env.GMAIL_USER;
  const heading = 'New query from the IEEE CTSoc CUSB website';

  const rows = [
    ['Name', data.name],
    ['Email', data.email],
    ['Phone', data.phone || 'Not given'],
    ['Subject', data.subject],
    ['Sent', `${stampIst(now)} (${now.toISOString()})`],
    ['Source page', data.sourcePage || 'Not given'],
  ];

  const text = [
    heading,
    '',
    ...rows.map(([label, value]) => `${label}: ${value}`),
    '',
    'Message:',
    data.message,
  ].join('\n');

  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;color:#0d1b2a">
  <h2 style="margin:0 0 16px;font-size:18px;color:#16639d">${escapeHtml(heading)}</h2>
  <table cellpadding="0" cellspacing="0" style="border-collapse:collapse">
    ${tableRows(rows)}
  </table>
  <p style="margin:20px 0 6px;color:#5d6f81">Message</p>
  <div style="white-space:pre-wrap;padding:14px 16px;border:1px solid #e2e8ee;border-radius:8px">${escapeHtml(data.message)}</div>
  <p style="margin:20px 0 0;color:#5d6f81;font-size:13px">Reply to this email to answer ${escapeHtml(data.name)} directly.</p>
</div>`.trim();

  return {
    from: { name: 'IEEE CTSoc CUSB website', address: env.GMAIL_USER },
    to,
    replyTo: { name: data.name, address: data.email },
    subject: `[Website query] ${data.subject}`,
    text,
    html,
  };
}

/** A visitor confirmation sent only after the chapter inbox accepts a query. */
export function buildQueryAutoReply(data, { env = process.env } = {}) {
  const socials = [
    ['Instagram', site.social.instagram],
    ['LinkedIn', site.social.linkedin],
    ['Website', 'https://ieee-ctsoc-cusb.co.in'],
    ['WhatsApp Community', site.social.whatsapp],
  ].filter(([, url]) => url);
  const linksText = socials.map(([label, url]) => `${label}: ${url}`).join('\n');
  const linksHtml = socials
    .map(([label, url]) => `<a href="${escapeHtml(url)}" style="color:#16639d;text-decoration:none">${escapeHtml(label)}</a>`)
    .join('<br>');
  const hello = `Hello ${data.name},`;
  const text = [
    hello,
    '',
    'Thank you for contacting IEEE CTSoc CUSB.',
    'We have received your message and our team will get back to you as soon as possible.',
    '',
    'Stay connected with us:',
    linksText,
    '',
    'Regards,',
    'IEEE CTSoc CUSB',
    'Chandigarh University Chapter',
  ].join('\n');
  const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#15283a;background:#f5f9fc;padding:24px">
  <div style="max-width:560px;margin:0 auto;padding:28px;border:1px solid #dce8f1;border-radius:14px;background:#fff;box-shadow:0 12px 32px rgba(20,67,102,.08)">
    <p style="margin:0 0 18px;color:#16639d;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">IEEE CTSoc CUSB</p>
    <p style="margin:0 0 12px">${escapeHtml(hello)}</p>
    <p style="margin:0 0 12px">Thank you for contacting IEEE CTSoc CUSB.</p>
    <p style="margin:0 0 20px">We have received your message and our team will get back to you as soon as possible.</p>
    <p style="margin:0 0 8px;font-weight:700">Stay connected with us</p>
    <p style="margin:0 0 22px">${linksHtml}</p>
    <p style="margin:0">Regards,<br><strong>IEEE CTSoc CUSB</strong><br>Chandigarh University Chapter</p>
  </div>
</div>`.trim();

  return {
    from: { name: 'IEEE CTSoc CUSB', address: env.GMAIL_USER },
    to: data.email,
    subject: 'Thank you for contacting IEEE CTSoc CUSB',
    text,
    html,
  };
}

/**
 * Handles one submission: a contact query, or a chapter registration when
 * the body says `type: 'chapter'`. Returns { status, payload } for the caller.
 * `transport` can be passed in (tests do this); otherwise it is created from
 * the environment.
 */
export async function handleContact(body, { ip = 'unknown', env = process.env, transport, now = new Date() } = {}) {
  console.info('[contact] request received');
  // Honeypot: real visitors never see or fill this field.
  if (typeof body?.company === 'string' && body.company.trim() !== '') {
    return { status: 400, payload: { ok: false, error: 'The request could not be processed.' } };
  }

  const { data, fields, valid } = body?.type === 'chapter' ? validateRegistration(body) : validateContact(body);
  if (!valid) {
    return {
      status: 400,
      payload: { ok: false, error: 'Some fields need attention. Fix them and send again.', fields },
    };
  }
  console.info('[contact] email validation passed');

  const mailer = transport ?? createTransport(env);
  if (!mailer) {
    console.error('[contact] GMAIL_USER / GMAIL_APP_PASSWORD are not set; message was not sent.');
    return {
      status: 503,
      payload: { ok: false, error: 'Email delivery has not been set up on this server yet.' },
    };
  }

  if (isRateLimited(ip, now.getTime())) {
    return {
      status: 429,
      payload: { ok: false, error: 'Too many messages from this connection. Wait a few minutes and try again.' },
    };
  }

  try {
    console.info('[contact] sendMail started');
    const info = await mailer.sendMail(buildEmail(data, { env, now }));
    console.info('[contact] sendMail succeeded', { messageId: info?.messageId ?? null });
    let confirmationSent = null;
    if (data.kind === 'query') {
      try {
        console.info('[contact] confirmation sendMail started');
        const confirmation = await mailer.sendMail(buildQueryAutoReply(data, { env }));
        confirmationSent = true;
        console.info('[contact] confirmation sendMail succeeded', { messageId: confirmation?.messageId ?? null });
      } catch (replyError) {
        confirmationSent = false;
        let message = String(replyError?.message ?? 'Unknown SMTP error');
        for (const secret of [env.GMAIL_APP_PASSWORD, env.GMAIL_USER, env.CONTACT_TO]) {
          if (typeof secret === 'string' && secret.length > 0) message = message.split(secret).join('[redacted]');
        }
        console.error('[contact] confirmation sendMail failed', {
          code: replyError?.code ?? null,
          responseCode: replyError?.responseCode ?? null,
          message: message.slice(0, 300),
        });
      }
    }
    return { status: 200, payload: { ok: true, id: info?.messageId ?? null, confirmationSent } };
  } catch (error) {
    let message = String(error?.message ?? 'Unknown SMTP error');
    for (const secret of [env.GMAIL_APP_PASSWORD, env.GMAIL_USER, env.CONTACT_TO]) {
      if (typeof secret === 'string' && secret.length > 0) message = message.split(secret).join('[redacted]');
    }
    console.error('[contact] sendMail failed', {
      code: error?.code ?? null,
      responseCode: error?.responseCode ?? null,
      message: message.slice(0, 300),
    });
    return {
      status: 502,
      payload: { ok: false, error: 'The mail service rejected the message. It has not been delivered.' },
    };
  }
}
