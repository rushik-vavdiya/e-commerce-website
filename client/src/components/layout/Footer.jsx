import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import FallbackImage from '../common/FallbackImage';
import { getContent, listContent } from '../../data/content';
import { contentIcon } from '../../utils/contentIcons';
import { paymentGlyph, socialGlyph } from '../../utils/brandGlyphs';

import 'swiper/css';
import 'swiper/css/pagination';

// Every word, link and mark comes from src/data/siteContent.json ("brand" and
// "footer"); the colours are the "footer-*" tokens in src/index.css, so the
// whole footer is styled with plain utilities (bg-footer-band, text-footer-text,
// border-footer-divider, …) and recoloured in one place.
//
// Three bands, top to bottom: the brand block with the link columns on a cream
// panel with the photo behind their right half, the blush promise strip, then
// the terracotta bar with the legal row, the payment marks and the currency.
const brandName = getContent('brand.name');
const brandDescription = getContent('brand.description');
const copyrightName = getContent('brand.copyrightName');
const columns = listContent('footer.columns');
const socials = listContent('footer.socials');
const benefits = listContent('footer.benefits');
const payments = listContent('footer.payments');
const currencies = listContent('footer.currencies');
const legalLinks = listContent('footer.legalLinks');
const photo = getContent('footer.photo');
const photoFallback = getContent('footer.photoFallback');

// The simple-icons marks are single-colour and share one square viewBox, so
// each payment gets its own brand colour and box size here rather than in the
// content file: a wide wordmark needs a bigger box than a square badge to end
// up the same height on screen.
const paymentMarks = {
  Visa: { size: 26, color: 'text-[#1A1F71]' },
  MasterCard: { size: 26, color: 'text-[#EB001B]' },
  'American Express': { size: 21, color: 'text-[#006FCF]' },
  PayPal: { size: 21, color: 'text-[#003087]' },
  'Google Pay': { size: 26, color: 'text-[#5F6368]' },
  'Apple Pay': { size: 26, color: 'text-[#111111]' },
};

const CURRENCY_KEY = 'rynova:currency';

// On phones the promise strip becomes a single-card carousel that advances on
// its own; visitors who ask the OS for less motion get a still one they can
// drag. From lg the static four-up grid is used instead, so this only ever
// drives the mobile carousel.
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const BENEFITS_AUTOPLAY = prefersReducedMotion
  ? false
  : {
      delay: 2600,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
      waitForTransition: true,
    };

// Prices are shown in rupees everywhere for now; the picker only remembers the
// choice so a future conversion layer has somewhere to read it from.
const readCurrency = () => {
  try {
    return localStorage.getItem(CURRENCY_KEY) || currencies[0]?.code || 'INR';
  } catch {
    return currencies[0]?.code || 'INR';
  }
};

