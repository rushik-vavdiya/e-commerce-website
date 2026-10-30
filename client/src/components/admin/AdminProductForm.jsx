import { useRef, useState } from 'react';

import AuthField from '../auth/AuthField';
import Button from '../common/Button';
import AdminProductImageStep from './AdminProductImageStep';
import VariantEditor from '../product/VariantEditor';
import { variantImageGroups } from '../../utils/variants';
import {
  parseSpecificationLines,
  toSpecificationLines,
} from '../../utils/specifications';

// Add / edit form for a product in the admin area, laid out as a wizard: the
// required basics first, then money and stock, then everything optional. One
// screen at a time is the point — the old flat form showed every field, two
// developer notes and the whole variant editor at once.
//
// Creating a product gets one more step, Images: the product photo, the gallery
// and a photo per colour are chosen there, and the editor uploads them right
// after the product is created. That way variant photos no longer wait on a
// second screen and a saved id. An edit already has those panels on its page, so
// it keeps the three steps.
//
// Every step reads and writes the same state, so going back never loses what was
// typed. Each step gates its own fields; the final submit validates the field
// steps again and jumps to the first one with a problem, so skipping ahead with
// Enter can never save a half-filled product.
//
// The backend keeps product status out of POST/PUT (server/src/modules/product/
// product.controller.js only accepts the editable fields), so publishing stays
// a PATCH /products/:id/status action on the editor page and this form never
// sends a status field.
const STEPS = [
  {
    title: 'Basics',
    hint: 'What the product is and where it belongs.',
  },
  {
    title: 'Pricing & stock',
    hint: 'What it costs, its discount and how many are on hand.',
  },
  {
    title: 'Details',
    hint: 'Everything optional — SKU, specifications and variants. Nothing here is required.',
  },
];

const IMAGE_STEP = {
  title: 'Images',
  hint: 'The product photo, its gallery and a photo for each colour. All optional — they can be changed later.',
};

const EMPTY_IMAGES = { mainImage: null, galleryImages: [], variantImages: {} };

// Which step owns each field, so a failed submit can jump to the screen that
// actually shows the problem.
const ERROR_STEP = {
  name: 0,
  description: 0,
  categoryIds: 0,
  price: 1,
  comarePrice: 1,
  stock: 1,
};

// Per-step validation. Only the basics and the money have required fields;
// the details step has none, which is why there is no third branch.
const validateStep = (stepIndex, values) => {
  const errors = {};

  if (stepIndex === 0) {
    if (values.name.trim().length < 2) errors.name = 'Use at least 2 characters.';
    if (values.description.trim().length < 1) errors.description = 'A description is required.';
    if (values.categoryIds.length === 0) {
      errors.categoryIds = 'Choose at least one category.';
    }
  }

  if (stepIndex === 1) {
    const price = Number(values.price);
    if (values.price === '' || Number.isNaN(price) || price < 0) {
      errors.price = 'Enter a price of 0 or more.';
    }

    const stock = Number(values.stock);
    if (values.stock === '' || !Number.isInteger(stock) || stock < 0) {
      errors.stock = 'Enter a whole number of 0 or more.';
    }

    if (values.comarePrice !== '' && Number(values.comarePrice) < 0) {
      errors.comarePrice = 'Compare price cannot be negative.';
    }
  }

  return errors;
};

