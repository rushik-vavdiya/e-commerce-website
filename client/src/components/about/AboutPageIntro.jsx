import AboutStudioCollage from './AboutStudioCollage';
import Container from '../common/Container';
import { getContent } from '../../data/content';

// The intro copy comes from src/data/siteContent.json (key "about.intro").
const intro = getContent('about.intro', {});

// Intro band directly under the banner: the copy sits on the left and the
// studio mosaic on the right, so the page opens with words and photography side
// by side. On phones the copy comes first and the collage stacks underneath.
export default function AboutPageIntro() {
  const { eyebrow, title, description } = intro;

  return (
    <section className="w-full border-b border-border bg-white">
      <Container className="grid items-center gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:gap-16 lg:py-20">
        <div className="min-w-0 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
            {eyebrow}
          </p>

          <h2 className="mt-4 font-serif text-3xl font-medium leading-tight tracking-tight text-primary sm:text-4xl lg:text-[42px]">
            {title}
          </h2>

          <p className="mt-4 text-sm leading-7 text-muted sm:text-base sm:leading-8">
            {description}
          </p>
        </div>

        <AboutStudioCollage className="w-full" />
      </Container>
    </section>
  );
}
