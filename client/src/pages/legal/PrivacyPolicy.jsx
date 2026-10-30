import LegalPage from '../../components/common/LegalPage';
import StorefrontLayout from '../../components/layout/StorefrontLayout';
import { SUPPORT } from '../../data/siteInfo';

// Written from what this application actually does: the fields the API stores,
// the third-party services it calls, and the controls the account area offers.
// It describes the software, not wider business promises.
const sections = [
  {
    heading: 'What we collect',
    body: [
      'We only store what the store features need to work. Opening an account or placing an order adds to your record:',
    ],
    points: [
      'Account details you type in: first name, last name, phone number, and optionally gender and birth date.',
      'Your email address, which stays tied to email verification and cannot be changed in the profile form.',
      'A profile picture if you choose to upload one.',
      'Delivery addresses you save in the address book.',
      'Your orders, the items in them, their status, and any coupon code you applied.',
      'Reviews you write and any photos or videos you attach to them.',
      'Your cart and wishlist contents while you are signed in.',
    ],
  },
  {
    heading: 'Why we keep it',
    body: [
      'Your details are used to sign you in, deliver orders to the address you select, show your reviews with your name and picture, let you track and cancel your own orders, and send transactional email such as verification codes and password resets.',
      'We do not sell your personal information, and there is no advertising or analytics service built into this application.',
    ],
  },
  {
    heading: 'Services that process your data',
    body: [
      'Some data passes through the providers this store is built on:',
    ],
    points: [
      'Images and videos — product photos, your profile picture and review media — are stored on Cloudinary.',
      'Email such as verification codes and password resets is delivered through our email (SMTP) provider.',
      'Payments are handled by our payment provider. The application stores the payment status and the provider reference for an order; card and UPI details are entered with the provider and are never stored here.',
    ],
  },
  {
    heading: 'Who can see it',
    body: [
      'You can see and edit your own account, addresses, orders, wishlist and reviews. Administrators can see account, order and review data while handling support, order fulfilment and review moderation. Vendor accounts see their own store profile, products and reviews, and cannot see another store’s data.',
    ],
  },
  {
    heading: 'How long we keep it',
    body: [
      'Your account data stays while your account exists. Account settings → Delete account removes your account record and deletes your profile picture from Cloudinary. Order records stay in the database after deletion, because they are needed for order and accounting history; the delete screen states this before you confirm.',
    ],
  },
  {
    heading: 'Your choices',
    body: ['You are in control of your record from the account area:'],
    points: [
      'Edit your personal information and remove your profile picture at any time.',
      'Change your password, which signs out your other sessions.',
      'Add, edit, delete and re-order your saved addresses.',
      'Review and remove the store reviews you have written.',
      'Delete your account from Account settings.',
    ],
  },
  {
    heading: 'How your account is protected',
    body: [
      'Passwords are stored as one-way hashes, never as readable text. Signing in issues a session token, and signing out invalidates it on the server as well as in your browser. Administrative and vendor features are checked on the server for every request, so a role cannot be granted by changing something in the browser.',
    ],
  },
  {
    heading: 'Changes and contact',
    body: [
      'If this policy changes, the updated version will appear on this page.',
      `Questions about your data can be sent to ${SUPPORT.email}, or use the contact form. Our studio details are listed on the contact page.`,
    ],
  },
];

export default function PrivacyPolicy() {
  return (
    <StorefrontLayout>
      <LegalPage
        eyebrow="Your data"
        title="Privacy Policy"
        intro="This page explains what this store collects, why it is needed, and the controls you have over it. It describes how the application actually behaves."
        reviewedOn="12 October 2026"
        sections={sections}
      />
    </StorefrontLayout>
  );
}
