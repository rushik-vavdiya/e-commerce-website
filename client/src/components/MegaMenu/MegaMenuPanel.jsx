import { Link } from 'react-router-dom';

// The panel body: the category rail, the products of the selected category and
// the featured card, with the bottom bar under all three. It renders the panel's
// content only — the open/close behaviour lives in MegaMenu.jsx.
export default function MegaMenuPanel({
  collections = [],
  featured,
  loading,
  error,
  activeSlug,
  onSelect,
  onNavigate,
}) {
  if (error) {
    return (
      <div className="mm-products">
        <p className="mm-empty">
          <strong>Collections are unavailable</strong>
          {error} The shop page still lists everything we have.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mm-products" aria-busy="true">
        <div className="mm-pane-head">
          <h4>Loading collections…</h4>
        </div>
        <div className="mm-skeleton" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
      </div>
    );
  }

  const active = collections.find((entry) => entry.slug === activeSlug) ?? collections[0];

  if (!active) {
    return (
      <div className="mm-products">
        <p className="mm-empty">
          <strong>Nothing published yet</strong>
          Departments appear here as soon as they are live in the catalogue.
        </p>
      </div>
    );
  }

  const hasProducts = active.products.length > 0;

  return (
    <>
      {/* LEFT: categories */}
      <div className="mm-rail" role="tablist" aria-orientation="vertical" aria-label="Shop by set">
        <h3>Shop by set</h3>

        {collections.map((entry) => (
          <button
            key={entry.slug}
            type="button"
            role="tab"
            aria-selected={entry.slug === active.slug}
            aria-controls={`mm-pane-${entry.slug}`}
            className="mm-tab"
            onMouseEnter={() => onSelect(entry.slug)}
            onFocus={() => onSelect(entry.slug)}
            onClick={() => onSelect(entry.slug)}
          >
            {entry.category}
            <span>{entry.count}</span>
          </button>
        ))}
      </div>

      {/* MIDDLE: products */}
      <div className="mm-products">
        <div
          id={`mm-pane-${active.slug}`}
          role="tabpanel"
          aria-label={active.category}
          className="mm-pane"
        >
          <div className="mm-pane-head">
            <h4>{active.category}</h4>

            {hasProducts && (
              <Link
                to={`/collections/${active.slug}`}
                className="mm-see-all"
                onClick={onNavigate}
              >
                See all
              </Link>
            )}
          </div>

          {hasProducts ? (
            <div className="mm-grid">
              {active.products.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="mm-item"
                  onClick={onNavigate}
                >
                  <span
                    className="mm-sw"
                    style={product.image ? { backgroundImage: `url("${product.image}")` } : undefined}
                    aria-hidden="true"
                  />

                  <span>
                    <b>{product.name}</b>
                    {product.type && <i>{product.type}</i>}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mm-empty">
              <strong>Coming soon</strong>
              We are adding {active.category.toLowerCase()} to the shop. Browse our other
              departments in the meantime.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: featured */}
      {featured && (
        <Link to={featured.href || '/shop'} className="mm-feature" onClick={onNavigate}>
          {featured.eyebrow && <small>{featured.eyebrow}</small>}
          <h5>{featured.title}</h5>
          <span className="mm-cta">{featured.buttonLabel}</span>
        </Link>
      )}

      {/* BOTTOM */}
      <div className="mm-bar">
        <span>Every department, with the filters the shop page offers.</span>
        <Link to="/collections" onClick={onNavigate}>
          View all collections →
        </Link>
      </div>
    </>
  );
}
