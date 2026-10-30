import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Where each history entry was last left, keyed by the id React Router gives
// that entry. Back and forward return to that offset instead of dropping the
// reader in the middle of a page they were not reading.
const offsets = new Map();

// A page can still be filling in when the route changes (rows arrive from the
// API), so an offset is re-applied until the document is tall enough to hold it
// or the frames run out.
const scrollToOffset = (offset) => {
  let frames = 0;

  const apply = () => {
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    // History restores snap: the page has already been swapped beneath us, so
    // the site-wide smooth scroll would glide across content mid-swap.
    window.scrollTo({ top: Math.min(offset, max), left: 0, behavior: 'instant' });

    if (max < offset && frames < 30) {
      frames += 1;
      requestAnimationFrame(apply);
    }
  };

  apply();
};

// A new page opens at the top. The browser keeps the window offset across a
// client-side route change, so a link from halfway down a long listing used to
// drop the reader into the middle of the next page.
//
// Rendered once, inside the router. Back and forward are deliberately not reset:
// returning to a listing continues where it was read, which is the same thing
// the browser does for a normal page load.
export default function ScrollToTop() {
  const { key, hash } = useLocation();
  const navigationType = useNavigationType();
  const previousKey = useRef(key);

  // Every scroll of the entry on screen is remembered for the back button to
  // return to. Only the current key is written, so the entry being left keeps
  // the offset it was read at.
  useEffect(() => {
    const remember = () => offsets.set(key, window.scrollY);

    window.addEventListener('scroll', remember, { passive: true });

    return () => window.removeEventListener('scroll', remember);
  }, [key]);

  useEffect(() => {
    const previous = previousKey.current;
    previousKey.current = key;

    // The first entry is the one the browser restored on load, and a refresh
    // keeps its place like any other page.
    if (previous === key) return;

    if (navigationType === 'POP') {
      // Back and forward land where that page was left; an entry that was never
      // scrolled counts as the top.
      scrollToOffset(offsets.get(key) ?? 0);
      return;
    }

    // A link to a section of the page it is already on ("#contact-form") still
    // has to reach its target rather than the top of the page.
    if (hash) {
      const target = /^#[A-Za-z][\w:.-]*$/.test(hash) ? document.querySelector(hash) : null;

      if (target) {
        target.scrollIntoView();
        return;
      }
    }

    // New pages arrive at the top; html's scroll-behavior: smooth makes this
    // (and the #hash jump above) glide rather than snap.
    window.scrollTo(0, 0);
  }, [key, hash, navigationType]);

  return null;
}
