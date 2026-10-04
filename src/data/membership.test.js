// Run with: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { activeDiscount, formatInr, formatUsd, getMembershipTotals } from './membership.js';

const pricing = {
  ieeeStudent: { usd: 14, taxRate: 0.18 },
  ctsocStudent: { usd: 0.5, taxRate: 0.18 },
  usdToInr: 96.2,
};
const at = (text) => new Date(text).getTime();

test('totals are worked out from the dues, the tax rate and the exchange rate', () => {
  const { ieee, ctsoc, combined } = getMembershipTotals(pricing, { discounts: [] });
  assert.equal(ieee.totalUsd, 16.52);
  assert.equal(ctsoc.totalUsd, 0.59);
  assert.equal(combined.subtotal, 14.5);
  assert.equal(combined.tax, 2.61);
  assert.equal(combined.totalUsd, 17.11);
  assert.equal(ieee.totalInr, 1589);
  assert.equal(combined.totalInr, 1646);
  assert.equal(formatUsd(combined.totalUsd), 'US$17.11');
  assert.equal(formatInr(combined.totalInr), '₹1,646');
});

test('a live exchange rate replaces the saved one, and only changes the rupee figures', () => {
  const saved = getMembershipTotals(pricing, { discounts: [] });
  const live = getMembershipTotals(pricing, { discounts: [], usdToInr: 100 });
  assert.equal(live.combined.totalUsd, saved.combined.totalUsd);
  assert.equal(live.ieee.totalInr, 1652);
  assert.equal(live.combined.totalInr, 1711);
  assert.equal(live.usdToInr, 100);
});

const halfYear = {
  label: 'Half-year pricing',
  appliesTo: ['ieeeStudent', 'ctsocStudent'],
  percentOff: 50,
  from: '2027-03-01',
  to: '2027-08-15',
};

test('a discount switches on at its start date and off after its end date, in India time', () => {
  const discounts = [halfYear];
  assert.equal(activeDiscount('ieeeStudent', { discounts, now: at('2027-02-28T23:59:00+05:30') }), null);
  assert.equal(activeDiscount('ieeeStudent', { discounts, now: at('2027-03-01T00:00:30+05:30') }), halfYear);
  assert.equal(activeDiscount('ieeeStudent', { discounts, now: at('2027-08-15T23:59:00+05:30') }), halfYear);
  assert.equal(activeDiscount('ieeeStudent', { discounts, now: at('2027-08-16T00:00:30+05:30') }), null);
});

test('while a discount runs, every price and total follows it', () => {
  const now = at('2027-05-10T12:00:00+05:30');
  const { ieee, ctsoc, combined } = getMembershipTotals(pricing, { discounts: [halfYear], now });
  assert.equal(ieee.listUsd, 14);
  assert.equal(ieee.baseUsd, 7);
  assert.equal(ieee.totalUsd, 8.26);
  assert.equal(ctsoc.baseUsd, 0.25);
  assert.equal(combined.listSubtotal, 14.5);
  assert.equal(combined.subtotal, 7.25);
  assert.equal(combined.totalUsd, 8.56);
  assert.equal(ieee.discount.percentOff, 50);

  const after = getMembershipTotals(pricing, { discounts: [halfYear], now: at('2027-09-01T12:00:00+05:30') });
  assert.equal(after.ieee.baseUsd, 14);
  assert.equal(after.ieee.discount, null);
});

test('a discount can apply to one membership only, and silly values are ignored', () => {
  const now = at('2027-05-10T12:00:00+05:30');
  const onlyCtsoc = [{ ...halfYear, appliesTo: ['ctsocStudent'] }];
  const totals = getMembershipTotals(pricing, { discounts: onlyCtsoc, now });
  assert.equal(totals.ieee.baseUsd, 14);
  assert.equal(totals.ctsoc.baseUsd, 0.25);
  assert.equal(activeDiscount('ieeeStudent', { discounts: [{ ...halfYear, percentOff: 100 }], now }), null);
  assert.equal(activeDiscount('ieeeStudent', { discounts: [{ ...halfYear, percentOff: 0 }], now }), null);
});

test('no discounts are listed until IEEE announces one', () => {
  const totals = getMembershipTotals();
  assert.equal(totals.ieee.discount, null);
  assert.equal(totals.ieee.baseUsd, totals.ieee.listUsd);
});
