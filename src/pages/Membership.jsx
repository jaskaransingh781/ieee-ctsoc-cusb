import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Button, { ExternalLink } from '../components/Button';
import ChapterJoin from '../components/ChapterJoin';
import Icon from '../components/Icon';
import { ReachButtons } from '../components/Reach';
import Reveal from '../components/Reveal';
import {
  chapterPoints,
  cuimsWalkthrough,
  formatInr,
  formatPercent,
  formatUsd,
  getMembershipTotals,
  membershipComparison,
  membershipKinds,
  membershipLinks,
  membershipPricing,
  membershipSteps,
  whyCtsoc,
  whyIeee,
} from '../data/membership';
import { resolveImage } from '../lib/assets';
import { useNow } from '../lib/countdown';
import { formatDate } from '../lib/format';
import { usePageTitle } from '../lib/hooks';
import { useLiveRate } from '../lib/live';
import './Membership.css';

const ease = [0.22, 1, 0.36, 1];
const number = (index) => String(index + 1).padStart(2, '0');

/** Scrolls to a section of this page, clear of the sticky navbar. */
function scrollToId(id) {
  const target = document.getElementById(id);
  if (!target) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

/** Which of the two parts of the page is on screen: 'paid' or 'chapter'. */
function useVisiblePart(ids) {
  const [visible, setVisible] = useState(null);
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setVisible(entry.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    ids.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [ids]);
  return visible;
}

const PARTS = ['paid', 'chapter'];

/** The band that opens each of the two parts of the page. */
function PartHead({ kind, index }) {
  return (
    <header className="container mpart__head">
      <span className="mpart__num" aria-hidden="true">
        {number(index)}
      </span>
      <div>
        <p className="mpart__tag">
          <span className="mpart__tag-dot" aria-hidden="true" />
          {kind.tag}
        </p>
        <h2 className="h1 mpart__title" id={`${kind.id}-title`}>
          {kind.title}
        </h2>
        <p className="lead mpart__text">{kind.text}</p>
      </div>
    </header>
  );
}

/** "Half-year pricing: 50% off until 15 August 2027", when a discount is running. */
function OfferLine({ discount }) {
  if (!discount) return null;
  return (
    <p className="mplan__offer">
      <span>{discount.percentOff}% off</span>
      {discount.label}
      {discount.to ? `, until ${formatDate(discount.to)}` : ''}
    </p>
  );
}

/** Dues before tax, with the usual price struck through while a discount runs. */
function Dues({ price }) {
  return (
    <>
      {price.discount ? <s className="mplan__was">{formatUsd(price.listUsd)}</s> : null}
      {formatUsd(price.baseUsd)}
    </>
  );
}

/** USD | INR switch. */
function CurrencySwitch({ value, onChange }) {
  return (
    <div className="mswitch" role="group" aria-label="Show prices in">
      {['INR', 'USD'].map((code) => (
        <button
          key={code}
          type="button"
          className={`mswitch__option ${value === code ? 'is-on' : ''}`}
          aria-pressed={value === code}
          onClick={() => onChange(code)}
        >
          {value === code ? (
            <motion.span
              layoutId="mswitch-thumb"
              className="mswitch__thumb"
              transition={{ type: 'spring', stiffness: 520, damping: 38 }}
            />
          ) : null}
          <span>{code}</span>
        </button>
      ))}
    </div>
  );
}

/**
 * A price in the chosen currency, with the other currency underneath.
 * INR figures always carry "≈" because they are a conversion, not a quote.
 */
function Price({ usd, inr, currency, approxUsd = false, className = '' }) {
  const main = currency === 'INR' ? `≈ ${formatInr(inr)}` : `${approxUsd ? '≈ ' : ''}${formatUsd(usd)}`;
  const other = currency === 'INR' ? `${approxUsd ? '≈ ' : ''}${formatUsd(usd)}` : `≈ ${formatInr(inr)}`;

  return (
    <div className={`mprice ${className}`.trim()}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.p
          key={main}
          className="mprice__main"
          initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -14, filter: 'blur(6px)' }}
          transition={{ duration: 0.34, ease }}
        >
          {main}
        </motion.p>
      </AnimatePresence>
      <p className="mprice__other">{other}</p>
    </div>
  );
}

