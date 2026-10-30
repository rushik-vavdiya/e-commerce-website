// Shared layout for the policy pages. Both pages are the same shape — heading,
// intro, then sections — so the markup lives here once instead of twice.
// The outer container matches every other page section; the text keeps a
// narrower measure so long policy paragraphs stay readable.
//
// The page that uses this owns the StorefrontLayout, so this is one band of a
// page built from sections, not a whole page.
export default function LegalPage({ eyebrow, title, intro, reviewedOn, sections = [] }) {
  return (
    <article className="w-full bg-background">
      <div className="mx-auto w-full max-w-[1900px] px-5 py-14 sm:px-8 lg:py-20">
        <div className="max-w-[860px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            {eyebrow}
          </p>

          <h1 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-primary sm:text-4xl">
            {title}
          </h1>

          {intro && <p className="mt-4 text-sm leading-7 text-muted sm:text-base">{intro}</p>}

          {reviewedOn && (
            <p className="mt-3 text-xs text-muted">Last reviewed: {reviewedOn}</p>
          )}

          <div className="mt-10 flex flex-col gap-8">
            {sections.map((section, index) => (
              <section key={section.heading} className="border-t border-border pt-6">
                <h2 className="text-base font-medium text-primary">
                  {index + 1}. {section.heading}
                </h2>

                <div className="mt-3 flex flex-col gap-3">
                  {(section.body ?? []).map((paragraph) => (
                    <p key={paragraph} className="text-sm leading-7 text-muted">
                      {paragraph}
                    </p>
                  ))}

                  {section.points?.length > 0 && (
                    <ul className="ml-1 flex list-disc flex-col gap-2 pl-5">
                      {section.points.map((point) => (
                        <li key={point} className="text-sm leading-7 text-muted">
                          {point}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
