// Run with: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { countdownParts, getPulseItems } from './pulse.js';

const at = (text) => new Date(text).getTime();
const hackathon = {
  slug: 'zinnovatio-4o',
  title: 'Zinnovatio 4.O',
  date: '2026-10-30',
  endDate: '2026-10-31',
  startsAt: '2026-10-30T09:00:00+05:30',
  endsAt: '2026-10-31T17:00:00+05:30',
  registrationUrl: 'https://example.com/register',
  registrationLabel: 'Register on Unstop',
  registrationCloses: '2026-10-04T23:59:00+05:30',
};
const ieeeDay = { slug: 'ieee-day-2026', title: 'IEEE Day 2026', date: '2026-10-06', endDate: '2026-10-20' };
const ieeeDayTeaser = { ...ieeeDay, teaserAt: '2026-10-09T00:00:00+05:30' };
const ieeeDayLocalEvent = { ...ieeeDay, localCelebration: { startsAt: '2026-10-09T00:00:00+05:30', venue: 'Chandigarh University' } };
const archive = { slug: 'code-relay', title: 'Code Relay', date: null };
const all = [hackathon, ieeeDay, archive];
const kinds = (items) => items.map((item) => `${item.event.slug}:${item.kind}`);

test('more than three days out, the pop-up has nothing to say', () => {
  assert.deepEqual(getPulseItems(all, at('2026-09-20T10:00:00+05:30')), []);
});

test('the countdown begins exactly three days before', () => {
  assert.deepEqual(kinds(getPulseItems([ieeeDay], at('2026-10-02T23:59:00+05:30'))), []);
  assert.deepEqual(kinds(getPulseItems([ieeeDay], at('2026-10-03T00:00:30+05:30'))), ['ieee-day-2026:soon']);
});

test('the IEEE Day teaser takes priority until the 9 October reveal', () => {
  const beforeReveal = getPulseItems([ieeeDayTeaser], at('2026-10-05T12:00:00+05:30'));
  assert.deepEqual(kinds(beforeReveal), ['ieee-day-2026:teaser']);
  assert.equal(beforeReveal[0].target, at('2026-10-09T00:00:00+05:30'));
  assert.equal(beforeReveal[0].to, '/#ieee-day-teaser');

  assert.deepEqual(kinds(getPulseItems([ieeeDayTeaser], at('2026-10-09T00:00:00+05:30'))), ['ieee-day-2026:live']);
});

test('the local campus date is the Dynamic Island teaser target, not the worldwide date', () => {
  const items = getPulseItems([ieeeDayLocalEvent], at('2026-10-05T12:00:00+05:30'));
  assert.equal(items[0].target, at('2026-10-09T00:00:00+05:30'));
  assert.equal(ieeeDayLocalEvent.date, '2026-10-06');
  assert.equal(ieeeDayLocalEvent.localCelebration.venue, 'Chandigarh University');
});

test('4 October: registration closes tonight, IEEE Day is two days away', () => {
  const items = getPulseItems(all, at('2026-10-04T09:00:00+05:30'));
  assert.deepEqual(kinds(items), ['zinnovatio-4o:deadline', 'ieee-day-2026:soon']);
  assert.equal(items[0].href, 'https://example.com/register');
  assert.equal(items[0].target, at('2026-10-04T23:59:00+05:30'));
});

test('once registration has closed its notice goes', () => {
  assert.deepEqual(kinds(getPulseItems(all, at('2026-10-05T00:00:30+05:30'))), ['ieee-day-2026:soon']);
});

test('an event that is on is announced as live, first in the list, until it ends', () => {
  assert.deepEqual(kinds(getPulseItems(all, at('2026-10-06T00:00:30+05:30'))), ['ieee-day-2026:live']);
  assert.deepEqual(kinds(getPulseItems(all, at('2026-10-20T23:00:00+05:30'))), ['ieee-day-2026:live']);
  assert.deepEqual(kinds(getPulseItems(all, at('2026-10-21T00:00:30+05:30'))), []);
  const both = getPulseItems([{ ...ieeeDay, endDate: '2026-10-29' }, hackathon], at('2026-10-28T10:00:00+05:30'));
  assert.deepEqual(kinds(both), ['ieee-day-2026:live', 'zinnovatio-4o:soon']);
});

test('the hackathon: get ready from 27 October, live on the 30th, quiet after the 31st', () => {
  assert.deepEqual(kinds(getPulseItems([hackathon], at('2026-10-27T08:00:00+05:30'))), []);
  assert.deepEqual(kinds(getPulseItems([hackathon], at('2026-10-27T09:30:00+05:30'))), ['zinnovatio-4o:soon']);
  assert.deepEqual(kinds(getPulseItems([hackathon], at('2026-10-30T09:00:30+05:30'))), ['zinnovatio-4o:live']);
  assert.deepEqual(kinds(getPulseItems([hackathon], at('2026-10-31T17:00:30+05:30'))), []);
});

test('countdown pieces', () => {
  const now = at('2026-10-04T09:00:00+05:30');
  assert.deepEqual(countdownParts(at('2026-10-04T23:59:00+05:30'), now), { days: 0, hh: '14', mm: '59', ss: '00' });
  assert.deepEqual(countdownParts(at('2026-10-06T00:00:00+05:30'), now), { days: 1, hh: '15', mm: '00', ss: '00' });
  assert.deepEqual(countdownParts(now - 5000, now), { days: 0, hh: '00', mm: '00', ss: '00' });
});
