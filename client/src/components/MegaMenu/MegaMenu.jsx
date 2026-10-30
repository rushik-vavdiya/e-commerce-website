import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import MegaMenuPanel from './MegaMenuPanel';
import useMegaMenuData from '../../hooks/useMegaMenuData';
import './MegaMenu.css';

const PANEL_ID = 'rv-mega-menu';

// The Collections entry of the storefront navigation.
//
// Opens on hover (with the design's 160ms close delay, so travelling from the
// trigger to the panel does not flicker it shut) and on click. A category is
// selected on hover or focus. Escape, an outside click and any route change all
// close it. Under 900px the panel is not rendered at all — MobileCollections
// draws the same data as an accordion inside the drawer.
export default function MegaMenu({ label = 'Collections' }) {
  const [isOpen, setIsOpen] = useState(false);
  // The address the panel was opened on. Navigation changes it, which closes the
  // panel without an effect watching the router.
  const [openedOn, setOpenedOn] = useState('');
  const [pickedSlug, setPickedSlug] = useState(null);

  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const closeTimer = useRef(0);

  const location = useLocation();
  const { collections, featured, loading, error } = useMegaMenuData();

  const here = `${location.pathname}${location.search}`;
  // Open only while we are still on the page it was opened on, so a route change
  // closes it and a return to the same address does not reopen it.
  const open = isOpen && openedOn === here;

  const openMenu = () => {
    window.clearTimeout(closeTimer.current);
    setOpenedOn(here);
    setIsOpen(true);
  };

  const closeMenu = () => {
    window.clearTimeout(closeTimer.current);
    setIsOpen(false);
  };

  const closeSoon = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setIsOpen(false), 160);
  };

  // The first department is the default, so the middle column is never empty.
  // Derived rather than stored: nothing has to be written when data arrives.
  const activeSlug = pickedSlug ?? collections[0]?.slug;

  // Escape and an outside click while the panel is open.
  useEffect(() => {
    if (!open) return undefined;

    const handleKey = (event) => {
      if (event.key !== 'Escape') return;

      setIsOpen(false);
      triggerRef.current?.focus();
    };

    const handleOutside = (event) => {
      if (!wrapRef.current?.contains(event.target)) setIsOpen(false);
    };

    document.addEventListener('keydown', handleKey);
    document.addEventListener('click', handleOutside);

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('click', handleOutside);
    };
  }, [open]);

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  const handleNavigate = () => {
    window.clearTimeout(closeTimer.current);
    setIsOpen(false);
  };

  return (
    <div
      ref={wrapRef}
      className={`mm-wrap${open ? ' is-open' : ''}`}
      onMouseEnter={openMenu}
      onMouseLeave={closeSoon}
    >
      <button
        ref={triggerRef}
        type="button"
        className="mm-trigger"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={PANEL_ID}
        onClick={() => (open ? closeMenu() : openMenu())}
      >
        {label}

        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div id={PANEL_ID} className="mm-panel" role="region" aria-label={label}>
          <MegaMenuPanel
            collections={collections}
            featured={featured}
            loading={loading}
            error={error}
            activeSlug={activeSlug}
            onSelect={setPickedSlug}
            onNavigate={handleNavigate}
          />
        </div>
      )}
    </div>
  );
}