/** The two membership cards drawn in the hero. Decorative. */
function HeroCards() {
  const reduce = useReducedMotion();
  const from = (rotate, y) => (reduce ? false : { opacity: 0, y, rotate });

  return (
    <div className="mart" aria-hidden="true">
      <span className="mart__glow" />
      <motion.div
        className="mcard mcard--ieee"
        initial={from(-14, 40)}
        animate={{ opacity: 1, y: 0, rotate: -7 }}
        transition={{ duration: 0.9, ease, delay: 0.15 }}
      >
        <div className="mcard__top">
          <span className="mcard__step">Step 1</span>
          <span className="mcard__chip" />
        </div>
        <p className="mcard__name">
          IEEE
          <br />
          Student Member
        </p>
        <div className="mcard__foot">
          <span>Global professional community</span>
        </div>
      </motion.div>

      <motion.div
        className="mcard mcard--ctsoc"
        initial={from(14, 60)}
        animate={{ opacity: 1, y: 0, rotate: 5 }}
        transition={{ duration: 0.9, ease, delay: 0.3 }}
      >
        <div className="mcard__top">
          <span className="mcard__step">Step 2</span>
          <span className="mcard__chip" />
        </div>
        <p className="mcard__name">
          IEEE CTSoc
          <br />
          Student Member
        </p>
        <div className="mcard__foot">
          <span>Technology + innovation</span>
        </div>
      </motion.div>
    </div>
  );
}

