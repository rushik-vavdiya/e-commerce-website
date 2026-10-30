import { AlertTriangle, Package, PackageCheck, PauseCircle, Star, Warehouse } from 'lucide-react';

import StatCard from '../dashboard/StatCard';

const inStock = (product) =>
  Number(product?.stock ?? 0) > 0 ||
  (product?.variantCombinations ?? []).some((variant) => Number(variant.stock) > 0);

// Numbers are derived from the vendor's own products (GET /products with a vendor
// token). There is no vendor order or sales endpoint, so nothing here pretends to
// be revenue — the last card says so instead of inventing a figure.
export default function VendorStats({ products = [], loading = false, demo = false }) {
  const published = products.filter((product) => product.status === 'active').length;
  const drafts = products.filter((product) => product.status !== 'active').length;
  const outOfStock = products.filter((product) => !inStock(product)).length;
  const totalStock = products.reduce((total, product) => {
    const variantStock = (product.variantCombinations ?? []).reduce(
      (sum, variant) => sum + Number(variant.stock || 0),
      0,
    );
    return total + Number(product.stock || 0) + variantStock;
  }, 0);

  const reviews = products.reduce(
    (total, product) => total + Number(product.reviewCount || 0),
    0,
  );
  const rated = products.filter((product) => Number(product.ratingAverage) > 0);
  const averageRating =
    rated.length > 0
      ? rated.reduce((total, product) => total + Number(product.ratingAverage), 0) /
        rated.length
      : null;

  const cards = [
    { label: 'Products', value: products.length, Icon: Package, caption: 'Rows owned by your store.' },
    { label: 'Published', value: published, Icon: PackageCheck, caption: 'Visible on the storefront.' },
    { label: 'Drafts', value: drafts, Icon: PauseCircle, caption: 'Saved but not published; an admin publishes a draft.' },
    { label: 'Out of stock', value: outOfStock, Icon: AlertTriangle, caption: 'Nothing available to sell right now.' },
    { label: 'Units on hand', value: totalStock, Icon: Warehouse, caption: 'Product stock plus variant stock.' },
    { label: 'Approved reviews', value: reviews, Icon: Star, caption: 'Reviews customers can see on your products.' },
    {
      label: 'Average rating',
      value: averageRating === null ? '—' : averageRating.toFixed(2),
      Icon: Star,
      caption: 'Across your products that have approved reviews.',
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <li key={card.label}>
            <StatCard {...card} loading={loading} />
          </li>
        ))}
      </ul>

      <p className="rounded-3xl border border-dashed border-peach bg-peach/25 px-5 py-4 text-xs leading-5 text-muted sm:text-[13px] sm:leading-6">
        <span className="font-semibold text-primary">Orders and sales are not available yet.</span>{' '}
        The backend has no vendor order, payout or revenue endpoint (orders are
        readable by the customer who placed them and by an admin), so this
        dashboard cannot show your order book or sales totals
        {demo ? ' — the preview uses clearly labelled demo numbers instead.' : '.'}
      </p>
    </div>
  );
}
