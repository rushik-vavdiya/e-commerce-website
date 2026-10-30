// A small photo mosaic that sits beside the About intro copy: four tiles of
// different shapes (one wide, one tall, two square-ish) so the column reads
// like a studio wall rather than a stack of identical cards.
//
// Each source is picked to suit its tile: the wide tile takes a landscape
// photograph, the tall one a portrait. Every tile crops with object-cover and
// `position` decides which part survives.
const tiles = [
  {
    id: 'studio-wide',
    src: '/images/festive.png',
    className: 'col-span-2',
    position: '50% 26%',
  },
  {
    id: 'studio-tall',
    src: '/images/casual.png',
    className: 'row-span-2',
    position: '52% 34%',
  },
  {
    id: 'studio-detail',
    src: '/images/festival.png',
    className: '',
    position: '62% 42%',
  },
  {
    id: 'studio-fabric',
    src: '/images/party.png',
    className: '',
    position: '48% 30%',
  },
];

export default function AboutStudioCollage({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      // A set height per breakpoint, not h-full: inside the intro grid the row
      // height follows the copy, and h-full let the tall tile drive the grid
      // instead — which left a 950px band of white space beside the paragraph.
      className={[
        'grid h-[240px] grid-cols-3 grid-rows-2 gap-2.5 sm:h-[300px] sm:gap-3 lg:h-[380px]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {tiles.map((tile) => (
        <div
          key={tile.id}
          className={[
            'relative min-h-0 overflow-hidden rounded-2xl border border-border bg-peach/30',
            tile.className,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <img
            src={tile.src}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
            style={{ objectPosition: tile.position }}
          />
        </div>
      ))}
    </div>
  );
}
