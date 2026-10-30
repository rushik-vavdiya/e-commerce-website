import PageHero from '../../components/common/PageHero';
import StorefrontLayout from '../../components/layout/StorefrontLayout';
import WishlistBoard from '../../components/wishlist/WishlistBoard';
import { getContent } from '../../data/content';

// Wording lives in src/data/siteContent.json under "wishlist.hero".
const copy = getContent('wishlist.hero', {});

// /wishlist — the dedicated wishlist page, reachable from the header, the profile
// sidebar and after saving an item.
export default function Wishlist() {
  return (
    <StorefrontLayout>
      <>
        <PageHero
          eyebrow={copy.eyebrow}
          title={copy.title}
          breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Wishlist' }]}
          description={copy.description}
        />

        <section className="w-full bg-background py-12 sm:py-14 lg:py-16">
          <div className="mx-auto w-full max-w-[1900px] px-5 sm:px-8 lg:px-10">
            <WishlistBoard />
          </div>
        </section>
      </>
    </StorefrontLayout>
  );
}
