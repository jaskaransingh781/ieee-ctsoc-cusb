import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { getSocialLinks, site } from '../data/site';
import { resolveImage } from '../lib/assets';
import { useScrollLock, useScrolled } from '../lib/hooks';
import Button, { ExternalLink } from './Button';
import Icon from './Icon';
import './Navbar.css';

const ease = [0.22, 1, 0.36, 1];
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(8);
  const location = useLocation();
  const logo = resolveImage(site.logo);
  const navCta = { label: 'Sign up', to: '/signup' };

  useScrollLock(open);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    const onResize = () => window.innerWidth > 960 && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <header className={`nav ${scrolled || open ? 'nav--solid' : ''}`}>
      <div className="container nav__bar">
        <Link to="/" className="nav__brand" aria-label={`${site.name}, home`}>
          {logo ? (
            <img src={logo} alt={`${site.society}, ${site.branch}`} width="560" height="258" />
          ) : (
            <span className="nav__brand-text">{site.name}</span>
          )}
        </Link>

        <nav className="nav__links" aria-label="Main">
          {site.nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav__link ${isActive ? 'active' : ''}`}
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <motion.span
                      layoutId="nav-active"
                      className="nav__active"
                      transition={{ type: 'spring', stiffness: 480, damping: 38 }}
                    />
                  ) : null}
                  <span className="nav__label">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="nav__end">
          <Button to={navCta.to} size="sm" icon="arrow" className="nav__cta">
            {navCta.label}
          </Button>
          <button
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <span className={`nav__burger ${open ? 'is-open' : ''}`} aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-menu"
            className="nav__sheet"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.24, ease }}
          >
            <nav className="container nav__sheet-inner" aria-label="Mobile">
              <ul className="nav__sheet-links">
                {site.nav.map((item, index) => (
                  <motion.li
                    key={item.to}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease, delay: 0.04 + index * 0.035 }}
                  >
                    <NavLink
                      to={item.to}
                      end={item.to === '/'}
                      className={({ isActive }) => `nav__sheet-link ${isActive ? 'active' : ''}`}
                      onClick={() => setOpen(false)}
                    >
                      <span>{item.label}</span>
                      <Icon name="arrow" />
                    </NavLink>
                  </motion.li>
                ))}
              </ul>

              <motion.div
                className="nav__sheet-foot"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.28 }}
              >
                <Button to={navCta.to} block icon="arrow" onClick={() => setOpen(false)}>
                  {navCta.label}
                </Button>
                <div className="nav__sheet-meta">
                  <ExternalLink href={`mailto:${site.email}`}>{site.email}</ExternalLink>
                  {getSocialLinks().map((link) => (
                    <ExternalLink key={link.key} href={link.url}>
                      {link.label}
                    </ExternalLink>
                  ))}
                </div>
              </motion.div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
