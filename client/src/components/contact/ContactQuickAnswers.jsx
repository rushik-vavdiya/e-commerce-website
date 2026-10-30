import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

import { getContent } from '../../data/content';

// The wording comes from src/data/siteContent.json (key "contact.quickAnswers").
const quickAnswers = getContent('contact.quickAnswers', {});

export default function ContactQuickAnswers() {
  return (
    <div className="rounded-3xl border border-border bg-white p-6 shadow-[0_12px_40px_-18px_rgba(122,46,31,0.16)]">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-peach/50 text-primary"
        >
          <HelpCircle size={22} strokeWidth={1.7} />
        </span>

        <div>
          <h2 className="text-base font-medium text-primary">
            {quickAnswers.title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-muted">
            {quickAnswers.description}
          </p>

          <Link
            to={quickAnswers.linkHref}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            {quickAnswers.linkLabel}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