function CurrencyPicker() {
  const [code, setCode] = useState(readCurrency);

  const choose = (event) => {
    setCode(event.target.value);

    try {
      localStorage.setItem(CURRENCY_KEY, event.target.value);
    } catch {
      // Private mode: the choice simply is not remembered.
    }
  };

  return (
    <label className="relative flex items-center text-xs text-footer-bar-text sm:text-[13px]">
      <span className="sr-only">Currency</span>

      <select
        value={code}
        onChange={choose}
        className="cursor-pointer appearance-none bg-transparent py-1 pr-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-footer-bar-text"
      >
        {currencies.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} ({currency.symbol})
          </option>
        ))}
      </select>

      <ChevronDown
        size={15}
        strokeWidth={1.8}
        aria-hidden="true"
        className="pointer-events-none absolute right-0"
      />
    </label>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-footer-band">
      {/* Brand and link columns on the studio photo. The photo covers the whole
          band at every width; the cream veil above it keeps the copy readable
          without hiding the fabric and tassels along the edges. */}
      <div className="relative isolate w-full overflow-hidden bg-footer-band">
        <FallbackImage
          src={photo}
          fallbackSrc={photoFallback}
          alt=""
          loading="lazy"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[24%_50%] sm:object-center"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(253,251,247,0.8)_0%,rgba(253,251,247,0.62)_38%,rgba(253,251,247,0.42)_70%,rgba(253,251,247,0.28)_100%)]"
        />

        <div className="mx-auto w-full max-w-[1900px] px-5 py-12 sm:px-8 lg:px-10 lg:py-16">
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] lg:gap-0">
            <div className="col-span-2 min-w-0 sm:col-span-3 lg:col-span-1 lg:pr-10">
              <Link
                to="/"
                className="font-serif text-[34px] font-medium leading-none tracking-tight text-footer-title focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-footer-social-icon sm:text-[40px]"
              >
                {brandName}
              </Link>

              {/* Capped to the reference's measure, which breaks the copy
                  after "every day." onto a third line. */}
              <p className="mt-5 max-w-[18.5rem] text-[15px] leading-7 text-footer-text">
                {brandDescription}
              </p>

              <ul className="mt-6 flex flex-wrap items-center gap-3">
                {socials.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={`${brandName} on ${social.name}`}
                      className="flex size-10 items-center justify-center rounded-full bg-footer-social text-footer-social-icon transition-colors duration-200 hover:bg-footer-social-icon hover:text-footer-social focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-footer-social-icon focus-visible:ring-offset-2 focus-visible:ring-offset-footer-band"
                    >
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                        <path d={socialGlyph(social.name)} />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Three link columns, each with its own hairline on desktop. The
                last one spans both phone columns and lays its links out in two
                rows, so the footer does not turn into one long list. */}
            {columns.map((column, index) => {
              const isLast = index === columns.length - 1;

              return (
                <div
                  key={column.id}
                  className={[
                    'min-w-0 lg:border-l lg:border-footer-divider lg:pl-8 xl:pl-10',
                    isLast ? 'col-span-2 sm:col-span-1' : '',
                  ].join(' ')}
                >
                  <h3 className="font-serif text-[18px] font-medium text-footer-title">
                    {column.title}
                  </h3>

                  <ul
                    className={[
                      'mt-5 grid gap-y-3',
                      isLast ? 'grid-cols-2 gap-x-6 sm:grid-cols-1' : 'grid-cols-1',
                    ].join(' ')}
                  >
                    {column.links.map((link) => (
                      <li key={link.label + link.href}>
                        <Link
                          to={link.href}
                          className="text-[14px] text-footer-text transition-colors hover:text-footer-title focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-footer-social-icon"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Promise strip. On phones it is a single-card carousel that advances on
          its own (one promise is easier to read than a cramped 2-up grid); from
          lg it becomes the static four-up row. Both are in the DOM, toggled by a
          breakpoint, so the grid needs no JS layout logic. */}
      {benefits.length > 0 && (
        <div className="w-full border-t border-footer-divider bg-footer-benefits">
          {/* Mobile: auto-playing carousel. */}
          <div className="lg:hidden">
            <Swiper
              modules={[Autoplay, Pagination]}
              slidesPerView={1}
              slidesPerGroup={1}
              spaceBetween={16}
              speed={600}
              loop={benefits.length > 1}
              autoplay={BENEFITS_AUTOPLAY}
              pagination={{ clickable: true }}
              a11y={{ enabled: true, containerRoleDescriptionMessage: 'Store benefits carousel' }}
              className="footer-benefits-swiper w-full px-5 pb-9 pt-6 sm:px-8"
            >
              {benefits.map(({ id, title, description, icon }) => {
                const Icon = contentIcon(icon);

                return (
                  <SwiperSlide key={id}>
                    <div className="flex min-h-[9.5rem] flex-col items-center justify-center gap-2.5 rounded-2xl border border-footer-divider bg-white/60 px-6 py-7 text-center">
                      <span className="flex size-12 items-center justify-center rounded-full bg-footer-social">
                        <Icon size={24} strokeWidth={1.5} aria-hidden="true" className="text-footer-icon" />
                      </span>

                      <h3 className="font-serif text-[17px] font-medium text-footer-title">
                        {title}
                      </h3>

                      <p className="max-w-[16rem] text-[13px] leading-snug text-footer-text">
                        {description}
                      </p>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>

          {/* Desktop: four-up grid with hairlines between cells. */}
          <div className="mx-auto hidden w-full max-w-[1900px] grid-cols-4 px-10 lg:grid">
            {benefits.map(({ id, title, description, icon }, index) => {
              const Icon = contentIcon(icon);
              const isLast = index === benefits.length - 1;

              return (
                <div
                  key={id}
                  className={[
                    'flex items-center justify-center gap-3.5 py-5',
                    !isLast ? 'border-r border-footer-divider' : '',
                  ].join(' ')}
                >
                  <Icon
                    size={24}
                    strokeWidth={1.5}
                    aria-hidden="true"
                    className="shrink-0 text-footer-icon"
                  />

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold leading-tight text-footer-title">
                      {title}
                    </h3>

                    <p className="mt-0.5 text-xs leading-snug text-footer-text">
                      {description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legal row, payment marks and currency. */}
      <div className="w-full bg-gradient-to-r from-footer-bar to-footer-bar-deep">
        <div className="mx-auto w-full max-w-[1900px] px-5 py-5 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-footer-bar-text sm:gap-x-5 sm:text-[13px]">
              <p className="w-full sm:w-auto">
                © {year} {copyrightName}. All rights reserved.
              </p>

              {legalLinks.map((link, index) => (
                <span
                  key={link.label + link.href}
                  className="flex items-center gap-4 sm:gap-5"
                >
                  <span
                    aria-hidden="true"
                    className={[
                      'h-3.5 w-px shrink-0 bg-footer-bar-divider',
                      index === 0 ? 'hidden sm:block' : 'block',
                    ].join(' ')}
                  />

                  <Link
                    to={link.href}
                    className="whitespace-nowrap transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    {link.label}
                  </Link>
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 sm:ml-auto">
              <ul className="flex items-center gap-1.5 sm:gap-2">
                {payments.map((payment) => {
                  const mark = paymentMarks[payment] ?? { size: 26, color: 'text-primary' };

                  return (
                    <li
                      key={payment}
                      aria-label={payment}
                      className="grid h-6 w-9 place-items-center rounded-[5px] bg-footer-pill sm:h-7 sm:w-10"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width={mark.size}
                        height={mark.size}
                        fill="currentColor"
                        className={mark.color}
                        role="img"
                        aria-hidden="true"
                      >
                        <path d={paymentGlyph(payment)} />
                      </svg>
                    </li>
                  );
                })}
              </ul>

              <span
                aria-hidden="true"
                className="hidden h-6 w-px bg-footer-bar-divider sm:block"
              />

              <span className="ml-auto sm:ml-0">
                <CurrencyPicker />
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
