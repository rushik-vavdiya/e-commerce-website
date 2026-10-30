import WebsiteReviewSection from '../review/WebsiteReviewSection';

// Homepage band for reviews of the website itself. One band, one request: every
// approved review sits in a carousel, and the form opens from the "Write a
// review" button instead of sitting open on the page. Only reviews written by
// real accounts are shown, with the reviewer's name and profile picture.
//
// The blush background and the section spacing live here; the eyebrow, heading
// and cards are rendered by the section, so the whole band is one centred block.
export default function WebsiteReviews() {
  return (
    <section
      id="store-reviews"
      aria-labelledby="store-reviews-heading"
      className="w-full bg-[var(--reviews-band)]"
    >
      <div className="mx-auto w-full max-w-[1900px] px-5 py-12 sm:px-8 sm:py-14 lg:px-10 lg:py-16">
        <WebsiteReviewSection />
      </div>
    </section>
  );
}
