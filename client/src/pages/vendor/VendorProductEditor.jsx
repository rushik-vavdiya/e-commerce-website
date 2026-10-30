import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import DashboardPageHeader from '../../components/dashboard/DashboardPageHeader';
import VariantImagePanel from '../../components/product/VariantImagePanel';
import VendorProductForm from '../../components/vendor/VendorProductForm';
import { fetchCategories } from '../../slices/categorySlice';
import {
  addProduct,
  editProduct,
  fetchProduct,
  fetchProducts,
  removeVariantGalleryImage,
  removeVariantMainImage,
  saveVariantImages,
} from '../../slices/productSlice';
import { fetchMyVendor } from '../../slices/vendorSlice';

// /vendor/products/new and /vendor/products/:productId/edit. The form is the same
// component for both; only the submit action and the heading differ.
export default function VendorProductEditor() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const products = useSelector((state) => state.products);
  const categories = useSelector((state) => state.categories);
  const vendor = useSelector((state) => state.vendor);

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const isEdit = Boolean(productId);

  const existing =
    products.items.find((item) => String(item._id) === String(productId)) ??
    (String(products.selectedId) === String(productId) ? products.selected : null);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchMyVendor());

    // Editing needs the row, and a vendor may read their own drafts.
    if (isEdit && !existing) {
      dispatch(fetchProduct(productId));
    }
  }, [dispatch, isEdit, existing, productId]);

  const canCreate =
    !vendor.current ||
    (vendor.current.approvalStatus === 'approved' && vendor.current.status === 'active');

  const blockedReason = canCreate
    ? null
    : `Your store is ${vendor.current?.approvalStatus} / ${vendor.current?.status}. The products API refuses vendor writes until an admin approves an active store.`;

  const handleSubmit = async (values) => {
    setBusy(true);
    setNotice(null);

    try {
      if (isEdit) {
        await dispatch(editProduct({ productId, product: values })).unwrap();
        setNotice({ tone: 'success', text: 'Product saved. It stays a draft until an admin publishes it.' });
      } else {
        await dispatch(addProduct(values)).unwrap();
        setNotice({ tone: 'success', text: 'Draft product created.' });
      }

      navigate('/vendor/products');
    } catch (message) {
      setNotice({ tone: 'error', text: String(message) });
    } finally {
      setBusy(false);
    }
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
        eyebrow="Inventory"
        title={isEdit ? 'Edit product' : 'Add product'}
        description={
          isEdit
            ? 'Update this listing. Saving sends the row back to draft for admin review.'
            : 'Create a new listing for your store. It is saved as a draft.'
        }
      />

      {notice?.tone === 'error' && (
        <p role="alert" className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {notice.text}
        </p>
      )}

      {isEdit && !existing && products.error && (
        <p role="alert" className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {products.error}
        </p>
      )}

      {canCreate || isEdit ? (
        <VendorProductForm
          initial={existing}
          categories={categories.items}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/vendor/products')}
          busy={busy}
          canCreate={canCreate}
          blockedReason={blockedReason}
        />
      ) : (
        <p className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          {blockedReason}
        </p>
      )}

      <VariantImagePanel
        product={isEdit ? existing : null}
        onUpload={uploadVariantImages}
        onDeleteMain={deleteVariantMainImage}
        onDeleteGallery={deleteVariantGalleryImage}
        disabled={!isEdit || !existing}
      />

      {!categories.loading && categories.items.length === 0 && (
        <p className="rounded-3xl border border-dashed border-peach bg-peach/25 px-5 py-4 text-xs leading-5 text-muted">
          No categories exist yet, and a product needs one. An admin has to create
          the first category (Products → Categories in the admin area).
        </p>
      )}

      {products.items.length === 0 && !products.loading && (
        <button
          type="button"
          onClick={() => dispatch(fetchProducts({ limit: 100, sort: 'newest' }))}
          className="self-start text-xs font-semibold text-accent transition-colors hover:text-primary"
        >
          Reload your products
        </button>
      )}
    </div>
  );
}
