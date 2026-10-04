// Run with: npm test
// Exercises the contact handler without sending any real email: nodemailer's
// JSON transport returns the message it would have sent.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import nodemailer from 'nodemailer';
import { handleContact, validateContact, validateRegistration } from './contact.js';

const env = { GMAIL_USER: 'sender@example.com', GMAIL_APP_PASSWORD: 'x', CONTACT_TO: 'inbox@example.com' };
const good = {
  name: 'Asha Rao',
  email: 'asha@example.com',
  phone: '+91 98765 43210',
  subject: 'Workshop question',
  message: 'Hello, is the MATLAB workshop open to first years?',
  company: '',
  sourcePage: 'https://example.com/contact',
};
const stub = () => nodemailer.createTransport({ jsonTransport: true });
let ipCounter = 0;
const ip = () => `10.0.0.${(ipCounter += 1)}`;

test('a valid query is sent with every required detail', async () => {
  const now = new Date('2026-10-03T12:00:00Z');
  const sent = [];
  const transport = stub();
  const original = transport.sendMail.bind(transport);
  transport.sendMail = async (mail) => {
    sent.push(mail);
    return original(mail);
  };

  const { status, payload } = await handleContact(good, { env, transport, ip: ip(), now });
  assert.equal(status, 200);
  assert.equal(payload.ok, true);

  const mail = sent[0];
  assert.equal(mail.to, 'inbox@example.com');
  assert.equal(mail.replyTo.address, 'asha@example.com');
  assert.equal(mail.subject, '[Website query] Workshop question');
  for (const expected of [
    'Asha Rao',
    'asha@example.com',
    '+91 98765 43210',
    'Workshop question',
    'is the MATLAB workshop open',
    '2026-10-03T12:00:00.000Z',
    'https://example.com/contact',
  ]) {
    assert.ok(mail.text.includes(expected), `email text should include "${expected}"`);
  }
});

const student = {
  type: 'chapter',
  name: 'Asha Rao',
  uid: '24bcs10001',
  section: '24BCS-610 A',
  department: 'Computer Science & Engineering (CSE)',
  course: 'B.E. CSE',
  email: '24BCS10001@cuchd.in',
  phone: '+91 98765 43210',
  studentType: 'Hosteller',
  interests: ['Hackathons', 'Cybersecurity', 'Other'],
  otherInterest: 'Robotics',
  company: '',
  sourcePage: 'https://example.com/membership',
};

test('a chapter registration is emailed with every answer', async () => {
  const sent = [];
  const transport = { sendMail: async (mail) => (sent.push(mail), { messageId: 'x' }) };
  const { status, payload } = await handleContact(student, { env, transport, ip: ip() });
  assert.equal(status, 200);
  assert.equal(payload.ok, true);

  const mail = sent[0];
  assert.equal(mail.to, 'inbox@example.com');
  assert.equal(mail.subject, '[Chapter registration] Asha Rao (24BCS10001)');
  assert.equal(mail.replyTo.address, '24bcs10001@cuchd.in');
  for (const expected of [
    'UID: 24BCS10001',
    'Section: 24BCS-610 A',
    'Department: Computer Science & Engineering (CSE)',
    'Course / Program: B.E. CSE',
    'CUCHD Outlook ID: 24bcs10001@cuchd.in',
    'Contact number: 9876543210',
    'Student type: Hosteller',
    'Interested in: Hackathons, Cybersecurity, Other: Robotics',
    'https://example.com/membership',
  ]) {
    assert.ok(mail.text.includes(expected), `email text should include "${expected}"`);
  }
  assert.ok(!/password/i.test(mail.text));
});

