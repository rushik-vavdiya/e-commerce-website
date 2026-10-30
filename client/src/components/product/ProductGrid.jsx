import ProductCard from './ProductCard';

// One grid for every product list in the storefront: the shop, search, the
// related row on a product page and the homepage bands all render the same card,
// so a product looks the same wherever it is found.
const gridClass =
  'grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-6';

const SkeletonCard = () => (
  <div className="animate-pulse overflow-hidden rounded-2xl border border-border bg-white">
    <div className="aspect-[2/3] w-full bg-peach/40" />
    <div className="flex flex-col gap-3 p-4">
      <div className="h-4 w-full rounded-full bg-peach/60" />
      <div className="h-4 w-24 rounded-full bg-peach/50" />
      <div className="h-10 w-full rounded-full bg-peach/40" />
    </div>
  </div>
);

// Rows from the real products API. While a request is in flight the grid shows
// skeletons; with no rows it shows a plain empty message.
//
// `placeholderImages` are the stand-in photos used for products that have no
// photo of their own yet, cycled in order.
export default function ProductGrid({
  products = [],
  loading = false,
  badge,
  skeletonCount = 4,
  emptyMessage = 'No products to show here yet.',
  actionsFor = null,
  placeholderImages = [],
}) {
  if (loading && products.length === 0) {
    return (
      <div className={gridClass} aria-busy="true" aria-label="Loading products">
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-background px-5 py-8 text-center text-sm text-muted">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className={gridClass}>
      {products.map((product, index) => {
        const placeholderImage =
          placeholderImages.length > 0
            ? placeholderImages[index % placeholderImages.length]
            : '';

        return (
          <li key={product._id}>
            <ProductCard
              product={product}
              badge={badge}
              placeholderImage={placeholderImage}
              actions={actionsFor ? actionsFor(product) : null}
            />
          </li>
        );
      })}
    </ul>
  );
}
