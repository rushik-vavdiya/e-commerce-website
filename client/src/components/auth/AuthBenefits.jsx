import { Leaf } from 'lucide-react';

import { getContent, listContent } from '../../data/content';
import { contentIcon } from '../../utils/contentIcons';

// Left half of the auth pages (desktop only): brand, headline, promises, then a
// framed photo filling whatever height is left. Every word and the photo come
// from src/data/siteContent.json ("brand" and "auth.shared").
const shared = getContent('auth.shared', {});
const highlights = listContent('auth.shared.benefits');
const brandName = getContent('brand.logoText');

export default function AuthBenefits() {
  return (
    <aside className="hidden min-h-0 flex-col gap-8 bg-background p-8 lg:flex xl:gap-10 xl:p-12">
      {/* Brand */}
      <div className="flex shrink-0 items-center gap-3 text-primary">
        <Leaf size={22} strokeWidth={1.6} className="text-accent" aria-hidden="true" />
        <span className="text-xl font-medium tracking-[0.18em]">{brandName}</span>
      </div>

      {/* Headline + promises */}
      <div className="max-w-[520px] shrink-0">
        <div className="flex items-center gap-3">
          <span className="h-px w-9 bg-accent/50" aria-hidden="true" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
            {shared.benefitsEyebrow}
          </p>
        </div>

        <h2 className="mt-4 font-serif text-[36px] font-medium leading-[1.06] tracking-tight text-primary xl:text-[44px]">
          {shared.benefitsTitle}{' '}
          <em className="italic text-accent">{shared.benefitsTitleAccent}</em>
        </h2>

        <p className="mt-4 max-w-[400px] text-sm leading-6 text-muted xl:text-[15px] xl:leading-7">
          {shared.benefitsDescription}
        </p>

        <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 xl:mt-7 xl:gap-x-6">
          {highlights.map(({ id, label, icon }) => {
            const Icon = contentIcon(icon);

            return (
              <li key={id} className="flex items-center gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-accent/40 text-accent">
                  <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="whitespace-nowrap text-xs font-medium text-primary/85">
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Framed photo, filling the rest of the column */}
      <figure className="relative min-h-[170px] flex-1 overflow-hidden rounded-[28px] border border-border bg-peach">
        <img
          src={shared.benefitsImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </figure>
    </aside>
  );
}