test('a chapter registration is checked field by field on the server', async () => {
  const { status, payload } = await handleContact(
    {
      type: 'chapter',
      name: '',
      uid: 'hello',
      section: '',
      department: '',
      course: '',
      email: 'someone@gmail.com',
      phone: '12345',
      studentType: 'Visitor',
      interests: [],
    },
    { env, transport: stub(), ip: ip() },
  );
  assert.equal(status, 400);
  assert.deepEqual(Object.keys(payload.fields).sort(), [
    'course',
    'department',
    'email',
    'interests',
    'name',
    'phone',
    'section',
    'studentType',
    'uid',
  ]);
  assert.equal(payload.fields.email, 'Please enter a valid CUCHD Outlook ID.');
});

test('choosing "Other" needs the interest to be written in', () => {
  const { fields } = validateRegistration({ ...student, otherInterest: '   ' });
  assert.deepEqual(Object.keys(fields), ['otherInterest']);
  assert.equal(validateRegistration(student).valid, true);
});

test('registration answers cannot inject headers or html', async () => {
  const sent = [];
  const transport = { sendMail: async (mail) => (sent.push(mail), { messageId: 'x' }) };
  await handleContact(
    { ...student, name: 'Asha\r\nBcc: victim@example.com', section: '<b>A</b>' },
    { env, transport, ip: ip() },
  );
  assert.ok(!/[\r\n]/.test(sent[0].subject));
  assert.ok(!sent[0].html.includes('<b>A</b>'));
  assert.ok(sent[0].html.includes('&lt;b&gt;A&lt;/b&gt;'));
});

test('a registration is never reported as received when email is not configured', async () => {
  const { status, payload } = await handleContact(student, { env: {}, ip: ip() });
  assert.equal(status, 503);
  assert.equal(payload.ok, false);
});

test('missing and malformed fields are rejected with per-field messages', async () => {
  const { status, payload } = await handleContact(
    { name: '', email: 'not-an-email', subject: '', message: 'short' },
    { env, transport: stub(), ip: ip() },
  );
  assert.equal(status, 400);
  assert.equal(payload.ok, false);
  assert.deepEqual(Object.keys(payload.fields).sort(), ['email', 'message', 'name', 'subject']);
});

test('success is never reported when email is not configured', async () => {
  const { status, payload } = await handleContact(good, { env: {}, ip: ip() });
  assert.equal(status, 503);
  assert.equal(payload.ok, false);
});

test('a failing mail service is reported as a failure', async () => {
  const transport = { sendMail: async () => Promise.reject(new Error('SMTP down')) };
  const { status, payload } = await handleContact(good, { env, transport, ip: ip() });
  assert.equal(status, 502);
  assert.equal(payload.ok, false);
});

test('line breaks cannot be smuggled into the subject or name', () => {
  const { data } = validateContact({ ...good, subject: 'Hi\r\nBcc: victim@example.com', name: 'A\nB' });
  assert.ok(!/[\r\n]/.test(data.subject));
  assert.ok(!/[\r\n]/.test(data.name));
});

test('html in the message is escaped in the html body', async () => {
  const sent = [];
  const transport = { sendMail: async (mail) => (sent.push(mail), { messageId: 'x' }) };
  await handleContact({ ...good, message: '<script>alert(1)</script> hello there' }, { env, transport, ip: ip() });
  assert.ok(!sent[0].html.includes('<script>'));
  assert.ok(sent[0].html.includes('&lt;script&gt;'));
});

test('the honeypot swallows bot submissions without sending', async () => {
  let calls = 0;
  const transport = { sendMail: async () => ((calls += 1), { messageId: 'x' }) };
  const { status } = await handleContact({ ...good, company: 'Acme Bots' }, { env, transport, ip: ip() });
  assert.equal(status, 200);
  assert.equal(calls, 0);
});

test('repeated submissions from one address are rate limited', async () => {
  const transport = { sendMail: async () => ({ messageId: 'x' }) };
  const address = ip();
  const statuses = [];
  for (let i = 0; i < 6; i += 1) {
    statuses.push((await handleContact(good, { env, transport, ip: address })).status);
  }
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);
});
