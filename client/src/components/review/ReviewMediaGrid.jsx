// Renders the images and short videos attached to a review. Images open in a
// new tab; videos play inline. Nothing is shown when a review has no media.
export default function ReviewMediaGrid({ media = [], className = '' }) {
  const items = (media ?? []).filter((item) => item?.url);
  if (items.length === 0) return null;

  return (
    <ul className={['mt-3 flex flex-wrap gap-2', className].join(' ').trim()}>
      {items.map((item, index) => (
        <li key={`${item.url}-${index}`}>
          {item.type === 'video' ? (
            <video
              src={item.url}
              controls
              preload="metadata"
              className="h-28 w-40 rounded-xl border border-border bg-black object-cover"
            />
          ) : (
            <a href={item.url} target="_blank" rel="noreferrer">
              <img
                src={item.url}
                alt=""
                loading="lazy"
                className="h-28 w-28 rounded-xl border border-border object-cover"
              />
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
