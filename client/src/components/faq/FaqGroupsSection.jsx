import { useState } from 'react';

import Container from '../common/Container';
import { faqGroups } from '../../data/faqContent';
import FaqAccordion from './FaqAccordion';
import FaqCategorySidebar from './FaqCategorySidebar';

// The question groups band: topics on the left, the open topic's answers on the
// right. The questions themselves live in src/data/faqContent.js; this band owns
// only which topic is open.
export default function FaqGroupsSection() {
  const [activeId, setActiveId] = useState(faqGroups[0]?.id);
  const activeGroup =
    faqGroups.find((group) => group.id === activeId) ?? faqGroups[0];

  if (!activeGroup) return null;

  return (
    <section className="w-full bg-background py-14 sm:py-16 lg:py-20">
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          <FaqCategorySidebar
            groups={faqGroups}
            activeId={activeGroup.id}
            onSelect={setActiveId}
          />

          <div className="min-w-0 flex-1">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-medium tracking-tight text-primary sm:text-3xl">
                {activeGroup.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted sm:text-base">
                {activeGroup.description}
              </p>
            </div>

            {/* key resets the accordion when the topic changes, so a new
                category never opens with a stale answer expanded. */}
            <FaqAccordion
              key={activeGroup.id}
              items={activeGroup.items}
              idPrefix={activeGroup.id}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
