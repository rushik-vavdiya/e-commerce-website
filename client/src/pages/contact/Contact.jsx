import StorefrontLayout from '../../components/layout/StorefrontLayout';
import PageBanner from '../../components/common/PageBanner';
import ContactPageBody from '../../components/contact/ContactPageBody';
import MapSection from '../../components/contact/MapSection';
import { isVisible } from '../../data/content';

// The contact page has three bands: the shared simple banner
// (src/components/common/PageBanner), the body (form plus the contact cards) and
// the studio map. Each is drawn straight from its component and can be switched
// off in src/data/sectionVisibility.json. ContactPageBody still has its
// own column switches (contact.form / contact.infoCards / contact.quickAnswers),
// so the body band is only drawn while at least one of those columns is on.
const showBody =
  isVisible('contact.form') ||
  isVisible('contact.infoCards') ||
  isVisible('contact.quickAnswers');

const Contact = () => {
  return (
    // This is the only storefront page that shows the floating WhatsApp button,
    // so it sits next to the contact form it belongs with.
    <StorefrontLayout showWhatsApp>
      {isVisible('contact.banner') && <PageBanner contentKey="contact.banner" />}
      {showBody && <ContactPageBody />}
      {isVisible('contact.map') && <MapSection />}
    </StorefrontLayout>
  );
};

export default Contact;
