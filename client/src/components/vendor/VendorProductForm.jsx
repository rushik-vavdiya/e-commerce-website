import { useState } from 'react';

import AuthField from '../auth/AuthField';
import Button from '../common/Button';
import VariantEditor from '../product/VariantEditor';
import {
  parseSpecificationLines,
  toSpecificationLines,
} from '../../utils/specifications';

// Add / edit form for a vendor product. Products a vendor writes are saved as
// drafts by the backend, so the form says that plainly instead of offering a
// publish button it cannot honour.
export default function VendorProductForm({
  initial = null,
  categories = [],
  onSubmit,
  onCancel,
  busy = false,
  error = null,
  canCreate = true,
  blockedReason = null,
}) {
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    price: initial?.price ?? '',
    comarePrice: initial?.comarePrice ?? '',
    stock: initial?.stock ?? '',
    sku: initial?.sku ?? '',
    categoryId: initial?.categoryId ?? '',
    specText: toSpecificationLines(initial?.productSpecifications),
  });
  const [fieldErrors, setFieldErrors] = useState({});
  // Variants and their auto-generated combinations are kept beside the plain
  // fields because they are edited by their own component.
  const [variants, setVariants] = useState(initial?.variants ?? []);
  const [variantCombinations, setVariantCombinations] = useState(
    initial?.variantCombinations ?? [],
  );

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (values.name.trim().length < 2) nextErrors.name = 'Use at least 2 characters.';
    if (values.description.trim().length < 1) nextErrors.description = 'A description is required.';

    const price = Number(values.price);
    if (!values.price || Number.isNaN(price) || price < 0) {
      nextErrors.price = 'Enter a price of 0 or more.';
    }

    const stock = Number(values.stock);
    if (values.stock === '' || !Number.isInteger(stock) || stock < 0) {
      nextErrors.stock = 'Enter a whole number of 0 or more.';
    }

    if (values.comarePrice !== '' && Number(values.comarePrice) < 0) {
      nextErrors.comarePrice = 'Compare price cannot be negative.';
    }

    if (!values.categoryId) nextErrors.categoryId = 'Choose a category.';

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit?.({
      name: values.name.trim(),
      description: values.description.trim(),
      price,
      stock,
      ...(values.comarePrice === '' ? {} : { comarePrice: Number(values.comarePrice) }),
      ...(values.sku.trim() ? { sku: values.sku.trim() } : {}),
      categoryId: values.categoryId,
      productSpecifications: parseSpecificationLines(values.specText),
      variants,
      variantCombinations,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-border bg-white p-5 sm:p-6"
    >
      {!canCreate && blockedReason && (
        <p role="alert" className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
          {blockedReason}
        </p>
      )}

      <div className="flex flex-col gap-5">
        <AuthField
          label="Product name"
          name="product-name"
          value={values.name}
          onChange={handleChange('name')}
          error={fieldErrors.name}
          placeholder="For example: Linen Blend Oversized Shirt"
          required
        />

        <AuthField
          label="SKU"
          name="product-sku"
          value={values.sku}
          onChange={handleChange('sku')}
          placeholder="Optional, for example RN-MSH-02"
        />

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="product-description" className="text-sm font-medium text-primary">
            Description
            <span className="text-accent"> *</span>
          </label>

          <textarea
            id="product-description"
            rows={4}
            value={values.description}
            onChange={handleChange('description')}
            aria-invalid={Boolean(fieldErrors.description)}
            className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
          />

          {fieldErrors.description && (
            <p className="text-xs text-red-600">{fieldErrors.description}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <AuthField
            label="Price (₹)"
            name="product-price"
            type="number"
            inputMode="decimal"
            min="0"
            value={values.price}
            onChange={handleChange('price')}
            error={fieldErrors.price}
            required
          />

          <AuthField
            label="Compare price (₹)"
            name="product-compare-price"
            type="number"
            inputMode="decimal"
            min="0"
            value={values.comarePrice}
            onChange={handleChange('comarePrice')}
            error={fieldErrors.comarePrice}
            hint="Shown struck through when higher than the price."
          />

          <AuthField
            label="Stock"
            name="product-stock"
            type="number"
            inputMode="numeric"
            min="0"
            value={values.stock}
            onChange={handleChange('stock')}
            error={fieldErrors.stock}
            required
          />
        </div>

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="product-category" className="text-sm font-medium text-primary">
            Category
            <span className="text-accent"> *</span>
          </label>

          <select
            id="product-category"
            value={values.categoryId}
            onChange={handleChange('categoryId')}
            aria-invalid={Boolean(fieldErrors.categoryId)}
            className="min-h-11 w-full rounded-xl border border-border bg-white px-4 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
          >
            <option value="">Select a category…</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
                {category.status !== 'active' ? ' (draft category)' : ''}
              </option>
            ))}
          </select>

          {fieldErrors.categoryId && (
            <p className="text-xs text-red-600">{fieldErrors.categoryId}</p>
          )}

          <p className="text-xs text-muted">
            Products can only be published inside an active category.
          </p>
        </div>

        <div className="flex w-full flex-col gap-1.5">
          <label htmlFor="product-specifications" className="text-sm font-medium text-primary">
            Specifications
          </label>

          <textarea
            id="product-specifications"
            rows={4}
            value={values.specText}
            onChange={handleChange('specText')}
            placeholder={'Material: 55% linen, 45% viscose\nFit: Oversized\nCare: Gentle machine wash'}
            className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
          />

          <p className="text-xs text-muted">
            One detail per line, written as “Label: value”. These appear in the
            product information panel on the product page.
          </p>
        </div>

        <VariantEditor
          variants={variants}
          combinations={variantCombinations}
          basePrice={Number(values.price) || 0}
          baseStock={Number(values.stock) || 0}
          onChange={({ variants: nextVariants, variantCombinations: nextCombinations }) => {
            setVariants(nextVariants);
            setVariantCombinations(nextCombinations);
          }}
        />
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </p>
      )}

      <p className="mt-5 text-xs text-muted">
        Saved products from a vendor account are stored as drafts. An admin
        publishes them (PATCH /products/:id/status).
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          variant="primary"
          loading={busy}
          disabled={busy || !canCreate}
        >
          {initial ? 'Save changes' : 'Create draft product'}
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
