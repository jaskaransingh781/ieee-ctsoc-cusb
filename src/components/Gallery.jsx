import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { resolveImage } from '../lib/assets';
import { useScrollLock } from '../lib/hooks';
import Icon from './Icon';
import './Gallery.css';

const ease = [0.22, 1, 0.36, 1];

/**
 * Photo grid with a full-screen viewer.
 *
 * Photos whose file cannot be found or fails to load are left out, and if
 * none are left the whole block (heading included) renders nothing, so a
 * page never shows a broken image or an empty frame.
 */
export default function Gallery({ photos = [], title, note, headingLevel = 2 }) {
  const [failed, setFailed] = useState(() => new Set());
  const [active, setActive] = useState(null);

  const items = useMemo(
    () =>
      photos
        .map((photo) => ({ ...photo, url: resolveImage(photo.src), fullUrl: resolveImage(photo.full ?? photo.src) }))
        .filter((photo) => photo.url && !failed.has(photo.id)),
    [photos, failed],
  );

  const markFailed = useCallback((id) => {
    setFailed((current) => new Set(current).add(id));
  }, []);

  if (!items.length) return null;

  const Heading = `h${headingLevel}`;
  const credits = [...new Set(items.map((photo) => photo.credit).filter(Boolean))];

  return (
    <div className="gallery">
      {title ? (
        <div className="gallery__head">
          <Heading className="gallery__title">{title}</Heading>
          {note || credits.length ? (
            <p className="small muted">{note ?? `Photographs: ${credits.join(', ')}`}</p>
          ) : null}
        </div>
      ) : null}

      <ul className={`gallery__grid gallery__grid--${Math.min(items.length, 4)}`}>
        {items.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              className="gallery__tile"
              onClick={() => setActive(index)}
              aria-label={`Open photograph: ${photo.caption ?? photo.alt}`}
            >
              <img
                src={photo.url}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                onError={() => markFailed(photo.id)}
              />
              <span className="gallery__caption">
                <span>{photo.caption}</span>
                <Icon name="expand" />
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {active !== null && items[active] ? (
          <Lightbox items={items} index={active} onIndex={setActive} onClose={() => setActive(null)} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function Lightbox({ items, index, onIndex, onClose }) {
  const closeRef = useRef(null);
  const lastFocused = useRef(null);
  const photo = items[index];
  const many = items.length > 1;

  useScrollLock(true);

  const step = useCallback(
    (delta) => onIndex((index + delta + items.length) % items.length),
    [index, items.length, onIndex],
  );

  useEffect(() => {
    lastFocused.current = document.activeElement;
    closeRef.current?.focus();
    return () => lastFocused.current?.focus?.();
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && many) step(1);
      if (event.key === 'ArrowLeft' && many) step(-1);
      if (event.key === 'Tab') {
        // Keep keyboard focus inside the viewer.
        const focusable = document.querySelectorAll('.lightbox button');
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [many, onClose, step]);

  return createPortal(
    <motion.div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Photograph viewer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="lightbox__bar">
        <p className="lightbox__count" aria-live="polite">
          {index + 1} of {items.length}
        </p>
        <button type="button" ref={closeRef} className="lightbox__btn" onClick={onClose} aria-label="Close viewer">
          <Icon name="close" />
        </button>
      </div>

      <div className="lightbox__stage" onClick={(event) => event.target === event.currentTarget && onClose()}>
        {many ? (
          <button
            type="button"
            className="lightbox__btn lightbox__nav lightbox__nav--prev"
            onClick={() => step(-1)}
            aria-label="Previous photograph"
          >
            <Icon name="chevronLeft" />
          </button>
        ) : null}

        <AnimatePresence mode="wait" initial={false}>
          <motion.figure
            key={photo.id}
            className="lightbox__figure"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease }}
          >
            <img src={photo.fullUrl} alt={photo.alt} />
            <figcaption>
              <strong>{photo.caption}</strong>
              <span>{photo.alt}</span>
            </figcaption>
          </motion.figure>
        </AnimatePresence>

        {many ? (
          <button
            type="button"
            className="lightbox__btn lightbox__nav lightbox__nav--next"
            onClick={() => step(1)}
            aria-label="Next photograph"
          >
            <Icon name="chevronRight" />
          </button>
        ) : null}
      </div>
    </motion.div>,
    document.body,
  );
}
