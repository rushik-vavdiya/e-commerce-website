import Container from '../common/Container';
import ContactFormCard from './ContactFormCard';
import ContactInfoCardGroup from './ContactInfoCardGroup';
import ContactQuickAnswers from './ContactQuickAnswers';
import { isVisible } from '../../data/content';

// Two side-by-side columns on desktop: the message form on the left and the
// contact details on the right. On phones they stack in the same order.
// The three switches live in src/data/sectionVisibility.json under "contact".
export default function ContactPageBody() {
  const showForm = isVisible('contact.form');
  const showInfoCards = isVisible('contact.infoCards');
  const showQuickAnswers = isVisible('contact.quickAnswers');

  if (!showForm && !showInfoCards && !showQuickAnswers) return null;

  return (
    <section className="w-full bg-background py-14 sm:py-16 lg:py-20">
      {/* The form and the map below share this container, so their left and
          right edges always line up. */}
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          {showForm && (
            <div className="w-full lg:flex-[1.15]">
              <ContactFormCard />
            </div>
          )}

          {(showInfoCards || showQuickAnswers) && (
            <div className="w-full lg:max-w-[440px] lg:flex-[0.85]">
              {showInfoCards && <ContactInfoCardGroup />}

              {showQuickAnswers && (
                <div className={showInfoCards ? 'mt-4' : undefined}>
                  <ContactQuickAnswers />
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
