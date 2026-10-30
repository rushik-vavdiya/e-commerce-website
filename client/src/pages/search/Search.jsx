import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowRight,
  FileText,
  LayoutGrid,
  Layers,
  PackageSearch,
  Search as SearchIcon,
  Store,
  X,
} from 'lucide-react';

import FallbackImage from '../../components/common/FallbackImage';
import PageState from '../../components/common/PageState';
import StorefrontLayout from '../../components/layout/StorefrontLayout';
import ProductGrid from '../../components/product/ProductGrid';
import { fetchCategories } from '../../slices/categorySlice';
import { fetchProducts, productListQueryKey } from '../../slices/productSlice';
import { fetchPublicVendors } from '../../slices/vendorSlice';
import { selectVendorSystemEnabled } from '../../slices/siteSettingsSlice';
import { searchablePages } from '../../data/searchablePages';
import { searchableCollections } from '../../data/collections';
import {
  searchCategories,
  searchCollections,
  searchPages,
  searchVendors,
} from '../../utils/search';

const PRODUCT_LIMIT = 24;
const GROUP_LIMIT = 6;

const GROUP_HEADING =
  'flex items-center gap-2 font-serif text-2xl font-medium tracking-tight text-primary';

function GroupHeading({ icon: Icon, children, count }) {
  return (
    <h2 className={GROUP_HEADING}>
      <Icon size={20} strokeWidth={1.7} aria-hidden="true" className="text-accent" />
      {children}
      <span className="text-sm font-normal text-muted">({count})</span>
    </h2>
  );
}

// One suggestion drawn the way the reference design draws them: a rounded box
// with a square thumbnail on the left and the name under it. The same shape
// covers every kind of suggestion — a photo where one exists, the group's own
// icon where it does not.
function SuggestionBox({ to, image, imageFallback, icon: Icon, title, subtitle }) {
  return (
    <Link
      to={to}
      className="flex h-full items-center gap-3.5 rounded-2xl border border-border bg-white p-3 transition-colors hover:border-accent/50 hover:bg-peach/20"
    >
      <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-peach/30">
        {image ? (
          <FallbackImage
            src={image}
            fallbackSrc={imageFallback}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <Icon size={18} strokeWidth={1.6} aria-hidden="true" className="text-accent" />
        )}
      </span>

      {/* `min-w-0` on the list item (and a wrapping subtitle) keeps a long
          word from widening the grid column past the page — nowrap text sets
          the column's intrinsic minimum, which would drag the whole row into
          horizontal overflow on a phone. */}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-primary">{title}</span>
        {subtitle && (
          <span className="mt-0.5 line-clamp-2 text-xs leading-4 text-muted">{subtitle}</span>
        )}
      </span>

      <ArrowRight
        size={14}
        strokeWidth={2}
        aria-hidden="true"
        className="shrink-0 text-muted/60"
      />
    </Link>
  );
}

