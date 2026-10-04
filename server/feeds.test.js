// Run with: npm test
// The live-data helpers are exercised with a stand-in for `fetch`, so no
// real request is ever made from the tests.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getNewsletterIssues, getUsdInr } from './feeds.js';

const json = (body, ok = true) => ({ ok, status: ok ? 200 : 500, json: async () => body });
const pdf = { status: 200, headers: { get: () => 'application/pdf' } };
const missing = { status: 404, headers: { get: () => 'text/html' } };
const NOW = new Date('2026-10-04T03:00:00Z').getTime();

test('the rupee rate comes from the first source that answers sensibly', async () => {
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    return json({ amount: 1, base: 'USD', date: '2026-10-02', rates: { INR: 96.3249 } });
  };
  const result = await getUsdInr({ fetchImpl, now: NOW, memory: { value: null, at: 0 } });
  assert.equal(result.ok, true);
  assert.equal(result.rate, 96.32);
  assert.equal(result.date, '2026-10-02');
  assert.match(result.source, /Frankfurter/);
  assert.equal(calls.length, 1);
});

test('if the first source fails, the second is used', async () => {
  const fetchImpl = async (url) =>
    url.includes('frankfurter')
      ? Promise.reject(new Error('offline'))
      : json({ result: 'success', time_last_update_unix: 1790985752, rates: { INR: 96.372564 } });
  const result = await getUsdInr({ fetchImpl, now: NOW, memory: { value: null, at: 0 } });
  assert.equal(result.ok, true);
  assert.equal(result.rate, 96.37);
  assert.match(result.source, /ExchangeRate-API/);
});

test('a nonsense rate is rejected rather than shown', async () => {
  const fetchImpl = async () => json({ date: '2026-10-02', rates: { INR: 0.0104 } });
  const result = await getUsdInr({ fetchImpl, now: NOW, memory: { value: null, at: 0 } });
  assert.equal(result.ok, false);
});

test('the rate is remembered for twelve hours, then fetched again', async () => {
  let calls = 0;
  const fetchImpl = async () => ((calls += 1), json({ date: '2026-10-02', rates: { INR: 96.3 } }));
  const memory = { value: null, at: 0 };
  await getUsdInr({ fetchImpl, now: NOW, memory });
  await getUsdInr({ fetchImpl, now: NOW + 11 * 3600_000, memory });
  assert.equal(calls, 1);
  await getUsdInr({ fetchImpl, now: NOW + 13 * 3600_000, memory });
  assert.equal(calls, 2);
});

test('newsletter: only issues that are really online are listed, newest first', async () => {
  const online = new Set(['2026-09', '2026-08', '2026-06', '2025-12']);
  const asked = [];
  const fetchImpl = async (url) => {
    asked.push(url);
    const month = url.match(/NCT-(\d{4}-\d{2})\.pdf$/)[1];
    return online.has(month) ? pdf : missing;
  };
  const result = await getNewsletterIssues({ fetchImpl, now: NOW, memory: { value: null, at: 0 } });
  assert.equal(result.ok, true);
  assert.deepEqual(result.issues.map((issue) => issue.month), ['2026-09', '2026-08', '2026-06', '2025-12']);
  assert.equal(result.issues[0].url, 'https://ctsoc.ieee.org/images/CTSOC-NCT-2026-09.pdf');
  assert.ok(asked.some((url) => url.endsWith('CTSOC-NCT-2026-10.pdf')), 'this month is checked');
  assert.ok(asked.some((url) => url.endsWith('CTSOC-NCT-2025-11.pdf')), 'a year back is checked');
});

test('newsletter: if recent months are missing it keeps looking further back, then stops', async () => {
  // Nothing since October 2024.
  const online = new Set(['2024-10', '2024-09', '2024-08', '2024-07', '2024-06', '2024-03']);
  const asked = [];
  const fetchImpl = async (url) => {
    asked.push(url);
    return online.has(url.match(/NCT-(\d{4}-\d{2})\.pdf$/)[1]) ? pdf : missing;
  };
  const result = await getNewsletterIssues({ fetchImpl, now: NOW, memory: { value: null, at: 0 } });
  assert.deepEqual(result.issues.map((issue) => issue.month), ['2024-10', '2024-09', '2024-08', '2024-07', '2024-06']);
  assert.ok(asked.length <= 30 * 2, 'no more than thirty months are asked about');
  assert.ok(!asked.some((url) => url.includes('NCT-2024-03')), 'it stops at thirty months back');
});

test('newsletter: once six issues are found, older months are not asked about', async () => {
  const asked = [];
  const fetchImpl = async (url) => (asked.push(url), pdf);
  const result = await getNewsletterIssues({ fetchImpl, now: NOW, memory: { value: null, at: 0 } });
  assert.equal(result.issues.length, 6);
  assert.equal(asked.length, 6);
});

test('newsletter: a server that refuses HEAD is asked for the first byte instead', async () => {
  const fetchImpl = async (url, options) => {
    if (options.method === 'HEAD') return { status: 405, headers: { get: () => '' } };
    return url.endsWith('2026-09.pdf') ? { status: 206, headers: { get: () => 'application/pdf' } } : missing;
  };
  const result = await getNewsletterIssues({ fetchImpl, now: NOW, memory: { value: null, at: 0 } });
  assert.deepEqual(result.issues.map((issue) => issue.month), ['2026-09']);
});

test('newsletter: when the site cannot be reached, nothing is invented', async () => {
  const fetchImpl = async () => Promise.reject(new Error('blocked'));
  const result = await getNewsletterIssues({ fetchImpl, now: NOW, memory: { value: null, at: 0 } });
  assert.equal(result.ok, false);
  assert.deepEqual(result.issues, []);
});

test('newsletter: an html page answering 200 is not mistaken for an issue', async () => {
  const fetchImpl = async () => ({ status: 200, headers: { get: () => 'text/html; charset=utf-8' } });
  const result = await getNewsletterIssues({ fetchImpl, now: NOW, memory: { value: null, at: 0 } });
  assert.equal(result.ok, false);
});