export default function AdminProductForm({
  initial = null,
  categories = [],
  onSubmit,
  onCancel,
  busy = false,
  error = null,
}) {
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    sku: initial?.sku ?? '',
    description: initial?.description ?? '',
    price: initial?.price ?? '',
    comarePrice: initial?.comarePrice ?? '',
    stock: initial?.stock ?? '',
    // One primary category plus any extra ones the product also belongs to.
    // Edit-form products that only have the old single categoryId still
    // preselect it.
    categoryIds: initial?.categoryIds?.length
      ? initial.categoryIds
      : initial?.categoryId
        ? [initial.categoryId]
        : [],
    specText: toSpecificationLines(initial?.productSpecifications),
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [variants, setVariants] = useState(initial?.variants ?? []);
  const [variantCombinations, setVariantCombinations] = useState(
    initial?.variantCombinations ?? [],
  );
  // Files chosen on the Images step while creating. Nothing is uploaded here —
  // the editor sends them once the product exists.
  const [images, setImages] = useState(EMPTY_IMAGES);

  // Only a new product gets the Images step; an edit shows the image panels on
  // its page instead.
  const withImages = !initial;
  const steps = withImages ? [...STEPS, IMAGE_STEP] : STEPS;

  const [step, setStep] = useState(0);
  // The furthest step reached through validation. The stepper only lets the
  // reader move back to steps that were actually completed, and never skips
  // forward past an unfinished one.
  const [maxStep, setMaxStep] = useState(0);
  const headingRef = useRef(null);

  // Switch steps and move focus to the new heading, so keyboard and screen
  // reader users land where the form changed instead of at the old position.
  const goToStep = (next) => {
    setStep(next);
    setMaxStep((current) => Math.max(current, next));
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const handleChange = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleContinue = () => {
    const errors = validateStep(step, values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    goToStep(step + 1);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    // Enter in a field on an early step advances the wizard instead of
    // submitting: only the last step creates or saves anything.
    if (step < steps.length - 1) {
      handleContinue();
      return;
    }

    // Safety net for the stepper's back-and-forth: every step is checked
    // again, and the reader is taken to the first one with a problem.
    const allErrors = {
      ...validateStep(0, values),
      ...validateStep(1, values),
    };

    setFieldErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      const firstStep = Math.min(
        ...Object.keys(allErrors).map((key) => ERROR_STEP[key] ?? 0),
      );
      goToStep(firstStep);
      return;
    }

    // An empty compare price means "no discount". On an edit of a product that
    // had one, sending 0 clears it, because omitting the key leaves it as-is.
    const clearsComparePrice =
      values.comarePrice === '' && Boolean(initial?.comarePrice);

    const price = Number(values.price);
    const stock = Number(values.stock);

    // One file per photo slot, with every combination that slot covers. The
    // editor finds the saved combinations by name and attaches the file to each.
    const variantImages = withImages
      ? variantImageGroups(variants, variantCombinations)
          .map((group) => ({
            variantNames: group.variantNames,
            file: images.variantImages[group.key],
          }))
          .filter((entry) => entry.file)
      : [];

    onSubmit?.(
      {
        name: values.name.trim(),
        description: values.description.trim(),
        price,
        stock,
        // The first pick is the product's main category; every pick is stored
        // in the list so the product appears under all of them.
        categoryId: values.categoryIds[0],
        categoryIds: values.categoryIds,
        ...(values.comarePrice === '' ? {} : { comarePrice: Number(values.comarePrice) }),
        ...(clearsComparePrice ? { comarePrice: 0 } : {}),
        ...(values.sku.trim() ? { sku: values.sku.trim() } : {}),
        productSpecifications: parseSpecificationLines(values.specText),
        variants,
        variantCombinations,
      },
      // Only the create flow has pictures to send; an edit's images are managed
      // on the page below this form.
      withImages
        ? { mainImage: images.mainImage, galleryImages: images.galleryImages, variantImages }
        : null,
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-3xl border border-border bg-white p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-base font-medium text-primary focus:outline-none"
          >
            {initial ? `Edit “${initial.name}”` : 'New product'}
            <span className="ml-2 text-xs font-normal text-muted">
              {steps[step].title}
            </span>
          </h2>

          <p className="mt-1 text-xs leading-5 text-muted">{steps[step].hint}</p>
        </div>

        <p className="shrink-0 text-xs text-muted" aria-live="polite">
          Step {step + 1} of {steps.length}
        </p>
      </div>

      {/* Stepper: completed steps are clickable to look back, future steps
          stay locked until the steps before them validate. */}
      <ol className="mt-4 flex flex-wrap items-center gap-y-2">
        {steps.map((item, index) => {
          const isCurrent = index === step;
          const isPast = index < step;
          const reachable = index <= maxStep;

          const circle = [
            'grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold transition-colors',
            isCurrent
              ? 'border-primary bg-primary text-white'
              : isPast
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border bg-white text-muted',
          ].join(' ');

          return (
            <li key={item.title} className="flex items-center">
              {index > 0 && <span aria-hidden="true" className="h-px w-5 bg-border sm:w-8" />}

              <button
                type="button"
                onClick={() => goToStep(index)}
                disabled={!reachable}
                aria-current={isCurrent ? 'step' : undefined}
                className={[
                  'flex items-center gap-2 rounded-full px-1.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
                  isCurrent
                    ? 'font-semibold text-primary'
                    : reachable
                      ? 'text-muted hover:text-primary'
                      : 'cursor-not-allowed text-muted opacity-55',
                ].join(' ')}
              >
                <span className={circle} aria-hidden="true">
                  {index + 1}
                </span>
                {item.title}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-5 flex flex-col gap-5">
        {step === 0 && (
          <>
            <AuthField
              label="Product name"
              name="admin-product-name"
              value={values.name}
              onChange={handleChange('name')}
              error={fieldErrors.name}
              placeholder="For example: Linen Blend Oversized Shirt"
              required
            />

            <div className="flex w-full flex-col gap-1.5">
              <label htmlFor="admin-product-description" className="text-sm font-medium text-primary">
                Description
                <span className="text-accent"> *</span>
              </label>

              <textarea
                id="admin-product-description"
                rows={4}
                value={values.description}
                onChange={handleChange('description')}
                aria-invalid={Boolean(fieldErrors.description)}
                placeholder="Fabric, fit and finish — what makes this piece worth buying."
                className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
              />

              {fieldErrors.description && (
                <p className="text-xs text-red-600">{fieldErrors.description}</p>
              )}
            </div>

            <div className="flex w-full flex-col gap-1.5">
              <span className="text-sm font-medium text-primary">
                Categories
                <span className="text-accent"> *</span>
              </span>

              {/* Tick every category the product belongs to. Tick order decides
                  the main one: the first ticked category is the product's main
                  category, the rest are extra. Plain checkboxes, no library. */}
              <div
                role="group"
                aria-label="Product categories"
                className="flex flex-col overflow-hidden rounded-xl border border-border bg-white"
              >
                {categories.length === 0 && (
                  <p className="px-4 py-3 text-sm text-muted">No categories yet.</p>
                )}

                {categories.map((category, index) => {
                  const checked = values.categoryIds.includes(category._id);
                  // Position in the picked list decides the "Main" tag.
                  const pickIndex = values.categoryIds.indexOf(category._id);

                  return (
                    <label
                      key={category._id}
                      className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-primary transition-colors hover:bg-peach/30 ${
                        index > 0 ? 'border-t border-border' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setValues((current) => ({
                            ...current,
                            categoryIds: checked
                              ? current.categoryIds.filter((id) => id !== category._id)
                              : [...current.categoryIds, category._id],
                          }));
                          setFieldErrors((current) => ({ ...current, categoryIds: undefined }));
                        }}
                        className="size-4 shrink-0 accent-[var(--accent)]"
                      />

                      <span className="min-w-0 flex-1 truncate">
                        {category.name}
                        {category.status !== 'active' ? ' (draft category)' : ''}
                      </span>

                      {pickIndex === 0 && (
                        <span className="shrink-0 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          Main
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              {fieldErrors.categoryIds && (
                <p className="text-xs text-red-600">{fieldErrors.categoryIds}</p>
              )}

              <p className="text-xs text-muted">
                The first one you tick is the main category. Publishing needs an
                active one.
              </p>

              <p className="text-xs text-muted">
                Products you create here belong to the marketplace itself, so no
                store is attached.
              </p>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <AuthField
                label="Price (₹)"
                name="admin-product-price"
                type="number"
                inputMode="decimal"
                value={values.price}
                onChange={handleChange('price')}
                error={fieldErrors.price}
                required
              />

              <AuthField
                label="Compare price (₹)"
                name="admin-product-compare-price"
                type="number"
                inputMode="decimal"
                value={values.comarePrice}
                onChange={handleChange('comarePrice')}
                error={fieldErrors.comarePrice}
                hint="Leave empty for no discount."
              />

              <AuthField
                label="Stock"
                name="admin-product-stock"
                type="number"
                inputMode="numeric"
                value={values.stock}
                onChange={handleChange('stock')}
                error={fieldErrors.stock}
                required
              />
            </div>

            <p className="rounded-2xl border border-dashed border-peach bg-peach/25 px-4 py-3 text-xs leading-5 text-muted">
              The compare price is what shoppers see struck through next to the
              price — set it higher than the price to show a discount, or leave
              it empty.
            </p>
          </>
        )}

        {step === 2 && (
          <>
            <AuthField
              label="SKU"
              name="admin-product-sku"
              value={values.sku}
              onChange={handleChange('sku')}
              placeholder="Optional, for example RN-MSH-02"
            />

            <div className="flex w-full flex-col gap-1.5">
              <label htmlFor="admin-product-specifications" className="text-sm font-medium text-primary">
                Specifications
              </label>

              <textarea
                id="admin-product-specifications"
                rows={4}
                value={values.specText}
                onChange={handleChange('specText')}
                placeholder={'Material: 55% linen, 45% viscose\nFit: Oversized\nCare: Gentle machine wash'}
                className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15"
              />

              <p className="text-xs text-muted">
                One detail per line as “Label: value”. They appear in the product
                information panel on the product page.
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
          </>
        )}

        {step === 3 && withImages && (
          <AdminProductImageStep
            variants={variants}
            combinations={variantCombinations}
            images={images}
            onChange={setImages}
            disabled={busy}
          />
        )}
      </div>

      {error && (
        <p role="alert" className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {step > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => goToStep(step - 1)}
            disabled={busy}
          >
            Back
          </Button>
        )}

        {step < steps.length - 1 ? (
          // A submit button, so Enter in any field advances the wizard too —
          // handleSubmit routes it to the step's validation, never the save.
          <Button type="submit" variant="primary">
            Continue
          </Button>
        ) : (
          <Button type="submit" variant="primary" loading={busy} disabled={busy}>
            {initial ? 'Save product' : 'Create product'}
          </Button>
        )}

        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}