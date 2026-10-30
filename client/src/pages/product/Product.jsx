import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AlertTriangle, PackageSearch } from 'lucide-react';

import Button from '../../components/common/Button';
import PageHero from '../../components/common/PageHero';
import PageState from '../../components/common/PageState';
import StorefrontLayout from '../../components/layout/StorefrontLayout';
import ProductFilters from '../../components/product/ProductFilters';
import ProductGrid from '../../components/product/ProductGrid';
import ProductPagination from '../../components/product/ProductPagination';
import ProductToolbar from '../../components/product/ProductToolbar';
import { addToCart, openCartDrawer } from '../../slices/cartSlice';
import { fetchCategories } from '../../slices/categorySlice';
import { fetchProducts, productListQueryKey } from '../../slices/productSlice';
import { fetchPublicVendors } from '../../slices/vendorSlice';
import { selectVendorSystemEnabled } from '../../slices/siteSettingsSlice';
import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
} from '../../slices/wishlistSlice';
import { DEFAULT_SORT } from '../../utils/catalog';
import { getProductFilterOptions } from '../../services/productService';

// Twelve fills three rows of the four-column grid, which is where a page break
// reads naturally.
const PER_PAGE = 12;

// MongoDB ids look like this; only then can the API filter by category.
const isObjectId = (value) => /^[0-9a-fA-F]{24}$/.test(String(value ?? ''));

