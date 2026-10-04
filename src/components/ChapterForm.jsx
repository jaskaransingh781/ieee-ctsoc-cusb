import { useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  OTHER_INTEREST,
  emptyRegistration,
  fields,
  registrationCopy as copy,
  steps,
  toSubmission,
  validateRegistration,
} from '../data/registration';
import { site } from '../data/site';
import Button from './Button';
import Icon from './Icon';
import { ReachButtons } from './Reach';
import './ContactForm.css';
import './ChapterForm.css';

// The site's own server. It checks the answers again and emails them to the
// chapter inbox. There is no database: nothing is stored on the website.
const ENDPOINT = '/api/contact';

const ease = [0.22, 1, 0.36, 1];
const number = (index) => String(index + 1).padStart(2, '0');

/**
 * Free chapter registration ("Join IEEE CTSoc | CUSB"), in three parts.
 * Every field and message comes from src/data/registration.js. Success is
 * shown only after the server confirms the email was accepted.
 */
export default function ChapterForm() {
  const id = useId();
  const location = useLocation();
  const shellRef = useRef(null);
  const [values, setValues] = useState(emptyRegistration);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0); // furthest step unlocked
  const [state, setState] = useState('idle'); // idle | sending | sent | failed
  const [failure, setFailure] = useState('');

  const current = steps[step];
  const last = step === steps.length - 1;

  const clearError = (name) => setErrors((found) => (found[name] ? { ...found, [name]: undefined } : found));

  const setValue = (name, value) => {
    setValues((all) => ({ ...all, [name]: value }));
    clearError(name);
  };

  const toggleInterest = (option) => {
    setValues((all) => ({
      ...all,
      interests: all.interests.includes(option)
        ? all.interests.filter((item) => item !== option)
        : [...all.interests, option],
    }));
    clearError('interests');
    if (option === OTHER_INTEREST) clearError('otherInterest');
  };

  /** Moves focus to the first field with an error, or to the top of the step. */
  const focusFirst = (found) => {
    requestAnimationFrame(() => {
      const first = Object.keys(found)[0];
      const target = first
        ? shellRef.current?.querySelector(`[data-field="${first}"]`)
        : shellRef.current?.querySelector('.cform__step-title');
      target?.focus({ preventScroll: false });
    });
  };

  const goTo = (index) => {
    setStep(index);
    setReached((value) => Math.max(value, index));
    focusFirst({});
  };

  const next = () => {
    const found = validateRegistration(values, current.fields);
    setErrors(found);
    if (Object.keys(found).length) return focusFirst(found);
    return goTo(step + 1);
  };

  async function onSubmit(event) {
    event.preventDefault();
    if (state === 'sending') return;
    if (!last) return next();

    // Check everything, and go back to the first part that needs attention.
    const found = validateRegistration(values);
    setErrors(found);
    const firstBad = Object.keys(found)[0];
    if (firstBad) {
      const owner = firstBad === 'otherInterest' ? 'interests' : firstBad;
      const index = steps.findIndex((part) => part.fields.includes(owner));
      if (index !== step) setStep(index);
      return focusFirst(found);
    }

    setState('sending');
    setFailure('');

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'chapter',
          ...toSubmission(values),
          sourcePage: `${window.location.origin}${location.pathname}`,
        }),
      });

      let payload = null;
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }

      if (response.ok && payload?.ok) {
        setState('sent');
        requestAnimationFrame(() => shellRef.current?.querySelector('.cdone__title')?.focus());
        return undefined;
      }

      if (payload?.fields) {
        setErrors(payload.fields);
        const firstField = Object.keys(payload.fields)[0];
        const owner = firstField === 'otherInterest' ? 'interests' : firstField;
        const index = steps.findIndex((part) => part.fields.includes(owner));
        if (index >= 0) setStep(index);
      }
      setFailure(
        payload?.error ??
          (response.status === 404
            ? 'The registration service is not running on this server.'
            : 'The server could not send your registration.'),
      );
      setState('failed');
    } catch {
      setFailure('Could not reach the server. Check your connection and try again.');
      setState('failed');
    }
    return undefined;
  }

  const errorOf = (name) =>
    errors[name] ? (
      <p className="form__error" id={`${id}-${name}-error`}>
        {errors[name]}
      </p>
    ) : null;

  const describe = (name) => ({
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `${id}-${name}-error` : undefined,
  });

  function renderField(name) {
    const field = fields[name];

    if (field.type === 'choice') {
      return (
        <fieldset className="cform__group" key={name}>
          <legend id={`${id}-${name}-legend`}>{field.label}</legend>
          <div className="cchoice" role="radiogroup" aria-labelledby={`${id}-${name}-legend`} {...describe(name)}>
            {field.options.map((option, index) => (
              <label className="cchoice__item" key={option.value}>
                <input
                  type="radio"
                  name={`${id}-${name}`}
                  value={option.value}
                  checked={values[name] === option.value}
                  onChange={() => setValue(name, option.value)}
                  data-field={index === 0 ? name : undefined}
                />
                <span className="cchoice__box">
                  <span className="cchoice__dot" aria-hidden="true" />
                  <span>
                    <strong>{option.value}</strong>
                    <small>{option.hint}</small>
                  </span>
                </span>
              </label>
            ))}
          </div>
          {errorOf(name)}
        </fieldset>
      );
    }

    if (field.type === 'multi') {
      const other = values.interests.includes(OTHER_INTEREST);
      return (
        <div key={name}>
          <div
            className="cchips"
            role="group"
            aria-label={field.label}
            aria-describedby={errors[name] ? `${id}-${name}-error` : undefined}
          >
            {field.options.map((option, index) => {
              const on = values.interests.includes(option);
              return (
                <button
                  type="button"
                  key={option}
                  className={`cchip ${on ? 'is-on' : ''}`}
                  aria-pressed={on}
                  onClick={() => toggleInterest(option)}
                  data-field={index === 0 ? name : undefined}
                >
                  <span className="cchip__mark" aria-hidden="true">
                    <Icon name={on ? 'check' : 'plus'} />
                  </span>
                  {option}
                </button>
              );
            })}
          </div>
          <p className="cform__count" aria-live="polite">
            {values.interests.length
              ? `${values.interests.length} selected`
              : 'Nothing selected yet'}
          </p>
          {errorOf(name)}

          <AnimatePresence initial={false}>
            {other ? (
              <motion.div
                className="form__field cform__other"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease }}
              >
                <label htmlFor={`${id}-otherInterest`}>{fields.otherInterest.label}</label>
                <input
                  id={`${id}-otherInterest`}
                  type="text"
                  value={values.otherInterest}
                  maxLength={fields.otherInterest.maxLength}
                  onChange={(event) => setValue('otherInterest', event.target.value)}
                  data-field="otherInterest"
                  {...describe('otherInterest')}
                />
                {errorOf('otherInterest')}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      );
    }

    const listId = field.type === 'combo' ? `${id}-${name}-list` : undefined;
    return (
      <div className="form__field" key={name}>
        <label htmlFor={`${id}-${name}`}>{field.label}</label>
        <input
          id={`${id}-${name}`}
          name={name}
          type={field.type === 'combo' ? 'text' : field.type}
          inputMode={field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : undefined}
          autoComplete={field.autoComplete ?? 'off'}
          autoCapitalize={field.uppercase ? 'characters' : undefined}
          spellCheck={field.type === 'text' && !field.uppercase ? undefined : false}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          list={listId}
          value={values[name]}
          onChange={(event) =>
            setValue(name, field.uppercase ? event.target.value.toUpperCase() : event.target.value)
          }
          data-field={name}
          {...describe(name)}
        />
        {listId ? (
          <datalist id={listId}>
            {field.options.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        ) : null}
        {errorOf(name)}
      </div>
    );
  }

  if (state === 'sent') {
    return (
      <div className="form-shell cform cdone" ref={shellRef} role="status">
        <span className="cdone__icon">
          <Icon name="check" />
        </span>
        <h3 className="cdone__title" tabIndex={-1}>
          {copy.success.title}
        </h3>
        <p className="cdone__text">{copy.success.text}</p>
        <p className="cdone__sent muted">
          Your details were emailed to the chapter team. They will write to {toSubmission(values).email}.
        </p>

        <div className="cdone__brand">
          <strong>{copy.success.brand}</strong>
          <span>{copy.success.tagline}</span>
        </div>

        <div className="cdone__actions">
          <Button to="/events" icon="arrow">
            {copy.success.eventsLabel}
          </Button>
          <ReachButtons />
        </div>
      </div>
    );
  }

  // Details and contact fields sit two to a row; the last odd one runs full width.
  const paired = current.fields.filter((name) => !['choice', 'multi'].includes(fields[name].type));
  const blocks = current.fields.filter((name) => ['choice', 'multi'].includes(fields[name].type));

  return (
    <div className="form-shell cform" ref={shellRef}>
      <p className="cform__name">{copy.formName}</p>

      <ol className="cprogress" aria-label="Registration steps">
        {steps.map((part, index) => {
          const done = index < step;
          const open = index <= reached;
          return (
            <li
              key={part.id}
              className={`cprogress__item ${index === step ? 'is-current' : ''} ${done ? 'is-done' : ''}`}
            >
              <button
                type="button"
                className="cprogress__button"
                onClick={() => goTo(index)}
                disabled={!open || state === 'sending'}
                aria-current={index === step ? 'step' : undefined}
              >
                <span className="cprogress__num" aria-hidden="true">
                  {done ? <Icon name="check" /> : number(index)}
                </span>
                <span className="cprogress__label">
                  <span className="visually-hidden">Step {index + 1}: </span>
                  {part.label}
                </span>
              </button>
              {index < steps.length - 1 ? <span className="cprogress__line" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>

      <form className="form" onSubmit={onSubmit} noValidate>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current.id}
            className="cform__step"
            initial={{ opacity: 0, x: 14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -14 }}
            transition={{ duration: 0.26, ease }}
          >
            <div className="cform__step-head">
              <span className="cform__step-num" aria-hidden="true">
                {number(step)}
              </span>
              <div>
                <h3 className="cform__step-title" tabIndex={-1}>
                  {current.title}
                </h3>
                <p className="muted">{current.text}</p>
              </div>
            </div>

            {paired.length ? <div className="cform__grid">{paired.map(renderField)}</div> : null}
            {blocks.map(renderField)}
          </motion.div>
        </AnimatePresence>

        {/* Honeypot: hidden from people, tempting to bots. */}
        <div className="form__trap" aria-hidden="true">
          <label htmlFor={`${id}-company`}>Company</label>
          <input
            id={`${id}-company`}
            name="company"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={values.company}
            onChange={(event) => setValues((all) => ({ ...all, company: event.target.value }))}
          />
        </div>

        {last ? (
          <div className="cfree">
            <p className="cfree__price">
              <strong>{copy.free.price}</strong>
              <span>{copy.free.label}</span>
            </p>
            <div>
              <p className="cfree__text">{copy.free.text}</p>
              <p className="cfree__note">{copy.free.note}</p>
            </div>
          </div>
        ) : null}

        {state === 'failed' ? (
          <div className="form__alert" role="alert">
            <Icon name="alert" />
            <div>
              <p>
                <strong>Your registration was not sent.</strong> {failure}
              </p>
              <p>
                You can also email{' '}
                <a className="text-link" href={`mailto:${site.email}`}>
                  {site.email}
                </a>{' '}
                directly.
              </p>
            </div>
          </div>
        ) : null}

        <div className="cform__nav">
          {step > 0 ? (
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => goTo(step - 1)}
              disabled={state === 'sending'}
            >
              <Icon name="back" />
              <span>Back</span>
            </button>
          ) : (
            <span />
          )}

          {last ? (
            <button type="submit" className="btn cform__submit" disabled={state === 'sending'} aria-busy={state === 'sending'}>
              {state === 'sending' ? (
                <>
                  <span className="form__spinner" aria-hidden="true" />
                  <span>Sending</span>
                </>
              ) : (
                <>
                  <span>{state === 'failed' ? 'Try again' : copy.submit}</span>
                  <Icon name="arrow" />
                </>
              )}
            </button>
          ) : (
            <button type="button" className="btn" onClick={next}>
              <span>Continue</span>
              <Icon name="arrow" />
            </button>
          )}
        </div>

        {last ? (
          <div className="cform__fine">
            <p>{copy.consent}</p>
            <p>{copy.handling}</p>
          </div>
        ) : null}
      </form>
    </div>
  );
}
