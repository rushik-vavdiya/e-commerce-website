import StorefrontLayout from '../../components/layout/StorefrontLayout';
import PageBanner from '../../components/common/PageBanner';
import FaqGroupsSection from '../../components/faq/FaqGroupsSection';
import FaqContactBanner from '../../components/faq/FaqContactBanner';
import { isVisible } from '../../data/content';

// Three bands, all drawn straight from their components: the shared simple
// banner (src/components/common/PageBanner), the question groups and the contact
// banner. Each can be switched off in src/data/sectionVisibility.json. The
// questions themselves live in src/data/faqContent.js (read from
// siteContent.json).
const FAQ = () => {
  return (
    <StorefrontLayout>
      {isVisible('faq.hero') && <PageBanner contentKey="faq.hero" />}
      {isVisible('faq.groups') && <FaqGroupsSection />}
      {isVisible('faq.contactBanner') && <FaqContactBanner />}
    </StorefrontLayout>
  );
};

export default FAQ;