// /shop is the one collection page: the whole catalog, narrowed by the filters in
// the left rail. A category is just another filter here (?category=kurti-1-piece)
// rather than a page of its own, so every category link — the header, the
// homepage circles, the footer, a search result — lands on this grid. A store
// (?vendor=<id>) is the same idea: the grid narrowed to one store's pieces, which
// is where a store suggested by the search box lands.
//
// Everything is driven by the real endpoints: GET /products for the rows and
// GET /categories for the filter rail.
const Product = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const {
    items = [],
    loading,
    listQueryKey,
    pagination,
    error: productsError,
  } = useSelector((state) => state.products);
  const { items: categoryItems = [], loading: categoriesLoading } = useSelector(
    (state) => state.categories,
  );
  const cart = useSelector((state) => state.cart.cart);
  const wishlist = useSelector((state) => state.wishlist.wishlist);
  const token = useSelector((state) => state.auth.token);
  const { publicItems: publicVendors = [], publicLoaded } = useSelector(
    (state) => state.vendor,
  );
  // A store filter only means something while the vendor system is on; with it
  // off the page shows the plain collection instead.
  const vendorSystemEnabled = useSelector(selectVendorSystemEnabled);

  const [feedback, setFeedback] = useState(null);

  // The rail's size and colour lists come from one small request, kept in page
  // state; if it fails, the rail simply shows the groups it has.
  const [filterOptions, setFilterOptions] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getProductFilterOptions()
      .then((body) => {
        if (!cancelled) setFilterOptions(body?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setFilterOptions(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const search = searchParams.get('search') ?? '';
  const sort = searchParams.get('sort') ?? DEFAULT_SORT;
  const categorySlug = (searchParams.get('category') ?? '').trim().toLowerCase();
  const availability =
    searchParams.get('availability') === 'available' ? 'available' : 'all';
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);

  // Size, colour and price live in the URL like every other filter: comma-
  // joined lists and plain numbers, so a shared link reproduces the view.
  const sizesParam = (searchParams.get('sizes') ?? '').trim();
  const colorsParam = (searchParams.get('colors') ?? '').trim();
  const minPriceParam = (searchParams.get('minPrice') ?? '').trim();
  const maxPriceParam = (searchParams.get('maxPrice') ?? '').trim();
  const minPrice = /^\d+$/.test(minPriceParam) ? Number(minPriceParam) : null;
  const maxPrice = /^\d+$/.test(maxPriceParam) ? Number(maxPriceParam) : null;
  // A floor above the ceiling is rejected by the API, so the pair is held back
  // until it makes sense again instead of turning the grid into an error.
  const priceInRange =
    minPrice === null || maxPrice === null || minPrice <= maxPrice;

  // A store link from the search box: only a real id can filter the API.
  const vendorParam = (searchParams.get('vendor') ?? '').trim();
  const vendorId = vendorSystemEnabled && isObjectId(vendorParam) ? vendorParam : '';
  const vendor = vendorId
    ? publicVendors.find((item) => String(item._id) === vendorId) ?? null
    : null;

  const activeCategory =
    categoryItems.find(
      (category) => String(category.slug ?? '').toLowerCase() === categorySlug,
    ) ?? null;

  // A slug is in the URL but the departments have not arrived yet: hold the
  // request back instead of flashing the whole catalog, then answering with the
  // category. A slug that is not in the list is a real "not found".
  const waitingForCategory = Boolean(categorySlug) && categoryItems.length === 0;
  const categoryMissing =
    Boolean(categorySlug) &&
    !waitingForCategory &&
    !categoriesLoading &&
    !activeCategory;

  const categoryId = activeCategory?._id ?? null;
  const canFilterByCategory = Boolean(categoryId && isObjectId(categoryId));

  const query = useMemo(() => {
    if (categorySlug && !canFilterByCategory) return null;

    return {
      limit: PER_PAGE,
      page,
      sort,
      ...(canFilterByCategory ? { categoryId } : {}),
      ...(vendorId ? { vendorId } : {}),
      ...(search ? { search } : {}),
      ...(availability === 'available' ? { availability } : {}),
      ...(sizesParam ? { sizes: sizesParam } : {}),
      ...(colorsParam ? { colors: colorsParam } : {}),
      ...(priceInRange && minPrice !== null ? { minPrice } : {}),
      ...(priceInRange && maxPrice !== null ? { maxPrice } : {}),
    };
  }, [
    availability,
    canFilterByCategory,
    categoryId,
    categorySlug,
    colorsParam,
    maxPrice,
    minPrice,
    page,
    priceInRange,
    search,
    sizesParam,
    sort,
    vendorId,
  ]);

  useEffect(() => {
    if (query) dispatch(fetchProducts(query));
  }, [dispatch, query]);

  // Opening this page directly skips the homepage, so the rail has no categories
  // to read unless the page loads them itself.
  useEffect(() => {
    if (categoryItems.length === 0) dispatch(fetchCategories());
  }, [dispatch, categoryItems.length]);

  // A store link needs the store's name for the heading. The header search may
  // have loaded the directory already; if not, this is one small request.
  useEffect(() => {
    if (vendorId && !publicLoaded) dispatch(fetchPublicVendors());
  }, [dispatch, publicLoaded, vendorId]);

  // Wishlist state is only available to signed-in customers.
  useEffect(() => {
    if (token && wishlist === null) dispatch(fetchWishlist());
  }, [dispatch, token, wishlist]);

  // Only rows from this page's own request are trusted, so a filter or a sort
  // change never leaves the previous result set on screen.
  const isCurrentQuery = Boolean(query) && productListQueryKey(query) === listQueryKey;
  const listLoading = !query || loading || !isCurrentQuery;
  const visibleProducts = isCurrentQuery && !loading ? items : [];
  const visibleCount = visibleProducts.length;

  const heading = vendor?.storeName
    ? `${vendor.storeName}${activeCategory ? ` · ${activeCategory.name}` : ''}`
    : activeCategory?.name || (search ? `Results for “${search}”` : 'All products');
  const description =
    vendor?.storeDescription ||
    activeCategory?.description ||
    'Every piece we stock in one collection. Narrow it down from the filters — or sort the grid.';

  // Ask the API for the current result set again.
  const retry = () => {
    if (query) dispatch(fetchProducts(query));
  };

  // Write one filter or the sort into the URL.
  const setParam = (key, value) => {
    const params = new URLSearchParams(searchParams);

    if (!value || value === DEFAULT_SORT) {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // A filter change starts a new result set, so it always lands on page one.
    params.delete('page');

    setSearchParams(params, { replace: true });
  };

  // One value in a multi-select list (sizes / colours) toggled in the URL.
  const toggleListParam = (key, value) => {
    const current = (searchParams.get(key) ?? '')
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);

    const next = current.includes(value)
      ? current.filter((entry) => entry !== value)
      : [...current, value];

    setParam(key, next.join(','));
  };

  // Both price bounds are written together, so one edit is one navigation.
  const setPriceRange = ({ min, max }) => {
    const params = new URLSearchParams(searchParams);

    if (min) params.set('minPrice', min);
    else params.delete('minPrice');

    if (max) params.set('maxPrice', max);
    else params.delete('maxPrice');

    params.delete('page');
    setSearchParams(params, { replace: true });
  };

  // Paging keeps every active filter and sort in the URL.
  const hrefForPage = (nextPage) => {
    const params = new URLSearchParams(searchParams);

    if (nextPage <= 1) params.delete('page');
    else params.set('page', String(nextPage));

    const queryString = params.toString();

    return queryString ? `/shop?${queryString}` : '/shop';
  };

  const pages = pagination?.pages ?? 1;

  // Whether the product is already in the saved list.
  const isInWishlist = (productId) =>
    Boolean(
      wishlist?.products?.some(
        (item) => String(item?._id ?? item) === String(productId),
      ),
    );

  // Whether the product is already in the bag.
  const isInCart = (productId) =>
    Boolean(
      cart?.products?.some(
        (item) =>
          String(item?.productId?._id ?? item?.productId) === String(productId),
      ),
    );

  // These two handlers are the only place the cart and wishlist slices are
  // called from this page. Signed-out shoppers are sent to the login page first.
  // The card passes the variant combination it has selected, so the size the
  // shopper picked on the card is the size that reaches the bag.
  const handleAddToCart = (product, variantId = null) => {
    if (!token) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    const sizeLabel = (product.variantCombinations ?? []).find(
      (combination) => String(combination._id) === String(variantId),
    )?.variantName;

    dispatch(addToCart({ productId: product._id, variantId, quantity: 1 }))
      .unwrap()
      .then(() => {
        // The piece is in the bag, so slide the drawer open to show it.
        dispatch(openCartDrawer());

        setFeedback({
          tone: 'success',
          text: `Added “${product.name}”${sizeLabel ? ` (${sizeLabel})` : ''} to your bag.`,
        });
      })
      .catch((message) =>
        setFeedback({ tone: 'error', text: String(message) }),
      );
  };

  // Save the product, or take it back out of the wishlist.
  const handleToggleWishlist = (product) => {
    if (!token) {
      navigate('/login', { state: { from: location.pathname + location.search } });
      return;
    }

    const saved = isInWishlist(product._id);

    dispatch(saved ? removeFromWishlist(product._id) : addToWishlist(product._id))
      .unwrap()
      .then(() =>
        setFeedback({
          tone: 'success',
          text: saved
            ? `Removed “${product.name}” from your wishlist.`
            : `Saved “${product.name}” to your wishlist.`,
        }),
      )
      .catch((message) =>
        setFeedback({ tone: 'error', text: String(message) }),
      );
  };

  // Actions handed to each card in the grid.
  const actionsFor = (product) => ({
    onAddToCart: handleAddToCart,
    onToggleWishlist: handleToggleWishlist,
    inWishlist: isInWishlist(product._id),
    inCart: isInCart(product._id),
  });

  return (
    <StorefrontLayout>
      <>
        <PageHero
          eyebrow={vendor ? 'Store' : activeCategory ? 'Collection' : 'Shop'}
          title={heading}
          description={description}
          breadcrumb={
            vendor
              ? [
                  { label: 'Home', href: '/' },
                  { label: 'Shop', href: '/shop' },
                  { label: vendor.storeName },
                ]
              : activeCategory
                ? [
                    { label: 'Home', href: '/' },
                    { label: 'Collection', href: '/shop' },
                    { label: activeCategory.name },
                  ]
                : [{ label: 'Home', href: '/' }, { label: 'Shop' }]
          }
          image="/images/placeholder-banner.svg"
          imageFallback="/images/placeholder-banner.svg"
        >
          {(activeCategory ||
            availability === 'available' ||
            search ||
            vendorId ||
            sizesParam ||
            colorsParam ||
            minPriceParam ||
            maxPriceParam) && (
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="inline-flex min-h-10 items-center rounded-full border border-white/45 px-5 text-xs font-medium text-white transition-colors hover:border-white hover:bg-white/10"
              >
                Clear filters
              </Link>
            </div>
          )}
        </PageHero>

        <section className="rv-shop-page w-full bg-white py-10 sm:py-12 lg:py-16">
          <div className="mx-auto w-full max-w-[1900px] px-5 sm:px-8 lg:px-10">
            <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-10">
              <ProductFilters
                categories={categoryItems}
                activeCategoryId={categoryId}
                availability={availability}
                onSelectAvailability={(next) => setParam('availability', next)}
                sizes={sizesParam.split(',').filter(Boolean)}
                colors={colorsParam.split(',').filter(Boolean)}
                minPrice={minPriceParam}
                maxPrice={maxPriceParam}
                filterOptions={filterOptions}
                onToggleSize={(value) => toggleListParam('sizes', value)}
                onToggleColor={(value) => toggleListParam('colors', value)}
                onClearSizes={() => setParam('sizes', '')}
                onClearColors={() => setParam('colors', '')}
                onPriceChange={setPriceRange}
              />

              <div className="min-w-0">
                <ProductToolbar
                  count={visibleCount}
                  loading={listLoading}
                  search={search}
                  onClearSearch={() => setParam('search', '')}
                  sort={sort}
                  onSortChange={(next) => setParam('sort', next)}
                />

                {feedback && (
                  <p
                    role="status"
                    className={[
                      'mt-6 rounded-2xl border px-4 py-3 text-xs sm:text-[13px]',
                      feedback.tone === 'error'
                        ? 'border-red-200 bg-red-50 text-red-700'
                        : 'border-peach bg-peach/30 text-primary',
                    ].join(' ')}
                  >
                    {feedback.text}
                  </p>
                )}

                {productsError && (
                  <div
                    role="alert"
                    className="mt-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <p className="flex items-start gap-3 text-xs leading-5 text-red-700 sm:text-[13px]">
                      <AlertTriangle
                        size={18}
                        strokeWidth={1.7}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0"
                      />
                      We couldn&apos;t reach the products API ({productsError}). Check
                      your connection and try again.
                    </p>

                    <Button variant="outline" size="sm" onClick={retry}>
                      Try again
                    </Button>
                  </div>
                )}

                <div className="mt-8">
                  {categoryMissing ? (
                    <PageState
                      title="We couldn't find that category"
                      description={`“${categorySlug}” is not one of the categories in the store. Pick one from the filters instead.`}
                    />
                  ) : visibleCount === 0 && !listLoading ? (
                    <PageState
                      title={
                        search || availability === 'available' || activeCategory || vendorId
                          ? 'No products match these filters'
                          : 'No products yet'
                      }
                      description={
                        search
                          ? `Nothing in the catalog matches “${search}” with these filters. Try a different search.`
                          : 'New pieces are on their way. Try widening the filters, or check back soon.'
                      }
                    />
                  ) : (
                    <ProductGrid
                      products={visibleProducts}
                      loading={listLoading}
                      skeletonCount={PER_PAGE}
                      actionsFor={actionsFor}
                      emptyMessage="No products to show here yet."
                    />
                  )}
                </div>

                {!listLoading && !categoryMissing && (
                  <ProductPagination
                    className="mt-10"
                    page={page}
                    pages={pages}
                    total={pagination?.total ?? 0}
                    limit={pagination?.limit ?? PER_PAGE}
                    hrefForPage={hrefForPage}
                  />
                )}

                {/* A quiet reminder of what the rail is doing, for phones where it
                    folds away. */}
                <p className="mt-8 flex items-center gap-2 text-xs text-muted lg:hidden">
                  <PackageSearch size={15} strokeWidth={1.7} aria-hidden="true" className="text-accent" />
                  {activeCategory
                    ? `Showing ${activeCategory.name}. Open Filters to change the collection.`
                    : 'Open Filters to narrow the collection by category or stock.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </>
    </StorefrontLayout>
  );
};

export default Product;