// /search?q= — one page for the whole store: products from GET /products with
// its own `search` filter, plus live categories, collections, stores and the
// storefront's own pages matched locally. Products and stores are the only
// groups that come from the API.
export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const query = (searchParams.get('q') ?? '').trim();

  // The box on this page owns the URL for every screen — the header's icon just
  // brings the shopper here. Submitting swaps ?q=, clearing it drops back to the
  // suggestions; typing alone never touches the URL, so a half-typed word
  // cannot replace the results being read.
  const [draft, setDraft] = useState(query);

  // When the URL's query does change — a submit, a clear, or a shared link —
  // the box follows it. Adjusted during render (React's own pattern for
  // staying in step with a changing value) instead of through an effect, so
  // there is no extra render pass per navigation.
  const [lastQuery, setLastQuery] = useState(query);

  if (query !== lastQuery) {
    setLastQuery(query);
    setDraft(query);
  }

  const submitSearch = (event) => {
    event.preventDefault();

    const next = draft.trim();
    setSearchParams(next ? { q: next } : {});
  };

  const {
    items = [],
    loading,
    listQueryKey,
    error,
  } = useSelector((state) => state.products);
  const { items: allCategories = [] } = useSelector((state) => state.categories);
  const { publicItems: allVendors = [], publicLoaded } = useSelector(
    (state) => state.vendor,
  );
  // With the vendor system off there are no stores to search, so the directory
  // is neither requested nor shown.
  const vendorSystemEnabled = useSelector(selectVendorSystemEnabled);

  const productQuery = useMemo(
    () => (query ? { search: query, limit: PRODUCT_LIMIT, sort: 'newest' } : null),
    [query],
  );

  useEffect(() => {
    if (!productQuery) return;

    dispatch(fetchProducts(productQuery));
  }, [dispatch, productQuery]);

  useEffect(() => {
    if (allCategories.length === 0) dispatch(fetchCategories());
  }, [dispatch, allCategories.length]);

  // The store directory is one request per session; the header may already have
  // asked for it, in which case nothing is sent.
  useEffect(() => {
    if (vendorSystemEnabled && !publicLoaded) dispatch(fetchPublicVendors());
  }, [dispatch, publicLoaded, vendorSystemEnabled]);

  // Only rows from this page's own request are trusted, so a new search never
  // shows the previous result set while the request is in flight.
  const isCurrentQuery = !productQuery || productListQueryKey(productQuery) === listQueryKey;
  const visibleProducts = isCurrentQuery && !loading ? items : [];

  const collections = searchCollections(searchableCollections, query, GROUP_LIMIT);
  const categories = searchCategories(allCategories, query, GROUP_LIMIT);
  const vendors = vendorSystemEnabled
    ? searchVendors(allVendors, query, GROUP_LIMIT)
    : [];
  const pages = searchPages(searchablePages, query, GROUP_LIMIT);
  const totalFound =
    visibleProducts.length +
    collections.length +
    categories.length +
    vendors.length +
    pages.length;

  // The starting suggestions while there is no query — the shop's own fixed
  // starting points, cut to the same limit a matched group uses.
  const suggestCategories = allCategories
    .filter((category) => category?.status === 'active')
    .slice(0, GROUP_LIMIT);
  const suggestCollections = searchableCollections.slice(0, GROUP_LIMIT);
  const suggestVendors = vendorSystemEnabled
    ? allVendors.slice(0, GROUP_LIMIT)
    : [];
  const suggestPages = searchablePages.slice(0, GROUP_LIMIT);
  const suggestCount =
    suggestCategories.length +
    suggestCollections.length +
    suggestVendors.length +
    suggestPages.length;

  const retry = () => {
    if (productQuery) dispatch(fetchProducts(productQuery));
  };

  return (
    <StorefrontLayout>
      <>
        {/* No banner above the results: the search box is the page's own
            heading, so a hero only pushed the first result below the fold. */}
        <section className="w-full bg-white py-12 sm:py-14 lg:py-16">
          <div className="mx-auto flex w-full max-w-[1900px] flex-col gap-12 px-5 sm:px-8 lg:gap-14 lg:px-10">
            {/* The banner used to carry the page heading; keeping it here, out
                of sight, leaves the document with one h1. */}
            <h1 className="sr-only">
              {query ? `Results for ${query}` : 'Search the shop'}
            </h1>

            {/* The search box lives on the page itself for every screen size:
                the header's search icon simply opens this page. */}
            <form
              role="search"
              onSubmit={submitSearch}
              className="mx-auto flex w-full max-w-[640px] items-center gap-2 rounded-full border border-border bg-white py-2 pl-5 pr-2 shadow-[0_16px_38px_-20px_rgba(122,46,31,0.45)] transition-colors focus-within:border-accent"
            >
              <SearchIcon
                size={18}
                strokeWidth={1.8}
                aria-hidden="true"
                className="shrink-0 text-muted"
              />

              <input
                type="search"
                name="page-search"
                autoFocus={!query}
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={`Search products, collections${vendorSystemEnabled ? ', stores' : ''}...`}
                aria-label={`Search products, collections, categories${vendorSystemEnabled ? ', stores' : ''} and pages`}
                autoComplete="off"
                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-primary outline-none placeholder:text-muted focus:ring-0"
              />

              {draft && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => {
                    setDraft('');
                    setSearchParams({});
                  }}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-peach/50 hover:text-primary"
                >
                  <X size={15} aria-hidden="true" />
                </button>
              )}

              <button
                type="submit"
                aria-label="Search"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-background transition-colors hover:bg-accent"
              >
                <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </form>

            {!query ? (
              suggestCount > 0 ? (
                <div className="flex flex-col gap-10 lg:gap-12">
                  <div>
                    <GroupHeading icon={LayoutGrid} count={suggestCategories.length}>
                      Popular categories
                    </GroupHeading>

                    <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {suggestCategories.map((category) => (
                        <li key={category._id ?? category.slug} className="min-w-0">
                          <SuggestionBox
                            to={`/shop?category=${category.slug}`}
                            image={category.image}
                            icon={LayoutGrid}
                            title={category.name}
                            subtitle={category.description}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>

                  {suggestCollections.length > 0 && (
                    <div>
                      <GroupHeading icon={Layers} count={suggestCollections.length}>
                        Collections
                      </GroupHeading>

                      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {suggestCollections.map((collection) => (
                          <li key={collection.id} className="min-w-0">
                            <SuggestionBox
                              to={collection.href}
                              image={collection.image}
                              imageFallback={collection.imageFallback}
                              icon={Layers}
                              title={collection.title}
                              subtitle={collection.description}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suggestVendors.length > 0 && (
                    <div>
                      <GroupHeading icon={Store} count={suggestVendors.length}>
                        Stores
                      </GroupHeading>

                      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {suggestVendors.map((vendor) => (
                          <li key={vendor._id} className="min-w-0">
                            <SuggestionBox
                              to={`/shop?vendor=${vendor._id}`}
                              image={vendor.storeLogo}
                              icon={Store}
                              title={vendor.storeName}
                              subtitle={vendor.storeDescription}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suggestPages.length > 0 && (
                    <div>
                      <GroupHeading icon={FileText} count={suggestPages.length}>
                        Pages
                      </GroupHeading>

                      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {suggestPages.map((page) => (
                          <li key={page.id} className="min-w-0">
                            <SuggestionBox
                              to={page.href}
                              icon={FileText}
                              title={page.title}
                              subtitle={page.description}
                            />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <PageState
                  title="Nothing to search for yet"
                  description={`Use the box above to look through every product, collection, category${vendorSystemEnabled ? ', store' : ''} and page on the site.`}
                />
              )
            ) : (
              <>
                <p className="text-xs font-medium uppercase tracking-[0.24em] text-muted">
                  {totalFound} {totalFound === 1 ? 'match' : 'matches'}
                </p>

                <div>
                  <GroupHeading icon={PackageSearch} count={visibleProducts.length}>
                    Products
                  </GroupHeading>

                  {error && visibleProducts.length === 0 ? (
                    <div className="mt-6">
                      <PageState
                        variant="error"
                        title="We couldn't load the products"
                        description={`${error} — check that the API is running, then try again.`}
                        actionLabel="Try again"
                        onAction={retry}
                      />
                    </div>
                  ) : (
                    <div className="mt-6">
                      <ProductGrid
                        products={visibleProducts}
                        loading={loading || !isCurrentQuery}
                        skeletonCount={4}
                        emptyMessage={`No products match “${query}”. Try a shorter word, or browse the collections below.`}
                      />
                    </div>
                  )}
                </div>

                {collections.length > 0 && (
                  <div>
                    <GroupHeading icon={Layers} count={collections.length}>
                      Collections
                    </GroupHeading>

                    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {collections.map((collection) => (
                        <li key={collection.id}>
                          <Link
                            to={collection.href}
                            className="flex h-full items-center gap-4 rounded-2xl border border-border bg-white p-3 transition-colors hover:border-accent/50"
                          >
                            <span className="size-16 shrink-0 overflow-hidden rounded-xl bg-peach/30">
                              <FallbackImage
                                src={collection.image}
                                fallbackSrc={collection.imageFallback}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover"
                              />
                            </span>

                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-primary">
                                {collection.title}
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-muted">
                                {collection.description}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {categories.length > 0 && (
                  <div>
                    <GroupHeading icon={LayoutGrid} count={categories.length}>
                      Categories
                    </GroupHeading>

                    <ul className="mt-6 flex flex-wrap gap-3">
                      {categories.map((category) => (
                        <li key={category._id ?? category.slug}>
                          <Link
                            to={`/shop?category=${category.slug}`}
                            className="inline-flex min-h-10 items-center rounded-full border border-border bg-background px-4 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
                          >
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {vendors.length > 0 && (
                  <div>
                    <GroupHeading icon={Store} count={vendors.length}>
                      Stores
                    </GroupHeading>

                    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {vendors.map((vendor) => (
                        <li key={vendor._id}>
                          <Link
                            to={`/shop?vendor=${vendor._id}`}
                            className="flex h-full flex-col rounded-2xl border border-border bg-white p-5 transition-colors hover:border-accent/50"
                          >
                            <span className="flex items-center gap-3">
                              <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-peach/30">
                                {vendor.storeLogo ? (
                                  <img
                                    src={vendor.storeLogo}
                                    alt=""
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Store
                                    size={16}
                                    strokeWidth={1.7}
                                    aria-hidden="true"
                                    className="text-accent"
                                  />
                                )}
                              </span>

                              <span className="min-w-0 truncate text-sm font-semibold text-primary">
                                {vendor.storeName}
                              </span>
                            </span>

                            <span className="mt-3 line-clamp-2 text-xs leading-5 text-muted">
                              {vendor.storeDescription}
                            </span>

                            <span className="mt-auto flex items-center gap-1.5 pt-4 text-xs font-semibold text-accent">
                              Shop this store
                              <ArrowRight size={13} strokeWidth={2} aria-hidden="true" />
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pages.length > 0 && (
                  <div>
                    <GroupHeading icon={FileText} count={pages.length}>
                      Pages
                    </GroupHeading>

                    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {pages.map((page) => (
                        <li key={page.id}>
                          <Link
                            to={page.href}
                            className="flex h-full flex-col rounded-2xl border border-border bg-white p-5 transition-colors hover:border-accent/50"
                          >
                            <span className="text-sm font-semibold text-primary">{page.title}</span>
                            <span className="mt-1.5 text-xs leading-5 text-muted">
                              {page.description}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {totalFound === 0 && !loading && (
                  <PageState
                    title={`Nothing matches “${query}”`}
                    description="Check the spelling, try a single word such as “kurti”, or browse the categories from the header."
                  />
                )}
              </>
            )}
          </div>
        </section>
      </>
    </StorefrontLayout>
  );
}
