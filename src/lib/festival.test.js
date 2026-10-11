import test from 'node:test';
import assert from 'node:assert/strict';
import { getFestivalTheme } from './festival.js';

test('festival theme follows the Navratri and Vijayadashami dates in IST', () => {
  assert.equal(getFestivalTheme(new Date('2026-10-10T18:29:59Z')), null);
  assert.equal(getFestivalTheme(new Date('2026-10-10T18:30:00Z')), 'navratri');
  assert.equal(getFestivalTheme(new Date('2026-10-19T18:29:59Z')), 'navratri');
  assert.equal(getFestivalTheme(new Date('2026-10-19T18:30:00Z')), 'vijayadashami');
  assert.equal(getFestivalTheme(new Date('2026-10-20T18:29:59Z')), 'vijayadashami');
  assert.equal(getFestivalTheme(new Date('2026-10-20T18:30:00Z')), null);
});
