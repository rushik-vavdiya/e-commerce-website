import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Trash2, Upload } from 'lucide-react';

import Button from '../common/Button';
import AuthField from '../auth/AuthField';
import CategoryProductPicker from './CategoryProductPicker';

const ACCEPTED_TYPES = ['image/avif', 'image/gif', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// One image slot: the picture that is saved on the category, or the file just
// picked, shown exactly where it will appear — plus the buttons to replace or
// remove it. A freshly picked file is previewed from a local object URL, so the
// admin sees the image before it has been uploaded.
function CategoryImageSlot({
  id,
  label,
  hint,
  aspect = 'aspect-square',
  file,
  currentUrl,
  disabled = false,
  onSelect,
  onClear,
  onRemove,
}) {
  // A picked file is previewed from a local object URL; the effect only exists to
  // hand that URL back when the file changes, so nothing leaks.
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    if (!preview) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const src = preview ?? currentUrl ?? null;

  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-background/50 p-3">
      <label htmlFor={id} className="text-sm font-medium text-primary">
        {label}
      </label>

      <div
        className={`relative w-full overflow-hidden rounded-xl border border-dashed border-border bg-white ${aspect}`}
      >
        {src ? (
          <img
            src={src}
            alt={`${label} preview`}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-muted">
            <ImagePlus size={22} strokeWidth={1.5} aria-hidden="true" />
            <span className="text-[11px]">No image yet</span>
          </span>
        )}

        {file && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
            New
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor={id}
          className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-white px-3 text-xs font-medium text-primary transition-colors hover:border-accent hover:text-accent ${
            disabled ? 'pointer-events-none opacity-45' : ''
          }`}
        >
          <Upload size={13} strokeWidth={1.8} aria-hidden="true" />
          {src ? 'Replace' : 'Choose file'}
        </label>

        <input
          id={id}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          disabled={disabled}
          onChange={(event) => onSelect?.(event.target.files?.[0] ?? null)}
          className="sr-only"
        />

        {file && (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="inline-flex min-h-9 items-center rounded-full border border-border bg-white px-3 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-45"
          >
            Undo
          </button>
        )}

        {!file && currentUrl && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 disabled:opacity-45"
          >
            <Trash2 size={13} strokeWidth={1.8} aria-hidden="true" />
            Remove
          </button>
        )}
      </div>

      <p className="text-[11px] leading-4 text-muted">{hint}</p>
    </div>
  );
}

const parentIdOf = (category) =>
  category?.parentCategoryId?._id ?? category?.parentCategoryId ?? null;

const getUnavailableParentIds = (categories, categoryId) => {
  const unavailable = new Set(categoryId ? [String(categoryId)] : []);
  let changed = true;

  while (changed) {
    changed = false;
    categories.forEach((category) => {
      if (!unavailable.has(String(category._id)) && unavailable.has(String(parentIdOf(category)))) {
        unavailable.add(String(category._id));
        changed = true;
      }
    });
  }

  return unavailable;
};

// Create / edit form for a category. The API derives the slug from the name, so
// the form sends editable fields; level is derived from the selected parent and
// category images are uploaded after the category record is saved. The product
// picker below edits which products are listed in the category — a product's own
// main category cannot be removed from here.
export default function AdminCategoryForm({
  initial = null,
  categories = [],
  products = [],
  productsLoading = false,
  productsError = null,
  onSubmit,
  onCancel,
  onRemoveImage,
  busy = false,
  error = null,
}) {
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    parentCategoryId: parentIdOf(initial) ?? '',
    status: initial?.status ?? 'draft',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [image, setImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [mediaError, setMediaError] = useState(null);
  // Which products are ticked. Only the rows the admin touched are stored here;
  // everything else is read from what the product already belongs to, so a
  // catalog that arrives after the form opens still shows the real selection.
  const [productOverrides, setProductOverrides] = useState({});

  const categoryId = initial?._id ? String(initial._id) : null;

  // The product's own categoryId is its required main category, so it cannot be
  // ticked off from here — that row stays checked and disabled.
  const mainCategoryProductIds = useMemo(
    () =>
      new Set(
        products
          .filter(
            (product) =>
              categoryId &&
              String(product.categoryId?._id ?? product.categoryId ?? '') === categoryId,
          )
          .map((product) => String(product._id)),
      ),
    [categoryId, products],
  );

  const selectedProductIds = useMemo(() => {
    const selected = new Set(mainCategoryProductIds);

    products.forEach((product) => {
      const id = String(product._id);
      const listedElsewhere = (product.categoryIds ?? []).some(
        (value) => String(value?._id ?? value) === categoryId,
      );
      const isSelected = productOverrides[id] ?? listedElsewhere;
      if (isSelected) selected.add(id);
    });

    return selected;
  }, [categoryId, mainCategoryProductIds, productOverrides, products]);

  const toggleProduct = (productId) => {
    if (mainCategoryProductIds.has(productId)) return;

    setProductOverrides((current) => ({
      ...current,
      [productId]: !selectedProductIds.has(productId),
    }));
  };

  const selectProducts = (productIds) => {
    setProductOverrides((current) => {
      const next = { ...current };
      productIds.forEach((id) => {
        if (!mainCategoryProductIds.has(id)) next[id] = true;
      });
      return next;
    });
  };

  const clearProducts = (productIds) => {
    setProductOverrides((current) => {
      const next = { ...current };
      productIds.forEach((id) => {
        if (!mainCategoryProductIds.has(id)) next[id] = false;
      });
      return next;
    });
  };

  const unavailableParentIds = getUnavailableParentIds(categories, initial?._id);
  const parentCategories = categories.filter(
    (category) => !unavailableParentIds.has(String(category._id)),
  );
  const parentCategory = parentCategories.find(
    (category) => String(category._id) === String(values.parentCategoryId),
  );
  const level = parentCategory ? Number(parentCategory.level ?? 0) + 1 : 0;

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (values.name.trim().length < 2) {
      nextErrors.name = 'Use at least 2 characters.';
    }

    if (values.description.trim().length < 1) {
      nextErrors.description = 'A description is required.';
    }

    const invalidImage = [image, bannerImage].find(
      (file) =>
        file &&
        (file.size > MAX_IMAGE_BYTES || !ACCEPTED_TYPES.includes(file.type)),
    );
    if (invalidImage) {
      setMediaError(
        invalidImage.size > MAX_IMAGE_BYTES
          ? `${invalidImage.name} is larger than 5 MB.`
          : `${invalidImage.name} must be an AVIF, GIF, JPEG, PNG or WebP image.`,
      );
      return;
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit?.(
      {
        name: values.name.trim(),
        description: values.description.trim(),
        parentCategoryId: values.parentCategoryId || null,
        status: values.status,
      },
      { image, bannerImage },
      { productIds: [...selectedProductIds] },
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-border bg-white p-5 sm:p-6"
    >
      <h2 className="text-base font-medium text-primary">
        {initial ? `Edit “${initial.name}”` : 'New category'}
      </h2>

      <div className="mt-4 flex flex-col gap-4">
        <AuthField
          label="Name"
          name="category-name"
          value={values.name}
          onChange={handleChange('name')}
          error={fieldErrors.name}
          placeholder="For example: Women"
          required
        />

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="category-parent" className="text-sm font-medium text-primary">
            Parent category
          </label>
          <select
            id="category-parent"
            value={values.parentCategoryId}
            onChange={handleChange('parentCategoryId')}
            className="min-h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
          >
            <option value="">No parent (top-level category)</option>
            {parentCategories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name} · level {category.level ?? 0}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted">
            The category level is determined automatically: {level}.
          </p>
        </div>

        <div className="flex w-full flex-col gap-1.5">
          <label
            htmlFor="category-description"
            className="text-sm font-medium text-primary"
          >
            Description
            <span className="text-accent"> *</span>
          </label>

          <textarea
            id="category-description"
            rows={3}
            value={values.description}
            onChange={handleChange('description')}
            aria-invalid={Boolean(fieldErrors.description)}
            className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
          />

          {fieldErrors.description && (
            <p className="text-xs text-red-600">{fieldErrors.description}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <CategoryImageSlot
            id="category-image"
            label="Category image"
            hint="Shown on the homepage circles. AVIF, GIF, JPEG, PNG or WebP, up to 5 MB."
            file={image}
            currentUrl={initial?.image ?? null}
            disabled={busy}
            onSelect={(file) => {
              setImage(file);
              setMediaError(null);
            }}
            onClear={() => setImage(null)}
            onRemove={initial?.image ? () => onRemoveImage?.('image') : undefined}
          />

          <CategoryImageSlot
            id="category-banner"
            label="Banner image"
            hint="Wide artwork for the category page. Same formats and size limit."
            aspect="aspect-[16/9]"
            file={bannerImage}
            currentUrl={initial?.bannerImage ?? null}
            disabled={busy}
            onSelect={(file) => {
              setBannerImage(file);
              setMediaError(null);
            }}
            onClear={() => setBannerImage(null)}
            onRemove={initial?.bannerImage ? () => onRemoveImage?.('banner') : undefined}
          />
        </div>

        <p className="text-xs text-muted">
          Images: AVIF, GIF, JPEG, PNG or WebP, up to 5 MB each. The slug is
          generated from the name.
        </p>

        <CategoryProductPicker
          products={products}
          selectedIds={selectedProductIds}
          lockedIds={mainCategoryProductIds}
          loading={productsLoading}
          error={productsError}
          disabled={busy}
          onToggle={toggleProduct}
          onSelectMany={selectProducts}
          onClearMany={clearProducts}
        />

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="category-status" className="text-sm font-medium text-primary">
            Status
          </label>

          <select
            id="category-status"
            value={values.status}
            onChange={handleChange('status')}
            className="min-h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
          >
            <option value="draft">draft</option>
            <option value="active">active</option>
          </select>

          <p className="text-xs text-muted">
            Products can only be published inside an active category.
          </p>
        </div>
      </div>

      {mediaError && (
        <p role="alert" className="mt-4 text-xs text-red-600">
          {mediaError}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button type="submit" variant="primary" loading={busy} disabled={busy}>
          {initial ? 'Save category' : 'Create category'}
        </Button>

        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
