// Run with: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { addDays, buildCalendar, entryStatus, monthAgenda, monthMatrix, monthsWithEntries, weekBars } from './calendar.js';

const events = [
  {
    slug: 'hack',
    title: 'Hack 4.O',
    date: '2026-10-30',
    endDate: '2026-10-31',
    startsAt: '2026-10-30T09:00:00+05:30',
    endsAt: '2026-10-31T17:00:00+05:30',
    registrationUrl: 'https://example.com',
    registrationCloses: '2026-10-04T23:59:00+05:30',
    submission: { label: 'PPT / idea submission', deadline: '2026-10-04' },
  },
  { slug: 'day', title: 'IEEE Day 2026', short: 'IEEE Day', windowLabel: 'IEEE Day celebrations', date: '2026-10-06', endDate: '2026-10-20' },
  { slug: 'old', title: 'Hack 3.O', date: null, months: ['2025-10', '2025-11'], dateLabel: 'October to November 2025' },
  { slug: 'undated', title: 'Code Relay', date: null },
];
const at = (text) => new Date(text).getTime();

test('October 2026 starts on a Thursday and needs five Monday-first weeks', () => {
  const weeks = monthMatrix(2026, 10);
  assert.equal(weeks.length, 5);
  assert.equal(weeks[0][0].iso, '2026-09-28');
  assert.equal(weeks[0][3].iso, '2026-10-01');
  assert.equal(weeks[0][3].inMonth, true);
  assert.equal(weeks[0][2].inMonth, false);
  assert.equal(weeks[4][6].iso, '2026-11-01');
});

test('a month that starts on a Monday has no leading blanks, and long months get six weeks', () => {
  assert.equal(monthMatrix(2026, 6)[0][0].iso, '2026-06-01');
  assert.equal(monthMatrix(2026, 8).length, 6); // August 2026 starts on a Saturday
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
});

test('the calendar is built from the events list', () => {
  const calendar = buildCalendar(events);
  const ids = calendar.entries.map((entry) => entry.id);
  assert.deepEqual(ids.sort(), ['day', 'day-window', 'hack', 'hack-registration', 'hack-submission'].sort());
  assert.deepEqual(calendar.monthly.map((item) => item.id), ['old']);

  const main = calendar.entries.find((entry) => entry.id === 'day');
  const band = calendar.entries.find((entry) => entry.id === 'day-window');
  assert.deepEqual([main.start, main.end], ['2026-10-06', '2026-10-06']);
  assert.deepEqual([band.start, band.end], ['2026-10-07', '2026-10-20']);
});

test('status follows the clock: upcoming, then ongoing, then past', () => {
  const { entries } = buildCalendar(events);
  const hack = entries.find((entry) => entry.id === 'hack');
  assert.equal(entryStatus(hack, at('2026-10-04T08:00:00+05:30')), 'upcoming');
  assert.equal(entryStatus(hack, at('2026-10-30T09:00:01+05:30')), 'ongoing');
  assert.equal(entryStatus(hack, at('2026-10-31T17:00:01+05:30')), 'past');

  const day = entries.find((entry) => entry.id === 'day');
  assert.equal(entryStatus(day, at('2026-10-05T23:59:00+05:30')), 'upcoming');
  assert.equal(entryStatus(day, at('2026-10-06T00:00:01+05:30')), 'ongoing');
  assert.equal(entryStatus(day, at('2026-10-20T23:00:00+05:30')), 'ongoing');
  assert.equal(entryStatus(day, at('2026-10-21T00:00:01+05:30')), 'past');

  const registration = entries.find((entry) => entry.id === 'hack-registration');
  assert.equal(entryStatus(registration, at('2026-10-04T23:58:00+05:30')), 'ongoing');
  assert.equal(entryStatus(registration, at('2026-10-04T23:59:01+05:30')), 'past');
});

test('bars are placed in the right columns and never overlap', () => {
  const { entries } = buildCalendar(events);
  const weeks = monthMatrix(2026, 10);

  // Week of 28 Sep: both deadlines fall on Sunday 4 Oct, in separate lanes.
  const first = weekBars(weeks[0], entries);
  assert.deepEqual(first.bars.map((bar) => [bar.entry.id, bar.column, bar.span, bar.lane]).sort(), [
    ['hack-registration', 6, 1, 0],
    ['hack-submission', 6, 1, 1],
  ]);

  // Week of 5 Oct: IEEE Day on Tuesday, then the celebrations to Sunday, on one lane.
  const second = weekBars(weeks[1], entries);
  assert.deepEqual(second.bars.map((bar) => [bar.entry.id, bar.column, bar.span, bar.lane]), [
    ['day', 1, 1, 0],
    ['day-window', 2, 5, 0],
  ]);
  assert.equal(second.bars[1].endsHere, false);

  // Week of 19 Oct: the celebrations end on Tuesday the 20th.
  const fourth = weekBars(weeks[3], entries);
  assert.deepEqual([fourth.bars[0].column, fourth.bars[0].span, fourth.bars[0].startsHere, fourth.bars[0].endsHere], [0, 2, false, true]);

  // Week of 26 Oct: the hackathon on Friday and Saturday.
  const fifth = weekBars(weeks[4], entries);
  assert.deepEqual([fifth.bars[0].entry.id, fifth.bars[0].column, fifth.bars[0].span], ['hack', 4, 2]);
});

test('months with something on them, and what a month holds', () => {
  const calendar = buildCalendar(events);
  assert.deepEqual(monthsWithEntries(calendar), ['2025-10', '2025-11', '2026-10']);
  const october = monthAgenda(calendar, '2026-10');
  assert.deepEqual(october.dated.map((entry) => entry.id), ['hack-registration', 'hack-submission', 'day', 'hack']);
  assert.equal(october.windows.length, 1);
  assert.deepEqual(monthAgenda(calendar, '2025-11').undated.map((item) => item.id), ['old']);
  assert.equal(monthAgenda(calendar, '2026-07').dated.length, 0);
});
