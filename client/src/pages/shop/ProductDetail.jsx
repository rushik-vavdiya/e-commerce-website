import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ChevronRight,
  Heart,
  ImageOff,
  Minus,
  PackageSearch,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from 'lucide-react';

import StorefrontLayout from '../../components/layout/StorefrontLayout';
import ProductGrid from '../../components/product/ProductGrid';
import ProductInformation from '../../components/product/ProductInformation';
import ProductReviews from '../../components/product/ProductReviews';
import VariantPicker from '../../components/product/VariantPicker';
import { addToCart, openCartDrawer } from '../../slices/cartSlice';
import { fetchProduct, fetchProducts } from '../../slices/productSlice';
import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
} from '../../slices/wishlistSlice';
import { discountPercent, formatPrice } from '../../utils/format';
import {
  defaultSelection,
  productColours,
  productSizes,
} from '../../utils/variants';

// /products/:productId — renders the row from GET /products/:id. The related
// strip comes from its own GET /products request for the same department.
// The id is used as a key so opening another product starts from a clean
// gallery, quantity and feedback state.
const ProductDetail = () => {
  const { productId = '' } = useParams();

  return <ProductDetailView key={productId} productId={productId} />;
};

// Render one product's gallery, details and related strip.
const ProductDetailView = ({ productId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { selected, loading, selectedId } = useSelector(
    (state) => state.products,
  );
  const token = useSelector((state) => state.auth.token);
  const wishlist = useSelector((state) => state.wishlist.wishlist);

  const [activeImage, setActiveImage] = useState(null);
  // What the shopper has picked. Until they touch it, the page falls back to the
  // product's own defaults (first colour, first size in stock) below, so no state
  // has to be seeded from an effect.
  const [choice, setChoice] = useState({ colour: null, size: null });
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [wishlistNotice, setWishlistNotice] = useState(null);
  // The related strip keeps the category it belongs to, so rows from a product
  // the shopper has already left are never shown under the new one.
  const [relatedRows, setRelatedRows] = useState({ categoryId: null, rows: [] });

  useEffect(() => {
    dispatch(fetchProduct(productId));
  }, [dispatch, productId]);

  // Wishlist state is only available to a signed-in customer.
  useEffect(() => {
    if (token && wishlist === null) dispatch(fetchWishlist());
  }, [dispatch, token, wishlist]);

  // Only the row this page asked for is shown. The related strip loads through
  // the same slice, so it cannot decide whether this page has its product.
  const loadedForThisId = selectedId === productId && selected?._id === productId;
  const product = loadedForThisId ? selected : null;
  // Only this product's own request counts here. The products slice also loads
  // the related strip, and treating that shared `loading` flag as "this page is
  // loading" would drop the page back to the skeleton on every related request.
  const pending = selectedId !== productId || (loading && !loadedForThisId);

  // A fresh product opens on the first colour and the first size that is really
  // in stock, so the page starts on something that can be ordered.
  const start = useMemo(() => defaultSelection(product), [product]);
  const colour = choice.colour ?? start.colour;
  const size = choice.size ?? start.size;

  const colours = useMemo(() => productColours(product), [product]);
  const sizes = useMemo(() => productSizes(product, colour), [product, colour]);

  const chosenSize = sizes.find((entry) => entry.label === size) ?? null;
  const chosenCombination = chosenSize?.combination ?? null;
  const colourImage =
    colours.find((entry) => entry.name === colour)?.image ?? null;

  // The photo of the chosen colour leads the gallery, so switching colour swaps
  // the big image.
  const images = useMemo(
    () =>
      [colourImage, product?.mainImage, ...(product?.galleryImages ?? [])].filter(
        (value, index, list) => value && list.indexOf(value) === index,
      ),
    [colourImage, product],
  );

  const heroImage = activeImage ?? images[0] ?? null;
  const discount = discountPercent(product?.price, product?.comarePrice);
  const inStock =
    sizes.length > 0
      ? Number(chosenCombination?.stock ?? 0) > 0
      : Number(product?.stock ?? 0) > 0;
  const specifications = product?.productSpecifications ?? [];

  // Related pieces come from the same department, through a real API request.
  // The strip stays hidden while that request runs, and never shows the product
  // the shopper is already looking at.
  const categoryId = product?.categoryId?._id ?? product?.categoryId ?? null;

  useEffect(() => {
    if (!categoryId) return undefined;

    let cancelled = false;

    dispatch(fetchProducts({ categoryId, limit: 4, sort: 'newest' }))
      .unwrap()
      .then((result) => {
        if (cancelled) return;

        setRelatedRows({
          categoryId,
          rows: (result?.data ?? []).filter((row) => row._id !== productId),
        });
      })
      .catch(() => {
        if (!cancelled) setRelatedRows({ categoryId, rows: [] });
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, categoryId, productId]);

  // A product with no department has nothing to show, and the strip is loading
  // until the rows for this exact category have arrived.
  const related =
    relatedRows.categoryId === categoryId ? relatedRows.rows : [];
  const relatedLoading = Boolean(categoryId) && relatedRows.categoryId !== categoryId;

  // A category is a filter on the collection page, so this link opens the grid
  // already narrowed to the product's own category.
  const categoryHref = product?.categorySlug
    ? `/shop?category=${product.categorySlug}`
    : '/shop';

  // The API sends the category name with the product; older rows only carry the
  // slug, so it is turned into a readable label here.
  const categoryName =
    product?.categoryName ||
    (product?.categorySlug
      ? product.categorySlug
          .split('-')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
      : 'Shop');

  const savedToWishlist = Boolean(
    wishlist?.products?.some(
      (item) => String(item?._id ?? item) === String(productId),
    ),
  );

  // Save the product to the wishlist, or take it out again.
  const handleToggleWishlist = async () => {
    if (!product) return;

    if (!token) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setWishlistBusy(true);
    setWishlistNotice(null);

    try {
      await dispatch(
        savedToWishlist ? removeFromWishlist(product._id) : addToWishlist(product._id),
      ).unwrap();

      setWishlistNotice({
        tone: 'success',
        text: savedToWishlist
          ? 'Removed from your wishlist.'
          : 'Saved to your wishlist.',
      });
    } catch (message) {
      setWishlistNotice({ tone: 'error', text: String(message) });
    } finally {
      setWishlistBusy(false);
    }
  };

  // Put the chosen size and quantity into the bag.
  const handleAddToCart = async () => {
    if (!product) return;

    if (!token) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // The chosen size travels as the variant id, which is what the cart and the
    // order both keep.
    const result = await dispatch(
      addToCart({
        productId: product._id,
        variantId: chosenCombination?._id ?? null,
        quantity,
      }),
    );
    setAdded(true);

    // A successful add slides the cart drawer open, so the shopper sees the
    // size and quantity that actually landed in the bag.
    if (addToCart.fulfilled.match(result)) {
      dispatch(openCartDrawer());
    }
  };

  if (pending) {
    return (
      <StorefrontLayout>
        <div className="mx-auto w-full max-w-[1900px] px-5 py-14 sm:px-8 lg:px-10">
          <div className="grid animate-pulse gap-10 lg:grid-cols-2">
            <div className="aspect-[4/5] w-full rounded-3xl bg-peach/40" />
            <div className="flex flex-col gap-4">
              <div className="h-4 w-24 rounded-full bg-peach/60" />
              <div className="h-8 w-3/4 rounded-full bg-peach/60" />
              <div className="h-5 w-32 rounded-full bg-peach/50" />
              <div className="h-24 w-full rounded-2xl bg-peach/40" />
              <div className="h-12 w-52 rounded-full bg-peach/50" />
            </div>
          </div>
        </div>
      </StorefrontLayout>
    );
  }

  if (!product) {
    return (
      <StorefrontLayout>
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-5 py-20 text-center sm:px-8">
          <span
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-full bg-peach/50 text-accent"
          >
            <PackageSearch size={26} strokeWidth={1.6} />
          </span>

          <h1 className="font-serif text-2xl font-medium text-primary">
            We couldn&apos;t find that product
          </h1>

          <p className="text-sm text-muted">
            The product you are looking for is no longer in the catalog.
          </p>

          <Link
            to="/shop"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-accent"
          >
            Browse all products
          </Link>
        </div>
      </StorefrontLayout>
    );
  }

  return (
    <StorefrontLayout>
      <section className="rv-product-detail w-full bg-white">
        <div className="rv-product-detail-inner mx-auto w-full max-w-[1900px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
          <nav aria-label="Breadcrumb" className="text-xs text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link to="/" className="transition-colors hover:text-accent">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  to="/shop"
                  className="transition-colors hover:text-accent"
                >
                  Shop
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link
                  to={categoryHref}
                  className="transition-colors hover:text-accent"
                >
                  {categoryName}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="max-w-[45vw] truncate font-medium text-primary sm:max-w-none">
                {product.name}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-14">
            {/* Gallery */}
            <div className="flex min-w-0 flex-col">
              {/* The photographs are full-length 2:3 portraits, so the frame is
                  the same shape and the image is fitted inside it — the whole
                  garment stays visible instead of being cropped. From lg up the
                  frame also stretches to the height of the details column, so
                  the two columns end on the same line instead of leaving empty
                  space under the photograph. */}
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-3xl border border-border bg-peach/25 lg:aspect-auto lg:min-h-[520px] lg:flex-1">
                {heroImage ? (
                  <img
                    src={heroImage}
                    alt={product.name}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                ) : (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted">
                    <ImageOff size={30} strokeWidth={1.5} aria-hidden="true" />
                    <span className="text-xs">Image coming soon</span>
                  </span>
                )}

                {discount ? (
                  <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white">
                    {discount}% off
                  </span>
                ) : null}
              </div>

              {images.length > 1 && (
                <ul className="mt-4 flex items-center gap-3">
                  {images.map((image, index) => (
                    <li key={image + index}>
                      <button
                        type="button"
                        onClick={() => setActiveImage(image)}
                        aria-label={`Show image ${index + 1}`}
                        aria-current={heroImage === image}
                        className={`block size-20 overflow-hidden rounded-2xl border transition-colors ${
                          heroImage === image
                            ? 'border-accent'
                            : 'border-border hover:border-accent/60'
                        }`}
                      >
                        <img
                          src={image}
                          alt=""
                          loading="lazy"
                          className="h-full w-full bg-peach/20 object-contain"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Details */}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-accent">
                {categoryName}
              </p>

              <h1 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-tight text-primary sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted">
                <span className="flex items-center gap-1.5">
                  <Star
                    size={15}
                    strokeWidth={1.6}
                    className="fill-accent text-accent"
                    aria-hidden="true"
                  />
                  <span className="font-medium text-primary">
                    {Number(product.ratingAverage || 0).toFixed(1)}
                  </span>
                  <span>({product.reviewCount ?? 0} reviews)</span>
                </span>

                <span aria-hidden="true" className="text-border">
                  |
                </span>

                <span
                  className={inStock ? 'text-primary' : 'font-medium text-accent'}
                >
                  {inStock ? 'In stock' : 'Out of stock'}
                </span>

                {product.sku && (
                  <>
                    <span aria-hidden="true" className="text-border">
                      |
                    </span>
                    <span>SKU {product.sku}</span>
                  </>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-semibold text-primary">
                  {formatPrice(product.price)}
                </span>

                {discount ? (
                  <>
                    <span className="text-base text-muted line-through">
                      {formatPrice(product.comarePrice)}
                    </span>

                    <span className="rounded-full bg-peach/60 px-3 py-1 text-xs font-semibold text-primary">
                      Save {formatPrice(product.comarePrice - product.price)}
                    </span>
                  </>
                ) : null}
              </div>

              <p className="mt-6 text-sm leading-7 text-muted">
                {product.description}
              </p>

              {/* Colour and size, read from the product record. Choosing a
                  colour moves the gallery and the add-to-bag line with it. */}
              <VariantPicker
                product={product}
                colour={colour}
                size={size}
                onColourChange={(next) => {
                  const firstAvailable = productSizes(product, next).find(
                    (entry) => entry.stock > 0,
                  );
                  setChoice({ colour: next, size: firstAvailable?.label ?? null });
                  setActiveImage(null);
                }}
                onSizeChange={(next) =>
                  setChoice((current) => ({ ...current, size: next }))
                }
              />

              {/* Quantity + add to bag */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex items-center rounded-full border border-border bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) => Math.max(1, value - 1))
                    }
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="flex size-11 items-center justify-center rounded-full text-primary transition-colors hover:text-accent disabled:opacity-40"
                  >
                    <Minus size={16} strokeWidth={1.8} aria-hidden="true" />
                  </button>

                  <span
                    aria-live="polite"
                    className="min-w-8 text-center text-sm font-medium text-primary"
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((value) => Math.min(999, value + 1))
                    }
                    aria-label="Increase quantity"
                    className="flex size-11 items-center justify-center rounded-full text-primary transition-colors hover:text-accent"
                  >
                    <Plus size={16} strokeWidth={1.8} aria-hidden="true" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  title={
                    inStock
                      ? `Add size ${chosenSize?.label ?? ''} to your bag`.trim()
                      : 'This size is out of stock'
                  }
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-medium text-white transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-55 sm:flex-none"
                >
                  <ShoppingBag size={18} strokeWidth={1.7} aria-hidden="true" />
                  {inStock
                    ? chosenSize
                      ? `Add size ${chosenSize.label} to bag`
                      : 'Add to bag'
                    : 'Out of stock'}
                </button>

                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  disabled={wishlistBusy}
                  aria-pressed={savedToWishlist}
                  aria-label={
                    savedToWishlist
                      ? `Remove ${product.name} from your wishlist`
                      : `Save ${product.name} to your wishlist`
                  }
                  className={[
                    'inline-flex size-12 items-center justify-center rounded-full border transition-colors',
                    savedToWishlist
                      ? 'border-accent bg-peach/40 text-accent'
                      : 'border-border bg-white text-primary hover:border-accent hover:text-accent',
                    'disabled:cursor-not-allowed disabled:opacity-55',
                  ].join(' ')}
                >
                  <Heart
                    size={19}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className={savedToWishlist ? 'fill-accent text-accent' : ''}
                  />
                </button>
              </div>

              <p className="mt-3 text-xs text-muted" aria-live="polite">
                  {added
                    ? `Added to your bag${chosenSize ? ` in size ${chosenSize.label}` : ''}.`
                    : token
                      ? 'Signed in — this item is added to your cart.'
                      : 'You will be asked to sign in before the item is added.'}
                </p>

              {wishlistNotice && (
                <p
                  role={wishlistNotice.tone === 'success' ? 'status' : 'alert'}
                  className={[
                    'mt-3 rounded-2xl border px-4 py-3 text-xs',
                    wishlistNotice.tone === 'error'
                      ? 'border-red-200 bg-red-50 text-red-700'
                      : 'border-peach bg-peach/30 text-primary',
                  ].join(' ')}
                >
                  {wishlistNotice.text}{' '}
                  <Link to="/wishlist" className="font-semibold underline">
                    View wishlist
                  </Link>
                </p>
              )}

              {/* Service promises */}
              <ul className="mt-8 grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
                <li className="flex items-start gap-3">
                  <Truck
                    size={19}
                    strokeWidth={1.6}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-accent"
                  />
                  <span className="text-xs leading-5 text-muted">
                    Free shipping over ₹999
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <RotateCcw
                    size={19}
                    strokeWidth={1.6}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-accent"
                  />
                  <span className="text-xs leading-5 text-muted">
                    Easy 7 day returns
                  </span>
                </li>

                <li className="flex items-start gap-3">
                  <ShieldCheck
                    size={19}
                    strokeWidth={1.6}
                    aria-hidden="true"
                    className="mt-0.5 shrink-0 text-accent"
                  />
                  <span className="text-xs leading-5 text-muted">
                    Secure checkout
                  </span>
                </li>
              </ul>

              {specifications.length > 0 && (
                <div className="mt-8 rounded-3xl border border-border bg-background p-5">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                    Details
                  </h2>

                  <dl className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,140px)_minmax(0,1fr)]">
                    {specifications.map((item, index) => (
                      <div
                        key={`${item.key}-${index}`}
                        className="contents"
                      >
                        <dt className="text-xs font-medium text-muted">
                          {item.key}
                        </dt>
                        <dd className="text-xs text-primary sm:border-b sm:border-border sm:pb-3">
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>

          {/* Product information only ever shows fields present on the record. */}
          <ProductInformation product={product} />

          {/* Reviews need a real product id for GET /reviews/product/:id. */}
          {product && <ProductReviews productId={product._id} product={product} />}

          {related.length > 0 && (
            <section className="mt-16 border-t border-border pt-12">
              <div className="flex items-end justify-between gap-5">
                <h2 className="font-serif text-2xl font-medium tracking-tight text-primary sm:text-3xl">
                  You may also like
                </h2>

                <Link
                  to={categoryHref}
                  className="group inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-accent"
                >
                  More in {categoryName}
                  <ChevronRight
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Link>
              </div>

              <div className="mt-8">
                <ProductGrid products={related} loading={relatedLoading} />
              </div>
            </section>
          )}
        </div>
      </section>
    </StorefrontLayout>
  );
};

export default ProductDetail;
