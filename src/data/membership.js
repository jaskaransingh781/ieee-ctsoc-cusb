// ---------------------------------------------------------------------------
// MEMBERSHIP
// Everything on the /membership page that can change lives here: the dues,
// the tax rate, the exchange rate and the official links. The page works
// every total out from these numbers; nothing is typed into the page itself.
//
// TO UPDATE A PRICE: change the number below and save.
//
// What updates by itself:
//   - The rupee conversion. The site's server looks up the day's USD to INR
//     rate (server/feeds.js). `usdToInr` below is only the fallback used
//     when that lookup is not available.
//   - Discounts, once listed in `membershipDiscounts`: each one switches on
//     at its `from` date and off after its `to` date without anyone
//     touching the site.
// What does not: the dues themselves. IEEE publishes no feed of its prices
// and does not allow them to be read automatically, so when IEEE changes
// its dues the two numbers below need changing by hand.
// ---------------------------------------------------------------------------

export const membershipPricing = {
  // Student dues in US dollars, before tax.
  ieeeStudent: { usd: 14.0, taxRate: 0.18 },
  ctsocStudent: { usd: 0.5, taxRate: 0.18 },

  // US dollar to Indian rupee: the fallback for when the live rate cannot
  // be fetched. Used only for the indicative INR figures.
  usdToInr: 96.2,
  rateDate: '2026-10-02', // the day this rate is from
  currencySource: 'Saved mid-market rate',

  // The day the dues above were last looked at.
  lastUpdated: '2026-10-04',
};

// ---------------------------------------------------------------------------
// DISCOUNTS
// Add one entry per offer. Between `from` and `to` (both days included,
// India time) the Membership page shows the reduced price with the usual
// price struck through, and every total follows. Outside those dates the
// entry does nothing, so it can be added early and left in afterwards.
//
//   {
//     label: 'Half-year pricing',
//     appliesTo: ['ieeeStudent', 'ctsocStudent'],   // one or both
//     percentOff: 50,
//     from: '2027-03-01',
//     to: '2027-08-15',
//   },
//
// Only list an offer that IEEE has actually announced.
// ---------------------------------------------------------------------------
export const membershipDiscounts = [];

// Official pages only. Every button on the Membership page uses these.
export const membershipLinks = {
  // Join IEEE (choose "Student" on that page)
  ieee: 'https://www.ieee.org/membership/join/index.html',
  // IEEE Consumer Technology Society in the IEEE membership catalog
  ctsoc: 'https://www.ieee.org/membership-catalog/productdetail/showProductDetailPage.html?product=MEMCT008',
  // The society's own page about membership
  ctsocInfo: 'https://ctsoc.ieee.org/membership.html',
  // IEEE's table of dues
  dues: 'https://www.ieee.org/membership/join/dues.html',
  // IEEE India: paying in rupees by UPI
  indiaFaq: 'https://india.ieee.org/faqs/',
};

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const indiaDay = (time) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date(time));

/** The discount that applies to a plan today, or null. */
export function activeDiscount(plan, { now = Date.now(), discounts = membershipDiscounts } = {}) {
  const today = indiaDay(now);
  return (
    discounts.find(
      (offer) =>
        offer.appliesTo?.includes(plan) &&
        offer.percentOff > 0 &&
        offer.percentOff < 100 &&
        (!offer.from || today >= offer.from) &&
        (!offer.to || today <= offer.to),
    ) ?? null
  );
}

/** Dues, tax and totals for one membership, in USD and indicative INR. */
function priceOf(plan, { usd, taxRate }, usdToInr, options) {
  const discount = activeDiscount(plan, options);
  const baseUsd = discount ? round2(usd * (1 - discount.percentOff / 100)) : usd;
  const tax = round2(baseUsd * taxRate);
  const totalUsd = round2(baseUsd + tax);
  return {
    listUsd: usd, // the usual dues, before any discount
    baseUsd, // what is charged today, before tax
    discount,
    taxRate,
    tax,
    totalUsd,
    totalInr: Math.round(totalUsd * usdToInr),
  };
}

/**
 * Every figure the page shows, worked out from membershipPricing.
 *   usdToInr  : a live rate, when the server has one
 *   now       : the moment to price for (discounts depend on the date)
 *   discounts : the offers to consider (defaults to membershipDiscounts)
 */
