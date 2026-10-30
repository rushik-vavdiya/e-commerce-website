import { getContent } from '../../data/content';

// Real Google Maps embed for the studio location.
//
// The URL and the iframe title come from src/data/siteContent.json (keys
// "map.embedUrl" and "map.title"). To point at another place, copy the new URL
// from Google Maps -> Share -> Embed a map and replace the value in the JSON.
const MAP_EMBED_URL = getContent('map.embedUrl');
const MAP_TITLE = getContent('map.title');

// Responsive wrapper around the iframe so the map keeps its proportions on
// phones and grows on desktop.
export default function GoogleMap({
  title = MAP_TITLE,
  minHeight = 280,
  maxHeight = 520,
  className = '',
}) {
  return (
    <div
      className={[
        'relative w-full overflow-hidden rounded-3xl border border-border bg-peach/25',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ height: `clamp(${minHeight}px, 48vw, ${maxHeight}px)` }}
    >
      <iframe
        src={MAP_EMBED_URL}
        title={title}
        width="100%"
        height="100%"
        loading="lazy"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        style={{ border: 0 }}
        className="block h-full w-full"
      />
    </div>
  );
}
