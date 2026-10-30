import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AlertCircle, CheckCircle2, Mail, Send } from 'lucide-react';

import FallbackImage from '../common/FallbackImage';
import Spinner from '../common/Spinner';
import { useContent } from '../../hooks/useSiteContent';
import { clearNewsletterStatus, subscribeToNewsletter } from '../../slices/newsletterSlice';

// The deep maroon band: the heading and the sentence on the left, a single
// sign-up card on the right. The card stacks the field above the button, so the
// call to action gets its own full-width line on every screen size.
//
// Every string comes from the "newsletter" section, with
// src/data/siteContent.json (same key) as the fallback, and the colours from the
// "--newsletter-*" block in src/index.css. The band carries its own full-bleed
// photo under a maroon veil that is heaviest behind the copy, so the picture
// reads on the right and the text stays crisp.
export default function Newsletter() {
  const newsletter = useContent('home.newsletter', {});

  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.newsletter);
  const [email, setEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    dispatch(clearNewsletterStatus());

    const result = await dispatch(subscribeToNewsletter(email.trim()));
    if (subscribeToNewsletter.fulfilled.match(result)) setEmail('');
  };

  return (
    <section className="relative isolate w-full overflow-hidden bg-[var(--newsletter-panel)]">
      <FallbackImage
        src={newsletter.image}
        fallbackSrc={newsletter.imageFallback}
        alt=""
        loading="lazy"
        style={{ objectPosition: newsletter.imagePosition ?? '50% 50%' }}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />

      {/* Veil: heavy maroon behind the copy on the left, thinning to a light wash
          on the right so the photo stays visible. On phones it falls top-down. */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(110,53,52,0.9)_0%,rgba(110,53,52,0.72)_55%,rgba(89,42,43,0.86)_100%)] lg:bg-[linear-gradient(90deg,rgba(110,53,52,0.92)_0%,rgba(110,53,52,0.8)_38%,rgba(110,53,52,0.38)_70%,rgba(89,42,43,0.5)_100%)]"
      />

      <div className="relative mx-auto grid w-full max-w-[1900px] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,450px)] lg:items-center lg:gap-12 lg:px-10 lg:py-16">
        <div className="max-w-xl">
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--newsletter-muted)]">
            <span aria-hidden="true" className="h-px w-8 bg-[var(--newsletter-muted)]/60" />
            {newsletter.eyebrow}
          </p>

          <h2 className="mt-4 font-serif text-3xl font-medium leading-tight tracking-tight text-[var(--newsletter-ink)] sm:text-4xl lg:text-[42px]">
            {newsletter.titleLine1}{' '}
            <span className="block sm:inline">{newsletter.titleHighlight}</span>
          </h2>

          <p className="mt-4 max-w-md text-sm leading-6 text-[var(--newsletter-muted)] sm:text-[15px]">
            {newsletter.description}
          </p>
        </div>

        {/* Cream card on the maroon band: a solid surface keeps the field and the
            button readable against the photo, and the wine button gives the one
            action on this band the weight it needs. */}
        <form
          onSubmit={handleSubmit}
          aria-busy={loading}
          className="w-full rounded-[26px] border border-white/50 bg-background p-6 shadow-[0_24px_60px_rgba(40,14,15,0.32)] sm:p-7 lg:justify-self-end"
        >
          <label
            htmlFor="newsletter-email"
            className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/65"
          >
            {newsletter.formLabel}
          </label>

          <div className="relative mt-2">
            <Mail
              size={17}
              strokeWidth={1.8}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
            />

            <input
              id="newsletter-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              disabled={loading}
              onChange={(event) => {
                setEmail(event.target.value);
                dispatch(clearNewsletterStatus());
              }}
              placeholder={newsletter.placeholder}
              aria-describedby="newsletter-note"
              className="h-12 w-full rounded-xl border border-border bg-white pl-11 pr-4 text-sm text-primary outline-none transition placeholder:text-muted/80 focus:border-primary/45 focus:ring-4 focus:ring-primary/10 disabled:opacity-70"
            />
          </div>

          {/* The button sits under the field, full width, so it never gets
              squeezed on a narrow screen. */}
          <button
            type="submit"
            disabled={loading}
            className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-6 text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition-colors duration-200 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Spinner size={16} /> : <Send size={16} strokeWidth={1.9} aria-hidden="true" />}
            {loading ? 'Subscribing…' : newsletter.buttonLabel}
          </button>

          <p
            id="newsletter-note"
            className="mt-4 border-t border-border/80 pt-3 text-center text-[11px] leading-5 text-muted"
          >
            {newsletter.note}
          </p>

          {message && (
            <p
              role="status"
              className="mt-3 flex items-start gap-2 rounded-xl bg-peach/70 px-3.5 py-2.5 text-xs leading-5 text-primary"
            >
              <CheckCircle2 size={15} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0" />
              {message}
            </p>
          )}

          {error && (
            <p
              role="alert"
              className="mt-3 flex items-start gap-2 rounded-xl bg-[#FBE6E3] px-3.5 py-2.5 text-xs leading-5 text-[#8C2F27]"
            >
              <AlertCircle size={15} strokeWidth={2} aria-hidden="true" className="mt-px shrink-0" />
              {error}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
