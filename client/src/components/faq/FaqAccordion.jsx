import { useState } from 'react';
import { Plus } from 'lucide-react';

// Reusable accordion. Clicking a question opens it and closes the one that was
// open before, so only one answer is visible at a time inside a group.
export default function FaqAccordion({ items = [], idPrefix = 'faq' }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (items.length === 0) return null;

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-white">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${idPrefix}-panel-${index}`;
        const buttonId = `${idPrefix}-question-${index}`;

        return (
          <li key={item.question}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset sm:px-6"
              >
                <span className="text-sm font-medium text-primary sm:text-base">
                  {item.question}
                </span>

                <span
                  aria-hidden="true"
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                    isOpen
                      ? 'rotate-45 border-accent bg-accent text-white'
                      : 'border-border bg-background text-primary'
                  }`}
                >
                  <Plus size={16} strokeWidth={1.9} />
                </span>
              </button>
            </h3>

            {isOpen && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className="px-5 pb-6 pr-12 text-sm leading-7 text-muted sm:px-6 sm:pr-16"
              >
                {item.answer}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
