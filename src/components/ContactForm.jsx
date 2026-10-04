import { useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { site } from '../data/site';
import Button from './Button';
import Icon from './Icon';
import './ContactForm.css';

const ENDPOINT = '/api/contact';

const empty = { name: '', email: '', phone: '', subject: '', message: '', company: '' };

const limits = { name: 80, email: 120, phone: 20, subject: 120, message: 3000 };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Enter your name.';
  if (!values.email.trim()) errors.email = 'Enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
    errors.email = 'That email address does not look right. Check it and try again.';
  if (values.phone.trim() && !/^[+()\d\s-]{7,20}$/.test(values.phone.trim()))
    errors.phone = 'Use digits only, with an optional country code.';
  if (!values.subject.trim()) errors.subject = 'Add a short subject.';
  if (values.message.trim().length < 10) errors.message = 'Write a message of at least 10 characters.';
  return errors;
}

/**
 * Contact form. It posts to the site's own server (/api/contact), which
 * sends the email. No mail credentials exist in this file or anywhere in
 * the browser bundle. Success is shown only when the server confirms the
 * message was accepted for delivery.
 */
export default function ContactForm() {
  const id = useId();
  const location = useLocation();
  const formRef = useRef(null);
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle'); // idle | sending | sent | failed
  const [failure, setFailure] = useState('');

  const update = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  async function onSubmit(event) {
    event.preventDefault();
    if (state === 'sending') return;

    const found = validate(values);
    setErrors(found);
    const firstInvalid = Object.keys(found)[0];
    if (firstInvalid) {
      formRef.current?.querySelector(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setState('sending');
    setFailure('');

    try {
      const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
          company: values.company, // honeypot, stays empty for real visitors
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
        return;
      }

      if (payload?.fields) setErrors(payload.fields);
      setFailure(
        payload?.error ??
          (response.status === 404
            ? 'The message service is not running on this server.'
            : 'The server could not send your message.'),
      );
      setState('failed');
    } catch {
      setFailure('Could not reach the server. Check your connection and try again.');
      setState('failed');
    }
  }

  function reset() {
    setValues(empty);
    setErrors({});
    setFailure('');
    setState('idle');
  }

  const field = (name) => ({
    id: `${id}-${name}`,
    name,
    value: values[name],
    onChange: update(name),
    maxLength: limits[name],
    'aria-invalid': errors[name] ? 'true' : undefined,
    'aria-describedby': errors[name] ? `${id}-${name}-error` : undefined,
  });

  const error = (name) =>
    errors[name] ? (
      <p className="form__error" id={`${id}-${name}-error`}>
        {errors[name]}
      </p>
    ) : null;

  return (
    <div className="form-shell">
      <AnimatePresence mode="wait" initial={false}>
        {state === 'sent' ? (
          <motion.div
            key="sent"
            className="form-done"
            role="status"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <span className="form-done__icon">
              <Icon name="check" />
            </span>
            <h2 className="h3">Message sent</h2>
            <p className="muted">
              Your query has gone to {site.email}. Replies will come to {values.email.trim()}.
            </p>
            <Button variant="secondary" size="sm" onClick={reset}>
              Send another message
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            ref={formRef}
            className="form"
            onSubmit={onSubmit}
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="form__row">
              <div className="form__field">
                <label htmlFor={`${id}-name`}>Name</label>
                <input type="text" autoComplete="name" required {...field('name')} />
                {error('name')}
              </div>
              <div className="form__field">
                <label htmlFor={`${id}-email`}>Email</label>
                <input type="email" autoComplete="email" inputMode="email" required {...field('email')} />
                {error('email')}
              </div>
            </div>

            <div className="form__row">
              <div className="form__field">
                <label htmlFor={`${id}-phone`}>
                  Phone <span className="form__optional">optional</span>
                </label>
                <input type="tel" autoComplete="tel" inputMode="tel" {...field('phone')} />
                {error('phone')}
              </div>
              <div className="form__field">
                <label htmlFor={`${id}-subject`}>Subject</label>
                <input type="text" required {...field('subject')} />
                {error('subject')}
              </div>
            </div>

            <div className="form__field">
              <label htmlFor={`${id}-message`}>Message</label>
              <textarea rows={6} required {...field('message')} />
              {error('message')}
            </div>

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
                onChange={update('company')}
              />
            </div>

            {state === 'failed' ? (
              <div className="form__alert" role="alert">
                <Icon name="alert" />
                <div>
                  <p>
                    <strong>Your message was not sent.</strong> {failure}
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

            <div className="form__actions">
              <button type="submit" className="btn" disabled={state === 'sending'} aria-busy={state === 'sending'}>
                {state === 'sending' ? (
                  <>
                    <span className="form__spinner" aria-hidden="true" />
                    <span>Sending</span>
                  </>
                ) : (
                  <>
                    <span>{state === 'failed' ? 'Try again' : 'Send message'}</span>
                    <Icon name="arrow" />
                  </>
                )}
              </button>
              <p className="small muted">Your details are used only to reply to this query.</p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