/** "What am I actually paying for?" */
function Breakdown({ totals }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const { ieee, ctsoc, combined } = totals;

  const rows = [
    ['IEEE Student Membership', formatUsd(ieee.baseUsd)],
    ['IEEE CTSoc Student Membership', formatUsd(ctsoc.baseUsd)],
    ['GST', formatPercent(ieee.taxRate)],
    ['Estimated tax', formatUsd(combined.tax)],
    ['Estimated total', formatUsd(combined.totalUsd)],
    ['Indicative INR', `≈ ${formatInr(combined.totalInr)}`],
  ];

  return (
    <div className={`mbreak ${open ? 'is-open' : ''}`}>
      <h3 className="mbreak__heading">
        <button
          type="button"
          className="mbreak__button"
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-button`}
          onClick={() => setOpen((value) => !value)}
        >
          <span>What am I actually paying for?</span>
          <span className="mbreak__icon">
            <Icon name="chevronDown" />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={`${id}-panel`}
            role="region"
            aria-labelledby={`${id}-button`}
            className="mbreak__panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.34, ease }}
          >
            <div className="mbreak__inner">
              <dl className="mbreak__rows">
                {rows.map(([label, value], index) => (
                  <div key={label} className={index >= 4 ? 'is-total' : ''}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mbreak__notes">
                <p>
                  Pricing shown on this website is for guidance. IEEE’s official checkout determines the final
                  payable amount, including applicable tax and currency conversion.
                </p>
                <p>
                  Paying by UPI? IEEE’s checkout shows the total in USD, the matching amount in INR and the
                  conversion rate it used. That rate already includes the UPI provider’s currency conversion fee.{' '}
                  <ExternalLink href={membershipLinks.indiaFaq}>IEEE India FAQs</ExternalLink>
                </p>
                <p>
                  Dues can also differ with your member profile and the time of year.{' '}
                  <ExternalLink href={membershipLinks.dues}>IEEE’s dues page</ExternalLink>
                </p>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function CompareCell({ value }) {
  if (value === 'yes') {
    return (
      <span className="mtable__yes">
        <Icon name="check" />
        <span className="visually-hidden">Yes</span>
      </span>
    );
  }
  if (value === 'no') {
    return (
      <span className="mtable__no">
        <Icon name="minus" />
        <span className="visually-hidden">Not included</span>
      </span>
    );
  }
  return <span className="mtable__text">{value}</span>;
}

export default function Membership() {
  usePageTitle('Membership');
  const [currency, setCurrency] = useState('INR');
  // Prices follow the clock (a listed discount starts and ends by date) and
  // the day's exchange rate, when the server has one.
  const now = useNow(60_000);
  const liveRate = useLiveRate();
  const rate = liveRate?.ok && Number.isFinite(liveRate.rate) ? liveRate : null;
  const totals = getMembershipTotals(membershipPricing, { usdToInr: rate?.rate, now });
  const { ieee, ctsoc, combined, usdToInr } = totals;
  const walkthrough = cuimsWalkthrough.steps;
  const visiblePart = useVisiblePart(PARTS);
  const { paid, chapter } = membershipKinds;
  const discount = ieee.discount ?? ctsoc.discount;
  const saving = Math.round((combined.listSubtotal - combined.subtotal) * 100) / 100;
  const costOf = { paidCost: `≈ ${formatInr(combined.totalInr)} (${formatUsd(combined.totalUsd)}) a year for both, with tax` };

  return (
    <>
      {/* ----------------------------------------------------------- Hero */}
      <header className="container mhero">
        <div className="mhero__text">
          <p className="mhero__eyebrow">
            <span className="mhero__eyebrow-dot" aria-hidden="true" />
            IEEE CTSoc | CUSB
          </p>
          <h1 className="display mhero__title">
            <span>Become a Member.</span> <span className="mhero__accent">Build What’s Next.</span>
          </h1>
          <p className="lead mhero__lead">
            Join IEEE. Connect with a global technology community. Then take your next step with IEEE Consumer
            Technology Society.
          </p>
          <div className="mhero__actions">
            <Button href={membershipLinks.ieee} icon="out">
              Join IEEE
            </Button>
            <Button variant="secondary" icon="arrow" onClick={() => scrollToId('why-ctsoc')}>
              Explore CTSoc
            </Button>
          </div>
          <p className="mhero__path" aria-label="Join IEEE, then add IEEE CTSoc, then become part of the community">
            <span>Join IEEE</span>
            <Icon name="arrow" />
            <span>Add IEEE CTSoc</span>
            <Icon name="arrow" />
            <span>Become part of the community</span>
          </p>
        </div>
        <HeroCards />
      </header>

      {/* --------------------------------------- The two kinds, side by side */}
      <section className="container mkinds" aria-labelledby="kinds-title">
        <div className="mkinds__head">
          <h2 className="h2" id="kinds-title">
            Two kinds of membership
          </h2>
          <p className="muted">They are separate. You can hold one, or both.</p>
        </div>
        <div className="mkinds__grid">
          {[paid, chapter].map((kind, index) => (
            <Reveal as="article" className={`mkind mkind--${kind.id}`} key={kind.id} delay={index * 0.08}>
              <span className="mkind__light" aria-hidden="true" />
              <div className="mkind__top">
                <span className="mkind__num" aria-hidden="true">
                  {number(index)}
                </span>
                <span className="mkind__tag">{kind.tag}</span>
              </div>
              <h3 className="mkind__title">{kind.title}</h3>
              <p className="mkind__text">{kind.text}</p>
              <dl className="mkind__rows">
                {membershipKinds.rows.map((row) => (
                  <div key={row.label}>
                    <dt>{row.label}</dt>
                    <dd>{costOf[row[kind.id]] ?? row[kind.id]}</dd>
                  </div>
                ))}
              </dl>
              <button type="button" className="mkind__button" onClick={() => scrollToId(kind.id)}>
                <span>{kind.button}</span>
                <Icon name="arrow" />
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Stays under the navbar while either part is on screen */}
      <nav className="mnav" aria-label="Kinds of membership">
        <div className="mnav__pill">
          {[paid, chapter].map((kind) => (
            <button
              key={kind.id}
              type="button"
              className={`mnav__option mnav__option--${kind.id} ${visiblePart === kind.id ? 'is-on' : ''}`}
              aria-current={visiblePart === kind.id ? 'true' : undefined}
              onClick={() => scrollToId(kind.id)}
            >
              <span className="mnav__dot" aria-hidden="true" />
              <span className="mnav__label">{kind.label}</span>
              <span className="mnav__tag">{kind.tag}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ============================================================
          PART 1: IEEE and IEEE CTSoc membership (paid to IEEE)
          ============================================================ */}
      <div className="mpart mpart--paid" id="paid" role="region" aria-labelledby="paid-title">
      <PartHead kind={paid} index={0} />

      {/* -------------------------------------------------------- Pricing */}
      <section className="container mplans" aria-labelledby="plans-title">
        <div className="mplans__stage">
          <span className="mplans__light mplans__light--a" aria-hidden="true" />
          <span className="mplans__light mplans__light--b" aria-hidden="true" />

          <div className="mplans__head">
            <div>
              <h3 className="h2" id="plans-title">
                Choose your membership
              </h3>
              <p className="muted">
                Student dues, with tax worked out for you. IEEE comes first; IEEE CTSoc is added to it.
              </p>
            </div>
            <div className="mplans__switch">
              <CurrencySwitch value={currency} onChange={setCurrency} />
              <p className={`mplans__rate ${rate ? 'is-live' : ''}`}>
                1 USD ≈ ₹{usdToInr.toFixed(2)}
                <span>
                  {rate ? <i className="mplans__live" aria-hidden="true" /> : null}
                  {rate
                    ? `Live rate, ${formatDate(rate.date)}`
                    : `${membershipPricing.currencySource}, ${formatDate(membershipPricing.rateDate)}`}
                </span>
              </p>
            </div>
          </div>

          <div className="mplans__grid">
            <Reveal as="article" className="mplan">
              <div className="mplan__top">
                <span className="mplan__badge">Global professional community</span>
                <span className="mplan__step">Step 1</span>
              </div>
              <h3 className="mplan__title">IEEE Student Membership</h3>
              <OfferLine discount={ieee.discount} />

              <dl className="mplan__lines">
                <div>
                  <dt>Current listed dues</dt>
                  <dd>
                    <Dues price={ieee} />
                  </dd>
                </div>
                <div>
                  <dt>+ {formatPercent(ieee.taxRate)} GST</dt>
                  <dd>{formatUsd(ieee.tax)}</dd>
                </div>
              </dl>

              <Price usd={ieee.totalUsd} inr={ieee.totalInr} currency={currency} />
              <p className="mplan__tag">Indicative INR price</p>
              <p className="mplan__note">
                Final INR amount may vary because IEEE checkout applies its own conversion rate/payment conversion
                fee.
              </p>

              <div className="mplan__cta">
                <Button href={membershipLinks.ieee} icon="out" block>
                  Join IEEE
                </Button>
              </div>
            </Reveal>

            <Reveal as="article" className="mplan mplan--ctsoc" delay={0.08}>
              <div className="mplan__top">
                <span className="mplan__badge">Technology + innovation</span>
                <span className="mplan__step">Step 2</span>
              </div>
              <h3 className="mplan__title">IEEE CTSoc Student Membership</h3>
              <OfferLine discount={ctsoc.discount} />

              <dl className="mplan__lines">
                <div>
                  <dt>Current listed dues</dt>
                  <dd>
                    <Dues price={ctsoc} />
                  </dd>
                </div>
                <div>
                  <dt>+ applicable tax</dt>
                  <dd>≈ {formatUsd(ctsoc.tax)}</dd>
                </div>
              </dl>

              <Price usd={ctsoc.totalUsd} inr={ctsoc.totalInr} currency={currency} approxUsd />
              <p className="mplan__tag">Indicative</p>
              <p className="mplan__note">
                CTSoc pricing can depend on your member profile, your country and IEEE checkout. It is added to an
                IEEE membership, so join IEEE first.
              </p>

              <div className="mplan__cta">
                <Button href={membershipLinks.ctsoc} icon="out" block>
                  Join IEEE CTSoc
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------------------------------- The complete membership */}
      <section className="container mcomplete-wrap" aria-labelledby="complete-title">
        <Reveal className="mcomplete">
          <span className="mcomplete__rings" aria-hidden="true" />
          <div className="mcomplete__left">
            <h3 className="h2 mcomplete__title" id="complete-title">
              The Complete Membership
            </h3>
            <dl className="mcomplete__rows">
              <div>
                <dt>IEEE Student</dt>
                <dd>{formatUsd(ieee.listUsd)}</dd>
              </div>
              <div>
                <dt>CTSoc Student</dt>
                <dd>{formatUsd(ctsoc.listUsd)}</dd>
              </div>
              {discount && saving > 0 ? (
                <div className="is-saving">
                  <dt>
                    {discount.label} ({discount.percentOff}% off)
                  </dt>
                  <dd>−{formatUsd(saving)}</dd>
                </div>
              ) : null}
              <div className="is-sum">
                <dt>Subtotal</dt>
                <dd>{formatUsd(combined.subtotal)}</dd>
              </div>
              <div>
                <dt>GST / applicable tax ({formatPercent(ieee.taxRate)})</dt>
                <dd>{formatUsd(combined.tax)}</dd>
              </div>
            </dl>
          </div>

          <div className="mcomplete__right">
            <p className="mcomplete__label">Indicative total</p>
            <Price
              usd={combined.totalUsd}
              inr={combined.totalInr}
              currency={currency}
              approxUsd
              className="mprice--light"
            />
            <p className="mcomplete__note">
              Indicative total based on current listed dues and {formatPercent(ieee.taxRate)} GST. Final amount is
              determined by IEEE checkout.
            </p>
            <Button href={membershipLinks.ieee} icon="out" className="btn--light">
              Start with IEEE
            </Button>
          </div>
        </Reveal>

        <Breakdown totals={totals} />
        <p className="mcomplete__updated small muted">
          {rate
            ? `The exchange rate is looked up every day (${rate.source}). `
            : `Exchange rate saved on ${formatDate(membershipPricing.rateDate)}. `}
          Dues last checked {formatDate(membershipPricing.lastUpdated)}. Final amount confirmed at IEEE checkout.
        </p>
      </section>

      {/* ------------------------------------------- How membership works */}
      <section className="section" aria-labelledby="steps-title">
        <div className="container">
          <div className="section-head">
            <div className="section-head__text">
              <h3 className="h2" id="steps-title">
                How membership works
              </h3>
              <p className="muted">Three steps, in this order.</p>
            </div>
          </div>

          <ol className="msteps">
            {membershipSteps.map((step, index) => (
              <Reveal as="li" className="mstep" key={step.title} delay={index * 0.1}>
                <div className="mstep__rail" aria-hidden="true">
                  <span className="mstep__node" />
                  <motion.span
                    className="mstep__line"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true, margin: '0px 0px -15% 0px' }}
                    transition={{ duration: 0.9, ease, delay: 0.2 + index * 0.25 }}
                  />
                </div>
                <span className="mstep__num" aria-hidden="true">
                  {number(index)}
                </span>
                <h3 className="mstep__title">{step.title}</h3>
                <p className="muted">{step.text}</p>
                {step.action.link ? (
                  <ExternalLink href={membershipLinks[step.action.link]} className="more-link mstep__link">
                    {step.action.label}
                    <Icon name="out" />
                  </ExternalLink>
                ) : (
                  <button
                    type="button"
                    className="more-link mstep__link"
                    onClick={() => scrollToId(step.action.to.replace('#', ''))}
                  >
                    {step.action.label}
                    <Icon name="arrow" />
                  </button>
                )}
              </Reveal>
            ))}
          </ol>

          <div className="msteps__cta">
            <Button href={membershipLinks.ieee} icon="arrow">
              Start Your Membership
            </Button>
            <p className="small muted">Opens IEEE’s own join page. Choose “Student” there.</p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Why IEEE */}
      <section className="section section--tint" aria-labelledby="why-ieee-title">
        <div className="container">
          <div className="section-head">
            <div className="section-head__text">
              <h3 className="h2" id="why-ieee-title">
                Why IEEE?
              </h3>
              <p className="muted">What a student membership opens up.</p>
            </div>
          </div>
          <Reveal as="ul" className="mwhy">
            {whyIeee.map((item) => (
              <li className="mwhy__card" key={item.title}>
                <span className="mwhy__icon">
                  <Icon name={item.icon} />
                </span>
                <h3 className="h3">{item.title}</h3>
                <p className="muted">{item.text}</p>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ Why CTSoc */}
      <section className="section mctsoc" id="why-ctsoc" aria-labelledby="why-ctsoc-title">
        <div className="container">
          <div className="section-head">
            <div className="section-head__text">
              <h3 className="h2" id="why-ctsoc-title">
                Why IEEE Consumer Technology Society?
              </h3>
              <p className="mctsoc__line">Where Technology Meets Innovation.</p>
            </div>
            <ExternalLink href={membershipLinks.ctsocInfo} className="more-link">
              CTSoc membership on ieee.org
              <Icon name="out" />
            </ExternalLink>
          </div>
          <Reveal as="ul" className="mtiles">
            {whyCtsoc.map((item) => (
              <li className="mtile" key={item.title}>
                <span className="mtile__icon">
                  <Icon name={item.icon} />
                </span>
                <div>
                  <h3 className="mtile__title">{item.title}</h3>
                  <p className="muted">{item.text}</p>
                </div>
              </li>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------- Comparison */}
      <section className="section section--tight" aria-labelledby="compare-title">
        <div className="container">
          <div className="section-head">
            <div className="section-head__text">
              <h3 className="h2" id="compare-title">
                What each membership covers
              </h3>
            </div>
          </div>
          <Reveal className="mtable-wrap">
            <table className="mtable">
              <thead>
                <tr>
                  <td />
                  {membershipComparison.columns.map((column) => (
                    <th scope="col" key={column}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {membershipComparison.rows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {row.values.map((value, index) => (
                      <td key={membershipComparison.columns[index]}>
                        <CompareCell value={value} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------------ Final CTA */}
      <section className="section" aria-labelledby="ready-title">
        <div className="container">
          <Reveal className="cta mready">
            <svg className="cta__trace" viewBox="0 0 520 260" aria-hidden="true" focusable="false">
              <path d="M520 60H400l-36 36H250" />
              <path d="M520 130h-70l-30 30h-90" />
              <path d="M520 210H420l-34-34h-60" />
              <circle cx="244" cy="96" r="6" />
              <circle cx="324" cy="160" r="6" />
              <circle className="cta__dot" cx="320" cy="176" r="5" />
            </svg>
            <h3 id="ready-title" className="h2 cta__title">
              Ready to Join?
            </h3>
            <p className="lead cta__lead">Start with IEEE. Take the next step with CTSoc.</p>
            <div className="cta__actions">
              <Button href={membershipLinks.ieee} icon="out">
                Join IEEE
              </Button>
              <Button href={membershipLinks.ctsoc} variant="secondary" icon="out">
                Join CTSoc
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
      </div>

      {/* ============================================================
          PART 2: IEEE CTSoc CUSB chapter membership (free, through CUIMS)
          ============================================================ */}
      <div className="mpart mpart--chapter theme-chapter" id="chapter" role="region" aria-labelledby="chapter-title">
        <PartHead kind={chapter} index={1} />

        <section className="container mchapter" aria-label="What chapter membership is for">
          <Reveal as="ul" className="mchapter__points">
            {chapterPoints.map((point) => (
              <li className="mchapter__point" key={point.title}>
                <span className="mchapter__icon">
                  <Icon name={point.icon} />
                </span>
                <div>
                  <h3 className="mchapter__point-title">{point.title}</h3>
                  <p className="muted">{point.text}</p>
                </div>
              </li>
            ))}
          </Reveal>
        </section>

      {/* ----------------------------------------------- CUIMS walkthrough */}
      {walkthrough.length ? (
        <section className="section section--tight" aria-labelledby="cuims-title">
          <div className="container">
            <div className="section-head">
              <div className="section-head__text">
                <h3 className="h2" id="cuims-title">
                  {cuimsWalkthrough.title}
                </h3>
                <p className="muted">{cuimsWalkthrough.intro}</p>
              </div>
            </div>
            <ol className="mcuims">
              {walkthrough.map((step, index) => {
                const image = resolveImage(step.image);
                return (
                  <li className="mcuims__step" key={step.title}>
                    <span className="mstep__num" aria-hidden="true">
                      {number(index)}
                    </span>
                    <div>
                      <h3 className="h3">{step.title}</h3>
                      {step.text ? <p className="muted">{step.text}</p> : null}
                      {image ? <img src={image} alt={`Screenshot: ${step.title}`} loading="lazy" /> : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------- Chapter registration */}
      <section className="section section--tint mjoin" aria-labelledby="join-title">
        <div className="container">
          <ChapterJoin as="h3" />
          <div className="mchapter__reach">
            <p>Follow the chapter and join the community:</p>
            <ReachButtons size="sm" />
          </div>
        </div>
      </section>

      </div>
    </>
  );
}
