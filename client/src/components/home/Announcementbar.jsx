import { useContentList } from '../../hooks/useSiteContent';
import { contentIcon } from '../../utils/contentIcons';

// The three messages in the top bar come from the content slice
// (key "announcements"), each naming its own icon.

// One deep maroon strip across the top of the page. On phones only the first
// message fits, so the others appear from the small breakpoint up.
export default function AnnouncementBar() {
  const announcements = useContentList('announcements');

  if (announcements.length === 0) return null;

  return (
    <div className="w-full bg-bar text-[#FDF3EC]">
      {/* The bar keeps the home page's 1900px container and gutters, so its two
          ends sit over the same edges as the sections below it. */}
      <ul className="mx-auto flex max-w-[1900px] items-center justify-center gap-8 px-5 py-2 sm:justify-between sm:px-8 lg:px-10">
        {announcements.map(({ id, text, icon }, index) => {
          const Icon = contentIcon(icon);

          return (
            <li
              key={id}
              className={[
                'flex shrink-0 items-center gap-2',
                index > 0 ? 'hidden sm:flex' : '',
              ].join(' ')}
            >
              <Icon size={14} strokeWidth={1.8} aria-hidden="true" className="text-[#E7C4C0]" />

              <span className="whitespace-nowrap text-[11px] font-medium tracking-[0.04em] sm:text-xs">
                {text}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
