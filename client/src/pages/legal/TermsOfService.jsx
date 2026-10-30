import LegalPage from '../../components/common/LegalPage';
import StorefrontLayout from '../../components/layout/StorefrontLayout';
import { SUPPORT } from '../../data/siteInfo';

// These terms follow the rules the application already enforces on the server:
// stock checks at order time, moderation before reviews appear, admin approval
// before a store can sell, and cancellation while an order allows it.
const sections = [
  {
    heading: 'Using the site',
    body: [
      'You need an account to shop, and you must give accurate details, including a working email address, because we send verification codes and order updates there. Keep your password to yourself: anything done through your signed-in session is treated as done by you.',
    ],
  },
  {
    heading: 'Products, prices and stock',
    body: [
      'Prices, stock and product details come from the catalogue, are shown per variant where a product has variants, and can change. When you place an order the server re-checks stock, the coupon and the total before the order is created, so an item can sell out while it sits in a cart.',
    ],
  },
  {
    heading: 'Orders',
    body: [
      'An order is placed against a delivery address you saved in your address book. Once it is created you can follow its status in My orders. Where an order status allows it, you can cancel it yourself, and the reserved stock is returned to the catalogue.',
    ],
  },
  {
    heading: 'Payments',
    body: [
      'Payments are processed by our payment provider. We never receive or store your card or UPI credentials. If the payment provider is unavailable or a payment fails, the order is not marked as paid and you can try again from your orders.',
    ],
  },
  {
    heading: 'Reviews and other content',
    points: [
      'Reviews you submit are checked by an administrator before they appear publicly.',
      'Write about your own experience only, and do not post anything unlawful, misleading or copied from someone else.',
      'We can reject or remove a review that breaks these rules.',
      'You are responsible for any photos or videos you attach, so only upload what you have the right to share.',
    ],
  },
  {
    heading: 'Selling on this store',
    body: [
      'Vendor accounts apply through the vendor application and can only sell after an administrator approves the application. Approval is recorded on the server, and no browser action can grant it. Vendors must keep their store details, prices and stock accurate, and products stay in draft until they are published.',
    ],
  },
  {
    heading: 'Acceptable use',
    points: [
      'Do not try to reach accounts, orders, dashboards or data that belong to someone else.',
      'Do not place orders you do not intend to pay for, or scrape, overload or disrupt the store.',
      'Do not attempt to bypass the role checks that protect the admin and vendor areas.',
    ],
  },
  {
    heading: 'Changes and contact',
    body: [
      'We may update these terms; the current version always lives on this page. Continuing to use the store after a change means you accept the updated terms.',
      `For any question about these terms or an order, write to ${SUPPORT.email} or use the contact page.`,
    ],
  },
];

export default function TermsOfService() {
  return (
    <StorefrontLayout>
      <LegalPage
        eyebrow="The rules"
        title="Terms & Conditions"
        intro="These terms describe how shopping and selling work on this store, following the rules the application enforces."
        reviewedOn="12 October 2026"
        sections={sections}
      />
    </StorefrontLayout>
  );
}
