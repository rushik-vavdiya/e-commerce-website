import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ExternalLink } from 'lucide-react';

import AdminProductForm from '../../components/admin/AdminProductForm';
import AdminProductImages from '../../components/admin/AdminProductImages';
import VariantImagePanel from '../../components/product/VariantImagePanel';
import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import StatusPill from '../../components/dashboard/StatusPill';
import Button from '../../components/common/Button';
import { fetchCategories } from '../../slices/categorySlice';
import {
  addProduct,
  editProduct,
  editProductStatus,
  fetchProduct,
  removeProduct,
  removeProductGalleryImage,
  removeProductMainImage,
  removeVariantGalleryImage,
  removeVariantMainImage,
  saveProductImages,
  saveVariantImages,
} from '../../slices/productSlice';

// /admin/products/new and /admin/products/:productId/edit. A full page rather
// than a drawer, so the product fields and the image panel both have room. The
// backend keeps status out of POST/PUT, so publishing is its own PATCH action.
export default function AdminProductEditor() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products);
  const categories = useSelector((state) => state.categories);

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  // The create flow reports back through navigate state, because its uploads run
  // after the product exists and the page has moved on. The editor is the same
  // component for both routes, so this is read per render rather than captured
  // in useState — a captured value would still be null after the handover.
  const locationNotice = location.state?.notice ?? null;
  const shownNotice = notice ?? locationNotice;

  const isEdit = Boolean(productId);

  const existing =
    products.items.find((item) => String(item._id) === String(productId)) ??
    (String(products.selectedId) === String(productId) ? products.selected : null);

  useEffect(() => {
    dispatch(fetchCategories());

    if (isEdit && !existing) dispatch(fetchProduct(productId));
  }, [dispatch, isEdit, existing, productId]);

  const handleSubmit = async (values, images) => {
    setBusy(true);
    setNotice(null);

    try {
      if (isEdit) {
        await dispatch(editProduct({ productId, product: values })).unwrap();
        setNotice({
          tone: 'success',
          text: 'Product saved. Publish it when an active category and an approved, active vendor are in place.',
        });
        return;
      }

      // Create first: the image endpoints all take a saved product id, and the
      // variant photos need the combination ids that the create call returns.
      const created = await dispatch(addProduct(values)).unwrap();
      const product = created.data;
      const failed = [];

      if (images?.mainImage || images?.galleryImages?.length) {
        try {
          await dispatch(
            saveProductImages({
              productId: product._id,
              images: {
                mainImage: images.mainImage,
                galleryImages: images.galleryImages,
              },
            }),
          ).unwrap();
        } catch (uploadError) {
          failed.push(`the product photos (${uploadError})`);
        }
      }

      // One chosen photo per colour covers several combinations; the photo goes
      // to every one of them so each size of that colour shows it.
      for (const group of images?.variantImages ?? []) {
        const targets = (product.variantCombinations ?? []).filter((combination) =>
          group.variantNames.includes(combination.variantName),
        );

        for (const target of targets) {
          try {
            await dispatch(
              saveVariantImages({
                productId: product._id,
                variantId: target._id,
                images: { mainImage: group.file },
              }),
            ).unwrap();
          } catch (uploadError) {
            failed.push(`the ${target.variantName} photo (${uploadError})`);
            break;
          }
        }
      }

      navigate(`/admin/products/${product._id}/edit`, {
        replace: true,
        state: {
          notice:
            failed.length > 0
              ? {
                  tone: 'error',
                  text: `Product created, but these could not be uploaded: ${[
                    ...new Set(failed),
                  ].join(', ')}. Try them again on this page.`,
                }
              : {
                  tone: 'success',
                  text: 'Product created with its photos. Review it below, then publish once an active category is in place.',
                },
        },
      });
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusy(false);
    }
  };

  const handleStatus = async (status) => {
    setBusy(true);
    setNotice(null);

    try {
      await dispatch(editProductStatus({ productId, status })).unwrap();
      setNotice({
        tone: 'success',
        text:
          status === 'active'
            ? 'Product published to the storefront.'
            : 'Product moved back to draft.',
      });
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    setNotice(null);

    try {
      await dispatch(removeProduct(productId)).unwrap();
      navigate('/admin/products');
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
      setBusy(false);
    }
  };

  const uploadImages = async (files) => {
    await dispatch(saveProductImages({ productId, images: files })).unwrap();
  };

  const deleteMainImage = async () => {
    await dispatch(removeProductMainImage(productId)).unwrap();
  };

  const deleteGalleryImage = async (imageIndex) => {
    await dispatch(removeProductGalleryImage({ productId, imageIndex })).unwrap();
  };

  const uploadVariantImages = async (variantId, images) => {
    await dispatch(saveVariantImages({ productId, variantId, images })).unwrap();
  };

  const deleteVariantMainImage = async (variantId) => {
    await dispatch(removeVariantMainImage({ productId, variantId })).unwrap();
  };

  const deleteVariantGalleryImage = async (variantId, imageIndex) => {
    await dispatch(removeVariantGalleryImage({ productId, variantId, imageIndex })).unwrap();
  };

  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader
        eyebrow="Catalog"
        title={isEdit ? 'Edit product' : 'New product'}
        description={
          isEdit
            ? 'All product fields, its images and its publish state in one place.'
            : 'Add the product, its price and its photos in one pass, then publish it once an active category is in place.'
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/products"
            className="inline-flex min-h-10 items-center rounded-full border border-border bg-white px-5 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
          >
            Back to products
          </Link>

          {isEdit && existing && (
            <>
              <Link
                to={`/products/${existing._id}`}
                className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-white px-5 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
              >
                <ExternalLink size={15} strokeWidth={1.8} aria-hidden="true" />
                View on storefront
              </Link>

              {existing.status === 'active' ? (
                <Button
                  variant="secondary"
                  onClick={() => handleStatus('draft')}
                  disabled={busy}
                >
                  Move to draft
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => handleStatus('active')}
                  disabled={busy}
                >
                  Publish
                </Button>
              )}

              <button
                type="button"
                disabled={busy}
                onClick={handleDelete}
                className="inline-flex min-h-10 items-center rounded-full border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 disabled:opacity-45"
              >
                Delete product
              </button>
            </>
          )}
        </div>
      </DashboardPageHeader>

      {isEdit && existing && (
        <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-white px-5 py-4">
          <StatusPill value={existing.status} />
          <p className="text-xs text-muted">
            {existing.name} · {existing.galleryImages?.length ?? 0} gallery{' '}
            {existing.galleryImages?.length === 1 ? 'image' : 'images'}
            {existing.mainImage ? ' · main image set' : ' · no main image yet'}
          </p>
        </div>
      )}

      {shownNotice && (
        <p
          role={shownNotice.tone === 'success' ? 'status' : 'alert'}
          className={[
            'rounded-3xl border px-5 py-4 text-sm',
            shownNotice.tone === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-peach bg-peach/30 text-primary',
          ].join(' ')}
        >
          {shownNotice.text}
        </p>
      )}

      {isEdit && !existing && products.error && (
        <p role="alert" className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {products.error}
        </p>
      )}

      {/* On a direct link or a refresh the product arrives after the first
          render. Waiting for it means the wizard's initial state is captured
          from real values instead of an empty form that never refills. */}
      {isEdit && !existing && !products.error && (
        <div
          className="rounded-3xl border border-border bg-white p-5 sm:p-6"
          aria-busy="true"
        >
          <div className="h-4 w-40 animate-pulse rounded-full bg-peach/40" />
          <div className="mt-4 flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 animate-pulse rounded-xl bg-peach/25" />
            ))}
          </div>
        </div>
      )}

      {(!isEdit || existing) && (
        <AdminProductForm
          // A fresh form per product: the create wizard ends by navigating here,
          // and the form must not carry its step (or its unsent files) across.
          key={isEdit ? existing._id : 'new-product'}
          initial={existing}
          categories={categories.items}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/admin/products')}
          busy={busy}
        />
      )}

      {/* On a new product the wizard's Images step already collected everything,
          and these panels need a saved id to do anything useful — so they only
          appear when editing. */}
      {isEdit && existing && (
        <>
          <AdminProductImages
            product={existing}
            onUpload={uploadImages}
            onDeleteMain={deleteMainImage}
            onDeleteGallery={deleteGalleryImage}
            busy={busy}
          />

          <VariantImagePanel
            product={existing}
            onUpload={uploadVariantImages}
            onDeleteMain={deleteVariantMainImage}
            onDeleteGallery={deleteVariantGalleryImage}
          />
        </>
      )}

      {categories.items.length === 0 && !categories.loading && (
        <p className="rounded-3xl border border-dashed border-peach bg-peach/25 px-5 py-4 text-xs leading-5 text-muted">
          No categories exist yet, and every product needs one. Create the first
          category on the Categories page.
        </p>
      )}
    </div>
  );
}