export function getMembershipTotals(pricing = membershipPricing, options = {}) {
  const usdToInr = options.usdToInr ?? pricing.usdToInr;
  const ieee = priceOf('ieeeStudent', pricing.ieeeStudent, usdToInr, options);
  const ctsoc = priceOf('ctsocStudent', pricing.ctsocStudent, usdToInr, options);

  const subtotal = round2(ieee.baseUsd + ctsoc.baseUsd);
  const tax = round2(ieee.baseUsd * ieee.taxRate + ctsoc.baseUsd * ctsoc.taxRate);
  const totalUsd = round2(subtotal + tax);

  return {
    ieee,
    ctsoc,
    combined: {
      listSubtotal: round2(ieee.listUsd + ctsoc.listUsd),
      subtotal,
      tax,
      totalUsd,
      totalInr: Math.round(totalUsd * usdToInr),
    },
    usdToInr,
  };
}

export const formatUsd = (value) => `US$${value.toFixed(2)}`;
export const formatInr = (value) => `₹${new Intl.NumberFormat('en-IN').format(Math.round(value))}`;
export const formatPercent = (rate) => `${Math.round(rate * 100)}%`;

// ------------------------------------------------------------------ content

export const membershipSteps = [
  {
    title: 'Join IEEE',
    text: 'Create your IEEE account and take out Student Membership.',
    action: { label: 'Join IEEE', link: 'ieee' },
  },
  {
    title: 'Add IEEE CTSoc',
    text: 'Choose the IEEE Consumer Technology Society in the IEEE membership catalog and add it to your membership.',
    action: { label: 'Open the CTSoc catalog page', link: 'ctsoc' },
  },
  {
    title: 'Become part of CTSoc',
    text: 'Take part through events, technical activities, research, networking and leadership roles.',
    action: { label: 'See what CTSoc covers', to: '#why-ctsoc' },
  },
];

export const whyIeee = [
  {
    icon: 'globe',
    title: 'Global network',
    text: 'Connect with IEEE members and technical communities worldwide.',
  },
  {
    icon: 'book',
    title: 'Technical resources',
    text: 'Access IEEE technical information, publications and learning resources.',
  },
  {
    icon: 'trend',
    title: 'Professional growth',
    text: 'Build professional knowledge, connections and leadership experience.',
  },
  {
    icon: 'calendar',
    title: 'Events and conferences',
    text: 'Explore technical events, conferences, workshops and community opportunities.',
  },
];

export const whyCtsoc = [
  {
    icon: 'layers',
    title: 'Consumer technology',
    text: 'Products, services, systems and architectures made for consumers: the society’s home ground.',
  },
  {
    icon: 'spark',
    title: 'Artificial intelligence',
    text: 'AI and machine learning as they are applied in consumer devices and services.',
  },
  {
    icon: 'device',
    title: 'Smart devices',
    text: 'Phones, wearables and the connected devices people use every day.',
  },
  {
    icon: 'cpu',
    title: 'Emerging technologies',
    text: 'New technology on its way into consumer products, and the standards around it.',
  },
  {
    icon: 'book',
    title: 'Research and publications',
    text: 'Electronic access to the society’s magazine, transactions, newsletter and digital library.',
  },
  {
    icon: 'nodes',
    title: 'Technical networking',
    text: 'Meet students, researchers and engineers who work on consumer technology.',
  },
  {
    icon: 'calendar',
    title: 'Conferences',
    text: 'News of the society’s conferences, meetings and special events.',
  },
  {
    icon: 'flag',
    title: 'Leadership and community',
    text: 'Student chapters like this one are run by members, with roles to take on.',
  },
];

// yes: a tick.  no: a dash.  Text is shown as written.
export const membershipComparison = {
  columns: ['IEEE Student', 'IEEE CTSoc Student'],
  rows: [
    { label: 'Global IEEE community', values: ['yes', 'Included through IEEE'] },
    { label: 'Technical community', values: ['yes', 'yes'] },
    { label: 'IEEE resources', values: ['yes', 'yes'] },
    { label: 'CTSoc resources', values: ['no', 'yes'] },
    { label: 'CTSoc events and activities', values: ['no', 'yes'] },
    { label: 'Technical networking', values: ['yes', 'yes'] },
    { label: 'Publications and digital resources', values: ['IEEE benefits', 'CTSoc benefits'] },
  ],
};
