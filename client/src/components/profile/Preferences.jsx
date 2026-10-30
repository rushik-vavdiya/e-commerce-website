import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BellRing, LayoutGrid, Mail } from 'lucide-react';

import Button from '../common/Button';
import { clearNewsletterStatus, subscribeToNewsletter } from '../../slices/newsletterSlice';

const STORAGE_KEY = 'storefront-preferences';

const defaultPreferences = { compactGrid: false, orderUpdates: true };

// Extra customer settings: a newsletter opt-in that uses the existing newsletter
// API, plus two small display preferences kept in the browser.
export default function Preferences() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const newsletter = useSelector((state) => state.newsletter);

  const [email, setEmail] = useState(user?.email ?? '');
  // Read the saved display preferences once, when the component first mounts.
  const [preferences, setPreferences] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
      return { ...defaultPreferences, ...stored };
    } catch {
      return defaultPreferences;
    }
  });
  const [saved, setSaved] = useState(false);

  const updatePreference = (key, value) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaved(true);
  };

  const handleSubscribe = async (event) => {
    event.preventDefault();
    dispatch(clearNewsletterStatus());

    if (!email.trim()) return;
    await dispatch(subscribeToNewsletter(email.trim()));
  };

  const toggleClass = (active) =>
    [
      'inline-flex min-h-9 items-center rounded-full px-4 text-xs font-semibold transition-colors',
      active ? 'bg-primary text-white' : 'border border-border bg-white text-primary hover:border-accent',
    ].join(' ');

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-medium text-primary">
          <Mail size={18} strokeWidth={1.8} aria-hidden="true" />
          Newsletter
        </h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          Get new drops and offers in your inbox. This uses the same subscribe
          endpoint as the home page newsletter box.
        </p>

        <form onSubmit={handleSubscribe} className="mt-4 flex flex-wrap items-end gap-3">
          <div className="flex min-w-56 flex-1 flex-col gap-1.5">
            <label htmlFor="preferences-email" className="text-xs font-medium text-primary">
              Email
            </label>
            <input
              id="preferences-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-primary outline-none transition focus:border-accent"
            />
          </div>

          <Button type="submit" variant="primary" loading={newsletter.loading}>
            Subscribe
          </Button>
        </form>

        {newsletter.message && (
          <p role="status" className="mt-3 rounded-2xl border border-peach bg-peach/30 px-4 py-3 text-xs text-primary">
            {newsletter.message}
          </p>
        )}
        {newsletter.error && (
          <p role="alert" className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
            {newsletter.error}
          </p>
        )}
      </section>

      <section className="rounded-3xl border border-border bg-white p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-base font-medium text-primary">
          <LayoutGrid size={18} strokeWidth={1.8} aria-hidden="true" />
          Display preferences
        </h2>
        <p className="mt-1 text-xs leading-5 text-muted">
          Stored on this device only.
        </p>

        <ul className="mt-4 flex flex-col gap-4">
          <li className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-primary">Compact product grid</span>
            <button
              type="button"
              onClick={() => updatePreference('compactGrid', !preferences.compactGrid)}
              aria-pressed={preferences.compactGrid}
              className={toggleClass(preferences.compactGrid)}
            >
              {preferences.compactGrid ? 'On' : 'Off'}
            </button>
          </li>

          <li className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-primary">Order update notifications</span>
            <button
              type="button"
              onClick={() => updatePreference('orderUpdates', !preferences.orderUpdates)}
              aria-pressed={preferences.orderUpdates}
              className={toggleClass(preferences.orderUpdates)}
            >
              {preferences.orderUpdates ? 'On' : 'Off'}
            </button>
          </li>
        </ul>

        {saved && (
          <p role="status" className="mt-4 flex items-center gap-2 text-xs text-accent">
            <BellRing size={14} strokeWidth={1.8} aria-hidden="true" />
            Preferences saved on this device.
          </p>
        )}
      </section>
    </div>
  );
}
