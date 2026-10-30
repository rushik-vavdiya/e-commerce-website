import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

import useMegaMenuData from '../../hooks/useMegaMenuData';
import './MegaMenu.css';

// The phone version of the Collections menu: a plain accordion inside the
// drawer. The mega panel is never rendered below 900px, so this is the only way
// to reach the departments there. It reads the same hook, so both are fed by the
// one cached request.
export default function MobileCollections({ label = 'Collections', onNavigate }) {
  const [open, setOpen] = useState(false);
  const [openSlug, setOpenSlug] = useState(null);

  const { collections, loading, error } = useMegaMenuData();

  return (
    <div className={`mm-mobile-group${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="mm-mobile-toggle"
        aria-expanded={open}
        aria-controls="mm-mobile-body"
        onClick={() => setOpen((current) => !current)}
      >
        {label}
        <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
      </button>

      {open && (
        <div id="mm-mobile-body" className="mm-mobile-body">
          {loading && <p className="mm-mobile-all">Loading collections…</p>}

          {error && <p className="mm-mobile-all">{error}</p>}

          {!loading &&
            !error &&
            collections.length === 0 && <p className="mm-mobile-all">Nothing published yet.</p>}

          {collections.map((entry) => {
            const isOpen = openSlug === entry.slug;

            return (
              <div key={entry.slug}>
                <button
                  type="button"
                  className="mm-mobile-cat"
                  aria-expanded={isOpen}
                  aria-controls={`mm-mobile-${entry.slug}`}
                  onClick={() => setOpenSlug(isOpen ? null : entry.slug)}
                >
                  {entry.category}
                  <span>{entry.count}</span>
                </button>

                {isOpen && (
                  <div id={`mm-mobile-${entry.slug}`} className="mm-mobile-products">
                    {entry.products.length === 0 ? (
                      <p className="mm-mobile-all">Coming soon.</p>
                    ) : (
                      <>
                        {entry.products.map((product) => (
                          <Link
                            key={product._id}
                            to={`/products/${product._id}`}
                            onClick={onNavigate}
                          >
                            {product.name}
                            {product.type && <small>{product.type}</small>}
                          </Link>
                        ))}

                        <Link
                          to={`/collections/${entry.slug}`}
                          className="mm-mobile-all"
                          onClick={onNavigate}
                        >
                          See all {entry.category} →
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <Link to="/collections" className="mm-mobile-all" onClick={onNavigate}>
            View all collections →
          </Link>
        </div>
      )}
    </div>
  );
}
