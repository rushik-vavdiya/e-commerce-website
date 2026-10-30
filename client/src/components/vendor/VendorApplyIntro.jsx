import {
  BadgeCheck,
  Boxes,
  Info,
  LayoutDashboard,
  Star,
  Store,
} from 'lucide-react';

// The two marketing sections of /vendor/apply: what a vendor account unlocks and
// how the application is decided. Every claim maps to something the API really
// does — no earnings or traffic numbers are promised.
const BENEFITS = [
  {
    Icon: Store,
    title: 'Your own store page',
    text: 'Name, description, address, contact details and social links, shown to customers.',
  },
  {
    Icon: LayoutDashboard,
    title: 'A vendor dashboard',
    text: 'Your products, store reviews and store profile in one place.',
  },
  {
    Icon: Boxes,
    title: 'Variants and stock',
    text: 'Price, stock, SKU and images per product combination.',
  },
  {
    Icon: Star,
    title: 'Customer reviews',
    text: 'Reviews of your store, surfaced on the product pages you sell.',
  },
];

const STEPS = [
  { title: 'Apply', text: 'Send your store details with the form on this page.' },
  {
    title: 'Review',
    text: 'An admin checks the application and can accept, hold or reject it with a reason.',
  },
  {
    title: 'Sell',
    text: 'Once approved, your account becomes a vendor account and the dashboard unlocks.',
  },
];

const Eyebrow = ({ children }) => (
  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">{children}</p>
);

export default function VendorApplyIntro() {
  return (
    <>
      <section className="w-full bg-white">
        <div className="mx-auto w-full max-w-[1900px] px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
          <header className="max-w-2xl">
            <Eyebrow>What you get</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl font-medium leading-tight tracking-tight text-primary sm:text-3xl lg:text-[36px]">
              Everything a store needs, on one account
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              A vendor account keeps using the same login you already have. The only
              difference is what the account can reach.
            </p>
          </header>

          <ul className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({ Icon, title, text }) => (
              <li
                key={title}
                className="rounded-3xl border border-border bg-background p-5 transition-colors duration-200 hover:border-accent/40"
              >
                <span
                  aria-hidden="true"
                  className="flex size-11 items-center justify-center rounded-2xl border border-border bg-white text-accent"
                >
                  <Icon size={20} strokeWidth={1.7} />
                </span>

                <h3 className="mt-4 text-sm font-medium text-primary">{title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="w-full border-y border-border bg-background">
        <div className="mx-auto w-full max-w-[1900px] px-5 py-14 sm:px-8 lg:px-10 lg:py-16">
          <header className="max-w-2xl">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-3 font-serif text-2xl font-medium leading-tight tracking-tight text-primary sm:text-3xl lg:text-[36px]">
              Three steps, one of them yours
            </h2>
          </header>

          <ol className="mt-9 grid gap-5 lg:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-3xl border border-border bg-white p-5">
                <span
                  aria-hidden="true"
                  className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white"
                >
                  {index + 1}
                </span>

                <h3 className="mt-4 text-sm font-medium text-primary">{step.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-muted">{step.text}</p>
              </li>
            ))}
          </ol>

          <ul className="mt-8 flex flex-col gap-2.5 rounded-3xl border border-dashed border-peach bg-peach/25 px-5 py-4">
            <li className="flex items-start gap-2.5 text-xs leading-5 text-muted">
              <Info
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-accent"
              />

              <span>
                <span className="font-medium text-primary">Worth knowing: </span>
                this build has no earnings or payouts screen, and a product you save stays
                a draft until an admin publishes it.
              </span>
            </li>

            <li className="flex items-start gap-2.5 text-xs leading-5 text-muted">
              <BadgeCheck
                size={16}
                strokeWidth={1.8}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-accent"
              />

              <span>Applying is free, and an admin makes the decision — nothing is approved automatically.</span>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
